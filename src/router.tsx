import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { Layout } from './layouts/Layout'
import { RutaPorRol } from './layouts/RutaPorRol'
import { RutaProtegida } from './layouts/RutaProtegida'
import { SoloAnonimo } from './layouts/SoloAnonimo'
import { ROLES_SECCION } from './lib/rutas'
import ErrorPagina from './pages/ErrorPagina'
import Inicio from './pages/Inicio'

/** FE-012: toda página se carga de forma perezosa salvo Layout e Inicio. */
type Pagina = () => Promise<{ default: ComponentType }>
const perezosa =
  (importar: Pagina): RouteObject['lazy'] =>
  async () => ({ Component: (await importar()).default })

function PantallaCarga() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-dvh items-center justify-center text-sm text-slate-500"
    >
      Cargando…
    </div>
  )
}

/** 8.2 Árbol de rutas. Exportado para reutilizarlo en pruebas con createMemoryRouter. */
export const rutas: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPagina />,
    HydrateFallback: PantallaCarga,
    children: [
      { index: true, Component: Inicio, handle: { anchoCompleto: true } },
      { path: 'eventos', lazy: perezosa(() => import('./pages/CatalogoEventos')) },
      { path: 'eventos/:eventCode', lazy: perezosa(() => import('./pages/DetalleEvento')) },
      { path: 'artistas', lazy: perezosa(() => import('./pages/ListaArtistas')) },
      { path: 'artistas/:id', lazy: perezosa(() => import('./pages/DetalleArtista')) },
      { path: 'sedes', lazy: perezosa(() => import('./pages/ListaSedes')) },
      { path: 'sedes/:code', lazy: perezosa(() => import('./pages/DetalleSede')) },
      {
        Component: SoloAnonimo,
        children: [
          { path: 'login', lazy: perezosa(() => import('./pages/Login')) },
          { path: 'registro', lazy: perezosa(() => import('./pages/Registro')) },
        ],
      },
      {
        Component: RutaProtegida,
        children: [{ path: 'cuenta', lazy: perezosa(() => import('./pages/Cuenta')) }],
      },
      {
        element: <RutaPorRol roles={ROLES_SECCION.usuario} />,
        children: [
          { path: 'mis-tickets', lazy: perezosa(() => import('./pages/MisTickets')) },
          {
            path: 'mis-tickets/:ticketCode',
            lazy: perezosa(() => import('./pages/DetalleTicket')),
          },
          {
            path: 'compra/confirmacion/:ticketCode',
            lazy: perezosa(() => import('./pages/ConfirmacionCompra')),
          },
        ],
      },
      {
        element: <RutaPorRol roles={ROLES_SECCION.staff} />,
        children: [
          { path: 'staff/validacion', lazy: perezosa(() => import('./pages/ValidacionIngreso')) },
          // Sin código: muestra solo el selector de evento (destino del enlace "Tickets pagados" de la navbar).
          { path: 'staff/eventos', lazy: perezosa(() => import('./pages/TicketsPagadosEvento')) },
          {
            path: 'staff/eventos/:eventCode/tickets',
            lazy: perezosa(() => import('./pages/TicketsPagadosEvento')),
          },
        ],
      },
      {
        element: <RutaPorRol roles={ROLES_SECCION.admin} />,
        children: [
          { path: 'admin/eventos', lazy: perezosa(() => import('./pages/AdminEventos')) },
          { path: 'admin/eventos/nuevo', lazy: perezosa(() => import('./pages/AdminCrearEvento')) },
          {
            path: 'admin/eventos/:eventCode',
            lazy: perezosa(() => import('./pages/AdminGestionEvento')),
          },
        ],
      },
      { path: '403', lazy: perezosa(() => import('./pages/SinPermisos')) },
      { path: '*', lazy: perezosa(() => import('./pages/NoEncontrada')) },
    ],
  },
]

export const router = createBrowserRouter(rutas)
