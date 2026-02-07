/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Slate 900
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
        primary: {
          DEFAULT: '#3B82F6', // Blue 500
          hover: '#60A5FA',   // Blue 400
          glow: 'rgba(59, 130, 246, 0.5)'
        },
        text: {
          main: '#F8FAFC',    // Slate 50
          muted: '#94A3B8'    // Slate 400
        }
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'fade-in': 'fadeIn 1s ease-in forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
