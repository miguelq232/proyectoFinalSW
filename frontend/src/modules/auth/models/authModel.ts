export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono: string
  rol: string
}

export interface AuthResponse {
  token: string
  email: string
  rol: string
  nombre: string
}
