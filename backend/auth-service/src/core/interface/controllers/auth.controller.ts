import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserUseCase } from '../../application/usecases/register.usecase';
import { RegisterDto } from '../../application/dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
    const user = await this.registerUserUseCase.execute(
        registerDto.email,
        registerDto.password,
    );
    return { id: user.id, email: user.email };
    }
}