'use client'

import { useState } from 'react'

interface StarRatingProps {
  rating:   number
  onChange: (rating: number) => void
}

export default function StarRating({ rating, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star === rating ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className="text-lg leading-none transition-transform hover:scale-110 active:scale-90"
        >
          <span className={`transition-colors ${star <= (hovered || rating) ? 'text-amber-400' : 'text-olive/20'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}
