import { CompositionArtwork } from '../../domain/entities/composition-artwork.entity';

export interface MuseumProxyPort {
  searchArtworks(query: string, museum: 'met', limit?: number): Promise<CompositionArtwork[]>;
  getArtworkById(id: string, museum: 'met'): Promise<CompositionArtwork>;
  healthCheck(museum: 'met'): Promise<boolean>;
}