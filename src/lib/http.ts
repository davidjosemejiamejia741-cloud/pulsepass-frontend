import { z } from 'zod'

/** Contrato uniforme de error del backend (sección 10.2). */
export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string().optional(),
  message: z.string(),
  details: z.record(z.string(), z.string()).nullish(),
})

export const MENSAJE_RED = 'No pudimos conectar con el servidor.'
export const MENSAJE_INESPERADO = 'Ocurrió un error inesperado. Inténtalo más tarde.'

/** NFR-FE-006: todo error de la API llega a la UI como ApiError. status 0 = error de red. */
export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

/* El token vive en memoria (AuthContext lo registra aquí). Nunca viaja en la URL (FE-013). */
let obtenerToken: () => string | null = () => null
let alNoAutorizado: () => void = () => {}

export function configurarHttp(opciones: {
  obtenerToken: () => string | null
  alNoAutorizado: () => void
}): void {
  obtenerToken = opciones.obtenerToken
  alNoAutorizado = opciones.alNoAutorizado
}

type Metodo = 'GET' | 'POST' | 'PATCH'

interface OpcionesPeticion<T> {
  metodo?: Metodo
  cuerpo?: unknown
  query?: Record<string, string>
  esquema: z.ZodType<T>
  /** Login: ahí un 401 significa credenciales inválidas, no sesión expirada. */
  sinToken?: boolean
  /** Token explícito (restaurar sesión antes de que AuthContext lo publique). */
  token?: string
}

function construirUrl(ruta: string, query?: Record<string, string>): string {
  const params = query ? `?${new URLSearchParams(query).toString()}` : ''
  return `${BASE}${ruta}${params}`
}

async function leerJson(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return null
  }
}

async function aApiError(respuesta: Response): Promise<ApiError> {
  if (respuesta.status >= 500) return new ApiError(respuesta.status, MENSAJE_INESPERADO)
  const resultado = ErrorResponseSchema.safeParse(await leerJson(respuesta))
  if (resultado.success) {
    return new ApiError(respuesta.status, resultado.data.message, resultado.data.details ?? {})
  }
  return new ApiError(respuesta.status, MENSAJE_INESPERADO)
}

/** Único punto de salida HTTP de la aplicación (sin Axios). */
export async function peticion<T>(
  ruta: string,
  { metodo = 'GET', cuerpo, query, esquema, sinToken = false, token }: OpcionesPeticion<T>,
): Promise<T> {
  const encabezados: Record<string, string> = { Accept: 'application/json' }
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'
  const portador = sinToken ? null : (token ?? obtenerToken())
  if (portador) encabezados.Authorization = `Bearer ${portador}`

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta, query), {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ApiError(0, MENSAJE_RED)
  }

  if (!respuesta.ok) {
    const error = await aApiError(respuesta)
    // FR-FE-AUTH-005: un 401 con sesión activa cierra la sesión local.
    if (respuesta.status === 401 && portador && token === undefined) alNoAutorizado()
    throw error
  }

  const resultado = esquema.safeParse(await leerJson(respuesta))
  if (!resultado.success) throw new ApiError(500, MENSAJE_INESPERADO)
  return resultado.data
}

/** Segmento de ruta codificado. */
export function seg(valor: string | number): string {
  return encodeURIComponent(String(valor))
}
