/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0061E0',
          dark: '#004BB5',
          light: '#3B82F6',
        },
        success: '#22C55E',
        sidebar: {
          bg: '#0061E0',
          active: '#004BB5',
        },
        dashboard: {
          bg: '#F4F7FE',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

