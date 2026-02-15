import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          pink: '#ff0080',
          purple: '#a020f0',
        },
      },
      textShadow: {
        neon: '0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-pink': '0 0 10px rgba(255, 0, 128, 0.8), 0 0 20px rgba(255, 0, 128, 0.5)',
        'neon-purple': '0 0 10px rgba(160, 32, 240, 0.8), 0 0 20px rgba(160, 32, 240, 0.5)',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 0, 128, 0.6), 0 0 20px rgba(255, 0, 128, 0.3)',
        'neon-purple': '0 0 10px rgba(160, 32, 240, 0.6), 0 0 20px rgba(160, 32, 240, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
