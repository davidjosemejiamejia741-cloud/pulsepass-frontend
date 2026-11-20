import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { leerEstadoLogin, puedeAcceder, RUTAS } from '../lib/rutas'

/**
 * Login y registro: con sesión activa redirige (9.8). Respeta state.desde para volver a la ruta
 * de origen (FR-FE-AUTH-002), salvo que el rol de quien acaba de entrar no tenga acceso a ella
 * (p. ej. el origen lo dejó otra cuenta): entonces va a inicio en lugar de terminar en un 403.
 */
export function SoloAnonimo() {
  const { sesion } = useAuth()
  const state: unknown = useLocation().state
  if (sesion.estado === 'cargando') return <Cargando />
  if (sesion.estado === 'autenticado') {
    const { desde } = leerEstadoLogin(state)
    const destino = desde && puedeAcceder(desde, sesion.usuario.roles) ? desde : RUTAS.inicio
    return <Navigate to={destino} replace />
  }
  return <Outlet />
}

export default SoloAnonimo
