export class Email {
    private readonly value: string;

    constructor(email: string) {
        if (!Email.isValid(email)) {
        throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase();
    }

    static isValid(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getValue(): string {
        return this.value;
    }
}