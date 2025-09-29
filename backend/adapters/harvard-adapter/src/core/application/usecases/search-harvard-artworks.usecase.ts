import { Injectable, Logger, Inject } from '@nestjs/common';
import { HarvardApiRepository } from '../../domain/repositories/harvard-api.repository';
import { HarvardArtwork } from '../../domain/entities/harvard-artwork.entity';
import { HarvardObjectId } from '../../domain/value-objects/harvard-object-id.vo';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';

/**
 * Search Harvard Artworks Use Case
 * Caso de uso principal para buscar obras en Harvard Art Museums
 */
@Injectable()
export class SearchHarvardArtworksUseCase {
  private readonly logger = new Logger(SearchHarvardArtworksUseCase.name);

  constructor(
    @Inject('HarvardApiRepository')
    private readonly harvardApiRepository: HarvardApiRepository,
  ) {}

  /**
   * Ejecutar búsqueda completa de obras
   */
  async execute(query: string, limit?: number): Promise<{
    query: string;
    total: number;
    objectIDs: string[];
    artworks: HarvardArtwork[];
    executionTimeMs: number;
  }> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`# Executing search for: "${query}" (limit: ${limit || 'default'})`);
      
      //  Validar query
      const searchQuery = new SearchQuery(query);
      
      //  Buscar IDs de obras
      const objectIds = await this.harvardApiRepository.search(searchQuery, limit);
      
      this.logger.log(`# Found ${objectIds.length} object IDs`);
      
      //  Obtener detalles de las obras (primeras N)
      const detailLimit = Math.min(objectIds.length, limit || 10);
      const selectedIds = objectIds.slice(0, detailLimit);
      
      const harvardObjectIds = selectedIds.map(id => HarvardObjectId.fromString(id));
      const artworks = await this.harvardApiRepository.getMultipleArtworks(harvardObjectIds);
      
      const executionTime = Date.now() - startTime;

      this.logger.log(`# Search completed: ${artworks.length} detailed artworks retrieved in ${executionTime}ms`);

      return {
        query: searchQuery.value,
        total: objectIds.length,
        objectIDs: objectIds,
        artworks: artworks,
        executionTimeMs: executionTime,
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`# Search failed for "${query}":`, error.message);

      // Devolver estructura vacía en caso de error
      return {
        query: query,
        total: 0,
        objectIDs: [],
        artworks: [],
        executionTimeMs: executionTime,
      };
    }
  }

  /**
   * Obtener obra específica por ID
   */
  async getArtworkById(objectId: string): Promise<HarvardArtwork | null> {
    try {
      this.logger.log(`# Fetching artwork by ID: ${objectId}`);
      
      const harvardObjectId = HarvardObjectId.fromString(objectId);
      const artwork = await this.harvardApiRepository.getArtworkById(harvardObjectId);
      
      if (artwork) {
        this.logger.log(`# Artwork found: "${artwork.title}"`);
      } else {
        this.logger.warn(`# Artwork not found for ID: ${objectId}`);
      }
      
      return artwork;
      
    } catch (error) {
      this.logger.error(`# Failed to fetch artwork ${objectId}:`, error.message);
      return null;
    }
  }

  /**
   * Obtener divisiones disponibles
   */
  async getDivisions(): Promise<{ divisionId: string; name: string }[]> {
    try {
      this.logger.log(`# Fetching Harvard divisions`);
      
      const divisions = await this.harvardApiRepository.getDivisions();
      
      this.logger.log(`# Retrieved ${divisions.length} divisions`);
      return divisions;
      
    } catch (error) {
      this.logger.error(`# Failed to fetch divisions:`, error.message);
      return [];
    }
  }

  /**
   * Obtener clasificaciones disponibles
   */
  async getClassifications(): Promise<{ classificationId: string; name: string }[]> {
    try {
      this.logger.log(`# Fetching Harvard classifications`);
      
      const classifications = await this.harvardApiRepository.getClassifications();
      
      this.logger.log(`# Retrieved ${classifications.length} classifications`);
      return classifications;
      
    } catch (error) {
      this.logger.error(`# Failed to fetch classifications:`, error.message);
      return [];
    }
  }

  /**
   * Obtener culturas disponibles
   */
  async getCultures(): Promise<{ cultureId: string; name: string }[]> {
    try {
      this.logger.log(`# Fetching Harvard cultures`);

      const cultures = await this.harvardApiRepository.getCultures();

      this.logger.log(`# Retrieved ${cultures.length} cultures`);
      return cultures;
      
    } catch (error) {
      this.logger.error(`# Failed to fetch cultures:`, error.message);
      return [];
    }
  }

  /**
   * Verificar estado de la API
   */
  async checkHealth(): Promise<boolean> {
    try {
      this.logger.log(`# Checking Harvard API health`);
      
      const isHealthy = await this.harvardApiRepository.isHealthy();
      
      this.logger.log(`# Harvard API health: ${isHealthy ? 'OK' : 'FAIL'}`);
      return isHealthy;
      
    } catch (error) {
      this.logger.error(`# Health check failed:`, error.message);
      return false;
    }
  }

  /**
   * Búsqueda avanzada con filtros
   */
  async searchWithFilters(
    query: string,
    options?: {
      limit?: number;
      division?: string;
      classification?: string;
      culture?: string;
      hasImage?: boolean;
    }
  ): Promise<{
    query: string;
    filters: any;
    total: number;
    objectIDs: string[];
    artworks: HarvardArtwork[];
    executionTimeMs: number;
  }> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`# Advanced search for: "${query}" with filters:`, options);
      
      // Para MVP, usamos búsqueda básica y filtramos después
      const basicResult = await this.execute(query, options?.limit);
      
      let filteredArtworks = basicResult.artworks;
      
      // Aplicar filtros post-búsqueda
      if (options?.division) {
        filteredArtworks = filteredArtworks.filter(artwork => 
          artwork.department?.toLowerCase().includes(options.division!.toLowerCase())
        );
      }
      
      if (options?.culture) {
        filteredArtworks = filteredArtworks.filter(artwork =>
          artwork.culture?.toLowerCase().includes(options.culture!.toLowerCase())
        );
      }
      
      if (options?.hasImage) {
        filteredArtworks = filteredArtworks.filter(artwork => artwork.hasImage());
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        query: basicResult.query,
        filters: options || {},
        total: filteredArtworks.length,
        objectIDs: filteredArtworks.map(artwork => artwork.objectId),
        artworks: filteredArtworks,
        executionTimeMs: executionTime,
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`# Advanced search failed:`, error.message);
      
      return {
        query: query,
        filters: options || {},
        total: 0,
        objectIDs: [],
        artworks: [],
        executionTimeMs: executionTime,
      };
    }
  }
}