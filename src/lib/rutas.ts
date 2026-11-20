import { z } from 'zod'

/** FE-003: todas las rutas de la aplicación se construyen desde aquí. */
export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  detalleEvento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  artistas: '/artistas',
  detalleArtista: (id: number) => `/artistas/${id}`,
  sedes: '/sedes',
  detalleSede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  detalleTicket: (ticketCode: string) => `/mis-tickets/${encodeURIComponent(ticketCode)}`,
  confirmacionCompra: (ticketCode: string) =>
    `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
  validacion: '/staff/validacion',
  ticketsPagadosInicio: '/staff/eventos',
  ticketsPagados: (eventCode: string) => `/staff/eventos/${encodeURIComponent(eventCode)}/tickets`,
  adminEventos: '/admin/eventos',
  adminCrearEvento: '/admin/eventos/nuevo',
  adminGestionEvento: (eventCode: string) => `/admin/eventos/${encodeURIComponent(eventCode)}`,
  sinPermisos: '/403',
} as const

type RolSeccion = 'USER' | 'STAFF' | 'ADMIN'

/** Roles de cada zona privada: los usa router.tsx (RutaPorRol) y el destino tras el login. */
export const ROLES_SECCION = {
  usuario: ['USER'],
  staff: ['STAFF', 'ADMIN'],
  admin: ['ADMIN'],
} as const satisfies Record<string, readonly RolSeccion[]>

const SECCIONES: readonly { prefijo: string; roles: readonly RolSeccion[] }[] = [
  { prefijo: '/mis-tickets', roles: ROLES_SECCION.usuario },
  { prefijo: '/compra/', roles: ROLES_SECCION.usuario },
  { prefijo: '/staff/', roles: ROLES_SECCION.staff },
  { prefijo: '/admin/', roles: ROLES_SECCION.admin },
]

/**
 * ¿Puede una sesión con estos roles abrir `ruta`? Solo es UX (evitar mandar a alguien a un 403
 * tras iniciar sesión con otra cuenta); la autorización real la aplica el backend.
 */
export function puedeAcceder(ruta: string, roles: readonly string[]): boolean {
  const seccion = SECCIONES.find(
    (s) =>
      ruta === s.prefijo || ruta.startsWith(s.prefijo.endsWith('/') ? s.prefijo : `${s.prefijo}/`),
  )
  return !seccion || seccion.roles.some((r) => roles.includes(r))
}

/** Estado que viaja con la navegación hacia /login. */
export interface EstadoLogin {
  desde?: string
  motivo?: 'expirada'
  registrado?: boolean
}

/** FE-002: el state de navegación también es dato externo y se valida. */
const EstadoLoginSchema = z
  .object({
    // Solo rutas internas ("/x", nunca "//dominio"): evita redirecciones abiertas.
    desde: z
      .string()
      .regex(/^\/(?!\/)/)
      .optional()
      .catch(undefined),
    motivo: z.literal('expirada').optional().catch(undefined),
    registrado: z.boolean().optional().catch(undefined),
  })
  .catch({})

export function leerEstadoLogin(state: unknown): EstadoLogin {
  return EstadoLoginSchema.parse(state ?? {})
}
