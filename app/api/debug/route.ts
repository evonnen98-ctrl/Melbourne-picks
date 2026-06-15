import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const placesKey    = process.env.GOOGLE_PLACES_API_KEY

  // Show key shape without revealing the value
  const keyInfo = (k: string | undefined) =>
    k ? `set (${k.length} chars, starts: ${k.slice(0, 7)}...)` : 'MISSING'

  let claudeError: string | null = null
  try {
    const client = new Anthropic({ apiKey: anthropicKey })
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'say hi' }],
    })
    claudeError = null
  } catch (e) {
    claudeError = e instanceof Error ? e.message : String(e)
  }

  // List all env var NAMES visible at runtime (no values)
  const allKeys = Object.keys(process.env).sort()

  return NextResponse.json({
    anthropicKey: keyInfo(anthropicKey),
    placesKey:    keyInfo(placesKey),
    claudeError,
    env:          process.env.NODE_ENV,
    allEnvKeys:   allKeys,
  })
}
