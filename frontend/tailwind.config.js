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
          DEFAULT: '#0d47a1',
          dark: '#1a237e',
          light: '#e3f2fd',
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0d47a1',
          600: '#0c3e8e',
          700: '#1a237e',
          800: '#151c65',
          900: '#10164e',
        },
        primaryDark: '#1a237e',
        accent: {
          DEFAULT: '#c62828',
          light: '#ef5350',
          dark: '#b71c1c',
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#c62828',
          600: '#b71c1c',
        },
        accentLight: '#ef5350',
        warm: {
          DEFAULT: '#ff8f00',
          light: '#ffb74d',
          dark: '#f57c00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
