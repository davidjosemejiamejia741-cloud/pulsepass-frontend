import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { configurarHttp } from '../../lib/http'
import { authApi } from './api'
import { SesionGuardadaSchema, type Rol, type Sesion, type SesionGuardada } from './tipos'

const CLAVE = 'pulsepass.sesion'

/* 12.2: sessionStorage (se pierde al cerrar la pestaña). Nunca localStorage ni cookies. */
const almacen = {
  leer(ahora: number): SesionGuardada | null {
    try {
      const crudo = sessionStorage.getItem(CLAVE)
      if (!crudo) return null
      const resultado = SesionGuardadaSchema.safeParse(JSON.parse(crudo) as unknown)
      if (!resultado.success || resultado.data.expiraEn <= ahora) {
        sessionStorage.removeItem(CLAVE)
        return null
      }
      return resultado.data
    } catch {
      return null
    }
  },
  guardar(valor: SesionGuardada) {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(valor))
    } catch {
      /* almacenamiento no disponible: la sesión vive solo en memoria */
    }
  },
  borrar() {
    try {
      sessionStorage.removeItem(CLAVE)
    } catch {
      /* sin acción */
    }
  },
}

interface AuthContextValor {
  sesion: Sesion
  iniciarSesion: (identifier: string, password: string) => Promise<void>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

const AuthContext = createContext<AuthContextValor | null>(null)

interface AuthProviderProps {
  children: ReactNode
  /** Se invoca cuando la sesión expira (timer o 401): normalmente navega a /login. */
  alExpirar?: () => void
  /** Reloj inyectable para pruebas deterministas (NFR-FE-009). */
  ahora?: () => number
}

export function AuthProvider({ children, alExpirar, ahora = Date.now }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [guardadaInicial] = useState(() => almacen.leer(ahora()))
  const [sesion, setSesion] = useState<Sesion>(() =>
    guardadaInicial ? { estado: 'cargando' } : { estado: 'anonimo' },
  )
  const tokenRef = useRef<string | null>(guardadaInicial?.token ?? null)
  const alExpirarRef = useRef(alExpirar)
  useEffect(() => {
    alExpirarRef.current = alExpirar
  }, [alExpirar])

  const limpiar = useCallback(
    (expirada: boolean) => {
      tokenRef.current = null
      almacen.borrar()
      queryClient.clear()
      setSesion({ estado: 'anonimo', expirada })
    },
    [queryClient],
  )

  /** FR-FE-AUTH-006: elimina token y caché de consultas. */
  const cerrarSesion = useCallback(() => limpiar(false), [limpiar])

  /** Timer o 401: cierre local + aviso "Tu sesión expiró" en /login. */
  const expirar = useCallback(() => {
    if (tokenRef.current === null) return
    limpiar(true)
    alExpirarRef.current?.()
  }, [limpiar])

  // lib/http.ts lee el token desde memoria y avisa ante un 401.
  useEffect(() => {
    configurarHttp({ obtenerToken: () => tokenRef.current, alNoAutorizado: expirar })
  }, [expirar])

  // Restaurar la sesión al recargar (FR-FE-AUTH-004).
  useEffect(() => {
    if (!guardadaInicial) return
    let activo = true
    authApi
      .yo(guardadaInicial.token)
      .then((usuario) => {
        if (activo) setSesion({ estado: 'autenticado', ...guardadaInicial, usuario })
      })
      .catch(() => {
        if (!activo) return
        tokenRef.current = null
        almacen.borrar()
        setSesion({ estado: 'anonimo' })
      })
    return () => {
      activo = false
    }
  }, [guardadaInicial])

  // Cierre local programado al vencer el token (15 min, sin refresh).
  const expiraEn = sesion.estado === 'autenticado' ? sesion.expiraEn : null
  useEffect(() => {
    if (expiraEn === null) return
    const id = window.setTimeout(expirar, Math.max(0, expiraEn - ahora()))
    return () => window.clearTimeout(id)
  }, [expiraEn, expirar, ahora])

  const iniciarSesion = useCallback(
    async (identifier: string, password: string) => {
      const { accessToken, expiresIn } = await authApi.login({ identifier, password })
      const usuario = await authApi.yo(accessToken)
      const guardada = { token: accessToken, expiraEn: ahora() + expiresIn * 1000 }
      tokenRef.current = accessToken
      almacen.guardar(guardada)
      queryClient.clear()
      setSesion({ estado: 'autenticado', ...guardada, usuario })
    },
    [ahora, queryClient],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]) =>
      sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
    [sesion],
  )

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, cerrarSesion, tieneRol }),
    [sesion, iniciarSesion, cerrarSesion, tieneRol],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}

/** Atajo: usuario autenticado o null. */
export function useUsuarioSesion() {
  const { sesion } = useAuth()
  return sesion.estado === 'autenticado' ? sesion.usuario : null
}
