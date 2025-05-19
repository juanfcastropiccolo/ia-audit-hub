/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        softYellow: '#FFF2AF',
        lavenderMist: '#DAD2FF',
        purpleTint: '#B2A5FF',
        indigo: '#493D9E',
        primary: '#493D9E',
        secondary: '#B2A5FF',
        accent: '#FFF2AF',
        'soft-background': '#ECEFCA',
        'neutral-gray': '#8E9196',
        'deep-indigo': '#1A1F2C',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
