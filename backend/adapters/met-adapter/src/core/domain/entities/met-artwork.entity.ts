export class MetArtwork {
  constructor(
    public readonly objectID: number,
    public readonly title: string,
    public readonly artistDisplayName: string,
    public readonly primaryImage: string,
    public readonly department: string,
    public readonly culture?: string,
    public readonly period?: string,
    public readonly dynasty?: string,
    public readonly objectDate?: string,
    public readonly medium?: string,
    public readonly dimensions?: string,
    public readonly isPublicDomain?: boolean,
    public readonly objectURL?: string,
    public readonly tags?: string[]
  ) {}

  // Métodos de dominio
  public hasImage(): boolean {
    return !!this.primaryImage && this.primaryImage.length > 0;
  }

  public isAncient(): boolean {
    if (!this.objectDate) return false;
    const dateMatch = this.objectDate.match(/(\d{1,4})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      return year < 1000;
    }
    return false;
  }

  public getDisplayInfo(): { title: string; artist: string; date: string } {
    return {
      title: this.title || 'Untitled',
      artist: this.artistDisplayName || 'Unknown Artist',
      date: this.objectDate || 'Date unknown'
    };
  }

  public matchesQuery(query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      this.title?.toLowerCase().includes(searchTerm) ||
      this.artistDisplayName?.toLowerCase().includes(searchTerm) ||
      this.department?.toLowerCase().includes(searchTerm) ||
      this.culture?.toLowerCase().includes(searchTerm) ||
      this.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      false
    );
  }

}