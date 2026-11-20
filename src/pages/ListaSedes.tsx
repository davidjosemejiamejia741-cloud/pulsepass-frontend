import clsx from 'clsx'
import { Link } from 'react-router'
import { Badge } from '../componentes/Badge'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { IconoUbicacion } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { TituloPagina } from '../componentes/Varios'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { RUTAS } from '../lib/rutas'

const numero = new Intl.NumberFormat('es-CO')

/** 9.7 /sedes */
export default function ListaSedes() {
  const sedes = useSedesActivas()
  return (
    <>
      <TituloPagina>Sedes</TituloPagina>
      {sedes.isPending ? (
        <Cargando />
      ) : sedes.isError ? (
        <EstadoError error={sedes.error} onReintentar={() => void sedes.refetch()} />
      ) : sedes.data.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no hay sedes activas"
          accion={{ texto: 'Ver cartelera', a: RUTAS.eventos }}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sedes.data.map((s) => (
            <li key={s.code}>
              <Link
                to={RUTAS.detalleSede(s.code)}
                className={clsx(claseTarjeta, 'block h-full p-4 transition-shadow hover:shadow-md')}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{s.name}</h2>
                  {s.active !== false && <Badge tono="exito">Activa</Badge>}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <IconoUbicacion className="size-3.5" />
                  {s.city} · Cap. {numero.format(s.capacity)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
