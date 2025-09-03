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
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      screens: {
        'ipad-mini': '768px',
        'ipad': '1024px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
