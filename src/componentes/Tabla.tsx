import clsx from 'clsx'
import type { ReactNode } from 'react'
import { claseTarjeta } from './Tarjeta'

export interface ColumnaTabla<T> {
  clave: string
  titulo: string
  celda: (fila: T) => ReactNode
  className?: string
}

interface TablaProps<T> {
  filas: readonly T[]
  columnas: readonly ColumnaTabla<T>[]
  claveFila: (fila: T) => string
  /** Vista en móvil (< md): la tabla se transforma en tarjetas. */
  tarjeta: (fila: T) => ReactNode
  etiqueta: string
}

/** Tabla<T> genérica: md:table y lista de tarjetas en base. */
export function Tabla<T>({ filas, columnas, claveFila, tarjeta, etiqueta }: TablaProps<T>) {
  return (
    <>
      <ul className="space-y-3 md:hidden" aria-label={etiqueta}>
        {filas.map((f) => (
          <li key={claveFila(f)}>{tarjeta(f)}</li>
        ))}
      </ul>
      <div className={clsx(claseTarjeta, 'hidden overflow-x-auto md:block')}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{etiqueta}</caption>
          <thead className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <tr>
              {columnas.map((c) => (
                <th
                  key={c.clave}
                  scope="col"
                  className={clsx('px-4 py-3 font-semibold', c.className)}
                >
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filas.map((f) => (
              <tr key={claveFila(f)}>
                {columnas.map((c) => (
                  <td key={c.clave} className={clsx('px-4 py-3 align-middle', c.className)}>
                    {c.celda(f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
