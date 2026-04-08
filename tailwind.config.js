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
        bg: '#1a1f14',
        surface: '#222818',
        card: '#2a3020',
        border: '#3a4a2a',
        accent: '#0F482F',
        'accent-light': '#779E39',
        cream: '#EBE2D9',
        peach: '#E5AB7E',
        success: '#779E39',
        danger: '#c0392b',
        warn: '#E5AB7E',
        muted: '#6b7a5a',
        text: '#EBE2D9',
        'text-dim': '#a8b090',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(119,158,57,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(119,158,57,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
