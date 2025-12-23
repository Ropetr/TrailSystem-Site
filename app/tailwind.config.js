/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DB2827',
          dark: '#3C3641',
        },
        // Cor Planac (baseada no vermelho TrailSystem)
        planac: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#DB2827',
          600: '#c32524',
          700: '#a82120',
          800: '#8d1b1a',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
}
