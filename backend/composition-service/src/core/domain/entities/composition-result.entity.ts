import { CompositionArtwork } from './composition-artwork.entity';

export class CompositionResult {
  constructor(
    public readonly artworks: CompositionArtwork[],
    public readonly totalCount: number,
    public readonly query: string,
    public readonly searchTime: number,
    public readonly sources: SourceResult[],
  ) {}

  static create(
    artworks: CompositionArtwork[],
    query: string,
    searchTime: number,
    sources: SourceResult[],
  ): CompositionResult {
    return new CompositionResult(
      artworks,
      artworks.length,
      query,
      searchTime,
      sources,
    );
  }

  sortBy(criteria: 'relevance' | 'date' | 'title' | 'museum'): CompositionResult {
    let sortedArtworks = [...this.artworks];

    switch (criteria) {
      case 'title':
        sortedArtworks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'museum':
        sortedArtworks.sort((a, b) => a.museum.localeCompare(b.museum));
        break;
      case 'date':
        sortedArtworks.sort((a, b) => {
          const dateA = a.date || '0';
          const dateB = b.date || '0';
          return dateA.localeCompare(dateB);
        });
        break;
      case 'relevance':
      default:
        // Mantenemos el orden original que viene de las APIs
        break;
    }

    return new CompositionResult(
      sortedArtworks,
      this.totalCount,
      this.query,
      this.searchTime,
      this.sources,
    );
  }

  limit(count: number): CompositionResult {
    return new CompositionResult(
      this.artworks.slice(0, count),
      this.totalCount,
      this.query,
      this.searchTime,
      this.sources,
    );
  }
}

export class SourceResult {
  constructor(
    public readonly source: string,
    public readonly count: number,
    public readonly responseTime: number,
    public readonly success: boolean,
    public readonly error?: string,
  ) {}
}