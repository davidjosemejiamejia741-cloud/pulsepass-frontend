import { z } from 'zod'

export const ROLES = ['USER', 'STAFF', 'ADMIN'] as const
export const RolSchema = z.enum(ROLES)
export type Rol = z.infer<typeof RolSchema>

function esRol(valor: string): valor is Rol {
  return (ROLES as readonly string[]).includes(valor)
}

/** AuthResponse de POST /api/auth/login. */
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().optional(),
  expiresIn: z.number().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

/**
 * AuthenticatedUserResponse de GET /api/auth/me.
 * El backend entrega autoridades de Spring ("ROLE_USER"); se normalizan a "USER".
 * Los permisos salen de aquí, nunca de decodificar el JWT.
 */
export const UsuarioAutenticadoSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  roles: z
    .array(z.string())
    .transform((roles) => roles.map((r) => r.replace(/^ROLE_/, '')).filter(esRol)),
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

/**
 * 12.1: estado de sesión como unión discriminada (FE-006).
 * `expirada` recuerda que el anónimo viene de una expiración (timer o 401) para avisarlo en /login.
 */
export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; expirada?: boolean }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }

/** Lo único que se guarda en sessionStorage; se valida al leerlo (FE-002). */
export const SesionGuardadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number(),
})
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>

export const LoginFormSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginForm = z.infer<typeof LoginFormSchema>
