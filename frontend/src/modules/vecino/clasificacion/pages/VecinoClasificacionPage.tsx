import { useEffect, useRef, useState } from "react"
import { AlertCircle, Camera, CheckCircle2, Loader2, RefreshCw, ScanLine, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { vecinoService, type VecinoProfile } from "@/modules/vecino/perfil/pages/VecinoProfilePage"

const ARDUINO_API_BASE = (import.meta.env.VITE_ARDUINO_API_URL || "/arduino") as string

type ClasificacionResponse = {
  success: boolean
  codigo_cliente: string
  clasificacion: string
  descripcion?: string
  objeto_detectado?: string
  cantidad_detectada?: number
  texto_vision?: string
  confianza: number
  puntos: number
  backend_success: boolean
  backend_error: string | null
  puntos_acumulados: number | null
  nombre_vecino: string | null
  error?: string
}

const labels: Record<string, string> = {
  BIODEGRADABLE: "Biodegradable",
  CARDBOARD: "Cartón",
  CLOTH: "Tela",
  GLASS: "Vidrio",
  METAL: "Metal",
  PAPER: "Papel",
  PLASTIC: "Plástico",
  DESCONOCIDO: "Desconocido",
}

export default function VecinoClasificacionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [vecino, setVecino] = useState<VecinoProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ClasificacionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    vecinoService
      .getMyProfile()
      .then((profile) => {
        if (mounted) setVecino(profile)
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "No se pudo cargar tu perfil")
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false)
      })

    return () => {
      mounted = false
      stopCamera()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [])

  function getCameraBlockMessage() {
    if (!window.isSecureContext) {
      return "El navegador bloquea la cámara porque la app está abierta por HTTP desde la red. En iPhone debes entrar por HTTPS para que aparezca el permiso de cámara."
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return "Este navegador no permite usar la cámara en este contexto. Usa Safari o Chrome actualizado y abre la app por HTTPS."
    }

    return null
  }

  async function startCamera() {
    setError(null)
    setResult(null)

    const blockMessage = getCameraBlockMessage()
    if (blockMessage) {
      setError(blockMessage)
      return
    }

    try {
      let stream: MediaStream

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo abrir la cámara")
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
    if (videoRef.current) videoRef.current.srcObject = null
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("No se pudo capturar la imagen")
          return
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const url = URL.createObjectURL(blob)
        setImageBlob(blob)
        setPreviewUrl(url)
        setResult(null)
        stopCamera()
      },
      "image/jpeg",
      0.92
    )
  }

  function resetCapture() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageBlob(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  async function classifyWaste() {
    if (!vecino || !imageBlob) return

    setSubmitting(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("codigo_cliente", `VEC-${vecino.id}-IGCS`)
    formData.append("imagen", imageBlob, `vecino-${vecino.id}-residuo.jpg`)

    try {
      const response = await fetch(`${ARDUINO_API_BASE}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = (await response.json()) as ClasificacionResponse

      if (!response.ok || data.error) {
        throw new Error(data.error || "No se pudo clasificar la imagen")
      }

      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el clasificador Arduino"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const codigoCliente = vecino ? `VEC-${vecino.id}-IGCS` : ""
  const clase = result?.clasificacion?.toUpperCase() || ""
  const textoVision = result?.texto_vision || result?.descripcion || ""

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Clasificar residuo</h1>
        <p className="text-neutral-500">
          Captura una foto del residuo con tu cámara y registra los puntos en tu perfil.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden border-neutral-100 bg-white shadow-sm">
          <CardHeader className="border-b border-neutral-100 bg-green-50/60">
            <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
              <Camera className="size-5 text-green-700" aria-hidden />
              Cámara de clasificación
            </CardTitle>
            <CardDescription>
              Centra el residuo en la imagen y evita fondos con muchos objetos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
                playsInline
                muted
              />
              {previewUrl && !cameraActive ? (
                <img src={previewUrl} alt="Captura del residuo" className="h-full w-full object-cover" />
              ) : null}
              {!cameraActive && !previewUrl ? (
                <div className="flex flex-col items-center gap-3 text-neutral-300">
                  <ScanLine className="size-12" aria-hidden />
                  <span className="text-sm font-medium">Sin captura</span>
                </div>
              ) : null}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex flex-wrap gap-2">
              {!cameraActive ? (
                <Button
                  type="button"
                  onClick={startCamera}
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={loadingProfile || submitting}
                >
                  <Camera className="size-4" aria-hidden />
                  Abrir cámara
                </Button>
              ) : (
                <>
                  <Button type="button" onClick={capturePhoto} className="bg-green-600 text-white hover:bg-green-700">
                    <ScanLine className="size-4" aria-hidden />
                    Capturar
                  </Button>
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    <X className="size-4" aria-hidden />
                    Cerrar
                  </Button>
                </>
              )}

              {previewUrl ? (
                <Button type="button" variant="outline" onClick={resetCapture} disabled={submitting}>
                  <RefreshCw className="size-4" aria-hidden />
                  Nueva foto
                </Button>
              ) : null}

              <Button
                type="button"
                onClick={classifyWaste}
                disabled={!imageBlob || !vecino || submitting}
                className="bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
                Clasificar y registrar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-neutral-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Datos del registro</CardTitle>
              <CardDescription>El código se toma automáticamente de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">Vecino</p>
                <p className="font-semibold text-neutral-800">
                  {loadingProfile ? "Cargando..." : vecino ? `${vecino.nombre} ${vecino.apellido}` : "No disponible"}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">Código</p>
                <p className="font-mono font-semibold text-neutral-800">{codigoCliente || "..."}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase text-neutral-400">Servicio Arduino</p>
                <p className="break-all font-mono text-xs text-neutral-700">{ARDUINO_API_BASE}/upload</p>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-950">
                  <CheckCircle2 className="size-5 text-emerald-700" aria-hidden />
                  Resultado
                </CardTitle>
                <CardDescription>
                  {result.backend_success ? "Registro sincronizado con tus puntos." : "Clasificación local sin sincronizar."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ResultBox label="Material" value={labels[clase] || result.clasificacion} />
                  <ResultBox label="Confianza" value={`${result.confianza}%`} />
                  <ResultBox label="Cantidad" value={`${result.cantidad_detectada || 1}`} />
                  <ResultBox label="Puntos" value={`+${result.puntos}`} />
                  <ResultBox label="Total" value={result.puntos_acumulados != null ? `${result.puntos_acumulados}` : "-"} />
                </div>
                {textoVision ? (
                  <div className="rounded-lg border border-emerald-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-emerald-700/70">Lo que se ve en la imagen</p>
                    {result.objeto_detectado ? (
                      <p className="mt-1 text-sm font-bold text-emerald-950">{result.objeto_detectado}</p>
                    ) : null}
                    <p className="mt-2 text-sm leading-6 text-emerald-950">{textoVision}</p>
                  </div>
                ) : null}
                {!result.backend_success && result.backend_error ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                    {result.backend_error}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 p-3">
      <p className="text-xs font-semibold uppercase text-emerald-700/70">{label}</p>
      <p className="mt-1 text-lg font-bold text-emerald-950">{value}</p>
    </div>
  )
}
