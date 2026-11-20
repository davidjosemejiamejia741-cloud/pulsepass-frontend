import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // GAP-05: la API no expone CORS para el origen de desarrollo; se usa el proxy de Vite.
    proxy: {
      '/api': {
        target: process.env.PULSEPASS_API_URL ?? 'http://localhost:8080',
        changeOrigin: true,
        // El navegador envía `Origin` en los POST/PATCH. Con el proxy la petición es del mismo origen,
        // pero Spring vería un origen distinto al suyo y, sin PULSEPASS_CORS_ORIGINS, respondería
        // 403 "Invalid CORS request". Se quita la cabecera para que la API la trate como same-origin.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
          })
        },
      },
    },
  },
})
