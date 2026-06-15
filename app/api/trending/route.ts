import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60
export const revalidate  = 3600   // cache the result for 1 hour; only calls Claude on first request per hour

export async function GET() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system:
        'You are a helpful assistant that returns only valid JSON. Never include any text outside the JSON array.',
      messages: [
        {
          role: 'user',
          content: `You are a well-connected Melbourne local who reads Broadsheet, Time Out Melbourne, Concrete Playground, The Urban List, and Good Food Guide obsessively and always knows what's new and exciting in the city's food and bar scene.

Curate 8 Melbourne restaurants and bars that have either opened recently (in the last 3–6 months of 2025) or have gained significant new buzz and editorial attention in 2025-2026. These should be the places Melbourne food lovers are actively talking about right now — newly opened, freshly reviewed, or venues experiencing a surge in bookings and word-of-mouth. Prioritise recency and current buzz over general reputation. Mix restaurants and bars, different neighbourhoods, different price points.

CRITICAL — operating status: Only recommend venues that are currently open and operating as of 2025-2026. Do NOT recommend any venue that has permanently closed, is temporarily closed, or has uncertain operating status. Only include venues you have high confidence are currently active and trading.

For each venue, assign the single publication it is most strongly associated with or would most naturally appear in.

Return ONLY a JSON array with exactly 8 objects. No other text before or after the array.

Only include venues with a Google rating of 4.3 or above — these must be genuinely well-regarded, buzzy places with real critical acclaim and active word-of-mouth.

Each object must have:
- id: kebab-case string from the venue name
- name: venue name
- description: one punchy sentence that captures what makes it unmissable
- cuisineType: type of food or drink
- neighbourhood: specific Melbourne suburb
- priceRange: "$", "$$", "$$$", or "$$$$"
- seenIn: exactly one of "Broadsheet", "Time Out Melbourne", "Concrete Playground", "The Urban List", "Good Food Guide"
- websiteUrl: the venue's actual website URL (e.g. "https://tipo00.com.au") — use your best knowledge; if genuinely unsure use ""
- googleRating: the venue's approximate Google rating as a number between 4.3 and 5.0 (e.g. 4.7)

Example (follow this structure exactly):
[
  {
    "id": "tipo-00",
    "name": "Tipo 00",
    "description": "Melbourne's most beloved pasta bar, where the handmade pasta and natural wine list set the standard for the whole city.",
    "cuisineType": "Italian, handmade pasta",
    "neighbourhood": "CBD",
    "priceRange": "$$",
    "seenIn": "Broadsheet",
    "websiteUrl": "https://tipo00.com.au",
    "googleRating": 4.7
  }
]`,
        },
      ],
    })

    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')

    const text  = block.text.trim()
    const start = text.indexOf('[')
    const end   = text.lastIndexOf(']') + 1
    if (start === -1 || end === 0) throw new Error('No JSON array in response')

    const venues = JSON.parse(text.slice(start, end))
    return NextResponse.json({ venues })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Trending error:', msg)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? msg : 'Failed to load trending venues' },
      { status: 500 }
    )
  }
}
