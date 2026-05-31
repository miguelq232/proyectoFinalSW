import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

export interface MapMarker {
  id: string | number
  lat: number
  lng: number
  label: string
  iconType?: "truck" | "home" | "center"
  popupContent?: string
  draggable?: boolean
}

interface MapTrackerProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  circleArea?: {
    center: [number, number]
    radiusMeters: number
    label?: string
  }
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapTracker({
  markers,
  center = [-17.7834, -63.1821], // Santa Cruz de la Sierra, Bolivia
  zoom = 13,
  circleArea,
  onMapClick,
}: MapTrackerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Record<string | number, any>>({})
  const circleRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // 1. Cargar Leaflet dinámicamente desde CDN
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true)
      return
    }

    // Cargar CSS de Leaflet
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    link.crossOrigin = ""
    document.head.appendChild(link)

    // Cargar JS de Leaflet
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.onload = () => {
      setLeafletLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      // No removemos los scripts para evitar recargar si se vuelve a montar,
      // pero limpiamos el mapa
    }
  }, [])

  // 2. Inicializar el mapa
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return

    const L = (window as any).L
    if (!L) return

    // Evitar reinicializar si ya existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
      return
    }

    // Inicializar mapa
    const map = L.map(mapContainerRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    // Capa de mosaico (OpenStreetMap) con estética elegante
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded])

  // 2.5 Registrar escuchador de clics en el mapa dinámicamente
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !onMapClick) return

    const map = mapInstanceRef.current
    const clickHandler = (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }

    map.on("click", clickHandler)

    return () => {
      map.off("click", clickHandler)
    }
  }, [leafletLoaded, onMapClick])

  // 3. Sincronizar el círculo de cobertura (Zona)
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    // Limpiar círculo existente
    if (circleRef.current) {
      circleRef.current.remove()
      circleRef.current = null
    }

    // Dibujar nuevo círculo
    if (circleArea) {
      const circle = L.circle(circleArea.center, {
        color: "#10b981", // Emerald/green
        fillColor: "#10b981",
        fillOpacity: 0.15,
        radius: circleArea.radiusMeters,
      }).addTo(mapInstanceRef.current)

      if (circleArea.label) {
        circle.bindPopup(`<b>${circleArea.label}</b><br/>Área de cobertura de recolección.`)
      }

      circleRef.current = circle
      
      // Auto-ajustar mapa a los límites de la zona si no hay marcadores
      if (markers.length === 0) {
        mapInstanceRef.current.fitBounds(circle.getBounds())
      }
    }
  }, [leafletLoaded, circleArea, markers.length])

  // 4. Sincronizar marcadores dinámicamente
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    const currentMap = mapInstanceRef.current

    // Identificar marcadores nuevos y actualizados
    const currentMarkerIds = new Set(markers.map(m => String(m.id)))

    // Eliminar marcadores que ya no están en la lista
    Object.keys(markersRef.current).forEach(id => {
      if (!currentMarkerIds.has(String(id))) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Agregar o actualizar marcadores actuales
    markers.forEach(m => {
      const markerId = String(m.id)
      const existingMarker = markersRef.current[markerId]

      // Definir icono personalizado premium según rol/tipo
      let iconColor = "#ef4444" // default red
      let iconHtml = "📍"

      if (m.iconType === "truck") {
        iconColor = "#16a34a" // green
        iconHtml = "🚚"
      } else if (m.iconType === "home") {
        iconColor = "#3b82f6" // blue
        iconHtml = "🏠"
      } else if (m.iconType === "center") {
        iconColor = "#10b981"
        iconHtml = "🎯"
      }

      const customIcon = L.divIcon({
        html: `<div class="flex items-center justify-center size-9 rounded-full bg-white shadow-md border-2 border-dashed transition-all duration-300" style="border-color: ${iconColor}; font-size: 1.25rem;">
                 ${iconHtml}
               </div>`,
        className: "custom-map-marker-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      if (existingMarker) {
        // Mover marcador suavemente
        existingMarker.setLatLng([m.lat, m.lng])
        if (m.popupContent) {
          existingMarker.setPopupContent(m.popupContent)
        }
        
        // Sincronizar estado draggable
        if (m.draggable) {
          existingMarker.dragging.enable()
        } else {
          existingMarker.dragging.disable()
        }
      } else {
        // Crear nuevo marcador
        const marker = L.marker([m.lat, m.lng], { 
          icon: customIcon,
          draggable: !!m.draggable 
        }).addTo(currentMap)

        if (m.draggable && onMapClick) {
          marker.on("dragend", (event: any) => {
            const position = event.target.getLatLng()
            onMapClick(position.lat, position.lng)
          })
        }

        if (m.popupContent) {
          marker.bindPopup(m.popupContent)
        } else {
          marker.bindPopup(`<b>${m.label}</b>`)
        }
        markersRef.current[markerId] = marker
      }
    })
  }, [leafletLoaded, markers])

  return (
    <div className="relative w-full h-full min-h-[400px] bg-green-50/20 flex items-center justify-center rounded-2xl border border-green-100 shadow-sm overflow-hidden">
      {!leafletLoaded && (
        <div className="absolute inset-0 z-10 bg-white/85 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-green-600" />
          <p className="text-neutral-500 font-medium text-sm">Cargando mapas cartográficos interactivos...</p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
    </div>
  )
}
