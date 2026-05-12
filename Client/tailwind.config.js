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
          DEFAULT: '#5A67D8',
          dark: '#4C51BF',
          light: '#7F9CF5',
        },
        sidebar: {
          bg: '#7C83C3',
          active: '#6B7280', // placeholder
        },
        dashboard: {
          bg: '#F3F4F6',
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

