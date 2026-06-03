import bgImage from "../../../assets/login.png"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RegisterRequest } from "@/modules/auth/models/authModel"
import { authService } from "@/modules/auth/services/authService"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type RolRegistro = "VECINO" | "OPERADOR"

type FieldErrors = {
  nombre?: string
  apellido?: string
  email?: string
  password?: string
  confirmPassword?: string
  rol?: string
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
  hasError,
  errorMessage,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  disabled: boolean
  hasError: boolean
  errorMessage?: string
  autoComplete?: string
}) {
  return (
    <div className="space-y-2 text-left">
      <Label htmlFor={id} className="font-medium text-white">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={hasError}
          placeholder="••••••••"
          className="h-11 border-neutral-200/90 bg-white/95 pr-11 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
        />
        <button
          type="button"
          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-offset-2 transition-colors hover:bg-green-50 hover:text-green-900 focus-visible:ring-2 focus-visible:ring-green-600 disabled:pointer-events-none disabled:opacity-50"
          onClick={onToggleShow}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          disabled={disabled}
        >
          {show ? (
            <EyeOff className="size-4 shrink-0" aria-hidden />
          ) : (
            <Eye className="size-4 shrink-0" aria-hidden />
          )}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-100" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rol, setRol] = useState<RolRegistro>("VECINO")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (authService.isAuthenticated()) {
    return <Navigate to="/home" replace />
  }

  function validate(): boolean {
    const errors: FieldErrors = {}
    const trimmedNombre = nombre.trim()
    const trimmedApellido = apellido.trim()
    const trimmedEmail = email.trim()

    if (!trimmedNombre) {
      errors.nombre = "El nombre es obligatorio"
    }
    if (!trimmedApellido) {
      errors.apellido = "El apellido es obligatorio"
    }
    if (!trimmedEmail) {
      errors.email = "El correo electrónico es obligatorio"
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Ingresa un correo electrónico válido"
    }
    if (!password) {
      errors.password = "La contraseña es obligatoria"
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Debes confirmar la contraseña"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }
    if (!rol) {
      errors.rol = "Selecciona un rol"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      const payload: RegisterRequest = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefono.trim(),
        rol,
      }
      const data = await authService.register(payload)
      authService.persistSession(data)
      navigate("/home", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh w-full">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden
      />
      <div className="relative z-10 grid min-h-svh w-full grid-cols-1 md:grid-cols-[70%_30%]">
        <aside className="relative hidden min-h-svh overflow-hidden md:flex md:flex-col">
          <div
            className="absolute inset-0 bg-gradient-to-br from-green-900/75 via-green-800/65 to-emerald-950/80"
            aria-hidden
          />
          <div className="relative z-10 flex flex-1 flex-col justify-center px-10 py-12 text-white lg:px-14">
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm lg:text-5xl">
              IGCS SCZ
            </h1>
            <p className="mt-4 max-w-md text-lg leading-snug text-white/95 lg:text-xl">
              Sistema Inteligente de Gestión de Residuos Urbanos
            </p>
          </div>
        </aside>

        <main className="flex min-h-svh flex-col items-center justify-center bg-transparent p-4 sm:p-8">
          <Card className="w-full max-w-md rounded-xl border border-white/30 bg-white/20 shadow-sm backdrop-blur-md">
            <CardHeader className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-xl font-bold text-white sm:text-2xl">IGCS SCZ</CardTitle>
              <CardDescription className="text-white/80">
                Crea tu cuenta como vecino u operador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                <div className="space-y-2 text-left">
                  <Label htmlFor="nombre" className="font-medium text-white">
                    Nombre *
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.nombre)}
                    placeholder="Ej. Juan"
                    className="h-11 border-neutral-200/90 bg-white/95 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                  />
                  {fieldErrors.nombre ? (
                    <p className="text-xs text-red-100" role="alert">
                      {fieldErrors.nombre}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="apellido" className="font-medium text-white">
                    Apellido *
                  </Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.apellido)}
                    placeholder="Ej. Pérez"
                    className="h-11 border-neutral-200/90 bg-white/95 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                  />
                  {fieldErrors.apellido ? (
                    <p className="text-xs text-red-100" role="alert">
                      {fieldErrors.apellido}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="font-medium text-white">
                    Correo electrónico *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.email)}
                    placeholder="nombre@ejemplo.com"
                    className="h-11 border-neutral-200/90 bg-white/95 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                  />
                  {fieldErrors.email ? (
                    <p className="text-xs text-red-100" role="alert">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="telefono" className="font-medium text-white">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="text"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={loading}
                    placeholder="+591 70000000"
                    className="h-11 border-neutral-200/90 bg-white/95 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                  />
                </div>

                <PasswordField
                  id="password"
                  label="Contraseña *"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  hasError={Boolean(fieldErrors.password)}
                  errorMessage={fieldErrors.password}
                  autoComplete="new-password"
                />

                <PasswordField
                  id="confirmPassword"
                  label="Confirmar contraseña *"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((v) => !v)}
                  disabled={loading}
                  hasError={Boolean(fieldErrors.confirmPassword)}
                  errorMessage={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />

                <div className="space-y-2 text-left">
                  <Label htmlFor="rol" className="font-medium text-white">
                    Rol *
                  </Label>
                  <select
                    id="rol"
                    name="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolRegistro)}
                    disabled={loading}
                    aria-invalid={Boolean(fieldErrors.rol)}
                    className="h-11 w-full rounded-md border border-neutral-200/90 bg-white/95 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  >
                    <option value="VECINO">Vecino</option>
                    <option value="OPERADOR">Operador</option>
                  </select>
                  {fieldErrors.rol ? (
                    <p className="text-xs text-red-100" role="alert">
                      {fieldErrors.rol}
                    </p>
                  ) : null}
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-md border border-red-400/50 bg-red-950/35 px-3 py-2 text-sm text-red-50"
                  >
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="h-11 w-full bg-green-600 text-white shadow-sm hover:bg-green-700 focus-visible:ring-green-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      Registrando…
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>

                <p className="text-center text-sm text-white/90">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-white underline underline-offset-2 hover:text-green-100"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
