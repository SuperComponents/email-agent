/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral colors with custom shades
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          150: '#f0f1f3',
          200: '#e5e7eb',
          250: '#e0e2e5',
          300: '#d1d5db',
          400: '#9ca3af',
          450: '#7c8591',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          750: '#2d3748',
          800: '#1f2937',
          850: '#1a202c',
          900: '#111827',
          925: '#0d1117',
          950: '#030712',
        },
        // Custom colors for the widget
        primary: '#4338ca',
        'primary-light': '#6366f1',
        'ai-purple': '#8b5cf6',
        destructive: '#ef4444',
        accent: '#3b82f6',
        'muted-foreground': '#6b7280',
        ring: '#4338ca',
        'assistant-border': '#e5e7eb',
        success: '#10b981',
      },
      spacing: {
        '6.5': '1.625rem',
        '8.5': '2.125rem',
        '10.5': '2.625rem',
        '12.5': '3.125rem',
      },
      animation: {
        'fade': 'fade 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-in-out',
        'scaleFadeInSm': 'scaleFadeInSm 0.2s ease-in-out',
        'scaleFadeOutSm': 'scaleFadeOutSm 0.2s ease-in-out',
        'refresh': 'refresh 0.5s ease-in-out infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleFadeInSm: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleFadeOutSm: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        refresh: {
          'to': { transform: 'rotate(360deg) scale(0.9)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-25%)',
          },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' },
        },
      },
    },
  },
  plugins: [],
} 