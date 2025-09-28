export class MetObjectId {
  private readonly _value: number;

  constructor(value: number) {
    if (!value || value <= 0) {
      throw new Error('MET Object ID must be a positive number');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: MetObjectId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}