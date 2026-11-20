import clsx from 'clsx'
import { useParams } from 'react-router'
import { Badge } from '../componentes/Badge'
import { Cargando, CargandoGrilla, EstadoError, EstadoVacio } from '../componentes/Estados'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Avatar, EnlaceVolver } from '../componentes/Varios'
import { useArtista } from '../funcionalidades/artistas/hooks'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { esNoDisponible } from '../lib/errores'
import { RUTAS } from '../lib/rutas'
import { Pagina404 as NoEncontrada } from './PaginaCodigo'

/** Los parámetros siempre son texto: se convierten y validan antes de llamar a la API. */
function aId(valor: string | undefined): number | null {
  if (!valor || !/^\d+$/.test(valor)) return null
  const n = Number(valor)
  return Number.isSafeInteger(n) ? n : null
}

/** 9.6 /artistas/:id */
export default function DetalleArtista() {
  const { id } = useParams<{ id: string }>()
  const idNumero = aId(id)
  const artista = useArtista(idNumero)
  const eventos = useEventosPorArtista(artista.data?.stageName)

  if (idNumero === null) return <NoEncontrada />
  if (artista.isPending) return <Cargando filas={2} />
  if (artista.isError) {
    if (esNoDisponible(artista.error)) return <NoEncontrada />
    return <EstadoError error={artista.error} onReintentar={() => void artista.refetch()} />
  }

  const a = artista.data
  const subtitulo = ['Nombre artístico', a.genre, a.country].filter(Boolean).join(' · ')

  return (
    <>
      <EnlaceVolver a={RUTAS.artistas}>Artistas</EnlaceVolver>
      <section
        className={clsx(
          claseTarjeta,
          'flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left',
        )}
      >
        <Avatar nombre={a.stageName} tamano="xl" indice={a.id} />
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">{a.stageName}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitulo}</p>
          {a.active !== false && <Badge tono="exito">Activo</Badge>}
        </div>
      </section>

      <section aria-labelledby="titulo-proximos-artista" className="mt-8">
        <h2 id="titulo-proximos-artista" className="mb-4 text-lg font-bold">
          Próximos eventos de {a.stageName}
        </h2>
        {eventos.isPending ? (
          <CargandoGrilla />
        ) : eventos.isError ? (
          <EstadoError error={eventos.error} onReintentar={() => void eventos.refetch()} />
        ) : eventos.data.length === 0 ? (
          <EstadoVacio
            mensaje="Sin eventos próximos"
            accion={{ texto: 'Ver cartelera', a: RUTAS.eventos }}
          />
        ) : (
          <GrillaEventos eventos={eventos.data} />
        )}
      </section>
    </>
  )
}
