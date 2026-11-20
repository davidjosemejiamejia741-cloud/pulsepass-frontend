import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError, configurarHttp, peticion } from '../lib/http'
import { formatearPrecio } from '../lib/formato'
import { debeReintentar } from '../lib/queryClient'
import { servidor } from './setup'

const Esquema = z.object({ ok: z.boolean() })

describe('lib/http', () => {
  it('TEST-FE-LIB-001: envía el token solo en Authorization: Bearer', async () => {
    let auth: string | null = null
    let url = ''
    servidor.use(
      http.get('*/api/prueba', ({ request }) => {
        auth = request.headers.get('Authorization')
        url = request.url
        return HttpResponse.json({ ok: true })
      }),
    )
    configurarHttp({ obtenerToken: () => 'secreto-123', alNoAutorizado: () => {} })
    await peticion('/prueba', { esquema: Esquema })
    expect(auth).toBe('Bearer secreto-123')
    expect(url).not.toContain('secreto-123') // QT-FE-007: nunca en la URL
  })

  it('TEST-FE-LIB-002: convierte ErrorResponse en ApiError con status, message y details', async () => {
    servidor.use(
      http.get('*/api/prueba', () =>
        HttpResponse.json(
          {
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: { name: 'requerido' },
          },
          { status: 400 },
        ),
      ),
    )
    const error = await peticion('/prueba', { esquema: Esquema }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Validation failed',
      details: { name: 'requerido' },
    })
  })

  it('TEST-FE-LIB-003: un cuerpo de error inválido produce un ApiError genérico', async () => {
    servidor.use(
      http.get('*/api/prueba', () => new HttpResponse('<html>boom</html>', { status: 409 })),
    )
    const error = await peticion('/prueba', { esquema: Esquema }).catch((e: unknown) => e)
    expect(error).toMatchObject({
      status: 409,
      message: 'Ocurrió un error inesperado. Inténtalo más tarde.',
    })
  })

  it('TEST-FE-LIB-004: un 401 con sesión activa dispara el cierre de sesión', async () => {
    const alNoAutorizado = vi.fn()
    servidor.use(
      http.get('*/api/prueba', () =>
        HttpResponse.json({ status: 401, message: 'expired' }, { status: 401 }),
      ),
    )
    configurarHttp({ obtenerToken: () => 'vencido', alNoAutorizado })
    await expect(peticion('/prueba', { esquema: Esquema })).rejects.toBeInstanceOf(ApiError)
    expect(alNoAutorizado).toHaveBeenCalledTimes(1)
  })

  it('la respuesta que no cumple el esquema zod se rechaza', async () => {
    servidor.use(http.get('*/api/prueba', () => HttpResponse.json({ ok: 'sí' })))
    await expect(peticion('/prueba', { esquema: Esquema })).rejects.toMatchObject({ status: 500 })
  })

  it('no reintenta 4xx y reintenta una vez red/5xx', () => {
    expect(debeReintentar(0, new ApiError(404, 'x'))).toBe(false)
    expect(debeReintentar(0, new ApiError(500, 'x'))).toBe(true)
    expect(debeReintentar(1, new ApiError(0, 'x'))).toBe(false)
  })
})

describe('PrecioCOP', () => {
  it('TEST-FE-LIB-005: formatea 250000 como pesos colombianos', () => {
    expect(formatearPrecio(250000)).toMatch(/^\$\s?250\.000$/)
  })
})
