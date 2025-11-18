import { RefreshToken } from '../entities/refresh-token.entity'

export interface RefreshTokenRepository {
  create(token: Partial<RefreshToken>): Promise<RefreshToken>
  findByToken(token: string): Promise<RefreshToken | null>
  findByUserId(userId: string): Promise<RefreshToken[]>
  revoke(token: string): Promise<boolean>
  revokeAllForUser(userId: string): Promise<boolean>
  deleteExpired(): Promise<number>
}
