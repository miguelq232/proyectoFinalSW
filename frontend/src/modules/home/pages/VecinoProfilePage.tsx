import { useState, useEffect } from "react"
import { 
  QrCode, Sparkles, Loader2, AlertCircle, 
  Save, CheckCircle2, Award, Landmark 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MapTracker, { type MapMarker } from "@/shared/components/MapTracker"
import { usuariosService, type UsuarioResponse, type UsuarioRequest } from "../services/usuariosService"
import { zonasService, type ZonaResponse } from "../services/zonasService"
import { authService } from "@/modules/auth/services/authService"

export default function VecinoProfilePage() {
  const [vecino, setVecino] = useState<UsuarioResponse | null>(null)
  const [zonas, setZonas] = useState<ZonaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [latitud, setLatitud] = useState<number | "">("")
  const [longitud, setLongitud] = useState<number | "">("")
  const [zonaId, setZonaId] = useState<number | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    setError(null)
    const currentName = authService.getNombre() || ""
    try {
      const [uData, zData] = await Promise.all([
        usuariosService.getAll(),
        zonasService.getAll()
      ])
      
      setZonas(zData)
      
      // Buscar el perfil de este vecino basándose en el nombre
      const myProfile = uData.find(
        (u) => u.rol === "VECINO" && u.nombre.toLowerCase().includes(currentName.toLowerCase())
      )

      if (myProfile) {
        setVecino(myProfile)
        setNombre(myProfile.nombre)
        setApellido(myProfile.apellido)
        setTelefono(myProfile.telefono || "")
        setDireccion(myProfile.direccion || "")
        setLatitud(myProfile.latitud ?? "")
        setLongitud(myProfile.longitud ?? "")
        setZonaId(myProfile.zonaId ?? "")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar perfil de vecino")
    } finally {
      setLoading(false)
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setLatitud(lat)
    setLongitud(lng)
    setSuccessMsg(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!vecino) return
    
    setSubmitting(true)
    setSuccessMsg(null)
    setError(null)

    const payload: UsuarioRequest = {
      email: vecino.email,
      nombre,
      apellido,
      telefono: telefono || undefined,
      rol: "VECINO",
      activo: vecino.activo,
      direccion: direccion || undefined,
      latitud: latitud !== "" ? Number(latitud) : undefined,
      longitud: longitud !== "" ? Number(longitud) : undefined,
      zonaId: zonaId !== "" ? Number(zonaId) : undefined,
    }

    try {
      const updated = await usuariosService.update(vecino.id, payload)
      setVecino(updated)
      setSuccessMsg("¡Perfil y ubicación actualizados con éxito!")
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar perfil")
    } finally {
      setSubmitting(false)
    }
  }

  // Marcadores en el mapa
  const markers: MapMarker[] = []
  if (latitud !== "" && longitud !== "") {
    markers.push({
      id: "my-home",
      lat: Number(latitud),
      lng: Number(longitud),
      label: "Mi Hogar",
      iconType: "home",
      popupContent: `<b>Tu Domicilio</b><br/>${direccion || "Coordenadas registradas"}`,
    })
  }

  const mapCenter: [number, number] = latitud !== "" && longitud !== ""
    ? [Number(latitud), Number(longitud)]
    : [-17.7834, -63.1821]

  const activeZona = zonas.find(z => z.id === Number(zonaId))
  const circleArea = activeZona && activeZona.latitudCentro && activeZona.longitudCentro && activeZona.radioKm
    ? {
        center: [activeZona.latitudCentro, activeZona.longitudCentro] as [number, number],
        radiusMeters: activeZona.radioKm * 1000,
        label: activeZona.nombre,
      }
    : undefined

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-neutral-500 font-medium">Cargando tu portal de vecino...</p>
      </div>
    )
  }

  if (!vecino) {
    return (
      <div className="p-6 md:p-10 max-w-xl mx-auto space-y-6 text-center py-20">
        <div className="flex justify-center">
          <AlertCircle className="size-16 text-amber-500 animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">Perfil de Vecino no Encontrado</h1>
        <p className="text-neutral-500">
          No pudimos localizar la cuenta de Vecino asociada a tus datos de sesión.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="text-left space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Mi Perfil Ecológico</h1>
        <p className="text-neutral-500">Registra las coordenadas de tu domicilio en el mapa y administra tu cuenta verde.</p>
      </header>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in text-left">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 animate-fade-in text-left">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 items-start">
        {/* Formulario y Mapa */}
        <div className="space-y-6">
          <Card className="border-neutral-100 shadow-sm text-left overflow-hidden">
            <CardHeader className="bg-green-50/50 border-b border-neutral-100 py-4">
              <CardTitle className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Landmark className="size-5 text-green-600" />
                Registrar Ubicación de mi Domicilio
              </CardTitle>
              <CardDescription>Haz clic en el mapa para marcar exactamente dónde queda tu hogar.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[380px] w-full relative">
                <MapTracker 
                  markers={markers}
                  center={mapCenter}
                  zoom={14}
                  circleArea={circleArea}
                  onMapClick={handleMapClick}
                />
              </div>
            </CardContent>
          </Card>

          {/* Formulario */}
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4 text-left">
            <h3 className="font-bold text-neutral-800 text-lg border-b border-neutral-50 pb-2">Información Domiciliaria</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="font-semibold text-neutral-700">Nombre</Label>
                <Input 
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apellido" className="font-semibold text-neutral-700">Apellido</Label>
                <Input 
                  id="apellido"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="font-semibold text-neutral-700">Teléfono</Label>
                <Input 
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+591 70000000"
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zonaId" className="font-semibold text-neutral-700">Mi Zona / Distrito</Label>
                <select
                  id="zonaId"
                  value={zonaId}
                  onChange={(e) => setZonaId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                >
                  <option value="">Selecciona tu zona...</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="direccion" className="font-semibold text-neutral-700">Dirección Domiciliaria Exacta</Label>
              <Input 
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Calle 3 Oeste, Nro. 45, Barrio Las Palmas"
                className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Latitud</span>
                <p className="font-mono text-sm font-semibold text-neutral-700">{latitud !== "" ? Number(latitud).toFixed(6) : "Haz clic en el mapa"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Longitud</span>
                <p className="font-mono text-sm font-semibold text-neutral-700">{longitud !== "" ? Number(longitud).toFixed(6) : "Haz clic en el mapa"}</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 h-11 shadow-sm"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar Mi Perfil y Ubicación
            </Button>
          </form>
        </div>

        {/* Tarjeta Ecológica y QR */}
        <div className="space-y-6">
          {/* Tarjeta de Puntos */}
          <Card className="border-none bg-gradient-to-br from-green-700 via-green-800 to-emerald-950 text-white shadow-lg overflow-hidden relative group text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-all duration-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Socio Ecológico
                </span>
                <Award className="size-6 text-emerald-300 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold pt-4">
                {vecino.nombre} {vecino.apellido}
              </CardTitle>
              <CardDescription className="text-green-200/80">Código Verde de Reciclador Urbano</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-green-200/70 uppercase tracking-wider font-semibold">Puntos Acumulados</p>
                  <p className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-1">
                    {vecino.puntosAcumulados || 0}
                    <Sparkles className="size-5 text-yellow-300 animate-bounce" />
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-green-200/70 uppercase tracking-wider font-semibold">Nivel</p>
                  <p className="text-lg font-bold text-emerald-300 mt-1">Reciclador Experto</p>
                </div>
              </div>

              {/* Barra de Progreso hacia Próximo Nivel */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-green-200/90 font-medium">
                  <span>Progreso de Nivel</span>
                  <span>{(vecino.puntosAcumulados || 0) % 500} / 500 pts</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 shadow-inner overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((((vecino.puntosAcumulados || 0) % 500) / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Código QR */}
          <Card className="border-neutral-100 shadow-sm text-center p-6">
            <h3 className="font-bold text-neutral-800 text-lg mb-1.5 flex items-center justify-center gap-2">
              <QrCode className="size-5 text-green-600" />
              Código QR Ecológico
            </h3>
            <p className="text-xs text-neutral-400 mb-6 max-w-xs mx-auto">
              Presenta este código al operario del camión al entregar tus residuos reciclables para registrar tus puntos acumulados.
            </p>

            <div className="flex flex-col items-center justify-center">
              {/* Contenedor del QR simulado premium */}
              <div className="p-4 bg-white border border-neutral-100 rounded-2xl shadow-md size-48 flex items-center justify-center relative group">
                {/* Cuatro esquinas de enfoque QR futuristas */}
                <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-green-600 rounded-tl" />
                <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-green-600 rounded-tr" />
                <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-green-600 rounded-bl" />
                <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-green-600 rounded-br" />
                
                {/* QR Simulador */}
                <svg className="size-40 text-neutral-900 group-hover:scale-95 transition-transform duration-300" viewBox="0 0 100 100" fill="currentColor">
                  {/* Cuadrados principales de esquina de Leaflet/QR */}
                  <rect x="0" y="0" width="25" height="25" />
                  <rect x="3" y="3" width="19" height="19" fill="white" />
                  <rect x="7" y="7" width="11" height="11" />

                  <rect x="75" y="0" width="25" height="25" />
                  <rect x="78" y="3" width="19" height="19" fill="white" />
                  <rect x="82" y="7" width="11" height="11" />

                  <rect x="0" y="75" width="25" height="25" />
                  <rect x="3" y="78" width="19" height="19" fill="white" />
                  <rect x="7" y="82" width="11" height="11" />

                  {/* Pixeles aleatorios del QR */}
                  <rect x="35" y="5" width="5" height="15" />
                  <rect x="45" y="0" width="10" height="5" />
                  <rect x="60" y="8" width="8" height="8" />
                  <rect x="10" y="35" width="15" height="5" />
                  <rect x="0" y="45" width="5" height="10" />
                  <rect x="35" y="35" width="30" height="30" />
                  <rect x="40" y="40" width="20" height="20" fill="white" />
                  <rect x="48" y="48" width="5" height="5" />
                  <rect x="75" y="35" width="10" height="15" />
                  <rect x="90" y="45" width="10" height="10" />
                  <rect x="35" y="75" width="15" height="10" />
                  <rect x="40" y="90" width="20" height="10" />
                  <rect x="75" y="75" width="5" height="15" />
                  <rect x="85" y="85" width="15" height="5" />
                </svg>
              </div>
              <span className="font-mono text-[10px] text-neutral-400 mt-4 uppercase tracking-wider">
                ID-RECL: VEC-{vecino.id}-IGCS
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
