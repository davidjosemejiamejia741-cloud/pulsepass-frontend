import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** Modo demostración sin backend: `npm run dev:mock` (VITE_API_MOCK=true). */
export const worker = setupWorker(...handlers)
