import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:    '#F7EFE2',
        espresso: '#2E2118',
        olive:    '#8C8470',
        sand:     '#EAE2D2',
        charcoal: '#1A1A1A',
        sage: {
          50:  '#DCE3C9',
          100: '#BFCBA9',
          400: '#8A9D6A',
          500: '#6F7D52',
          600: '#5A6843',
          800: '#3C4831',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)',    'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
