'use client'

import type { SavedPlace } from '@/lib/types'
import SavedPlaceCard from '@/components/SavedPlaceCard'

interface SavedScreenProps {
  savedPlaces: SavedPlace[]
  onRemove:    (id: string) => void
  onUpdate:    (id: string, updates: Partial<SavedPlace>) => void
}

export default function SavedScreen({ savedPlaces, onRemove, onUpdate }: SavedScreenProps) {
  const wishlist = savedPlaces.filter(p => p.status === 'want-to-go')
  const visited  = savedPlaces.filter(p => p.status === 'been-there')

  return (
    <div className="px-5 md:px-8 lg:px-10">
      <header className="mb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-sage-500 uppercase mb-3">Melbourne · Your places</p>
        <h2 className="font-heading text-[2rem] uppercase tracking-[-0.03em] leading-[1.05] text-espresso">
          {savedPlaces.length === 0
            ? 'Your list is empty.'
            : <>{savedPlaces.length}{' '}place{savedPlaces.length !== 1 ? 's' : ''}{' '}saved.</>}
        </h2>
        {savedPlaces.length === 0 && (
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Bookmark places from your picks to build your list.
          </p>
        )}
      </header>

      {savedPlaces.length > 0 && (
        <div className="space-y-8">
          {wishlist.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-3">
                Want to go · {wishlist.length}
              </p>
              <div className="space-y-4">
                {wishlist.map(place => (
                  <SavedPlaceCard
                    key={place.id}
                    place={place}
                    onRemove={() => onRemove(place.id)}
                    onUpdate={updates => onUpdate(place.id, updates)}
                  />
                ))}
              </div>
            </section>
          )}

          {visited.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-3">
                Been there · {visited.length}
              </p>
              <div className="space-y-4">
                {visited.map(place => (
                  <SavedPlaceCard
                    key={place.id}
                    place={place}
                    onRemove={() => onRemove(place.id)}
                    onUpdate={updates => onUpdate(place.id, updates)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
