export type Vibe =
  | 'casual'
  | 'date-night'
  | 'catch-up'
  | 'work-lunch'
  | 'celebration'
  | 'quick-bite'

export type Budget    = 'under-30' | '30-60' | 'splurge'
export type VenueType = 'all' | 'restaurants' | 'cafes' | 'bars'
export type Radius    = '1km' | '2km' | '5km' | '10km' | 'anywhere'
export type MinRating = 'any' | '3.5' | '4.0' | '4.5'

export interface Filters {
  vibe:      Vibe | null
  budget:    Budget | null
  type:      VenueType
  suburb:    string     // free text, e.g. "Fitzroy"
  radius:    Radius
  minRating: MinRating  // minimum Google rating threshold
  cuisines:  string[]
  cafeTypes: string[]
  barTypes:  string[]
  craving:   string     // optional free-text dish/craving
}

export interface TrendingVenue {
  id:            string
  name:          string
  description:   string
  cuisineType:   string
  neighbourhood: string
  priceRange:    string
  websiteUrl:    string
  googleRating:  number
  seenIn:        string
}

export interface Place {
  id:            string
  name:          string
  description:   string
  whyItMatches:  string
  cuisineType:   string
  neighbourhood: string
  priceRange:    string
  websiteUrl:    string
  googleRating:  number
  // match quality — set by the AI
  confidence?:   'exact' | 'close'
  // event-specific optional fields (only set when type === 'events')
  eventDate?:    string   // e.g. "26 Mar – 20 Apr 2025"
  ticketUrl?:    string   // direct ticket booking URL
  isEvent?:      boolean
}

export interface SearchMeta {
  relaxedFilters: string[]   // human-readable list of criteria that were loosened
}

export type SaveStatus = 'want-to-go' | 'been-there'

export interface SavedPlace extends Place {
  status:    SaveStatus
  rating?:   number
  savedAt:   string
}
