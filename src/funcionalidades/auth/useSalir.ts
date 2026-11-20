import { useNavigate } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { useAuth } from './AuthContext'

/**
 * 12.3: cerrar sesión navega a "/". Primero se sale de la ruta protegida y luego se limpia la sesión.
 *
 * `flushSync` es imprescindible: React Router aplica la navegación como transición y el cierre de
 * sesión es una actualización urgente, así que sin él la sesión se limpiaba antes de cambiar de
 * página; la guarda de la ruta actual (p. ej. /mis-tickets) redirigía a /login guardando ese
 * origen, y la siguiente cuenta (p. ej. STAFF) terminaba en un 403 al iniciar sesión.
 */
export function useSalir(): () => Promise<void> {
  const { cerrarSesion } = useAuth()
  const navigate = useNavigate()
  return async () => {
    await navigate(RUTAS.inicio, { flushSync: true })
    cerrarSesion()
  }
}
