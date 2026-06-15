import type { NextConfig } from 'next'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read .env.local directly so the file value wins even when the shell
// has ANTHROPIC_API_KEY set to an empty string (which would otherwise shadow it).
function readEnvLocal(): Record<string, string> {
  try {
    const content = readFileSync(resolve(__dirname, '.env.local'), 'utf8')
    return Object.fromEntries(
      content
        .split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => {
          const [key, ...rest] = line.split('=')
          return [key.trim(), rest.join('=').trim()]
        })
    )
  } catch {
    return {}
  }
}

const envLocal = readEnvLocal()

const nextConfig: NextConfig = {
  env: {
    ANTHROPIC_API_KEY:    envLocal.ANTHROPIC_API_KEY    ?? '',
    GOOGLE_PLACES_API_KEY: envLocal.GOOGLE_PLACES_API_KEY ?? '',
  },
}

export default nextConfig
