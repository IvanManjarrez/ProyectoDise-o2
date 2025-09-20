import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ArtworkService } from '../core/services/artwork.service';
import { MuseumService } from '../core/services/museum.service';

@Injectable()
export class CompositionService {
  constructor(
    private readonly artworkService: ArtworkService,
    private readonly museumService: MuseumService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchArtworks(query: string) {
    const cacheKey = `search:${query.toLowerCase()}`;
    
    // Check cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Search in local database
      const artworks = await this.artworkService.search(query);
      
      const result = {
        query,
        results: artworks,
        total: artworks.length,
        sources: ['local-db'],
        timestamp: new Date().toISOString()
      };

      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, result, 300000);
      
      return result;
    } catch (error) {
      return {
        query,
        results: [],
        total: 0,
        error: 'Search failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getArtworkById(id: string) {
    const cacheKey = `artwork:${id}`;
    
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const artwork = await this.artworkService.findById(id);
      
      if (!artwork) {
        return { error: 'Artwork not found', id };
      }

      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, artwork, 600000);
      
      return artwork;
    } catch (error) {
      return { error: 'Failed to get artwork', id };
    }
  }

  async getAllMuseums() {
    const cacheKey = 'museums:all';
    
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const museums = await this.museumService.findAll();
      
      const result = {
        museums,
        total: museums.length,
        timestamp: new Date().toISOString()
      };

      // Cache for 30 minutes
      await this.cacheManager.set(cacheKey, result, 1800000);
      
      return result;
    } catch (error) {
      return {
        museums: [],
        total: 0,
        error: 'Failed to get museums'
      };
    }
  }
}