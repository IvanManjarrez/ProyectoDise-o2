import { Artwork } from '../entities/artwork.entity';

export interface MuseumRepository {
  searchArtworks(query: string, limit?: number): Promise<Artwork[]>;
  getArtworkById(id: string): Promise<Artwork>;
  healthCheck(): Promise<boolean>;
}