import { BarChart3, Camera, LayoutDashboard, LogOut, MapPin, Recycle, Settings, Truck, Users, Compass, User, Navigation } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { authService } from "@/modules/auth/services/authService"
import { cn } from "@/lib/utils"

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive ? "bg-green-600 text-white shadow-sm" : "text-white/90 hover:bg-green-700/60"
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const rol = authService.getRol()
  const nombre = authService.getNombre() ?? "Usuario"

  function handleLogout() {
    authService.logout()
    navigate("/", { replace: true })
  }

  // Generar NAV_ITEMS dinámicamente según rol
  const navItems = (() => {
    switch (rol) {
      case "OPERADOR":
        return [
          { to: "/home/operador", label: "Mi Zona y Camión", icon: Compass, end: true },
        ]
      case "VECINO":
        return [
          { to: "/home/mapa-recoleccion", label: "Radar Recolección", icon: Navigation, end: true },
          { to: "/home/clasificar-residuo", label: "Clasificar Residuo", icon: Camera, end: true },
          { to: "/home/perfil-vecino", label: "Perfil Ecológico", icon: User, end: true },
        ]
      case "ADMINISTRADOR":
      default:
        return [
          { to: "/home/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
          { to: "/home/gps-tracking", label: "Seguimiento GPS", icon: Navigation, end: true },
          { to: "/home/usuarios", label: "Usuarios", icon: Users, end: false },
          { to: "/home/camiones", label: "Camiones", icon: Truck, end: false },
          { to: "/home/zonas", label: "Zonas", icon: MapPin, end: false },
          { to: "/home/config-puntos", label: "Configuración", icon: Settings, end: false },
          { to: "/home/reportes", label: "Reportes", icon: BarChart3, end: false },
        ]
    }
  })()

  return (
    <div className="flex min-h-svh flex-col bg-green-50/40 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-green-900/20 bg-green-800 text-white md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 border-b border-green-700/50 px-4 py-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-green-600/90 text-white shadow-inner">
            <Recycle className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight tracking-tight">IGCS SCZ</p>
            <p className="text-xs text-white/70">Gestión de residuos</p>
          </div>
        </div>

        <div className="border-b border-green-700/50 px-4 py-4">
          <p className="truncate text-sm font-medium">{nombre}</p>
          <p className="truncate text-xs uppercase tracking-wide text-white/60">{rol ?? "—"}</p>
        </div>

        <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-2 py-3 md:flex-col md:overflow-y-auto md:px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} className={navLinkClass} end={end}>
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-green-700/50 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-900/40 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-900/70"
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-h-svh flex-1 overflow-auto bg-green-50">
        <Outlet />
      </main>
    </div>
  )
}

