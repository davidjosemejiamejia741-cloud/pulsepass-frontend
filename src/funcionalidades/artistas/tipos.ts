import { z } from 'zod'

/** ArtistResponse (Fase 2/3). */
export const ArtistaSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  country: z.string().nullish(),
  genre: z.string().nullish(),
  active: z.boolean().nullish(),
})
export type Artista = z.infer<typeof ArtistaSchema>

export const ListaArtistasSchema = z.array(ArtistaSchema)
