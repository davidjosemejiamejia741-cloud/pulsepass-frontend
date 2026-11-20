import { peticion } from '../../lib/http'
import { AuthResponseSchema, UsuarioAutenticadoSchema, type LoginForm } from './tipos'

export const authApi = {
  /** A1. POST /api/auth/login */
  login: (datos: LoginForm) =>
    peticion('/auth/login', {
      metodo: 'POST',
      cuerpo: datos,
      esquema: AuthResponseSchema,
      sinToken: true,
    }),
  /** A2. GET /api/auth/me (con el token recién emitido o restaurado). */
  yo: (token: string) => peticion('/auth/me', { esquema: UsuarioAutenticadoSchema, token }),
}
