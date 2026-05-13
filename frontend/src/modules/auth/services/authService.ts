import axios from "axios"

import type { AuthResponse, LoginRequest, RegisterRequest } from "@/modules/auth/models/authModel"

const API_BASE = import.meta.env.VITE_API_URL as string

const LS_TOKEN = "igcsscz_auth_token"
const LS_ROL = "igcsscz_auth_rol"
const LS_NOMBRE = "igcsscz_auth_nombre"

function getMessageFromAxiosError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (data?.message) return String(data.message)
    if (data?.error) return String(data.error)
    if (err.response?.status === 401) return "Credenciales incorrectas"
    if (err.response?.status === 400) return "Solicitud no válida"
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return "Error de conexión"
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      })
      return res.data
    } catch (e) {
      throw new Error(getMessageFromAxiosError(e))
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const res = await axios.post<AuthResponse>(`${API_BASE}/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
      })
      return res.data
    } catch (e) {
      throw new Error(getMessageFromAxiosError(e))
    }
  },

  logout(): void {
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_ROL)
    localStorage.removeItem(LS_NOMBRE)
  },

  getToken(): string | null {
    return localStorage.getItem(LS_TOKEN)
  },

  getRol(): string | null {
    return localStorage.getItem(LS_ROL)
  },

  getNombre(): string | null {
    return localStorage.getItem(LS_NOMBRE)
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(LS_TOKEN))
  },

  persistSession(data: AuthResponse): void {
    localStorage.setItem(LS_TOKEN, data.token)
    localStorage.setItem(LS_ROL, data.rol)
    localStorage.setItem(LS_NOMBRE, data.nombre)
  },
}
