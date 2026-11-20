import { useQuery } from '@tanstack/react-query'
import { sedesApi } from './api'

const CINCO_MIN = 5 * 60_000

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: sedesApi.activas,
    staleTime: CINCO_MIN,
  })
}

export function useSede(code: string | null | undefined) {
  return useQuery({
    queryKey: ['sede', code],
    queryFn: () => sedesApi.porCodigo(code ?? ''),
    enabled: Boolean(code),
    staleTime: CINCO_MIN,
  })
}
