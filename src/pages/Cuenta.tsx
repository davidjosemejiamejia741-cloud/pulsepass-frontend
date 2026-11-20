import clsx from 'clsx'
import { Link } from 'react-router'
import { Badge, BadgeRol } from '../componentes/Badge'
import { baseBoton, Boton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { Cargando, EstadoError } from '../componentes/Estados'
import { IconoTicket } from '../componentes/Iconos'
import { claseTarjeta } from '../componentes/Tarjeta'
import { Avatar, TituloPagina } from '../componentes/Varios'
import { useAuth, useUsuarioSesion } from '../funcionalidades/auth/AuthContext'
import { useSalir } from '../funcionalidades/auth/useSalir'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { formatearFechaNumerica } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

/** 9.10 Mi cuenta: solo la identidad propia; nunca hash, token ni claims. */
export default function Cuenta() {
  const { tieneRol } = useAuth()
  const salir = useSalir()
  const sesion = useUsuarioSesion()
  const perfil = useUsuarioPorEmail(sesion?.email)

  if (!sesion || perfil.isPending) return <Cargando filas={1} />
  if (perfil.isError)
    return <EstadoError error={perfil.error} onReintentar={() => void perfil.refetch()} />

  const u = perfil.data
  const nombre = `${u.firstName} ${u.lastName}`.trim()
  const activa = u.active !== false

  return (
    <>
      <TituloPagina>Mi cuenta</TituloPagina>
      <section
        className={clsx(
          claseTarjeta,
          'flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6',
        )}
      >
        <div className="flex items-center gap-4">
          <Avatar nombre={u.firstName || u.username} tamano="md" indice={0} />
          <div>
            <h2 className="text-lg font-bold">{nombre}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              @{u.username} · {u.email}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nacimiento: {formatearFechaNumerica(u.birthDate)}
            </p>
          </div>
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-slate-500">Rol:</dt>
            <dd className="flex gap-1">
              {sesion.roles.map((r) => (
                <BadgeRol key={r} rol={r} />
              ))}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-slate-500">Estado:</dt>
            <dd>
              <Badge tono={activa ? 'exito' : 'neutro'}>{activa ? 'Activa' : 'Inactiva'}</Badge>
            </dd>
          </div>
        </dl>
      </section>
      <div className="mt-5 flex flex-wrap justify-between gap-3">
        {tieneRol('USER') ? (
          <Link
            to={RUTAS.misTickets}
            className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
          >
            <IconoTicket className="size-4" />
            Ver mis tickets
          </Link>
        ) : (
          <span />
        )}
        <Boton
          variante="secundario"
          onClick={() => {
            void salir()
          }}
        >
          Cerrar sesión
        </Boton>
      </div>
    </>
  )
}
