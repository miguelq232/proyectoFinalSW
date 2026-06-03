import { useState, useEffect } from "react"
import { MapPin, Sparkles, Truck, Users, Loader2 } from "lucide-react"

import { authService } from "@/modules/auth/services/authService"
import { usuariosService } from "@/modules/admin/usuarios/services/usuariosService"
import { camionesService } from "@/modules/admin/camion/services/camionesService"
import { zonasService } from "@/modules/admin/zona/services/zonasService"

export default function DashboardPage() {
  const nombre = authService.getNombre() ?? "Usuario"
  const [totalUsuarios, setTotalUsuarios] = useState<number | string>("—")
  const [camionesActivos, setCamionesActivos] = useState<number | string>("—")
  const [zonasRegistradas, setZonasRegistradas] = useState<number | string>("—")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [users, trucks, zones] = await Promise.all([
          usuariosService.getAll(),
          camionesService.getAll(),
          zonasService.getAll()
        ])
        setTotalUsuarios(users.length)
        setCamionesActivos(trucks.filter(t => t.estado === "ACTIVO").length)
        setZonasRegistradas(zones.length)
      } catch (e) {
        console.error("Error al cargar estadísticas en dashboard:", e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const stats = [
    {
      titulo: "Total usuarios",
      valor: totalUsuarios,
      icon: Users,
      hint: "Registrados en el sistema",
    },
    {
      titulo: "Camiones activos",
      valor: camionesActivos,
      icon: Truck,
      hint: "En servicio actualmente",
    },
    {
      titulo: "Zonas de recolección",
      valor: zonasRegistradas,
      icon: MapPin,
      hint: "Distritos de cobertura activos",
    },
    {
      titulo: "Total clasificaciones IA",
      valor: "148", // Mock de clasificación para visualización premium
      icon: Sparkles,
      hint: "94.6% de precisión del modelo",
    },
  ] as const

  return (
    <div className="p-6 sm:p-10 text-left">
      <header className="mb-8 border-b border-green-100 pb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Panel de Control
          </h1>
          <p className="mt-1.5 text-sm text-green-700 sm:text-base">
            Bienvenido, <span className="font-semibold text-green-800">{nombre}</span>
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <Loader2 className="size-3.5 animate-spin" /> Actualizando datos...
          </span>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ titulo, valor, icon: Icon, hint }) => (
          <div
            key={titulo}
            className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-green-200 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-green-700/80 uppercase">{titulo}</p>
                <p className="text-4xl font-bold tabular-nums text-neutral-800 pt-2">{valor}</p>
                <p className="text-[11px] text-neutral-400 pt-1">{hint}</p>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 shadow-inner">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
