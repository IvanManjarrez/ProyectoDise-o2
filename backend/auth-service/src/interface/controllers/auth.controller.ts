import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { RegisterUseCase } from '../../core/application/usecases/register.usecase'
import { LoginUseCase } from '../../core/application/usecases/login.usecase'
import { RefreshTokenUseCase } from '../../core/application/usecases/refresh-token.usecase'
import { LogoutUseCase } from '../../core/application/usecases/logout.usecase'
import { AuthRegisterDto } from '../../core/application/dto/auth-register.dto'
import { AuthLoginDto } from '../../core/application/dto/auth-login.dto'
import { RefreshTokenDto } from '../../core/application/dto/refresh-token.dto'
import { JwtAuthGuard } from '../../core/application/ports/jwt-auth.guard'
import { Request } from 'express'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema. El email debe ser único y la contraseña debe tener al menos 6 caracteres. Rate limit: 5 intentos por minuto.'
  })
  @ApiBody({ type: AuthRegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        id: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa',
        email: 'user@example.com',
        name: 'John Doe'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email ya está en uso' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes - Rate limit excedido' })
  async register(@Body() body: AuthRegisterDto) {
    console.log('[auth] register body ->', JSON.stringify(body))
    const { email, password, name } = body
    const user = await this.registerUseCase.execute(email, password, name)
    return user
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y retorna un access token JWT (1 hora) y un refresh token (7 días). Rate limit: 10 intentos por minuto.'
  })
  @ApiBody({ type: AuthLoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso, retorna access token y refresh token',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: '550e8400-e29b-41d4-a716-446655440000',
        expiresIn: 3600,
        user: {
          id: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa',
          email: 'user@example.com',
          name: 'John Doe'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes - Rate limit excedido' })
  async login(@Body() body: AuthLoginDto, @Req() req: Request) {
    const { email, password } = body
    const deviceInfo = req.headers['user-agent'] || 'unknown'
    const res = await this.loginUseCase.execute(email, password, deviceInfo)
    return res
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({ 
    summary: 'Renovar access token',
    description: 'Genera un nuevo access token y refresh token usando un refresh token válido. El refresh token anterior se revoca automáticamente. Rate limit: 20 intentos por minuto.'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens renovados exitosamente',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: '650e8400-e29b-41d4-a716-446655440001',
        user: {
          id: '936fba5d-95f8-4bbd-bbc1-2fcdb6887cfa',
          email: 'user@example.com',
          name: 'John Doe'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado o revocado' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes - Rate limit excedido' })
  async refresh(@Body() body: RefreshTokenDto) {
    const res = await this.refreshTokenUseCase.execute(body.refreshToken)
    return res
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Revoca el refresh token especificado, cerrando la sesión en ese dispositivo.'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(@Body() body: RefreshTokenDto) {
    const res = await this.logoutUseCase.execute(body.refreshToken)
    return res
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión en todos los dispositivos',
    description: 'Revoca todos los refresh tokens del usuario, cerrando sesión en todos los dispositivos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesiones cerradas en todos los dispositivos',
    schema: {
      example: {
        success: true,
        message: 'Logged out from all devices'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logoutAll(@Req() req: any) {
    const userId = req.user.id
    const res = await this.logoutUseCase.executeAll(userId)
    return res
  }
}
