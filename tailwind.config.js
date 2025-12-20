/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'murdoku-teal': '#4ecdc4',
        'murdoku-dark': '#1a1a2e',
        'murdoku-pink': '#ff6b9d',
        'murdoku-green': '#7fb069',
        'murdoku-blue': '#4a90d9',
      },
    },
  },
  plugins: [],
};
