import { useState, useEffect } from "react"
import {
  camionesService,
  type CamionResponse,
  type CamionRequest,
  type EstadoCamion,
} from "@/modules/admin/camion/services/camionesService"
import { zonasService, type ZonaResponse } from "@/modules/admin/zona/services/zonasService"
import { usuariosService, type UsuarioResponse } from "@/modules/admin/usuarios/services/usuariosService"

export function useCamiones() {
  const [camiones, setCamiones] = useState<CamionResponse[]>([])
  const [zonas, setZonas] = useState<ZonaResponse[]>([])
  const [operadores, setOperadores] = useState<UsuarioResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [editingCamionId, setEditingCamionId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form Fields
  const [placa, setPlaca] = useState("")
  const [modelo, setModelo] = useState("")
  const [anio, setAnio] = useState<number | "">("")
  const [color, setColor] = useState("")
  const [estado, setEstado] = useState<EstadoCamion>("ACTIVO")
  const [zonaId, setZonaId] = useState<number | "">("")
  const [operadorId, setOperadorId] = useState<number | "">("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [cData, zData, uData] = await Promise.all([
        camionesService.getAll(),
        zonasService.getAll(),
        usuariosService.getAll(),
      ])
      setCamiones(cData)
      setZonas(zData)
      // Filter users to get only operators
      const ops = uData.filter((u) => u.rol === "OPERADOR")
      setOperadores(ops)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar catálogo de vehículos")
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setModalMode("CREATE")
    setEditingCamionId(null)
    setPlaca("")
    setModelo("")
    setAnio(new Date().getFullYear())
    setColor("")
    setEstado("ACTIVO")
    setZonaId("")
    setOperadorId("")
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(camion: CamionResponse) {
    setModalMode("EDIT")
    setEditingCamionId(camion.id)
    setPlaca(camion.placa)
    setModelo(camion.modelo || "")
    setAnio(camion.anio)
    setColor(camion.color || "")
    setEstado(camion.estado)
    setZonaId(camion.zonaId ?? "")
    setOperadorId(camion.operadorId ?? "")
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (!placa || !anio || !estado) {
      setFormError("Por favor completa los campos requeridos")
      setSubmitting(false)
      return
    }

    const payload: CamionRequest = {
      placa: placa.trim().toUpperCase(),
      modelo: modelo.trim() || undefined,
      anio: Number(anio),
      color: color.trim() || undefined,
      estado,
      zonaId: zonaId !== "" ? Number(zonaId) : undefined,
      operadorId: operadorId !== "" ? Number(operadorId) : undefined,
    }

    try {
      if (modalMode === "CREATE") {
        await camionesService.create(payload)
      } else {
        if (!editingCamionId) return
        await camionesService.update(editingCamionId, payload)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar el camión")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este vehículo permanentemente?")) return
    try {
      await camionesService.delete(id)
      setCamiones((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el camión")
    }
  }

  const filteredCamiones = camiones.filter((c) => {
    const term = search.toLowerCase()
    const matchesSearch =
      c.placa.toLowerCase().includes(term) ||
      (c.modelo && c.modelo.toLowerCase().includes(term)) ||
      (c.operadorNombre && c.operadorNombre.toLowerCase().includes(term)) ||
      (c.zonaNombre && c.zonaNombre.toLowerCase().includes(term))

    const matchesStatus = statusFilter === "ALL" || c.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  return {
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
  }
}
