'use client'

export type Screen = 'discovery' | 'results' | 'trending' | 'saved'

interface NavProps {
  currentScreen: Screen
  onNavigate:    (screen: Screen) => void
  savedCount:    number
}

export default function Nav({ currentScreen, onNavigate, savedCount }: NavProps) {
  const isDiscover = currentScreen === 'discovery' || currentScreen === 'results'

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-3xl lg:max-w-5xl bg-cream/90 backdrop-blur-md border-t border-zinc-100">
      <div className="flex pb-2 max-w-[430px] md:mx-auto">
        {/* Discover */}
        <button
          onClick={() => onNavigate('discovery')}
          className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-colors ${
            isDiscover ? 'text-terracotta-500' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <DiscoverIcon />
          <span className="text-[10px] font-semibold tracking-widest uppercase">Discover</span>
        </button>

        {/* Trending */}
        <button
          onClick={() => onNavigate('trending')}
          className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-colors ${
            currentScreen === 'trending' ? 'text-terracotta-500' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <TrendingIcon />
          <span className="text-[10px] font-semibold tracking-widest uppercase">Trending</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => onNavigate('saved')}
          className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-colors relative ${
            currentScreen === 'saved' ? 'text-terracotta-500' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <BookmarkIcon />
          {savedCount > 0 && (
            <span className="absolute top-2.5 right-[calc(50%-18px)] min-w-4 h-4 bg-terracotta-500 text-cream text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
          <span className="text-[10px] font-semibold tracking-widest uppercase">Saved</span>
        </button>
      </div>
    </nav>
  )
}

function DiscoverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
