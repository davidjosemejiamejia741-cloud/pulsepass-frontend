import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../componentes/Avisos'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { baseBoton, Boton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { IconoMas } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { CodigoTexto, TituloPagina } from '../componentes/Varios'
import { useEventosSesion } from '../funcionalidades/admin/eventosSesion'
import { RUTAS } from '../lib/rutas'

/** 9.16 Administración de eventos (GAP-01: sin listado completo; búsqueda por código). */
export default function AdminEventos() {
  const navigate = useNavigate()
  const recientes = useEventosSesion()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | undefined>()

  function abrir(e: FormEvent) {
    e.preventDefault()
    const limpio = codigo.trim()
    if (!limpio) {
      setError('Ingresa el código del evento')
      return
    }
    void navigate(RUTAS.adminGestionEvento(limpio))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina
        accion={
          <Link
            to={RUTAS.adminCrearEvento}
            className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
          >
            <IconoMas className="size-4" />
            Nuevo evento
          </Link>
        }
      >
        Administración de eventos
      </TituloPagina>

      <form noValidate onSubmit={abrir} className="flex items-start gap-2">
        <Campo
          etiqueta="Buscar evento por código"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value)
            setError(undefined)
          }}
          placeholder="CMF-2026"
          className="font-mono"
          contenedorClassName="flex-1"
          error={error}
        />
        <Boton type="submit" variante="secundario" className="mt-6.5">
          Abrir
        </Boton>
      </form>

      <section aria-labelledby="titulo-sesion" className="mt-8">
        <h2 id="titulo-sesion" className="mb-3 font-semibold">
          Creados en esta sesión
        </h2>
        {recientes.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aún no has creado ni abierto eventos en esta pestaña.
          </p>
        ) : (
          <ul className="space-y-2">
            {recientes.map((e) => (
              <li
                key={e.eventCode}
                className={clsx(
                  claseTarjeta,
                  'flex flex-wrap items-center justify-between gap-3 px-4 py-3',
                )}
              >
                <p className="text-sm">
                  <CodigoTexto className="font-semibold">{e.eventCode}</CodigoTexto> · {e.name}
                </p>
                <div className="flex items-center gap-3">
                  <BadgeEstadoEvento estado={e.status} />
                  <Link
                    to={RUTAS.adminGestionEvento(e.eventCode)}
                    className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.secundario)}
                    aria-label={`Gestionar ${e.name}`}
                  >
                    Gestionar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Aviso tipo="info" className="mt-6">
        Nota: la API no ofrece un listado completo de eventos (GAP-01).
      </Aviso>
    </div>
  )
}
