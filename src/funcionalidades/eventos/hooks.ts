import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Artista } from '../artistas/tipos'
import { eventosApi } from './api'
import type { CrearEventoRequest } from './tipos'

export const clavesEventos = {
  publicados: ['eventos', 'publicados'] as const,
  detalle: (eventCode: string) => ['evento', eventCode] as const,
  porArtista: (stageName: string) => ['eventos', 'artista', stageName] as const,
}

export function useEventosPublicados() {
  return useQuery({
    queryKey: clavesEventos.publicados,
    queryFn: eventosApi.publicados,
    staleTime: 60_000,
  })
}

export function useEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: clavesEventos.detalle(eventCode ?? ''),
    queryFn: () => eventosApi.porCodigo(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 30_000,
  })
}

export function useEventosPorArtista(stageName: string | undefined) {
  return useQuery({
    queryKey: clavesEventos.porArtista(stageName ?? ''),
    queryFn: () => eventosApi.porArtista(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 60_000,
  })
}

export function useCrearEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: CrearEventoRequest) => eventosApi.crear(datos),
    onSuccess: (evento) => {
      qc.setQueryData(clavesEventos.detalle(evento.eventCode), evento)
    },
  })
}

export function usePublicarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => eventosApi.publicar(eventCode),
    onSuccess: async (evento) => {
      qc.setQueryData(clavesEventos.detalle(evento.eventCode), evento)
      await Promise.all([
        qc.invalidateQueries({ queryKey: clavesEventos.detalle(evento.eventCode) }),
        qc.invalidateQueries({ queryKey: clavesEventos.publicados }),
      ])
    },
  })
}

export function useAsociarArtista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventCode, artista }: { eventCode: string; artista: Artista }) =>
      eventosApi.asociarArtista(eventCode, artista.id),
    onSuccess: async (evento, { artista }) => {
      qc.setQueryData(clavesEventos.detalle(evento.eventCode), evento)
      await Promise.all([
        qc.invalidateQueries({ queryKey: clavesEventos.detalle(evento.eventCode) }),
        qc.invalidateQueries({ queryKey: clavesEventos.porArtista(artista.stageName) }),
      ])
    },
  })
}
