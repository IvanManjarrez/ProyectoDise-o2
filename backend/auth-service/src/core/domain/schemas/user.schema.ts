import { Schema } from 'mongoose'

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  favorites: { type: [String], default: [] },
  searchHistory: { type: [
    {
      query: { type: String, required: true },
      museums: { type: String },
      limit: { type: Number },
      ts: { type: Number, default: () => Date.now() }
    }
  ], default: [] }
}, { timestamps: true })
