/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zelqia: {
          bg: '#0B0B0B',
          card: '#141414',
          cardElevated: '#1A1A1A',
          gold: '#E5B25D',
          goldLight: '#F3D293',
          goldDark: '#B88632',
          ivory: '#F5F5F7',
          muted: '#8E8E93',
          border: 'rgba(229, 178, 93, 0.22)'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};