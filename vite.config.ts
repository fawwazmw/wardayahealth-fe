import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 6173,
    allowedHosts: ['development.wardaya.my.id', 'wardayahealth-staging.wardaya.my.id', 'ai.medmap.sg'],
    proxy: {
      '/api': {
        target: 'http://localhost:6333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
