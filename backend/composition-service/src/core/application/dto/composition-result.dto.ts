export interface CompositionResultDto {
  artworks: ArtworkCompositionDto[];
  metadata: {
    totalCount: number;
    sources: SourceMetadata[];
    query: string;
    searchTime: number;
  };
}

export interface ArtworkCompositionDto {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  museum: string;
  date?: string;
  description?: string;
  culture?: string;
  medium?: string;
  dimensions?: string;
  source: 'met' | 'harvard';
  relevanceScore?: number;
}

export interface SourceMetadata {
  source: string;
  count: number;
  responseTime: number;
  success: boolean;
  error?: string;
}