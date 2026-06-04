import { api, getErrorMessage } from "@/shared/services/api"

export type ModoCalculo = "UNIDAD" | "PESO" | "AMBOS"

export interface ConfigPuntos {
  id: number
  categoria: string
  puntosUnidad: number
  puntosKg: number
  modoCalculo: ModoCalculo
  activo: boolean
  precioBsKg: number
  metaMensualKg: number
}

export interface ConfigPuntosUpdateRequest {
  puntosUnidad: number
  puntosKg: number
  modoCalculo: ModoCalculo
  activo: boolean
  precioBsKg: number
  metaMensualKg: number
}

export const configPuntosService = {
  async getAll(): Promise<ConfigPuntos[]> {
    try {
      const res = await api.get<ConfigPuntos[]>("/config-puntos")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async update(id: number, data: ConfigPuntosUpdateRequest): Promise<ConfigPuntos> {
    try {
      const res = await api.put<ConfigPuntos>(`/config-puntos/${id}`, data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
