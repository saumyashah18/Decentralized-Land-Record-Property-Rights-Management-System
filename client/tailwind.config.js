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
