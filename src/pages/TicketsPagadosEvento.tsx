import clsx from 'clsx'
import { useId, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAvisos } from '../componentes/Avisos'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { claseControl } from '../componentes/Campo'
import { Cargando, EstadoError, EstadoVacio, NoDisponible } from '../componentes/Estados'
import { Tabla, type ColumnaTabla } from '../componentes/Tabla'
import { claseTarjeta } from '../componentes/Tarjeta'
import { CodigoTexto } from '../componentes/Varios'
import { useEvento, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { useTicketsPagadosPorEvento, useUsarTicket } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { esNoDisponible, mensajeDe } from '../lib/errores'
import { formatearPrecio } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

function SelectorEvento({ inicial }: { inicial: string }) {
  const navigate = useNavigate()
  const id = useId()
  const [valor, setValor] = useState(inicial)
  const publicados = useEventosPublicados()

  function ir(e: FormEvent) {
    e.preventDefault()
    const codigo = valor.trim()
    if (codigo) void navigate(RUTAS.ticketsPagados(codigo))
  }

  return (
    <form onSubmit={ir} className="w-full sm:w-auto">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        Evento
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          list={`${id}-lista`}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Código del evento"
          className={clsx(claseControl, 'border-slate-300 font-mono sm:w-48 dark:border-slate-700')}
        />
        <datalist id={`${id}-lista`}>
          {publicados.data?.map((e) => (
            <option key={e.eventCode} value={e.eventCode}>
              {e.name}
            </option>
          ))}
        </datalist>
        <Boton type="submit" variante="secundario">
          Ir
        </Boton>
      </div>
    </form>
  )
}

function Listado({ eventCode }: { eventCode: string }) {
  const evento = useEvento(eventCode)
  const tickets = useTicketsPagadosPorEvento(eventCode)
  const usar = useUsarTicket()
  const { mostrar } = useAvisos()

  function usarTicket(t: Ticket) {
    usar.mutate(t.ticketCode, {
      onSuccess: () => mostrar('exito', `Ingreso registrado: ${t.ticketCode}.`),
      onError: (error) => mostrar('error', mensajeDe(error)),
    })
  }

  if (evento.isError && esNoDisponible(evento.error))
    return <NoDisponible titulo="Evento no encontrado" />
  if (tickets.isPending) return <Cargando />
  if (tickets.isError) {
    if (esNoDisponible(tickets.error)) return <NoDisponible titulo="Evento no encontrado" />
    return <EstadoError error={tickets.error} onReintentar={() => void tickets.refetch()} />
  }

  const botonUsar = (t: Ticket, ancho = false) => (
    <Boton
      tamano="sm"
      anchoCompleto={ancho}
      cargando={usar.isPending && usar.variables === t.ticketCode}
      onClick={() => usarTicket(t)}
      aria-label={`Marcar como usado el ticket ${t.ticketCode}`}
    >
      Usar
    </Boton>
  )

  const columnas: ColumnaTabla<Ticket>[] = [
    { clave: 'codigo', titulo: 'Código', celda: (t) => <CodigoTexto>{t.ticketCode}</CodigoTexto> },
    { clave: 'tipo', titulo: 'Tipo', celda: (t) => t.type },
    { clave: 'titular', titulo: 'Titular', celda: (t) => t.userEmail },
    { clave: 'precio', titulo: 'Precio', celda: (t) => formatearPrecio(t.price) },
    { clave: 'estado', titulo: 'Estado', celda: (t) => <BadgeEstadoTicket estado={t.status} /> },
    { clave: 'accion', titulo: 'Acción', celda: (t) => botonUsar(t) },
  ]

  return (
    <>
      {evento.data && (
        <p className="-mt-4 mb-1 text-sm text-slate-600 dark:text-slate-400">{evento.data.name}</p>
      )}
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Total: {tickets.data.length}
      </p>
      {tickets.data.length === 0 ? (
        <EstadoVacio mensaje="No hay tickets pagados" />
      ) : (
        <Tabla
          etiqueta={`Tickets pagados de ${eventCode}`}
          filas={tickets.data}
          columnas={columnas}
          claveFila={(t) => t.ticketCode}
          tarjeta={(t) => (
            <article className={clsx(claseTarjeta, 'p-4')}>
              <div className="flex items-center justify-between">
                <CodigoTexto className="font-semibold">{t.ticketCode}</CodigoTexto>
                <BadgeEstadoTicket estado={t.status} />
              </div>
              <p className="mt-1 mb-3 text-sm text-slate-600 dark:text-slate-400">
                {t.type} · {t.userEmail} · {formatearPrecio(t.price)}
              </p>
              {botonUsar(t, true)}
            </article>
          )}
        />
      )}
    </>
  )
}

/** 9.15 Tickets pagados por evento (STAFF/ADMIN). */
export default function TicketsPagadosEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Tickets pagados
          {eventCode ? (
            <>
              {' '}
              · <CodigoTexto>{eventCode}</CodigoTexto>
            </>
          ) : null}
        </h1>
        <SelectorEvento key={eventCode ?? ''} inicial={eventCode ?? ''} />
      </div>
      {eventCode ? (
        <Listado eventCode={eventCode} />
      ) : (
        <EstadoVacio mensaje="Ingresa el código de un evento para ver sus tickets pagados." />
      )}
    </>
  )
}
