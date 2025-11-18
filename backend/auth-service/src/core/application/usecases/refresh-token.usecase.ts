import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'
import { JwtServicePort } from '../ports/jwt.port'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('RefreshTokenRepository') private readonly tokenRepo: any,
    @Inject('UserRepository') private readonly userRepo: any,
    private readonly jwt: JwtServicePort
  ) {}

  async execute(refreshToken: string) {
    // Validate refresh token
    const tokenRecord = await this.tokenRepo.findByToken(refreshToken)
    
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.tokenRepo.revoke(refreshToken)
      throw new UnauthorizedException('Refresh token expired')
    }

    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token revoked')
    }

    // Get user
    const user = await this.userRepo.findById(tokenRecord.userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Generate new access token
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email })

    // Generate new refresh token
    const newRefreshToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await this.tokenRepo.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
      deviceInfo: tokenRecord.deviceInfo
    })

    // Revoke old refresh token
    await this.tokenRepo.revoke(refreshToken)

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  }
}
