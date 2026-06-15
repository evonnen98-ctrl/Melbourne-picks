import type { SavedPlace } from './types'

const KEY = 'melbourne-picks-saved'

export function getSavedPlaces(): SavedPlace[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePlace(place: SavedPlace): void {
  const saved = getSavedPlaces()
  if (!saved.find(p => p.id === place.id)) {
    localStorage.setItem(KEY, JSON.stringify([...saved, place]))
  }
}

export function removePlace(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getSavedPlaces().filter(p => p.id !== id)))
}

export function updatePlace(id: string, updates: Partial<SavedPlace>): void {
  localStorage.setItem(
    KEY,
    JSON.stringify(getSavedPlaces().map(p => (p.id === id ? { ...p, ...updates } : p)))
  )
}
