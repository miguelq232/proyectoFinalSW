import { useEffect, useMemo, useState } from "react"
import { Banknote, CalendarDays, History, Loader2, PackageCheck, Recycle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { vecinoService, type PuntosResponse } from "@/modules/vecino/perfil/pages/VecinoProfilePage"

const VALOR_PUNTO_BS = 0.10

const labels: Record<string, string> = {
  BIODEGRADABLE: "Biodegradable",
  CARDBOARD: "Cartón",
  CLOTH: "Tela",
  GLASS: "Vidrio",
  METAL: "Metal",
  PAPER: "Papel",
  PLASTIC: "Plástico",
  DESCONOCIDO: "Desconocido",
  NADA: "Sin residuo",
}

type RecoleccionGroup = {
  key: string
  fecha: Date
  registros: PuntosResponse[]
  totalCantidad: number
  totalPuntos: number
  descuentoBs: number
  materiales: Array<{
    tipo: string
    cantidad: number
    puntos: number
  }>
}

export default function VecinoHistorialRecoleccionesPage() {
  const [historial, setHistorial] = useState<PuntosResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    vecinoService
      .getMyHistory()
      .then((data) => {
        if (mounted) setHistorial(data)
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "No se pudo cargar el historial")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const grupos = useMemo(() => groupRecolecciones(historial), [historial])
  const totalPuntos = grupos.reduce((sum, group) => sum + group.totalPuntos, 0)
  const totalDescuento = totalPuntos * VALOR_PUNTO_BS
  const totalRegistros = grupos.reduce((sum, group) => sum + group.registros.length, 0)

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-sm font-medium text-neutral-500">Cargando historial de recolecciones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <header className="space-y-1 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Historial de Recolecciones</h1>
        <p className="text-neutral-500">
          Revisa lo recolectado, los puntos obtenidos y el descuento acumulado para tu próxima factura.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={History} label="Recolecciones" value={`${grupos.length}`} />
        <SummaryCard icon={PackageCheck} label="Registros" value={`${totalRegistros}`} />
        <SummaryCard icon={Banknote} label="Descuento acumulado" value={`Bs ${totalDescuento.toFixed(2)}`} />
      </div>

      {grupos.length === 0 ? (
        <Card className="border-neutral-100 bg-white text-center shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-10">
            <Recycle className="size-12 text-neutral-300" />
            <div>
              <p className="font-semibold text-neutral-700">Sin recolecciones registradas</p>
              <p className="mt-1 text-sm text-neutral-500">
                Cuando clasifiques residuos durante una sesión de camión, aparecerán aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grupos.map((group, index) => (
            <Card key={group.key} className="border-neutral-100 bg-white shadow-sm">
              <CardHeader className="border-b border-neutral-100 bg-green-50/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
                      <CalendarDays className="size-5 text-green-700" />
                      Recolección #{grupos.length - index}
                    </CardTitle>
                    <CardDescription>
                      {group.fecha.toLocaleString("es-BO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-right sm:min-w-72">
                    <MiniStat label="Puntos" value={`+${group.totalPuntos}`} />
                    <MiniStat label="Descuento" value={`Bs ${group.descuentoBs.toFixed(2)}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase text-neutral-500">
                      <tr>
                        <th className="px-5 py-3">Material</th>
                        <th className="px-5 py-3 text-right">Cantidad</th>
                        <th className="px-5 py-3 text-right">Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {group.materiales.map((material) => (
                        <tr key={material.tipo}>
                          <td className="px-5 py-3 font-semibold text-neutral-800">
                            {labels[material.tipo] || material.tipo}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-neutral-700">
                            {material.cantidad.toFixed(0)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold text-green-700">
                            +{material.puntos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function groupRecolecciones(historial: PuntosResponse[]): RecoleccionGroup[] {
  const map = new Map<string, PuntosResponse[]>()

  historial.forEach((registro) => {
    const key = registro.recoleccionSessionToken || `registro-${registro.id}`
    map.set(key, [...(map.get(key) || []), registro])
  })

  return Array.from(map.entries())
    .map(([key, registros]) => {
      const fecha = registros
        .map((item) => new Date(item.fecha))
        .sort((a, b) => b.getTime() - a.getTime())[0]

      const materialesMap = new Map<string, { tipo: string; cantidad: number; puntos: number }>()
      registros.forEach((registro) => {
        const tipo = (registro.tipoResiduo || "NADA").toUpperCase()
        const actual = materialesMap.get(tipo) || { tipo, cantidad: 0, puntos: 0 }
        actual.cantidad += registro.cantidad || 1
        actual.puntos += registro.puntosOtorgados || 0
        materialesMap.set(tipo, actual)
      })

      const totalPuntos = registros.reduce((sum, item) => sum + (item.puntosOtorgados || 0), 0)
      const totalCantidad = registros.reduce((sum, item) => sum + (item.cantidad || 1), 0)

      return {
        key,
        fecha,
        registros,
        totalCantidad,
        totalPuntos,
        descuentoBs: totalPuntos * VALOR_PUNTO_BS,
        materiales: Array.from(materialesMap.values()),
      }
    })
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof History; label: string; value: string }) {
  return (
    <Card className="border-neutral-100 bg-white shadow-sm">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-xs font-semibold uppercase text-neutral-400">{label}</p>
          <p className="truncate text-xl font-bold text-neutral-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase text-neutral-400">{label}</p>
      <p className="font-bold text-green-800">{value}</p>
    </div>
  )
}
