'use client'

import { useState, useEffect } from 'react'
import DiscoveryScreen from '@/components/screens/DiscoveryScreen'
import ResultsScreen   from '@/components/screens/ResultsScreen'
import TrendingScreen  from '@/components/screens/TrendingScreen'
import SavedScreen     from '@/components/screens/SavedScreen'
import Nav             from '@/components/Nav'
import type { Screen } from '@/components/Nav'
import type { Filters, Place, SavedPlace, SearchMeta } from '@/lib/types'
import { getSavedPlaces, savePlace, removePlace, updatePlace } from '@/lib/storage'

const DEFAULT_FILTERS: Filters = {
  vibe:      null,
  budget:    null,
  type:      'all',
  suburb:    '',
  radius:    'anywhere',
  minRating: 'any',
  cuisines:  [],
  cafeTypes: [],
  barTypes:  [],
  craving:   '',
}

export default function Home() {
  const [screen,      setScreen]      = useState<Screen>('discovery')
  const [filters,     setFilters]     = useState<Filters>(DEFAULT_FILTERS)
  const [results,     setResults]     = useState<Place[]>([])
  const [searchMeta,  setSearchMeta]  = useState<SearchMeta>({ relaxedFilters: [] })
  const [searchKey,   setSearchKey]   = useState(0)   // increments to force ResultsScreen remount
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])

  useEffect(() => { setSavedPlaces(getSavedPlaces()) }, [])

  async function fetchRecommendations(filtersToUse: Filters, count: number) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: filtersToUse, count }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
      setResults(data.places ?? [])
      setSearchMeta(data.searchMeta ?? { relaxedFilters: [] })
      setSearchKey(k => k + 1)   // force ResultsScreen to remount with fresh state
      setScreen('results')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindPicks = () => { fetchRecommendations(filters, 5) }

  // Called from the empty-state suggestion chips — updates filters and re-runs search
  const handleReSearch = (newFilters: Filters) => {
    setFilters(newFilters)
    setScreen('discovery')   // brief return to discovery so the loading spinner is visible
    fetchRecommendations(newFilters, 5)
  }

  const handleSave = (place: Place) => {
    savePlace({ ...place, status: 'want-to-go', savedAt: new Date().toISOString() })
    setSavedPlaces(getSavedPlaces())
  }

  const handleRemove = (id: string) => {
    removePlace(id)
    setSavedPlaces(getSavedPlaces())
  }

  const handleUpdate = (id: string, updates: Partial<SavedPlace>) => {
    updatePlace(id, updates)
    setSavedPlaces(getSavedPlaces())
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[430px] md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen flex flex-col">

        {screen === 'discovery' && (
          <DiscoveryScreen
            filters={filters}
            setFilters={setFilters}
            onFindPicks={handleFindPicks}
            isLoading={isLoading}
            error={error}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            key={searchKey}
            results={results}
            searchMeta={searchMeta}
            filters={filters}
            onBack={() => setScreen('discovery')}
            onReSearch={handleReSearch}
            onSave={handleSave}
            isPlaceSaved={id => savedPlaces.some(p => p.id === id)}
          />
        )}

        {screen === 'trending' && (
          <TrendingScreen
            onSave={handleSave}
            isPlaceSaved={id => savedPlaces.some(p => p.id === id)}
          />
        )}

        {screen === 'saved' && (
          <SavedScreen
            savedPlaces={savedPlaces}
            onRemove={handleRemove}
            onUpdate={handleUpdate}
          />
        )}

        <Nav
          currentScreen={screen}
          onNavigate={setScreen}
          savedCount={savedPlaces.length}
        />
      </div>
    </div>
  )
}
