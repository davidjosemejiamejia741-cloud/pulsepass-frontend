import { z } from 'zod'

/** VenueResponse. */
export const SedeSchema = z.object({
  id: z.number().nullish(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullish(),
  capacity: z.number(),
  active: z.boolean().nullish(),
})
export type Sede = z.infer<typeof SedeSchema>
export const ListaSedesSchema = z.array(SedeSchema)
