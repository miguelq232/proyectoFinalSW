import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Loader2,
  MapPin,
  Truck,
  Users,
  UserCheck,
  UserCog,
} from "lucide-react"

import {
  reportesService,
  type ReporteCantidadEstado,
  type ReporteCantidadRol,
  type ReporteResumen,
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

export default function ReportesPage() {
  const [resumen, setResumen] = useState<ReporteResumen | null>(null)
  const [usuariosPorRol, setUsuariosPorRol] = useState<ReporteCantidadRol[]>([])
  const [camionesPorEstado, setCamionesPorEstado] = useState<ReporteCantidadEstado[]>([])
  const [vecinosPorZona, setVecinosPorZona] = useState<ReporteVecinosPorZona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReportes() {
      try {
        setError(null)
        const [resumenData, rolesData, estadosData, zonasData] = await Promise.all([
          reportesService.getResumen(),
          reportesService.getUsuariosPorRol(),
          reportesService.getCamionesPorEstado(),
          reportesService.getVecinosPorZona(),
        ])
        setResumen(resumenData)
        setUsuariosPorRol(rolesData)
        setCamionesPorEstado(estadosData)
        setVecinosPorZona(zonasData)
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
    </div>
  )
}
