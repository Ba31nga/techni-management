/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f0f4f8',    // light background
        foreground: '#1f2937',    // dark text
        primary: '#1e40af',       // Israeli Air Force navy blue
        secondary: '#3b82f6',     // bright blue (Air Force accent)
        border: '#cbd5e1',        // light border
        'dark-border': '#475569', // dark mode border
      },
    },
  },
  plugins: [],
}
