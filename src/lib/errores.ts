import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { esApiError, MENSAJE_INESPERADO } from './http'

/** 404/403 de un recurso: la UI lo presenta como "no disponible" sin revelar existencia. */
export function esNoDisponible(error: unknown): boolean {
  return esApiError(error) && (error.status === 404 || error.status === 403)
}

export function mensajeDe(error: unknown): string {
  return esApiError(error) ? error.message : MENSAJE_INESPERADO
}

/**
 * 11.2: un 400 con details asigna cada clave a su campo con setError.
 * Devuelve el mensaje general para las claves sin campo (o null si todo se asignó).
 */
export function aplicarErroresCampos<T extends FieldValues>(
  error: unknown,
  campos: readonly Path<T>[],
  setError: UseFormSetError<T>,
): string | null {
  if (!esApiError(error)) return MENSAJE_INESPERADO
  if (error.status !== 400) return error.message
  const sobrantes: string[] = []
  for (const [clave, mensaje] of Object.entries(error.details)) {
    const campo = campos.find((c) => c === clave)
    if (campo) setError(campo, { type: 'server', message: mensaje })
    else sobrantes.push(mensaje)
  }
  if (Object.keys(error.details).length === 0) return error.message
  return sobrantes.length ? sobrantes.join(' ') : null
}
