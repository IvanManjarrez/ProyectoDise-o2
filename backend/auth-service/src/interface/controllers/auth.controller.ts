import { Controller, Post, Body } from '@nestjs/common'
import { RegisterUseCase } from '../../core/application/usecases/register.usecase'
import { LoginUseCase } from '../../core/application/usecases/login.usecase'
import { AuthRegisterDto } from '../../core/application/dto/auth-register.dto'
import { AuthLoginDto } from '../../core/application/dto/auth-login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase, private readonly loginUseCase: LoginUseCase) {}

  @Post('register')
  async register(@Body() body: AuthRegisterDto) {
    // debug: log incoming parsed body
    console.log('[auth] register body ->', JSON.stringify(body))
    const { email, password, name } = body
    const user = await this.registerUseCase.execute(email, password, name)
    return user
  }

  @Post('login')
  async login(@Body() body: AuthLoginDto) {
    const { email, password } = body
    const res = await this.loginUseCase.execute(email, password)
    return res
  }
}
