/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6a11cb',
        'secondary': '#2575fc',
        'light-bg': 'rgba(255, 255, 255, 0.1)',
        'light-border': 'rgba(255, 255, 255, 0.2)',
        'dark-text': '#e0e0e0',
        'primary-text': '#ffffff',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(4px)',
      },
    },
  },
  plugins: [],
}