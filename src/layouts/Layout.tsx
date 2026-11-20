import { Suspense, type ReactNode } from 'react'
import { Link, Outlet, ScrollRestoration, useMatches } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { RUTAS } from '../lib/rutas'
import { Navbar } from './Navbar'

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-slate-600 dark:text-slate-400">
        <p>© 2026 PulsePass · Caso de estudio académico</p>
        <nav aria-label="Pie de página" className="flex gap-4">
          <Link to={RUTAS.sedes} className="hover:text-marca-600 hover:underline">
            Sedes
          </Link>
          <Link to={RUTAS.artistas} className="hover:text-marca-600 hover:underline">
            Artistas
          </Link>
        </nav>
      </div>
    </footer>
  )
}

/** Una ruta con handle { anchoCompleto: true } (p. ej. Inicio con su hero) gestiona su propio ancho. */
function useAnchoCompleto(): boolean {
  return useMatches().some((m) => {
    const h = m.handle as { anchoCompleto?: boolean } | undefined
    return h?.anchoCompleto === true
  })
}

/** 9.2 Layout raíz: Navbar sticky, <main id="contenido"> (max-w-6xl px-4 py-8) y Footer. */
export function Layout({ children }: { children?: ReactNode }) {
  const completo = useAnchoCompleto() && !children
  const contenido = children ?? <Outlet />
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-marca-600 sr-only z-50 rounded-lg px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        {completo ? (
          contenido
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <Suspense fallback={<Cargando />}>{contenido}</Suspense>
          </div>
        )}
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

export default Layout
