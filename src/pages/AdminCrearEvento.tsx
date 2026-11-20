import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso, useAvisos } from '../componentes/Avisos'
import { baseBoton, Boton, estilosBoton, tamanosBoton } from '../componentes/Boton'
import { AreaTexto, Campo, Selector } from '../componentes/Campo'
import { claseTarjeta } from '../componentes/Tarjeta'
import { EnlaceVolver } from '../componentes/Varios'
import { recordarEventoSesion } from '../funcionalidades/admin/eventosSesion'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import {
  CATEGORIAS,
  CrearEventoFormSchema,
  MAX_DESCRIPCION,
  type CrearEventoForm,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { aplicarErroresCampos } from '../lib/errores'
import { esApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CAMPOS = [
  'eventCode',
  'name',
  'description',
  'category',
  'minimumAge',
  'eventDate',
  'venueCode',
] as const

/** "2026-12-12T20:00" (datetime-local) -> LocalDateTime "2026-12-12T20:00:00". */
const aLocalDateTime = (v: string) => (v.length === 16 ? `${v}:00` : v)

/** 9.17 Crear evento (ADMIN). Las reglas (fecha pasada, sede válida, duplicado) son del backend. */
export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const { mostrar } = useAvisos()
  const crear = useCrearEvento()
  const sedes = useSedesActivas()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CrearEventoForm>({
    resolver: zodResolver(CrearEventoFormSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: 'MUSIC',
      eventDate: '',
      venueCode: '',
    },
  })
  const descripcion = useWatch({ control, name: 'description' }) ?? ''

  function enviar(datos: CrearEventoForm) {
    setErrorGeneral(null)
    crear.mutate(
      {
        ...datos,
        description: datos.description.trim() || null,
        eventDate: aLocalDateTime(datos.eventDate),
      },
      {
        onSuccess: (evento) => {
          recordarEventoSesion({
            eventCode: evento.eventCode,
            name: evento.name,
            status: evento.status,
          })
          mostrar('exito', `Evento ${evento.eventCode} creado.`)
          void navigate(RUTAS.adminGestionEvento(evento.eventCode))
        },
        onError: (error) => {
          if (esApiError(error) && error.status === 403) {
            void navigate(RUTAS.sinPermisos, { replace: true })
            return
          }
          setErrorGeneral(aplicarErroresCampos(error, CAMPOS, setError))
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <EnlaceVolver a={RUTAS.adminEventos}>Eventos</EnlaceVolver>
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Nuevo evento</h1>
      <form
        noValidate
        onSubmit={handleSubmit(enviar)}
        className={clsx(claseTarjeta, 'space-y-4 p-5 sm:p-6')}
      >
        <div aria-live="assertive">
          {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
        </div>
        <Campo
          etiqueta="Código del evento"
          className="font-mono"
          placeholder="CMF-2026"
          error={errors.eventCode?.message}
          {...register('eventCode')}
        />
        <Campo etiqueta="Nombre" error={errors.name?.message} {...register('name')} />
        <AreaTexto
          etiqueta="Descripción"
          maxLength={MAX_DESCRIPCION}
          error={errors.description?.message}
          ayuda={
            <span className="block text-right">
              {descripcion.length}/{MAX_DESCRIPCION}
            </span>
          }
          {...register('description')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Selector etiqueta="Categoría" error={errors.category?.message} {...register('category')}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Selector>
          <Campo
            etiqueta="Edad mínima"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            error={errors.minimumAge?.message}
            {...register('minimumAge', { valueAsNumber: true })}
          />
        </div>
        <Campo
          etiqueta="Fecha y hora"
          type="datetime-local"
          error={errors.eventDate?.message}
          {...register('eventDate')}
        />
        <Selector
          etiqueta="Sede"
          error={
            errors.venueCode?.message ??
            (sedes.isError ? 'No se pudieron cargar las sedes.' : undefined)
          }
          disabled={sedes.isPending}
          {...register('venueCode')}
        >
          <option value="">{sedes.isPending ? 'Cargando sedes…' : 'Selecciona una sede'}</option>
          {sedes.data?.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.code})
            </option>
          ))}
        </Selector>
        <div className="flex justify-end gap-2 pt-2">
          <Link
            to={RUTAS.adminEventos}
            className={clsx(baseBoton, tamanosBoton.md, estilosBoton.secundario)}
          >
            Cancelar
          </Link>
          <Boton type="submit" cargando={crear.isPending}>
            Crear evento
          </Boton>
        </div>
      </form>
    </div>
  )
}
