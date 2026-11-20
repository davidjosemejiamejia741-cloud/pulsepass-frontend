import clsx from 'clsx'
import { Link, useParams } from 'react-router'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { baseBoton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { Cargando, EstadoError, NoDisponible } from '../componentes/Estados'
import { IconoCalendario, IconoSede, IconoUsuario } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Avatar, EnlaceVolver } from '../componentes/Varios'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import {
  EtiquetaCategoria,
  PanelCategoria,
} from '../funcionalidades/eventos/componentes/PanelCategoria'
import { PanelCompra } from '../funcionalidades/eventos/componentes/PanelCompra'
import { useEvento } from '../funcionalidades/eventos/hooks'
import type { Evento } from '../funcionalidades/eventos/tipos'
import { useSede } from '../funcionalidades/sedes/hooks'
import { esNoDisponible } from '../lib/errores'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

function TarjetaSede({ evento }: { evento: Evento }) {
  const sede = useSede(evento.venueCode)
  const nombre = sede.data?.name ?? evento.venueName ?? evento.venueCode ?? 'Sede por confirmar'
  const contenido = (
    <>
      <IconoSede className="text-marca-600 size-5 shrink-0" />
      <span>
        <span className="block text-sm font-semibold">{nombre}</span>
        {sede.data && (
          <span className="block text-xs text-slate-600 dark:text-slate-400">
            {sede.data.city} · Capacidad {sede.data.capacity}
          </span>
        )}
      </span>
    </>
  )
  const clase =
    'flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700'
  return evento.venueCode ? (
    <Link
      to={RUTAS.detalleSede(evento.venueCode)}
      className={clsx(clase, 'hover:bg-slate-50 dark:hover:bg-slate-800')}
    >
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  )
}

/** 9.5 Detalle de evento y compra. */
export default function DetalleEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const { sesion, tieneRol } = useAuth()
  const evento = useEvento(eventCode)

  if (evento.isPending) return <Cargando filas={2} />
  if (evento.isError) {
    if (esNoDisponible(evento.error)) {
      return (
        <NoDisponible titulo="Evento no disponible">
          <Link
            to={RUTAS.eventos}
            className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
          >
            Volver a la cartelera
          </Link>
        </NoDisponible>
      )
    }
    return <EstadoError error={evento.error} onReintentar={() => void evento.refetch()} />
  }

  const e = evento.data
  const muestraCompra = sesion.estado !== 'autenticado' || tieneRol('USER')

  return (
    <div className={clsx(muestraCompra && 'pb-20 md:pb-0')}>
      <EnlaceVolver a={RUTAS.eventos}>Volver a la cartelera</EnlaceVolver>
      <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start lg:grid-cols-[1fr_20rem]">
        <article className={clsx(claseTarjeta, 'overflow-hidden')}>
          <PanelCategoria
            categoria={e.category}
            alto="h-40"
            className="rounded-b-xl md:rounded-none"
          />
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <EtiquetaCategoria categoria={e.category} />
              <BadgeEstadoEvento estado={e.status} />
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{e.name}</h1>
            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:gap-5 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <IconoCalendario className="size-4" />
                {formatearFechaHora(e.eventDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <IconoUsuario className="size-4" />
                Edad mínima: {e.minimumAge}
              </span>
            </div>
            {e.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line">{e.description}</p>
            )}

            <section aria-labelledby="titulo-artistas-evento">
              <h2 id="titulo-artistas-evento" className="mb-2 font-semibold">
                Artistas
              </h2>
              {e.artists.length === 0 ? (
                <p className="text-sm text-slate-500">Sin artistas anunciados.</p>
              ) : (
                <ul className="flex flex-wrap gap-4">
                  {e.artists.map((a, i) => (
                    <li key={a.id}>
                      <Link
                        to={RUTAS.detalleArtista(a.id)}
                        className="hover:text-marca-700 flex min-h-11 items-center gap-2 text-sm font-medium"
                      >
                        <Avatar nombre={a.stageName} tamano="sm" indice={i} />
                        {a.stageName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="titulo-sede-evento">
              <h2 id="titulo-sede-evento" className="mb-2 font-semibold">
                Sede
              </h2>
              <TarjetaSede evento={e} />
            </section>
          </div>
        </article>
        {muestraCompra && <PanelCompra evento={e} />}
      </div>
    </div>
  )
}
