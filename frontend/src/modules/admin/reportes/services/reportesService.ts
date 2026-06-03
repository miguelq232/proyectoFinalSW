import { api, getErrorMessage } from "@/shared/services/api"

export interface ReporteResumen {
  totalUsuarios: number
  totalVecinos: number
  totalOperadores: number
  totalCamiones: number
  camionesActivos: number
  totalZonas: number
  zonasActivas: number
}

export interface ReporteCantidadRol {
  rol: "ADMINISTRADOR" | "OPERADOR" | "VECINO"
  cantidad: number
}

export interface ReporteCantidadEstado {
  estado: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"
  cantidad: number
}

export interface ReporteVecinosPorZona {
  zonaNombre: string
  cantidad: number
}

export const reportesService = {
  async getResumen(): Promise<ReporteResumen> {
    try {
      const res = await api.get<ReporteResumen>("/reportes/resumen")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getUsuariosPorRol(): Promise<ReporteCantidadRol[]> {
    try {
      const res = await api.get<ReporteCantidadRol[]>("/reportes/usuarios-por-rol")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getCamionesPorEstado(): Promise<ReporteCantidadEstado[]> {
    try {
      const res = await api.get<ReporteCantidadEstado[]>("/reportes/camiones-por-estado")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getVecinosPorZona(): Promise<ReporteVecinosPorZona[]> {
    try {
      const res = await api.get<ReporteVecinosPorZona[]>("/reportes/vecinos-por-zona")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
