import { useState, useEffect } from "react"
import { 
  Search, UserPlus, Edit2, Trash2, Shield, Truck, Home, 
  RefreshCw, AlertCircle, MapPin, Loader2, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { usuariosService, type UsuarioResponse, type UsuarioRequest } from "../services/usuariosService"
import { zonasService, type ZonaResponse } from "../services/zonasService"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [zonas, setZonas] = useState<ZonaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form Fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [rol, setRol] = useState<"ADMINISTRADOR" | "OPERADOR" | "VECINO">("VECINO")
  const [activo, setActivo] = useState(true)
  
  // Operador Fields
  const [licencia, setLicencia] = useState("")
  const [turno, setTurno] = useState("")

  // Vecino Fields
  const [direccion, setDireccion] = useState("")
  const [latitud, setLatitud] = useState<number | "">("")
  const [longitud, setLongitud] = useState<number | "">("")
  const [zonaId, setZonaId] = useState<number | "">("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [uData, zData] = await Promise.all([
        usuariosService.getAll(),
        zonasService.getAll()
      ])
      setUsuarios(uData)
      setZonas(zData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setModalMode("CREATE")
    setEditingUserId(null)
    setEmail("")
    setPassword("")
    setNombre("")
    setApellido("")
    setTelefono("")
    setRol("VECINO")
    setActivo(true)
    setLicencia("")
    setTurno("")
    setDireccion("")
    setLatitud("")
    setLongitud("")
    setZonaId("")
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(user: UsuarioResponse) {
    setModalMode("EDIT")
    setEditingUserId(user.id)
    setEmail(user.email)
    setPassword("") // Empty password means unchanged on edit
    setNombre(user.nombre)
    setApellido(user.apellido)
    setTelefono(user.telefono || "")
    setRol(user.rol)
    setActivo(user.activo)
    setLicencia(user.licencia || "")
    setTurno(user.turno || "")
    setDireccion(user.direccion || "")
    setLatitud(user.latitud ?? "")
    setLongitud(user.longitud ?? "")
    setZonaId(user.zonaId ?? "")
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    // Validations
    if (!email || !nombre || !apellido || !rol) {
      setFormError("Por favor completa los campos requeridos")
      setSubmitting(false)
      return
    }

    if (modalMode === "CREATE" && !password) {
      setFormError("La contraseña es obligatoria para nuevos usuarios")
      setSubmitting(false)
      return
    }

    const payload: UsuarioRequest = {
      email,
      nombre,
      apellido,
      telefono: telefono || undefined,
      rol,
      activo,
      password: password || undefined,
    }

    if (rol === "OPERADOR") {
      payload.licencia = licencia || undefined
      payload.turno = turno || undefined
    } else if (rol === "VECINO") {
      payload.direccion = direccion || undefined
      payload.latitud = latitud !== "" ? Number(latitud) : undefined
      payload.longitud = longitud !== "" ? Number(longitud) : undefined
      payload.zonaId = zonaId !== "" ? Number(zonaId) : undefined
    }

    try {
      if (modalMode === "CREATE") {
        await usuariosService.create(payload)
      } else {
        if (!editingUserId) return
        await usuariosService.update(editingUserId, payload)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al procesar la solicitud")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(user: UsuarioResponse) {
    try {
      setUsuarios(prev => prev.map(u => u.id === user.id ? { ...u, activo: !u.activo } : u))
      await usuariosService.toggleActive(user.id)
    } catch (err) {
      // Revert in case of failure
      setUsuarios(prev => prev.map(u => u.id === user.id ? { ...u, activo: user.activo } : u))
      alert(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este usuario permanentemente?")) return
    try {
      await usuariosService.delete(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el usuario")
    }
  }

  // Filtrado de la lista de usuarios
  const filteredUsuarios = usuarios.filter((u) => {
    const term = search.toLowerCase()
    const matchesSearch = 
      u.nombre.toLowerCase().includes(term) ||
      u.apellido.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.telefono && u.telefono.includes(term))
    
    const matchesRole = roleFilter === "ALL" || u.rol === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Gestión de Usuarios</h1>
          <p className="text-neutral-500">Administra a los vecinos, operadores y administradores del sistema.</p>
        </div>
        <Button 
          type="button" 
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <UserPlus className="size-4" />
          Registrar Usuario
        </Button>
      </header>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre, correo, teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="OPERADOR">Operadores</option>
            <option value="VECINO">Vecinos</option>
          </select>
          <Button 
            type="button" 
            variant="outline" 
            onClick={fetchData} 
            className="h-10 hover:bg-green-50 border-neutral-200 shrink-0 text-neutral-600 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listado Principal */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-green-600" />
          <p className="text-neutral-500 font-medium">Cargando catálogo de usuarios...</p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="size-12 text-neutral-300 mb-3" />
            <p className="text-neutral-600 font-semibold text-lg">No se encontraron usuarios</p>
            <p className="text-neutral-400 text-sm mt-1 max-w-sm">Prueba ajustando tus parámetros de búsqueda o registra a un nuevo usuario usando el botón superior.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-50/50 border-b border-green-100 text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Detalles Rol</th>
                  <th className="px-6 py-4 text-center">Activo</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                {filteredUsuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900">{user.nombre} {user.apellido}</span>
                        <span className="text-xs text-neutral-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.rol === "ADMINISTRADOR" 
                          ? "bg-purple-50 text-purple-700 border border-purple-200" 
                          : user.rol === "OPERADOR"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {user.rol === "ADMINISTRADOR" && <Shield className="size-3" />}
                        {user.rol === "OPERADOR" && <Truck className="size-3" />}
                        {user.rol === "VECINO" && <Home className="size-3" />}
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-600">
                      {user.telefono || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {user.rol === "OPERADOR" && (
                        <div className="space-y-0.5">
                          <p><span className="text-neutral-500 font-medium">Turno:</span> <span className="font-semibold text-neutral-700">{user.turno || "—"}</span></p>
                          <p><span className="text-neutral-500 font-medium">Licencia:</span> <span className="font-semibold text-neutral-700">{user.licencia || "—"}</span></p>
                        </div>
                      )}
                      {user.rol === "VECINO" && (
                        <div className="space-y-0.5 max-w-xs truncate">
                          <p><span className="text-neutral-500 font-medium">Zona:</span> <span className="font-semibold text-green-700">{user.zonaNombre || "Sin asignar"}</span></p>
                          <p><span className="text-neutral-500 font-medium">Dir:</span> <span className="text-neutral-700" title={user.direccion || undefined}>{user.direccion || "—"}</span></p>
                        </div>
                      )}
                      {user.rol === "ADMINISTRADOR" && (
                        <span className="text-neutral-400 italic">Acceso Total</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          user.activo ? "bg-green-600" : "bg-neutral-300"
                        }`}
                        aria-label={`Toggle active state for ${user.nombre}`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          className="size-8 text-neutral-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="size-8 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-100 text-left flex flex-col max-h-[90vh]">
            <header className="px-6 py-5 bg-green-50 border-b border-green-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {modalMode === "CREATE" ? "Registrar Nuevo Usuario" : "Editar Usuario"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-green-100 text-neutral-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Fila: Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre" className="font-semibold text-neutral-700">Nombre *</Label>
                  <Input 
                    id="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apellido" className="font-semibold text-neutral-700">Apellido *</Label>
                  <Input 
                    id="apellido"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
              </div>

              {/* Fila: Correo y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-semibold text-neutral-700">Correo Electrónico *</Label>
                  <Input 
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
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
              </div>

              {/* Fila: Rol y Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rol" className="font-semibold text-neutral-700">Rol *</Label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="VECINO">Vecino</option>
                    <option value="OPERADOR">Operador</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="font-semibold text-neutral-700">
                    Contraseña {modalMode === "CREATE" ? "*" : "(Dejar en blanco para no cambiar)"}
                  </Label>
                  <Input 
                    id="password"
                    type="password"
                    required={modalMode === "CREATE"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
              </div>

              {/* Campos dinámicos para OPERADOR */}
              {rol === "OPERADOR" && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4 animate-slide-down">
                  <p className="text-blue-800 font-semibold text-sm flex items-center gap-1.5">
                    <Truck className="size-4" /> Detalle del Operador
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="licencia" className="text-blue-900 font-medium">Categoría de Licencia</Label>
                      <Input 
                        id="licencia"
                        value={licencia}
                        onChange={(e) => setLicencia(e.target.value)}
                        placeholder="Ej. Categoría C / Profesional"
                        className="bg-white border-blue-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 text-blue-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="turno" className="text-blue-900 font-medium">Turno de Trabajo</Label>
                      <select
                        id="turno"
                        value={turno}
                        onChange={(e) => setTurno(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-blue-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      >
                        <option value="">Selecciona turno...</option>
                        <option value="Mañana">Mañana (06:00 - 14:00)</option>
                        <option value="Tarde">Tarde (14:00 - 22:00)</option>
                        <option value="Noche">Noche (22:00 - 06:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {rol === "VECINO" && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-4 animate-slide-down">
                  <p className="text-emerald-800 font-semibold text-sm flex items-center gap-1.5">
                    <MapPin className="size-4" /> Ubicación y Zona del Vecino
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="zonaId" className="text-emerald-950 font-medium">Asignar Zona Geográfica</Label>
                    <select
                      id="zonaId"
                      value={zonaId}
                      onChange={(e) => setZonaId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-emerald-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    >
                      <option value="">Sin Asignar (Sin Zona)</option>
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nombre} {z.radioKm ? `(${z.radioKm} km)` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="direccion" className="text-emerald-950 font-medium">Dirección Domiciliaria</Label>
                    <Input 
                      id="direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej. Av. Banzer 4to Anillo, Edif. Los Pinos Dpto 3B"
                      className="bg-white border-emerald-200 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-emerald-950"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="latitud" className="text-emerald-950 font-medium">Latitud Coordenada</Label>
                      <Input 
                        id="latitud"
                        type="number"
                        step="any"
                        value={latitud}
                        onChange={(e) => setLatitud(e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="Ej. -17.7834"
                        className="bg-white border-emerald-200 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-emerald-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="longitud" className="text-emerald-950 font-medium">Longitud Coordenada</Label>
                      <Input 
                        id="longitud"
                        type="number"
                        step="any"
                        value={longitud}
                        onChange={(e) => setLongitud(e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="Ej. -63.1821"
                        className="bg-white border-emerald-200 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-emerald-950"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Activo Toggle en Modal */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActivo(!activo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    activo ? "bg-green-600" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle active status"
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      activo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800">Estado Activo</p>
                  <p className="text-xs text-neutral-500">Determina si este usuario tiene acceso de ingreso o visualización.</p>
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <footer className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="border-neutral-200 text-neutral-700"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {modalMode === "CREATE" ? "Registrar" : "Guardar Cambios"}
                </Button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
