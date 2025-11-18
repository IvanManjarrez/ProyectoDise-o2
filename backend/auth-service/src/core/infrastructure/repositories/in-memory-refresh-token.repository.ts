import { Injectable } from '@nestjs/common'
import { RefreshToken } from '../../domain/entities/refresh-token.entity'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class InMemoryRefreshTokenRepository {
  private tokens: Map<string, RefreshToken> = new Map()

  async create(token: Partial<RefreshToken>): Promise<RefreshToken> {
    const id = uuidv4()
    const created: RefreshToken = {
      id,
      userId: token.userId!,
      token: token.token!,
      expiresAt: token.expiresAt!,
      createdAt: new Date(),
      isRevoked: false,
      deviceInfo: token.deviceInfo
    }
    this.tokens.set(created.token, created)
    return created
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const found = this.tokens.get(token)
    if (!found || found.isRevoked) return null
    if (found.expiresAt < new Date()) return null
    return found
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const result: RefreshToken[] = []
    for (const token of this.tokens.values()) {
      if (token.userId === userId && !token.isRevoked && token.expiresAt > new Date()) {
        result.push(token)
      }
    }
    return result
  }

  async revoke(token: string): Promise<boolean> {
    const found = this.tokens.get(token)
    if (!found) return false
    found.isRevoked = true
    return true
  }

  async revokeAllForUser(userId: string): Promise<boolean> {
    let revoked = false
    for (const token of this.tokens.values()) {
      if (token.userId === userId) {
        token.isRevoked = true
        revoked = true
      }
    }
    return revoked
  }

  async deleteExpired(): Promise<number> {
    let count = 0
    const now = new Date()
    for (const [key, token] of this.tokens.entries()) {
      if (token.expiresAt < now) {
        this.tokens.delete(key)
        count++
      }
    }
    return count
  }
}
