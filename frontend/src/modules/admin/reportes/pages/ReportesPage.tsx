import { useEffect, useMemo, useState } from "react"
import {
  Award,
  BarChart3,
  CalendarDays,
  Loader2,
  MapPin,
  Recycle,
  Truck,
  Users,
  UserCheck,
  UserCog,
} from "lucide-react"

import {
  reportesService,
  type ReporteCantidadEstado,
  type ReporteCantidadRol,
  type ReportePuntosCategoria,
  type ReportePuntosDia,
  type ReporteResumen,
  type ReporteTopVecino,
  type ReporteVecinosPorZona,
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

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha + "T12:00:00")
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short" })
}

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
    <div className="flex h-full flex-col justify-center gap-5">
      {items.map((item, index) => {
        const pct = item.value === 0 ? 0 : (item.value / max) * 100
        const color = item.color ?? BAR_COLORS[index % BAR_COLORS.length]

        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-neutral-700">{item.label}</span>
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

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 sm:flex-row">
      <div
        className="relative size-40 shrink-0 rounded-full shadow-inner"
        style={{ background: gradient }}
        role="img"
        aria-label="Distribución de usuarios por rol"
      >
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
          <span className="text-2xl font-bold tabular-nums text-green-900">{total}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700/70">
            usuarios
          </span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[160px]">
        {items.map((item, index) => {
          const color = item.color ?? BAR_COLORS[index % BAR_COLORS.length]
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="flex-1 text-neutral-700">{item.label}</span>
              <span className="font-semibold tabular-nums text-green-800">
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
    <div className="flex h-full min-h-[220px] flex-col">
      <div className="flex flex-1 items-end gap-1 overflow-x-auto pb-1 pt-2">
        {items.map((item) => {
          const pct = item.totalPuntos === 0 ? 0 : (item.totalPuntos / max) * 100
          return (
            <div
              key={item.fecha}
              className="flex min-w-[2rem] flex-1 flex-col items-center justify-end gap-1 sm:min-w-[2.25rem]"
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
  )
}

export default function ReportesPage() {
  const [resumen, setResumen] = useState<ReporteResumen | null>(null)
  const [usuariosPorRol, setUsuariosPorRol] = useState<ReporteCantidadRol[]>([])
  const [camionesPorEstado, setCamionesPorEstado] = useState<ReporteCantidadEstado[]>([])
  const [vecinosPorZona, setVecinosPorZona] = useState<ReporteVecinosPorZona[]>([])
  const [puntosPorCategoria, setPuntosPorCategoria] = useState<ReportePuntosCategoria[]>([])
  const [topVecinos, setTopVecinos] = useState<ReporteTopVecino[]>([])
  const [puntosPorDia, setPuntosPorDia] = useState<ReportePuntosDia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReportes() {
      try {
        setError(null)
        const [
          resumenData,
          rolesData,
          estadosData,
          zonasData,
          categoriaData,
          topVecinosData,
          puntosDiaData,
        ] = await Promise.all([
          reportesService.getResumen(),
          reportesService.getUsuariosPorRol(),
          reportesService.getCamionesPorEstado(),
          reportesService.getVecinosPorZona(),
          reportesService.getPuntosPorCategoria(),
          reportesService.getTopVecinos(),
          reportesService.getPuntosPorDia(),
        ])
        setResumen(resumenData)
        setUsuariosPorRol(rolesData)
        setCamionesPorEstado(estadosData)
        setVecinosPorZona(zonasData)
        setPuntosPorCategoria(categoriaData)
        setTopVecinos(topVecinosData)
        setPuntosPorDia(puntosDiaData)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar reportes")
      } finally {
        setLoading(false)
      }
    }
    loadReportes()
  }, [])

  const cards = useMemo(() => {
    if (!resumen) return []
    return [
      {
        titulo: "Total usuarios",
        valor: resumen.totalUsuarios,
        icon: Users,
        hint: "Registrados en el sistema",
      },
      {
        titulo: "Vecinos",
        valor: resumen.totalVecinos,
        icon: UserCheck,
        hint: "Usuarios con rol vecino",
      },
      {
        titulo: "Operadores",
        valor: resumen.totalOperadores,
        icon: UserCog,
        hint: "Personal de recolección",
      },
      {
        titulo: "Total camiones",
        valor: resumen.totalCamiones,
        icon: Truck,
        hint: "Flota registrada",
      },
      {
        titulo: "Camiones activos",
        valor: resumen.camionesActivos,
        icon: Truck,
        hint: "En servicio actualmente",
      },
      {
        titulo: "Total zonas",
        valor: resumen.totalZonas,
        icon: MapPin,
        hint: "Distritos de cobertura",
      },
      {
        titulo: "Zonas activas",
        valor: resumen.zonasActivas,
        icon: MapPin,
        hint: "Con recolección habilitada",
      },
    ]
  }, [resumen])

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
    <div className="p-6 sm:p-10 text-left">
      <header className="mb-8 flex items-center justify-between border-b border-green-100 pb-8">
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ titulo, valor, icon: Icon, hint }) => (
          <div
            key={titulo}
            className="flex flex-col justify-between rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition-all hover:border-green-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700/80">{titulo}</p>
                <p className="pt-2 text-4xl font-bold tabular-nums text-neutral-800">
                  {loading ? "—" : valor}
                </p>
                <p className="pt-1 text-[11px] text-neutral-400">{hint}</p>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50 text-green-600 shadow-inner">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Usuarios por rol</h2>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <RoleDonutChart items={rolesChartItems} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Camiones por estado</h2>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <ProportionalBarChart items={camionesChartItems} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm lg:col-span-2 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Vecinos por zona</h2>
          </div>
          <div className="h-72">
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

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Recycle className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Puntos por categoría</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-green-700/70">Cargando tabla...</div>
          ) : puntosPorCategoria.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">Sin depósitos registrados</p>
          ) : (
            <div className="overflow-x-auto">
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

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Award className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Top 10 vecinos recicladores</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-green-700/70">Cargando tabla...</div>
          ) : topVecinos.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">Sin vecinos registrados</p>
          ) : (
            <div className="overflow-x-auto">
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

        <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="size-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold text-green-900">Puntos por día (últimos 30 días)</h2>
          </div>
          <div className="h-64 sm:h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-green-700/70">
                Cargando gráfico...
              </div>
            ) : (
              <DailyPointsBarChart items={puntosDiaChartItems} />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
