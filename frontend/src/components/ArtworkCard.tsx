import React from 'react'
import { Link } from 'react-router-dom'

export default function ArtworkCard({ artwork, onToggleFavorite }: any) {
  return (
    <div className="artwork-card">
      <Link to={`/artworks/${artwork.id}`} className="thumb-link">
        <figure className="thumb">
          <img src={artwork.imageUrl} alt={artwork.title} />
        </figure>
      </Link>

      <div className="meta">
        <h3 title={artwork.title}>{artwork.title}</h3>
        <p className="artist">{artwork.artist}</p>
        <div className="actions">
          <button className="btn btn-small" onClick={() => onToggleFavorite && onToggleFavorite(artwork)}>
            {artwork.isFavorited ? '★ Remove' : '☆ Favorite'}
          </button>
        </div>
      </div>
    </div>
  )
}
