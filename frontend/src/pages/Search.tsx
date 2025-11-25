import React, { useState, useContext } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import { searchArtworks, addFavorite, removeFavorite, addSearchHistory } from '../api'
import { AuthContext } from '../contexts/AuthContext'
import RecentSearches from '../components/RecentSearches'
import { saveLocalSearch } from '../utils/searchHistory'

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const { token, user, refreshProfile } = useContext(AuthContext)

  async function runSearch() {
    const res = await searchArtworks(q, undefined, 10, token || undefined)
    setResults(res.data || [])
    // save locally
    try {
      saveLocalSearch({ query: q, limit: 10 })
      // sync to server if logged in
      if (token && user) await addSearchHistory(user.id, { query: q, limit: 10 }, token)
    } catch (e) {
      // ignore sync errors
    }
  }

  async function toggleFavorite(artwork: any) {
    if (!token || !user) return alert('Please login first')
    const userId = user.id
    try {
      if (artwork.isFavorited) {
        await removeFavorite(userId, artwork.id, token)
        artwork.isFavorited = false
      } else {
        await addFavorite(userId, artwork.id, token)
        artwork.isFavorited = true
      }
      setResults([...results])
    } catch (e) {
      console.error(e)
      alert('Failed to toggle favorite')
    }
  }

  React.useEffect(() => { if (token) refreshProfile() }, [token, refreshProfile])

  return (
    <div>
      <RecentSearches onSelect={(s) => { setQ(s); setTimeout(() => runSearch(), 0) }} userId={user?.id} token={token || null} />
      <div className="search-box">
        <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search artworks (e.g. monet)" />
        <button onClick={runSearch}>Search</button>
      </div>

      <div className="grid">
        {results.map((a: any) => (
          <ArtworkCard key={a.id} artwork={a} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </div>
  )
}
