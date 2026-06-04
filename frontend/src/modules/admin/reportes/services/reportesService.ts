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

export interface ReportePuntosCategoria {
  categoria: string
  totalPuntos: number
  totalDepositos: number
}

export interface ReporteTopVecino {
  vecinoNombre: string
  email: string
  puntosAcumulados: number
  totalDepositos: number
}

export interface ReportePuntosDia {
  fecha: string
  totalPuntos: number
  totalDepositos: number
}

export interface ReporteMaterialReciclado {
  categoria: string
  totalUnidades: number
  pesoEstimadoKg: number
  co2EvitadoKg: number
}

export interface ReporteTasaReciclajeZona {
  zonaNombre: string
  totalVecinos: number
  vecinosActivos: number
  tasaPorcentaje: number
}

export interface ReporteComparativaMensual {
  mes: number
  anio: number
  totalUnidades: number
  totalPuntos: number
  totalVecinos: number
}

export interface ReporteCoberturaServicio {
  totalVecinos: number
  conZona: number
  sinZona: number
  conUbicacion: number
  sinUbicacion: number
  porcentajeCobertura: number
}

export interface ReporteVecinoInactivo {
  nombre: string
  email: string
  zonaNombre: string
  ultimoDeposito: string | null
}

export interface ReporteNuevosRegistrosMes {
  mes: number
  anio: number
  cantidad: number
}

export interface ReporteDistribucionPuntos {
  rango: string
  cantidad: number
}

export interface ReporteZonaSinCamion {
  id: number
  nombre: string
  descripcion: string | null
}

export interface ReporteOperadorSinCamion {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string | null
}

export interface ReporteResumenIncentivos {
  totalPuntosOtorgados: number
  totalPuntosAcumulados: number
  promedioVecino: number
  topCategoria: string
  estimadoBolivianos: number
}

export interface ReporteRoiCategoria {
  categoria: string
  kgReciclados: number
  ingresoEstimadoBs: number
  costoIncentivos: number
  roi: number
  cumplimientoMetaPorcentaje: number
}

export interface ReporteRoi {
  porCategoria: ReporteRoiCategoria[]
  totalIngresoBs: number
  totalCostoBs: number
  roiTotal: number
  roiPorcentaje: number
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

  async getPuntosPorCategoria(): Promise<ReportePuntosCategoria[]> {
    try {
      const res = await api.get<ReportePuntosCategoria[]>("/reportes/puntos-por-categoria")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getTopVecinos(): Promise<ReporteTopVecino[]> {
    try {
      const res = await api.get<ReporteTopVecino[]>("/reportes/top-vecinos")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getPuntosPorDia(): Promise<ReportePuntosDia[]> {
    try {
      const res = await api.get<ReportePuntosDia[]>("/reportes/puntos-por-dia")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getMaterialReciclado(): Promise<ReporteMaterialReciclado[]> {
    try {
      const res = await api.get<ReporteMaterialReciclado[]>("/reportes/material-reciclado")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getTasaReciclajeZona(): Promise<ReporteTasaReciclajeZona[]> {
    try {
      const res = await api.get<ReporteTasaReciclajeZona[]>("/reportes/tasa-reciclaje-zona")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getComparativaMensual(): Promise<ReporteComparativaMensual[]> {
    try {
      const res = await api.get<ReporteComparativaMensual[]>("/reportes/comparativa-mensual")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getCoberturaServicio(): Promise<ReporteCoberturaServicio> {
    try {
      const res = await api.get<ReporteCoberturaServicio>("/reportes/cobertura-servicio")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getVecinosInactivos(): Promise<ReporteVecinoInactivo[]> {
    try {
      const res = await api.get<ReporteVecinoInactivo[]>("/reportes/vecinos-inactivos")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getNuevosRegistrosMes(): Promise<ReporteNuevosRegistrosMes[]> {
    try {
      const res = await api.get<ReporteNuevosRegistrosMes[]>("/reportes/nuevos-registros-mes")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getDistribucionPuntos(): Promise<ReporteDistribucionPuntos[]> {
    try {
      const res = await api.get<ReporteDistribucionPuntos[]>("/reportes/distribucion-puntos")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getZonasSinCamion(): Promise<ReporteZonaSinCamion[]> {
    try {
      const res = await api.get<ReporteZonaSinCamion[]>("/reportes/zonas-sin-camion")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getOperadoresSinCamion(): Promise<ReporteOperadorSinCamion[]> {
    try {
      const res = await api.get<ReporteOperadorSinCamion[]>("/reportes/operadores-sin-camion")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getResumenIncentivos(): Promise<ReporteResumenIncentivos> {
    try {
      const res = await api.get<ReporteResumenIncentivos>("/reportes/resumen-incentivos")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },

  async getRoi(): Promise<ReporteRoi> {
    try {
      const res = await api.get<ReporteRoi>("/reportes/roi")
      return res.data
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  },
}
