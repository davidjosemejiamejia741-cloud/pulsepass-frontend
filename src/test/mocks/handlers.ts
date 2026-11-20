import { http, HttpResponse } from 'msw'
import { db, type UsuarioMock } from './datos'

/**
 * Handlers MSW de los 23 endpoints (20 de la Fase 3 + 3 de la Fase 4).
 * Simulan el contrato real del backend (DTO, ErrorResponse, códigos y roles "ROLE_*").
 * Las reglas de negocio viven aquí porque este archivo hace de backend falso.
 */
const API = '*/api'

function error(status: number, message: string, details: Record<string, string> = {}) {
  const textos: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
  }
  return HttpResponse.json(
    {
      timestamp: new Date().toISOString(),
      status,
      error: textos[status] ?? 'Error',
      message,
      details,
    },
    { status },
  )
}

function principal(request: Request): UsuarioMock | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  // En modo dev:mock una recarga reinicia la memoria de MSW: el id viaja en el token simulado,
  // igual que el backend real valida el JWT sin estado de servidor.
  const id = db.tokens.get(token) ?? Number(/^tok-(\d+)-/.exec(token)?.[1])
  return db.usuarios.find((u) => u.id === id) ?? null
}

type Resultado = { usuario: UsuarioMock } | { respuesta: Response }

function exigir(request: Request, roles?: string[]): Resultado {
  const usuario = principal(request)
  if (!usuario) return { respuesta: error(401, 'Authentication is required') }
  if (roles && !roles.some((r) => usuario.roles.includes(r)))
    return { respuesta: error(403, 'Access denied') }
  return { usuario }
}

const esPrivilegiado = (u: UsuarioMock | null) =>
  Boolean(u?.roles.some((r) => r === 'STAFF' || r === 'ADMIN'))
const resumen = (e: (typeof db.eventos)[number]) => ({
  id: e.id,
  eventCode: e.eventCode,
  name: e.name,
  category: e.category,
  status: e.status,
  eventDate: e.eventDate,
  venueName: e.venueName,
})
const sinClave = ({ password: _p, roles: _r, ...u }: UsuarioMock) => u

function edad(nacimiento: string, ahora = new Date('2026-11-19T12:00:00')) {
  const n = new Date(`${nacimiento}T00:00:00`)
  let anios = ahora.getFullYear() - n.getFullYear()
  const m = ahora.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && ahora.getDate() < n.getDate())) anios--
  return anios
}

export const handlers = [
  /* ---------- Fase 4: autenticación ---------- */
  http.post(`${API}/auth/login`, async ({ request }) => {
    const { identifier, password } = (await request.json()) as {
      identifier?: string
      password?: string
    }
    if (!identifier || !password)
      return error(400, 'Validation failed', { identifier: 'must not be blank' })
    const u = db.usuarios.find((x) => x.username === identifier || x.email === identifier)
    if (!u || u.password !== password || !u.active) return error(401, 'Invalid credentials')
    const token = `tok-${u.id}-${++db.secuencia}`
    db.tokens.set(token, u.id)
    return HttpResponse.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 900 })
  }),
  http.get(`${API}/auth/me`, ({ request }) => {
    const r = exigir(request)
    if ('respuesta' in r) return r.respuesta
    const { usuario: u } = r
    return HttpResponse.json({
      id: u.id,
      username: u.username,
      email: u.email,
      roles: u.roles.map((x) => `ROLE_${x}`).sort(),
    })
  }),

  /* ---------- Usuarios ---------- */
  http.post(`${API}/users`, async ({ request }) => {
    const datos = (await request.json()) as Partial<UsuarioMock>
    if (db.usuarios.some((u) => u.username === datos.username || u.email === datos.email)) {
      return error(409, 'User already exists')
    }
    const nuevo: UsuarioMock = {
      id: ++db.secuencia,
      username: datos.username ?? '',
      email: datos.email ?? '',
      firstName: datos.firstName ?? '',
      lastName: datos.lastName ?? '',
      birthDate: datos.birthDate ?? '',
      active: true,
      phone: null,
      city: null,
      roles: ['USER'],
      password: datos.password ?? '',
    }
    db.usuarios.push(nuevo)
    return HttpResponse.json(sinClave(nuevo), { status: 201 })
  }),
  http.get(`${API}/users/by-email`, ({ request }) => {
    const r = exigir(request)
    if ('respuesta' in r) return r.respuesta
    const email = new URL(request.url).searchParams.get('email')
    if (r.usuario.email !== email && !r.usuario.roles.includes('ADMIN'))
      return error(403, 'Access denied')
    const u = db.usuarios.find((x) => x.email === email)
    return u ? HttpResponse.json(sinClave(u)) : error(404, 'User not found')
  }),
  http.get(`${API}/users/by-username`, ({ request }) => {
    const r = exigir(request)
    if ('respuesta' in r) return r.respuesta
    const username = new URL(request.url).searchParams.get('username')
    if (r.usuario.username !== username && !r.usuario.roles.includes('ADMIN'))
      return error(403, 'Access denied')
    const u = db.usuarios.find((x) => x.username === username)
    return u ? HttpResponse.json(sinClave(u)) : error(404, 'User not found')
  }),

  /* ---------- Sedes y artistas ---------- */
  http.get(`${API}/venues/active`, () => HttpResponse.json(db.sedes.filter((s) => s.active))),
  http.get(`${API}/venues/:code`, ({ params }) => {
    const s = db.sedes.find((x) => x.code === params.code)
    return s ? HttpResponse.json(s) : error(404, 'Venue not found')
  }),
  http.get(`${API}/artists/active`, () => HttpResponse.json(db.artistas.filter((a) => a.active))),
  http.get(`${API}/artists/by-stage-name`, ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    const a = db.artistas.find((x) => x.stageName === nombre)
    return a ? HttpResponse.json(a) : error(404, 'Artist not found')
  }),
  http.get(`${API}/artists/:id`, ({ params }) => {
    const a = db.artistas.find((x) => String(x.id) === params.id)
    return a ? HttpResponse.json(a) : error(404, 'Artist not found')
  }),

  /* ---------- Eventos ---------- */
  http.get(`${API}/events/published`, () =>
    HttpResponse.json(db.eventos.filter((e) => e.status !== 'DRAFT').map(resumen)),
  ),
  http.get(`${API}/events/by-artist`, ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    return HttpResponse.json(
      db.eventos
        .filter((e) => e.status !== 'DRAFT' && e.artists.some((a) => a.stageName === nombre))
        .map(resumen),
    )
  }),
  http.get(`${API}/events/:eventCode/tickets/paid`, ({ request, params }) => {
    const r = exigir(request, ['STAFF', 'ADMIN'])
    if ('respuesta' in r) return r.respuesta
    if (!db.eventos.some((e) => e.eventCode === params.eventCode))
      return error(404, 'Event not found')
    return HttpResponse.json(
      db.tickets.filter((t) => t.eventCode === params.eventCode && t.status === 'PAID'),
    )
  }),
  http.get(`${API}/events/:eventCode`, ({ request, params }) => {
    const e = db.eventos.find((x) => x.eventCode === params.eventCode)
    // GAP-02: los borradores solo son visibles para STAFF/ADMIN.
    if (!e || (e.status === 'DRAFT' && !esPrivilegiado(principal(request))))
      return error(404, 'Event not found')
    return HttpResponse.json(e)
  }),
  http.post(`${API}/events`, async ({ request }) => {
    const r = exigir(request, ['ADMIN'])
    if ('respuesta' in r) return r.respuesta
    const d = (await request.json()) as Record<string, unknown>
    if (db.eventos.some((e) => e.eventCode === d.eventCode))
      return error(409, 'Event code already exists')
    const sede = db.sedes.find((s) => s.code === d.venueCode)
    if (!sede) return error(409, 'Venue is not valid')
    const nuevo = {
      id: ++db.secuencia,
      eventCode: String(d.eventCode),
      name: String(d.name),
      description: (d.description as string | null) ?? null,
      category: d.category as (typeof db.eventos)[number]['category'],
      status: 'DRAFT' as const,
      eventDate: String(d.eventDate),
      minimumAge: Number(d.minimumAge),
      venueCode: sede.code,
      venueName: sede.name,
      artists: [],
    }
    db.eventos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),
  http.patch(`${API}/events/:eventCode/publish`, ({ request, params }) => {
    const r = exigir(request, ['ADMIN'])
    if ('respuesta' in r) return r.respuesta
    const e = db.eventos.find((x) => x.eventCode === params.eventCode)
    if (!e) return error(404, 'Event not found')
    if (e.status !== 'DRAFT') return error(409, 'Only draft events can be published')
    e.status = 'PUBLISHED'
    return HttpResponse.json(e)
  }),
  http.post(`${API}/events/:eventCode/artists/:artistId`, ({ request, params }) => {
    const r = exigir(request, ['ADMIN'])
    if ('respuesta' in r) return r.respuesta
    const e = db.eventos.find((x) => x.eventCode === params.eventCode)
    const a = db.artistas.find((x) => String(x.id) === params.artistId)
    if (!e || !a) return error(404, 'Resource not found')
    if (e.artists.some((x) => x.id === a.id))
      return error(409, 'Artist is already associated with the event')
    e.artists = [...e.artists, a]
    return HttpResponse.json(e)
  }),

  /* ---------- Tickets ---------- */
  http.post(`${API}/tickets`, async ({ request }) => {
    const r = exigir(request, ['USER'])
    if ('respuesta' in r) return r.respuesta
    const d = (await request.json()) as {
      userEmail: string
      eventCode: string
      type: (typeof db.tickets)[number]['type']
    }
    if (d.userEmail !== r.usuario.email) return error(403, 'Access denied')
    const e = db.eventos.find((x) => x.eventCode === d.eventCode)
    if (!e || e.status === 'DRAFT') return error(404, 'Event not found')
    if (e.status !== 'PUBLISHED') return error(409, 'El evento no está disponible para la venta.')
    if (edad(r.usuario.birthDate) < e.minimumAge)
      return error(409, 'El usuario no cumple la edad mínima del evento.')
    const capacidad = db.sedes.find((s) => s.code === e.venueCode)?.capacity ?? 0
    const vendidos = db.tickets.filter(
      (t) => t.eventCode === e.eventCode && t.status !== 'CANCELLED',
    ).length
    if (vendidos >= capacidad) return error(409, 'El evento no tiene capacidad disponible.')
    const precios = { GENERAL: 120000, VIP: 250000, BACKSTAGE: 400000, STUDENT: 60000 }
    const ticket = {
      id: ++db.secuencia,
      ticketCode: `TKT-${(db.secuencia * 7919).toString(16).toUpperCase().padStart(6, '0').slice(-6)}`,
      type: d.type,
      price: precios[d.type],
      status: 'PAID' as const,
      purchaseDate: '2026-11-19T10:15:00',
      userEmail: r.usuario.email,
      eventCode: e.eventCode,
      eventName: e.name,
    }
    db.tickets.push(ticket)
    return HttpResponse.json(ticket, { status: 201 })
  }),
  http.get(`${API}/tickets/by-user`, ({ request }) => {
    const r = exigir(request)
    if ('respuesta' in r) return r.respuesta
    const email = new URL(request.url).searchParams.get('email')
    if (email !== r.usuario.email && !r.usuario.roles.includes('ADMIN'))
      return error(403, 'Access denied')
    return HttpResponse.json(db.tickets.filter((t) => t.userEmail === email))
  }),
  http.get(`${API}/tickets/:ticketCode`, ({ request, params }) => {
    const r = exigir(request)
    if ('respuesta' in r) return r.respuesta
    const t = db.tickets.find((x) => x.ticketCode === params.ticketCode)
    if (!t || (t.userEmail !== r.usuario.email && !esPrivilegiado(r.usuario)))
      return error(404, 'Ticket not found')
    return HttpResponse.json(t)
  }),
  http.patch(`${API}/tickets/:ticketCode/cancel`, ({ request, params }) => {
    const r = exigir(request, ['USER', 'ADMIN'])
    if ('respuesta' in r) return r.respuesta
    const t = db.tickets.find((x) => x.ticketCode === params.ticketCode)
    if (!t || (t.userEmail !== r.usuario.email && !r.usuario.roles.includes('ADMIN')))
      return error(404, 'Ticket not found')
    if (t.status !== 'PAID') return error(409, 'El ticket no puede cancelarse en su estado actual.')
    t.status = 'CANCELLED'
    return HttpResponse.json(t)
  }),
  http.patch(`${API}/tickets/:ticketCode/use`, ({ request, params }) => {
    const r = exigir(request, ['STAFF', 'ADMIN'])
    if ('respuesta' in r) return r.respuesta
    const t = db.tickets.find((x) => x.ticketCode === params.ticketCode)
    if (!t) return error(404, 'Ticket not found')
    if (t.status === 'USED') return error(409, 'El ticket ya fue utilizado.')
    if (t.status !== 'PAID') return error(409, 'El ticket no puede usarse en su estado actual.')
    t.status = 'USED'
    return HttpResponse.json(t)
  }),
]
