/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0a0a14',
        primary: '#a855f7',
        'primary-light': '#ddb7ff',
        'primary-dark': '#7e22ce',
        secondary: '#06b6d4',
        'secondary-light': '#4cd7f6',
        accent: '#f472b6',
        surface: '#12121f',
        'surface-high': '#1f1e2b',
        'surface-highest': '#2a2938',
        'on-surface': '#e3e0f3',
        'on-surface-muted': '#9b91a8',
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 9s ease-in-out infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'blob':        'blob 8s infinite',
        'spin-slow':   'spin 20s linear infinite',
        'shimmer':     'shimmer 4s linear infinite',
        'slide-up':    'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'drift':       'drift 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(3deg)' },
          '50%':      { transform: 'translateY(-18px) rotateX(8deg)' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(6,182,212,0.2)' },
          '50%':      { textShadow: '0 0 35px rgba(168,85,247,0.7), 0 0 70px rgba(6,182,212,0.4)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)',         opacity: '0.15' },
          '33%':      { transform: 'translate(40px,-60px) scale(1.1)', opacity: '0.25' },
          '66%':      { transform: 'translate(-30px,30px) scale(0.9)', opacity: '0.12' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%':   { transform: 'translate(0,0) rotate(0deg)' },
          '33%':  { transform: 'translate(30px,-50px) rotate(120deg)' },
          '66%':  { transform: 'translate(-20px,20px) rotate(240deg)' },
          '100%': { transform: 'translate(0,0) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
