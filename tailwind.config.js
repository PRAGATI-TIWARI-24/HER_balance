/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          primary: '#0F766E',
          accent: '#E11D48',
          textMain: '#1E293B',
          textMuted: '#64748B',
          warning: '#F59E0B',
          success: '#10B981',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}