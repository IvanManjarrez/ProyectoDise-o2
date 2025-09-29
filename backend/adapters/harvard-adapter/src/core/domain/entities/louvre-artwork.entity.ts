export class LouvreArtwork {
  constructor(
    public readonly objectId: string,
    public readonly title: string,
    public readonly artistName: string,
    public readonly imageUrl: string,
    public readonly department: string,
    public readonly culture?: string,
    public readonly period?: string,
    public readonly dynasty?: string,
    public readonly objectDate?: string,
    public readonly medium?: string,
    public readonly dimensions?: string,
    public readonly isPublicDomain?: boolean,
    public readonly objectURL?: string,
    public readonly tags?: string[],
    public readonly description?: string,
    public readonly acquisitionDate?: string
  ) {}

  // Métodos de dominio
  public hasImage(): boolean {
    return !!this.imageUrl && this.imageUrl.length > 0;
  }

  public isAncient(): boolean {
    if (!this.objectDate) return false;
    
    // Lógica para determinar si es antiguo
    const ancientKeywords = ['BC', 'B.C.', 'avant J.-C.', 'av. J.-C.'];
    return ancientKeywords.some(keyword => 
      this.objectDate!.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  public getDisplayInfo(): {
    title: string;
    artist: string;
    museum: string;
    hasImage: boolean;
  } {
    return {
      title: this.title || 'Untitled',
      artist: this.artistName || 'Unknown Artist',
      museum: 'Louvre Museum',
      hasImage: this.hasImage()
    };
  }

  public matchesQuery(query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      this.title?.toLowerCase().includes(searchTerm) ||
      this.artistName?.toLowerCase().includes(searchTerm) ||
      this.department?.toLowerCase().includes(searchTerm) ||
      this.culture?.toLowerCase().includes(searchTerm) ||
      this.description?.toLowerCase().includes(searchTerm) ||
      this.tags?.some(tag => 
        typeof tag === 'string' && tag.toLowerCase().includes(searchTerm)
      ) ||
      false
    );
  }

  public toSummary(): string {
    return `${this.title} by ${this.artistName || 'Unknown'} (${this.department})`;
  }
}