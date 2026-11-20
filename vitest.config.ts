import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    // Los flujos completos (login + navegación con tecleo real) superan los 5 s por defecto con caché fría.
    testTimeout: 15_000,
  },
})
