import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { authService } from "@/modules/auth/services/authService"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
