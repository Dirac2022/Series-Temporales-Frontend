import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type PredictionPoint = {
  week: string
  yhat: number
  lower: number
  upper: number
  delta: number
}

type PredictionSeries = {
  id: string
  name: string
  segment: string
  model: string
  status: "activo" | "programado"
  lastRun: string
  confidence: "alto" | "medio" | "bajo"
  stockRisk: "bajo" | "medio" | "alto"
  coverage: string
  refreshCadence: string
  notes: string[]
  horizonWeeks: number
  points: PredictionPoint[]
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const makeSeries = (
  id: string,
  name: string,
  segment: string,
  model: string,
  status: "activo" | "programado",
  baseValue: number,
  deltas: number[]
): PredictionSeries => {
  const start = new Date("2026-01-05")
  const points: PredictionPoint[] = deltas.map((delta, index) => {
    const yhat = baseValue + deltas.slice(0, index + 1).reduce((sum, value) => sum + value, 0)
    const lower = Math.max(0, Math.round(yhat * 0.9))
    const upper = Math.round(yhat * 1.12)
    return {
      week: addDays(start, index * 7).toISOString().slice(0, 10),
      yhat,
      lower,
      upper,
      delta,
    }
  })

  return {
    id,
    name,
    segment,
    model,
    status,
    lastRun: "Hace 2 horas",
    confidence: "medio",
    stockRisk: "medio",
    coverage: "18 meses historicos",
    refreshCadence: "Actualiza cada lunes",
    notes: [
      "Ajustar compras para semanas 2 y 3.",
      "Revisar impacto de promociones regionales.",
      "Monitorear stock de seguridad en fin de mes.",
    ],
    horizonWeeks: 4,
    points,
  }
}

const mockSeries: PredictionSeries[] = [
  makeSeries("SER-1034", "Lima Centro - Detergentes", "Hogar", "NBEATS", "activo", 420, [24, -8, 31, 18]),
  makeSeries("SER-2041", "Arequipa Norte - Bebidas", "Consumo", "Baseline", "activo", 310, [14, 11, -6, 9]),
  makeSeries("SER-3810", "Piura Sur - Abarrotes", "Retail", "NBEATS", "programado", 260, [8, 6, 5, -2]),
]

export default function PredictionsPage() {
  const [selectedId, setSelectedId] = React.useState<string>("")
  const selectedSeries = mockSeries.find((series) => series.id === selectedId)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predicciones</h1>
          <p className="text-muted-foreground max-w-2xl">
            Inventario de series ya proyectadas para las siguientes 4 semanas.
            Estos datos son mockups hasta que la base este conectada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Exportar</Button>
          <Button variant="outline">Descargar resumen</Button>
          <Button variant="outline">Compartir</Button>
          <Button variant="ghost">Refrescar</Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Seleccion de serie</CardTitle>
          <CardDescription>Filtros cosmeticos mientras se conecta la base</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,1fr,1fr,1.2fr]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="lima">Lima</SelectItem>
              <SelectItem value="arequipa">Arequipa</SelectItem>
              <SelectItem value="piura">Piura</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="hogar">Hogar</SelectItem>
              <SelectItem value="consumo">Consumo</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="centro">Centro</SelectItem>
              <SelectItem value="norte">Norte</SelectItem>
              <SelectItem value="sur">Sur</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una serie" />
            </SelectTrigger>
            <SelectContent>
              {mockSeries.map((series) => (
                <SelectItem key={series.id} value={series.id}>
                  {series.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSeries ? (
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle>{selectedSeries.name}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2">
                <span>ID: {selectedSeries.id}</span>
                <span>Segmento: {selectedSeries.segment}</span>
                <span>Modelo: {selectedSeries.model}</span>
                <span>Ultima corrida: {selectedSeries.lastRun}</span>
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={selectedSeries.status === "activo" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}>
                {selectedSeries.status === "activo" ? "Activo" : "Programado"}
              </Badge>
              <Badge className={
                selectedSeries.confidence === "alto"
                  ? "bg-emerald-500/10 text-emerald-700"
                  : selectedSeries.confidence === "medio"
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-rose-500/10 text-rose-700"
              }>
                Confianza {selectedSeries.confidence}
              </Badge>
              <Badge variant="outline">Horizon: {selectedSeries.horizonWeeks} semanas</Badge>
              <Button variant="outline" size="sm">Ver detalle</Button>
              <Button variant="ghost" size="sm">Programar refresh</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Contexto de datos</p>
                <p className="text-sm font-medium">Cobertura: {selectedSeries.coverage}</p>
                <p className="text-xs text-muted-foreground">{selectedSeries.refreshCadence}</p>
              </div>
              <div className="rounded-lg border bg-background p-4 md:col-span-2">
                <h3 className="text-sm font-medium mb-2">Notas operativas sugeridas</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {selectedSeries.notes.map((note) => (
                    <li key={note}>- {note}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Promedio semanal</p>
                <p className="text-2xl font-semibold">
                  {Math.round(selectedSeries.points.reduce((sum, item) => sum + item.yhat, 0) / selectedSeries.points.length)}
                </p>
                <p className="text-xs text-muted-foreground">Unidades esperadas por semana</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Tendencia</p>
                <p className="text-2xl font-semibold">
                  {selectedSeries.points[selectedSeries.points.length - 1].yhat - selectedSeries.points[0].yhat >= 0 ? "Alza" : "Baja"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Variacion neta: {selectedSeries.points[selectedSeries.points.length - 1].yhat - selectedSeries.points[0].yhat}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Rango estimado</p>
                <p className="text-2xl font-semibold">
                  {Math.min(...selectedSeries.points.map((item) => item.lower))} - {Math.max(...selectedSeries.points.map((item) => item.upper))}
                </p>
                <p className="text-xs text-muted-foreground">Intervalo aproximado</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 rounded-lg border bg-background p-4">
                <h3 className="text-sm font-medium mb-3">Evolucion semanal</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedSeries.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="lower" stroke="#94a3b8" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="upper" stroke="#94a3b8" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="yhat" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-72 rounded-lg border bg-background p-4">
                <h3 className="text-sm font-medium mb-3">Variacion semanal</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedSeries.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="delta" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Selecciona una serie para mostrar el detalle y las graficas.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
