import { api, getErrorMessage } from "@/shared/services/api"

export interface ZonaResponse {
  id: number
  nombre: string
  descripcion: string | null
  latitudCentro?: number | null
  longitudCentro?: number | null
  radioKm?: number | null
  activa: boolean
  cantidadVecinos: number
  cantidadCamiones: number
}

export interface ZonaRequest {
  nombre: string
  descripcion?: string
  latitudCentro?: number
  longitudCentro?: number
  radioKm?: number
  activa?: boolean
}

export const zonasService = {
  async getAll(): Promise<ZonaResponse[]> {
    try {
      const res = await api.get<ZonaResponse[]>("/zonas")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getById(id: number): Promise<ZonaResponse> {
    try {
      const res = await api.get<ZonaResponse>(`/zonas/${id}`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async create(data: ZonaRequest): Promise<ZonaResponse> {
    try {
      const res = await api.post<ZonaResponse>("/zonas", data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async update(id: number, data: ZonaRequest): Promise<ZonaResponse> {
    try {
      const res = await api.put<ZonaResponse>(`/zonas/${id}`, data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async toggleActive(id: number): Promise<ZonaResponse> {
    try {
      const res = await api.patch<ZonaResponse>(`/zonas/${id}/activo`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/zonas/${id}`)
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
