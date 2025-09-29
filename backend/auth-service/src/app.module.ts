import { Module } from '@nestjs/common';
import { AuthController } from './core/interface/controllers/auth.controller'; 
import { RegisterUserUseCase } from './core/application/usecases/register.usecase'; 

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [RegisterUserUseCase],
})
export class AppModule {}