const KEY = 'searchHistory'

export type SearchEntry = { query: string; museums?: string; limit?: number; ts: number }

export function loadLocalHistory(max = 10): SearchEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as SearchEntry[]
    return arr.slice(0, max)
  } catch (e) {
    return []
  }
}

export function saveLocalSearch(entry: { query: string; museums?: string; limit?: number }, max = 50) {
  try {
    if (!entry.query || !entry.query.trim()) return
    const existing = loadLocalHistory(max)
    const normalized = { query: entry.query.trim(), museums: entry.museums, limit: entry.limit, ts: Date.now() }
    const deduped = existing.filter(e => !(e.query === normalized.query && (e.museums || '') === (normalized.museums || '') && (e.limit || 0) === (normalized.limit || 0)))
    const newArr = [normalized, ...deduped].slice(0, max)
    localStorage.setItem(KEY, JSON.stringify(newArr))
  } catch (e) {
    // ignore
  }
}

export function clearLocalHistory() {
  try { localStorage.removeItem(KEY) } catch (e) {}
}
