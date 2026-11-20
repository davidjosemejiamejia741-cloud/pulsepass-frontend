import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router'
import { Aviso } from '../componentes/Avisos'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { TarjetaAuth } from '../funcionalidades/auth/componentes/TarjetaAuth'
import { LoginFormSchema, type LoginForm } from '../funcionalidades/auth/tipos'
import { aplicarErroresCampos } from '../lib/errores'
import { esApiError } from '../lib/http'
import { leerEstadoLogin, RUTAS } from '../lib/rutas'

/** 9.8 Login */
export default function Login() {
  const { iniciarSesion, sesion } = useAuth()
  const location = useLocation()
  const estado = leerEstadoLogin(location.state)
  const expirada =
    estado.motivo === 'expirada' || (sesion.estado === 'anonimo' && sesion.expirada === true)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function enviar(datos: LoginForm) {
    setErrorGeneral(null)
    try {
      // Con la sesión activa, SoloAnonimo redirige a state.desde ?? '/' (replace).
      await iniciarSesion(datos.identifier, datos.password)
    } catch (error: unknown) {
      if (esApiError(error) && error.status === 401) {
        // FR-FE-AUTH-003: mensaje genérico, sin revelar si el usuario existe.
        setErrorGeneral('Credenciales inválidas.')
      } else if (esApiError(error) && error.status === 400) {
        setErrorGeneral(aplicarErroresCampos(error, ['identifier', 'password'], setError))
      } else {
        setErrorGeneral('No pudimos iniciar sesión. Inténtalo más tarde.')
      }
    }
  }

  return (
    <TarjetaAuth titulo="Inicia sesión">
      <div className="mb-4 space-y-2">
        {estado.registrado && <Aviso tipo="exito">Cuenta creada, inicia sesión.</Aviso>}
        {expirada && <Aviso tipo="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>}
      </div>
      <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-4">
        <Campo
          etiqueta="Usuario o correo"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Campo
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div aria-live="assertive">
          {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
        </div>
        <Boton type="submit" anchoCompleto cargando={isSubmitting}>
          Ingresar
        </Boton>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
        ¿No tienes cuenta?{' '}
        <Link
          to={RUTAS.registro}
          className="text-marca-600 dark:text-marca-100 font-semibold hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </TarjetaAuth>
  )
}
