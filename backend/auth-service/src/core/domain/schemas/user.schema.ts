import { Schema } from 'mongoose'

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  favorites: { type: [String], default: [] }
}, { timestamps: true })
