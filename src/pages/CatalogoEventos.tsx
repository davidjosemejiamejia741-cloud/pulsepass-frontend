import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo, Selector } from '../componentes/Campo'
import { CargandoGrilla, EstadoError, EstadoVacio } from '../componentes/Estados'
import { TituloPagina } from '../componentes/Varios'
import { useArtistaPorNombre, useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPorArtista, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { CATEGORIAS, EventCategorySchema } from '../funcionalidades/eventos/tipos'
import { RUTAS } from '../lib/rutas'

/** Normaliza para buscar sin tildes ni mayúsculas. */
const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** 9.4 Cartelera: filtros en la URL (?q=&categoria=&artista=) que sobreviven a recargar. */
export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  // FE-002: los parámetros de URL también se validan.
  const categoria = EventCategorySchema.safeParse(params.get('categoria')).data
  const artista = params.get('artista') ?? undefined

  const publicados = useEventosPublicados()
  const porArtista = useEventosPorArtista(artista)
  const artistas = useArtistasActivos()
  const artistaSeleccionado = useArtistaPorNombre(artista)
  const consulta = artista ? porArtista : publicados

  const filtrados = useMemo(() => {
    const texto = normalizar(q.trim())
    return (consulta.data ?? []).filter(
      (e) =>
        (!texto || normalizar(e.name).includes(texto)) && (!categoria || e.category === categoria),
    )
  }, [consulta.data, q, categoria])

  function actualizar(clave: 'q' | 'categoria' | 'artista', valor: string) {
    setParams(
      (previos) => {
        const nuevos = new URLSearchParams(previos)
        if (valor) nuevos.set(clave, valor)
        else nuevos.delete(clave)
        return nuevos
      },
      { replace: true },
    )
  }

  const hayFiltros = Boolean(q || categoria || artista)

  return (
    <>
      <TituloPagina>Cartelera</TituloPagina>
      <form
        role="search"
        aria-label="Filtrar eventos"
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
      >
        <Campo
          etiqueta="Buscar por nombre"
          type="search"
          placeholder="Buscar por nombre…"
          value={q}
          onChange={(e) => actualizar('q', e.target.value)}
        />
        <Selector
          etiqueta="Categoría"
          value={categoria ?? ''}
          onChange={(e) => actualizar('categoria', e.target.value)}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Selector>
        <Selector
          etiqueta="Artista"
          value={artista ?? ''}
          onChange={(e) => actualizar('artista', e.target.value)}
        >
          <option value="">Todos</option>
          {artista && !artistas.data?.some((a) => a.stageName === artista) && (
            <option value={artista}>{artista}</option>
          )}
          {artistas.data?.map((a) => (
            <option key={a.id} value={a.stageName}>
              {a.stageName}
            </option>
          ))}
        </Selector>
        <Boton
          variante="secundario"
          disabled={!hayFiltros}
          onClick={() => setParams({}, { replace: true })}
        >
          Limpiar
        </Boton>
      </form>

      {artista && artistaSeleccionado.data && (
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          Eventos de <strong>{artistaSeleccionado.data.stageName}</strong>
          {artistaSeleccionado.data.genre ? ` · ${artistaSeleccionado.data.genre}` : ''}
        </p>
      )}

      {consulta.isPending ? (
        <CargandoGrilla cantidad={6} />
      ) : consulta.isError ? (
        <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
            {filtrados.length} {filtrados.length === 1 ? 'evento' : 'eventos'}
          </p>
          {filtrados.length === 0 ? (
            <EstadoVacio
              mensaje={
                hayFiltros ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'
              }
              accion={hayFiltros ? { texto: 'Ver toda la cartelera', a: RUTAS.eventos } : undefined}
            />
          ) : (
            <GrillaEventos eventos={filtrados} />
          )}
        </>
      )}
    </>
  )
}
