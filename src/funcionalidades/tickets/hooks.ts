import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUsuarioSesion } from '../auth/AuthContext'
import { clavesEventos } from '../eventos/hooks'
import { ticketsApi } from './api'
import type { Ticket, TicketType } from './tipos'

export const clavesTickets = {
  usuario: (email: string) => ['tickets', 'usuario', email] as const,
  detalle: (ticketCode: string) => ['ticket', ticketCode] as const,
  pagados: (eventCode: string) => ['tickets', 'pagados', eventCode] as const,
}

const QUINCE_S = 15_000

export function useMisTickets() {
  const usuario = useUsuarioSesion()
  const email = usuario?.email ?? ''
  return useQuery({
    queryKey: clavesTickets.usuario(email),
    queryFn: () => ticketsApi.porUsuario(email),
    enabled: Boolean(email),
    staleTime: QUINCE_S,
  })
}

export function useTicket(ticketCode: string | undefined) {
  return useQuery({
    queryKey: clavesTickets.detalle(ticketCode ?? ''),
    queryFn: () => ticketsApi.porCodigo(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
    staleTime: QUINCE_S,
  })
}

/** Validación de ingreso: consulta bajo demanda (enabled solo tras pulsar Buscar). */
export function useBuscarTicket(ticketCode: string | null) {
  return useQuery({
    queryKey: clavesTickets.detalle(ticketCode ?? ''),
    queryFn: () => ticketsApi.porCodigo(ticketCode ?? ''),
    enabled: ticketCode !== null,
    staleTime: 0,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: clavesTickets.pagados(eventCode ?? ''),
    queryFn: () => ticketsApi.pagadosPorEvento(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: QUINCE_S,
  })
}

/** FR-FE-TKT-001: el email lo pone el hook desde la sesión; la UI nunca lo edita. */
export function useComprarTicket() {
  const qc = useQueryClient()
  const usuario = useUsuarioSesion()
  return useMutation({
    mutationFn: ({ eventCode, type }: { eventCode: string; type: TicketType }) => {
      if (!usuario) return Promise.reject(new Error('Sin sesión'))
      return ticketsApi.comprar({ userEmail: usuario.email, eventCode, type })
    },
    onSuccess: async (ticket) => {
      qc.setQueryData(clavesTickets.detalle(ticket.ticketCode), ticket)
      await Promise.all([
        qc.invalidateQueries({ queryKey: clavesTickets.usuario(ticket.userEmail) }),
        qc.invalidateQueries({ queryKey: clavesEventos.detalle(ticket.eventCode) }),
      ])
    },
  })
}

async function invalidarTrasCambio(qc: ReturnType<typeof useQueryClient>, ticket: Ticket) {
  qc.setQueryData(clavesTickets.detalle(ticket.ticketCode), ticket)
  await Promise.all([
    qc.invalidateQueries({ queryKey: clavesTickets.usuario(ticket.userEmail) }),
    qc.invalidateQueries({ queryKey: clavesTickets.pagados(ticket.eventCode) }),
  ])
}

export function useCancelarTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => ticketsApi.cancelar(ticketCode),
    onSuccess: (ticket) => invalidarTrasCambio(qc, ticket),
  })
}

export function useUsarTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => ticketsApi.usar(ticketCode),
    onSuccess: (ticket) => invalidarTrasCambio(qc, ticket),
  })
}
