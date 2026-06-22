'use client'

import type { Filters, Vibe, Budget, VenueType, Radius, MinRating } from '@/lib/types'
import FilterChip from '@/components/FilterChip'

interface DiscoveryScreenProps {
  filters:    Filters
  setFilters: (f: Filters) => void
  onFindPicks: () => void
  isLoading:  boolean
  error:      string | null
}

const VIBES: { value: Vibe; label: string }[] = [
  { value: 'casual',      label: 'Casual' },
  { value: 'date-night',  label: 'Date night' },
  { value: 'catch-up',    label: 'Catch up with friends' },
  { value: 'work-lunch',  label: 'Takeaway lunch' },
  { value: 'quick-bite',  label: 'Quick bite' },
  { value: 'celebration', label: 'Celebration' },
]

const BUDGETS: { value: Budget; label: string }[] = [
  { value: 'under-30', label: '$ Under $30' },
  { value: '30-60',    label: '$$ $30–60' },
  { value: 'splurge',  label: '$$$ Splurge' },
]

const TYPES: { value: VenueType; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'cafes',       label: 'Cafes' },
  { value: 'bars',        label: 'Bars' },
]

const RADII: { value: Radius; label: string }[] = [
  { value: '1km',      label: '1km' },
  { value: '2km',      label: '2km' },
  { value: '5km',      label: '5km' },
  { value: '10km',     label: '10km' },
  { value: 'anywhere', label: 'Anywhere' },
]

const RATINGS: { value: MinRating; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: '3.5', label: '3.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

const CUISINES = [
  'Italian', 'Japanese', 'Chinese', 'Thai', 'Vietnamese',
  'Korean', 'Mediterranean', 'Modern Australian', 'Mexican',
  'Indian', 'Middle Eastern', 'American',
]

const CAFE_TYPES = [
  'Specialty coffee', 'Brunch', 'All day dining', 'Bakery',
]

const BAR_TYPES = [
  'Wine bar', 'Cocktail bar', 'Pub', 'Rooftop',
]

const CLEAR_FILTERS: Filters = {
  vibe: null, budget: null, type: 'all',
  suburb: '', radius: 'anywhere', minRating: 'any',
  cuisines: [], cafeTypes: [], barTypes: [], craving: '',
}

export default function DiscoveryScreen({
  filters, setFilters, onFindPicks, isLoading, error,
}: DiscoveryScreenProps) {

  const handleTypeChange = (type: VenueType) => {
    setFilters({
      ...filters,
      type,
      cuisines:  (type === 'all' || type === 'restaurants') ? filters.cuisines  : [],
      cafeTypes: (type === 'all' || type === 'cafes')       ? filters.cafeTypes : [],
      barTypes:  (type === 'all' || type === 'bars')        ? filters.barTypes  : [],
    })
  }

  const toggleCuisine  = (v: string) => setFilters({ ...filters, cuisines:  toggle(filters.cuisines,  v) })
  const toggleCafeType = (v: string) => setFilters({ ...filters, cafeTypes: toggle(filters.cafeTypes, v) })
  const toggleBarType  = (v: string) => setFilters({ ...filters, barTypes:  toggle(filters.barTypes,  v) })

  const showCuisines  = filters.type === 'restaurants'
  const showCafeTypes = filters.type === 'cafes'
  const showBarTypes  = filters.type === 'bars'

  const hasActiveFilters =
    filters.vibe !== null ||
    filters.budget !== null ||
    filters.type !== 'all' ||
    filters.suburb.trim() !== '' ||
    filters.minRating !== 'any' ||
    filters.cuisines.length > 0 ||
    filters.cafeTypes.length > 0 ||
    filters.barTypes.length > 0 ||
    filters.craving.trim() !== ''

  return (
    <div className="px-5 md:px-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-sage-500 uppercase mb-3">
          Melbourne · Personalised picks
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-heading text-[2.4rem] uppercase tracking-[-0.03em] leading-[1.05] text-espresso">
            Find your next spot.
          </h1>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters(CLEAR_FILTERS)}
              className="mb-1.5 text-xs text-zinc-400 hover:text-sage-500 transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      {/* ── Filters: single col on mobile, 2-col on desktop ──────── */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">

        {/* Left column: Type, sub-filters, Vibe */}
        <div className="space-y-7">

          <FilterSection label="Type">
            {TYPES.map(t => (
              <FilterChip
                key={t.value}
                label={t.label}
                selected={filters.type === t.value}
                onClick={() => handleTypeChange(t.value)}
              />
            ))}
          </FilterSection>

          {filters.type === 'all' && (
            <SubFilterSection label="Style" hint="pick one or more">
              {[...BAR_TYPES, ...CAFE_TYPES].map(s => {
                const isBarStyle = BAR_TYPES.includes(s)
                const selected   = isBarStyle ? filters.barTypes.includes(s) : filters.cafeTypes.includes(s)
                return (
                  <FilterChip
                    key={s}
                    label={s}
                    selected={selected}
                    onClick={() => isBarStyle ? toggleBarType(s) : toggleCafeType(s)}
                  />
                )
              })}
            </SubFilterSection>
          )}

          {showCuisines && (
            <SubFilterSection label="Cuisine" hint="pick one or more">
              {CUISINES.map(c => (
                <FilterChip
                  key={c}
                  label={c}
                  selected={filters.cuisines.includes(c)}
                  onClick={() => toggleCuisine(c)}
                />
              ))}
            </SubFilterSection>
          )}

          {showCafeTypes && (
            <SubFilterSection label="Cafe style" hint="pick one or more">
              {CAFE_TYPES.map(c => (
                <FilterChip
                  key={c}
                  label={c}
                  selected={filters.cafeTypes.includes(c)}
                  onClick={() => toggleCafeType(c)}
                />
              ))}
            </SubFilterSection>
          )}

          {showBarTypes && (
            <SubFilterSection label="Bar type" hint="pick one or more">
              {BAR_TYPES.map(b => (
                <FilterChip
                  key={b}
                  label={b}
                  selected={filters.barTypes.includes(b)}
                  onClick={() => toggleBarType(b)}
                />
              ))}
            </SubFilterSection>
          )}

          <FilterSection label="Vibe">
            {VIBES.map(v => (
              <FilterChip
                key={v.value}
                label={v.label}
                selected={filters.vibe === v.value}
                onClick={() => setFilters({ ...filters, vibe: filters.vibe === v.value ? null : v.value })}
              />
            ))}
          </FilterSection>

        </div>

        {/* Right column: Budget, Location, Rating, Craving */}
        <div className="space-y-7 mt-7 lg:mt-0">

          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-3">Budget</p>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map(b => (
                <FilterChip
                  key={b.value}
                  label={b.label}
                  selected={filters.budget === b.value}
                  onClick={() => setFilters({ ...filters, budget: filters.budget === b.value ? null : b.value })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-3">Location</p>
            <input
              type="text"
              value={filters.suburb}
              onChange={e => {
                const suburb = e.target.value
                setFilters({ ...filters, suburb, radius: suburb ? filters.radius : 'anywhere' })
              }}
              placeholder="e.g. Fitzroy, South Yarra, CBD"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-charcoal placeholder-zinc-400 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400/30 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {RADII.map(r => (
                <FilterChip
                  key={r.value}
                  label={r.label}
                  selected={filters.radius === r.value}
                  onClick={() => setFilters({ ...filters, radius: r.value })}
                />
              ))}
            </div>
          </div>

          <FilterSection label="Minimum rating">
            {RATINGS.map(r => (
              <FilterChip
                key={r.value}
                label={r.label}
                selected={filters.minRating === r.value}
                onClick={() => setFilters({ ...filters, minRating: r.value })}
              />
            ))}
          </FilterSection>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-3">Craving something specific</p>
            <input
              type="text"
              value={filters.craving}
              onChange={e => setFilters({ ...filters, craving: e.target.value })}
              placeholder="e.g. truffle pasta, natural wine, banh mi"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-charcoal placeholder-zinc-400 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400/30 transition-colors"
            />
          </div>

        </div>
      </div>

      {error && (
        <p className="mt-5 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="mt-10">
        <button
          onClick={onFindPicks}
          disabled={isLoading}
          className="w-full py-4 bg-sage-500 text-cream font-medium rounded-2xl text-base tracking-wide transition-all duration-150 hover:bg-sage-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <><Spinner /> Finding your picks…</> : 'Find my picks →'}
        </button>
      </div>
    </div>
  )
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function SubFilterSection({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2 border-sage-100">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-1">
        {label}{' '}
        <span className="normal-case font-normal tracking-normal text-zinc-300">— {hint}</span>
      </p>
      <div className="flex flex-wrap gap-2 mt-2">{children}</div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}
