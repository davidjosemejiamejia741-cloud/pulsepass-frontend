import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Aviso } from '../componentes/Avisos'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { IconoBuscar } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { TituloPagina } from '../componentes/Varios'
import { useBuscarTicket, useUsarTicket } from '../funcionalidades/tickets/hooks'
import { BuscarTicketFormSchema, type BuscarTicketForm } from '../funcionalidades/tickets/tipos'
import { esApiError, MENSAJE_INESPERADO } from '../lib/http'

function mensajeBusqueda(error: unknown): string {
  if (!esApiError(error)) return MENSAJE_INESPERADO
  if (error.status === 404) return 'Ticket no encontrado.'
  if (error.status === 403) return 'Sin permisos.'
  return error.message
}

/** 9.14 Validación de ingreso (STAFF/ADMIN): pensada para uso rápido en puerta. */
export default function ValidacionIngreso() {
  const [codigo, setCodigo] = useState<string | null>(null)
  const ticket = useBuscarTicket(codigo)
  const usar = useUsarTicket()
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<BuscarTicketForm>({
    resolver: zodResolver(BuscarTicketFormSchema),
    defaultValues: { ticketCode: '' },
  })

  function buscar({ ticketCode }: BuscarTicketForm) {
    const limpio = ticketCode.trim()
    usar.reset()
    if (limpio === codigo) void ticket.refetch()
    else setCodigo(limpio)
  }

  function marcarUsado(ticketCode: string) {
    usar.mutate(ticketCode, {
      onSuccess: () => {
        // Tras el éxito el campo se limpia y queda listo para el siguiente ticket.
        reset({ ticketCode: '' })
        setFocus('ticketCode')
      },
    })
  }

  const errorUso = usar.error
  const conflicto = esApiError(errorUso) && errorUso.status === 409

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina>Validación de ingreso</TituloPagina>
      <form noValidate onSubmit={handleSubmit(buscar)} className="flex items-start gap-2">
        <Campo
          etiqueta="Código de ticket"
          // 9.14 exige foco automático: uso rápido en puerta, campo único de la pantalla.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="TKT-XXXXXX"
          className="font-mono"
          contenedorClassName="flex-1"
          error={errors.ticketCode?.message}
          {...register('ticketCode')}
        />
        <Boton type="submit" className="mt-6.5" cargando={ticket.isFetching && codigo !== null}>
          <IconoBuscar className="size-4" />
          Buscar
        </Boton>
      </form>

      <div className="mt-5 space-y-4" aria-live="polite">
        {ticket.isError && <Aviso tipo="error">{mensajeBusqueda(ticket.error)}</Aviso>}
        {ticket.isSuccess && (
          <article className={clsx(claseTarjeta, 'p-5 sm:p-6')}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{ticket.data.eventName}</h2>
              <BadgeEstadoTicket estado={ticket.data.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-mono">{ticket.data.ticketCode}</span> · {ticket.data.type} ·
              Titular: {ticket.data.userEmail}
            </p>
            {!usar.isSuccess && (
              <Boton
                tamano="lg"
                anchoCompleto
                className="mt-5"
                cargando={usar.isPending}
                onClick={() => marcarUsado(ticket.data.ticketCode)}
              >
                Marcar como usado
              </Boton>
            )}
          </article>
        )}
        {usar.isSuccess && (
          <Aviso tipo="exito" className="py-3 text-base font-semibold">
            Ingreso registrado.
          </Aviso>
        )}
        {errorUso && (
          <Aviso
            tipo={conflicto ? 'advertencia' : 'error'}
            className="py-3 text-base font-semibold"
          >
            {mensajeBusqueda(errorUso)}
            {conflicto && <span className="font-normal"> (409)</span>}
          </Aviso>
        )}
      </div>
    </div>
  )
}
