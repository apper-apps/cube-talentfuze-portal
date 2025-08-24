/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#06B6D4',
      },
    },
  },
  plugins: [],
}