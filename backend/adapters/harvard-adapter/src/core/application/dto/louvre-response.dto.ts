export interface LouvreArtworkResponseDto {
  objectId: string;
  title: string;
  artistName: string;
  imageUrl: string;
  department: string;
  culture?: string;
  period?: string;
  dynasty?: string;
  objectDate?: string;
  medium?: string;
  dimensions?: string;
  isPublicDomain?: boolean;
  objectURL?: string;
  tags?: string[];
  description?: string;
  acquisitionDate?: string;
}

export interface LouvreSearchResponseDto {
  total: number;
  objectIds: string[];
  artworks: LouvreArtworkResponseDto[];
  query: string;
  limit: number;
  executionTimeMs: number;
}