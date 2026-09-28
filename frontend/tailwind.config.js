/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '100%': { transform: 'translateX(100%) skewX(-12deg)' },
        },
      },
      animation: {
        shine: 'shine 0.8s ease-out',
      },
    },
  },
  plugins: [],
}