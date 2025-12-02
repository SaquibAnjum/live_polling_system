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
          light: '#8B7ED8',
          DEFAULT: '#6C5CE7',
          dark: '#5A4FCF',
        },
        secondary: {
          light: '#A29BFE',
          DEFAULT: '#6C5CE7',
          dark: '#5A4FCF',
        },
        accent: {
          light: '#FD79A8',
          DEFAULT: '#E84393',
          dark: '#D63031',
        },
        gray: {
          light: '#F8F9FA',
          DEFAULT: '#6C757D',
          dark: '#343A40',
        },
        success: {
          light: '#00B894',
          DEFAULT: '#00A085',
          dark: '#008F75',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 30px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(108, 92, 231, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}


