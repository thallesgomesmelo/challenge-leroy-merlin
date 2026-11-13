import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funciona no GitHub Pages (/challenge-leroy-merlin/) e em qualquer outro host
  base: './',
  plugins: [react(), tailwindcss()],
})
