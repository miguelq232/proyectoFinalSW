import { useState, useEffect } from "react"
import { 
  MapPin, Loader2, AlertCircle, RefreshCw, Radio, 
  ShieldAlert, Bell, CheckCircle, Navigation, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import MapTracker, { type MapMarker } from "@/shared/components/MapTracker"
import { gpsService, type CamionUbicacion, type CercaniaResponse } from "../services/gpsService"
import { usuariosService, type UsuarioResponse } from "../services/usuariosService"
import { authService } from "@/modules/auth/services/authService"

export default function VecinoTrackingPage() {
  const [vecino, setVecino] = useState<UsuarioResponse | null>(null)
  const [camionesEnZona, setCamionesEnZona] = useState<CamionUbicacion[]>([])
  const [proximidad, setProximidad] = useState<CercaniaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([-17.7834, -63.1821])
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!vecino) return

    // Carga de telemetría inicial
    fetchTelemetry()

    // Polling de telemetría cada 4 segundos
    const interval = setInterval(() => {
      fetchTelemetry()
    }, 4000)

    return () => clearInterval(interval)
  }, [vecino])

  async function fetchProfile() {
    setLoading(true)
    setError(null)
    const currentName = authService.getNombre() || ""
    try {
      const uData = await usuariosService.getAll()
      const myProfile = uData.find(
        (u) => u.rol === "VECINO" && u.nombre.toLowerCase().includes(currentName.toLowerCase())
      )

      if (myProfile) {
        setVecino(myProfile)
        if (myProfile.latitud && myProfile.longitud) {
          setMapCenter([myProfile.latitud, myProfile.longitud])
          setMapZoom(15)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar perfil")
      setLoading(false)
    }
  }

  async function fetchTelemetry() {
    if (!vecino) return
    try {
      const [pData, cData] = await Promise.all([
        gpsService.checkProximidad(),
        vecino.zonaId ? gpsService.getCamionesPorZonaVivo(vecino.zonaId) : Promise.resolve([])
      ])
      setProximidad(pData)
      setCamionesEnZona(cData)
    } catch (err) {
      console.error("Error en polling de telemetría", err)
    } finally {
      setLoading(false)
    }
  }

  // Definición de marcadores en el mapa
  const markers: MapMarker[] = []

  // Agregar marcador del hogar del vecino
  if (vecino?.latitud && vecino?.longitud) {
    markers.push({
      id: "home-marker",
      lat: vecino.latitud,
      lng: vecino.longitud,
      label: "Mi Hogar",
      iconType: "home",
      popupContent: `<b>Tu Hogar</b><br/>${vecino.direccion || "Coordenadas fijadas"}`,
    })
  }

  // Agregar marcadores de los camiones activos en su zona
  camionesEnZona.forEach((c) => {
    markers.push({
      id: `camion-${c.camionId}`,
      lat: c.latitud,
      lng: c.longitud,
      label: c.placa,
      iconType: "truck",
      popupContent: `
        <div style="font-family: sans-serif; text-align: left;">
          <h4 style="margin: 0 0 4px 0; color: #16a34a;">🚚 Camión: ${c.placa}</h4>
          <p style="margin: 0; font-size: 0.75rem;"><b>Conductor:</b> ${c.operadorNombre}</p>
          <p style="margin: 0; font-size: 0.75rem;"><b>Estado:</b> ${c.estado}</p>
        </div>
      `,
    })
  })

  const circleArea = vecino && vecino.latitud && vecino.longitud && vecino.zonaId
    ? {
        center: [vecino.latitud, vecino.longitud] as [number, number],
        radiusMeters: 500, // Mostrar el círculo de alerta de 500 metros alrededor de su casa
        label: "Rango de alerta de proximidad (500 metros)",
      }
    : undefined

  // Determinar los colores, textos e iconos de la alerta de proximidad
  let alertBg = "bg-neutral-50 border-neutral-200 text-neutral-600"
  let alertTitle = "Sin telemetría activa"
  let alertDescription = "Asegúrate de haber registrado la ubicación de tu hogar en 'Mi Perfil' para activar el radar GPS."
  let alertIcon = <Info className="size-6 text-neutral-400" />

  if (vecino?.latitud && vecino?.longitud) {
    if (camionesEnZona.length === 0) {
      alertBg = "bg-neutral-50 border-neutral-100 text-neutral-600 shadow-sm"
      alertTitle = "Sin camiones en circulación"
      alertDescription = `No hay vehículos de basura transmitiendo telemetría en el distrito: ${vecino.zonaNombre || "Sin asignar"}.`
      alertIcon = <Radio className="size-6 text-neutral-400" />
    } else if (proximidad) {
      if (proximidad.cerca && proximidad.distanciaMetros) {
        alertBg = "bg-red-50 border-red-200 text-red-900 shadow-md animate-pulse border-2"
        alertTitle = "🚨 ¡EL CAMIÓN ESTÁ MUY CERCA DE TU CASA!"
        alertDescription = `Vehículo placa ${proximidad.placa} conducido por ${proximidad.operadorNombre || "—"} está a solo ${proximidad.distanciaMetros.toFixed(0)} metros. Saca tus bolsas de residuos.`
        alertIcon = <Bell className="size-6 text-red-600 animate-bounce" />
      } else if (proximidad.distanciaMetros) {
        const distKm = (proximidad.distanciaMetros / 1000).toFixed(1)
        if (proximidad.distanciaMetros <= 1000) {
          alertBg = "bg-amber-50 border-amber-200 text-amber-900 shadow-sm border"
          alertTitle = "⚠️ Camión aproximándose"
          alertDescription = `Un recolector (Placa: ${proximidad.placa}) se encuentra a ${proximidad.distanciaMetros.toFixed(0)} metros de tu domicilio.`
          alertIcon = <ShieldAlert className="size-6 text-amber-600" />
        } else {
          alertBg = "bg-blue-50 border-blue-100 text-blue-900 shadow-sm"
          alertTitle = "✅ Recolector en ruta"
          alertDescription = `Camión de basura transitando activamente a ${distKm} km de tu ubicación.`
          alertIcon = <CheckCircle className="size-6 text-blue-600" />
        }
      } else {
        alertBg = "bg-green-50 border-green-100 text-green-800 shadow-sm"
        alertTitle = "Vehículos en zona"
        alertDescription = "Camiones de recolección activos en tu distrito. Monitorea su avance en el mapa."
        alertIcon = <Navigation className="size-6 text-green-600" />
      }
    }
  }

  if (loading && !vecino) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-neutral-500 font-medium">Cargando radar de recolección...</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col h-[calc(100vh-64px)] md:h-svh">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Radar de Recolección</h1>
          <p className="text-neutral-500">Sigue el avance en tiempo real del camión de basura en tu distrito.</p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={fetchTelemetry} 
          className="border-neutral-200 text-neutral-600 self-start sm:self-center flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 shrink-0 text-left">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Banner Dinámico de Alerta de Proximidad */}
      <div className={`p-5 rounded-2xl border transition-all duration-500 shrink-0 text-left flex items-start gap-4 ${alertBg}`}>
        <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
          {alertIcon}
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <h3 className="font-bold tracking-tight text-sm sm:text-base">{alertTitle}</h3>
          <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{alertDescription}</p>
        </div>
      </div>

      {/* 2. Grid/Mapa */}
      <div className="flex-1 min-h-0 overflow-hidden relative rounded-2xl border border-neutral-100 shadow-sm">
        {vecino && (!vecino.latitud || !vecino.longitud) ? (
          <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center text-center p-6">
            <MapPin className="size-16 text-amber-500 animate-bounce mb-3" />
            <h3 className="font-bold text-neutral-800 text-lg">Hogar No Georreferenciado</h3>
            <p className="text-neutral-500 text-sm max-w-sm mt-1 mb-4">
              Para ver el mapa interactivo de tu zona y recibir notificaciones de proximidad del camión de basura, necesitas fijar las coordenadas de tu domicilio.
            </p>
            <a href="/home/perfil-vecino">
              <Button type="button" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                Fijar Ubicación de Mi Hogar
              </Button>
            </a>
          </div>
        ) : null}
        
        <MapTracker 
          markers={markers}
          center={mapCenter}
          zoom={mapZoom}
          circleArea={circleArea}
        />
      </div>
    </div>
  )
}
