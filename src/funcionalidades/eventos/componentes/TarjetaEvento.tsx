import clsx from 'clsx'
import { Link } from 'react-router'
import { BadgeEstadoEvento } from '../../../componentes/Badge'
import { IconoCalendario, IconoUbicacion } from '../../../componentes/Iconos'
import { claseTarjeta } from '../../../componentes/Tarjeta'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { EventoResumen } from '../tipos'
import { EtiquetaCategoria, PanelCategoria } from './PanelCategoria'

/** La tarjeta completa es un Link a /eventos/:eventCode (9.4). */
export function TarjetaEvento({ evento }: { evento: EventoResumen }) {
  return (
    <Link
      to={RUTAS.detalleEvento(evento.eventCode)}
      className={clsx(
        claseTarjeta,
        'group focus-visible:outline-marca-600 block overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2',
      )}
    >
      <PanelCategoria categoria={evento.category} />
      <div className="space-y-1.5 p-4">
        <EtiquetaCategoria categoria={evento.category} />
        <h3 className="group-hover:text-marca-700 dark:group-hover:text-marca-100 font-semibold text-slate-900 dark:text-slate-100">
          {evento.name}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <IconoCalendario className="size-3.5" />
          {formatearFecha(evento.eventDate)}
        </p>
        {evento.venueName && (
          <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <IconoUbicacion className="size-3.5" />
            {evento.venueName}
          </p>
        )}
        <div className="pt-1">
          <BadgeEstadoEvento estado={evento.status} />
        </div>
      </div>
    </Link>
  )
}

export function GrillaEventos({ eventos }: { eventos: readonly EventoResumen[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {eventos.map((e) => (
        <li key={e.eventCode}>
          <TarjetaEvento evento={e} />
        </li>
      ))}
    </ul>
  )
}
