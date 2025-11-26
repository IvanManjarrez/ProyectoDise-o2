import { Schema } from 'mongoose'

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  favorites: { type: [
    {
      artworkId: { type: String, required: true },
      title: { type: String, default: 'Obra sin título' },
      artist: { type: String },
      imageUrl: { type: String },
      museum: { type: String, default: 'unknown' },
      description: { type: String },
      year: { type: Number },
      addedAt: { type: Number, default: () => Date.now() }
    }
  ], default: [] },
  searchHistory: { type: [
    {
      query: { type: String, required: true },
      museums: { type: String },
      limit: { type: Number },
      ts: { type: Number, default: () => Date.now() }
    }
  ], default: [] }
}, { timestamps: true })
