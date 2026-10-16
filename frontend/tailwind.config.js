/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Light Theme Colors
        primary: {
          DEFAULT: '#17365D',
          light: '#1e4a7a',
          dark: '#0f243e',
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#17365D',
        },
        secondary: {
          DEFAULT: '#2878C8',
          light: '#4a90d8',
          dark: '#1e5a9e',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#fbbf24',
          dark: '#d97706',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#16a34a',
          dark: '#14532d',
        },
        // Legacy colors (keep for compatibility during transition)
        primaryDark: '#17365D',
        accentLight: '#F59E0B',
        warm: {
          DEFAULT: '#F59E0B',
          light: '#fbbf24',
          dark: '#d97706',
        },
        // Semantic backgrounds
        background: {
          primary: '#FFFFFF',
          secondary: '#F3F8FD',
          tertiary: '#E2E8F0',
        },
        text: {
          primary: '#1F2937',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
          dark: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(23, 54, 93, 0.08), 0 4px 16px -4px rgba(23, 54, 93, 0.06)',
        'card': '0 1px 3px 0 rgba(23, 54, 93, 0.08), 0 1px 2px -1px rgba(23, 54, 93, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(23, 54, 93, 0.12), 0 2px 8px -2px rgba(23, 54, 93, 0.08)',
        'elevated': '0 10px 40px -10px rgba(23, 54, 93, 0.15), 0 4px 20px -4px rgba(23, 54, 93, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}