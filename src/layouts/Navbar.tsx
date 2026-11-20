import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { baseBoton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import {
  IconoChevronAbajo,
  IconoCerrar,
  IconoLuna,
  IconoMenu,
  IconoMusica,
  IconoSol,
} from '../componentes/Iconos'
import { Avatar } from '../componentes/Varios'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { useSalir } from '../funcionalidades/auth/useSalir'
import type { Rol, UsuarioAutenticado } from '../funcionalidades/auth/tipos'
import { useUsuarioPorUsername } from '../funcionalidades/usuarios/hooks'
import { RUTAS } from '../lib/rutas'
import { useTema } from './useTema'

interface EnlaceNav {
  a: string
  texto: string
  /** undefined = visible para todos; [] nunca se usa. */
  roles?: readonly Rol[]
  end?: boolean
}

/** 8.4 / DES-03: navbar por rol calculada desde RUTAS. */
const ENLACES: readonly EnlaceNav[] = [
  { a: RUTAS.eventos, texto: 'Eventos' },
  { a: RUTAS.artistas, texto: 'Artistas' },
  { a: RUTAS.sedes, texto: 'Sedes' },
  { a: RUTAS.misTickets, texto: 'Mis tickets', roles: ['USER'] },
  { a: RUTAS.validacion, texto: 'Validar ingreso', roles: ['STAFF', 'ADMIN'] },
  { a: RUTAS.ticketsPagadosInicio, texto: 'Tickets pagados', roles: ['STAFF', 'ADMIN'] },
  { a: RUTAS.adminEventos, texto: 'Administrar eventos', roles: ['ADMIN'] },
]

const claseNavLink = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
  )

function Logo() {
  return (
    <Link
      to={RUTAS.inicio}
      className="font-titulo flex min-h-11 items-center gap-2 rounded-lg text-lg font-bold"
    >
      <span className="bg-marca-600 flex size-8 items-center justify-center rounded-lg text-white">
        <IconoMusica className="size-4" />
      </span>
      PulsePass
    </Link>
  )
}

function BotonTema() {
  const { tema, alternar } = useTema()
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {tema === 'oscuro' ? <IconoSol /> : <IconoLuna />}
    </button>
  )
}

function useNombreVisible(usuario: UsuarioAutenticado): string {
  const { data } = useUsuarioPorUsername(usuario.username)
  return data?.firstName ?? usuario.username
}

function MenuUsuario({ usuario, esUser }: { usuario: UsuarioAutenticado; esUser: boolean }) {
  const salir = useSalir()
  const nombre = useNombreVisible(usuario)
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    function fuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false)
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const item =
    'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800'

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <Avatar nombre={nombre} tamano="xs" indice={0} />
        <span className="max-w-32 truncate">{nombre}</span>
        <IconoChevronAbajo className="size-4" />
      </button>
      {abierto && (
        <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <Link to={RUTAS.cuenta} className={item} onClick={() => setAbierto(false)}>
            Mi cuenta
          </Link>
          {esUser && (
            <Link to={RUTAS.misTickets} className={item} onClick={() => setAbierto(false)}>
              Mis tickets
            </Link>
          )}
          <button
            type="button"
            className={clsx(item, 'text-red-700 dark:text-red-400')}
            onClick={() => {
              void salir()
            }}
          >
            Salir
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const { sesion, tieneRol } = useAuth()
  const salir = useSalir()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = () => setMenuAbierto(false)

  const enlaces = ENLACES.filter((e) => !e.roles || tieneRol(...e.roles))
  const usuario = sesion.estado === 'autenticado' ? sesion.usuario : null

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {enlaces.map((e) => (
                <li key={e.a}>
                  <NavLink to={e.a} end={e.end} className={claseNavLink}>
                    {e.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <BotonTema />
          {sesion.estado === 'anonimo' && (
            <>
              <Link
                to={RUTAS.login}
                className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.fantasma)}
              >
                Ingresar
              </Link>
              <Link
                to={RUTAS.registro}
                className={clsx(baseBoton, tamanosBoton.sm, estilosBoton.primario)}
              >
                Registrarse
              </Link>
            </>
          )}
          {usuario && <MenuUsuario usuario={usuario} esUser={tieneRol('USER')} />}
        </div>

        <div className="flex items-center md:hidden">
          <BotonTema />
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            className="flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {menuAbierto ? <IconoCerrar className="size-6" /> : <IconoMenu className="size-6" />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div
          id="menu-movil"
          className="border-t border-slate-200 px-4 pb-4 md:hidden dark:border-slate-800"
        >
          <nav aria-label="Principal móvil">
            <ul className="py-2">
              {enlaces.map((e) => (
                <li key={e.a}>
                  <NavLink
                    to={e.a}
                    end={e.end}
                    onClick={cerrarMenu}
                    className={({ isActive }) =>
                      clsx(claseNavLink({ isActive }), 'block min-h-11 text-base')
                    }
                  >
                    {e.texto}
                  </NavLink>
                </li>
              ))}
              {usuario && (
                <li>
                  <NavLink
                    to={RUTAS.cuenta}
                    onClick={cerrarMenu}
                    className={({ isActive }) =>
                      clsx(claseNavLink({ isActive }), 'block min-h-11 text-base')
                    }
                  >
                    Mi cuenta
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
          <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            {sesion.estado === 'anonimo' && (
              <>
                <Link
                  to={RUTAS.login}
                  onClick={cerrarMenu}
                  className={clsx(baseBoton, tamanosBoton.md, estilosBoton.secundario)}
                >
                  Ingresar
                </Link>
                <Link
                  to={RUTAS.registro}
                  onClick={cerrarMenu}
                  className={clsx(baseBoton, tamanosBoton.md, estilosBoton.primario)}
                >
                  Registrarse
                </Link>
              </>
            )}
            {usuario && (
              <button
                type="button"
                className={clsx(baseBoton, tamanosBoton.md, estilosBoton.secundario)}
                onClick={() => {
                  cerrarMenu()
                  void salir()
                }}
              >
                Salir
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
