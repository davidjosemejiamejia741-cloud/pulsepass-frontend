import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Aviso } from '../../../componentes/Avisos'
import { Boton } from '../../../componentes/Boton'
import { Modal } from '../../../componentes/Modal'
import { claseTarjeta, FilaDato } from '../../../componentes/Tarjeta'
import { mensajeDe } from '../../../lib/errores'
import { RUTAS, type EstadoLogin } from '../../../lib/rutas'
import { useDesde } from '../../../layouts/RutaProtegida'
import { useAuth } from '../../auth/AuthContext'
import { useComprarTicket } from '../../tickets/hooks'
import { CompraFormSchema, TIPOS_TICKET, type TicketType } from '../../tickets/tipos'
import type { Evento } from '../tipos'

const FORM_ID = 'form-compra'

/** 9.5: el precio lo define el backend; el email sale de la sesión (anti-IDOR). */
export function PanelCompra({ evento }: { evento: Evento }) {
  const { sesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const desde = useDesde()
  const comprar = useComprarTicket()
  const [confirmando, setConfirmando] = useState<TicketType | null>(null)
  const { register, handleSubmit, control } = useForm({
    resolver: zodResolver(CompraFormSchema),
    defaultValues: { type: 'GENERAL' as TicketType },
  })
  const seleccionado = useWatch({ control, name: 'type' })

  // STAFF/ADMIN no compran desde la UI (la API autoriza la compra solo a USER).
  if (sesion.estado === 'autenticado' && !tieneRol('USER')) return null

  const anonimo = sesion.estado !== 'autenticado'
  // FR-FE-EVT-005: fuera de PUBLISHED el botón no se muestra habilitado (UX; el backend decide).
  const vendible = evento.status === 'PUBLISHED'

  function irALogin() {
    const estado: EstadoLogin = { desde }
    void navigate(RUTAS.login, { state: estado })
  }

  function cerrarModal() {
    comprar.reset()
    setConfirmando(null)
  }

  function confirmar() {
    if (!confirmando) return
    comprar.mutate(
      { eventCode: evento.eventCode, type: confirmando },
      { onSuccess: (ticket) => void navigate(RUTAS.confirmacionCompra(ticket.ticketCode)) },
    )
  }

  const textoBoton = anonimo ? 'Inicia sesión para comprar' : 'Comprar entrada'

  return (
    <>
      <section aria-labelledby="titulo-entradas" className={clsx(claseTarjeta, 'p-5')}>
        <h2 id="titulo-entradas" className="font-semibold">
          Entradas
        </h2>
        <form
          id={FORM_ID}
          onSubmit={handleSubmit(({ type }) => (anonimo ? irALogin() : setConfirmando(type)))}
          className="mt-3"
        >
          <fieldset>
            <legend className="mb-2 text-xs text-slate-600 dark:text-slate-400">
              Tipo de entrada
            </legend>
            <div className="space-y-2">
              {TIPOS_TICKET.map((tipo) => (
                <label
                  key={tipo}
                  className={clsx(
                    'has-focus-visible:outline-marca-600 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm font-medium has-focus-visible:outline-2',
                    seleccionado === tipo
                      ? 'border-marca-600 bg-marca-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-700',
                  )}
                >
                  <input
                    type="radio"
                    value={tipo}
                    {...register('type')}
                    className="accent-marca-600 size-4"
                  />
                  {tipo}
                </label>
              ))}
            </div>
          </fieldset>
          <Boton type="submit" anchoCompleto className="mt-4 hidden md:flex" disabled={!vendible}>
            {textoBoton}
          </Boton>
          {!vendible && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Este evento no está a la venta (estado {evento.status}).
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            El precio lo define el sistema al confirmar.
          </p>
        </form>
      </section>

      {/* DES-07: en móvil la acción de compra se fija en una barra inferior. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <Boton type="submit" form={FORM_ID} anchoCompleto tamano="lg" disabled={!vendible}>
          {textoBoton}
        </Boton>
      </div>

      <Modal
        abierto={confirmando !== null}
        titulo="Confirmar compra"
        onCerrar={cerrarModal}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrarModal}>
              Cancelar
            </Boton>
            <Boton onClick={confirmar} cargando={comprar.isPending}>
              Confirmar
            </Boton>
          </>
        }
      >
        <dl>
          <FilaDato etiqueta="Evento">{evento.name}</FilaDato>
          <FilaDato etiqueta="Tipo">{confirmando}</FilaDato>
          <FilaDato etiqueta="Cuenta">
            {sesion.estado === 'autenticado' ? sesion.usuario.email : ''}
          </FilaDato>
        </dl>
        {/* DES-10: 409 (edad, capacidad, estado, usuario inactivo) dentro del modal, sin cerrarlo. */}
        {comprar.isError && <Aviso tipo="error">{mensajeDe(comprar.error)}</Aviso>}
      </Modal>
    </>
  )
}
