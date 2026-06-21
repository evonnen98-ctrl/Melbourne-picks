import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const dmSerif = DM_Serif_Display({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-dm-serif',
  display:  'swap',
})

export const metadata: Metadata = {
  title: 'Melbourne Picks',
  description: 'Discover new Melbourne restaurants and bars opening in 2025–2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased bg-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
