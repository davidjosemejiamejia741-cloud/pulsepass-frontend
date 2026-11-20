import clsx from 'clsx'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { baseBoton, Boton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Layout } from '../layouts/Layout'
import { esApiError, MENSAJE_INESPERADO } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { Pagina403 as SinPermisos, Pagina404 as NoEncontrada } from './PaginaCodigo'

function Contenido() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error)
    ? error.status
    : esApiError(error)
      ? error.status
      : null

  if (status === 404) return <NoEncontrada />
  if (status === 403) return <SinPermisos />

  // Mensaje seguro: nunca stack trace ni detalles internos.
  return (
    <div className={clsx(claseTarjeta, 'mx-auto max-w-2xl p-6')}>
      <h1 className="text-xl font-bold">¡Ups! Algo salió mal.</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{MENSAJE_INESPERADO}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
        <Link
          to={RUTAS.inicio}
          className={clsx(baseBoton, tamanosBoton.md, estilosBoton.secundario)}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

/** 9.19 errorElement: usa useRouteError() + isRouteErrorResponse. */
export default function ErrorPagina() {
  return (
    <Layout>
      <Contenido />
    </Layout>
  )
}
