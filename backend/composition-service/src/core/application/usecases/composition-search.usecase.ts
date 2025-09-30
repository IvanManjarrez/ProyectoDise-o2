import { Injectable, Inject } from '@nestjs/common';
import { CompositionSearchDto } from '../dto/composition-search.dto';
import { CompositionResultDto } from '../dto/composition-result.dto';
import { CompositionResult, SourceResult } from '../../domain/entities/composition-result.entity';
import { CompositionArtwork } from '../../domain/entities/composition-artwork.entity';
import { MuseumProxyPort } from '../ports/museum-proxy.port';
import { CachePort } from '../ports/cache.port';
import { MUSEUM_PROXY_PORT, CACHE_PORT } from '../../tokens';

@Injectable()
export class CompositionSearchUseCase {
  constructor(
    @Inject(MUSEUM_PROXY_PORT) private readonly museumProxy: MuseumProxyPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
  ) {}

  async execute(searchDto: CompositionSearchDto): Promise<CompositionResultDto> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(searchDto);

    // Verificar cache
    const cachedResult = await this.cache.get<CompositionResultDto>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Determinar museos a consultar
    const museums = this.getTargetMuseums(searchDto.museums);
    
    // Ejecutar búsquedas en paralelo
    const searchPromises = museums.map(museum => 
      this.searchMuseum(museum, searchDto)
    );

    const results = await Promise.allSettled(searchPromises);
    
    // Procesar resultados
    const { artworks, sources } = this.processResults(results, museums);
    
    // Crear resultado de composición
    const searchTime = Date.now() - startTime;
    let compositionResult = CompositionResult.create(
      artworks,
      searchDto.query,
      searchTime,
      sources,
    );

    // Aplicar ordenamiento si se especifica
    if (searchDto.sortBy) {
      compositionResult = compositionResult.sortBy(searchDto.sortBy);
    }

    // Aplicar límite si se especifica
    if (searchDto.limit) {
      compositionResult = compositionResult.limit(searchDto.limit);
    }

    // Preparar DTO de respuesta
    const resultDto: CompositionResultDto = {
      artworks: compositionResult.artworks.map(artwork => artwork.toDto()),
      metadata: {
        totalCount: compositionResult.totalCount,
        sources: compositionResult.sources.map(source => ({
          source: source.source,
          count: source.count,
          responseTime: source.responseTime,
          success: source.success,
          error: source.error,
        })),
        query: compositionResult.query,
        searchTime: compositionResult.searchTime,
      },
    };

    // Guardar en cache por 5 minutos
    await this.cache.set(cacheKey, resultDto, 300);

    return resultDto;
  }

  private async searchMuseum(
    museum: 'met' | 'harvard', 
    searchDto: CompositionSearchDto
  ): Promise<{ museum: string; artworks: CompositionArtwork[]; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // TEMPORALMENTE DESHABILITADO - Health check está causando problemas
      // const isHealthy = await this.museumProxy.healthCheck(museum);
      // if (!isHealthy) {
      //   throw new Error(`${museum} service is not available`);
      // }

      console.log(`🚀 Searching artworks in ${museum}...`);

      const artworks = await this.museumProxy.searchArtworks(
        searchDto.query,
        museum,
        searchDto.limit || 20
      );

      console.log(`🎨 Found ${artworks.length} artworks in ${museum}`);

      return {
        museum,
        artworks,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`❌ Error searching in ${museum}:`, error);
      return {
        museum,
        artworks: [],
        responseTime: Date.now() - startTime,
      };
    }
  }

  private processResults(
    results: PromiseSettledResult<any>[],
    museums: ('met' | 'harvard')[]
  ): { artworks: CompositionArtwork[]; sources: SourceResult[] } {
    const artworks: CompositionArtwork[] = [];
    const sources: SourceResult[] = [];

    results.forEach((result, index) => {
      const museum = museums[index];
      
      if (result.status === 'fulfilled') {
        const { artworks: museumArtworks, responseTime } = result.value;
        
        artworks.push(...museumArtworks);
        sources.push(new SourceResult(
          museum,
          museumArtworks.length,
          responseTime,
          true
        ));
      } else {
        sources.push(new SourceResult(
          museum,
          0,
          0,
          false,
          result.reason?.message || 'Unknown error'
        ));
      }
    });

    return { artworks, sources };
  }

  private getTargetMuseums(requestedMuseums?: string[]): ('met' | 'harvard')[] {
    if (!requestedMuseums || requestedMuseums.length === 0) {
      return ['met', 'harvard']; // Por defecto, buscar en ambos museos
    }

    return requestedMuseums.filter(museum => 
      museum === 'met' || museum === 'harvard'
    ) as ('met' | 'harvard')[];
  }

  private generateCacheKey(searchDto: CompositionSearchDto): string {
    const key = `composition:search:${searchDto.query}`;
    const params: string[] = [];
    
    if (searchDto.museums?.length) {
      params.push(`museums:${searchDto.museums.sort().join(',')}`);
    }
    if (searchDto.limit) {
      params.push(`limit:${searchDto.limit}`);
    }
    if (searchDto.sortBy) {
      params.push(`sort:${searchDto.sortBy}`);
    }
    if (searchDto.artist) {
      params.push(`artist:${searchDto.artist}`);
    }
    if (searchDto.period) {
      params.push(`period:${searchDto.period}`);
    }

    return params.length > 0 ? `${key}:${params.join(':')}` : key;
  }
}