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
        terracotta: {
          50:  '#fdf3ee',
          100: '#fae3d5',
          200: '#f5c7aa',
          300: '#eda37a',
          400: '#e37649',
          500: '#D4714A',
          600: '#c25a35',
          700: '#a2452a',
          800: '#833927',
          900: '#6b3124',
        },
        cream:    '#FAFAF8',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
