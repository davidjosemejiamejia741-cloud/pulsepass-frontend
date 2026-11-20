import clsx from 'clsx'
import type { ComponentProps } from 'react'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'claro'
type TamanoBoton = 'md' | 'sm' | 'lg'

/** FE-008: variantes con Record + clases completas (nunca dinámicas). */
export const estilosBoton: Record<VarianteBoton, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700 shadow-sm',
  secundario:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  peligro: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  fantasma: 'text-marca-600 hover:bg-marca-50 dark:text-marca-100 dark:hover:bg-slate-800',
  claro: 'bg-white text-marca-700 hover:bg-marca-50',
}

export const tamanosBoton: Record<TamanoBoton, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

export const baseBoton =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed'

interface BotonProps extends ComponentProps<'button'> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  cargando?: boolean
  anchoCompleto?: boolean
}

export function Boton({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  anchoCompleto = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: BotonProps) {
  const inactivo = disabled || cargando
  return (
    <button
      type={type}
      disabled={inactivo}
      aria-busy={cargando || undefined}
      className={clsx(
        baseBoton,
        tamanosBoton[tamano],
        cargando
          ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          : estilosBoton[variante],
        inactivo && !cargando && 'opacity-50',
        anchoCompleto && 'w-full',
        className,
      )}
      {...props}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  )
}
