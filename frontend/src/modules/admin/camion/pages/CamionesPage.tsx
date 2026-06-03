import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Search,
  Settings,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useCamiones } from "@/modules/admin/camion/hooks/useCamiones"

export default function CamionesPage() {
  const {
    zonas,
    operadores,
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
    placa,
    setPlaca,
    modelo,
    setModelo,
    anio,
    setAnio,
    color,
    setColor,
    estado,
    setEstado,
    zonaId,
    setZonaId,
    operadorId,
    setOperadorId,
    fetchData,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    filteredCamiones,
  } = useCamiones()

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Gestión de Vehículos</h1>
          <p className="text-neutral-500">Administra los camiones recolectores de basura, estados e itinerarios.</p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="size-4" />
          Registrar Vehículo
        </Button>
      </header>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Buscar por placa, modelo, zona, operador..."
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
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
            <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
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

      {/* Grid de Camiones */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-green-600" />
          <p className="text-neutral-500 font-medium">Cargando catálogo de vehículos...</p>
        </div>
      ) : filteredCamiones.length === 0 ? (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Truck className="size-12 text-neutral-300 mb-3 animate-pulse" />
            <p className="text-neutral-600 font-semibold text-lg">No se encontraron vehículos</p>
            <p className="text-neutral-400 text-sm mt-1 max-w-sm">
              Prueba ajustando tus parámetros de búsqueda o registra un nuevo camión recolector.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCamiones.map((camion) => (
            <div
              key={camion.id}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden flex flex-col group"
            >
              {/* Card Header (Placa y Estado) */}
              <div className="px-5 py-4 bg-green-50/40 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-green-600 text-white font-mono font-bold text-xs uppercase shadow-inner">
                    V
                  </span>
                  <span className="font-mono font-bold text-lg text-neutral-800 tracking-wider">
                    {camion.placa}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    camion.estado === "ACTIVO"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : camion.estado === "INACTIVO"
                        ? "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {camion.estado}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-3.5 text-left">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Modelo</p>
                    <p className="font-semibold text-neutral-800 truncate">{camion.modelo || "—"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Detalles</p>
                    <p className="font-semibold text-neutral-800">
                      {camion.color || "—"} ({camion.anio})
                    </p>
                  </div>
                </div>

                {/* Zona Asignada */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100/50">
                  <MapPin className="size-4 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-neutral-400 font-medium">Zona de Recolección</p>
                    <p className="font-semibold text-neutral-800 mt-0.5">
                      {camion.zonaNombre || "Sin asignar (Inactivo)"}
                    </p>
                  </div>
                </div>

                {/* Operador Asignado */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100/50">
                  <User className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-neutral-400 font-medium">Operador Asignado</p>
                    <p className="font-semibold text-neutral-800 mt-0.5 truncate">
                      {camion.operadorNombre || "Sin conductor asignado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 border-t border-neutral-50 flex items-center justify-end gap-1 bg-neutral-50/20 group-hover:bg-neutral-50/50 transition-colors">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(camion)}
                  className="text-neutral-600 hover:text-green-700 hover:bg-green-50 flex items-center gap-1"
                >
                  <Edit2 className="size-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(camion.id)}
                  className="text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </Button>
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
                {modalMode === "CREATE" ? "Registrar Nuevo Vehículo" : "Editar Vehículo"}
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

              {/* Fila: Placa y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="placa" className="font-semibold text-neutral-700">
                    Placa *
                  </Label>
                  <Input
                    id="placa"
                    required
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="Ej. 5241-KHB"
                    className="font-mono uppercase border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estado" className="font-semibold text-neutral-700">
                    Estado *
                  </Label>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as typeof estado)}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                  </select>
                </div>
              </div>

              {/* Fila: Modelo y Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modelo" className="font-semibold text-neutral-700">
                    Modelo
                  </Label>
                  <Input
                    id="modelo"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. Volvo FMX / Nissan Condor"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="color" className="font-semibold text-neutral-700">
                    Color
                  </Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Blanco / Verde"
                    className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                  />
                </div>
              </div>

              {/* Fila: Año */}
              <div className="space-y-1.5">
                <Label htmlFor="anio" className="font-semibold text-neutral-700">
                  Año de Fabricación *
                </Label>
                <Input
                  id="anio"
                  type="number"
                  required
                  value={anio}
                  onChange={(e) => setAnio(e.target.value !== "" ? Number(e.target.value) : "")}
                  placeholder="Ej. 2022"
                  className="border-neutral-200 focus-visible:ring-green-600/20 focus-visible:border-green-600"
                />
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-4">
                <p className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  <Settings className="size-4 text-green-600" /> Asignaciones Operacionales
                </p>

                {/* Zona Asignada */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="zonaId" className="font-semibold text-neutral-700">
                    Zona de Cobertura
                  </Label>
                  <select
                    id="zonaId"
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="">Sin Asignar (Inactivo)</option>
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre} {z.radioKm ? `(${z.radioKm} km)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operador Asignado */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="operadorId" className="font-semibold text-neutral-700">
                    Conductor / Operador
                  </Label>
                  <select
                    id="operadorId"
                    value={operadorId}
                    onChange={(e) => setOperadorId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  >
                    <option value="">Sin Operador asignado</option>
                    {operadores.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.nombre} {op.apellido} {op.turno ? `[${op.turno}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones del Modal */}
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
