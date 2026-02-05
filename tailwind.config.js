/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        paper: 'var(--bg-paper)',
        dark: 'var(--dark)',
        text: 'var(--text)',
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
