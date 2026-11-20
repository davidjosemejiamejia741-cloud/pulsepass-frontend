import { useState } from 'react'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { FiltroChips, TituloPagina } from '../componentes/Varios'
import { ModalConfirmarCancelacion } from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { TarjetaTicket } from '../funcionalidades/tickets/componentes/TarjetaTicket'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { Ticket, TicketStatus } from '../funcionalidades/tickets/tipos'
import { RUTAS } from '../lib/rutas'

type Filtro = 'TODOS' | Extract<TicketStatus, 'PAID' | 'USED' | 'CANCELLED'>

const FILTROS = [
  { valor: 'TODOS', texto: 'Todos' },
  { valor: 'PAID', texto: 'Pagados' },
  { valor: 'USED', texto: 'Usados' },
  { valor: 'CANCELLED', texto: 'Cancelados' },
] as const satisfies readonly { valor: Filtro; texto: string }[]

/** 9.11 Mis tickets: GET /api/tickets/by-user con el email de la sesión; filtro en cliente. */
export default function MisTickets() {
  const tickets = useMisTickets()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [aCancelar, setACancelar] = useState<Ticket | null>(null)

  const visibles = (tickets.data ?? []).filter((t) => filtro === 'TODOS' || t.status === filtro)

  return (
    <>
      <TituloPagina>Mis tickets</TituloPagina>
      <div className="mb-5">
        <FiltroChips
          etiqueta="Filtrar por estado"
          opciones={FILTROS}
          valor={filtro}
          onCambiar={setFiltro}
        />
      </div>
      {tickets.isPending ? (
        <Cargando />
      ) : tickets.isError ? (
        <EstadoError error={tickets.error} onReintentar={() => void tickets.refetch()} />
      ) : tickets.data.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no tienes tickets"
          accion={{ texto: 'Ver cartelera', a: RUTAS.eventos }}
        />
      ) : visibles.length === 0 ? (
        <EstadoVacio mensaje="No hay tickets con este estado" />
      ) : (
        <ul className="space-y-3">
          {visibles.map((t) => (
            <li key={t.ticketCode}>
              <TarjetaTicket ticket={t} onCancelar={setACancelar} />
            </li>
          ))}
        </ul>
      )}
      <ModalConfirmarCancelacion ticket={aCancelar} onCerrar={() => setACancelar(null)} />
    </>
  )
}
