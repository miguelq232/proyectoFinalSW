import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import LoginPage from "@/modules/auth/pages/LoginPage"
import HomeDashboardPage from "@/modules/home/pages/DashboardPage"
import HomePage from "@/modules/home/pages/HomePage"
import { ModulePlaceholder } from "@/modules/home/pages/ModulePlaceholder"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"

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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HomeDashboardPage />} />
          <Route path="usuarios" element={<ModulePlaceholder titulo="Usuarios" />} />
          <Route path="camiones" element={<ModulePlaceholder titulo="Camiones" />} />
          <Route path="zonas" element={<ModulePlaceholder titulo="Zonas" />} />
          <Route path="reportes" element={<ModulePlaceholder titulo="Reportes" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
