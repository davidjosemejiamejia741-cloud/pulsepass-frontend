import clsx from 'clsx'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAvisos } from '../componentes/Avisos'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { baseBoton, Boton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { Cargando, EstadoError, NoDisponible } from '../componentes/Estados'
import { IconoCopiar } from '../componentes/Iconos'
import { claseTarjeta, FilaDato } from '../componentes/Tarjeta'
import { CodigoTexto, EnlaceVolver } from '../componentes/Varios'
import { useUsuarioSesion } from '../funcionalidades/auth/AuthContext'
import { ModalConfirmarCancelacion } from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { useTicket } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { esNoDisponible } from '../lib/errores'
import { formatearMarcaTiempo, formatearPrecio } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

function BotonCopiar({ texto }: { texto: string }) {
  const { mostrar } = useAvisos()
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          .writeText(texto)
          .then(() => mostrar('exito', 'Código copiado.'))
          .catch(() => mostrar('error', 'No se pudo copiar el código.'))
      }}
      className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.secundario, 'ml-2')}
    >
      <IconoCopiar className="size-4" />
      Copiar
    </button>
  )
}

/** 9.12 Detalle de ticket. Ajeno o inexistente -> "Ticket no disponible" sin revelar existencia. */
export default function DetalleTicket() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const ticket = useTicket(ticketCode)
  const sesion = useUsuarioSesion()
  const perfil = useUsuarioPorEmail(sesion?.email)
  const [aCancelar, setACancelar] = useState<Ticket | null>(null)

  if (ticket.isPending) return <Cargando filas={1} />
  if (ticket.isError) {
    if (esNoDisponible(ticket.error)) {
      return (
        <NoDisponible titulo="Ticket no disponible">
          <Link
            to={RUTAS.misTickets}
            className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
          >
            Ir a mis tickets
          </Link>
        </NoDisponible>
      )
    }
    return <EstadoError error={ticket.error} onReintentar={() => void ticket.refetch()} />
  }

  const t = ticket.data
  const titular = perfil.data ? `${perfil.data.firstName} ${perfil.data.lastName}` : t.userEmail

  return (
    <div className="mx-auto max-w-xl">
      <EnlaceVolver a={RUTAS.misTickets}>Mis tickets</EnlaceVolver>
      <article className={clsx(claseTarjeta, 'p-5 sm:p-6')}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">{t.eventName}</h1>
          <BadgeEstadoTicket estado={t.status} />
        </div>
        <dl>
          <FilaDato etiqueta="Código">
            <CodigoTexto>{t.ticketCode}</CodigoTexto>
            <BotonCopiar texto={t.ticketCode} />
          </FilaDato>
          <FilaDato etiqueta="Tipo">{t.type}</FilaDato>
          <FilaDato etiqueta="Precio">{formatearPrecio(t.price)}</FilaDato>
          <FilaDato etiqueta="Comprado el">{formatearMarcaTiempo(t.purchaseDate)}</FilaDato>
          <FilaDato etiqueta="Titular">{titular}</FilaDato>
        </dl>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          Presenta este código en el ingreso.
        </p>
      </article>
      {t.status === 'PAID' && (
        <div className="mt-4 flex justify-end">
          <Boton variante="peligro" onClick={() => setACancelar(t)}>
            Cancelar ticket
          </Boton>
        </div>
      )}
      <ModalConfirmarCancelacion ticket={aCancelar} onCerrar={() => setACancelar(null)} />
    </div>
  )
}
