import clsx from 'clsx'
import { useParams } from 'react-router'
import { Badge } from '../componentes/Badge'
import { Cargando, EstadoError } from '../componentes/Estados'
import { claseTarjeta, FilaDato } from '../componentes/Tarjeta'
import { CodigoTexto, EnlaceVolver } from '../componentes/Varios'
import { useSede } from '../funcionalidades/sedes/hooks'
import { esNoDisponible } from '../lib/errores'
import { RUTAS } from '../lib/rutas'
import { Pagina404 as NoEncontrada } from './PaginaCodigo'

const numero = new Intl.NumberFormat('es-CO')

/** 9.7 /sedes/:code */
export default function DetalleSede() {
  const { code } = useParams<{ code: string }>()
  const sede = useSede(code)

  if (sede.isPending) return <Cargando filas={1} />
  if (sede.isError) {
    if (esNoDisponible(sede.error)) return <NoEncontrada />
    return <EstadoError error={sede.error} onReintentar={() => void sede.refetch()} />
  }

  const s = sede.data
  const activa = s.active !== false
  return (
    <div className="mx-auto max-w-xl">
      <EnlaceVolver a={RUTAS.sedes}>Sedes</EnlaceVolver>
      <article className={clsx(claseTarjeta, 'p-5 sm:p-6')}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold">{s.name}</h1>
          <Badge tono={activa ? 'exito' : 'neutro'}>{activa ? 'Activa' : 'Inactiva'}</Badge>
        </div>
        <dl>
          <FilaDato etiqueta="Código">
            <CodigoTexto>{s.code}</CodigoTexto>
          </FilaDato>
          <FilaDato etiqueta="Ciudad">{s.city}</FilaDato>
          {s.address && <FilaDato etiqueta="Dirección">{s.address}</FilaDato>}
          <FilaDato etiqueta="Capacidad">{numero.format(s.capacity)} personas</FilaDato>
          <FilaDato etiqueta="Estado">{activa ? 'Activa' : 'Inactiva'}</FilaDato>
        </dl>
      </article>
    </div>
  )
}
