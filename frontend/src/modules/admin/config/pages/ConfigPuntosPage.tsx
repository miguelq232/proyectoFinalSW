import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Save, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  configPuntosService,
  type ConfigPuntos,
  type ModoCalculo,
} from "@/modules/admin/config/services/configPuntosService"
import { authService } from "@/modules/auth/services/authService"
import { cn } from "@/lib/utils"

const CATEGORIA_LABELS: Record<string, string> = {
  GLASS: "Vidrio",
  METAL: "Metal",
  PAPER: "Papel",
  PET: "PET",
  PLASTIC: "Plástico",
}

const MODOS: ModoCalculo[] = ["UNIDAD", "PESO", "AMBOS"]

type SaveStatus = "idle" | "saving" | "success" | "error"

interface ConfigRowState {
  id: number
  categoria: string
  puntosUnidad: string
  puntosKg: string
  precioBsKg: string
  metaMensualKg: string
  modoCalculo: ModoCalculo
  activo: boolean
  saveStatus: SaveStatus
  saveMessage: string | null
}

function toRowState(item: ConfigPuntos): ConfigRowState {
  return {
    id: item.id,
    categoria: item.categoria,
    puntosUnidad: String(item.puntosUnidad ?? 0),
    puntosKg: String(item.puntosKg ?? 0),
    precioBsKg: String(item.precioBsKg ?? 0),
    metaMensualKg: String(item.metaMensualKg ?? 0),
    modoCalculo: item.modoCalculo,
    activo: item.activo,
    saveStatus: "idle",
    saveMessage: null,
  }
}

export default function ConfigPuntosPage() {
  const [rows, setRows] = useState<ConfigRowState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = useCallback(async () => {
    if (!authService.getToken()) {
      setError("No hay sesión activa. Inicie sesión nuevamente.")
      setLoading(false)
      return
    }

    try {
      setError(null)
      const data = await configPuntosService.getAll()
      setRows(data.map(toRowState))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar configuración")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  function updateRow(id: number, patch: Partial<ConfigRowState>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function handleSave(row: ConfigRowState) {
    const puntosUnidad = Number.parseInt(row.puntosUnidad, 10)
    const puntosKg = Number.parseFloat(row.puntosKg)
    const precioBsKg = Number.parseFloat(row.precioBsKg)
    const metaMensualKg = Number.parseFloat(row.metaMensualKg)

    if (Number.isNaN(puntosUnidad) || puntosUnidad < 0) {
      updateRow(row.id, {
        saveStatus: "error",
        saveMessage: "Puntos por unidad inválidos",
      })
      return
    }
    if (Number.isNaN(puntosKg) || puntosKg < 0) {
      updateRow(row.id, {
        saveStatus: "error",
        saveMessage: "Puntos por kg inválidos",
      })
      return
    }
    if (Number.isNaN(precioBsKg) || precioBsKg < 0) {
      updateRow(row.id, {
        saveStatus: "error",
        saveMessage: "Precio Bs/kg inválido",
      })
      return
    }
    if (Number.isNaN(metaMensualKg) || metaMensualKg < 0) {
      updateRow(row.id, {
        saveStatus: "error",
        saveMessage: "Meta mensual inválida",
      })
      return
    }

    updateRow(row.id, { saveStatus: "saving", saveMessage: null })

    try {
      const updated = await configPuntosService.update(row.id, {
        puntosUnidad,
        puntosKg,
        precioBsKg,
        metaMensualKg,
        modoCalculo: row.modoCalculo,
        activo: row.activo,
      })
      updateRow(row.id, {
        ...toRowState(updated),
        saveStatus: "success",
        saveMessage: "Guardado correctamente",
      })
      window.setTimeout(() => {
        updateRow(row.id, { saveStatus: "idle", saveMessage: null })
      }, 3000)
    } catch (e) {
      updateRow(row.id, {
        saveStatus: "error",
        saveMessage: e instanceof Error ? e.message : "Error al guardar",
      })
    }
  }

  return (
    <div className="p-6 sm:p-10 text-left">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-green-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-900">Configuración</h1>
          <p className="mt-1.5 text-sm text-green-700 sm:text-base">
            Puntos otorgados por categoría de residuo (modelo IA)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-green-200 text-green-800 hover:bg-green-50"
          onClick={() => {
            setLoading(true)
            loadConfig()
          }}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden />
          Actualizar
        </Button>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Settings className="size-5 text-green-600" aria-hidden />
          <h2 className="text-lg font-semibold text-green-900">Puntos por categoría</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-green-700/80">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Cargando configuración...
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">
            No hay categorías configuradas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-green-100 text-xs font-semibold uppercase tracking-wider text-green-800/80">
                  <th className="pb-3 pr-4">Categoría</th>
                  <th className="pb-3 pr-4">Puntos/Unidad</th>
                  <th className="pb-3 pr-4">Puntos/Kg</th>
                  <th className="pb-3 pr-4">Precio Bs/Kg</th>
                  <th className="pb-3 pr-4">Meta mensual (kg)</th>
                  <th className="pb-3 pr-4">Modo cálculo</th>
                  <th className="pb-3 pr-4 text-center">Activo</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-green-50 align-middle last:border-0 hover:bg-green-50/40"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-semibold text-green-900">
                        {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-400">{row.categoria}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={row.puntosUnidad}
                        onChange={(e) =>
                          updateRow(row.id, { puntosUnidad: e.target.value, saveStatus: "idle" })
                        }
                        className="h-9 max-w-[7rem] border-green-200 focus-visible:ring-green-500/30"
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={row.puntosKg}
                        onChange={(e) =>
                          updateRow(row.id, { puntosKg: e.target.value, saveStatus: "idle" })
                        }
                        className="h-9 max-w-[7rem] border-green-200 focus-visible:ring-green-500/30"
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={row.precioBsKg}
                        onChange={(e) =>
                          updateRow(row.id, { precioBsKg: e.target.value, saveStatus: "idle" })
                        }
                        className="h-9 max-w-[7rem] border-green-200 focus-visible:ring-green-500/30"
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={row.metaMensualKg}
                        onChange={(e) =>
                          updateRow(row.id, { metaMensualKg: e.target.value, saveStatus: "idle" })
                        }
                        className="h-9 max-w-[7rem] border-green-200 focus-visible:ring-green-500/30"
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={row.modoCalculo}
                        onChange={(e) =>
                          updateRow(row.id, {
                            modoCalculo: e.target.value as ModoCalculo,
                            saveStatus: "idle",
                          })
                        }
                        className="h-9 min-w-[8.5rem] rounded-md border border-green-200 bg-white px-2.5 text-sm text-neutral-800 shadow-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      >
                        {MODOS.map((modo) => (
                          <option key={modo} value={modo}>
                            {modo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={row.activo}
                          onChange={(e) =>
                            updateRow(row.id, { activo: e.target.checked, saveStatus: "idle" })
                          }
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                            row.activo
                              ? "border-green-600 bg-green-600"
                              : "border-green-200 bg-green-100"
                          )}
                          aria-hidden
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
                              row.activo ? "translate-x-5" : "translate-x-0.5"
                            )}
                          />
                        </span>
                        <span className="text-xs font-medium text-neutral-600">
                          {row.activo ? "Sí" : "No"}
                        </span>
                      </label>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={row.saveStatus === "saving"}
                          onClick={() => handleSave(row)}
                        >
                          {row.saveStatus === "saving" ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Save className="size-4" aria-hidden />
                          )}
                          Guardar
                        </Button>
                        {row.saveMessage && (
                          <span
                            className={cn(
                              "max-w-[12rem] text-right text-xs font-medium",
                              row.saveStatus === "success" && "text-green-700",
                              row.saveStatus === "error" && "text-red-600"
                            )}
                          >
                            {row.saveMessage}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
