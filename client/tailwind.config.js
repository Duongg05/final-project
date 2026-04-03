/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#3D2B1F',      // Dark Chocolate Sidebar
          cream: '#FAF5F0',      // Warm Beige Background
          soft: '#FDFBF9',       // Near White Card background
          accent: '#7D5A44',     // Earthy Accent
          muted: '#8C7B6E',      // Muted Brown for text
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
