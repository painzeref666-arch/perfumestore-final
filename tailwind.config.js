/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        foreground: '#0F0D0A',
        primary: {
          DEFAULT: '#C9974A',
          dark: '#8B5E2A',
          light: '#E8C98A',
        },
        accent: '#2A1F14',
        muted: '#7A6A58',
        border: '#E8DDD0',
        card: '#FFFFFF',
        'earth-950': '#0F0D0A',
        'earth-800': '#2A1F14',
        'earth-600': '#7A6A58',
        'earth-200': '#E8DDD0',
        'earth-50': '#FAF7F2',
        'amber-gold': '#C9974A',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};