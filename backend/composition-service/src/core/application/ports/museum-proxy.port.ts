import { CompositionArtwork } from '../../domain/entities/composition-artwork.entity';

export interface MuseumProxyPort {
  searchArtworks(query: string, museum: 'met' | 'harvard', limit?: number): Promise<CompositionArtwork[]>;
  getArtworkById(id: string, museum: 'met' | 'harvard'): Promise<CompositionArtwork>;
  healthCheck(museum: 'met' | 'harvard'): Promise<boolean>;
}