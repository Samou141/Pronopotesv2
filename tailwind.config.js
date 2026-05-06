/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          card: '#162032',
        },
        accent: {
          cyan: '#22d3ee',
          'cyan-dark': '#06b6d4',
          violet: '#a78bfa',
          'violet-dark': '#8b5cf6',
          emerald: '#34d399',
          'emerald-dark': '#10b981',
          pink: '#f472b6',
          'pink-dark': '#ec4899',
        },
        neon: {
          red: '#ef4444',
          orange: '#f97316',
          green: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
