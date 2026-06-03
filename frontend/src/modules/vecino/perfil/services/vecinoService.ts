import { api, getErrorMessage } from "@/shared/services/api"

export interface VecinoProfile {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
  zonaId: number | null
  zonaNombre: string | null
  codigoQR: string | null
  puntosAcumulados: number | null
  activo: boolean
}

export const vecinoService = {
  async getMyProfile(): Promise<VecinoProfile> {
    try {
      const res = await api.get<VecinoProfile>("/vecinos/me")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
