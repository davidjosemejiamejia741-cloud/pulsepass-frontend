import { peticion } from '../../lib/http'
import { UsuarioSchema, type RegistroForm } from './tipos'

export const usuariosApi = {
  /** 12 / A3. POST /api/users (registro público con contraseña; el rol inicial es USER). */
  registrar: (datos: RegistroForm) =>
    peticion('/users', { metodo: 'POST', cuerpo: datos, esquema: UsuarioSchema, sinToken: true }),
  /** 13. GET /api/users/by-email?email= (solo la identidad propia). */
  porEmail: (email: string) =>
    peticion('/users/by-email', { esquema: UsuarioSchema, query: { email } }),
  /** 14. GET /api/users/by-username?username= (solo la identidad propia). */
  porUsername: (username: string) =>
    peticion('/users/by-username', { esquema: UsuarioSchema, query: { username } }),
}
