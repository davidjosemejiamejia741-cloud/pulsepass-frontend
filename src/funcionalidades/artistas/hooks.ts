import { useQuery } from '@tanstack/react-query'
import { artistasApi } from './api'

const CINCO_MIN = 5 * 60_000

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: artistasApi.activos,
    staleTime: CINCO_MIN,
  })
}

/** id ya validado por la página (Number.isNaN -> 404 de UI sin llamar a la API). */
export function useArtista(id: number | null) {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: () => artistasApi.porId(id ?? 0),
    enabled: id !== null,
    staleTime: CINCO_MIN,
  })
}

export function useArtistaPorNombre(stageName: string | undefined) {
  return useQuery({
    queryKey: ['artista', 'nombre', stageName],
    queryFn: () => artistasApi.porNombre(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: CINCO_MIN,
  })
}
