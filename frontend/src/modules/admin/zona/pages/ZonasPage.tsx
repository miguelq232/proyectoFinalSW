import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Users,
  Truck,
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  Globe,
  Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import MapTracker from "@/shared/components/MapTracker"
import { useZonas } from "@/modules/admin/zona/hooks/useZonas"

export default function ZonasPage() {
  const {
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    submitting,
    formError,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    latitudCentro,
    setLatitudCentro,
    longitudCentro,
    setLongitudCentro,
    radioKm,
    setRadioKm,
    activa,
    setActiva,
    fetchData,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    filteredZonas,
  } = useZonas()

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Gestión de Zonas</h1>
          <p className="text-neutral-500">
            Administra los distritos, límites geográficos y áreas de cobertura del servicio.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="size-4" />
          Registrar Zona
        </Button>
      </header>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Buscar zona por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVA">Zonas Activas</option>
            <option value="INACTIVA">Zonas Inactivas</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={fetchData}
            className="h-10 hover:bg-green-50 border-neutral-200 shrink-0 text-neutral-600 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
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

      {/* Grid de Zonas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-green-600" />
          <p className="text-neutral-500 font-medium">Cargando catálogo de zonas...</p>
        </div>
      ) : filteredZonas.length === 0 ? (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="size-12 text-neutral-300 mb-3" />
            <p className="text-neutral-600 font-semibold text-lg">No se encontraron zonas de recolección</p>
            <p className="text-neutral-400 text-sm mt-1 max-w-sm">
              Prueba ajustando tus parámetros de búsqueda o registra una nueva zona de cobertura.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZonas.map((zona) => (
            <div
              key={zona.id}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden flex flex-col group text-left"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-green-50/40 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-inner">
                    <MapPin className="size-4" />
                  </span>
                  <span className="font-bold text-neutral-800 tracking-tight text-base">{zona.nombre}</span>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    zona.activa
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                  }`}
                >
                  {zona.activa ? "ACTIVA" : "INACTIVA"}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-4">
                <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {zona.descripcion || "Sin descripción proporcionada para esta zona de cobertura."}
                </p>

                {/* Coordenadas y Radio */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-100/50">
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-medium flex items-center gap-1">
                      <Radio className="size-3 text-green-600" /> Radio
                    </p>
                    <p className="font-semibold text-neutral-800">
                      {zona.radioKm ? `${zona.radioKm} Kilómetros` : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-medium flex items-center gap-1">
                      <Globe className="size-3 text-blue-600" /> Centro
                    </p>
                    {zona.latitudCentro && zona.longitudCentro ? (
                      <p className="font-semibold text-neutral-800 tracking-tight font-mono">
                        {zona.latitudCentro.toFixed(4)}, {zona.longitudCentro.toFixed(4)}
                      </p>
                    ) : (
                      <p className="font-semibold text-neutral-400">Sin ubicar</p>
                    )}
                  </div>
                </div>

                {/* Estadísticas de cobertura */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Vecinos</p>
                      <p className="text-base font-bold text-neutral-800">{zona.cantidadVecinos}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="size-5 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Camiones</p>
                      <p className="text-base font-bold text-neutral-800">{zona.cantidadCamiones}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/20 group-hover:bg-neutral-50/50 transition-colors">
                <button
                  type="button"
                  onClick={() => handleToggleActive(zona)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    zona.activa ? "bg-green-600" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle active"
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      zona.activa ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(zona)}
                    className="text-neutral-600 hover:text-green-700 hover:bg-green-50 flex items-center gap-1"
                  >
                    <Edit2 className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(zona.id)}
                    className="text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-100 text-left flex flex-col max-h-[90vh]">
            <header className="px-6 py-5 bg-green-50 border-b border-green-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {modalMode === "CREATE" ? "Registrar Nueva Zona" : "Editar Zona"}
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

              {/* Fila: Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="font-semibold text-neutral-700">
                  Nombre de la Zona *
                </Label>
                <Input
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Distrito 4 - Equipetrol"
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>

              {/* Fila: Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="descripcion" className="font-semibold text-neutral-700">
                  Descripción
                </Label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe la cobertura, límites o frecuencia de recolección de la zona..."
                  rows={3}
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>

              {/* Fila: Radio Geográfico */}
              <div className="space-y-1.5">
                <Label htmlFor="radioKm" className="font-semibold text-neutral-700">
                  Radio de Cobertura (Km)
                </Label>
                <Input
                  id="radioKm"
                  type="number"
                  step="any"
                  value={radioKm ?? ""}
                  onChange={(e) => setRadioKm(e.target.value !== "" ? Number(e.target.value) : null)}
                  placeholder="Ej. 2.5"
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>

              {/* Selección Geográfica por Mapa */}
              <div className="space-y-2 text-left">
                <Label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <MapPin className="size-4 text-green-600" /> Ubicación del Centro y Cobertura *
                </Label>
                <div className="h-64 rounded-xl overflow-hidden border border-neutral-200 relative">
                  <MapTracker
                    markers={
                      latitudCentro !== null && longitudCentro !== null
                        ? [
                            {
                              id: "centro-zona",
                              lat: Number(latitudCentro),
                              lng: Number(longitudCentro),
                              label: nombre || "Centro de la Zona",
                              iconType: "center",
                              draggable: true,
                            },
                          ]
                        : []
                    }
                    center={
                      latitudCentro !== null && longitudCentro !== null
                        ? [Number(latitudCentro), Number(longitudCentro)]
                        : [-17.7834, -63.1821]
                    }
                    zoom={13}
                    circleArea={
                      latitudCentro !== null &&
                      longitudCentro !== null &&
                      radioKm !== null &&
                      Number(radioKm) > 0
                        ? {
                            center: [Number(latitudCentro), Number(longitudCentro)],
                            radiusMeters: Number(radioKm) * 1000,
                            label: nombre || "Área de Cobertura",
                          }
                        : undefined
                    }
                    onMapClick={(lat, lng) => {
                      setLatitudCentro(lat)
                      setLongitudCentro(lng)
                    }}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 italic mt-1">
                  Haz clic en cualquier punto del mapa para fijar el centro de la zona.
                </p>
              </div>

              {/* Activa Toggle en Modal */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiva(!activa)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    activa ? "bg-green-600" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle active status"
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      activa ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800">Estado Activo</p>
                  <p className="text-xs text-neutral-500">
                    Si se desactiva, los vecinos y camiones asociados no verán esta zona como activa.
                  </p>
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
