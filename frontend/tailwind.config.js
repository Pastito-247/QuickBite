/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00',
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#FF7A00',
          600: '#e66e00',
          700: '#cc6200',
          800: '#a34e00',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          50: '#eef2f5',
          100: '#dce4ec',
          500: '#2C3E50',
          600: '#34495e',
          800: '#212f3d',
          900: '#1a252f',
        },
        accent: {
          DEFAULT: '#27AE60',
          50: '#e9f7ef',
          100: '#d4efdf',
          500: '#27AE60',
          600: '#229954',
          800: '#1e8449',
        },
        alert: {
          DEFAULT: '#E74C3C',
          50: '#fdedec',
          100: '#f9ebea',
          500: '#E74C3C',
          600: '#cb4335',
          800: '#b03a2e',
        },
        appbg: '#F8F9FA'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
