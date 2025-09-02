/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#fdf8f3',
          100: '#f8eed6',
          200: '#f1d9a3',
          300: '#e9c46a',
          400: '#d4a574',
          500: '#c8956d',
          600: '#b8845f',
          700: '#9a6f4f',
          800: '#7d5a43',
          900: '#654a37',
        },
        custom: {
          bg: 'var(--custom-bg)',
          text: 'var(--custom-text)',
        }
      },
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
