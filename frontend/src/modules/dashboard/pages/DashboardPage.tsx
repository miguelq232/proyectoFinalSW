import { useEffect, useMemo, useState } from "react"
import { Loader2, MapPin, Truck, Users, UserCheck, UserCog } from "lucide-react"

import { authService } from "@/modules/auth/services/authService"
import {
  reportesService,
  type ReporteResumen,
} from "@/modules/admin/reportes/services/reportesService"

export default function DashboardPage() {
  const nombre = authService.getNombre() ?? "Usuario"
  const [resumen, setResumen] = useState<ReporteResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadResumen() {
      try {
        setError(null)
        const data = await reportesService.getResumen()
        setResumen(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar resumen")
      } finally {
        setLoading(false)
      }
    }
    loadResumen()
  }, [])

  const cards = useMemo(
    () => [
      {
        titulo: "Total usuarios",
        valor: resumen?.totalUsuarios,
        icon: Users,
        hint: "Registrados en el sistema",
      },
      {
        titulo: "Vecinos",
        valor: resumen?.totalVecinos,
        icon: UserCheck,
        hint: "Usuarios con rol vecino",
      },
      {
        titulo: "Operadores",
        valor: resumen?.totalOperadores,
        icon: UserCog,
        hint: "Personal de recolección",
      },
      {
        titulo: "Total camiones",
        valor: resumen?.totalCamiones,
        icon: Truck,
        hint: "Flota registrada",
      },
      {
        titulo: "Camiones activos",
        valor: resumen?.camionesActivos,
        icon: Truck,
        hint: "En servicio actualmente",
      },
      {
        titulo: "Total zonas",
        valor: resumen?.totalZonas,
        icon: MapPin,
        hint: "Distritos de cobertura",
      },
      {
        titulo: "Zonas activas",
        valor: resumen?.zonasActivas,
        icon: MapPin,
        hint: "Con recolección habilitada",
      },
    ],
    [resumen]
  )

  return (
    <div className="p-6 sm:p-10 text-left">
      <header className="mb-8 flex items-center justify-between border-b border-green-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-900">Panel de Control</h1>
          <p className="mt-1.5 text-sm text-green-700 sm:text-base">
            Bienvenido, <span className="font-semibold text-green-800">{nombre}</span>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700/80">
                  {titulo}
                </p>
                <p className="pt-2 text-4xl font-bold tabular-nums text-neutral-800">
                  {loading || valor === undefined ? "—" : valor}
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
    </div>
  )
}
