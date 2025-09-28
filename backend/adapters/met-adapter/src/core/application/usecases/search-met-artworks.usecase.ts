import { Injectable, Inject } from '@nestjs/common';
import { MetApiRepository } from '../../domain/repositories/met-api.repository';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';
import { MetObjectId } from '../../domain/value-objects/met-object-id.vo';
import { MetArtwork } from '../../domain/entities/met-artwork.entity';
import { MetSearchResponseDto, MetArtworkResponseDto } from '../dto';

@Injectable()
export class SearchMetArtworksUseCase {
  constructor(
    @Inject('MetApiRepository')
    private readonly metApiRepository: MetApiRepository
  ) {}

  async execute(
    query: string,
    limit: number = 20
  ): Promise<MetSearchResponseDto> {
    const startTime = Date.now();

    try {
      // 1. Validar entrada con Value Objects
      const searchQuery = new SearchQuery(query);
      const effectiveLimit = Math.min(Math.max(limit, 1), 100); // Entre 1 y 100

      // 2. Buscar IDs de obras
      const objectIds = await this.metApiRepository.search(searchQuery, effectiveLimit);

      if (objectIds.length === 0) {
        return this.createEmptyResponse(query, effectiveLimit, startTime);
      }

      // 3. Convertir IDs a Value Objects
      const metObjectIds = objectIds.map(id => new MetObjectId(id));

      // 4. Obtener detalles de las obras (batch)
      const artworks = await this.metApiRepository.getMultipleArtworks(metObjectIds);

      // 5. Filtrar obras con datos válidos y que coincidan con la query
      const validArtworks = artworks
        .filter(artwork => this.isValidArtwork(artwork))
        .filter(artwork => artwork.matchesQuery(query))
        .slice(0, effectiveLimit);

      // 6. Convertir a DTOs
      const artworkDtos = validArtworks.map(artwork => this.mapToDto(artwork));

      // 7. Crear respuesta
      return {
        total: objectIds.length,
        objectIDs: objectIds,
        artworks: artworkDtos,
        query: searchQuery.value,
        limit: effectiveLimit,
        executionTimeMs: Date.now() - startTime
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Search failed: ${message}`);
    }
  }

  // Método para búsqueda de obra específica
  async getArtworkById(objectId: number): Promise<MetArtworkResponseDto | null> {
    try {
      const metObjectId = new MetObjectId(objectId);
      const artwork = await this.metApiRepository.getArtworkById(metObjectId);

      if (!artwork || !this.isValidArtwork(artwork)) {
        return null;
      }

      return this.mapToDto(artwork);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Get artwork failed: ${message}`);
    }
  }

  // Método para obtener departamentos
  async getDepartments(): Promise<{ departmentId: number; displayName: string }[]> {
    try {
      return await this.metApiRepository.getDepartments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Get departments failed: ${message}`);
    }
  }

  // Método para health check
  async checkHealth(): Promise<boolean> {
    try {
      return await this.metApiRepository.isHealthy();
    } catch (error) {
      return false;
    }
  }

  // PRIVATE HELPER METHODS

  private isValidArtwork(artwork: MetArtwork): boolean {
    return !!(
      artwork.title &&
      artwork.title.trim().length > 0 &&
      artwork.artistDisplayName &&
      artwork.department
    );
  }

  private mapToDto(artwork: MetArtwork): MetArtworkResponseDto {
    return {
      objectID: artwork.objectID,
      title: artwork.title,
      artistDisplayName: artwork.artistDisplayName,
      primaryImage: artwork.primaryImage,
      department: artwork.department,
      culture: artwork.culture,
      period: artwork.period,
      dynasty: artwork.dynasty,
      objectDate: artwork.objectDate,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      isPublicDomain: artwork.isPublicDomain,
      objectURL: artwork.objectURL,
      tags: artwork.tags
    };
  }

  private createEmptyResponse(
    query: string,
    limit: number,
    startTime: number
  ): MetSearchResponseDto {
    return {
      total: 0,
      objectIDs: [],
      artworks: [],
      query,
      limit,
      executionTimeMs: Date.now() - startTime
    };
  }
}