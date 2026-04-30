import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff2d95', magenta: '#e040fb', purple: '#b24bf3', violet: '#7c4dff',
          blue: '#448aff', cyan: '#06d6e0', teal: '#0a7e74', green: '#00e676',
          yellow: '#ffd600', orange: '#ff9100', red: '#ff3d00',
        },
        brand: {
          primary: '#0a7e74', accent: '#3a2a5e', electric: '#06d6e0',
          hotPink: '#ff2d95', violet: '#b24bf3',
        },
        dark: {
          void: '#05050f', bg: '#0a0a1a', surface: '#111128', elevated: '#1a1a35',
          border: '#2a2a50', borderGlow: '#3a3a6a',
        },
        light: { bg: '#faf8f5', surface: '#ffffff', elevated: '#f0ede8', border: '#d4cfc7' },
        status: { protected: '#06d6e0', warning: '#ffd600', blocked: '#ff2d95', info: '#448aff' },
        text: { primary: '#eeeef6', secondary: '#9898b8', muted: '#5a5a78', inverse: '#0a0a1a' },
      },
      fontFamily: {
        display: "'Orbitron', 'Rajdhani', sans-serif",
        heading: "'Rajdhani', 'DM Sans', sans-serif",
        body: "'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "'JetBrains Mono', 'SF Mono', 'Monaco', monospace",
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.625rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.75rem', { lineHeight: '3rem' }],
        '5xl': ['3.5rem', { lineHeight: '3.75rem' }],
      },
      spacing: {
        1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem',
        6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem',
      },
      borderRadius: { sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px' },
      boxShadow: {
        glow: '0 0 20px rgba(6,214,224,0.4), 0 0 60px rgba(6,214,224,0.15)',
        'glow-pink': '0 0 20px rgba(255,45,149,0.4), 0 0 60px rgba(255,45,149,0.15)',
        'glow-violet': '0 0 20px rgba(178,75,243,0.4), 0 0 60px rgba(178,75,243,0.15)',
        'glow-rainbow': '0 0 20px rgba(255,45,149,0.3), 0 0 40px rgba(178,75,243,0.2), 0 0 60px rgba(6,214,224,0.15)',
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(135deg, #ff3d00, #ff9100, #ffd600, #00e676, #448aff, #b24bf3, #ff2d95)',
        'neon-gradient': 'linear-gradient(135deg, #06d6e0, #b24bf3, #ff2d95)',
      },
      animation: { glow: 'glow 1.5s ease-in-out infinite alternate' },
      keyframes: {
        glow: {
          from: { textShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          to: { textShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
