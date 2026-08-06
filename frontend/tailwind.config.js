/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        card: '#0f172a',
        'card-border': 'rgba(255, 255, 255, 0.08)',
        cyan: {
          400: '#38bdf8',
          500: '#06b6d4',
          accent: '#00f3ff',
        },
        purple: {
          500: '#a855f7',
          600: '#9333ea',
          accent: '#b55fe6',
        },
        pink: {
          500: '#ec4899',
          accent: '#ff2e93',
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at top, rgba(147, 51, 234, 0.18) 0%, rgba(6, 182, 212, 0.12) 50%, rgba(9, 13, 22, 1) 100%)',
        'glow-gradient': 'linear-gradient(135deg, #00f3ff 0%, #a855f7 50%, #ec4899 100%)',
        'glass-card': 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 243, 255, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
