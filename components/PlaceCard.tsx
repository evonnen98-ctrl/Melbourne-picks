'use client'

import { useState } from 'react'
import type { Place } from '@/lib/types'

interface PlaceCardProps {
  place:        Place
  index:        number
  onSave:       () => void
  isSaved:      boolean
  isCloseMatch?: boolean
}

function googleHref(name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Melbourne')}`
}

export default function PlaceCard({ place, index, onSave, isSaved, isCloseMatch }: PlaceCardProps) {
  const [popEffect, setPopEffect] = useState(false)

  const handleSave = () => {
    if (isSaved) return
    onSave()
    setPopEffect(true)
    setTimeout(() => setPopEffect(false), 500)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100/80 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
              {String(index + 1).padStart(2, '0')}
            </span>
            {isCloseMatch && (
              <span className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full">
                Close match
              </span>
            )}
          </div>
          <h3 className="font-serif text-xl text-charcoal leading-tight">{place.name}</h3>
        </div>

        <button
          onClick={handleSave}
          aria-label={isSaved ? 'Saved' : 'Save this place'}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            popEffect ? 'scale-125' : 'scale-100'
          } ${
            isSaved
              ? 'bg-terracotta-500 text-cream'
              : 'bg-zinc-50 text-zinc-400 hover:bg-terracotta-50 hover:text-terracotta-400 active:scale-90'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <p className="text-sm text-zinc-600 leading-relaxed mb-3 flex-1">{place.description}</p>

      <div className="bg-terracotta-50 rounded-xl px-4 py-2.5 mb-4">
        <p className="text-xs text-terracotta-800 leading-relaxed">
          <span className="font-semibold">Why this? </span>
          {place.whyItMatches}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 mb-4">
        <span>{place.cuisineType}</span>
        <span className="text-zinc-300">·</span>
        <span>{place.neighbourhood}</span>
        <span className="text-zinc-300">·</span>
        <span className="font-medium text-zinc-700">{place.priceRange}</span>
        {place.googleRating > 0 && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className="font-semibold text-zinc-700">{place.googleRating.toFixed(1)}</span>
              <span className="text-zinc-400">Google</span>
            </span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {/* Always shown — secondary outlined */}
        <a
          href={googleHref(place.name)}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-center text-xs font-medium py-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-all duration-150 active:scale-[0.98] ${place.websiteUrl ? 'flex-1' : 'w-full'}`}
        >
          View on Google
        </a>

        {/* Only shown when website URL exists — primary filled */}
        {place.websiteUrl && (
          <a
            href={place.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl bg-terracotta-500 text-cream hover:bg-terracotta-600 transition-all duration-150 active:scale-[0.98]"
          >
            Book a Table →
          </a>
        )}
      </div>
    </div>
  )
}
