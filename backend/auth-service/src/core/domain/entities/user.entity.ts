export interface FavoriteArtwork {
  artworkId: string
  title: string
  artist?: string
  imageUrl?: string
  museum: string
  description?: string
  year?: number
  addedAt?: number
}

export interface User {
  id?: string
  email: string
  passwordHash: string
  name?: string
  favorites: FavoriteArtwork[]
  searchHistory?: Array<{
    query: string
    museums?: string
    limit?: number
    ts?: number
  }>
}