import React, { useEffect, useState } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import { getMyProfile, removeFavorite } from '../api'

export default function Favorites() {
  const [token] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null as any)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        const profile = await getMyProfile(token)
        setUser(profile)
      } catch (e) { console.warn(e) }
    }
    load()
  }, [token])

  async function toggleFavorite(artwork: any) {
    if (!token || !user) return
    try {
      await removeFavorite(user.id, artwork, token)
      setUser({ ...user, favorites: user.favorites.filter((f: any) => f !== artwork) })
    } catch (e) { console.error(e); alert('Failed') }
  }

  if (!token) return <div>Please login to see favorites</div>
  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h2>Your Favorites</h2>
      <div className="grid">
        {user.favorites.map((id: string) => (
          <div key={id} className="fav-item">
            <ArtworkCard artwork={{ id, title: id, artist: '', imageUrl: '' , isFavorited: true}} onToggleFavorite={() => toggleFavorite(id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
