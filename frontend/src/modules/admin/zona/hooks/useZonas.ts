import { useState, useEffect } from "react"
import {
  zonasService,
  type ZonaResponse,
  type ZonaRequest,
} from "@/modules/admin/zona/services/zonasService"

export function useZonas() {
  const [zonas, setZonas] = useState<ZonaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [editingZonaId, setEditingZonaId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form Fields
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [latitudCentro, setLatitudCentro] = useState<number | null>(null)
  const [longitudCentro, setLongitudCentro] = useState<number | null>(null)
  const [radioKm, setRadioKm] = useState<number | null>(null)
  const [activa, setActiva] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const zData = await zonasService.getAll()
      setZonas(zData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar catálogo de zonas geográficas")
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setModalMode("CREATE")
    setEditingZonaId(null)
    setNombre("")
    setDescripcion("")
    setLatitudCentro(null)
    setLongitudCentro(null)
    setRadioKm(null)
    setActiva(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEditModal(zona: ZonaResponse) {
    setModalMode("EDIT")
    setEditingZonaId(zona.id)
    setNombre(zona.nombre)
    setDescripcion(zona.descripcion || "")
    setLatitudCentro(zona.latitudCentro ?? null)
    setLongitudCentro(zona.longitudCentro ?? null)
    setRadioKm(zona.radioKm ?? null)
    setActiva(zona.activa)
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (!nombre) {
      setFormError("Por favor completa los campos requeridos")
      setSubmitting(false)
      return
    }

    if (latitudCentro === null || longitudCentro === null) {
      setFormError("Por favor selecciona la ubicación del centro de la zona haciendo clic sobre el mapa")
      setSubmitting(false)
      return
    }

    const payload: ZonaRequest = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      latitudCentro: latitudCentro !== null ? Number(latitudCentro) : undefined,
      longitudCentro: longitudCentro !== null ? Number(longitudCentro) : undefined,
      radioKm: radioKm !== null ? Number(radioKm) : undefined,
      activa,
    }

    try {
      if (modalMode === "CREATE") {
        await zonasService.create(payload)
      } else {
        if (!editingZonaId) return
        await zonasService.update(editingZonaId, payload)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar la zona geográfica")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(zona: ZonaResponse) {
    try {
      setZonas((prev) =>
        prev.map((z) => (z.id === zona.id ? { ...z, activa: !z.activa } : z))
      )
      await zonasService.toggleActive(zona.id)
    } catch (err) {
      setZonas((prev) =>
        prev.map((z) => (z.id === zona.id ? { ...z, activa: zona.activa } : z))
      )
      alert(err instanceof Error ? err.message : "Error al cambiar estado de la zona")
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "¿Está seguro de eliminar esta zona permanentemente? Esto desvinculará a los camiones y vecinos asociados."
      )
    )
      return
    try {
      await zonasService.delete(id)
      setZonas((prev) => prev.filter((z) => z.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar la zona")
    }
  }

  const filteredZonas = zonas.filter((z) => {
    const term = search.toLowerCase()
    const matchesSearch =
      z.nombre.toLowerCase().includes(term) ||
      (z.descripcion && z.descripcion.toLowerCase().includes(term))

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVA" && z.activa) ||
      (statusFilter === "INACTIVA" && !z.activa)

    return matchesSearch && matchesStatus
  })

  return {
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
  }
}
