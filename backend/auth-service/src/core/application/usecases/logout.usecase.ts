import { Injectable, Inject } from '@nestjs/common'

@Injectable()
export class LogoutUseCase {
  constructor(@Inject('RefreshTokenRepository') private readonly tokenRepo: any) {}

  async execute(refreshToken: string) {
    const revoked = await this.tokenRepo.revoke(refreshToken)
    return { success: revoked, message: revoked ? 'Logged out successfully' : 'Token not found' }
  }

  async executeAll(userId: string) {
    const revoked = await this.tokenRepo.revokeAllForUser(userId)
    return { success: revoked, message: 'Logged out from all devices' }
  }
}
