import { useSyncExternalStore } from 'react'
import { z } from 'zod'
import { EventStatusSchema } from '../eventos/tipos'

/**
 * GAP-01: la API no lista todos los eventos. El panel ADMIN recuerda los eventos creados o abiertos
 * en esta pestaña (sessionStorage): se pierden al cerrarla (limitación documentada en 9.16).
 */
const CLAVE = 'pulsepass.admin.eventos'

const EventoSesionSchema = z.object({
  eventCode: z.string(),
  name: z.string(),
  status: EventStatusSchema,
})
export type EventoSesion = z.infer<typeof EventoSesionSchema>

function leer(): EventoSesion[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    const r = z.array(EventoSesionSchema).safeParse(crudo ? (JSON.parse(crudo) as unknown) : [])
    return r.success ? r.data : []
  } catch {
    return []
  }
}

let cache: EventoSesion[] = leer()
const oyentes = new Set<() => void>()

export function recordarEventoSesion(evento: EventoSesion): void {
  cache = [evento, ...cache.filter((e) => e.eventCode !== evento.eventCode)].slice(0, 20)
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(cache))
  } catch {
    /* solo memoria */
  }
  oyentes.forEach((o) => o())
}

export function useEventosSesion(): EventoSesion[] {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o)
      return () => oyentes.delete(o)
    },
    () => cache,
  )
}
