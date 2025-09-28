import { Injectable } from '@nestjs/common';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

@Injectable()
export class MockMetRepository implements MuseumRepository {
  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    // Simular delay de API real
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData = [
      {
        id: 'mock_met_1',
        title: `The Starry Night (búsqueda: ${query})`,
        artist: 'Vincent van Gogh',
        imageUrl: 'https://example.com/starry-night.jpg',
        description: 'Mock data from MET',
        year: 1889,
        dimensions: '73.7 cm × 92.1 cm'
      },
      {
        id: 'mock_met_2',
        title: `Girl with a Pearl Earring (búsqueda: ${query})`,
        artist: 'Johannes Vermeer', 
        imageUrl: 'https://example.com/pearl.jpg',
        description: 'Mock data from MET',
        year: 1665,
        dimensions: '44.5 cm × 39 cm'
      }
    ];

    return mockData
      .slice(0, Math.min(limit, mockData.length))
      .map(item => Artwork.fromMet(item));
  }

  async getArtworkById(id: string): Promise<Artwork> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const mockData = {
      id: id.replace('met_', ''),
      title: 'Mock MET Artwork',
      artist: 'Mock Artist',
      imageUrl: 'https://example.com/mock-met.jpg',
      description: `Mock artwork with ID: ${id}`,
      year: 1900,
      dimensions: '120 cm × 80 cm'
    };

    return Artwork.fromMet(mockData);
  }

  async healthCheck(): Promise<boolean> {
    return true; // Siempre "healthy" en mock
  }
}