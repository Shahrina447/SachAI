import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b1020',
        bg2: '#0f1530',
        accent: '#7c3aed',
        accent2: '#06b6d4',
        green: '#10b981',
        red: '#ef4444',
        amber: '#f59e0b',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      animation: {
        pulse: 'pulse 1.5s infinite',
        blink: 'blink 1s infinite',
        scroll: 'scroll 30s linear infinite',
        spin: 'spin 1s linear infinite',
        scan: 'scan 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
