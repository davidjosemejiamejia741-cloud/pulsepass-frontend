import { z } from 'zod'
import { ArtistaSchema } from '../artistas/tipos'

export const CATEGORIAS = [
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
] as const
export const EventCategorySchema = z.enum(CATEGORIAS)
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export type EventStatus = z.infer<typeof EventStatusSchema>

/** EventSummaryResponse: lo que devuelven /published y /by-artist. */
export const EventoResumenSchema = z.object({
  id: z.number().nullish(),
  eventCode: z.string(),
  name: z.string(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  venueName: z.string().nullish(),
})
export type EventoResumen = z.infer<typeof EventoResumenSchema>
export const ListaEventosSchema = z.array(EventoResumenSchema)

/** EventResponse: detalle con sede y artistas. */
export const EventoSchema = z.object({
  id: z.number().nullish(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  minimumAge: z.number(),
  venueCode: z.string().nullish(),
  venueName: z.string().nullish(),
  artists: z
    .array(ArtistaSchema)
    .nullish()
    .transform((a) => a ?? []),
})
export type Evento = z.infer<typeof EventoSchema>

export const MAX_DESCRIPCION = 500

/** CreateEventRequest: validación de formato en cliente (las reglas de negocio son del backend). */
export const CrearEventoFormSchema = z.object({
  eventCode: z
    .string()
    .trim()
    .min(1, 'Ingresa el código del evento')
    .max(50, 'Máximo 50 caracteres'),
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150, 'Máximo 150 caracteres'),
  description: z.string().max(MAX_DESCRIPCION, `Máximo ${MAX_DESCRIPCION} caracteres`),
  category: EventCategorySchema,
  minimumAge: z
    .number({ error: 'Ingresa la edad mínima' })
    .int('Debe ser un número entero')
    .min(0, 'Debe ser 0 o mayor'),
  eventDate: z
    .string()
    .min(1, 'Selecciona la fecha y hora')
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Fecha inválida'),
  venueCode: z.string().min(1, 'Elige la sede del evento'),
})
export type CrearEventoForm = z.infer<typeof CrearEventoFormSchema>
export type CrearEventoRequest = Omit<CrearEventoForm, 'description'> & {
  description: string | null
}
