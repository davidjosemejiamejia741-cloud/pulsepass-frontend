import clsx from 'clsx'
import { Link } from 'react-router'
import { BadgeEstadoTicket } from '../../../componentes/Badge'
import { Boton, baseBoton, estilosBoton, tamanosBoton } from '../../../componentes/Boton'
import { claseTarjeta } from '../../../componentes/Tarjeta'
import { CodigoTexto } from '../../../componentes/Varios'
import { formatearFechaDia2, formatearPrecio } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { Ticket } from '../tipos'

interface Props {
  ticket: Ticket
  onCancelar: (ticket: Ticket) => void
}

export function TarjetaTicket({ ticket, onCancelar }: Props) {
  return (
    <article className={clsx(claseTarjeta, 'p-4 sm:p-5')}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{ticket.eventName}</h2>
        <BadgeEstadoTicket estado={ticket.status} />
      </div>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        <CodigoTexto>{ticket.ticketCode}</CodigoTexto> · {ticket.type} ·{' '}
        {formatearPrecio(ticket.price)} · {formatearFechaDia2(ticket.purchaseDate)}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Link
          to={RUTAS.detalleTicket(ticket.ticketCode)}
          className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.secundario)}
          aria-label={`Ver detalle del ticket ${ticket.ticketCode}`}
        >
          Ver detalle
        </Link>
        {/* Visible solo si PAID: es UX; el backend sigue siendo la autoridad (409). */}
        {ticket.status === 'PAID' && (
          <Boton
            variante="peligro"
            tamano="sm"
            onClick={() => onCancelar(ticket)}
            aria-label={`Cancelar el ticket ${ticket.ticketCode}`}
          >
            Cancelar
          </Boton>
        )}
      </div>
    </article>
  )
}
