import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumAdapterRepository } from '../../domain/repositories/museum-adapter.repository';
import { CircuitBreakerPort } from '../ports/circuit-breaker.port';
import { CircuitState } from '../../domain/entities/circuit-breaker-state.entity';

export class ProxyResponseDto<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'louvre' | 'met';
  fromCache: boolean = false;
}

@Injectable()
export class ProxyMuseumRequestUseCase {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('LOUVRE_REPOSITORY') private louvreRepository: MuseumAdapterRepository,
    @Inject('MET_REPOSITORY') private metRepository: MuseumAdapterRepository,
    @Inject('CIRCUIT_BREAKER_PORT') private circuitBreakerPort: CircuitBreakerPort,
  ) {}

  async searchArtworks(query: string, limit: number = 20): Promise<{
    louvre: ProxyResponseDto<Artwork[]>;
    met: ProxyResponseDto<Artwork[]>;
  }> {
    const cacheKey = `search:${query}:${limit}`;
    
    // Check cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult as any;
    }

    // Execute requests in parallel with circuit breaker
    const [louvreResult, metResult] = await Promise.allSettled([
      this.circuitBreakerPort.executeWithBreaker('louvre', () => 
        this.louvreRepository.searchArtworks(query, limit)
      ),
      this.circuitBreakerPort.executeWithBreaker('met', () => 
        this.metRepository.searchArtworks(query, limit)
      )
    ]);

    const result = {
      louvre: this.handleResult(louvreResult, 'louvre'),
      met: this.handleResult(metResult, 'met')
    };

    // Cache for 10 minutes
    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }

  async getArtworkById(id: string): Promise<ProxyResponseDto<Artwork>> {
    const museum = id.startsWith('louvre_') ? 'louvre' : 'met';
    const repository = museum === 'louvre' ? this.louvreRepository : this.metRepository;
    
    const cacheKey = `artwork:${id}`;
    
    // Check cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return { ...cachedResult as ProxyResponseDto<Artwork>, fromCache: true };
    }

    try {
      const result = await this.circuitBreakerPort.executeWithBreaker(museum, () => 
        repository.getArtworkById(id)
      );
      
      const response: ProxyResponseDto<Artwork> = {
        success: true,
        data: result,
        source: museum,
        fromCache: false
      };

      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, response, 600000);

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: museum,
        fromCache: false
      };
    }
  }

  private handleResult(
    result: PromiseSettledResult<Artwork[]>, 
    source: 'louvre' | 'met'
  ): ProxyResponseDto<Artwork[]> {
    if (result.status === 'fulfilled') {
      return {
        success: true,
        data: result.value,
        source,
        fromCache: false
      };
    } else {
      return {
        success: false,
        error: result.reason?.message || 'Unknown error',
        source,
        fromCache: false
      };
    }
  }
}