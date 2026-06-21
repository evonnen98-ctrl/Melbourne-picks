'use client'

import { useState } from 'react'
import type { Place, Filters, SearchMeta, Radius, MinRating } from '@/lib/types'
import PlaceCard from '@/components/PlaceCard'

interface ResultsScreenProps {
  results:      Place[]
  searchMeta:   SearchMeta
  filters:      Filters
  onReSearch:   (newFilters: Filters) => void
  onSave:       (place: Place) => void
  isPlaceSaved: (id: string) => boolean
}

const MAX_MORE_CLICKS = 3

const RADIUS_ORDER: Radius[]    = ['1km', '2km', '5km', '10km', 'anywhere']
const RATING_STEPS: MinRating[] = ['4.5', '4.0', '3.5', 'any']

const RESET_FILTERS: Filters = {
  vibe: null, budget: null, type: 'all',
  suburb: '', radius: 'anywhere', minRating: 'any',
  cuisines: [], cafeTypes: [], barTypes: [], craving: '',
}

function getSuggestions(filters: Filters): Array<{ label: string; newFilters: Filters }> {
  const suggestions: Array<{ label: string; newFilters: Filters }> = []

  if (filters.suburb && filters.radius !== 'anywhere') {
    const idx  = RADIUS_ORDER.indexOf(filters.radius)
    const next = idx !== -1 && idx < RADIUS_ORDER.length - 1 ? RADIUS_ORDER[idx + 1] : null
    if (next) {
      suggestions.push({
        label:      next === 'anywhere' ? 'Try anywhere in Melbourne' : `Try a wider radius (${next})`,
        newFilters: { ...filters, radius: next },
      })
    }
  }

  if (filters.suburb && filters.radius === 'anywhere') {
    suggestions.push({
      label:      'Remove location filter',
      newFilters: { ...filters, suburb: '', radius: 'anywhere' },
    })
  }

  if (filters.minRating !== 'any') {
    const idx  = RATING_STEPS.indexOf(filters.minRating)
    const next = idx !== -1 && idx < RATING_STEPS.length - 1 ? RATING_STEPS[idx + 1] : null
    if (next) {
      suggestions.push({
        label:      next === 'any' ? 'Try any rating' : `Lower rating to ${next}+`,
        newFilters: { ...filters, minRating: next },
      })
    }
  }

  if (filters.cuisines.length > 0) {
    suggestions.push({ label: 'Try any cuisine',    newFilters: { ...filters, cuisines: [] } })
  }
  if (filters.cafeTypes.length > 0) {
    suggestions.push({ label: 'Try any cafe style', newFilters: { ...filters, cafeTypes: [] } })
  }
  if (filters.barTypes.length > 0) {
    suggestions.push({ label: 'Try any bar type',   newFilters: { ...filters, barTypes: [] } })
  }
  if (filters.type !== 'all') {
    suggestions.push({
      label:      'Try all venue types',
      newFilters: { ...filters, type: 'all', cuisines: [], cafeTypes: [], barTypes: [] },
    })
  }
  if (filters.vibe) {
    suggestions.push({ label: 'Remove vibe filter', newFilters: { ...filters, vibe: null } })
  }
  if (filters.budget) {
    suggestions.push({ label: 'Try any budget',     newFilters: { ...filters, budget: null } })
  }

  return suggestions.slice(0, 3)
}

export default function ResultsScreen({
  results, searchMeta, filters, onReSearch, onSave, isPlaceSaved,
}: ResultsScreenProps) {
  const [allResults,    setAllResults]    = useState<Place[]>(results)
  const [moreClicks,    setMoreClicks]    = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [moreError,     setMoreError]     = useState<string | null>(null)

  const hasResults  = allResults.length > 0
  const hasRelaxed  = searchMeta.relaxedFilters.length > 0
  const canLoadMore = hasResults && moreClicks < MAX_MORE_CLICKS

  const suggestions = getSuggestions(filters)

  const handleLoadMore = async () => {
    if (isLoadingMore || moreClicks >= MAX_MORE_CLICKS) return
    setIsLoadingMore(true)
    setMoreError(null)
    try {
      const excludeNames = allResults.map(p => p.name)
      const res = await fetch('/api/recommendations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ filters, count: 5, excludeNames }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')

      const shownIds   = new Set(allResults.map(p => p.id))
      const shownNames = new Set(allResults.map(p => p.name.toLowerCase()))
      const newPlaces  = (data.places ?? []).filter(
        (p: Place) => !shownIds.has(p.id) && !shownNames.has(p.name.toLowerCase())
      )

      if (newPlaces.length === 0) {
        setMoreError("That's all the matches we found for your preferences.")
        setMoreClicks(MAX_MORE_CLICKS)
        return
      }

      setAllResults(prev => [...prev, ...newPlaces])
      setMoreClicks(prev => prev + 1)
    } catch {
      setMoreError("Couldn't load more places. Please try again.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="px-5 md:px-8 lg:px-10">
      {!hasResults ? (
        <div className="mt-4">
          <header className="mb-8">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-sage-500 uppercase mb-3">
              No results
            </p>
            <h2 className="font-serif text-[2rem] leading-tight text-charcoal mb-2">
              Nothing quite matched.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Try adjusting your filters — here are a few ways to broaden your search.
            </p>
          </header>

          <div className="space-y-2.5">
            {suggestions.length > 0 ? suggestions.map((s, i) => (
              <SuggestionButton key={i} label={s.label} onClick={() => onReSearch(s.newFilters)} />
            )) : (
              <SuggestionButton label="Reset all filters" onClick={() => onReSearch(RESET_FILTERS)} />
            )}
          </div>
        </div>
      ) : (
        <>
          <header className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-sage-500 uppercase mb-3">
              Your picks
            </p>
            <h2 className="font-serif text-[2rem] leading-tight text-charcoal">
              We found{' '}{allResults.length}{' '}{allResults.length !== 1 ? 'places' : 'place'}{' '}you&apos;ll love.
            </h2>
          </header>

          {hasRelaxed && (
            <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3.5">
              <p className="text-xs font-semibold text-amber-700 mb-1.5">
                We couldn&apos;t find enough exact matches — here are some close options you might love
              </p>
              <ul className="space-y-0.5">
                {searchMeta.relaxedFilters.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-amber-600">
                    <span className="mt-px flex-shrink-0">↳</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allResults.map((place, i) => (
              <PlaceCard
                key={place.id}
                place={place}
                index={i}
                onSave={() => onSave(place)}
                isSaved={isPlaceSaved(place.id)}
                isCloseMatch={place.confidence === 'close'}
              />
            ))}
          </div>

          {moreError && (
            <p className="mt-4 text-xs text-zinc-500 text-center">{moreError}</p>
          )}

          {canLoadMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="mt-6 w-full py-3.5 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Finding more places…
                </>
              ) : (
                'Give me more options ↓'
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function SuggestionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 transition-all duration-150 active:scale-[0.98] group"
    >
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  )
}
