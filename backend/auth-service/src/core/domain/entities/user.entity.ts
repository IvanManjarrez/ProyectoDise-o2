export interface User {
  id?: string
  email: string
  passwordHash: string
  name?: string
  favorites: string[]
  searchHistory?: Array<{
    query: string
    museums?: string
    limit?: number
    ts?: number
  }>
}