/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Background Colors - NeonTrade Theme
        'dark-bg': '#0a0b0f',
        'bg-primary': '#0a0b0f',
        'bg-secondary': '#12131a',
        'bg-tertiary': '#1a1b23',
        'dark-card': 'rgba(255, 255, 255, 0.05)',
        'dark-hover': 'rgba(255, 255, 255, 0.08)',
        'dark-border': 'rgba(255, 255, 255, 0.08)',
        
        // Glass Effect Colors
        'glass': {
          'primary': 'rgba(18, 19, 26, 0.8)',
          'secondary': 'rgba(255, 255, 255, 0.03)',
          'hover': 'rgba(255, 255, 255, 0.08)',
          'border': 'rgba(255, 255, 255, 0.1)',
        },
        
        // Text Colors
        'text': {
          'primary': '#FFFFFF',
          'secondary': '#9CA3AF',
          'muted': '#6B7280',
        },
        
        // Accent Colors - Purple/Cyan Theme
        'accent': {
          'blue': '#8B5CF6',
          'blue-hover': '#7C3AED',
          'purple': '#8B5CF6',
          'purple-hover': '#7C3AED',
          'cyan': '#06B6D4',
          'cyan-hover': '#0891B2',
          'emerald': '#10B981',
        },
        
        // Status Colors
        'success': '#10B981',
        'success-bg': 'rgba(16, 185, 129, 0.1)',
        'danger': '#EF4444',
        'danger-bg': 'rgba(239, 68, 68, 0.1)',
        'warning': '#F59E0B',
        'warning-bg': 'rgba(245, 158, 11, 0.1)',
        'info': '#8B5CF6',
        'info-bg': 'rgba(139, 92, 246, 0.1)',
      },
      
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', 'Poppins', 'system-ui', 'sans-serif'],
        'mono': ['SF Mono', 'Fira Code', 'monospace'],
      },
      
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        'balance': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'balance-lg': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'balance-xl': ['3rem', { lineHeight: '3.5rem', fontWeight: '700' }],
      },
      
      borderRadius: {
        'glass': '16px',
        'glass-lg': '20px',
        'glass-xl': '24px',
      },
      
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
        'glow-blue': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'neon': '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
