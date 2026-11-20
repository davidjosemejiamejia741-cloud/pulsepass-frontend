import clsx from 'clsx'
import { Link } from 'react-router'
import { baseBoton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { claseTarjeta } from '../componentes/Tarjeta'
import { RUTAS } from '../lib/rutas'

export function PaginaCodigo({ codigo, mensaje }: { codigo: string; mensaje: string }) {
  return (
    <div className={clsx(claseTarjeta, 'mx-auto max-w-lg px-6 py-10 text-center')}>
      <p className="font-titulo text-marca-700 dark:text-marca-100 text-6xl font-extrabold">
        {codigo}
      </p>
      <h1 className="mt-4 text-base font-medium">{mensaje}</h1>
      <Link
        to={RUTAS.inicio}
        className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario, 'mt-6')}
      >
        Volver al inicio
      </Link>
    </div>
  )
}

export function Pagina404() {
  return <PaginaCodigo codigo="404" mensaje="No encontramos esta página." />
}

export function Pagina403() {
  return <PaginaCodigo codigo="403" mensaje="No tienes permisos para acceder a esta sección." />
}
