import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CLAVE_DEMO } from './mocks/datos'
import { servidor } from './setup'
import { AHORA, renderConProveedores, sesionComo } from './utils'

function contarPeticiones() {
  const urls: string[] = []
  servidor.events.on('request:start', ({ request }) => {
    urls.push(`${request.method} ${new URL(request.url).pathname}`)
  })
  return urls
}

async function ingresar(
  usuario: ReturnType<typeof renderConProveedores>['usuario'],
  nombre: string,
) {
  await usuario.type(await screen.findByLabelText('Usuario o correo'), nombre)
  await usuario.type(screen.getByLabelText('Contraseña'), CLAVE_DEMO)
  await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Cambio de cuenta (regresión 403)', () => {
  it('salir desde /mis-tickets lleva a inicio sin guardar /mis-tickets como origen', async () => {
    await sesionComo('andrea')
    const { usuario, router } = renderConProveedores('/mis-tickets')
    await screen.findByText('Caribbean Music Fest 2026', {}, { timeout: 3000 })
    await usuario.click(await screen.findByRole('button', { name: /Andrea/ }, { timeout: 3000 }))
    await usuario.click(screen.getByRole('button', { name: 'Salir' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.state).toBeNull()
    await usuario.click(
      (await screen.findAllByRole('link', { name: 'Ingresar' }))[0] as HTMLElement,
    )
    await ingresar(usuario, 'staff')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('tras el login, un origen al que el nuevo rol no puede entrar lleva a inicio, no a 403', async () => {
    const { usuario, router } = renderConProveedores('/mis-tickets')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toMatchObject({ desde: '/mis-tickets' })
    await ingresar(usuario, 'staff')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('el origen se respeta cuando el rol sí tiene acceso', async () => {
    const { usuario, router } = renderConProveedores('/staff/validacion')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await ingresar(usuario, 'staff')
    await waitFor(() => expect(router.state.location.pathname).toBe('/staff/validacion'))
  })
})

describe('Autenticación', () => {
  it('TEST-FE-AUTH-001: login válido guarda la sesión, muestra el nombre y vuelve al origen', async () => {
    const { usuario, router } = renderConProveedores('/login')
    await usuario.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await usuario.type(screen.getByLabelText('Contraseña'), CLAVE_DEMO)
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByRole('button', { name: /Andrea/ })).toBeInTheDocument()
    const guardada = sessionStorage.getItem('pulsepass.sesion') ?? ''
    expect(guardada).toContain('token')
    expect(localStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('TEST-FE-AUTH-002: login 401 muestra "Credenciales inválidas" sin distinguir la causa', async () => {
    const { usuario } = renderConProveedores('/login')
    await usuario.type(await screen.findByLabelText('Usuario o correo'), 'nadie')
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-003: login sin campos muestra errores y no llama a la API', async () => {
    const { usuario } = renderConProveedores('/login')
    const peticiones = contarPeticiones()
    await usuario.click(await screen.findByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.includes('/auth/login'))).toHaveLength(0)
  })

  it('TEST-FE-AUTH-004: registro con contraseña de 11 caracteres no llama a la API (AC-FE-005)', async () => {
    const { usuario } = renderConProveedores('/registro')
    const peticiones = contarPeticiones()
    await usuario.type(await screen.findByLabelText('Nombre de usuario'), 'nueva')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'nueva@pulsepass.test')
    await usuario.type(screen.getByLabelText('Nombres'), 'Nueva')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Persona')
    await usuario.type(screen.getByLabelText('Fecha de nacimiento'), '2000-01-01')
    await usuario.type(screen.getByLabelText(/Contraseña/), '12345678901')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(
      await screen.findByText('La contraseña debe tener al menos 12 caracteres'),
    ).toBeInTheDocument()
    expect(peticiones.filter((p) => p.startsWith('POST /api/users'))).toHaveLength(0)
  })

  it('TEST-FE-AUTH-005: registro 201 redirige a /login con aviso de éxito', async () => {
    const { usuario, router } = renderConProveedores('/registro')
    await usuario.type(await screen.findByLabelText('Nombre de usuario'), 'nueva')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'nueva@pulsepass.test')
    await usuario.type(screen.getByLabelText('Nombres'), 'Nueva')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Persona')
    await usuario.type(screen.getByLabelText('Fecha de nacimiento'), '2000-01-01')
    await usuario.type(screen.getByLabelText(/Contraseña/), 'una-clave-larga-segura')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(await screen.findByText('Cuenta creada, inicia sesión.')).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-006: registro 409 muestra un mensaje genérico', async () => {
    const { usuario } = renderConProveedores('/registro')
    await usuario.type(await screen.findByLabelText('Nombre de usuario'), 'andrea')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'andrea@pulsepass.test')
    await usuario.type(screen.getByLabelText('Nombres'), 'Andrea')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Ruiz')
    await usuario.type(screen.getByLabelText('Fecha de nacimiento'), '1998-04-12')
    await usuario.type(screen.getByLabelText(/Contraseña/), 'una-clave-larga-segura')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('El usuario o correo ya está registrado.')).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-007: RutaProtegida redirige al anónimo a /login guardando el origen', async () => {
    const { router } = renderConProveedores('/cuenta')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })
  })

  it('TEST-FE-AUTH-008: USER en /admin/eventos va a /403 (AC-FE-015)', async () => {
    await sesionComo('andrea')
    const { router } = renderConProveedores('/admin/eventos')
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
    expect(
      await screen.findByText('No tienes permisos para acceder a esta sección.'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-009: ADMIN accede a /admin/eventos', async () => {
    await sesionComo('admin')
    renderConProveedores('/admin/eventos')
    expect(
      await screen.findByRole('heading', { name: 'Administración de eventos' }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-010: cerrar sesión limpia el token y protege de nuevo las rutas', async () => {
    await sesionComo('andrea')
    const { usuario, router, queryClient } = renderConProveedores('/cuenta')
    await usuario.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    expect(queryClient.getQueryData(['usuario', 'andrea@pulsepass.test'])).toBeUndefined()
    await router.navigate('/mis-tickets')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('TEST-FE-AUTH-011: un token expirado al restaurar deja la sesión anónima', async () => {
    sessionStorage.setItem(
      'pulsepass.sesion',
      JSON.stringify({ token: 'viejo', expiraEn: AHORA - 1000 }),
    )
    renderConProveedores('/')
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    expect(within(nav).queryByText('Mis tickets')).not.toBeInTheDocument()
    expect(await screen.findAllByRole('link', { name: 'Ingresar' })).not.toHaveLength(0)
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('TEST-FE-GEN-003: la navbar muestra enlaces según el rol', async () => {
    await sesionComo('staff')
    renderConProveedores('/')
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    expect(await within(nav).findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Tickets pagados' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })
})
