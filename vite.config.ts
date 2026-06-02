import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_PORT = parseInt(process.env.API_PORT ?? '3001', 10)
const DEV_PORT = parseInt(process.env.PORT ?? '5174', 10)

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: DEV_PORT,
    strictPort: true,
    // Accept connections from any host (needed behind a reverse proxy / Docker port mapping)
    allowedHosts: 'all',
    proxy: {
      '/api':    { target: `http://localhost:${API_PORT}`, changeOrigin: true },
      '/health': { target: `http://localhost:${API_PORT}`, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
  },
})
