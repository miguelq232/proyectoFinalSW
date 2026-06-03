import { useState, useEffect } from "react"
import {
  usuariosService,
  type UsuarioResponse,
  type UsuarioRequest,
} from "@/modules/admin/usuarios/services/usuariosService"
import { zonasService, type ZonaResponse } from "@/modules/admin/zona/services/zonasService"

export function useUsuarios() {
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
        zonasService.getAll(),
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
      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, activo: !u.activo } : u))
      )
      await usuariosService.toggleActive(user.id)
    } catch (err) {
      // Revert in case of failure
      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, activo: user.activo } : u))
      )
      alert(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este usuario permanentemente?")) return
    try {
      await usuariosService.delete(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
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

  return {
    zonas,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    submitting,
    formError,
    email,
    setEmail,
    password,
    setPassword,
    nombre,
    setNombre,
    apellido,
    setApellido,
    telefono,
    setTelefono,
    rol,
    setRol,
    activo,
    setActivo,
    licencia,
    setLicencia,
    turno,
    setTurno,
    direccion,
    setDireccion,
    latitud,
    setLatitud,
    longitud,
    setLongitud,
    zonaId,
    setZonaId,
    fetchData,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    filteredUsuarios,
  }
}
