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
  source: 'met' | 'harvard';
  fromCache: boolean = false;
}

@Injectable()
export class ProxyMuseumRequestUseCase {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('MET_REPOSITORY') private metRepository: MuseumAdapterRepository,
    @Inject('HARVARD_REPOSITORY') private harvardRepository: MuseumAdapterRepository,
    @Inject('CIRCUIT_BREAKER_PORT') private circuitBreakerPort: CircuitBreakerPort,
  ) {}

  async searchArtworks(query: string, museum: 'met' | 'harvard', limit: number = 20): Promise<ProxyResponseDto<Artwork[]>> {
    const cacheKey = `search:${query}:${museum}:${limit}`;
    
    // Check cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult as ProxyResponseDto<Artwork[]>;
    }

    // Select repository based on museum
    const repository = museum === 'met' ? this.metRepository : this.harvardRepository;

    try {
      // Execute request with circuit breaker for the specific museum
      const artworks = await this.circuitBreakerPort.executeWithBreaker(museum, () => 
        repository.searchArtworks(query, limit)
      );

      const result: ProxyResponseDto<Artwork[]> = {
        success: true,
        data: artworks,
        source: museum,
        fromCache: false
      };

      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, result, 600000);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: museum,
        fromCache: false
      };
    }
  }

  async getArtworkById(id: string, museum: 'met' | 'harvard'): Promise<ProxyResponseDto<Artwork>> {
    // Select repository based on museum
    const repository = museum === 'met' ? this.metRepository : this.harvardRepository;
    
    const cacheKey = `artwork:${id}:${museum}`;
    
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
    source: 'met' | 'harvard'
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