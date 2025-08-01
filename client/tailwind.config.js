/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4F46E5',
        'secondary': '#1E3A8A',
        'light-bg': 'rgba(17, 24, 39, 0.1)',
        'light-border': 'rgba(255, 255, 255, 0.15)',
        'dark-text': '#e0e0e0',
        'primary-text': '#F3F4F6',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(5px)',
      },
    },
  },
  plugins: [],
}