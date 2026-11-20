import { z } from 'zod'

export const TIPOS_TICKET = ['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'] as const
export const TicketTypeSchema = z.enum(TIPOS_TICKET)
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

/** TicketResponse. El precio (BigDecimal) puede llegar como número o texto. */
export const TicketSchema = z.object({
  id: z.number().nullish(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.coerce.number(),
  status: TicketStatusSchema,
  purchaseDate: z.string(),
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
})
export type Ticket = z.infer<typeof TicketSchema>
export const ListaTicketsSchema = z.array(TicketSchema)

/** PurchaseTicketRequest: el email SIEMPRE sale de la sesión, nunca de un campo editable. */
export interface CompraTicketRequest {
  userEmail: string
  eventCode: string
  type: TicketType
}

export const CompraFormSchema = z.object({ type: TicketTypeSchema })

export const BuscarTicketFormSchema = z.object({
  ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})
export type BuscarTicketForm = z.infer<typeof BuscarTicketFormSchema>
