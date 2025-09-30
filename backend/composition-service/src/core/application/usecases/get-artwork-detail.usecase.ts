import { Injectable, Inject } from '@nestjs/common';
import { MuseumProxyPort } from '../ports/museum-proxy.port';
import { CachePort } from '../ports/cache.port';
import { CompositionArtwork } from '../../domain/entities/composition-artwork.entity';
import { MUSEUM_PROXY_PORT, CACHE_PORT } from '../../tokens';

export interface GetArtworkDetailDto {
  id: string;
  museum: 'met' | 'harvard';
}

@Injectable()
export class GetArtworkDetailUseCase {
  constructor(
    @Inject(MUSEUM_PROXY_PORT) private readonly museumProxy: MuseumProxyPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
  ) {}

  async execute(dto: GetArtworkDetailDto): Promise<any> {
    const cacheKey = `artwork:${dto.museum}:${dto.id}`;

    // Verificar cache primero
    const cachedArtwork = await this.cache.get(cacheKey);
    if (cachedArtwork) {
      return cachedArtwork;
    }

    try {
      // Verificar que el servicio esté disponible
      const isHealthy = await this.museumProxy.healthCheck(dto.museum);
      if (!isHealthy) {
        throw new Error(`${dto.museum} service is not available`);
      }

      // Obtener artwork del museo
      const artwork = await this.museumProxy.getArtworkById(dto.id, dto.museum);
      
      const result = {
        ...artwork.toDto(),
        source: dto.museum,
        retrievedAt: new Date().toISOString(),
      };

      // Guardar en cache por 1 hora
      await this.cache.set(cacheKey, result, 3600);

      return result;

    } catch (error) {
      console.error(`Error getting artwork ${dto.id} from ${dto.museum}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        throw new Error(`Artwork with id ${dto.id} not found in ${dto.museum}`);
      }
      
      throw new Error(`Failed to get artwork detail: ${errorMessage}`);
    }
  }
}