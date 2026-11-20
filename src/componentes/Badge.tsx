import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { EventStatus } from '../funcionalidades/eventos/tipos'
import type { TicketStatus } from '../funcionalidades/tickets/tipos'
import type { Rol } from '../funcionalidades/auth/tipos'

const base =
  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide'

/** 9.1: mapas tipados de clases (sin clases dinámicas). */
const estadoEvento: Record<EventStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
}

const estadoTicket: Record<TicketStatus, string> = {
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function BadgeEstadoEvento({ estado }: { estado: EventStatus }) {
  return <span className={clsx(base, estadoEvento[estado])}>{estado}</span>
}

export function BadgeEstadoTicket({ estado }: { estado: TicketStatus }) {
  return <span className={clsx(base, estadoTicket[estado])}>{estado}</span>
}

export function BadgeRol({ rol }: { rol: Rol }) {
  return (
    <span className={clsx(base, 'bg-marca-100 text-marca-700 dark:bg-marca-700 dark:text-white')}>
      {rol}
    </span>
  )
}

type TonoBadge = 'exito' | 'neutro'
const tonos: Record<TonoBadge, string> = {
  exito: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  neutro: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

/** Badge genérico (p. ej. "Activa", "Activo"); texto en mayúscula inicial. */
export function Badge({ tono = 'neutro', children }: { tono?: TonoBadge; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        tonos[tono],
      )}
    >
      {children}
    </span>
  )
}
