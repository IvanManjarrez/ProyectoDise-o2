import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { getArtworkDetail, addFavorite, removeFavorite } from '../api'
import { AuthContext } from '../contexts/AuthContext'

export default function Detail() {
  const { id } = useParams()
  const [artwork, setArtwork] = useState(null)
  const { token, user, refreshProfile } = useContext(AuthContext)

  useEffect(() => {
    async function load() {
      if (!id) return
      const res = await getArtworkDetail(id, undefined, token || undefined)
      setArtwork(res.data || res)
      if (token) {
        try {
          await refreshProfile()
        } catch (e) {
          console.warn('profile fetch failed', e)
        }
      }
    }
    load()
  }, [id, token])

  async function toggleFavorite() {
    if (!token || !user) return alert('Please login first')
    const userId = user.id
    try {
      if (artwork.isFavorited) {
        await removeFavorite(userId, artwork.id, token)
        setArtwork({ ...artwork, isFavorited: false })
      } else {
        await addFavorite(userId, artwork.id, token)
        setArtwork({ ...artwork, isFavorited: true })
      }
    } catch (e) {
      console.error(e)
      alert('Failed to toggle favorite')
    }
  }

  if (!artwork) return <div>Loading...</div>

  return (
    <div className="detail">
      <h2>{artwork.title}</h2>
      <p>{artwork.artist}</p>

      {artwork.modelUrl ? (
        // model-viewer Web Component
        // modelUrl expected to be a URL to a .glb/.gltf file
        // @ts-ignore
        <model-viewer src={artwork.modelUrl} alt={artwork.title} camera-controls auto-rotate style={{ width: '100%', height: '480px' }}>
        </model-viewer>
      ) : (
        <img src={artwork.imageUrl} alt={artwork.title} />
      )}

      <button onClick={toggleFavorite}>{artwork.isFavorited ? '★ Remove' : '☆ Favorite'}</button>

      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(artwork, null, 2)}</pre>
    </div>
  )
}
