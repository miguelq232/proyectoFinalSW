import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import LoginPage from "@/modules/auth/pages/LoginPage"
import RegisterPage from "@/modules/auth/pages/RegisterPage"
import DashboardPage from "@/modules/dashboard/pages/DashboardPage"
import HomePage from "@/modules/home/pages/HomePage"
import OperadorZonePage from "@/modules/operador/zona/pages/OperadorZonePage"
import UsuariosPage from "@/modules/admin/usuarios/pages/UsuariosPage"
import CamionesPage from "@/modules/admin/camion/pages/CamionesPage"
import ZonasPage from "@/modules/admin/zona/pages/ZonasPage"
import GpsTrackingPage from "@/modules/admin/gps/pages/GpsTrackingPage"
import ReportesPage from "@/modules/admin/reportes/pages/ReportesPage"
import ConfigPuntosPage from "@/modules/admin/config/pages/ConfigPuntosPage"
import VecinoProfilePage from "@/modules/vecino/perfil/pages/VecinoProfilePage"
import VecinoTrackingPage from "@/modules/vecino/mapa/pages/VecinoTrackingPage"
import VecinoClasificacionPage from "@/modules/vecino/clasificacion/pages/VecinoClasificacionPage"
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeIndexRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Rutas de Administrador */}
          <Route path="gps-tracking" element={<GpsTrackingPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="camiones" element={<CamionesPage />} />
          <Route path="zonas" element={<ZonasPage />} />
          <Route path="config-puntos" element={<ConfigPuntosPage />} />
          <Route path="reportes" element={<ReportesPage />} />

          {/* Rutas de Operario */}
          <Route path="operador" element={<OperadorZonePage />} />

          {/* Rutas de Vecino */}
          <Route path="clasificar-residuo" element={<VecinoClasificacionPage />} />
          <Route path="perfil-vecino" element={<VecinoProfilePage />} />
          <Route path="mapa-recoleccion" element={<VecinoTrackingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

