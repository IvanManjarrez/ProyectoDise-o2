import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

export async function searchArtworks(query: string, museums?: string, limit?: number, token?: string) {
  const headers: any = {}
  if (token) headers.Authorization = token
  const res = await api.get(`/composition/search?query=${encodeURIComponent(query)}${museums?`&museums=${museums}`:''}${limit?`&limit=${limit}`:''}`, { headers })
  return res.data
}

export async function getArtworkDetail(id: string, museum?: string, token?: string) {
  const headers: any = {}
  if (token) headers.Authorization = token
  const url = `/composition/artworks/${id}${museum?`?museum=${museum}`:''}`
  const res = await api.get(url, { headers })
  return res.data
}

export async function addFavorite(userId: string, artworkId: string, token: string) {
  const res = await api.post(`/users/${userId}/favorites`, { artworkId }, { headers: { Authorization: token } })
  return res.data
}

export async function removeFavorite(userId: string, artworkId: string, token: string) {
  const res = await api.delete(`/users/${userId}/favorites`, { data: { artworkId }, headers: { Authorization: token } })
  return res.data
}

export async function getMyProfile(token: string) {
  const res = await api.get('/users/me', { headers: { Authorization: token } })
  return res.data
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

// Search history APIs (Auth gateway forwards to auth-service)
export async function addSearchHistory(userId: string, entry: { query: string; museums?: string; limit?: number; ts?: number }, token: string) {
  const res = await api.post(`/users/${userId}/search-history`, entry, { headers: { Authorization: token } })
  return res.data
}

export async function getSearchHistory(userId: string, token: string) {
  const res = await api.get(`/users/${userId}/search-history`, { headers: { Authorization: token } })
  return res.data
}

export async function clearSearchHistory(userId: string, ids: number[] | null, token: string) {
  const body = ids ? { ids } : undefined
  const res = await api.delete(`/users/${userId}/search-history`, { data: body, headers: { Authorization: token } })
  return res.data
}

