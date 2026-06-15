'use client'

import type { SavedPlace, SaveStatus } from '@/lib/types'
import StarRating from './StarRating'

interface SavedPlaceCardProps {
  place:    SavedPlace
  onRemove: () => void
  onUpdate: (updates: Partial<SavedPlace>) => void
}

export default function SavedPlaceCard({ place, onRemove, onUpdate }: SavedPlaceCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100/80">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl text-charcoal leading-tight">{place.name}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {place.neighbourhood} · {place.cuisineType} · {place.priceRange}
          </p>
        </div>
        <button
          onClick={onRemove}
          aria-label="Remove from saved"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <p className="text-sm text-zinc-600 leading-relaxed mt-2 mb-4">{place.description}</p>

      <div className="flex gap-2">
        {(['want-to-go', 'been-there'] as SaveStatus[]).map(status => (
          <button
            key={status}
            onClick={() => onUpdate({ status })}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 ${
              place.status === status
                ? status === 'been-there'
                  ? 'bg-charcoal text-cream'
                  : 'bg-terracotta-500 text-cream'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {status === 'want-to-go' ? '♡  Want to go' : '✓  Been there'}
          </button>
        ))}
      </div>

      {place.status === 'been-there' && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-400">Rate it</span>
          <StarRating
            rating={place.rating ?? 0}
            onChange={rating => onUpdate({ rating })}
          />
          {(place.rating ?? 0) > 0 && (
            <span className="text-xs text-zinc-400 ml-auto">{place.rating}/5</span>
          )}
        </div>
      )}
    </div>
  )
}
