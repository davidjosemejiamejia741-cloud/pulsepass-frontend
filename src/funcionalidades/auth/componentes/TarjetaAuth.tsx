import clsx from 'clsx'
import type { ReactNode } from 'react'
import { IconoMusica } from '../../../componentes/Iconos'
import { claseTarjeta } from '../../../componentes/Tarjeta'

/** Contenedor centrado de login/registro (9.8, 9.9). */
export function TarjetaAuth({
  titulo,
  children,
  ancho = 'max-w-sm',
}: {
  titulo: string
  children: ReactNode
  ancho?: 'max-w-sm' | 'max-w-md'
}) {
  return (
    <div className={clsx(claseTarjeta, 'mx-auto w-full p-6 sm:p-8', ancho)}>
      <div className="mb-6 flex flex-col items-center gap-3">
        <span className="bg-marca-600 flex size-11 items-center justify-center rounded-xl text-white">
          <IconoMusica className="size-5" />
        </span>
        <h1 className="text-2xl font-bold">{titulo}</h1>
      </div>
      {children}
    </div>
  )
}
