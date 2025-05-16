module.exports = {
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
        deepIndigo: '#493D9E',
      },
      borderRadius: {
        '2xl': '1rem',
      }
    }
  },
  darkMode: 'class', // Enables dark mode via class 'dark'
  plugins: [],
} 