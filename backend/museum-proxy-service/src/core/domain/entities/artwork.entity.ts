export class Artwork {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly artist: string,
    public readonly museum: 'met' | 'harvard',
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

  static fromHarvard(data: any): Artwork {
    return new Artwork(
      `harvard_${data.id}`,
      data.title,
      data.people?.[0]?.name || 'Unknown Artist',
      'harvard',
      data.primaryimageurl,
      data.medium,
      data.dated ? parseInt(data.dated) : undefined,
      data.dimensions
    );
  }
}