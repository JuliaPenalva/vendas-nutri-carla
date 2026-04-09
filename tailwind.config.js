/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        bg: '#F5F0E8',
        surface: '#EDE7DA',
        card: '#FDFAF5',
        border: '#D6CDB8',
        accent: '#0F482F',
        'accent-light': '#779E39',
        cream: '#3a2e1e',
        peach: '#E5AB7E',
        success: '#4a7a20',
        danger: '#b03020',
        warn: '#c8874a',
        muted: '#8a7a60',
        text: '#2a2018',
        'text-dim': '#6b5d45',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(15,72,47,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,72,47,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      }
    },
  },
  plugins: [],
}
