/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: '#1A1A1A',
        cream: '#F7F7F5',
        indigo: {
          DEFAULT: '#3B4B8C',
          dark: '#2E3B70',
        },
        amber: {
          DEFAULT: '#E8A33D',
        },
      },
    },
  },
  plugins: [],
};
