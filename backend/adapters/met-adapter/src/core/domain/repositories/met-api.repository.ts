import { MetArtwork } from '../entities/met-artwork.entity';
import { MetObjectId } from '../value-objects/met-object-id.vo';
import { SearchQuery } from '../value-objects/search-query.vo';

export interface MetApiRepository {
  search(query: SearchQuery, limit?: number): Promise<number[]>;
  getArtworkById(objectId: MetObjectId): Promise<MetArtwork | null>;
  getMultipleArtworks(objectIds: MetObjectId[]): Promise<MetArtwork[]>;
  getDepartments(): Promise<{ departmentId: number; displayName: string }[]>;
  isHealthy(): Promise<boolean>;
}