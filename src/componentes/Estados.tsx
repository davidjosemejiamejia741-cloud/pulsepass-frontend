import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { esApiError, MENSAJE_INESPERADO } from '../lib/http'
import { Boton, baseBoton, estilosBoton, tamanosBoton } from './Boton'
import { IconoAdvertencia, IconoBandeja } from './Iconos'
import { claseTarjeta } from './Tarjeta'

/** 9.20 Cargando: esqueleto con la forma del contenido y aria-busy. */
export function Cargando({
  filas = 3,
  etiqueta = 'Cargando…',
}: {
  filas?: number
  etiqueta?: string
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      <span className="sr-only">{etiqueta}</span>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className={clsx(claseTarjeta, 'animate-pulse space-y-3 p-4')}>
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

/** Esqueleto en forma de grilla de tarjetas de evento. */
export function CargandoGrilla({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div aria-busy="true" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={clsx(claseTarjeta, 'animate-pulse overflow-hidden')}>
          <div className="h-28 bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface EstadoVacioProps {
  mensaje: string
  accion?: { texto: string; a: string }
}

/** 9.20 Vacío: ícono, mensaje y acción sugerida. */
export function EstadoVacio({ mensaje, accion }: EstadoVacioProps) {
  return (
    <div className={clsx(claseTarjeta, 'flex flex-col items-center gap-3 px-6 py-10 text-center')}>
      <IconoBandeja className="size-7 text-slate-500" />
      <p className="text-sm font-semibold">{mensaje}</p>
      {accion && (
        <Link to={accion.a} className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.secundario)}>
          {accion.texto}
        </Link>
      )}
    </div>
  )
}

/** 9.20 Error: mensaje seguro (texto, nunca HTML) + "Reintentar". */
export function EstadoError({
  error,
  onReintentar,
}: {
  error: unknown
  onReintentar?: () => void
}) {
  const mensaje = esApiError(error) ? error.message : MENSAJE_INESPERADO
  return (
    <div className={clsx(claseTarjeta, 'flex flex-col items-center gap-4 px-6 py-8 text-center')}>
      <div
        role="alert"
        className="flex w-full items-start justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <IconoAdvertencia className="mt-0.5 size-4 shrink-0" />
        <p>{mensaje}</p>
      </div>
      {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
    </div>
  )
}

/** Mensaje de "no disponible" (404/403 de recurso) sin revelar existencia. */
export function NoDisponible({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className={clsx(claseTarjeta, 'mx-auto max-w-lg px-6 py-10 text-center')}>
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <div className="mt-4 flex justify-center gap-2">{children}</div>
    </div>
  )
}
