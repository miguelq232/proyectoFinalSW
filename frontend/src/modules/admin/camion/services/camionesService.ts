import { api, getErrorMessage } from "@/shared/services/api"

export type EstadoCamion = "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"

export interface CamionResponse {
  id: number
  placa: string
  modelo: string | null
  anio: number
  color: string | null
  estado: EstadoCamion
  fechaRegistro: string
  zonaId?: number | null
  zonaNombre?: string | null
  operadorId?: number | null
  operadorNombre?: string | null
}

export interface CamionRequest {
  placa: string
  modelo?: string
  anio: number
  color?: string
  estado: EstadoCamion
  zonaId?: number
  operadorId?: number
}

export const camionesService = {
  async getAll(): Promise<CamionResponse[]> {
    try {
      const res = await api.get<CamionResponse[]>("/camiones")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getById(id: number): Promise<CamionResponse> {
    try {
      const res = await api.get<CamionResponse>(`/camiones/${id}`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async create(data: CamionRequest): Promise<CamionResponse> {
    try {
      const res = await api.post<CamionResponse>("/camiones", data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async update(id: number, data: CamionRequest): Promise<CamionResponse> {
    try {
      const res = await api.put<CamionResponse>(`/camiones/${id}`, data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/camiones/${id}`)
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
