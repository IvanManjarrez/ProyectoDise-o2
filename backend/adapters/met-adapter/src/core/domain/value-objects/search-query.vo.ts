export class SearchQuery {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }
    if (value.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: SearchQuery): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}