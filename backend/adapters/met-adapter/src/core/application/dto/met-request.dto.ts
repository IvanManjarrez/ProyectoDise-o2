export interface MetSearchRequestDto {
  query: string;
  limit?: number;
  department?: string;
}

export interface MetObjectRequestDto {
  objectID: number;
}