import { Navigate, Outlet } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS, type EstadoLogin } from '../lib/rutas'
import { useDesde } from './RutaProtegida'

/**
 * 12.4: cargando -> <Cargando/>; anónimo -> /login (state.desde); rol insuficiente -> /403.
 * Solo protege la interfaz: un 403 de la API siempre prevalece.
 */
export function RutaPorRol({ roles }: { roles: readonly Rol[] }) {
  const { sesion, tieneRol } = useAuth()
  const desde = useDesde()
  if (sesion.estado === 'cargando') return <Cargando />
  if (sesion.estado === 'anonimo') {
    const estado: EstadoLogin = { desde }
    return <Navigate to={RUTAS.login} replace state={estado} />
  }
  if (!tieneRol(...roles)) return <Navigate to={RUTAS.sinPermisos} replace />
  return <Outlet />
}

export default RutaPorRol
