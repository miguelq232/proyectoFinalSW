import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { authService } from "@/modules/auth/services/authService"

export default function DashboardPage() {
  const navigate = useNavigate()
  const nombre = authService.getNombre() ?? "Usuario"

  function handleLogout() {
    authService.logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 p-6 sm:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bienvenido al Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Hola, <span className="font-medium text-foreground">{nombre}</span>
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleLogout} className="shrink-0">
          Cerrar sesión
        </Button>
      </header>
    </div>
  )
}
