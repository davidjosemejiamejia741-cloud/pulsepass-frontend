import { peticion, seg } from '../../lib/http'
import { EventoSchema, ListaEventosSchema, type CrearEventoRequest } from './tipos'

export const eventosApi = {
  /** 5. GET /api/events/published */
  publicados: () => peticion('/events/published', { esquema: ListaEventosSchema }),
  /** 4. GET /api/events/{eventCode} */
  porCodigo: (eventCode: string) =>
    peticion(`/events/${seg(eventCode)}`, { esquema: EventoSchema }),
  /** 8. GET /api/events/by-artist?stageName= */
  porArtista: (stageName: string) =>
    peticion('/events/by-artist', { esquema: ListaEventosSchema, query: { stageName } }),
  /** 3. POST /api/events */
  crear: (datos: CrearEventoRequest) =>
    peticion('/events', { metodo: 'POST', cuerpo: datos, esquema: EventoSchema }),
  /** 6. PATCH /api/events/{eventCode}/publish */
  publicar: (eventCode: string) =>
    peticion(`/events/${seg(eventCode)}/publish`, { metodo: 'PATCH', esquema: EventoSchema }),
  /** 7. POST /api/events/{eventCode}/artists/{artistId} */
  asociarArtista: (eventCode: string, artistId: number) =>
    peticion(`/events/${seg(eventCode)}/artists/${seg(artistId)}`, {
      metodo: 'POST',
      esquema: EventoSchema,
    }),
}
