import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

@Injectable()
export class MetHttpRepository implements MuseumRepository {
  private readonly baseUrl = 'http://localhost:3012/api/v1';

  constructor(private readonly httpService: HttpService) {}

  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/artworks/search`, {
          params: { query, limit },
          timeout: 5000
        })
      );
      
      return response.data.map((item: any) => Artwork.fromMet(item));
    } catch (error) {
      throw new Error(`MET API error: ${error}`);
    }
  }

  async getArtworkById(id: string): Promise<Artwork> {
    try {
      const metId = id.replace('met_', '');
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/artworks/${metId}`, {
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