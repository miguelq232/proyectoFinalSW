import { useState, useEffect, useRef } from "react"
import { Truck, MapPin, Play, Square, Loader2, AlertCircle, ShieldAlert, Radio, Compass, QrCode, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MapTracker, { type MapMarker } from "@/shared/components/MapTracker"
import { camionesService, type CamionResponse } from "@/modules/admin/camion/pages/CamionesPage"
import { zonasService, type ZonaResponse } from "@/modules/admin/zona/pages/ZonasPage"
import { gpsService } from "@/modules/admin/gps/pages/GpsTrackingPage"
import { authService } from "@/modules/auth/services/authService"
import { api, getErrorMessage } from "@/shared/services/api"

interface LogMessage {
  time: string
  text: string
  type: "info" | "success" | "error"
}

interface CamionQr {
  camionId: number
  placa: string
  qrPayload: string
  expiresAt: string
}

export default function OperadorZonePage() {
  const [assignedCamion, setAssignedCamion] = useState<CamionResponse | null>(null)
  const [assignedZona, setAssignedZona] = useState<ZonaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Simulación State
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null)
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [camionQr, setCamionQr] = useState<CamionQr | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  
  const simulationIntervalRef = useRef<any>(null)
  const angleRef = useRef<number>(0)

  useEffect(() => {
    fetchAssignments()
    return () => stopSimulation()
  }, [])

  async function fetchAssignments() {
    setLoading(true)
    setError(null)
    const operatorName = authService.getNombre() || ""
    try {
      const cData = await camionesService.getAll()
      // Buscar el camión asignado a este operario basándose en el nombre del operador
      const myCamion = cData.find(
        (c) => c.operadorNombre && c.operadorNombre.toLowerCase().includes(operatorName.toLowerCase())
      )

      if (myCamion) {
        setAssignedCamion(myCamion)
        if (myCamion.zonaId) {
          const zData = await zonasService.getById(myCamion.zonaId)
          setAssignedZona(zData)
          
          if (zData.latitudCentro && zData.longitudCentro) {
            setCurrentCoords([zData.latitudCentro, zData.longitudCentro])
          }
        }
        await refreshCamionQr(myCamion.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar asignación de operario")
    } finally {
      setLoading(false)
    }
  }

  async function refreshCamionQr(camionId = assignedCamion?.id) {
    if (!camionId) return
    setQrLoading(true)
    try {
      const res = await api.post<CamionQr>(`/recoleccion/camiones/${camionId}/qr`)
      setCamionQr(res.data)
    } catch (err) {
      addLog(getErrorMessage(err), "error")
    } finally {
      setQrLoading(false)
    }
  }

  function addLog(text: string, type: "info" | "success" | "error" = "info") {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [{ time, text, type }, ...prev].slice(0, 30)) // Mantener últimos 30 logs
  }

  function startSimulation() {
    if (!assignedCamion || !assignedZona || !assignedZona.latitudCentro || !assignedZona.longitudCentro) {
      addLog("Faltan datos de camión o zona para iniciar transmisión", "error")
      return
    }

    setIsSimulating(true)
    addLog("🚚 ¡Simulación GPS activada!", "success")
    addLog(`Transmisor activo para vehículo placa: ${assignedCamion.placa}`, "info")

    const centerLat = assignedZona.latitudCentro
    const centerLng = assignedZona.longitudCentro
    const radius = assignedZona.radioKm || 1.5

    // Primera transmisión inmediata
    gpsService.actualizarUbicacion(assignedCamion.id, centerLat, centerLng)
      .then(() => {
        addLog(`Transmisión inicial exitosa: ${centerLat.toFixed(5)}, ${centerLng.toFixed(5)}`, "success")
      })
      .catch((err) => {
        addLog(`Fallo en transmisión inicial: ${err.message}`, "error")
      })

    // Intervalo de desplazamiento simulado cada 3 segundos
    simulationIntervalRef.current = setInterval(() => {
      // Incrementar ángulo para dibujar una ruta circular/espiral dentro del radio de la zona
      angleRef.current += 0.15
      
      // Conversión simple a grados (aproximadamente 111.32 km por grado lat)
      // Ajustamos el recorrido para que se mueva suavemente dentro del radio de la zona (ej. al 45% del radio)
      const latOffset = (Math.sin(angleRef.current) * (radius / 111.32)) * 0.45
      const lngOffset = (Math.cos(angleRef.current * 1.3) * (radius / (111.32 * Math.cos(centerLat * Math.PI / 180)))) * 0.45

      const nextLat = centerLat + latOffset
      const nextLng = centerLng + lngOffset

      setCurrentCoords([nextLat, nextLng])

      gpsService.actualizarUbicacion(assignedCamion.id, nextLat, nextLng)
        .then(() => {
          addLog(`Coordenadas transmitidas: ${nextLat.toFixed(6)}, ${nextLng.toFixed(6)}`, "success")
        })
        .catch((err) => {
          addLog(`Error de red en transmisión GPS: ${err.message}`, "error")
        })
    }, 3000)
  }

  function stopSimulation() {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }
    setIsSimulating(false)
    addLog("🛑 Transmisión GPS detenida por el operador", "info")
  }

  // Marcadores en el mapa
  const markers: MapMarker[] = []
  
  if (currentCoords && assignedCamion) {
    markers.push({
      id: "my-truck",
      lat: currentCoords[0],
      lng: currentCoords[1],
      label: assignedCamion.placa,
      iconType: "truck",
      popupContent: `<b>Tu Camión (${assignedCamion.placa})</b><br/>Transmitiendo en tiempo real...`,
    })
  }

  const mapCenter: [number, number] = assignedZona?.latitudCentro && assignedZona?.longitudCentro
    ? [assignedZona.latitudCentro, assignedZona.longitudCentro]
    : [-17.7834, -63.1821]

  const circleArea = assignedZona?.latitudCentro && assignedZona?.longitudCentro && assignedZona.radioKm
    ? {
        center: [assignedZona.latitudCentro, assignedZona.longitudCentro] as [number, number],
        radiusMeters: assignedZona.radioKm * 1000,
        label: assignedZona.nombre,
      }
    : undefined

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-neutral-500 font-medium">Cargando tu panel de operario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 max-w-lg mx-auto">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!assignedCamion) {
    return (
      <div className="p-6 md:p-10 max-w-xl mx-auto space-y-6 text-center py-20">
        <div className="flex justify-center">
          <ShieldAlert className="size-16 text-amber-500 animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">Sin Vehículo Asignado</h1>
        <p className="text-neutral-500">
          Actualmente no tienes ningún vehículo de recolección asociado a tu cuenta de operador en la base de datos.
        </p>
        <p className="text-xs text-neutral-400">
          Por favor, solicita a un administrador que asocie tu usuario a un camión de recolección en el menú de "Camiones".
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="text-left space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Panel del Operador</h1>
        <p className="text-neutral-500">Visualiza tu ruta de recolección activa y transmite tu ubicación GPS en tiempo real.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Mapa y datos de asignación */}
        <div className="space-y-6">
          <Card className="border-neutral-100 shadow-sm overflow-hidden text-left">
            <CardHeader className="bg-green-50/50 border-b border-neutral-100 py-4">
              <CardTitle className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Truck className="size-5 text-green-600" />
                Vehículo Asignado: <span className="font-mono text-green-700">{assignedCamion.placa}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-0.5">
                <span className="text-neutral-400 text-xs">Modelo / Color</span>
                <p className="font-bold text-neutral-800">{assignedCamion.modelo || "—"} ({assignedCamion.color || "—"})</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-neutral-400 text-xs">Zona Geográfica</span>
                <p className="font-bold text-green-700 flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {assignedZona?.nombre || "Sin zona asignada"}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-neutral-400 text-xs">Radio de Cobertura</span>
                <p className="font-bold text-neutral-800 flex items-center gap-1">
                  <Radio className="size-3.5 text-neutral-400" />
                  {assignedZona?.radioKm ? `${assignedZona.radioKm} Kilómetros` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-100 shadow-sm overflow-hidden text-left">
            <CardHeader className="bg-neutral-50 border-b border-neutral-100 py-4">
              <CardTitle className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <QrCode className="size-5 text-green-600" />
                QR dinámico del camión
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid gap-4 sm:grid-cols-[180px_1fr] items-center">
              <div className="size-44 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm flex items-center justify-center">
                {camionQr ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(camionQr.qrPayload)}`}
                    alt="QR dinámico del camión"
                    className="size-40"
                  />
                ) : (
                  <QrCode className="size-12 text-neutral-300" />
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-neutral-400">Vigencia</p>
                  <p className="font-semibold text-neutral-800">
                    {camionQr ? `Expira ${new Date(camionQr.expiresAt).toLocaleTimeString()}` : "Sin QR generado"}
                  </p>
                </div>
                <p className="text-sm text-neutral-500">
                  El vecino debe escanear este QR cuando el camión esté en su puerta. El código se renueva cada vez que lo generas.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refreshCamionQr()}
                  disabled={qrLoading}
                  className="border-neutral-200"
                >
                  {qrLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  Renovar QR
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mapa Leaflet */}
          <div className="h-[400px] rounded-2xl overflow-hidden border border-neutral-100 shadow-sm relative">
            <MapTracker 
              markers={markers}
              center={mapCenter}
              zoom={14}
              circleArea={circleArea}
            />
          </div>
        </div>

        {/* Consola de Control de Simulación GPS */}
        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-neutral-100 shadow-sm overflow-hidden flex flex-col flex-1 text-left">
            <CardHeader className="bg-neutral-50 border-b border-neutral-100 py-4">
              <CardTitle className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Compass className="size-5 text-neutral-500" />
                Transmisor GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col space-y-5 overflow-hidden">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-800">Estado de Transmisión</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isSimulating ? "Transmitiendo señal en vivo..." : "Transmisor apagado"}
                  </p>
                </div>
                
                {isSimulating ? (
                  <Button 
                    type="button" 
                    onClick={stopSimulation}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
                  >
                    <Square className="size-4" />
                    Detener GPS
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={startSimulation}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                  >
                    <Play className="size-4" />
                    Iniciar GPS
                  </Button>
                )}
              </div>

              {/* Registro de logs de la simulación */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-[250px]">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Logs de Transmisión</p>
                <div className="flex-1 bg-neutral-900 text-neutral-200 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5 shadow-inner">
                  {logs.length === 0 ? (
                    <p className="text-neutral-500 italic">Consola inactiva. Enciende el transmisor GPS para ver las transmisiones de telemetría.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1">
                        <span className="text-neutral-500">[{log.time}]</span>
                        <span className={
                          log.type === "success" 
                            ? "text-emerald-400" 
                            : log.type === "error"
                            ? "text-red-400"
                            : "text-blue-300"
                        }>
                          {log.text}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
