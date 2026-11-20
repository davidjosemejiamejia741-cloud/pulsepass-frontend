import clsx from 'clsx'
import { useEffect, useId, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Aviso, useAvisos } from '../componentes/Avisos'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { claseControl } from '../componentes/Campo'
import { Cargando, EstadoError, NoDisponible } from '../componentes/Estados'
import { IconoFlechaDer, IconoMas } from '../componentes/Iconos'
import { Modal } from '../componentes/Modal'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Avatar, CodigoTexto, EnlaceVolver } from '../componentes/Varios'
import { recordarEventoSesion } from '../funcionalidades/admin/eventosSesion'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAsociarArtista, useEvento, usePublicarEvento } from '../funcionalidades/eventos/hooks'
import type { Evento } from '../funcionalidades/eventos/tipos'
import { esNoDisponible, mensajeDe } from '../lib/errores'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

function BloquePublicacion({ evento }: { evento: Evento }) {
  const publicar = usePublicarEvento()
  const { mostrar } = useAvisos()
  const [confirmando, setConfirmando] = useState(false)

  function cerrar() {
    publicar.reset()
    setConfirmando(false)
  }

  return (
    <section aria-labelledby="titulo-publicacion" className={clsx(claseTarjeta, 'p-5')}>
      <h2 id="titulo-publicacion" className="font-semibold">
        Publicación
      </h2>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          El evento es visible al público una vez publicado.
        </p>
        {/* Deshabilitado si no es DRAFT (UX); la transición la valida el backend (409). */}
        <Boton onClick={() => setConfirmando(true)} disabled={evento.status !== 'DRAFT'}>
          {evento.status === 'DRAFT' ? 'Publicar evento' : 'Publicado'}
        </Boton>
      </div>
      <Modal
        abierto={confirmando}
        titulo="Publicar evento"
        onCerrar={cerrar}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton
              cargando={publicar.isPending}
              onClick={() =>
                publicar.mutate(evento.eventCode, {
                  onSuccess: (e) => {
                    recordarEventoSesion({ eventCode: e.eventCode, name: e.name, status: e.status })
                    mostrar('exito', `${e.name} publicado.`)
                    cerrar()
                  },
                })
              }
            >
              Publicar
            </Boton>
          </>
        }
      >
        <p className="text-sm">
          ¿Publicar <strong>{evento.name}</strong>? Aparecerá en la cartelera pública.
        </p>
        {publicar.isError && <Aviso tipo="error">{mensajeDe(publicar.error)}</Aviso>}
      </Modal>
    </section>
  )
}

function BloqueArtistas({ evento }: { evento: Evento }) {
  const id = useId()
  const artistas = useArtistasActivos()
  const asociar = useAsociarArtista()
  const { mostrar } = useAvisos()
  const [seleccion, setSeleccion] = useState('')

  const asociados = new Set(evento.artists.map((a) => a.id))
  const disponibles = (artistas.data ?? []).filter((a) => !asociados.has(a.id))

  function asociarSeleccionado() {
    const artista = disponibles.find((a) => String(a.id) === seleccion)
    if (!artista) return
    asociar.mutate(
      { eventCode: evento.eventCode, artista },
      {
        onSuccess: () => {
          mostrar('exito', `${artista.stageName} asociado al evento.`)
          setSeleccion('')
        },
      },
    )
  }

  return (
    <section aria-labelledby="titulo-asociados" className={clsx(claseTarjeta, 'p-5')}>
      <h2 id="titulo-asociados" className="font-semibold">
        Artistas asociados
      </h2>
      {evento.artists.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Sin artistas asociados.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-4">
          {evento.artists.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2 text-sm font-medium">
              <Avatar nombre={a.stageName} tamano="sm" indice={i} />
              {a.stageName}
            </li>
          ))}
        </ul>
      )}
      <label htmlFor={id} className="mt-4 mb-1.5 block text-sm font-medium">
        Agregar artista
      </label>
      <div className="flex gap-2">
        <select
          id={id}
          value={seleccion}
          onChange={(e) => setSeleccion(e.target.value)}
          className={clsx(claseControl, 'border-slate-300 dark:border-slate-700')}
          disabled={artistas.isPending || disponibles.length === 0}
        >
          <option value="">
            {artistas.isPending
              ? 'Cargando…'
              : disponibles.length === 0
                ? 'No hay más artistas activos'
                : 'Selecciona un artista'}
          </option>
          {disponibles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.stageName}
            </option>
          ))}
        </select>
        <Boton
          variante="secundario"
          onClick={asociarSeleccionado}
          disabled={!seleccion}
          cargando={asociar.isPending}
        >
          <IconoMas className="size-4" />
          Asociar
        </Boton>
      </div>
      {asociar.isError && (
        <Aviso tipo="error" className="mt-3" onCerrar={() => asociar.reset()}>
          {mensajeDe(asociar.error)}
        </Aviso>
      )}
    </section>
  )
}

/** 9.18 Gestionar evento (ADMIN): ve borradores, publica y asocia artistas. */
export default function AdminGestionEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const evento = useEvento(eventCode)

  useEffect(() => {
    if (evento.data) {
      const { eventCode: codigo, name, status } = evento.data
      recordarEventoSesion({ eventCode: codigo, name, status })
    }
  }, [evento.data])

  if (evento.isPending) return <Cargando filas={2} />
  if (evento.isError) {
    if (esNoDisponible(evento.error)) return <NoDisponible titulo="Evento no encontrado" />
    return <EstadoError error={evento.error} onReintentar={() => void evento.refetch()} />
  }

  const e = evento.data
  return (
    <div className="mx-auto max-w-3xl">
      <EnlaceVolver a={RUTAS.adminEventos}>Eventos</EnlaceVolver>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{e.name}</h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            <CodigoTexto>{e.eventCode}</CodigoTexto> · {e.category} ·{' '}
            {formatearFechaHora(e.eventDate, ' ')} · Mín. {e.minimumAge} ·{' '}
            {e.venueName ?? e.venueCode}
          </p>
        </div>
        <BadgeEstadoEvento estado={e.status} />
      </div>
      <div className="space-y-4">
        <BloquePublicacion evento={e} />
        <BloqueArtistas evento={e} />
      </div>
      <Link
        to={RUTAS.ticketsPagados(e.eventCode)}
        className="text-marca-600 dark:text-marca-100 mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline"
      >
        Tickets pagados <IconoFlechaDer className="size-4" />
      </Link>
    </div>
  )
}
