/**
 * Datos del escenario de demostración (sección 22 del PRD) para MSW.
 * Solo se usan en pruebas y en el modo `npm run dev:mock`; nunca en el bundle de producción.
 */
import type { Artista } from '../../funcionalidades/artistas/tipos'
import type { Evento } from '../../funcionalidades/eventos/tipos'
import type { Sede } from '../../funcionalidades/sedes/tipos'
import type { Ticket } from '../../funcionalidades/tickets/tipos'
import type { Usuario } from '../../funcionalidades/usuarios/tipos'

export const CLAVE_DEMO = 'PulsePass2026!'

export interface UsuarioMock extends Usuario {
  id: number
  roles: string[]
  password: string
}

function crearDatos() {
  const sedes: Sede[] = [
    {
      id: 1,
      code: 'VEN-SMR-01',
      name: 'Marina Convention Center',
      city: 'Santa Marta',
      address: 'Cra. 1 #10-20',
      capacity: 3,
      active: true,
    },
    {
      id: 2,
      code: 'VEN-BAQ-01',
      name: 'Centro de Convenciones Caribe',
      city: 'Barranquilla',
      address: null,
      capacity: 1200,
      active: true,
    },
    {
      id: 3,
      code: 'VEN-CTG-01',
      name: 'Teatro Heredia Hall',
      city: 'Cartagena',
      address: null,
      capacity: 800,
      active: true,
    },
  ]

  const artistas: Artista[] = [
    { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electrónica', active: true },
    { id: 2, stageName: 'Neon Waves', country: 'Colombia', genre: 'Synthwave', active: true },
    {
      id: 3,
      stageName: 'Caribbean Sound',
      country: 'Colombia',
      genre: 'Fusión caribeña',
      active: true,
    },
  ]
  const [solar, neon] = artistas as [Artista, Artista, Artista]

  const eventos: Evento[] = [
    {
      id: 1,
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      category: 'MUSIC',
      status: 'PUBLISHED',
      description:
        'Tres noches de música caribeña frente a la bahía de Santa Marta, con artistas de la región y propuestas de electrónica y fusión.',
      eventDate: '2026-12-12T20:00:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: [solar, neon],
    },
    {
      id: 2,
      eventCode: 'CTC-2027',
      name: 'Cumbre Tech Caribe 2027',
      category: 'TECHNOLOGY',
      status: 'SOLD_OUT',
      description: null,
      eventDate: '2027-01-20T09:00:00',
      minimumAge: 0,
      venueCode: 'VEN-BAQ-01',
      venueName: 'Centro de Convenciones Caribe',
      artists: [],
    },
    {
      id: 3,
      eventCode: 'CUF-2027',
      name: 'Copa Universitaria de Fútbol',
      category: 'SPORTS',
      status: 'PUBLISHED',
      description: null,
      eventDate: '2027-02-06T15:00:00',
      minimumAge: 0,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: [],
    },
    {
      id: 4,
      eventCode: 'NJC-2026',
      name: 'Noche de Jazz y Cultura',
      category: 'CULTURE',
      status: 'PUBLISHED',
      description: null,
      eventDate: '2026-11-27T19:30:00',
      minimumAge: 0,
      venueCode: 'VEN-CTG-01',
      venueName: 'Teatro Heredia Hall',
      artists: [],
    },
    {
      id: 5,
      eventCode: 'FES-2027',
      name: 'Feria de Educación Superior',
      category: 'EDUCATION',
      status: 'PUBLISHED',
      description: null,
      eventDate: '2027-03-15T08:00:00',
      minimumAge: 0,
      venueCode: 'VEN-BAQ-01',
      venueName: 'Centro de Convenciones Caribe',
      artists: [],
    },
    {
      id: 6,
      eventCode: 'SUC-2026',
      name: 'Stand-up Costeño',
      category: 'ENTERTAINMENT',
      status: 'PUBLISHED',
      description: null,
      eventDate: '2026-12-04T21:00:00',
      minimumAge: 0,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: [],
    },
    {
      id: 7,
      eventCode: 'BOR-2027',
      name: 'Borrador de prueba',
      category: 'MUSIC',
      status: 'DRAFT',
      description: null,
      eventDate: '2027-05-01T20:00:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
      venueName: 'Marina Convention Center',
      artists: [],
    },
  ]

  const usuarios: UsuarioMock[] = [
    {
      id: 1,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      firstName: 'Andrea',
      lastName: 'Ruiz',
      birthDate: '1998-04-12',
      active: true,
      phone: null,
      city: 'Santa Marta',
      roles: ['USER'],
      password: CLAVE_DEMO,
    },
    {
      id: 2,
      username: 'carlos',
      email: 'carlos@pulsepass.test',
      firstName: 'Carlos',
      lastName: 'Peña',
      birthDate: '1995-08-03',
      active: true,
      phone: null,
      city: null,
      roles: ['USER'],
      password: CLAVE_DEMO,
    },
    {
      id: 3,
      username: 'laura',
      email: 'laura@pulsepass.test',
      firstName: 'Laura',
      lastName: 'Gómez',
      birthDate: '2009-06-01',
      active: true,
      phone: null,
      city: null,
      roles: ['USER'],
      password: CLAVE_DEMO,
    },
    {
      id: 4,
      username: 'miguel',
      email: 'miguel@pulsepass.test',
      firstName: 'Miguel',
      lastName: 'Torres',
      birthDate: '1990-01-15',
      active: false,
      phone: null,
      city: null,
      roles: ['USER'],
      password: CLAVE_DEMO,
    },
    {
      id: 5,
      username: 'staff',
      email: 'staff@pulsepass.test',
      firstName: 'Sofía',
      lastName: 'Staff',
      birthDate: '1992-02-02',
      active: true,
      phone: null,
      city: null,
      roles: ['STAFF'],
      password: CLAVE_DEMO,
    },
    {
      id: 6,
      username: 'admin',
      email: 'admin@pulsepass.test',
      firstName: 'Administración',
      lastName: '',
      birthDate: '1985-05-05',
      active: true,
      phone: null,
      city: null,
      roles: ['ADMIN'],
      password: CLAVE_DEMO,
    },
  ]

  const tickets: Ticket[] = [
    {
      id: 1,
      ticketCode: 'TKT-8F2A1C',
      type: 'VIP',
      price: 250000,
      status: 'PAID',
      purchaseDate: '2026-11-05T14:32:00',
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'CMF-2026',
      eventName: 'Caribbean Music Fest 2026',
    },
    {
      id: 2,
      ticketCode: 'TKT-91B07D',
      type: 'GENERAL',
      price: 120000,
      status: 'PAID',
      purchaseDate: '2026-11-06T10:00:00',
      userEmail: 'carlos@pulsepass.test',
      eventCode: 'CMF-2026',
      eventName: 'Caribbean Music Fest 2026',
    },
    {
      id: 3,
      ticketCode: 'TKT-5C90E2',
      type: 'GENERAL',
      price: 90000,
      status: 'USED',
      purchaseDate: '2026-10-12T18:00:00',
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'NJC-2026',
      eventName: 'Noche de Jazz y Cultura',
    },
    {
      id: 4,
      ticketCode: 'TKT-77AD13',
      type: 'STUDENT',
      price: 60000,
      status: 'CANCELLED',
      purchaseDate: '2026-10-01T12:00:00',
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'SUC-2026',
      eventName: 'Stand-up Costeño',
    },
  ]

  return {
    sedes,
    artistas,
    eventos,
    usuarios,
    tickets,
    tokens: new Map<string, number>(),
    secuencia: 100,
  }
}

export let db = crearDatos()

export function reiniciarDatos(): void {
  db = crearDatos()
}
