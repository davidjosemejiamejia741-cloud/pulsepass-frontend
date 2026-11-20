import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ProveedorAvisos } from '../componentes/Avisos'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import { authApi } from '../funcionalidades/auth/api'
import { RUTAS } from '../lib/rutas'
import { rutas } from '../router'
import { CLAVE_DEMO } from './mocks/datos'

/** Reloj fijo para pruebas deterministas (NFR-FE-009). */
export const AHORA = new Date('2026-11-19T12:00:00').getTime()

/** Inicia sesión contra MSW y deja el token en sessionStorage, como haría la app. */
export async function sesionComo(username: string): Promise<void> {
  const { accessToken, expiresIn } = await authApi.login({
    identifier: username,
    password: CLAVE_DEMO,
  })
  sessionStorage.setItem(
    'pulsepass.sesion',
    JSON.stringify({ token: accessToken, expiraEn: AHORA + expiresIn * 1000 }),
  )
}

/** renderConProveedores: Router (memoria) + Query + Auth + Avisos, con las rutas reales. */
export function renderConProveedores(ruta: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  const alExpirar = () => void router.navigate(RUTAS.login, { state: { motivo: 'expirada' } })
  const usuario = userEvent.setup()
  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider alExpirar={alExpirar} ahora={() => AHORA}>
        <ProveedorAvisos>
          <RouterProvider router={router} />
        </ProveedorAvisos>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return { ...resultado, router, queryClient, usuario }
}
