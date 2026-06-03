import { api, getErrorMessage } from "@/shared/services/api"

export interface UsuarioResponse {
  id: number
  email: string
  nombre: string
  apellido: string
  telefono: string | null
  rol: "ADMINISTRADOR" | "OPERADOR" | "VECINO"
  activo: boolean
  fechaCreacion: string
  licencia?: string | null
  turno?: string | null
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  codigoQR?: string | null
  puntosAcumulados?: number | null
  zonaId?: number | null
  zonaNombre?: string | null
}

export interface UsuarioRequest {
  email: string
  password?: string
  nombre: string
  apellido: string
  telefono?: string
  rol: "ADMINISTRADOR" | "OPERADOR" | "VECINO"
  activo?: boolean
  licencia?: string
  turno?: string
  direccion?: string
  latitud?: number
  longitud?: number
  zonaId?: number
}

export const usuariosService = {
  async getAll(): Promise<UsuarioResponse[]> {
    try {
      const res = await api.get<UsuarioResponse[]>("/usuarios")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getById(id: number): Promise<UsuarioResponse> {
    try {
      const res = await api.get<UsuarioResponse>(`/usuarios/${id}`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async create(data: UsuarioRequest): Promise<UsuarioResponse> {
    try {
      const res = await api.post<UsuarioResponse>("/usuarios", data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async update(id: number, data: UsuarioRequest): Promise<UsuarioResponse> {
    try {
      const res = await api.put<UsuarioResponse>(`/usuarios/${id}`, data)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async toggleActive(id: number): Promise<UsuarioResponse> {
    try {
      const res = await api.patch<UsuarioResponse>(`/usuarios/${id}/activo`)
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/usuarios/${id}`)
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
