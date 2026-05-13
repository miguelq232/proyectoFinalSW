import { MapPin, Sparkles, Truck, Users } from "lucide-react"

import { authService } from "@/modules/auth/services/authService"

const stats = [
  {
    titulo: "Total usuarios",
    valor: "—",
    icon: Users,
    hint: "Placeholder",
  },
  {
    titulo: "Camiones activos",
    valor: "—",
    icon: Truck,
    hint: "Placeholder",
  },
  {
    titulo: "Zonas registradas",
    valor: "—",
    icon: MapPin,
    hint: "Placeholder",
  },
  {
    titulo: "Total clasificaciones IA",
    valor: "—",
    icon: Sparkles,
    hint: "Placeholder",
  },
] as const

export default function DashboardPage() {
  const nombre = authService.getNombre() ?? "Usuario"

  return (
    <div className="p-6 sm:p-10">
      <header className="mb-8 border-b border-green-100 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-green-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-green-900 sm:text-base">
          Bienvenido, <span className="font-medium">{nombre}</span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ titulo, valor, icon: Icon, hint }) => (
          <div
            key={titulo}
            className="rounded-xl border border-green-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-green-800/80">{titulo}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-green-900">{valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
