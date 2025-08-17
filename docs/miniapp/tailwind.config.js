/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens for Neo-Solarpunk Holographic
        'bg-0': '#0B1020',
        'bg-1': '#0F1A2A',
        'glow-1': '#66F7D5',
        'glow-2': '#A6B4FF',
        'accent': '#FFE27A',
        'glass': 'rgba(255, 255, 255, 0.08)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'neon-glow': 'rgba(166, 180, 255, 0.18)',
      },
      fontFamily: {
        'display': ['Inter Tight', 'Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'artdeco': ['Cormorant Garamond', 'serif'],
        'synthwave': ['Orbitron', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'elev-1': '0 6px 18px rgba(0,0,0,0.28), 0 0 24px rgba(166,180,255,0.18)',
        'elev-2': '0 12px 32px rgba(0,0,0,0.32), 0 0 48px rgba(166,180,255,0.24)',
        'elev-3': '0 20px 48px rgba(0,0,0,0.36), 0 0 64px rgba(166,180,255,0.32)',
        'glow': '0 0 20px rgba(102, 247, 213, 0.4)',
        'glow-strong': '0 0 32px rgba(102, 247, 213, 0.6)',
      },
      backdropBlur: {
        'glass': '14px',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'particle-drift': 'particle-drift 12s linear infinite',
        'fog-drift': 'fog-drift 20s linear infinite',
        'ripple': 'ripple 0.8s ease-out',
        'collect': 'collect 0.7s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'particle-drift': {
          '0%': { transform: 'translateX(-100px) translateY(0px)' },
          '100%': { transform: 'translateX(calc(100vw + 100px)) translateY(-50px)' },
        },
        'fog-drift': {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(10%)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        collect: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.8) translateY(-40px)', opacity: '0' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
