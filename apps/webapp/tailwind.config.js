/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./island.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Solarpunk Holographic (default)
        'bg-0': '#0B1020',
        'bg-1': '#0F1A2A',
        'glow-1': '#66F7D5',
        'glow-2': '#A6B4FF',
        'accent': '#FFE27A',
        
        // Art-Deco Nocturne
        'deco-bg-0': '#0A0A0F',
        'deco-bg-1': '#1A1A2E',
        'deco-glow-1': '#FFD700',
        'deco-glow-2': '#B8860B',
        'deco-accent': '#FF6B6B',
        
        // Retro-Synthwave
        'synth-bg-0': '#0F0F23',
        'synth-bg-1': '#1A1A3A',
        'synth-glow-1': '#FF00FF',
        'synth-glow-2': '#00FFFF',
        'synth-accent': '#FFFF00',
      },
      fontFamily: {
        'heading': ['Inter Tight', 'Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'deco': ['Cormorant Garamond', 'serif'],
        'synth': ['Orbitron', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'drift': 'drift 10s ease-in-out infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
        'ripple': 'ripple 0.8s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(1%, 0.5%, 0)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'elev-1': '0 6px 18px rgba(0,0,0,0.28), 0 0 24px rgba(166,180,255,0.18)',
        'elev-2': '0 12px 36px rgba(0,0,0,0.35), 0 0 48px rgba(166,180,255,0.25)',
        'elev-3': '0 24px 72px rgba(0,0,0,0.42), 0 0 96px rgba(166,180,255,0.32)',
        'glow-1': '0 0 20px rgba(102,247,213,0.5)',
        'glow-2': '0 0 30px rgba(166,180,255,0.6)',
      },
    },
  },
  plugins: [],
}
