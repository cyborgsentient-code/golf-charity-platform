/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          green:  '#00ff87',
          cyan:   '#00e5ff',
          magenta:'#ff00c8',
          yellow: '#ffe600',
        },
        dark: {
          950: '#030712',
          900: '#0a0a1a',
          800: '#0f0f2e',
          700: '#1a1a3e',
          600: '#252550',
        },
      },
      boxShadow: {
        'neon-green':   '0 0 20px rgba(0,255,135,0.4), 0 0 60px rgba(0,255,135,0.15)',
        'neon-cyan':    '0 0 20px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.15)',
        'neon-magenta': '0 0 20px rgba(255,0,200,0.4), 0 0 60px rgba(255,0,200,0.15)',
        'glow-sm':      '0 0 10px rgba(0,255,135,0.3)',
        'glass':        '0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'cyber-hero':    'linear-gradient(135deg, #030712 0%, #030712 50%, #070d1a 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00ff87, #00e5ff)',
        'magenta-gradient': 'linear-gradient(135deg, #ff00c8, #7c3aed)',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 4vw, 3.5rem)',   { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)',{ lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.02em',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'blur-in':    'blurIn 0.7s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(0,255,135,0.4)' },
          '50%':     { boxShadow: '0 0 40px rgba(0,255,135,0.8), 0 0 80px rgba(0,255,135,0.3)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blurIn: {
          '0%':   { opacity: '0', filter: 'blur(12px)', transform: 'translateY(20px)' },
          '100%': { opacity: '1', filter: 'blur(0px)',  transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
