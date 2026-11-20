import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { ProveedorAvisos } from './componentes/Avisos'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import './index.css'
import { crearQueryClient } from './lib/queryClient'
import { RUTAS, type EstadoLogin } from './lib/rutas'
import { router } from './router'

const queryClient = crearQueryClient()

/** 12.2: al expirar (timer o 401) se vuelve a /login con el aviso y la ruta de origen. */
function alExpirar() {
  const { pathname, search } = router.state.location
  const estado: EstadoLogin = { motivo: 'expirada', desde: `${pathname}${search}` }
  void router.navigate(RUTAS.login, { state: estado, replace: true })
}

const raiz = document.getElementById('root')
if (!raiz) throw new Error('No se encontró #root')

// Modo demostración sin backend (`npm run dev:mock`): MSW responde en el navegador.
// En el build normal MODE !== 'mock' y este import se elimina del bundle.
if (import.meta.env.MODE === 'mock') {
  const { worker } = await import('./test/mocks/navegador')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

// Orden exigido por el PRD: QueryClientProvider > AuthProvider > RouterProvider.
createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider alExpirar={alExpirar}>
        <ProveedorAvisos>
          <RouterProvider router={router} />
        </ProveedorAvisos>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
