import type { Metadata } from 'next'
import { Inter, Anton } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const anton = Anton({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-heading',
  display:  'swap',
})

export const metadata: Metadata = {
  title: 'Melbourne Picks',
  description: 'Discover new Melbourne restaurants and bars opening in 2025–2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <body className="font-sans antialiased bg-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
