import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: { 50:'#e8f4f8',100:'#c5e3ed',200:'#9fd0df',300:'#78bdd1',400:'#5aadc5',500:'#3c9db9',600:'#2e8ca8',700:'#1a5276',800:'#13405d',900:'#0c2e44' },
        amber: { 50:'#fdf6ed',100:'#f9ebd2',200:'#f3d6a5',300:'#ecbe72',400:'#d4a574',500:'#c49055',600:'#a8753e',700:'#8c5c2c',800:'#704720',900:'#543416' },
        accent: { DEFAULT:'#e17055', light:'#f0876e', dark:'#c95a42' },
        success: { DEFAULT:'#27ae60', light:'#2ecc71', dark:'#1e8449' }
      },
      fontFamily: { sans: ['"Noto Sans SC"','system-ui','sans-serif'] },
      borderRadius: { card:'8px', btn:'6px' }
    }
  },
  plugins: []
}
export default config
