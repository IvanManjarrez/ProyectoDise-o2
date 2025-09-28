import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

/**
 * Repositorio HTTP para Louvre Adapter
 * NOTA: Como el Louvre Adapter aún no está implementado,
 * este repositorio fallará. Usar LouvreHttpRepository cuando esté listo.
 */
@Injectable()
export class LouvreHttpRepository implements MuseumRepository {
  private readonly baseUrl = 'http://localhost:3011/api/v1/louvre';

  constructor(private readonly httpService: HttpService) {}

  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search`, {
          params: { q: query, limit },
          timeout: 10000
        })
      );
      
      return response.data.artworks.map((item: any) => Artwork.fromLouvre(item));
    } catch (error) {
      // Louvre Adapter no implementado aún
      console.warn('Louvre Adapter not available, falling back to mock data');
      
      // Fallback a datos mock
      return [
        new Artwork(
          `louvre_mock_${Date.now()}`,
          `Mock Louvre Result for "${query}"`,
          'Mock Artist',
          'louvre',
          'https://example.com/louvre-mock.jpg',
          'Mock artwork from Louvre (adapter not implemented)',
          2024,
          'Mock dimensions'
        )
      ];
    }
  }

  async getArtworkById(id: string): Promise<Artwork> {
    // Mock implementation
    return new Artwork(
      id,
      'Mock Louvre Artwork',
      'Mock Artist',
      'louvre',
      'https://example.com/louvre-mock.jpg',
      'Mock artwork from Louvre',
      2024,
      'Mock dimensions'
    );
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`, {
          timeout: 5000
        })
      );
      
      return response.data?.status === 'healthy';
    } catch (error) {
      return false; // Louvre Adapter not available
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.isHealthy();
  }
}