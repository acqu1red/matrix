import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/formulaprivate/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-ghpages',
    rollupOptions: {
      input: {
        island: resolve(__dirname, 'island.html'),
      },
    },
  },
})
