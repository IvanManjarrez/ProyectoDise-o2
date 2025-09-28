import { Injectable } from '@nestjs/common';
import { Artwork } from '../../domain/entities/artwork.entity';
import { MuseumRepository } from '../../domain/repositories/museum.repository';

@Injectable()
export class MockLouvreRepository implements MuseumRepository {
  async searchArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
    // Simular delay de API real
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockData = [
      {
        id: 'mock_louvre_1',
        title: `Mona Lisa (búsqueda: ${query})`,
        artist: 'Leonardo da Vinci',
        imageUrl: 'https://example.com/mona-lisa.jpg',
        description: 'Mock data from Louvre',
        year: 1503,
        dimensions: '77 cm × 53 cm'
      },
      {
        id: 'mock_louvre_2', 
        title: `Venus de Milo (búsqueda: ${query})`,
        artist: 'Alexandros of Antioch',
        imageUrl: 'https://example.com/venus.jpg',
        description: 'Mock data from Louvre',
        year: -130,
        dimensions: '202 cm'
      }
    ];

    return mockData
      .slice(0, Math.min(limit, mockData.length))
      .map(item => Artwork.fromLouvre(item));
  }

  async getArtworkById(id: string): Promise<Artwork> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockData = {
      id: id.replace('louvre_', ''),
      title: 'Mock Louvre Artwork',
      artist: 'Mock Artist',
      imageUrl: 'https://example.com/mock.jpg',
      description: `Mock artwork with ID: ${id}`,
      year: 1800,
      dimensions: '100 cm × 100 cm'
    };

    return Artwork.fromLouvre(mockData);
  }

  async healthCheck(): Promise<boolean> {
    return true; // Siempre "healthy" en mock
  }
}