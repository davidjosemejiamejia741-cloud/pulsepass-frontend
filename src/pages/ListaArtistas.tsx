import clsx from 'clsx'
import { Link } from 'react-router'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Avatar, TituloPagina } from '../componentes/Varios'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { RUTAS } from '../lib/rutas'

/** 9.6 /artistas: cuadrícula de artistas activos. */
export default function ListaArtistas() {
  const artistas = useArtistasActivos()
  return (
    <>
      <TituloPagina>Artistas</TituloPagina>
      {artistas.isPending ? (
        <Cargando />
      ) : artistas.isError ? (
        <EstadoError error={artistas.error} onReintentar={() => void artistas.refetch()} />
      ) : artistas.data.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no hay artistas activos"
          accion={{ texto: 'Ver cartelera', a: RUTAS.eventos }}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artistas.data.map((a, i) => (
            <li key={a.id}>
              <Link
                to={RUTAS.detalleArtista(a.id)}
                className={clsx(
                  claseTarjeta,
                  'flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md',
                )}
              >
                <Avatar nombre={a.stageName} tamano="lg" indice={i} />
                <span className="mt-1 font-semibold">{a.stageName}</span>
                {a.genre && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">{a.genre}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
