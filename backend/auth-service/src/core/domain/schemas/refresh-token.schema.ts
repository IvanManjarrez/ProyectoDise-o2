import { Schema } from 'mongoose'

export const RefreshTokenSchema = new Schema({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  isRevoked: { type: Boolean, default: false },
  deviceInfo: { type: String }
})

// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
