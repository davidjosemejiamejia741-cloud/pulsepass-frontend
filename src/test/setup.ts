import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { reiniciarDatos } from './mocks/datos'
import { handlers } from './mocks/handlers'

// Las páginas se cargan con lazy: con la caché fría la primera importación puede pasar de 1 s.
configure({ asyncUtilTimeout: 3000 })

/** API simulada a nivel de red (sin backend real, NFR-FE-009). */
export const servidor = setupServer(...handlers)

beforeAll(() => servidor.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => {
  reiniciarDatos()
  sessionStorage.clear()
})
afterEach(() => {
  cleanup()
  servidor.resetHandlers()
  servidor.events.removeAllListeners()
})
afterAll(() => servidor.close())

// jsdom no implementa scrollTo (lo usa ScrollRestoration).
window.scrollTo = () => {}
