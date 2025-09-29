import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';

export class RegisterUserUseCase { 
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(email: string, password: string): Promise<User> {
    const emailVO = new Email(email);

    const existing = await this.userRepository.findByEmail(emailVO.getValue());
    if (existing) {
        throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = new User(
        this.generateId(),
        emailVO.getValue(),
        hashedPassword,
        new Date(),
        new Date(),
    );

    await this.userRepository.save(user);

    return user;
    }

    private async hashPassword(password: string): Promise<string> {
        return password; 
    }

    private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
    }
}