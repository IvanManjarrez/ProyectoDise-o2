import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RefreshToken } from '../../domain/entities/refresh-token.entity'

@Injectable()
export class MongoRefreshTokenRepository {
  constructor(@InjectModel('RefreshToken') private tokenModel: Model<any>) {}

  async create(token: Partial<RefreshToken>): Promise<RefreshToken> {
    const created = await this.tokenModel.create(token)
    const doc: any = created
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      token: doc.token,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      isRevoked: doc.isRevoked,
      deviceInfo: doc.deviceInfo
    }
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const found: any = await this.tokenModel.findOne({ token, isRevoked: false }).lean()
    if (!found) return null
    
    return {
      id: found._id.toString(),
      userId: found.userId,
      token: found.token,
      expiresAt: found.expiresAt,
      createdAt: found.createdAt,
      isRevoked: found.isRevoked,
      deviceInfo: found.deviceInfo
    }
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const tokens: any[] = await this.tokenModel.find({ userId, isRevoked: false }).lean()
    return tokens.map(t => ({
      id: t._id.toString(),
      userId: t.userId,
      token: t.token,
      expiresAt: t.expiresAt,
      createdAt: t.createdAt,
      isRevoked: t.isRevoked,
      deviceInfo: t.deviceInfo
    }))
  }

  async revoke(token: string): Promise<boolean> {
    const result = await this.tokenModel.updateOne({ token }, { isRevoked: true })
    return result.modifiedCount > 0
  }

  async revokeAllForUser(userId: string): Promise<boolean> {
    const result = await this.tokenModel.updateMany({ userId }, { isRevoked: true })
    return result.modifiedCount > 0
  }

  async deleteExpired(): Promise<number> {
    const result = await this.tokenModel.deleteMany({ expiresAt: { $lt: new Date() } })
    return result.deletedCount
  }
}
