import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import LoginPage from "@/modules/auth/pages/LoginPage"
import HomeDashboardPage from "@/modules/home/pages/DashboardPage"
import HomePage from "@/modules/home/pages/HomePage"
import UsuariosPage from "@/modules/home/pages/UsuariosPage"
import CamionesPage from "@/modules/home/pages/CamionesPage"
import ZonasPage from "@/modules/home/pages/ZonasPage"
import GpsTrackingPage from "@/modules/home/pages/GpsTrackingPage"
import OperadorZonePage from "@/modules/home/pages/OperadorZonePage"
import VecinoProfilePage from "@/modules/home/pages/VecinoProfilePage"
import VecinoTrackingPage from "@/modules/home/pages/VecinoTrackingPage"
import { ModulePlaceholder } from "@/modules/home/pages/ModulePlaceholder"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import { authService } from "@/modules/auth/services/authService"

function HomeIndexRedirect() {
  const rol = authService.getRol()
  if (rol === "OPERADOR") {
    return <Navigate to="operador" replace />
  }
  if (rol === "VECINO") {
    return <Navigate to="mapa-recoleccion" replace />
  }
  return <Navigate to="dashboard" replace />
}

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeIndexRedirect />} />
          <Route path="dashboard" element={<HomeDashboardPage />} />
          
          {/* Rutas de Administrador */}
          <Route path="gps-tracking" element={<GpsTrackingPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="camiones" element={<CamionesPage />} />
          <Route path="zonas" element={<ZonasPage />} />
          <Route path="reportes" element={<ModulePlaceholder titulo="Reportes" />} />

          {/* Rutas de Operario */}
          <Route path="operador" element={<OperadorZonePage />} />

          {/* Rutas de Vecino */}
          <Route path="perfil-vecino" element={<VecinoProfilePage />} />
          <Route path="mapa-recoleccion" element={<VecinoTrackingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}


