import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MetApiRepository } from '../../domain/repositories/met-api.repository';
import { MetArtwork } from '../../domain/entities/met-artwork.entity';
import { MetObjectId } from '../../domain/value-objects/met-object-id.vo';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';

@Injectable()
export class MetHttpClient implements MetApiRepository {
  private readonly logger = new Logger(MetHttpClient.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'MET_API_BASE_URL',
      'https://collectionapi.metmuseum.org/public/collection/v1'
    );
    this.timeout = this.configService.get<number>('MET_API_TIMEOUT', 5000);
  }

  async search(query: SearchQuery, limit?: number): Promise<number[]> {
    try {
      this.logger.log(`Searching MET API with query: "${query.value}"`);
      
      const url = `${this.baseUrl}/search`;
      const params = {
        q: query.value,
        hasImages: 'true', // Solo obras con imágenes
      };

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: this.timeout,
        })
      );

      const objectIDs = response.data.objectIDs || [];
      
      // Aplicar límite si se especifica
      const limitedIds = limit ? objectIDs.slice(0, limit) : objectIDs;
      
      this.logger.log(`Found ${limitedIds.length} artworks for query: "${query.value}"`);
      return limitedIds;

    } catch (error) {
      this.logger.error(`Search failed for query "${query.value}":`, error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('MET API request timeout');
      }
      
      if (error.response?.status === 404) {
        return []; // No results found
      }
      
      throw new Error(`MET API search failed: ${error.message}`);
    }
  }

  async getArtworkById(objectId: MetObjectId): Promise<MetArtwork | null> {
    try {
      this.logger.log(`Fetching artwork with ID: ${objectId.value}`);
      
      const url = `${this.baseUrl}/objects/${objectId.value}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: this.timeout,
        })
      );

      const data = response.data;
      
      // Validar que tenga datos mínimos requeridos
      if (!data.objectID || !data.title) {
        this.logger.warn(`Invalid artwork data for ID: ${objectId.value}`);
        return null;
      }

      return this.mapToEntity(data);

    } catch (error) {
      this.logger.error(`Failed to fetch artwork ${objectId.value}:`, error.message);
      
      if (error.response?.status === 404) {
        return null; // Artwork not found
      }
      
      throw new Error(`MET API get artwork failed: ${error.message}`);
    }
  }

  async getMultipleArtworks(objectIds: MetObjectId[]): Promise<MetArtwork[]> {
    try {
      this.logger.log(`Fetching ${objectIds.length} artworks`);
      
      // Hacer requests en paralelo con límite de concurrencia
      const chunkSize = 10; // Procesar de 10 en 10 para no sobrecargar la API
      const artworks: MetArtwork[] = [];
      
      for (let i = 0; i < objectIds.length; i += chunkSize) {
        const chunk = objectIds.slice(i, i + chunkSize);
        
        const promises = chunk.map(objectId =>
          this.getArtworkById(objectId).catch(error => {
            this.logger.warn(`Failed to fetch artwork ${objectId.value}: ${error.message}`);
            return null; // Continue with other artworks
          })
        );
        
        const chunkResults = await Promise.all(promises);
        const validArtworks = chunkResults.filter(artwork => artwork !== null);
        artworks.push(...validArtworks);
        
        // Pequeña pausa entre chunks para ser respetuosos con la API
        if (i + chunkSize < objectIds.length) {
          await this.delay(100);
        }
      }
      
      this.logger.log(`Successfully fetched ${artworks.length}/${objectIds.length} artworks`);
      return artworks;

    } catch (error) {
      this.logger.error('Failed to fetch multiple artworks:', error.message);
      throw new Error(`MET API batch fetch failed: ${error.message}`);
    }
  }

  async getDepartments(): Promise<{ departmentId: number; displayName: string }[]> {
    try {
      this.logger.log('Fetching MET departments');
      
      const url = `${this.baseUrl}/departments`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: this.timeout,
        })
      );

      const departments = response.data.departments || [];
      
      this.logger.log(`Found ${departments.length} departments`);
      return departments;

    } catch (error) {
      this.logger.error('Failed to fetch departments:', error.message);
      throw new Error(`MET API get departments failed: ${error.message}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Test con una búsqueda simple
      const url = `${this.baseUrl}/search`;
      const params = { q: 'test', hasImages: 'true' };
      
      await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: 3000, // Timeout más corto para health check
        })
      );
      
      return true;
    } catch (error) {
      this.logger.error('MET API health check failed:', error.message);
      return false;
    }
  }

  // PRIVATE HELPER METHODS

  private mapToEntity(data: any): MetArtwork {
    // Validar y normalizar tags para evitar errores de tipo
    let tags: string[] = [];
    if (data.tags && Array.isArray(data.tags)) {
      tags = data.tags
        .filter(tag => tag != null)                     // Eliminar null/undefined
        .map(tag => {
          // Si es objeto con propiedad 'term', extraer el término
          if (typeof tag === 'object' && tag.term) {
            return tag.term.toString();
          }
          // Si es string, usarlo directamente
          return tag.toString();
        })
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)  // Solo strings válidos
        .map(tag => tag.trim());                        // Limpiar espacios
    }

    return new MetArtwork(
      data.objectID,
      data.title || 'Untitled',
      data.artistDisplayName || 'Unknown Artist', 
      data.primaryImage || data.primaryImageSmall || '',
      data.department || 'Unknown Department',
      data.culture,
      data.period,
      data.dynasty,
      data.objectDate,
      data.medium,
      data.dimensions,
      data.isPublicDomain,
      data.objectURL,
      tags  // Array de strings validado
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}