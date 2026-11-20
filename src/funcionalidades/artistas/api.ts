import { peticion, seg } from '../../lib/http'
import { ArtistaSchema, ListaArtistasSchema } from './tipos'

export const artistasApi = {
  /** 11. GET /api/artists/active */
  activos: () => peticion('/artists/active', { esquema: ListaArtistasSchema }),
  /** 9. GET /api/artists/{id} */
  porId: (id: number) => peticion(`/artists/${seg(id)}`, { esquema: ArtistaSchema }),
  /** 10. GET /api/artists/by-stage-name?stageName= */
  porNombre: (stageName: string) =>
    peticion('/artists/by-stage-name', { esquema: ArtistaSchema, query: { stageName } }),
}
