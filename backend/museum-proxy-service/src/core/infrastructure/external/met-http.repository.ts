import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

@Injectable()
export class MetHttpRepository implements MuseumRepository {
  private readonly baseUrl = 'http://localhost:3012/api/v1/met';

  constructor(private readonly httpService: HttpService) {}

  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    try {
      console.log(`🔌 Calling MET Adapter: ${this.baseUrl}/search?q=${query}&limit=${limit}`);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search`, {
          params: { q: query, limit },
          timeout: 10000
        })
      );
      
      console.log(`✅ MET Adapter response:`, response.data);
      
      // El MET Adapter devuelve: { artworks: MetArtworkResponseDto[], total: number, ... }
      return response.data.artworks.map((item: any) => Artwork.fromMet(item));
    } catch (error) {
      console.error(`❌ MET Adapter error:`, error.response?.data || error.message || error);
      throw new Error(`MET API error: ${error.response?.data || error.message || error}`);
    }
  }

  async getArtworkById(id: string): Promise<Artwork> {
    try {
      const metId = id.replace('met_', '');
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/artwork/${metId}`, {
          timeout: 5000
        })
      );
      
      return Artwork.fromMet(response.data);
    } catch (error) {
      throw new Error(`MET API error: ${error}`);
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