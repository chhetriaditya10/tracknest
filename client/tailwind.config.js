/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Menlo', 'monospace'],
    },
    colors: {
      // Grayscale (replacing dark-* custom colors)
      'slate': {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      },
      // Brand colors
      'violet': {
        DEFAULT: '#8b5cf6',
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        500: '#a78bfa',
        600: '#7c3aed',
        700: '#6d28d9',
        900: '#4c1d95',
      },
      'emerald': {
        DEFAULT: '#10b981',
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#34d399',
        600: '#059669',
      },
      'rose': {
        DEFAULT: '#f43f5e',
        50: '#ffe4e6',
        100: '#fecdd3',
        500: '#fb7185',
        600: '#e11d48',
      },
      'amber': {
        DEFAULT: '#f59e0b',
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#fbbf24',
      },
      'white': '#ffffff',
      'black': '#000000',
      'transparent': 'transparent',
    },
    extend: {
      backgroundColor: {
        'glass': 'rgba(30, 41, 59, 0.7)',
        'glass-light': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      borderColor: (theme) => ({
        ...theme('colors'),
        'glass': 'rgba(255, 255, 255, 0.1)',
      }),
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'sm-glass': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}

