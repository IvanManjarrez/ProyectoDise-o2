export class SearchQuery {
  private readonly _value: string;

  constructor(query: string) {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery || trimmedQuery.length === 0) {
      throw new Error('Search query cannot be empty');
    }

    if (trimmedQuery.length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    if (trimmedQuery.length > 100) {
      throw new Error('Search query must be less than 100 characters');
    }

    // Sanitizar entrada básica
    const sanitized = trimmedQuery
      .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
      .replace(/\s+/g, ' '); // Normalizar espacios

    this._value = sanitized;
  }

  get value(): string {
    return this._value;
  }

  public equals(other: SearchQuery): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public getWords(): string[] {
    return this._value.split(' ').filter(word => word.length > 0);
  }
}