  import { useState, useEffect, useMemo } from "react";
  import { useParams, Link } from "react-router-dom"
  import { Card, CardContent, CardHeader, CardTitle, CardDescription} from "../../../components/ui/card"
  import { Button } from "../../../components/ui/button"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
  import { ArrowLeft, Loader2, LineChart as LineChartIcon, FileSearch, AlertCircle} from "lucide-react"
  import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
  import { STORAGE_KEYS } from "../../../config/constants"
  import { forecastService } from "../../../services/api"
  import { handleError, getErrorInfo } from "../../../lib/errors"
  import { logger } from "../../../services/logger"
  import { useForecastStatus } from "../hooks/useForecastStatus"
  import type { ForecastResultResponse } from "../../../services/api"

  export default function ResultsPage() {
    const { jobId } = useParams<{ jobId: string }>();

    // Estado para el jobId resuelto (de URL o localStorage)
    const [resolvedJobId, setResolvedJobId] = useState<string | null>(jobId ?? null);

    // Hook para polling de estatus (reemplaza todo el useEffect de polling)
    const { status, isLoading: isLoadingStatus, error: statusError} = useForecastStatus(resolvedJobId);

    // Estado para los resultados completos
    const [results, setResults] = useState<ForecastResultResponse | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

    /**
     * Resolver jobId (de URL o localStorage)
     * 
     * - Si viene jobId de URL, usarlo y guardarlo en localStorage
     * - Si no, intentar recuperar el último de localStorage
     * - Solo se ejecuta al montar o cuando cambia jobId en URL
     */
    useEffect(() => {
      if (jobId) {
        logger.info("RESULTS", "jobId obtenido de URL", { jobId });
        window.localStorage.setItem(STORAGE_KEYS.LAST_FORECAST_JOB, jobId);
        setResolvedJobId(jobId);
        return;
      }

      // Intentar recuperar de localStorage
      const last = window.localStorage.getItem(STORAGE_KEYS.LAST_FORECAST_JOB);
      if (last) {
        logger.info("RESULTS", "jobId recuperado de localStorage", { jobId: last });
        setResolvedJobId(last);
      } else {
        logger.warn("RESULTS", "No hya jobId disponible");
        setResolvedJobId(null);
      }
    }, [jobId]);

    
    /**
     * Obtener resultados cuando el forecast está completado
     * 
     * - Solo se ejecuta cuando status es 'completed'
     * - Evita consultas duplicadas con la validación results?.jobId
     * - Usa el servicio de API con manejo de errores integrado
     */
    useEffect(() => {
      // Validaciones: solo obtener si está completado y no lo tenemos ya
      if (!resolvedJobId || status?.status !== "completed") return;
      if (results?.jobId === resolvedJobId) return;

      let isMounted = true;

      const fetchResults = async () => {
        setIsLoadingResults(true);

        try {
          logger.info("RESULTS", "Obtenieod resultados del forecast", { jobId: resolvedJobId });

          // Usar el servicio de API (logging automático)
          const data = await forecastService.getForecastResults(resolvedJobId);

          if (isMounted) {
            setResults(data);

            // Seleccionar primera serie por defecto
            if (data.seriesIds.length > 0) {
              setSelectedSeriesId(data.seriesIds[0]);
              logger.debug("RESULTS", "Serie seleccionada por defecto", { seriesId: data.seriesIds[0] });
            }

            setIsLoadingResults(false);
          }
        } catch (error) {
          // handleError ya loggea automáticamente
          const appError = handleError(error, "RESULTS", "Obtener resultados");
          const info = getErrorInfo(appError);

          // Mostrar error al usuario
          // TODO: Esto se puede mejorar (toast/notification component)
          alert(`${info.title}: ${info.message}`);

          if (isMounted) {
            setResults(null);
            setIsLoadingResults(false);
          }
        }
      };

      fetchResults();

      // Prevenir updates si el componente se desmonta
      return () => {
        isMounted = false;
      };
      
    }, [resolvedJobId, results?.jobId, status?.status]);


    /**
     * Estados derivados para la UI
     */
    const statusLabel = status?.status ?? "queued";
    const isCompleted = statusLabel === "completed";
    const isFailed = statusLabel === "failed";
    const isMissingJob = !resolvedJobId;
    const isIdle = isMissingJob || (!isLoadingStatus && status === null);

    /**
     * Datos para el gráfico
     */
    const chartData = useMemo(() => {
      if (!results || !selectedSeriesId) return [];
      return results.predictions
        .filter((row) => row.unique_id === selectedSeriesId)
        .map((row) => ({ ds: row.ds, yhat: row.yhat }));
    }, [results, selectedSeriesId]);

    /**
     * Manejador de errores de status
     * - Mostrar errores de polling al usuario
     * - Solo se ejecuta si hay error
     */
    useEffect(() => {
      if (statusError) {
        const info = getErrorInfo(statusError);
        logger.error("RESULTS", "Error en polling de status", {
          error: info.technical,
          userMessage: info.message,
        });

        // TODO: Se puede mejorar
        alert(`${info.title}: ${info.message}`);
      }
    }, [statusError]);

    return (
      <div className="space-y-6">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/forecast">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analisis de Resultados</h1>
              <p className="text-sm text-muted-foreground">
                Visualizacion de proyecciones y metricas de precision
              </p>
            </div>
          </div>

          {resolvedJobId && (
            <div className="hidden sm:block text-right">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                ID: {resolvedJobId}
              </span>
            </div>
          )}
        </div>

        {/* TARJETA DE ESTADO */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              {/* SPINNER DE CARGA */}
              {!isCompleted && !isFailed && !isIdle && (
                <div className="p-4 bg-primary/10 rounded-full">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              )}
              {/* MENSAJES DE ESTADO */}
              <div className="space-y-2">
                {isIdle ? (
                  <CardTitle className="text-2xl">No hay proceso en curso</CardTitle>
                ) : isFailed ? (
                  <CardTitle className="text-2xl">La prediccion fallo</CardTitle>
                ) : isCompleted ? (
                  <CardTitle className="text-2xl">Predicciones completadas</CardTitle>
                ) : (
                  <CardTitle className="text-2xl">Generando Predicciones...</CardTitle>
                )}
                <CardDescription className="max-w-md mx-auto">
                  {isIdle && (
                    <span>Vuelve a la pantalla de prediccion para iniciar un nuevo proceso.</span>
                  )}
                  {isFailed && (
                    <span>
                      {status?.error || "El proceso fallo. Revisa los parametros e intenta nuevamente."}
                    </span>
                  )}
                  {isCompleted && (
                    <span>El procesamiento termino correctamente. Ya puedes revisar el reporte.</span>
                  )}
                  {!isCompleted && !isFailed && !isIdle && (
                    <span>
                      {isLoadingStatus ? "Consultando estado del proceso..." : `Estado: ${status?.stage || "en cola"}.`}
                    </span>
                  )}
                </CardDescription>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/forecast">Volver</Link>
                </Button>
                <Button disabled={!isCompleted || isIdle || isLoadingResults}>
                  <FileSearch className="mr-2 h-4 w-4" />
                  Ver Reporte Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GRÁFICO DE MÉTRICAS */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isCompleted ? "" : "opacity-40 grayscale pointer-events-none"}`}>
            {/* GRÄFICO DE PROYECCIÓN */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Grafico de Proyeccion
                </CardTitle>
                {isCompleted && results?.seriesIds.length ? (
                  <div className="pt-2">
                    <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una serie" />
                      </SelectTrigger>
                      <SelectContent>
                        {results.seriesIds.map((id) => (
                          <SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="h-64 border-t">
                {isCompleted && chartData.length > 0 ? (
                  <>
                    <h3 className="text-center">
                      Pronóstico
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="ds" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          label={{ value: "Fecha", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis
                          label={{ value: "Proyección", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                          labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString()}`}
                          formatter={(value) => [`${Number(value)?.toFixed(3) ?? ''}`, "Pronóstico"]}
                        />
                        <Line type="linear" dataKey="yhat" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                  
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm italic">Area reservada para grafico interactivo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MËTRICAS DE ERROR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Metricas de Error
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center border-t">
                {isCompleted && results ? (
                  <div className="w-full max-w-xs space-y-3">
                    <MetricRow label="MAE" value={results.metrics.mae} />
                    <MetricRow label="RMSE" value={results.metrics.rmse} />
                    <MetricRow label="MAPE" value={results.metrics.mape} />
                    <MetricRow label="WAPE" value={results.metrics.wape} />
                  </div>
                ) : (
                  <p className="text-sm italic">Area reservada para MAE, RMSE y MAPE</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }


  /**
   * Componente auxiliar para mostrar una métrica
   */
  function MetricRow({ label, value }: { label: string; value?: number | null }) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value == null ? "--" : value.toFixed(4)}</span>
      </div>
    )
  }
