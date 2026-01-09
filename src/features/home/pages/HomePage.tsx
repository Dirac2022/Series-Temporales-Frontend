import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"

const highlights = [
  { label: "Series monitoreadas", value: "148", note: "12 nuevas esta semana" },
  { label: "Predicciones activas", value: "36", note: "Horizon promedio: 4 semanas" },
  { label: "Ultima actualizacion", value: "Hace 18 min", note: "Backend en linea" },
]

const activity = [
  { label: "Carga diaria de datos", status: "En curso", color: "bg-emerald-500/10 text-emerald-700" },
  { label: "Entrenamiento automatico", status: "Programado", color: "bg-blue-500/10 text-blue-700" },
  { label: "Alertas de calidad", status: "2 pendientes", color: "bg-amber-500/10 text-amber-700" },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Inicio</h1>
        <p className="text-muted-foreground max-w-2xl">
          Panel rapido del estado de tus series y de la operacion de forecasting.
          Usa los accesos para iniciar nuevas predicciones o revisar el inventario ya generado.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.note}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Acciones sugeridas</CardTitle>
            <CardDescription>Atajos para el flujo mas comun</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/forecast">Generar prediccion</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/predictions">Ver predicciones</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/results">Resultados recientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado operativo</CardTitle>
            <CardDescription>Resumen de procesos clave</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <Badge className={item.color}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Checklist de configuracion</CardTitle>
            <CardDescription>Para dejar el flujo listo antes del rollout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Fuentes de datos validadas</span>
              <span className="font-medium text-foreground">3/4</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Modelos aprobados</span>
              <span className="font-medium text-foreground">2/3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Alertas por serie</span>
              <span className="font-medium text-foreground">Activas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas del equipo</CardTitle>
            <CardDescription>Ultimos ajustes del roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- Integracion con base historica en progreso.</p>
            <p>- Se priorizan series con alta rotacion y margen.</p>
            <p>- Aprobado el baseline de 4 semanas como default.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
