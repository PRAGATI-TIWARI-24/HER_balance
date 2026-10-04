/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Main Color Palette Tokens ──
        bordeaux: {
          DEFAULT: '#5B0015',
          dark: '#450010',
          light: '#720b22',
        },
        horizon: {
          DEFAULT: '#80AEE8',
          light: '#A5C7F0',
          dark: '#5D93D8',
        },
        ivory: {
          DEFAULT: '#F7F2E0',
          dark: '#EDE5CD',
          light: '#FCFBF5',
        },

        // ── Direct Theme Semantic Mappings (High Contrast & Readability) ──
        brand: {
          primary: '#5B0015',      // Night Bordeaux (Primary Text, Buttons, Deep Accents)
          secondary: '#80AEE8',    // Cool Horizon (Active Indicators, Highlights)
          surface: '#FCFBF5',      // Clean Card Contrast Surface
          bg: '#F7F2E0',           // Ivory Mist (Main Background)
          border: '#EDE5CD',       // Neutral Contrast Border
          muted: '#6B2333',        // Readable Muted Text
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}