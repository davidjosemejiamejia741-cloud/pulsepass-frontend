import { peticion, seg } from '../../lib/http'
import { ListaTicketsSchema, TicketSchema, type CompraTicketRequest } from './tipos'

export const ticketsApi = {
  /** 15. POST /api/tickets */
  comprar: (datos: CompraTicketRequest) =>
    peticion('/tickets', { metodo: 'POST', cuerpo: datos, esquema: TicketSchema }),
  /** 16. GET /api/tickets/{ticketCode} */
  porCodigo: (ticketCode: string) =>
    peticion(`/tickets/${seg(ticketCode)}`, { esquema: TicketSchema }),
  /** 17. GET /api/tickets/by-user?email= */
  porUsuario: (email: string) =>
    peticion('/tickets/by-user', { esquema: ListaTicketsSchema, query: { email } }),
  /** 18. GET /api/events/{eventCode}/tickets/paid */
  pagadosPorEvento: (eventCode: string) =>
    peticion(`/events/${seg(eventCode)}/tickets/paid`, { esquema: ListaTicketsSchema }),
  /** 19. PATCH /api/tickets/{ticketCode}/cancel */
  cancelar: (ticketCode: string) =>
    peticion(`/tickets/${seg(ticketCode)}/cancel`, { metodo: 'PATCH', esquema: TicketSchema }),
  /** 20. PATCH /api/tickets/{ticketCode}/use */
  usar: (ticketCode: string) =>
    peticion(`/tickets/${seg(ticketCode)}/use`, { metodo: 'PATCH', esquema: TicketSchema }),
}
