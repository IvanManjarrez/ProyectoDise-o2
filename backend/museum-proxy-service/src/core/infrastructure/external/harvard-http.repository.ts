import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

@Injectable()
export class HarvardHttpRepository implements MuseumRepository {
  private readonly baseUrl = 'http://localhost:3011/api/v1/harvard';

  constructor(private readonly httpService: HttpService) {}

  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    try {
      console.log(`🔌 Calling Harvard Adapter: ${this.baseUrl}/search?q=${query}&limit=${limit}`);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search`, {
          params: { q: query, limit },
          timeout: 10000
        })
      );
      
      console.log(`✅ Harvard Adapter response:`, response.data);
      
      // El Harvard Adapter devuelve: { artworks: HarvardArtworkResponseDTO[], total: number, ... }
      return response.data.artworks.map((item: any) => Artwork.fromHarvard(item));
    } catch (error) {
      console.error(`❌ Harvard Adapter error:`, error.response?.data || error.message || error);
      throw new Error(`Harvard API error: ${error.response?.data || error.message || error}`);
    }
  }

  async getArtworkById(id: string): Promise<Artwork> {
    try {
      const harvardId = id.replace('harvard_', '');
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/artwork/${harvardId}`, {
          timeout: 5000
        })
      );
      
      return Artwork.fromHarvard(response.data);
    } catch (error) {
      throw new Error(`Harvard API error: ${error.response?.data || error.message || error}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`, {
          timeout: 3000
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}