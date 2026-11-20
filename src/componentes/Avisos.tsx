import clsx from 'clsx'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { IconoAdvertencia, IconoCerrar, IconoCheck, IconoRayo } from './Iconos'

export type TipoAviso = 'exito' | 'error' | 'info' | 'advertencia'

interface AvisoItem {
  id: number
  tipo: TipoAviso
  mensaje: string
}

interface AvisosValor {
  mostrar: (tipo: TipoAviso, mensaje: string) => void
}

const AvisosContext = createContext<AvisosValor | null>(null)

const estilos: Record<TipoAviso, string> = {
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-marca-100 bg-marca-50 text-marca-700 dark:border-marca-700 dark:bg-slate-900 dark:text-marca-100',
  advertencia:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
}

const iconos: Record<TipoAviso, typeof IconoCheck> = {
  exito: IconoCheck,
  error: IconoAdvertencia,
  info: IconoRayo,
  advertencia: IconoAdvertencia,
}

/** Aviso en línea (también usado dentro de formularios y modales). */
export function Aviso({
  tipo,
  children,
  onCerrar,
  className,
}: {
  tipo: TipoAviso
  children: ReactNode
  onCerrar?: () => void
  className?: string
}) {
  const Icono = iconos[tipo]
  const urgente = tipo === 'error' || tipo === 'advertencia'
  return (
    <div
      role={urgente ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
        estilos[tipo],
        className,
      )}
    >
      <Icono className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">{children}</p>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
        >
          <IconoCerrar className="size-4" />
        </button>
      )}
    </div>
  )
}

/** FR-FE-GEN-003: avisos (toast) de mutaciones. Éxito desaparece a los 4 s; error persiste. */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoItem[]>([])
  const siguienteId = useRef(1)

  const cerrar = useCallback((id: number) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  const mostrar = useCallback(
    (tipo: TipoAviso, mensaje: string) => {
      const id = siguienteId.current++
      setAvisos((lista) => [...lista.slice(-3), { id, tipo, mensaje }])
      if (tipo === 'exito' || tipo === 'info') window.setTimeout(() => cerrar(id), 4000)
    },
    [cerrar],
  )

  const valor = useMemo(() => ({ mostrar }), [mostrar])

  return (
    <AvisosContext value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {avisos.map((a) => (
          <div key={a.id} className="pointer-events-auto w-full shadow-lg">
            <Aviso tipo={a.tipo} onCerrar={() => cerrar(a.id)}>
              {a.mensaje}
            </Aviso>
          </div>
        ))}
      </div>
    </AvisosContext>
  )
}

export function useAvisos(): AvisosValor {
  const contexto = useContext(AvisosContext)
  if (!contexto) throw new Error('useAvisos debe usarse dentro de <ProveedorAvisos>')
  return contexto
}
