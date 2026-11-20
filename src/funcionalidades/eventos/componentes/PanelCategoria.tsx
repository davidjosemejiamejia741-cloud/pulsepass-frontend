import clsx from 'clsx'
import {
  IconoBalon,
  IconoBirrete,
  IconoEstrella,
  IconoMonitor,
  IconoMuseo,
  IconoMusica,
} from '../../../componentes/Iconos'
import type { EventCategory } from '../tipos'

/** DES-02: panel de color por categoría con ícono (la API no entrega imágenes). */
export const estiloCategoria: Record<
  EventCategory,
  { fondo: string; texto: string; Icono: typeof IconoMusica }
> = {
  MUSIC: {
    fondo: 'bg-marca-100 dark:bg-indigo-950',
    texto: 'text-marca-700 dark:text-indigo-300',
    Icono: IconoMusica,
  },
  TECHNOLOGY: {
    fondo: 'bg-sky-100 dark:bg-sky-950',
    texto: 'text-sky-700 dark:text-sky-300',
    Icono: IconoMonitor,
  },
  SPORTS: {
    fondo: 'bg-emerald-100 dark:bg-emerald-950',
    texto: 'text-emerald-700 dark:text-emerald-300',
    Icono: IconoBalon,
  },
  CULTURE: {
    fondo: 'bg-rose-100 dark:bg-rose-950',
    texto: 'text-rose-700 dark:text-rose-300',
    Icono: IconoMuseo,
  },
  EDUCATION: {
    fondo: 'bg-amber-100 dark:bg-amber-950',
    texto: 'text-amber-700 dark:text-amber-300',
    Icono: IconoBirrete,
  },
  ENTERTAINMENT: {
    fondo: 'bg-violet-100 dark:bg-violet-950',
    texto: 'text-violet-700 dark:text-violet-300',
    Icono: IconoEstrella,
  },
}

export function PanelCategoria({
  categoria,
  alto = 'h-28',
  className,
}: {
  categoria: EventCategory
  alto?: 'h-28' | 'h-40'
  className?: string
}) {
  const { fondo, texto, Icono } = estiloCategoria[categoria]
  return (
    <div className={clsx('flex items-center justify-center', fondo, texto, alto, className)}>
      <Icono className={alto === 'h-40' ? 'size-14' : 'size-9'} />
    </div>
  )
}

export function EtiquetaCategoria({ categoria }: { categoria: EventCategory }) {
  return (
    <span
      className={clsx(
        'text-[11px] font-bold tracking-wider uppercase',
        estiloCategoria[categoria].texto,
      )}
    >
      {categoria}
    </span>
  )
}
