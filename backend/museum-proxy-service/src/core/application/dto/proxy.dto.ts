export class SearchArtworksDto {
  query: string;
  limit?: number = 20;
}

export class ArtworkResponseDto {
  id: string;
  title: string;
  artist: string;
  museum: 'met';
  imageUrl?: string;
  description?: string;
  year?: number;
  dimensions?: string;
}

export class ProxyResponseDto<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'met';
  fromCache: boolean = false;
}