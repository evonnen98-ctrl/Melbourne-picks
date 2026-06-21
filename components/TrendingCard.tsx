'use client'

import { useState } from 'react'
import type { TrendingVenue } from '@/lib/types'

interface TrendingCardProps {
  venue:   TrendingVenue
  rank:    number
  onSave:  () => void
  isSaved: boolean
}

function googleHref(name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Melbourne')}`
}

export default function TrendingCard({ venue, rank, onSave, isSaved }: TrendingCardProps) {
  const [popEffect, setPopEffect] = useState(false)

  const handleSave = () => {
    if (isSaved) return
    onSave()
    setPopEffect(true)
    setTimeout(() => setPopEffect(false), 500)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100/80 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-sage-50 flex items-center justify-center">
          <span className="text-xs font-bold text-sage-500">
            {String(rank).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-serif text-xl text-charcoal leading-tight">{venue.name}</h3>
                {rank <= 3 && (
                  <span className="flex-shrink-0 text-[10px] font-semibold tracking-wider text-sage-500 uppercase bg-sage-50 px-2 py-0.5 rounded-full">
                    Hot
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed mt-1">{venue.description}</p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              aria-label={isSaved ? 'Saved' : 'Save this place'}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                popEffect ? 'scale-125' : 'scale-100'
              } ${
                isSaved
                  ? 'bg-sage-500 text-cream'
                  : 'bg-zinc-50 text-zinc-400 hover:bg-sage-50 hover:text-sage-400 active:scale-90'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-3 text-xs text-zinc-400">
            <span>{venue.cuisineType}</span>
            <span className="text-zinc-200">·</span>
            <span>{venue.neighbourhood}</span>
            <span className="text-zinc-200">·</span>
            <span className="font-medium text-zinc-600">{venue.priceRange}</span>
            {venue.googleRating > 0 && (
              <>
                <span className="text-zinc-200">·</span>
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  <span className="font-semibold text-zinc-600">{venue.googleRating.toFixed(1)}</span>
                  <span className="text-zinc-400">Google</span>
                </span>
              </>
            )}
          </div>

          {/* As seen in */}
          {venue.seenIn && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage-400 flex-shrink-0">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="text-[10px] text-sage-500 font-medium tracking-wide">
                As seen in {venue.seenIn}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <a
              href={googleHref(venue.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-center text-xs font-medium py-2 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-all duration-150 active:scale-[0.98] ${venue.websiteUrl ? 'flex-1' : 'w-full'}`}
            >
              View on Google
            </a>
            {venue.websiteUrl && (
              <a
                href={venue.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-medium py-2 rounded-xl bg-sage-500 text-cream hover:bg-sage-600 transition-all duration-150 active:scale-[0.98]"
              >
                Book a Table →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
