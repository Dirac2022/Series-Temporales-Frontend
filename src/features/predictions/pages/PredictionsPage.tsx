/**
 * Pagina principal para buscar y visualizar predicciones filtradas
 * Consume el endpoint GET /predictions/filtered
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { PredictionFilters } from "../components/PredictionFilters"
import { PredictionsTable } from "../components/PredictionsTable"
import { ForecastLineChart } from "../../../components/charts/ForecastLineChart"
import { useFilteredPredictions } from "../hooks/useFilteredPredictions"

/**
 * Componente principal de la pagina
 */
export default function PredictionPage() {

  const { data, isLoading, error, fetch, clear } = useFilteredPredictions()

  /**
   * Metricas calculadas de las predicciones
   */
  const metrics = useMemo(() => {

    if (data.length === 0) return null

    const values = data.map((p) => p.yhat)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    const uniqueSeries = new Set(data.map((p) => p.unique_id)).size

    const dates = data.map((p) => new Date(p.ds).getTime())
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))

    return {
      count: data.length,
      uniqueSeries,
      avg,
      min,
      max,
      dateRange: {
        start: minDate.toLocaleDateString("es-PE", { month: "short", day: "numeric" }),
        end: maxDate.toLocaleDateString("es-PE", { month: "short", day: "numeric" }),
      },
    }
  }, [data])

  const selectedSeriesId = data.length > 0 ? data[0].unique_id : ""

  return (
    <div className="space-y-6">
      {/* ENCABEZADO DE PAGINA */}
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Predicciones</h1>
        <p className="text-muted-foreground max-w-2xl">
          Busca predicciones por códigos de negocio: almacén, producto, canal,
          cuenta, territorio y distribución.
        </p>
      </section>
      {/* SECCION: FILTROS */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busqueda</CardTitle>
          <CardDescription>
            Ingresa al menos un codigo para buscar predicciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PredictionFilters
            onSearch={fetch}
            onClear={clear}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      {/* SECCION: RESULTADOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultados
          </CardTitle>
          <CardDescription>
            {data.length > 0
              ? `${data.length} predicciones encontradas`
              : "Realiza una busqueda para ver resultados"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Buscando predicciones...
              </p>
            </div>
          )}
          {/* ERROR STATE */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium">Error al buscar predicciones</p>
              <p className="text-sm text-muted-foreground">{error.userMessage}</p>
            </div>
          )}
          {/* EMPTY STATE */}
          {!isLoading && !error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No se encontraron predicciones. Ingresa filtro y busca
              </p>
            </div>
          )}
          {/* SUCCESS RATE */}
          {!isLoading && !error && data.length > 0 && metrics && (
            <>
              {/* TARJETA DE METRICAS */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Total predicciones</p>
                  <p className="text-2xl font-semibold">{metrics.count}</p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Series únicas</p>
                  <p className="text-2xl font-semibold">{metrics.uniqueSeries}</p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Promedio estimado</p>
                  <p className="text-2xl font-semibold">{metrics.avg.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Rango de fechas</p>
                  <p className="text-sm font-medium">
                    {metrics.dateRange.start} - {metrics.dateRange.end}
                  </p>
                </div>
              </div>
              {/* GRAFICO */}
              <ForecastLineChart
                history={[]}
                predictions={data}
                selectedSeriesId={selectedSeriesId}
                title="Pronostico"
              />
              {/* TABLA */}
              <PredictionsTable predictions={data} pageSize={15} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}