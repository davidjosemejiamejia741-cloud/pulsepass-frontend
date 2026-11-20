import { QueryClient } from '@tanstack/react-query'
import { esApiError } from './http'

/** 14.3: sin reintentos para 4xx; 1 reintento para red y 5xx. */
export function debeReintentar(intentos: number, error: unknown): boolean {
  if (esApiError(error) && error.status >= 400 && error.status < 500) return false
  return intentos < 1
}

export function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: debeReintentar, refetchOnWindowFocus: false },
      // Las mutaciones nunca se reintentan (evita compras duplicadas).
      mutations: { retry: false },
    },
  })
}
