export class CompositionArtwork {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly artist: string,
    public readonly imageUrl: string,
    public readonly museum: string,
    public readonly source: 'met' | 'harvard',
    public readonly date?: string,
    public readonly description?: string,
    public readonly culture?: string,
    public readonly medium?: string,
    public readonly dimensions?: string,
  ) {}

  static fromMuseumProxy(data: any, source: 'met' | 'harvard'): CompositionArtwork {
    return new CompositionArtwork(
      data.id,
      data.title,
      data.artist,
      data.imageUrl,
      data.museum,
      source,
      data.date,
      data.description,
      data.culture,
      data.medium,
      data.dimensions,
    );
  }

  toDto() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      imageUrl: this.imageUrl,
      museum: this.museum,
      source: this.source,
      date: this.date,
      description: this.description,
      culture: this.culture,
      medium: this.medium,
      dimensions: this.dimensions,
    };
  }
}