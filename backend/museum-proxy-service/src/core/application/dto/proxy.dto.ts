export class SearchArtworksDto {
  query: string;
  limit?: number = 20;
}

export class ArtworkResponseDto {
  id: string;
  title: string;
  artist: string;
  museum: 'louvre' | 'met';
  imageUrl?: string;
  description?: string;
  year?: number;
  dimensions?: string;
}

export class ProxyResponseDto<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'louvre' | 'met';
  fromCache: boolean = false;
}