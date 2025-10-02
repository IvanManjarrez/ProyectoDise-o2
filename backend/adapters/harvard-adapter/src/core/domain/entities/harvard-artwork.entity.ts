/**
 * 🎨 Harvard Artwork Entity
 * Representa una obra de arte del Harvard Art Museums
 */
export class HarvardArtwork {
  constructor(
    public readonly objectId: string,
    public readonly title: string,
    public readonly artistName: string,
    public readonly imageUrl: string,
    public readonly department: string,
    public readonly culture?: string,
    public readonly period?: string,
    public readonly century?: string,
    public readonly dated?: string,
    public readonly medium?: string,
    public readonly dimensions?: string,
    public readonly isPublicDomain?: boolean,
    public readonly objectURL?: string,
    public readonly tags?: string[],
    public readonly description?: string,
    public readonly accessionNumber?: string,
    public readonly classification?: string,
    public readonly technique?: string,
    public readonly provenance?: string,
    public readonly copyright?: string
  ) {}

  // 🎯 MÉTODOS DE DOMINIO

  /**
   * Verifica si la obra tiene imagen disponible
   */
  public hasImage(): boolean {
    return !!this.imageUrl && this.imageUrl.length > 0 && !this.imageUrl.includes('placeholder');
  }

  /**
   * Determina si es una obra contemporánea (siglo XX o XXI)
   */
  public isContemporary(): boolean {
    if (!this.century) return false;
    
    const contemporaryCenturies = ['20th century', '21st century', 'XXth century', 'XXIth century'];
    return contemporaryCenturies.some(cent => 
      this.century!.toLowerCase().includes(cent.toLowerCase())
    );
  }

  /**
   * Verifica si es una obra antigua (anterior al siglo XIX)
   */
  public isAncient(): boolean {
    if (!this.century && !this.dated) return false;
    
    // Buscar indicadores de antigüedad
    const ancientKeywords = ['BC', 'B.C.', 'century BC', 'ancient', 'antiquity'];
    const textToCheck = `${this.century || ''} ${this.dated || ''}`.toLowerCase();
    
    return ancientKeywords.some(keyword => textToCheck.includes(keyword.toLowerCase()));
  }

  /**
   * Obtiene información resumida para display
   */
  public getDisplayInfo(): {
    title: string;
    artist: string;
    museum: string;
    hasImage: boolean;
    period: string;
    url?: string;
  } {
    return {
      title: this.title || 'Untitled',
      artist: this.artistName || 'Unknown Artist',
      museum: 'Harvard Art Museums',
      hasImage: this.hasImage(),
      period: this.century || this.period || this.dated || 'Unknown Period',
      url: this.objectURL
    };
  }

  /**
   * Obtiene el ID limpio (sin prefijos)
   */
  public getCleanId(): string {
    return this.objectId.toString();
  }

  /**
   * Verifica si tiene información de procedencia
   */
  public hasProvenance(): boolean {
    return !!this.provenance && this.provenance.trim().length > 0;
  }

  /**
   * Obtiene tags válidos filtrados
   */
  public getValidTags(): string[] {
    if (!this.tags || !Array.isArray(this.tags)) return [];
    
    return this.tags
      .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim())
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 10); // Limit to 10 tags
  }

  /**
   * Convierte a formato JSON para API responses
   */
  public toJSON(): Record<string, any> {
    return {
      objectId: this.objectId,
      title: this.title,
      artistName: this.artistName,
      imageUrl: this.imageUrl,
      department: this.department,
      culture: this.culture,
      period: this.period,
      century: this.century,
      dated: this.dated,
      medium: this.medium,
      dimensions: this.dimensions,
      isPublicDomain: this.isPublicDomain,
      objectURL: this.objectURL,
      tags: this.getValidTags(),
      description: this.description,
      accessionNumber: this.accessionNumber,
      classification: this.classification,
      technique: this.technique,
      provenance: this.provenance,
      copyright: this.copyright,
      museum: 'Harvard Art Museums',
      hasImage: this.hasImage(),
      displayInfo: this.getDisplayInfo()
    };
  }
}