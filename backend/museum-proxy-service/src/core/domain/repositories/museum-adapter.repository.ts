import { Artwork } from '../entities/artwork.entity';

export interface MuseumAdapterRepository {
  searchArtworks(query: string, limit?: number): Promise<Artwork[]>;
  getArtworkById(id: string): Promise<Artwork>;
  healthCheck(): Promise<boolean>;
}