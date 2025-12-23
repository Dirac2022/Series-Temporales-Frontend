import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { 
  ArrowLeft, 
  Loader2, 
  LineChart, 
  FileSearch,
  AlertCircle
} from "lucide-react"

export default function ResultsPage() {
  /**
   * [Explicación A] Captura de parámetros de la URL
   * Expresión: useParams<{ jobId: string }>()
   * Justificación: React Router extrae el ID que definimos como :jobId en App.tsx. 
   * Esto nos permitirá pedir al backend los resultados específicos de esta ejecución.
   */
  const { jobId } = useParams<{ jobId: string }>();

  return (
    <div className="space-y-6">
      {/* ENCABEZADO Y NAVEGACIÓN DE RETORNO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/forecast">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análisis de Resultados</h1>
            <p className="text-sm text-muted-foreground">
              Visualización de proyecciones y métricas de precisión
            </p>
          </div>
        </div>
        
        {/* Identificador del proceso visible para soporte técnico o referencia */}
        {jobId && (
          <div className="hidden sm:block text-right">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              ID: {jobId}
            </span>
          </div>
        )}
      </div>

      {/* [Explicación B] Estado de Carga Temporal (Placeholder)
          Justificación: Mientras no tengamos la conexión real con el backend, 
          mostramos una interfaz que indica progreso.
      */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Generando Predicciones...</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Nuestro motor de Inteligencia Artificial está procesando tus {jobId ? "datos" : "últimas configuraciones"} 
                para encontrar el modelo con mayor precisión. Esto puede tardar unos segundos.
              </CardDescription>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link to="/forecast">Cancelar</Link>
              </Button>
              <Button disabled>
                <FileSearch className="mr-2 h-4 w-4" />
                Ver Reporte Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* [Explicación C] Secciones Futuras (Previsualización de Layout)
            Justificación: Definimos dónde irán los gráficos (Recharts) y las tablas 
            para que el equipo ya visualice la estructura final.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 grayscale pointer-events-none">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Gráfico de Proyección
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border-t">
              <p className="text-sm italic">Área reservada para gráfico interactivo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Métricas de Error
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border-t">
              <p className="text-sm italic">Área reservada para MAE, RMSE y MAPE</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}