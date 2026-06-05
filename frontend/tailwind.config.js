/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',      // Slate 900
        darkPanel: '#1e293b',   // Slate 800
        darkBorder: '#334155',  // Slate 700
        accentGreen: '#10b981', // Emerald 500
        accentRed: '#ef4444',   // Red 500
        accentBlue: '#3b82f6',  // Blue 500
        accentYellow: '#f59e0b',// Amber 500
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
