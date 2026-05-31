import { api, getErrorMessage } from "@/shared/services/api"

export interface CamionUbicacion {
  camionId: number
  placa: string
  modelo: string | null
  estado: string
  operadorNombre: string
  zonaId?: number | null
  zonaNombre?: string | null
  latitud: number
  longitud: number
  ultimaActualizacion: string
}

export interface CercaniaResponse {
  cerca: boolean
  distanciaMetros: number | null
  placa: string | null
  camionId: number | null
  operadorNombre: string | null
}

export const gpsService = {
  async actualizarUbicacion(camionId: number, latitud: number, longitud: number): Promise<void> {
    try {
      await api.post("/gps/actualizar", { camionId, latitud, longitud })
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getCamionesVivo(): Promise<CamionUbicacion[]> {
    try {
      const res = await api.get<CamionUbicacion[]>("/gps/camiones/vivo")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getCamionesPorZonaVivo(zonaId: number): Promise<CamionUbicacion[]> {
    try {
      const res = await api.get<CamionUbicacion[]>(`/gps/zona/${zonaId}/vivo`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async checkProximidad(): Promise<CercaniaResponse> {
    try {
      const res = await api.get<CercaniaResponse>("/gps/cercano")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
