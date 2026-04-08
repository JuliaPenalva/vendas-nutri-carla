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
        bg: '#080c14',
        surface: '#0e1420',
        card: '#131928',
        border: '#1e2a3a',
        accent: '#00d4ff',
        'accent-dim': '#0099bb',
        success: '#00e5a0',
        danger: '#ff4757',
        warn: '#ffa502',
        muted: '#4a6080',
        text: '#e2eaf5',
        'text-dim': '#8aa0be',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
