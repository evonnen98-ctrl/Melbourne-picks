'use client'

import Image from 'next/image'

export default function HomeScreen() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image src="/5julie.png" alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-espresso/30" />

      {/* Centered headline */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <h1 className="font-heading text-cream text-center text-7xl md:text-8xl lg:text-9xl uppercase tracking-[-0.03em] leading-[1.05]">
          My Next<br />Spot
        </h1>
      </div>

      {/* Scroll down CTA */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <a
          href="#discover"
          className="text-[11px] tracking-widest text-cream/60 uppercase hover:text-cream/90 transition-colors flex flex-col items-center gap-1"
        >
          Scroll down
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
