import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  Award,
  BarChart3,
  CalendarDays,
  Gift,
  Leaf,
  TrendingUp,
  Loader2,
  MapPin,
  Recycle,
  Truck,
  UserCog,
  Users,
  UserX,
} from "lucide-react"

import {
  reportesService,
  type ReporteCantidadEstado,
  type ReporteCantidadRol,
  type ReporteCoberturaServicio,
  type ReporteComparativaMensual,
  type ReporteDistribucionPuntos,
  type ReporteMaterialReciclado,
  type ReporteNuevosRegistrosMes,
  type ReporteOperadorSinCamion,
  type ReportePuntosCategoria,
  type ReportePuntosDia,
  type ReporteResumenIncentivos,
  type ReporteRoi,
  type ReporteTasaReciclajeZona,
  type ReporteTopVecino,
  type ReporteVecinoInactivo,
  type ReporteVecinosPorZona,
  type ReporteZonaSinCamion,
} from "@/modules/admin/reportes/services/reportesService"

const BAR_COLORS = ["#16a34a", "#15803d", "#22c55e", "#4ade80", "#166534", "#86efac"]

const ROL_LABELS: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  OPERADOR: "Operador",
  VECINO: "Vecino",
}

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  EN_MANTENIMIENTO: "En mantenimiento",
}

const CATEGORIA_LABELS: Record<string, string> = {
  GLASS: "Vidrio",
  METAL: "Metal",
  PAPER: "Papel",
  PET: "PET",
  PLASTIC: "Plástico",
}

const MESES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha + "T12:00:00")
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short" })
}

function formatNum(value: number, decimals = 0): string {
  return value.toLocaleString("es-BO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return "Sin depósitos"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type ReportTab = "resumen" | "sostenibilidad" | "ciudadanos" | "flota" | "incentivos"

const REPORT_TABS: { id: ReportTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "sostenibilidad", label: "Sostenibilidad" },
  { id: "ciudadanos", label: "Ciudadanos" },
  { id: "flota", label: "Flota" },
  { id: "incentivos", label: "Incentivos" },
]

function tabButtonClass(isActive: boolean): string {
  return isActive
    ? "whitespace-nowrap border-b-2 border-green-600 px-4 py-2 font-semibold text-green-700"
    : "whitespace-nowrap px-4 py-2 text-neutral-500 hover:text-green-600"
}

function ReportCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <Icon className="size-5 shrink-0 text-green-600" aria-hidden />
        <h3 className="text-lg font-semibold text-green-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function LoadingBlock({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="py-12 text-center text-sm text-green-700/70">{label}</div>
  )
}

function EmptyBlock({ label = "Sin datos disponibles" }: { label?: string }) {
  return <p className="py-8 text-center text-sm text-neutral-400">{label}</p>
}

const tableHeadClass =
  "border-b border-green-100 text-xs font-semibold uppercase tracking-wider text-green-800/80"

interface ChartItem {
  label: string
  value: number
  color?: string
}

function ProportionalBarChart({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1)

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Sin datos disponibles
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-col justify-center gap-5">
      {items.map((item, index) => {
        const pct = item.value === 0 ? 0 : (item.value / max) * 100
        const color = item.color ?? BAR_COLORS[index % BAR_COLORS.length]

        return (
          <div key={item.label} className="min-w-0">
            <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-neutral-700">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-green-800">{item.value}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-green-50">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
                role="img"
                aria-label={`${item.label}: ${item.value}`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RoleDonutChart({ items }: { items: ChartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Sin datos disponibles
      </div>
    )
  }

  let gradient = "conic-gradient("
  let current = 0
  items.forEach((item, index) => {
    const pct = (item.value / total) * 100
    const color = item.color ?? BAR_COLORS[index % BAR_COLORS.length]
    gradient += `${color} ${current}% ${current + pct}%`
    current += pct
    if (index < items.length - 1) gradient += ", "
  })
  gradient += ")"

  const donutSize = 240
  const holeInset = 52

  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center px-1">
      <div
        className="relative shrink-0 rounded-full shadow-inner"
        style={{ width: donutSize, height: donutSize, background: gradient }}
        role="img"
        aria-label="Distribución de usuarios por rol"
      >
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm"
          style={{
            top: holeInset,
            right: holeInset,
            bottom: holeInset,
            left: holeInset,
          }}
        >
          <span className="text-3xl font-bold tabular-nums text-green-900">{total}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-green-700/70">
            usuarios
          </span>
        </div>
      </div>
      <ul className="mt-5 w-full max-w-xs space-y-2">
        {items.map((item, index) => {
          const color = item.color ?? BAR_COLORS[index % BAR_COLORS.length]
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <li
              key={item.label}
              className="flex w-full items-center justify-between gap-4 text-sm leading-snug"
            >
              <span className="inline-flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span className="whitespace-nowrap text-neutral-700">{item.label}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums text-green-800">
                {item.value} ({pct}%)
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DailyPointsBarChart({ items }: { items: { fecha: string; totalPuntos: number }[] }) {
  const max = Math.max(...items.map((item) => item.totalPuntos), 1)

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Sin datos en los últimos 30 días
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[220px] w-full min-w-0 flex-col">
      <div className="w-full min-w-0 overflow-x-auto pb-1 pt-2">
        <div className="flex min-w-max flex-1 items-end gap-1 px-1">
        {items.map((item) => {
          const pct = item.totalPuntos === 0 ? 0 : (item.totalPuntos / max) * 100
          return (
            <div
              key={item.fecha}
              className="flex w-9 shrink-0 flex-col items-center justify-end gap-1 sm:w-10"
              title={`${formatFechaCorta(item.fecha)}: ${item.totalPuntos} pts`}
            >
              <span className="text-[10px] font-semibold tabular-nums text-green-800">
                {item.totalPuntos > 0 ? item.totalPuntos : ""}
              </span>
              <div className="flex h-40 w-full max-w-9 items-end justify-center rounded-t-md bg-green-50/80 sm:h-44">
                <div
                  className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-green-700 to-green-500 transition-all duration-500"
                  style={{ height: `${pct}%`, minHeight: item.totalPuntos > 0 ? "4px" : "0" }}
                  role="img"
                  aria-label={`${formatFechaCorta(item.fecha)}: ${item.totalPuntos} puntos`}
                />
              </div>
              <span className="max-w-full truncate text-center text-[9px] leading-tight text-neutral-500">
                {formatFechaCorta(item.fecha)}
              </span>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const [usuariosPorRol, setUsuariosPorRol] = useState<ReporteCantidadRol[]>([])
  const [camionesPorEstado, setCamionesPorEstado] = useState<ReporteCantidadEstado[]>([])
  const [vecinosPorZona, setVecinosPorZona] = useState<ReporteVecinosPorZona[]>([])
  const [puntosPorCategoria, setPuntosPorCategoria] = useState<ReportePuntosCategoria[]>([])
  const [topVecinos, setTopVecinos] = useState<ReporteTopVecino[]>([])
  const [puntosPorDia, setPuntosPorDia] = useState<ReportePuntosDia[]>([])
  const [materialReciclado, setMaterialReciclado] = useState<ReporteMaterialReciclado[]>([])
  const [tasaReciclajeZona, setTasaReciclajeZona] = useState<ReporteTasaReciclajeZona[]>([])
  const [comparativaMensual, setComparativaMensual] = useState<ReporteComparativaMensual[]>([])
  const [coberturaServicio, setCoberturaServicio] = useState<ReporteCoberturaServicio | null>(null)
  const [vecinosInactivos, setVecinosInactivos] = useState<ReporteVecinoInactivo[]>([])
  const [nuevosRegistrosMes, setNuevosRegistrosMes] = useState<ReporteNuevosRegistrosMes[]>([])
  const [distribucionPuntos, setDistribucionPuntos] = useState<ReporteDistribucionPuntos[]>([])
  const [zonasSinCamion, setZonasSinCamion] = useState<ReporteZonaSinCamion[]>([])
  const [operadoresSinCamion, setOperadoresSinCamion] = useState<ReporteOperadorSinCamion[]>([])
  const [resumenIncentivos, setResumenIncentivos] = useState<ReporteResumenIncentivos | null>(null)
  const [reporteRoi, setReporteRoi] = useState<ReporteRoi | null>(null)
  const [activeTab, setActiveTab] = useState<ReportTab>("resumen")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReportes() {
      try {
        setError(null)
        const [
          rolesData,
          estadosData,
          zonasData,
          categoriaData,
          topVecinosData,
          puntosDiaData,
          materialData,
          tasaZonaData,
          comparativaData,
          coberturaData,
          inactivosData,
          nuevosData,
          distribucionData,
          zonasSinCamionData,
          operadoresSinCamionData,
          incentivosData,
          roiData,
        ] = await Promise.all([
          reportesService.getUsuariosPorRol(),
          reportesService.getCamionesPorEstado(),
          reportesService.getVecinosPorZona(),
          reportesService.getPuntosPorCategoria(),
          reportesService.getTopVecinos(),
          reportesService.getPuntosPorDia(),
          reportesService.getMaterialReciclado(),
          reportesService.getTasaReciclajeZona(),
          reportesService.getComparativaMensual(),
          reportesService.getCoberturaServicio(),
          reportesService.getVecinosInactivos(),
          reportesService.getNuevosRegistrosMes(),
          reportesService.getDistribucionPuntos(),
          reportesService.getZonasSinCamion(),
          reportesService.getOperadoresSinCamion(),
          reportesService.getResumenIncentivos(),
          reportesService.getRoi(),
        ])
        setUsuariosPorRol(rolesData)
        setCamionesPorEstado(estadosData)
        setVecinosPorZona(zonasData)
        setPuntosPorCategoria(categoriaData)
        setTopVecinos(topVecinosData)
        setPuntosPorDia(puntosDiaData)
        setMaterialReciclado(materialData)
        setTasaReciclajeZona(tasaZonaData)
        setComparativaMensual(comparativaData)
        setCoberturaServicio(coberturaData)
        setVecinosInactivos(inactivosData)
        setNuevosRegistrosMes(nuevosData)
        setDistribucionPuntos(distribucionData)
        setZonasSinCamion(zonasSinCamionData)
        setOperadoresSinCamion(operadoresSinCamionData)
        setResumenIncentivos(incentivosData)
        setReporteRoi(roiData)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar reportes")
      } finally {
        setLoading(false)
      }
    }
    loadReportes()
  }, [])

  const totalCo2Evitado = useMemo(
    () => materialReciclado.reduce((sum, row) => sum + row.co2EvitadoKg, 0),
    [materialReciclado]
  )

  const totalPesoReciclado = useMemo(
    () => materialReciclado.reduce((sum, row) => sum + row.pesoEstimadoKg, 0),
    [materialReciclado]
  )

  const impactoEquivalencias = useMemo(() => {
    const totalCO2Kg = totalCo2Evitado
    const totalPesoKg = totalPesoReciclado
    return [
      {
        emoji: "🌳",
        valor: totalCO2Kg / 21,
        unidad: "árboles no talados",
      },
      {
        emoji: "🚗",
        valor: totalCO2Kg / 0.12,
        unidad: "kilómetros sin contaminar",
      },
      {
        emoji: "💧",
        valor: totalPesoKg * 1000,
        unidad: "litros de agua conservados",
      },
      {
        emoji: "⚡",
        valor: totalPesoKg * 3.5,
        unidad: "kilowatts hora ahorrados",
      },
    ]
  }, [totalCo2Evitado, totalPesoReciclado])

  const rolesChartItems: ChartItem[] = usuariosPorRol.map((item, index) => ({
    label: ROL_LABELS[item.rol] ?? item.rol,
    value: item.cantidad,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }))

  const camionesChartItems: ChartItem[] = camionesPorEstado.map((item) => ({
    label: ESTADO_LABELS[item.estado] ?? item.estado,
    value: item.cantidad,
  }))

  const vecinosChartItems: ChartItem[] = vecinosPorZona.map((item) => ({
    label: item.zonaNombre,
    value: item.cantidad,
  }))

  const puntosDiaChartItems = puntosPorDia.map((item) => ({
    fecha: item.fecha,
    totalPuntos: item.totalPuntos,
  }))

  return (
    <div className="min-w-0 overflow-x-hidden p-6 sm:p-10 text-left">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-green-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-900">Reportes</h1>
          <p className="mt-1.5 text-sm text-green-700 sm:text-base">
            Estadísticas generales del sistema de gestión de residuos
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <Loader2 className="size-3.5 animate-spin" /> Cargando datos...
          </span>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-green-100">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={tabButtonClass(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "resumen" && (
        <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex min-w-0 items-center gap-2">
            <BarChart3 className="size-5 shrink-0 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Usuarios por rol</h2>
          </div>
          <div className="flex min-h-[280px] min-w-0 items-center justify-center overflow-visible py-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <RoleDonutChart items={rolesChartItems} />
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex min-w-0 items-center gap-2">
            <Truck className="size-5 shrink-0 text-green-600" aria-hidden />
            <h2 className="truncate text-lg font-semibold text-green-900">Camiones por estado</h2>
          </div>
          <div className="h-72 min-w-0 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <ProportionalBarChart items={camionesChartItems} />
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex min-w-0 items-center gap-2">
            <MapPin className="size-5 shrink-0 text-green-600" aria-hidden />
            <h2 className="truncate text-lg font-semibold text-green-900">Vecinos por zona</h2>
          </div>
          <div className="h-72 min-w-0 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <ProportionalBarChart items={vecinosChartItems} />
            )}
          </div>
        </section>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex min-w-0 items-center gap-2">
            <Recycle className="size-5 shrink-0 text-green-600" aria-hidden />
            <h2 className="truncate text-lg font-semibold text-green-900">Puntos por categoría</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-green-700/70">Cargando tabla...</div>
          ) : puntosPorCategoria.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">Sin depósitos registrados</p>
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-green-100 text-xs font-semibold uppercase tracking-wider text-green-800/80">
                    <th className="pb-3 pr-4">Categoría</th>
                    <th className="pb-3 pr-4 text-right">Total puntos</th>
                    <th className="pb-3 text-right">Total depósitos</th>
                  </tr>
                </thead>
                <tbody>
                  {puntosPorCategoria.map((row) => (
                    <tr
                      key={row.categoria}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-700">
                        {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-green-800">
                        {row.totalPuntos}
                      </td>
                      <td className="py-3 text-right tabular-nums text-neutral-600">
                        {row.totalDepositos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex min-w-0 items-center gap-2">
            <Award className="size-5 shrink-0 text-green-600" aria-hidden />
            <h2 className="truncate text-lg font-semibold text-green-900">Top 10 vecinos recicladores</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-green-700/70">Cargando tabla...</div>
          ) : topVecinos.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">Sin vecinos registrados</p>
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-green-100 text-xs font-semibold uppercase tracking-wider text-green-800/80">
                    <th className="pb-3 pr-3">#</th>
                    <th className="pb-3 pr-4">Nombre</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {topVecinos.map((row, index) => (
                    <tr
                      key={row.email}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-3 font-semibold tabular-nums text-green-700">
                        {index + 1}
                      </td>
                      <td className="py-3 pr-4 font-medium text-neutral-700">{row.vecinoNombre}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.email}</td>
                      <td className="py-3 text-right font-semibold tabular-nums text-green-800">
                        {row.puntosAcumulados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 min-w-0 w-full rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <CalendarDays className="size-5 shrink-0 text-green-600" aria-hidden />
          <h2 className="truncate text-lg font-semibold text-green-900">
            Puntos por día (últimos 30 días)
          </h2>
        </div>
        <div className="h-64 w-full min-w-0 sm:h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-green-700/70">
              Cargando gráfico...
            </div>
          ) : (
            <DailyPointsBarChart items={puntosDiaChartItems} />
          )}
        </div>
      </section>
        </>
      )}

      {activeTab === "sostenibilidad" && (
        <>
      <div className="mb-6 min-w-0 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
              <Leaf className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700/80">
                Impacto ambiental total
              </p>
              <p className="text-sm text-green-800">CO₂ evitado por reciclaje acumulado</p>
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums text-green-900 sm:text-4xl">
            {loading ? "—" : `${formatNum(totalCo2Evitado, 2)} kg`}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-green-900">Impacto Ambiental</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Equivalencias calculadas en base al material reciclado registrado en el sistema
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {impactoEquivalencias.map((item) => (
              <div
                key={item.unidad}
                className="flex min-h-[10.5rem] flex-col justify-between rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 p-6 shadow-md"
              >
                <span className="text-4xl leading-none" role="img" aria-hidden>
                  {item.emoji}
                </span>
                <div className="mt-4 rounded-xl bg-white/95 px-4 py-3 shadow-sm">
                  <p className="text-3xl font-bold tabular-nums text-green-900 sm:text-4xl">
                    {formatNum(item.valor, 1)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{item.unidad}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Material reciclado" icon={Recycle}>
          {loading ? (
            <LoadingBlock />
          ) : materialReciclado.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="pb-3 pr-4">Categoría</th>
                    <th className="pb-3 pr-4 text-right">Unidades</th>
                    <th className="pb-3 pr-4 text-right">Peso est. (kg)</th>
                    <th className="pb-3 text-right">CO₂ evitado (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {materialReciclado.map((row) => (
                    <tr
                      key={row.categoria}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-700">
                        {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">{formatNum(row.totalUnidades, 1)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{formatNum(row.pesoEstimadoKg, 2)}</td>
                      <td className="py-3 text-right font-semibold tabular-nums text-green-800">
                        {formatNum(row.co2EvitadoKg, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Tasa de reciclaje por zona" icon={MapPin}>
          {loading ? (
            <LoadingBlock />
          ) : tasaReciclajeZona.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="space-y-4">
              {tasaReciclajeZona.map((row) => (
                <div key={row.zonaNombre} className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-neutral-700">{row.zonaNombre}</span>
                    <span className="shrink-0 tabular-nums text-neutral-500">
                      {row.vecinosActivos}/{row.totalVecinos} vecinos ·{" "}
                      <span className="font-semibold text-green-800">
                        {formatNum(row.tasaPorcentaje, 1)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-green-50">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-500"
                      style={{ width: `${Math.min(row.tasaPorcentaje, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ReportCard>

        <ReportCard title="Comparativa mensual" icon={BarChart3} className="lg:col-span-2">
          {loading ? (
            <LoadingBlock />
          ) : comparativaMensual.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="pb-3 pr-4">Mes</th>
                    <th className="pb-3 pr-4">Año</th>
                    <th className="pb-3 pr-4 text-right">Unidades</th>
                    <th className="pb-3 pr-4 text-right">Puntos</th>
                    <th className="pb-3 text-right">Vecinos activos</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativaMensual.map((row) => (
                    <tr
                      key={`${row.anio}-${row.mes}`}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 text-neutral-700">{MESES[row.mes] ?? row.mes}</td>
                      <td className="py-3 pr-4 tabular-nums">{row.anio}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{formatNum(row.totalUnidades, 1)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-green-800">{row.totalPuntos}</td>
                      <td className="py-3 text-right tabular-nums">{row.totalVecinos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>
      </div>
        </>
      )}

      {activeTab === "ciudadanos" && (
        <>
      {coberturaServicio && !loading && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Con zona", valor: coberturaServicio.conZona },
            { label: "Sin zona", valor: coberturaServicio.sinZona },
            { label: "Con ubicación", valor: coberturaServicio.conUbicacion },
            { label: "Sin ubicación", valor: coberturaServicio.sinUbicacion },
            {
              label: "% cobertura",
              valor: `${formatNum(coberturaServicio.porcentajeCobertura, 1)}%`,
              highlight: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`min-w-0 rounded-2xl border p-4 shadow-sm ${
                item.highlight
                  ? "border-green-300 bg-green-600 text-white"
                  : "border-green-100 bg-white"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  item.highlight ? "text-green-100" : "text-green-700/80"
                }`}
              >
                {item.label}
              </p>
              <p
                className={`mt-2 text-2xl font-bold tabular-nums ${
                  item.highlight ? "text-white" : "text-neutral-800"
                }`}
              >
                {item.valor}
              </p>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-green-50" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Vecinos inactivos (30 días)" icon={UserX}>
          {loading ? (
            <LoadingBlock />
          ) : vecinosInactivos.length === 0 ? (
            <EmptyBlock label="Todos los vecinos con actividad reciente" />
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="pb-3 pr-4">Nombre</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Zona</th>
                    <th className="pb-3">Último depósito</th>
                  </tr>
                </thead>
                <tbody>
                  {vecinosInactivos.map((row) => (
                    <tr
                      key={row.email}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-700">{row.nombre}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.email}</td>
                      <td className="py-3 pr-4 text-neutral-600">{row.zonaNombre}</td>
                      <td className="py-3 text-neutral-600">{formatFechaHora(row.ultimoDeposito)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Nuevos registros por mes" icon={Users}>
          {loading ? (
            <LoadingBlock />
          ) : nuevosRegistrosMes.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="pb-3 pr-4">Mes</th>
                    <th className="pb-3 pr-4">Año</th>
                    <th className="pb-3 text-right">Nuevos vecinos</th>
                  </tr>
                </thead>
                <tbody>
                  {nuevosRegistrosMes.map((row) => (
                    <tr
                      key={`${row.anio}-${row.mes}`}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 text-neutral-700">{MESES[row.mes] ?? row.mes}</td>
                      <td className="py-3 pr-4 tabular-nums">{row.anio}</td>
                      <td className="py-3 text-right font-semibold tabular-nums text-green-800">
                        {row.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Distribución de puntos" icon={Award} className="lg:col-span-2">
          {loading ? (
            <LoadingBlock />
          ) : distribucionPuntos.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="pb-3 pr-4">Rango</th>
                    <th className="pb-3 text-right">Cantidad de vecinos</th>
                  </tr>
                </thead>
                <tbody>
                  {distribucionPuntos.map((row) => (
                    <tr
                      key={row.rango}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/50"
                    >
                      <td className="py-3 pr-4 font-medium text-neutral-700">{row.rango}</td>
                      <td className="py-3 text-right font-semibold tabular-nums text-green-800">
                        {row.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportCard>
      </div>
        </>
      )}

      {activeTab === "flota" && (
        <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Zonas sin camión activo" icon={MapPin}>
          {loading ? (
            <LoadingBlock />
          ) : zonasSinCamion.length === 0 ? (
            <EmptyBlock label="Todas las zonas tienen camión activo" />
          ) : (
            <ul className="space-y-3">
              {zonasSinCamion.map((zona) => (
                <li
                  key={zona.id}
                  className="rounded-xl border border-green-100 bg-green-50/40 px-4 py-3"
                >
                  <p className="font-semibold text-green-900">{zona.nombre}</p>
                  {zona.descripcion && (
                    <p className="mt-1 text-sm text-neutral-500">{zona.descripcion}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ReportCard>

        <ReportCard title="Operadores sin camión" icon={UserCog}>
          {loading ? (
            <LoadingBlock />
          ) : operadoresSinCamion.length === 0 ? (
            <EmptyBlock label="Todos los operadores tienen camión asignado" />
          ) : (
            <ul className="space-y-3">
              {operadoresSinCamion.map((op) => (
                <li
                  key={op.id}
                  className="rounded-xl border border-green-100 bg-green-50/40 px-4 py-3"
                >
                  <p className="font-semibold text-green-900">
                    {op.nombre} {op.apellido}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{op.email}</p>
                  {op.telefono && (
                    <p className="text-sm text-neutral-400">{op.telefono}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ReportCard>
      </div>
        </>
      )}

      {activeTab === "incentivos" && (
        <>
      {resumenIncentivos && !loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              titulo: "Puntos otorgados",
              valor: formatNum(resumenIncentivos.totalPuntosOtorgados),
              hint: "Total en depósitos",
            },
            {
              titulo: "Puntos acumulados",
              valor: formatNum(resumenIncentivos.totalPuntosAcumulados),
              hint: "En perfiles vecinos",
            },
            {
              titulo: "Promedio por vecino",
              valor: formatNum(resumenIncentivos.promedioVecino, 1),
              hint: "Puntos / vecino",
            },
            {
              titulo: "Top categoría",
              valor: CATEGORIA_LABELS[resumenIncentivos.topCategoria] ?? resumenIncentivos.topCategoria,
              hint: "Más puntos otorgados",
            },
            {
              titulo: "Estimado en Bs",
              valor: `Bs ${formatNum(resumenIncentivos.estimadoBolivianos, 2)}`,
              hint: "1 pt = 0.10 Bs",
              highlight: true,
            },
          ].map((card) => (
            <div
              key={card.titulo}
              className={`min-w-0 rounded-2xl border p-5 shadow-sm ${
                card.highlight
                  ? "border-green-300 bg-green-600 text-white"
                  : "border-green-100 bg-white"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  card.highlight ? "text-green-100" : "text-green-700/80"
                }`}
              >
                {card.titulo}
              </p>
              <p
                className={`mt-2 text-2xl font-bold tabular-nums ${
                  card.highlight ? "text-white" : "text-green-900"
                }`}
              >
                {card.valor}
              </p>
              <p className={`mt-1 text-[11px] ${card.highlight ? "text-green-100" : "text-neutral-400"}`}>
                {card.hint}
              </p>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-green-50" />
          ))}
        </div>
      )}

      {reporteRoi && !loading && (
        <section className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">ROI e Inversión</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                titulo: "ROI total",
                valor: `Bs ${formatNum(reporteRoi.roiTotal, 2)}`,
                hint: "Ingreso − costo incentivos",
                highlight: true,
              },
              {
                titulo: "Ingreso total",
                valor: `Bs ${formatNum(reporteRoi.totalIngresoBs, 2)}`,
                hint: "Por material reciclado",
              },
              {
                titulo: "Costo total",
                valor: `Bs ${formatNum(reporteRoi.totalCostoBs, 2)}`,
                hint: "Incentivos (1 pt = 0.10 Bs)",
              },
              {
                titulo: "ROI %",
                valor: `${formatNum(reporteRoi.roiPorcentaje, 1)}%`,
                hint: "Sobre costo de incentivos",
              },
            ].map((card) => (
              <div
                key={card.titulo}
                className={`min-w-0 rounded-2xl border p-5 shadow-sm ${
                  card.highlight
                    ? "border-green-300 bg-green-600 text-white"
                    : "border-green-100 bg-white"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    card.highlight ? "text-green-100" : "text-green-700/80"
                  }`}
                >
                  {card.titulo}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold tabular-nums ${
                    card.highlight ? "text-white" : "text-green-900"
                  }`}
                >
                  {card.valor}
                </p>
                <p
                  className={`mt-1 text-[11px] ${
                    card.highlight ? "text-green-100" : "text-neutral-400"
                  }`}
                >
                  {card.hint}
                </p>
              </div>
            ))}
          </div>

          <ReportCard title="Detalle por categoría" icon={BarChart3}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-green-100 text-xs font-semibold uppercase tracking-wider text-green-800/80">
                    <th className="pb-3 pr-4">Categoría</th>
                    <th className="pb-3 pr-4 text-right">Kg reciclados</th>
                    <th className="pb-3 pr-4 text-right">Ingreso est. Bs</th>
                    <th className="pb-3 pr-4 text-right">Costo incentivos Bs</th>
                    <th className="pb-3 pr-4 text-right">ROI Bs</th>
                    <th className="pb-3 text-right">Cumplimiento meta %</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteRoi.porCategoria.map((row) => (
                    <tr
                      key={row.categoria}
                      className="border-b border-green-50 last:border-0 hover:bg-green-50/40"
                    >
                      <td className="py-3 pr-4 font-medium text-green-900">
                        {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNum(row.kgReciclados, 2)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNum(row.ingresoEstimadoBs, 2)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNum(row.costoIncentivos, 2)}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold tabular-nums ${
                          row.roi >= 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {formatNum(row.roi, 2)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {formatNum(row.cumplimientoMetaPorcentaje, 1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>

          <ReportCard title="Cumplimiento de meta mensual" icon={Award}>
            <ul className="space-y-4">
              {reporteRoi.porCategoria.map((row) => (
                <li key={`meta-${row.categoria}`}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-green-900">
                      {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                    </span>
                    <span className="tabular-nums text-neutral-600">
                      {formatNum(row.cumplimientoMetaPorcentaje, 1)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-green-100">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, row.cumplimientoMetaPorcentaje))}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </ReportCard>
        </section>
      )}
        </>
      )}
    </div>
  )
}
