import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { JwtServicePort } from '../ports/jwt.port'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepository') private readonly repo: any,
    @Inject('RefreshTokenRepository') private readonly tokenRepo: any,
    private readonly jwt: JwtServicePort
  ) {}

  async execute(email: string, password: string, deviceInfo?: string) {
    const user = await this.repo.findByEmail(email)
    if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    
    // Generate access token (short-lived)
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email })
    
    // Generate refresh token (long-lived)
    const refreshToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
    
    await this.tokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      deviceInfo
    })
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  }
}
