import { useState, useEffect } from "react"
import { Truck, RefreshCw, AlertCircle, Loader2, Navigation, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import MapTracker, { type MapMarker } from "@/shared/components/MapTracker"
import { gpsService, type CamionUbicacion } from "../services/gpsService"

export default function GpsTrackingPage() {
  const [ubicaciones, setUbicaciones] = useState<CamionUbicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-17.7834, -63.1821])
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    fetchUbicaciones(true)
    
    // Polling cada 5 segundos para actualizar el movimiento en tiempo real
    const interval = setInterval(() => {
      fetchUbicaciones(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  async function fetchUbicaciones(isFirstTime = false) {
    if (isFirstTime) setLoading(true)
    try {
      const data = await gpsService.getCamionesVivo()
      setUbicaciones(data)
      
      // Auto-centrar en el primer camión activo si existe y es la primera carga
      if (isFirstTime && data.length > 0) {
        setMapCenter([data[0].latitud, data[0].longitud])
        setMapZoom(14)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener ubicaciones vivas")
    } finally {
      if (isFirstTime) setLoading(false)
    }
  }

  function centerOnTruck(u: CamionUbicacion) {
    setMapCenter([u.latitud, u.longitud])
    setMapZoom(15)
  }

  // Convertir ubicaciones vivas en marcadores del mapa
  const markers: MapMarker[] = ubicaciones.map((u) => ({
    id: u.camionId,
    lat: u.latitud,
    lng: u.longitud,
    label: u.placa,
    iconType: "truck",
    popupContent: `
      <div style="font-family: sans-serif; text-align: left; min-width: 150px;">
        <h4 style="margin: 0 0 5px 0; color: #16a34a; font-weight: bold; font-size: 0.95rem;">🚚 Placa: ${u.placa}</h4>
        <p style="margin: 0 0 3px 0; font-size: 0.75rem;"><b>Modelo:</b> ${u.modelo || "—"}</p>
        <p style="margin: 0 0 3px 0; font-size: 0.75rem;"><b>Operador:</b> ${u.operadorNombre}</p>
        <p style="margin: 0 0 3px 0; font-size: 0.75rem;"><b>Zona:</b> ${u.zonaNombre || "Sin asignar"}</p>
        <p style="margin: 0; font-size: 0.7rem; color: #6b7280;">Último reporte: ${new Date(u.ultimaActualizacion).toLocaleTimeString()}</p>
      </div>
    `,
  }))

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col h-[calc(100vh-64px)] md:h-svh">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Seguimiento GPS en Vivo</h1>
          <p className="text-neutral-500">Monitoreo cartográfico en tiempo real de todos los vehículos de basura activos en el sistema.</p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fetchUbicaciones(true)} 
          className="border-neutral-200 text-neutral-600 self-start sm:self-center flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      </header>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 shrink-0">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenido Principal en Flexbox */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 min-h-0 overflow-hidden">
        {/* Mapa */}
        <div className="h-[450px] lg:h-full rounded-2xl overflow-hidden relative border border-neutral-100 shadow-sm flex flex-col">
          <MapTracker 
            markers={markers} 
            center={mapCenter} 
            zoom={mapZoom} 
          />
        </div>

        {/* Panel lateral con catálogo de camiones */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex flex-col h-[350px] lg:h-full overflow-hidden">
          <div className="border-b border-neutral-100 pb-3 mb-4 shrink-0 text-left">
            <h2 className="font-bold text-neutral-800 text-lg flex items-center gap-2">
              <Navigation className="size-5 text-green-600 animate-pulse" />
              Camiones Activos ({ubicaciones.length})
            </h2>
            <p className="text-xs text-neutral-400 mt-1">Haz clic en un vehículo para centrarlo en el mapa.</p>
          </div>

          {loading && ubicaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2">
              <Loader2 className="size-6 animate-spin text-green-600" />
              <p className="text-xs text-neutral-400">Obteniendo coordenadas...</p>
            </div>
          ) : ubicaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
              <Truck className="size-10 text-neutral-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-600">No hay vehículos en circulación</p>
              <p className="text-xs text-neutral-400 mt-1">Cuando los operadores inicien sus recorridos, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-left">
              {ubicaciones.map((u) => (
                <div 
                  key={u.camionId}
                  onClick={() => centerOnTruck(u)}
                  className="p-3.5 rounded-xl border border-neutral-100 hover:border-green-300 hover:bg-green-50/20 cursor-pointer transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900 group-hover:text-green-700 transition-colors">
                        {u.placa}
                      </span>
                      <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-xs font-medium text-neutral-500 truncate">Operador: {u.operadorNombre}</p>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-0.5 truncate">
                      <MapPin className="size-3 text-neutral-300" /> Zona: <span className="font-semibold text-neutral-500">{u.zonaNombre || "Sin asignar"}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 gap-1.5 text-right">
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                      VIVO
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {new Date(u.ultimaActualizacion).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
