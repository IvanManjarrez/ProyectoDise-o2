/**
 * Harvard Object ID Value Object  
 * Representa un identificador único de objeto de Harvard Art Museums
 */
export class HarvardObjectId {
  private readonly _value: string;

  constructor(value: string | number) {
    const stringValue = value.toString().trim();
    
    if (!stringValue || stringValue.length === 0) {
      throw new Error('Harvard Object ID cannot be empty');
    }

    // Validar formato de ID del Louvre (generalmente strings alfanuméricos)
    if (!/^[a-zA-Z0-9\-_\.]+$/.test(stringValue)) {
      throw new Error('Invalid Louvre Object ID format');
    }

    this._value = stringValue;
  }

  get value(): string {
    return this._value;
  }

  public equals(other: HarvardObjectId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  // Factory methods
  public static fromString(id: string): HarvardObjectId {
    return new HarvardObjectId(id);
  }

  public static fromNumber(id: number): HarvardObjectId {
    return new HarvardObjectId(id.toString());
  }

  public static isValid(id: string | number): boolean {
    if (typeof id === 'number') {
      return id > 0 && Number.isInteger(id);
    }
    
    if (!id || typeof id !== 'string') return false;
    
    const numericId = parseInt(id.trim(), 10);
    return !isNaN(numericId) && numericId > 0;
  }
}