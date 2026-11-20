import { Aviso, useAvisos } from '../../../componentes/Avisos'
import { Boton } from '../../../componentes/Boton'
import { Modal } from '../../../componentes/Modal'
import { esApiError, MENSAJE_INESPERADO } from '../../../lib/http'
import { useCancelarTicket } from '../hooks'
import type { Ticket } from '../tipos'

interface Props {
  ticket: Ticket | null
  onCerrar: () => void
}

/** FR-FE-TKT-004: un 409 se muestra dentro del modal sin cerrarlo (DES-10). */
export function ModalConfirmarCancelacion({ ticket, onCerrar }: Props) {
  const cancelar = useCancelarTicket()
  const { mostrar } = useAvisos()

  function cerrar() {
    cancelar.reset()
    onCerrar()
  }

  function confirmar() {
    if (!ticket) return
    cancelar.mutate(ticket.ticketCode, {
      onSuccess: () => {
        mostrar('exito', `Ticket ${ticket.ticketCode} cancelado.`)
        cerrar()
      },
    })
  }

  const error = cancelar.error
  const mensajeError = error ? (esApiError(error) ? error.message : MENSAJE_INESPERADO) : null

  return (
    <Modal
      abierto={ticket !== null}
      titulo="Cancelar ticket"
      onCerrar={cerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={cerrar}>
            Volver
          </Boton>
          <Boton variante="peligro" onClick={confirmar} cargando={cancelar.isPending}>
            Cancelar ticket
          </Boton>
        </>
      }
    >
      {ticket && (
        <p className="text-sm">
          ¿Quieres cancelar el ticket <strong className="font-mono">{ticket.ticketCode}</strong> (
          {ticket.type}) de {ticket.eventName}?
        </p>
      )}
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}
    </Modal>
  )
}
