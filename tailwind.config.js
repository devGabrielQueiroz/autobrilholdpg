/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Paleta de cores personalizada AutoBrilho
      colors: {
        // Base escura
        dark: {
          900: '#0a0a0a',   // Preto profundo
          800: '#141414',   // Fundo principal
          700: '#1a1a1a',   // Cards
          600: '#242424',   // Bordas
          500: '#2a2a2a',   // Hover escuro
        },
        // Grafite
        graphite: {
          900: '#1c1c1c',
          800: '#2d2d2d',
          700: '#3d3d3d',
          600: '#4d4d4d',
          500: '#5d5d5d',
        },
        // Dourado metálico (destaque premium)
        gold: {
          DEFAULT: '#d4a853',
          light: '#e8c171',
          dark: '#b8903f',
          muted: '#9a7b3a',
          glow: 'rgba(212, 168, 83, 0.4)',
        },
        // Branco suave para textos
        cream: {
          DEFAULT: '#f5f5f5',
          muted: '#e0e0e0',
          dark: '#b0b0b0',
        },
      },
      // Tipografia
      fontFamily: {
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      // Animações personalizadas
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(212, 168, 83, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(212, 168, 83, 0.6)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      // Box shadow customizado
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 168, 83, 0.25)',
        'gold-lg': '0 8px 40px rgba(212, 168, 83, 0.35)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      // Border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}

