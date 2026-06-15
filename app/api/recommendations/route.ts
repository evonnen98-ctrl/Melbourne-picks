import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { Filters } from '@/lib/types'

export const maxDuration = 60

// ─── Google Places types ───────────────────────────────────────────────────────

interface GoogleReview {
  text?:   { text: string; languageCode?: string }
  rating?: number
}

interface GooglePlace {
  id:               string
  displayName?:     { text: string }
  formattedAddress?: string
  rating?:          number
  userRatingCount?: number
  websiteUri?:      string
  types?:           string[]
  businessStatus?:  string
  reviews?:         GoogleReview[]
}

// ─── API handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const {
      filters,
      count = 3,
      excludeNames = [],
    }: { filters: Filters; count: number; excludeNames: string[] } = await request.json()

    // Fetch real venue data from Google Places first (falls back to [] if no key)
    const googlePlaces = await searchGooglePlaces(filters).catch(() => [])

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     'You are a Melbourne, Australia dining and bar guide. You ONLY recommend venues physically located in Melbourne, Victoria, Australia. Return only valid JSON with no text outside the JSON object.',
      messages:   [{ role: 'user', content: buildPrompt(filters, count, excludeNames, googlePlaces) }],
    })

    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')

    const text = block.text.trim()

    const objStart = text.indexOf('{')
    const objEnd   = text.lastIndexOf('}') + 1
    if (objStart === -1 || objEnd === 0) {
      throw new Error(`No JSON object in response. Raw: ${text.substring(0, 200)}`)
    }

    const result     = JSON.parse(text.slice(objStart, objEnd))
    const places     = Array.isArray(result.places) ? result.places.slice(0, count) : []
    const searchMeta = result.searchMeta ?? { relaxedFilters: [] }

    return NextResponse.json({ places, searchMeta })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Recommendations error:', message)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

// ─── Google Places helpers ─────────────────────────────────────────────────────

/** Approximate centre coordinates for common Melbourne suburbs */
const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  'cbd':              { lat: -37.8136, lng: 144.9631 },
  'melbourne':        { lat: -37.8136, lng: 144.9631 },
  'docklands':        { lat: -37.8151, lng: 144.9451 },
  'southbank':        { lat: -37.8236, lng: 144.9631 },
  'south melbourne':  { lat: -37.8326, lng: 144.9589 },
  'port melbourne':   { lat: -37.8359, lng: 144.9391 },
  'fitzroy':          { lat: -37.7991, lng: 144.9784 },
  'collingwood':      { lat: -37.8044, lng: 144.9894 },
  'abbotsford':       { lat: -37.8030, lng: 144.9993 },
  'clifton hill':     { lat: -37.7902, lng: 144.9970 },
  'carlton':          { lat: -37.8010, lng: 144.9650 },
  'brunswick':        { lat: -37.7696, lng: 144.9612 },
  'northcote':        { lat: -37.7720, lng: 145.0010 },
  'thornbury':        { lat: -37.7575, lng: 145.0021 },
  'richmond':         { lat: -37.8183, lng: 145.0013 },
  'hawthorn':         { lat: -37.8225, lng: 145.0342 },
  'south yarra':      { lat: -37.8399, lng: 144.9876 },
  'prahran':          { lat: -37.8465, lng: 144.9901 },
  'windsor':          { lat: -37.8534, lng: 144.9896 },
  'st kilda':         { lat: -37.8678, lng: 144.9806 },
  'elwood':           { lat: -37.8849, lng: 144.9848 },
  'footscray':        { lat: -37.8017, lng: 144.8997 },
  'yarraville':       { lat: -37.8163, lng: 144.8939 },
  'williamstown':     { lat: -37.8654, lng: 144.8996 },
}

function getSuburbCoords(suburb: string): { lat: number; lng: number } {
  const key = suburb.toLowerCase().trim()
  if (SUBURB_COORDS[key]) return SUBURB_COORDS[key]
  for (const [k, v] of Object.entries(SUBURB_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return SUBURB_COORDS['cbd']
}

function getRadiusMeters(radius: string, hasSuburb: boolean): number {
  if (!hasSuburb) return 30000
  switch (radius) {
    case '1km':  return 1500
    case '2km':  return 2500
    case '5km':  return 6000
    case '10km': return 11000
    default:     return 30000
  }
}

/** Build a Google Places text search query from the active filters */
function buildPlacesQuery(filters: Filters): string {
  const parts: string[] = []

  if (filters.barTypes?.length > 0) {
    parts.push(filters.barTypes.join(' '))
  } else if (filters.cafeTypes?.length > 0) {
    parts.push(filters.cafeTypes.join(' '))
  } else if (filters.cuisines?.length > 0) {
    parts.push(filters.cuisines[0], 'restaurant')
  } else if (filters.type === 'bars')        parts.push('bar')
  else if  (filters.type === 'cafes')        parts.push('cafe')
  else if  (filters.type === 'restaurants')  parts.push('restaurant')
  else                                       parts.push('restaurant bar cafe')

  if (filters.craving?.trim()) parts.push(filters.craving.trim())

  parts.push('Melbourne')
  if (filters.suburb) parts.push(filters.suburb)

  return parts.join(' ')
}

/** Call the Google Places (New) Text Search API and return operational venues */
async function searchGooglePlaces(filters: Filters): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return []

  const query        = buildPlacesQuery(filters)
  const coords       = filters.suburb ? getSuburbCoords(filters.suburb) : getSuburbCoords('cbd')
  const radiusMeters = getRadiusMeters(filters.radius, !!filters.suburb)

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method:  'POST',
    headers: {
      'Content-Type':     'application/json',
      'X-Goog-Api-Key':   apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.userRatingCount',
        'places.websiteUri',
        'places.types',
        'places.businessStatus',
        'places.reviews',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery:      query,
      maxResultCount: 20,   // fetch plenty so Claude can pick the best
      languageCode:   'en',
      regionCode:     'AU',
      locationBias: {
        circle: {
          center: { latitude: coords.lat, longitude: coords.lng },
          radius: radiusMeters,
        },
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('Google Places API error:', res.status, errText)
    return []
  }

  const data = await res.json()
  return ((data.places ?? []) as GooglePlace[]).filter(
    p => !p.businessStatus || p.businessStatus === 'OPERATIONAL'
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ratingThreshold(minRating: Filters['minRating']): string | null {
  if (!minRating || minRating === 'any') return null
  return minRating
}

function stepDownRating(minRating: string): string {
  const steps: Record<string, string> = { '4.5': '4.0', '4.0': '3.5', '3.5': 'any rating' }
  return steps[minRating] ?? 'a lower rating'
}

// ─── Response format ───────────────────────────────────────────────────────────

function responseFormatVenues(count: number, minRating: string | null): string {
  const ratingNote = minRating
    ? `Prefer venues with a Google rating of ${minRating} or above`
    : 'When choosing between otherwise equal options, prefer higher-rated venues'

  const relaxedExample = minRating
    ? `"Included a venue rated ${stepDownRating(minRating)}+ (slightly below the requested ${minRating}+)"`
    : '"Expanded search area slightly to find more options"'

  return `
Return ONLY a valid JSON object — no text before or after, no comments inside:

{"places":[…],"searchMeta":{"relaxedFilters":[…]}}

Expanded:
{
  "places": [up to ${count} venue objects — fewer only if the location filter genuinely limits options],
  "searchMeta": {
    "relaxedFilters": [
      one string per criterion you had to loosen, e.g.:
      "Expanded search area slightly beyond the requested suburb",
      ${relaxedExample}
      Leave as [] when all results exactly match.
    ]
  }
}

Each venue object — exact fields, no extras, no omissions:
{
  "id":            "kebab-case-venue-name",
  "name":          "Venue Name",
  "description":   "One punchy sentence — what makes it worth visiting",
  "whyItMatches":  "One sentence grounded in real review text or a confirmed fact — quote or paraphrase what customers actually say about a specific dish, drink, or detail (e.g. 'Reviewers rave about the aged beef tartare and the 80-bottle natural wine list' or 'Regulars say the laminated croissants sell out by 9am'). Never generic — no 'great atmosphere' or 'perfect for the occasion' without a concrete, verifiable detail drawn from the reviews provided.",
  "cuisineType":   "Type of food or drink",
  "neighbourhood": "Specific Melbourne suburb",
  "priceRange":    "$" | "$$" | "$$$" | "$$$$",
  "websiteUrl":    "https://… or empty string if unknown",
  "googleRating":  4.5,
  "confidence":    "exact" | "close"
}

Rating guidance: ${ratingNote}

When you cannot find ${count} exact matches:
• Non-location filters (vibe, budget, style): fill with close matches, note what you relaxed
• Location: do NOT pad with the wrong suburb — return fewer and note it in relaxedFilters
• Use confidence "close" for any result where you relaxed a criterion
• Return places:[] only if you genuinely cannot find any matching venue`
}

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(
  filters:      Filters,
  count:        number,
  excludeNames: string[],
  googlePlaces: GooglePlace[],
): string {
  const threshold = ratingThreshold(filters.minRating)

  // ── Preference lines ────────────────────────────────────────────────────────
  const lines: string[] = []

  if (filters.vibe) {
    const vibeDesc: Record<string, string> = {
      'casual':      'casual and relaxed — laid-back, no dress code, neighbourhood feel',
      'date-night':  'date night — intimate atmosphere, impressive without being stuffy',
      'catch-up':    'catch-up with friends — convivial, sociable, easy to share plates and linger',
      'work-lunch':  'takeaway or quick work lunch — think banh mi, poke bowl, sandwich, rice paper rolls, sushi, noodle box; prioritise counter service or grab-and-go spots where you order at the counter or window; budget-friendly, fast turnover, no need to book',
      'celebration': 'special occasion or celebration — impressive, memorable, great energy',
      'quick-bite':  'quick grab-and-go eat at any time of day — fast counter service or takeaway; a burger, taco, slice, kebab, dumpling or anything where you\'re in and out without a reservation; speed and quality over atmosphere',
    }
    lines.push(
      `• Preferred atmosphere: ${vibeDesc[filters.vibe] ?? filters.vibe}` +
      `\n  (Soft preference — great venues with a slightly different vibe still count.)`
    )
  }

  if (filters.budget === 'under-30') lines.push('• Budget: under $30 per person')
  if (filters.budget === '30-60')    lines.push('• Budget: $30–60 per person')
  if (filters.budget === 'splurge')  lines.push('• Budget: splurge / fine dining, price no object')

  if (filters.type === 'restaurants') lines.push('• Type: restaurants (not bars or cafes)')
  if (filters.type === 'cafes')       lines.push('• Type: cafes — coffee, brunch, bakeries (not restaurants or bars)')
  if (filters.type === 'bars')        lines.push('• Type: bars and drinking venues (not restaurants or cafes)')

  // Sub-filters: strong hints, not hard gates
  if (filters.cuisines?.length > 0)
    lines.push(`• Cuisine preference: ${filters.cuisines.join(' or ')} — lean toward these; outstanding nearby cuisines also welcome`)
  if (filters.cafeTypes?.length > 0)
    lines.push(`• Cafe style preference: ${filters.cafeTypes.join(' or ')} — lean toward these; a cafe fitting the spirit counts even if the label differs slightly`)
  if (filters.barTypes?.length > 0)
    lines.push(`• Bar style preference: ${filters.barTypes.join(' or ')} — lean toward these; a bar with a serious programme in the requested style counts even under a different label`)

  if (filters.suburb) {
    if (!filters.radius || filters.radius === 'anywhere') {
      lines.push(
        `• Location: venues must be physically in ${filters.suburb}, Melbourne. ` +
        `Do NOT substitute neighbouring suburbs. Return fewer results rather than padding with the wrong suburb.`
      )
    } else {
      lines.push(
        `• Location: within ${filters.radius} of ${filters.suburb}, Melbourne. ` +
        `Prioritise venues closest to ${filters.suburb}. Note any expansion in relaxedFilters.`
      )
    }
  }

  if (filters.craving?.trim()) {
    lines.push(`• Craving: "${filters.craving.trim()}" — prioritise venues known for this`)
  }

  const prefs = lines.length > 0
    ? lines.join('\n')
    : '• No specific preferences — give your top picks across Melbourne'

  const excludeClause = excludeNames.length > 0
    ? `\nDo NOT suggest any of these already-recommended venues:\n${excludeNames.map(n => `• ${n}`).join('\n')}\n`
    : ''

  // ── Google Places venue list ─────────────────────────────────────────────────
  const venueContext = googlePlaces.length > 0
    ? [
        '',
        'REAL VENUES from Google Places for this search (use as your primary source):',
        googlePlaces.map(p => {
          const name    = p.displayName?.text ?? ''
          const address = p.formattedAddress ?? ''
          const rating  = p.rating
            ? `${p.rating}★ (${(p.userRatingCount ?? 0).toLocaleString()} reviews)`
            : 'unrated'
          const site    = p.websiteUri ? ` | ${p.websiteUri}` : ''
          // Include up to 3 review snippets (English only, non-trivial length)
          const reviewSnippets = (p.reviews ?? [])
            .filter(r => r.text?.text && r.text.text.length > 30 && (!r.text.languageCode || r.text.languageCode.startsWith('en')))
            .slice(0, 3)
            .map(r => `    - "${r.text!.text!.replace(/\n/g, ' ').trim()}"`)
            .join('\n')
          return `  • ${name} | ${address} | ${rating}${site}${reviewSnippets ? '\n' + reviewSnippets : ''}`
        }).join('\n'),
        '',
        `Select the best ${count} from this list. You may add other well-known venues not on the list if they are highly relevant, but always prioritise the Google-verified venues above — they are real, currently operating, and accurately rated.`,
        `For "whyItMatches", draw directly from the review snippets above — quote or paraphrase what real customers say about a specific dish, drink, or detail. If no reviews are available for a venue, use only what you know with certainty (e.g. a confirmed signature dish). Never invent specifics.`,
        '',
      ].join('\n')
    : ''

  return `You are a Melbourne local with encyclopedic knowledge of Melbourne's entire dining and bar scene. You only recommend venues inside Melbourne, Australia.

Think of this like a Google search with a few helpful hints. The preferences below are signals, not hard filters — an excellent venue matching most of them beats a mediocre one matching all. Location is the only strict filter.
${venueContext}
Preferences:
${prefs}
${excludeClause}
Rules:
• LOCATION CRITICAL: Every venue must be physically in Melbourne, Victoria, Australia.
• SUBURB FILTER IS STRICT: Only return venues in the requested suburb. Better to return fewer than to pad with the wrong suburb. Always note expansion in relaxedFilters.
• When a km radius IS specified, you may extend slightly; always note expansion in relaxedFilters.
• Avoid venues you have strong reason to believe are permanently closed.
• Neighbourhood gems and lesser-known spots with strong ratings are equally valid to press-covered venues.
• Treat vibe, cuisine, and style as soft preferences — great venues fitting the spirit count.

Find the ${count} best-matching Melbourne venue${count > 1 ? 's' : ''}. Aim for exactly ${count} results — only return fewer when the location filter makes it genuinely impossible.

BEFORE responding: verify every venue is physically in Melbourne, Australia. Remove any that are not.

${responseFormatVenues(count, threshold)}`
}
