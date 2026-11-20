import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { formatearPrecio, iniciales } from '../lib/formato'
import { IconoFlechaIzq } from './Iconos'

/** PrecioCOP: Intl.NumberFormat('es-CO', { currency: 'COP' }). */
export function PrecioCOP({ valor }: { valor: number }) {
  return <span>{formatearPrecio(valor)}</span>
}

/** DES-05: códigos en fuente monoespaciada. */
export function CodigoTexto({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('font-mono tracking-tight', className)}>{children}</span>
}

const paletaAvatar = [
  'bg-marca-100 text-marca-700 dark:bg-marca-700 dark:text-white',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
] as const

type TamanoAvatar = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const tamanosAvatar: Record<TamanoAvatar, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-16 text-xl',
  xl: 'size-24 text-3xl',
}

/** Avatar de iniciales (la API no entrega imágenes). */
export function Avatar({
  nombre,
  tamano = 'md',
  indice,
}: {
  nombre: string
  tamano?: TamanoAvatar
  indice?: number
}) {
  const i = indice ?? [...nombre].reduce((s, c) => s + c.charCodeAt(0), 0)
  const color = paletaAvatar[i % paletaAvatar.length] ?? paletaAvatar[0]
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        color,
        tamanosAvatar[tamano],
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}

export function EnlaceVolver({ a, children }: { a: string; children: ReactNode }) {
  return (
    <Link
      to={a}
      className="text-marca-600 dark:text-marca-100 mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium hover:underline"
    >
      <IconoFlechaIzq className="size-4" />
      {children}
    </Link>
  )
}

export function TituloPagina({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold sm:text-3xl">{children}</h1>
      {accion}
    </div>
  )
}

interface OpcionChip<T extends string> {
  valor: T
  texto: string
}

/** DES-06: filtro con chips y aria-pressed. */
export function FiltroChips<T extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
}: {
  opciones: readonly OpcionChip<T>[]
  valor: T
  onCambiar: (v: T) => void
  etiqueta: string
}) {
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambiar(o.valor)}
            className={clsx(
              'min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors',
              activo
                ? 'border-marca-600 bg-marca-600 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
            )}
          >
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}
