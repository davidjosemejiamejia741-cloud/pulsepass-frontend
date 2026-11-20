import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { CLAVE_DEMO, db } from './mocks/datos'
import { servidor } from './setup'
import { renderConProveedores, sesionComo } from './utils'

describe('Catálogo y eventos', () => {
  it('TEST-FE-EVT-001: el anónimo ve la cartelera publicada (AC-FE-001)', async () => {
    renderConProveedores('/eventos')
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('6 eventos')).toBeInTheDocument()
    expect(screen.queryByText('Borrador de prueba')).not.toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: el filtro de texto persiste en la URL', async () => {
    const { usuario, router } = renderConProveedores('/eventos')
    await usuario.type(await screen.findByLabelText('Buscar por nombre'), 'jazz')
    await waitFor(() => expect(router.state.location.search).toBe('?q=jazz'))
    expect(await screen.findByText('1 evento')).toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: estado vacío del filtro', async () => {
    renderConProveedores('/eventos?q=zzz')
    expect(await screen.findByText('Sin resultados para tu búsqueda')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-004: un error de red muestra "Reintentar"', async () => {
    servidor.use(http.get('*/api/events/published', () => HttpResponse.error()))
    renderConProveedores('/eventos')
    expect(await screen.findByText('No pudimos conectar con el servidor.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005: detalle con artistas, edad mínima y sede (AC-FE-002)', async () => {
    renderConProveedores('/eventos/CMF-2026')
    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Edad mínima: 18')).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(await screen.findByText(/Santa Marta · Capacidad 3/)).toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: un borrador o código inexistente muestra "Evento no disponible" (AC-FE-003)', async () => {
    renderConProveedores('/eventos/BOR-2027')
    expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument()
  })

  it('TEST-FE-ART-001: /artistas/abc es 404 de UI sin llamar a la API', async () => {
    renderConProveedores('/artistas/abc')
    expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
  })

  it('TEST-FE-GEN-001: una ruta inexistente muestra 404 (AC-FE-020)', async () => {
    renderConProveedores('/no-existe')
    expect(await screen.findByText('404')).toBeInTheDocument()
  })
})

describe('Compra y tickets', () => {
  it('TEST-FE-TKT-001: el anónimo que compra va a /login y vuelve al evento (AC-FE-004)', async () => {
    const { usuario, router } = renderConProveedores('/eventos/CMF-2026')
    const botones = await screen.findAllByRole('button', { name: 'Inicia sesión para comprar' })
    await usuario.click(botones[0] as HTMLElement)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await usuario.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await usuario.type(screen.getByLabelText('Contraseña'), CLAVE_DEMO)
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/eventos/CMF-2026'))
  })

  it('TEST-FE-TKT-002: compra VIP con el email de la sesión y navega a la confirmación (AC-FE-010)', async () => {
    let cuerpo: unknown = null
    servidor.events.on('request:start', async ({ request }) => {
      if (request.method === 'POST' && request.url.endsWith('/api/tickets'))
        cuerpo = await request.clone().json()
    })
    await sesionComo('carlos')
    const { usuario, router } = renderConProveedores('/eventos/CMF-2026')
    await usuario.click(await screen.findByRole('radio', { name: 'VIP' }))
    const comprar = screen.getAllByRole('button', { name: 'Comprar entrada' })
    await usuario.click(comprar[0] as HTMLElement)
    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar compra' })
    expect(within(dialogo).getByText('carlos@pulsepass.test')).toBeInTheDocument()
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toMatch(/^\/compra\/confirmacion\/TKT-/),
    )
    expect(await screen.findByText('¡Compra realizada con éxito!')).toBeInTheDocument()
    expect(cuerpo).toEqual({
      userEmail: 'carlos@pulsepass.test',
      eventCode: 'CMF-2026',
      type: 'VIP',
    })
  })

  it('TEST-FE-TKT-003: un 409 por edad se muestra en el modal y no navega (AC-FE-011)', async () => {
    await sesionComo('laura')
    const { usuario, router } = renderConProveedores('/eventos/CMF-2026')
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    await usuario.click(
      screen.getAllByRole('button', { name: 'Comprar entrada' })[0] as HTMLElement,
    )
    const dialogo = await screen.findByRole('dialog')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))
    expect(
      await within(dialogo).findByText('El usuario no cumple la edad mínima del evento.'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
  })

  it('TEST-FE-TKT-005: Mis tickets lista los propios y filtra por estado', async () => {
    await sesionComo('andrea')
    const { usuario } = renderConProveedores('/mis-tickets')
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    await usuario.click(screen.getByRole('button', { name: 'Usados' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Usados' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('TEST-FE-TKT-007: cancelar un ticket PAID lo deja CANCELLED (AC-FE-012)', async () => {
    await sesionComo('andrea')
    const { usuario } = renderConProveedores('/mis-tickets')
    await usuario.click(
      await screen.findByRole('button', { name: 'Cancelar el ticket TKT-8F2A1C' }),
    )
    const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getAllByText('CANCELLED')).toHaveLength(2))
    expect(db.tickets.find((t) => t.ticketCode === 'TKT-8F2A1C')?.status).toBe('CANCELLED')
  })

  it('TEST-FE-TKT-008: un ticket USED no muestra "Cancelar" (AC-FE-013)', async () => {
    await sesionComo('andrea')
    renderConProveedores('/mis-tickets')
    await screen.findByText('Noche de Jazz y Cultura')
    expect(
      screen.queryByRole('button', { name: 'Cancelar el ticket TKT-5C90E2' }),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: el ticket de otra persona muestra "Ticket no disponible" (AC-FE-014)', async () => {
    await sesionComo('andrea')
    renderConProveedores('/mis-tickets/TKT-91B07D')
    expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
    expect(screen.queryByText('carlos@pulsepass.test')).not.toBeInTheDocument()
  })
})

describe('STAFF y ADMIN', () => {
  it('TEST-FE-STF-001/002: marcar como usado y repetir da 409 (AC-FE-016)', async () => {
    await sesionComo('staff')
    const { usuario } = renderConProveedores('/staff/validacion')
    const campo = await screen.findByLabelText('Código de ticket')
    await usuario.type(campo, 'TKT-8F2A1C{Enter}')
    await usuario.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()
    expect(campo).toHaveValue('')
    await usuario.type(campo, 'TKT-8F2A1C{Enter}')
    await usuario.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByText('El ticket ya fue utilizado.')).toBeInTheDocument()
  })

  it('TEST-FE-STF-004: tickets pagados por evento', async () => {
    await sesionComo('staff')
    renderConProveedores('/staff/eventos/CMF-2026/tickets')
    expect(await screen.findByText('Total: 2')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-001: crear evento con campos vacíos no llama a la API (AC-FE-017)', async () => {
    await sesionComo('admin')
    const peticiones: string[] = []
    servidor.events.on('request:start', ({ request }) =>
      peticiones.push(`${request.method} ${request.url}`),
    )
    const { usuario } = renderConProveedores('/admin/eventos/nuevo')
    await usuario.click(await screen.findByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
    expect(screen.getByText('Elige la sede del evento')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.startsWith('POST'))).toHaveLength(0)
  })

  it('TEST-FE-ADM-004: publicar un borrador cambia el badge a PUBLISHED (AC-FE-018)', async () => {
    await sesionComo('admin')
    const { usuario } = renderConProveedores('/admin/eventos/BOR-2027')
    await usuario.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Publicar evento' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-005: asociar un artista lo muestra en el evento', async () => {
    await sesionComo('admin')
    const { usuario } = renderConProveedores('/admin/eventos/BOR-2027')
    await screen.findByText('Sin artistas asociados.')
    await usuario.selectOptions(await screen.findByLabelText('Agregar artista'), 'Neon Waves')
    await usuario.click(screen.getByRole('button', { name: 'Asociar' }))
    await waitFor(() =>
      expect(screen.queryByText('Sin artistas asociados.')).not.toBeInTheDocument(),
    )
    expect(
      db.eventos.find((e) => e.eventCode === 'BOR-2027')?.artists.map((a) => a.stageName),
    ).toEqual(['Neon Waves'])
  })

  it('TEST-FE-AUTH: un 401 durante la sesión cierra sesión y redirige a /login (AC-FE-019)', async () => {
    await sesionComo('andrea')
    const { router } = renderConProveedores('/cuenta')
    await screen.findByRole('heading', { name: 'Mi cuenta' })
    servidor.use(
      http.get('*/api/tickets/by-user', () =>
        HttpResponse.json({ status: 401, message: 'expired' }, { status: 401 }),
      ),
    )
    await router.navigate('/mis-tickets')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  })
})
