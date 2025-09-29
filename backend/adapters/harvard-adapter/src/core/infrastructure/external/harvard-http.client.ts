import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HarvardApiRepository } from '../../domain/repositories/harvard-api.repository';
import { HarvardArtwork } from '../../domain/entities/harvard-artwork.entity';
import { HarvardObjectId } from '../../domain/value-objects/harvard-object-id.vo';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';

/**
 * Harvard Art Museums HTTP Client
 * Implementación del repositorio usando la API REST de Harvard Art Museums
 * 
 * API Documentation: https://github.com/harvardartmuseums/api-docs
 * Base URL: https://api.harvardartmuseums.org/v1
 */
@Injectable()
export class HarvardHttpClient implements HarvardApiRepository {
  private readonly logger = new Logger(HarvardHttpClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Configuración de la API de Harvard
    this.baseUrl = this.configService.get<string>(
      'HARVARD_API_BASE_URL',
      'https://api.harvardartmuseums.org/v1'
    );
    
    this.apiKey = this.configService.get<string>(
      'HARVARD_API_KEY',
      'demo-api-key' // Demo key for testing
    );
    
    this.timeout = this.configService.get<number>('HARVARD_API_TIMEOUT', 10000);

    this.logger.log(`# Initialized Harvard API client`);
    this.logger.log(`# Base URL: ${this.baseUrl}`);
    this.logger.log(`# API Key: ${this.apiKey.substring(0, 8)}...`);
    this.logger.log(`# Timeout: ${this.timeout}ms`);
  }

  // BÚSQUEDA DE OBRAS
  async search(query: SearchQuery, limit?: number): Promise<string[]> {
    try {
      this.logger.log(`# Searching Harvard Art Museums with query: \"${query.value}\"`);
      
      const url = `${this.baseUrl}/object`;
      const params = {
        apikey: this.apiKey,
        q: query.value,                    // Query parameter
        size: limit || 20,                // Results limit
        fields: 'id,objectnumber',        // Only get IDs
        hasimage: 1,                      // Only objects with images
      };

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ARGallery/1.0.0',
          },
        })
      );

      const data = response.data;
      
      // Procesar respuesta de Harvard
      let objectIds: string[] = [];
      
      if (data.records && Array.isArray(data.records)) {
        objectIds = data.records
          .map(record => record.id?.toString())
          .filter(id => id && id !== 'null');
      }
      
      this.logger.log(`# Found ${objectIds.length} artworks for query: \"${query.value}\"`);
      this.logger.log(`# Total available: ${data.info?.totalrecords || 'unknown'}`);
      
      return objectIds;

    } catch (error) {
      this.logger.error(`# Search failed for query \"${query.value}\":`, error.message);
      
      if (error.response?.status) {
        this.logger.error(`# HTTP Status: ${error.response.status}`);
        if (error.response.status === 401) {
          throw new Error('Harvard API authentication failed - check API key');
        }
        if (error.response.status === 429) {
          throw new Error('Harvard API rate limit exceeded');
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Harvard API request timeout');
      }
      
      // Devolver array vacío en lugar de error para búsquedas sin resultados
      if (error.response?.status === 404 || error.response?.data?.records?.length === 0) {
        this.logger.warn('# No results found, returning empty array');
        return [];
      }
      
      throw new Error(`Harvard API search failed: ${error.message}`);
    }
  }

  // OBTENER OBRA INDIVIDUAL
  async getArtworkById(objectId: HarvardObjectId): Promise<HarvardArtwork | null> {
    try {
      this.logger.log(`# Fetching Harvard artwork with ID: ${objectId.value}`);
      
      const url = `${this.baseUrl}/object/${objectId.value}`;
      const params = {
        apikey: this.apiKey,
      };
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ARGallery/1.0.0',
          },
        })
      );

      const data = response.data;
      
      // Validar datos mínimos
      if (!data || !data.id) {
        this.logger.warn(`# Invalid artwork data for ID: ${objectId.value}`);
        return null;
      }

      return this.mapToEntity(data);

    } catch (error) {
      this.logger.error(`# Failed to fetch Harvard artwork ${objectId.value}:`, error.message);
      
      if (error.response?.status === 404) {
        return null; // Artwork not found
      }
      
      if (error.response?.status === 401) {
        throw new Error('Harvard API authentication failed - check API key');
      }
      
      throw new Error(`Harvard API get artwork failed: ${error.message}`);
    }
  }

  // OBTENER MÚLTIPLES OBRAS
  async getMultipleArtworks(objectIds: HarvardObjectId[]): Promise<HarvardArtwork[]> {
    try {
      this.logger.log(`# Fetching ${objectIds.length} Harvard artworks`);
      
      const chunkSize = 5; // Ser respetuoso con la API
      const artworks: HarvardArtwork[] = [];
      
      for (let i = 0; i < objectIds.length; i += chunkSize) {
        const chunk = objectIds.slice(i, i + chunkSize);
        
        const promises = chunk.map(objectId =>
          this.getArtworkById(objectId).catch(error => {
            this.logger.warn(`# Failed to fetch artwork ${objectId.value}: ${error.message}`);
            return null;
          })
        );
        
        const chunkResults = await Promise.all(promises);
        const validArtworks = chunkResults.filter(artwork => artwork !== null);
        artworks.push(...validArtworks);
        
        // Pausa entre chunks para no sobrecargar la API
        if (i + chunkSize < objectIds.length) {
          await this.delay(300);
        }
      }
      
      this.logger.log(`# Successfully fetched ${artworks.length}/${objectIds.length} Harvard artworks`);
      return artworks;

    } catch (error) {
      this.logger.error('# Failed to fetch multiple Harvard artworks:', error.message);
      throw new Error(`Harvard API batch fetch failed: ${error.message}`);
    }
  }

  // OBTENER DIVISIONES
  async getDivisions(): Promise<{ divisionId: string; name: string }[]> {
    try {
      this.logger.log('# Fetching Harvard Art Museums divisions');
      
      const url = `${this.baseUrl}/classification`;
      const params = {
        apikey: this.apiKey,
        size: 100,
      };
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ARGallery/1.0.0',
          },
        })
      );

      const divisions = response.data.records || [];
      
      const result = divisions.map(div => ({
        divisionId: div.id?.toString() || div.classificationid?.toString(),
        name: div.name || div.classification || 'Unknown Division'
      }));
      
      this.logger.log(`# Found ${result.length} Harvard divisions`);
      return result;

    } catch (error) {
      this.logger.error('# Failed to fetch Harvard divisions:', error.message);
      
      // Fallback con divisiones conocidas de Harvard
      this.logger.warn('# Using fallback Harvard divisions');
      return [
        { divisionId: '1', name: 'Asian and Mediterranean Art' },
        { divisionId: '2', name: 'European and American Art' },
        { divisionId: '3', name: 'Modern and Contemporary Art' },
        { divisionId: '4', name: 'Drawings' },
        { divisionId: '5', name: 'Prints' },
      ];
    }
  }

  // OBTENER CLASIFICACIONES
  async getClassifications(): Promise<{ classificationId: string; name: string }[]> {
    const divisions = await this.getDivisions();
    return divisions.map(div => ({
      classificationId: div.divisionId,
      name: div.name
    }));
  }

  // OBTENER CULTURAS
  async getCultures(): Promise<{ cultureId: string; name: string }[]> {
    try {
      this.logger.log('# Fetching Harvard cultures');
      
      const url = `${this.baseUrl}/culture`;
      const params = {
        apikey: this.apiKey,
        size: 50,
      };
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ARGallery/1.0.0',
          },
        })
      );

      const cultures = response.data.records || [];
      
      const result = cultures.map(culture => ({
        cultureId: culture.id?.toString() || culture.cultureid?.toString(),
        name: culture.name || 'Unknown Culture'
      }));
      
      this.logger.log(`# Found ${result.length} Harvard cultures`);
      return result;

    } catch (error) {
      this.logger.error('# Failed to fetch Harvard cultures:', error.message);
      return [];
    }
  }

  //  HEALTH CHECK
  async isHealthy(): Promise<boolean> {
    try {
      this.logger.debug(`# Testing health check with URL: ${this.baseUrl}/object`);
      
      const params = {
        apikey: this.apiKey,
        size: 1,
      };
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/object`, {
          params,
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ARGallery/1.0.0',
          },
        })
      );
      
      this.logger.debug(`# Health check successful, status: ${response.status}`);
      return true;
    } catch (error) {
      this.logger.error(`# Harvard API health check failed:`, {
        message: error.message,
        status: error?.response?.status,
        url: `${this.baseUrl}/object`,
        headers: error?.response?.headers,
      });
      return false;
    }
  }

  // PRIVATE HELPER METHODS

  /**
   * Mapear datos de Harvard API a entidad HarvardArtwork
   */
  private mapToEntity(data: any): HarvardArtwork {
    // Procesar tags/keywords
    let tags: string[] = [];
    
    // Harvard puede tener keywords en diferentes campos
    if (data.keywords && Array.isArray(data.keywords)) {
      tags = data.keywords
        .map(keyword => keyword.name || keyword)
        .filter(tag => tag && typeof tag === 'string');
    }

    // Procesar imagen
    let imageUrl = '';
    if (data.primaryimageurl) {
      imageUrl = data.primaryimageurl;
    } else if (data.images && data.images.length > 0) {
      imageUrl = data.images[0].baseimageurl || data.images[0].iiifbaseuri;
    }

    //  Procesar artista
    let artistName = 'Unknown Artist';
    if (data.people && data.people.length > 0) {
      artistName = data.people[0].name || data.people[0].displayname;
    } else if (data.culture) {
      artistName = data.culture;
    }

    return new HarvardArtwork(
      data.id?.toString() || data.objectnumber,
      data.title || 'Untitled',
      artistName,
      imageUrl,
      data.division || data.department || 'Unknown Division',
      data.culture,
      data.period || data.dateoffirstuse,
      data.century,
      data.dated || data.objectdate,
      data.medium || data.technique,
      data.dimensions,
      data.copyright === 'Public Domain' || !data.copyright,
      data.url || `https://www.harvardartmuseums.org/collections/object/${data.id}`,
      tags,
      data.description || data.labeltext,
      data.accessionNumber || data.objectnumber,
      data.classification,
      data.technique,
      data.provenance,
      data.copyright
    );
  }

  /**
   *  Utility para pausas entre requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}