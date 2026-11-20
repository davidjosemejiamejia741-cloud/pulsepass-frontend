import { peticion, seg } from '../../lib/http'
import { ListaSedesSchema, SedeSchema } from './tipos'

export const sedesApi = {
  /** 2. GET /api/venues/active */
  activas: () => peticion('/venues/active', { esquema: ListaSedesSchema }),
  /** 1. GET /api/venues/{code} */
  porCodigo: (code: string) => peticion(`/venues/${seg(code)}`, { esquema: SedeSchema }),
}
