import axios from "axios"
import { authService } from "@/modules/auth/services/authService"

const API_BASE = (import.meta.env.VITE_API_URL || "/api") as string

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (data?.message) return String(data.message)
    if (data?.error) return String(data.error)
    if (err.response?.status === 401) return "Sesión expirada o credenciales incorrectas"
    if (err.response?.status === 403) return "Acceso prohibido para este recurso"
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return "Error de conexión"
}
