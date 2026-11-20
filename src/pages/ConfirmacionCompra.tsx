import clsx from 'clsx'
import { Link, useParams } from 'react-router'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { baseBoton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { Cargando, EstadoError, NoDisponible } from '../componentes/Estados'
import { IconoCheck } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { CodigoTexto } from '../componentes/Varios'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { esNoDisponible } from '../lib/errores'
import { formatearPrecio } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

/** 9.13 Confirmación de compra. */
export default function ConfirmacionCompra() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const ticket = useTicket(ticketCode)

  if (ticket.isPending) return <Cargando filas={1} />
  if (ticket.isError) {
    if (esNoDisponible(ticket.error)) return <NoDisponible titulo="Ticket no disponible" />
    return <EstadoError error={ticket.error} onReintentar={() => void ticket.refetch()} />
  }

  const t = ticket.data
  return (
    <div className={clsx(claseTarjeta, 'mx-auto max-w-md px-6 py-8 text-center')}>
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
        <IconoCheck className="size-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">¡Compra realizada con éxito!</h1>
      <p className="mt-4 font-semibold">{t.eventName}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Ticket <CodigoTexto>{t.ticketCode}</CodigoTexto> · {t.type} · {formatearPrecio(t.price)}
      </p>
      <div className="mt-2">
        <BadgeEstadoTicket estado={t.status} />
      </div>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          to={RUTAS.misTickets}
          className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
        >
          Ver mis tickets
        </Link>
        <Link
          to={RUTAS.eventos}
          className={clsx(baseBoton, tamanosBoton.md, estilosBoton.secundario)}
        >
          Seguir explorando
        </Link>
      </div>
    </div>
  )
}
