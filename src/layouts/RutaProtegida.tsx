import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { RUTAS, type EstadoLogin } from '../lib/rutas'

/** Ruta de origen que se guarda en state.desde para volver tras el login. */
export function useDesde(): string {
  const { pathname, search } = useLocation()
  return `${pathname}${search}`
}

/**
 * Requiere sesión (cualquier rol).
 * FE-004: solo mejora la experiencia; la seguridad real la aplica el servidor.
 */
export function RutaProtegida() {
  const { sesion } = useAuth()
  const desde = useDesde()
  if (sesion.estado === 'cargando') return <Cargando />
  if (sesion.estado === 'anonimo') {
    const estado: EstadoLogin = { desde }
    return <Navigate to={RUTAS.login} replace state={estado} />
  }
  return <Outlet />
}

export default RutaProtegida
