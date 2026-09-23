/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vanilla: '#FFF7E6',
        blush: '#F7C8D3',
        rosewood: '#B46A72',
        sage: '#A8B58A',
        misty: '#A9B7C6',
        midnight: '#2D3A47',
      }
    },
  },
  plugins: [],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}