/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black:  '#0A0906',
        gold:   '#C9A84C',
        cream:  '#F5F0E8',
        dark:   '#1A1410',
        mid:    '#2C1F0F',
        muted:  '#8A7A6A',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
