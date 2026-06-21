'use client'

import { useState, useEffect, useRef } from 'react'
import Image           from 'next/image'
import HomeScreen      from '@/components/screens/HomeScreen'
import DiscoveryScreen from '@/components/screens/DiscoveryScreen'
import ResultsScreen   from '@/components/screens/ResultsScreen'
import TrendingScreen  from '@/components/screens/TrendingScreen'
import SavedScreen     from '@/components/screens/SavedScreen'
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

const NAV_LINKS = [
  { href: '#discover', label: 'Discover' },
  { href: '#trending', label: 'Trending' },
  { href: '#saved',    label: 'Saved'    },
]

function PhotoDivider({ src }: { src: string }) {
  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <Image src={src} alt="" fill className="object-cover" />
    </div>
  )
}

export default function Home() {
  const [filters,     setFilters]     = useState<Filters>(DEFAULT_FILTERS)
  const [results,     setResults]     = useState<Place[]>([])
  const [searchMeta,  setSearchMeta]  = useState<SearchMeta>({ relaxedFilters: [] })
  const [searchKey,   setSearchKey]   = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [heroVisible, setHeroVisible] = useState(true)

  const heroRef    = useRef<HTMLElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSavedPlaces(getSavedPlaces()) }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (searchKey > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchKey])

  async function fetchRecommendations(filtersToUse: Filters, count: number) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ filters: filtersToUse, count }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
      setResults(data.places ?? [])
      setSearchMeta(data.searchMeta ?? { relaxedFilters: [] })
      setHasSearched(true)
      setSearchKey(k => k + 1)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindPicks = () => { fetchRecommendations(filters, 5) }
  const handleReSearch  = (newFilters: Filters) => {
    setFilters(newFilters)
    fetchRecommendations(newFilters, 5)
  }
  const handleSave   = (place: Place) => {
    savePlace({ ...place, status: 'want-to-go', savedAt: new Date().toISOString() })
    setSavedPlaces(getSavedPlaces())
  }
  const handleRemove = (id: string) => { removePlace(id); setSavedPlaces(getSavedPlaces()) }
  const handleUpdate = (id: string, updates: Partial<SavedPlace>) => {
    updatePlace(id, updates)
    setSavedPlaces(getSavedPlaces())
  }

  return (
    <>
      {/* Fixed top-right nav — no wrapper, links float directly over the page */}
      <nav className="fixed top-6 right-8 md:right-12 flex items-center gap-8 z-50">
        {NAV_LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`text-sm font-medium tracking-wide transition-colors hover:underline underline-offset-4 ${
              heroVisible
                ? 'text-cream/75 hover:text-cream'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Hero */}
      <section ref={heroRef}>
        <HomeScreen />
      </section>

      {/* Discover + Results */}
      <section id="discover" className="bg-cream scroll-mt-20">
        <div className="max-w-[430px] md:max-w-3xl lg:max-w-5xl mx-auto pt-20 pb-16">
          <DiscoveryScreen
            filters={filters}
            setFilters={setFilters}
            onFindPicks={handleFindPicks}
            isLoading={isLoading}
            error={error}
          />
          {hasSearched && (
            <div ref={resultsRef} className="mt-12 pt-10 border-t border-zinc-100">
              <ResultsScreen
                key={searchKey}
                results={results}
                searchMeta={searchMeta}
                filters={filters}
                onReSearch={handleReSearch}
                onSave={handleSave}
                isPlaceSaved={id => savedPlaces.some(p => p.id === id)}
              />
            </div>
          )}
        </div>
      </section>

      <PhotoDivider src="/new01.webp" />

      {/* Trending */}
      <section id="trending" className="bg-cream scroll-mt-20">
        <div className="max-w-[430px] md:max-w-3xl lg:max-w-5xl mx-auto py-20">
          <TrendingScreen
            onSave={handleSave}
            isPlaceSaved={id => savedPlaces.some(p => p.id === id)}
          />
        </div>
      </section>

      <PhotoDivider src="/new02.webp" />

      {/* Saved */}
      <section id="saved" className="bg-cream scroll-mt-20">
        <div className="max-w-[430px] md:max-w-3xl lg:max-w-5xl mx-auto py-20">
          <SavedScreen
            savedPlaces={savedPlaces}
            onRemove={handleRemove}
            onUpdate={handleUpdate}
          />
        </div>
      </section>
    </>
  )
}
