import bgImage from "../../../assets/login.png"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/modules/auth/services/authService"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (authService.isAuthenticated()) {
    return <Navigate to="/home" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authService.login({ email: email.trim(), password })
      authService.persistSession(data)
      navigate("/home", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión")
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
                Ingresa con tu cuenta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="font-medium text-white">
                    Correo electrónico
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
                    aria-invalid={Boolean(error)}
                    placeholder="nombre@ejemplo.com"
                    className="h-11 border-neutral-200/90 bg-white/95 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="password" className="font-medium text-white">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      aria-invalid={Boolean(error)}
                      placeholder="••••••••"
                      className="h-11 border-neutral-200/90 bg-white/95 pr-11 text-neutral-900 placeholder:text-neutral-500 focus-visible:border-green-600 focus-visible:ring-green-600/30 focus-visible:ring-offset-0"
                    />
                    <button
                      type="button"
                      className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-offset-2 transition-colors hover:bg-green-50 hover:text-green-900 focus-visible:ring-2 focus-visible:ring-green-600 disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showPassword}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 shrink-0" aria-hidden />
                      ) : (
                        <Eye className="size-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  </div>
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
                      Ingresando…
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <p className="text-center text-sm text-white/90">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-white underline underline-offset-2 hover:text-green-100"
                  >
                    Regístrate
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
