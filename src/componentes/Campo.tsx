import clsx from 'clsx'
import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { IconoAdvertencia, IconoOjo, IconoOjoTachado } from './Iconos'

export const claseControl =
  'block w-full min-h-11 rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-marca-600 dark:bg-slate-900 dark:text-slate-100'

const borde = (error?: string) =>
  error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'

interface EnvolturaProps {
  id: string
  etiqueta: string
  error?: string
  ayuda?: ReactNode
  children: ReactNode
  className?: string
}

/** Etiqueta + control + ayuda/error enlazados por aria-describedby (FE-010). */
function Envoltura({ id, etiqueta, error, ayuda, children, className }: EnvolturaProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
        >
          <IconoAdvertencia className="size-3.5" />
          {error}
        </p>
      ) : ayuda ? (
        <div id={`${id}-ayuda`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </div>
      ) : null}
    </div>
  )
}

function describedBy(id: string, error?: string, ayuda?: ReactNode) {
  if (error) return `${id}-error`
  if (ayuda) return `${id}-ayuda`
  return undefined
}

interface CampoProps extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
  contenedorClassName?: string
}

export function Campo({
  etiqueta,
  error,
  ayuda,
  contenedorClassName,
  className,
  id,
  type,
  ...props
}: CampoProps) {
  const generado = useId()
  const campoId = id ?? generado
  const [visible, setVisible] = useState(false)
  const esClave = type === 'password'
  return (
    <Envoltura
      id={campoId}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <div className="relative">
        <input
          id={campoId}
          type={esClave && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(campoId, error, ayuda)}
          className={clsx(claseControl, borde(error), esClave && 'pr-11', className)}
          {...props}
        />
        {esClave && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {visible ? <IconoOjoTachado className="size-4" /> : <IconoOjo className="size-4" />}
          </button>
        )}
      </div>
    </Envoltura>
  )
}

interface AreaTextoProps extends ComponentProps<'textarea'> {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
  contenedorClassName?: string
}

export function AreaTexto({
  etiqueta,
  error,
  ayuda,
  contenedorClassName,
  className,
  id,
  ...props
}: AreaTextoProps) {
  const generado = useId()
  const campoId = id ?? generado
  return (
    <Envoltura
      id={campoId}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <textarea
        id={campoId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(campoId, error, ayuda)}
        className={clsx(claseControl, borde(error), 'min-h-24 py-2.5', className)}
        {...props}
      />
    </Envoltura>
  )
}

interface SelectorProps extends ComponentProps<'select'> {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
  contenedorClassName?: string
}

export function Selector({
  etiqueta,
  error,
  ayuda,
  contenedorClassName,
  className,
  id,
  children,
  ...props
}: SelectorProps) {
  const generado = useId()
  const campoId = id ?? generado
  return (
    <Envoltura
      id={campoId}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <select
        id={campoId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(campoId, error, ayuda)}
        className={clsx(claseControl, borde(error), 'pr-8', className)}
        {...props}
      >
        {children}
      </select>
    </Envoltura>
  )
}
