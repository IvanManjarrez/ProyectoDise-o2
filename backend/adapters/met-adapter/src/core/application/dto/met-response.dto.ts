export interface MetArtworkResponseDto {
  objectID: number;
  title: string;
  artistDisplayName: string;
  primaryImage: string;
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
}

export interface MetSearchResponseDto {
  total: number;
  objectIDs: number[];
  artworks: MetArtworkResponseDto[];
  query: string;
  limit: number;
  executionTimeMs: number;
}