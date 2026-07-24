/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        body: ['Kalam', 'Patrick Hand', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#0a0a0a',
        paper: '#fafaf7',
        'paper-dark': '#f0efe9',
        'gray-light': '#e5e3db',
        'gray-mid': '#9a968a',
        'gray-dark': '#4a4740',
      },
      borderRadius: {
        sketch: '4px 6px 3px 5px',
      },
    },
  },
  plugins: [],
};
