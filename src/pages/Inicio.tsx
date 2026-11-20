import clsx from 'clsx'
import { Link } from 'react-router'
import { baseBoton, tamanosBoton } from '../componentes/Boton'
import { CargandoGrilla, EstadoError, EstadoVacio } from '../componentes/Estados'
import { IconoFlechaDer } from '../componentes/Iconos'
import { Avatar } from '../componentes/Varios'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

function VerTodos({ a }: { a: string }) {
  return (
    <Link
      to={a}
      className="text-marca-600 dark:text-marca-100 inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline"
    >
      Ver todos <IconoFlechaDer className="size-4" />
    </Link>
  )
}

function Hero({ conSesion }: { conSesion: boolean }) {
  return (
    <section className="from-marca-600 to-acento-500 bg-linear-to-r from-40% text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="max-w-xl text-4xl leading-tight font-extrabold sm:text-5xl">
          Descubre los mejores eventos
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          Música, cultura, deporte y tecnología en un solo lugar.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={RUTAS.eventos}
            className={clsx(
              baseBoton,
              tamanosBoton.lg,
              'text-marca-700 hover:bg-marca-50 bg-white',
            )}
          >
            Ver cartelera
          </Link>
          {!conSesion && (
            <Link
              to={RUTAS.registro}
              className={clsx(
                baseBoton,
                tamanosBoton.lg,
                'border border-white/80 text-white hover:bg-white/10 focus-visible:outline-white',
              )}
            >
              Crear cuenta
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

/** 9.3 Inicio: hero, 3 próximos eventos y 6 artistas destacados. */
export default function Inicio() {
  const { sesion } = useAuth()
  const eventos = useEventosPublicados()
  const artistas = useArtistasActivos()

  return (
    <>
      <Hero conSesion={sesion.estado === 'autenticado'} />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <section aria-labelledby="titulo-proximos">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="titulo-proximos" className="text-xl font-bold">
              Próximos eventos
            </h2>
            <VerTodos a={RUTAS.eventos} />
          </div>
          {eventos.isPending ? (
            <CargandoGrilla />
          ) : eventos.isError ? (
            <EstadoError error={eventos.error} onReintentar={() => void eventos.refetch()} />
          ) : eventos.data.length === 0 ? (
            <EstadoVacio
              mensaje="Aún no hay eventos publicados"
              accion={{ texto: 'Ver artistas', a: RUTAS.artistas }}
            />
          ) : (
            // Orden de presentación (no es regla de negocio): los más cercanos primero.
            <GrillaEventos
              eventos={[...eventos.data]
                .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                .slice(0, 3)}
            />
          )}
        </section>

        <section aria-labelledby="titulo-artistas">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="titulo-artistas" className="text-xl font-bold">
              Artistas destacados
            </h2>
            <VerTodos a={RUTAS.artistas} />
          </div>
          {artistas.isPending ? (
            <div aria-busy="true" className="flex gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="size-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : artistas.isError ? (
            <EstadoError error={artistas.error} onReintentar={() => void artistas.refetch()} />
          ) : artistas.data.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay artistas activos" />
          ) : (
            <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
              {artistas.data.slice(0, 6).map((a, i) => (
                <li key={a.id}>
                  <Link
                    to={RUTAS.detalleArtista(a.id)}
                    className="hover:text-marca-700 dark:hover:text-marca-100 flex min-h-11 items-center gap-3 rounded-lg font-semibold"
                  >
                    <Avatar nombre={a.stageName} indice={i} />
                    {a.stageName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
