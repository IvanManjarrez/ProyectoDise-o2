export class Artwork {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly artist: string,
    public readonly museum: 'met',
    public readonly imageUrl?: string,
    public readonly description?: string,
    public readonly year?: number,
    public readonly dimensions?: string
  ) {}

  static fromMet(data: any): Artwork {
    return new Artwork(
      `met_${data.objectID}`,
      data.title,
      data.artistDisplayName || 'Unknown Artist',
      'met',
      data.primaryImage,
      data.medium,
      data.objectDate ? parseInt(data.objectDate) : undefined,
      data.dimensions
    );
  }
}