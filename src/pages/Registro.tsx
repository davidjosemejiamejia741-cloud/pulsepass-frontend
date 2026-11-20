import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../componentes/Avisos'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { TarjetaAuth } from '../funcionalidades/auth/componentes/TarjetaAuth'
import { useRegistrarUsuario } from '../funcionalidades/usuarios/hooks'
import { RegistroFormSchema, type RegistroForm } from '../funcionalidades/usuarios/tipos'
import { aplicarErroresCampos } from '../lib/errores'
import { esApiError } from '../lib/http'
import { RUTAS, type EstadoLogin } from '../lib/rutas'

const CAMPOS = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'] as const

type NivelFortaleza = 'débil' | 'media' | 'fuerte'

/**
 * Indicador orientativo (no es una regla del backend): longitud y variedad de caracteres.
 * El backend solo exige 12 caracteres y 72 bytes.
 */
function fortaleza(clave: string): { puntos: number; nivel: NivelFortaleza } {
  const tipos = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(clave)).length
  const largo = [...clave].length
  const puntos = Math.min(8, Math.floor(largo / 4) + tipos)
  const nivel: NivelFortaleza =
    largo < 12 || puntos <= 3 ? 'débil' : puntos <= 6 ? 'media' : 'fuerte'
  return { puntos, nivel }
}

function IndicadorFortaleza({ clave }: { clave: string }) {
  const { puntos, nivel } = fortaleza(clave)
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Entre 12 caracteres y 72 bytes.</p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={clsx(
              'h-1 flex-1 rounded-full',
              i < puntos ? 'bg-marca-600' : 'bg-slate-200 dark:bg-slate-700',
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Fortaleza: {clave ? nivel : '—'}
      </p>
    </div>
  )
}

/** 9.9 Registro: no hay selección de rol (siempre USER); la edad no se valida aquí. */
export default function Registro() {
  const navigate = useNavigate()
  const registrar = useRegistrarUsuario()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegistroForm>({
    resolver: zodResolver(RegistroFormSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      password: '',
    },
  })
  const clave = useWatch({ control, name: 'password' })

  function enviar(datos: RegistroForm) {
    setErrorGeneral(null)
    registrar.mutate(datos, {
      onSuccess: () => {
        const estado: EstadoLogin = { registrado: true }
        void navigate(RUTAS.login, { state: estado })
      },
      onError: (error) => {
        if (esApiError(error) && error.status === 409) {
          setErrorGeneral('El usuario o correo ya está registrado.')
        } else {
          setErrorGeneral(aplicarErroresCampos(error, CAMPOS, setError))
        }
      },
    })
  }

  return (
    <TarjetaAuth titulo="Crea tu cuenta" ancho="max-w-md">
      <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-4">
        <Campo
          etiqueta="Nombre de usuario"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Nombres"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Campo
            etiqueta="Apellidos"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <Campo
          etiqueta="Fecha de nacimiento"
          type="date"
          autoComplete="bday"
          error={errors.birthDate?.message}
          {...register('birthDate')}
        />
        <Campo
          etiqueta="Contraseña (mín. 12 caracteres)"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          ayuda={<IndicadorFortaleza clave={clave} />}
          {...register('password')}
        />
        <div aria-live="assertive">
          {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
        </div>
        <Boton type="submit" anchoCompleto cargando={registrar.isPending}>
          Crear cuenta
        </Boton>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          to={RUTAS.login}
          className="text-marca-600 dark:text-marca-100 font-semibold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </TarjetaAuth>
  )
}
