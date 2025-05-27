/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-once': 'pulse 1s ease-in-out 1',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8, boxShadow: '0 0 0 10px rgba(59, 130, 246, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};
