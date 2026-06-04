import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_PORT = parseInt(process.env.API_PORT ?? '3001', 10)
const DEV_PORT = parseInt(process.env.PORT ?? '5174', 10)
// When running inside Docker, DEV_HOST_PORT is the mapped host port (e.g. 14009).
// Vite must tell the browser to connect its HMR WebSocket to that port, not to
// the container-internal port (5174) which isn't accessible from the host.
const DEV_HOST_PORT = process.env.DEV_HOST_PORT ? parseInt(process.env.DEV_HOST_PORT, 10) : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: DEV_PORT,
    strictPort: true,
    // Accept connections from any host (needed behind a reverse proxy / Docker port mapping)
    allowedHosts: true,
    hmr: DEV_HOST_PORT ? { clientPort: DEV_HOST_PORT } : true,
    proxy: {
      '/api':    { target: `http://localhost:${API_PORT}`, changeOrigin: true },
      '/health': { target: `http://localhost:${API_PORT}`, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
  },
})
