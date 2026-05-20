import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-card': 'var(--bg-card)',
        'petrol-deep': 'var(--petrol-deep)',
        'petrol-mid': 'var(--petrol-mid)',
        'petrol-light': 'var(--petrol-light)',
        'warm-white': 'var(--warm-white)',
        'pure-white': 'var(--pure-white)',
        accent: 'var(--accent)',
        'accent-glow': 'var(--accent-glow)',
        'fuzzy-red': 'var(--fuzzy-red)',
        'fuzzy-yellow': 'var(--fuzzy-yellow)',
        'fuzzy-green': 'var(--fuzzy-green)',
        danger: 'var(--danger)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'line-brighter': 'var(--line-brighter)'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter-tight)', 'var(--font-inter)', 'sans-serif']
      },
      letterSpacing: {
        eyebrow: '0.18em',
        section: '0.15em',
        widest: '0.12em'
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0'
      }
    }
  },
  plugins: []
};

export default config;
