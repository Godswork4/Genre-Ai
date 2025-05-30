/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0B0D',
        surface: '#1A1B1E',
        'surface-dark': '#13141680',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        secondary: '#8B5CF6',
        accent: '#EC4899',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to right bottom, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-strong': '0 0 30px rgba(99, 102, 241, 0.5)',
      },
    },
  },
  plugins: [],
} 