import React, { useEffect, useState } from 'react'
import { loadLocalHistory, clearLocalHistory, SearchEntry } from '../utils/searchHistory'
import { getSearchHistory } from '../api'

type Props = {
  onSelect: (q: string) => void
  userId?: string | null
  token?: string | null
}

export default function RecentSearches({ onSelect, userId, token }: Props) {
  const [items, setItems] = useState([] as SearchEntry[])

  useEffect(() => {
    async function load() {
      let local = loadLocalHistory(10)
      if (userId && token) {
        try {
          const res = await getSearchHistory(userId, token)
          if (res && res.history) {
            // server history likely ordered newest first
            setItems(res.history.concat(local).slice(0, 10))
            return
          }
        } catch (e) {
          // fallback to local
        }
      }
      setItems(local)
    }
    load()
  }, [userId, token])

  function handleClear() {
    clearLocalHistory()
    setItems([])
  }

  if (!items || items.length === 0) return null

  return (
    <section aria-label="Búsquedas recientes">
      <h3>Recent searches</h3>
      <ul>
        {items.map((it: SearchEntry, idx: number) => (
          <li key={`${it.query}-${it.ts}-${idx}`}>
            <button onClick={() => onSelect(it.query)}>{it.query}</button>
          </li>
        ))}
      </ul>
      <button onClick={handleClear} aria-label="Clear recent searches">Clear</button>
    </section>
  )
}
