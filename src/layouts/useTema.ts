import { useCallback, useState } from 'react'

export type Tema = 'claro' | 'oscuro'
const CLAVE = 'pulsepass.tema'

/** FR-FE-GEN-004: respeta prefers-color-scheme y permite alternar (preferencia visual, no datos). */
export function useTema() {
  const [tema, setTema] = useState<Tema>(() =>
    document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro',
  )

  const alternar = useCallback(() => {
    setTema((actual) => {
      const nuevo: Tema = actual === 'oscuro' ? 'claro' : 'oscuro'
      document.documentElement.classList.toggle('dark', nuevo === 'oscuro')
      try {
        // Preferencia visual (no es el token): la regla que bloquea localStorage no aplica aquí.
        // eslint-disable-next-line no-restricted-globals
        localStorage.setItem(CLAVE, nuevo)
      } catch {
        /* sin persistencia */
      }
      return nuevo
    })
  }, [])

  return { tema, alternar }
}
