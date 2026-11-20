import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

/** Superficie: bg-white + shadow-sm / dark:bg-slate-900. */
export const claseTarjeta =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'

export function Tarjeta({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(claseTarjeta, className)} {...props} />
}

/** Fila etiqueta / valor usada en detalles (sede, ticket, modal de compra). */
export function FilaDato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-b-0 dark:border-slate-800">
      <dt className="text-slate-500 dark:text-slate-400">{etiqueta}</dt>
      <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  )
}
