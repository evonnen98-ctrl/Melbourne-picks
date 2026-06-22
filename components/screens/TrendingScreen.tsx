'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TrendingVenue, Place } from '@/lib/types'
import TrendingCard from '@/components/TrendingCard'

interface TrendingScreenProps {
  onSave:       (place: Place) => void
  isPlaceSaved: (id: string) => boolean
}

export default function TrendingScreen({ onSave, isPlaceSaved }: TrendingScreenProps) {
  const [venues,    setVenues]    = useState<TrendingVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchTrending = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/trending')
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
      setVenues(data.venues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending venues')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])

  const handleSave = (venue: TrendingVenue) => {
    const place: Place = {
      id:            venue.id,
      name:          venue.name,
      description:   venue.description,
      whyItMatches:  '',
      cuisineType:   venue.cuisineType,
      neighbourhood: venue.neighbourhood,
      priceRange:    venue.priceRange,
      websiteUrl:    venue.websiteUrl,
      googleRating:  venue.googleRating,
    }
    onSave(place)
  }

  return (
    <div className="px-5 md:px-8 lg:px-10">
      <header className="mb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-sage-500 uppercase mb-3">
          Melbourne · What&apos;s hot
        </p>
        <h1 className="font-heading text-[2.4rem] uppercase tracking-[-0.03em] leading-[1.05] text-espresso mb-1">
          Trending in Melbourne.
        </h1>
        <p className="text-sm text-zinc-400">Curated from Melbourne&apos;s best guides.</p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-zinc-100/80 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-zinc-100 rounded-lg w-2/3" />
                  <div className="h-3 bg-zinc-100 rounded-lg w-full" />
                  <div className="h-3 bg-zinc-100 rounded-lg w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-4">
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>
          <button
            onClick={fetchTrending}
            className="w-full py-3 bg-white text-charcoal font-medium rounded-2xl text-sm border border-zinc-200 hover:border-zinc-400 transition-all"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && venues.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {venues.map((venue, i) => (
              <TrendingCard
                key={venue.id}
                venue={venue}
                rank={i + 1}
                onSave={() => handleSave(venue)}
                isSaved={isPlaceSaved(venue.id)}
              />
            ))}
          </div>
          <button
            onClick={fetchTrending}
            className="mt-6 w-full py-3 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Refresh list ↻
          </button>
        </>
      )}
    </div>
  )
}
