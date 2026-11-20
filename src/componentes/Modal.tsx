import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconoCerrar } from './Iconos'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  acciones?: ReactNode
}

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Diálogo accesible: atrapa el foco, cierra con Esc y devuelve el foco al disparador. */
export function Modal({ abierto, titulo, onCerrar, children, acciones }: ModalProps) {
  const tituloId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef(onCerrar)
  useEffect(() => {
    cerrarRef.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement as HTMLElement | null
    const nodo = panel.current
    const enfocables = () => Array.from(nodo?.querySelectorAll<HTMLElement>(SELECTOR_FOCO) ?? [])
    // Foco inicial en el propio diálogo: evita confirmar una acción con un Enter accidental.
    nodo?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrarRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = enfocables()
      const primero = items[0]
      const ultimo = items.at(-1)
      if (!primero || !ultimo) return
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflow
      anterior?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" aria-hidden="true" onClick={onCerrar} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 id={tituloId} className="text-base font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-2 flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <IconoCerrar className="size-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {acciones && <div className="flex justify-end gap-2 px-5 pb-5">{acciones}</div>}
      </div>
    </div>
  )
}
