import type { AuthResponse, LoginRequest, RegisterRequest } from "@/modules/auth/models/authModel"

const LS_TOKEN = "igcsscz_auth_token"
const LS_ROL = "igcsscz_auth_rol"
const LS_NOMBRE = "igcsscz_auth_nombre"

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { api } = await import("@/shared/services/api")
      const res = await api.post<AuthResponse>("/auth/login", data)
      return res.data
    } catch (e) {
      const { getErrorMessage } = await import("@/shared/services/api")
      throw new Error(getErrorMessage(e))
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { api } = await import("@/shared/services/api")
      const res = await api.post<AuthResponse>("/auth/register", data)
      return res.data
    } catch (e) {
      const { getErrorMessage } = await import("@/shared/services/api")
      throw new Error(getErrorMessage(e))
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
