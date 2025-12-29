import * as React from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { ArrowLeft, Loader2, LineChart as LineChartIcon, FileSearch, AlertCircle} from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import { STORAGE_KEYS, POLLING, API } from "../../../config/constants"

type JobStatus = "queued" | "running" | "completed" | "failed";

interface ForecastStatusResponse {
  jobId: string;
  status: JobStatus;
  stage: string;
  message?: string | null;
  error?: string | null;
  updatedAt: string;
}

interface ForecastMetrics {
  mae?: number | null;
  rmse?: number | null;
  mape?: number | null;
  wape?: number | null;
}

interface ForecastPrediction {
  unique_id: string;
  ds: string;
  yhat: number;
}

interface ForecastResultResponse {
  jobId: string;
  status: JobStatus;
  seriesIds: string[];
  metrics: ForecastMetrics;
  predictions: ForecastPrediction[];
}


export default function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [resolvedJobId, setResolvedJobId] = React.useState<string | null>(jobId ?? null);
  const [status, setStatus] = React.useState<ForecastStatusResponse | null>(null);
  const [results, setResults] = React.useState<ForecastResultResponse | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (jobId) {
      window.localStorage.setItem(STORAGE_KEYS.LAST_FORECAST_JOB, jobId);
      setResolvedJobId(jobId);
      return;
    }
    const last = window.localStorage.getItem(STORAGE_KEYS.LAST_FORECAST_JOB);
    if (last) {
      setResolvedJobId(last);
    } else {
      setIsLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    if (!resolvedJobId) return;
    let isMounted = true;
    let timer: number | undefined;

    const fetchStatus = async () => {
      try {
        const response = await axios.get<ForecastStatusResponse>(`${API.BASE_URL}/forecast/${resolvedJobId}/status`);
        if (isMounted) {
          setStatus(response.data);
          setIsLoading(false);
          if (response.data.status === "completed" || response.data.status === "failed") {
            if (timer) {
              window.clearInterval(timer);
              timer = undefined;
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
          if (timer) {
            window.clearInterval(timer);
            timer = undefined;
          }
        }
      }
    };

    fetchStatus();
    timer = window.setInterval(fetchStatus, POLLING.INTERVAL_MS);

    return () => {
      isMounted = false;
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [resolvedJobId]);

  React.useEffect(() => {
    if (!resolvedJobId || status?.status !== "completed") return;
    if (results?.jobId === resolvedJobId) return;

    let isMounted = true;

    const fetchResults = async () => {
      try {
        const response = await axios.get<ForecastResultResponse>(`${API.BASE_URL}/forecast/${resolvedJobId}`);
        if (isMounted) {
          setResults(response.data);
          if (response.data.seriesIds.length > 0) {
            setSelectedSeriesId(response.data.seriesIds[0]);
          }
        }
      } catch (error) {
        if (isMounted) {
          setResults(null);
        }
      }
    };

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [resolvedJobId, results?.jobId, status?.status]);

  const statusLabel = status?.status ?? "queued";
  const isCompleted = statusLabel === "completed";
  const isFailed = statusLabel === "failed";
  const isMissingJob = !resolvedJobId;
  const isIdle = isMissingJob || (!isLoading && status === null);

  const chartData = React.useMemo(() => {
    if (!results || !selectedSeriesId) return [];
    return results.predictions
      .filter((row) => row.unique_id === selectedSeriesId)
      .map((row) => ({ ds: row.ds, yhat: row.yhat }));
  }, [results, selectedSeriesId]);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            {!isCompleted && !isFailed && !isIdle && (
              <div className="p-4 bg-primary/10 rounded-full">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}
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
                    {isLoading ? "Consultando estado del proceso..." : `Estado: ${status?.stage || "en cola"}.`}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link to="/forecast">Volver</Link>
              </Button>
              <Button disabled={!isCompleted || isIdle}>
                <FileSearch className="mr-2 h-4 w-4" />
                Ver Reporte Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isCompleted ? "" : "opacity-40 grayscale pointer-events-none"}`}>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ds" hide />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="yhat" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm italic">Area reservada para grafico interactivo</p>
                </div>
              )}
            </CardContent>
          </Card>

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

function MetricRow({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value == null ? "--" : value.toFixed(4)}</span>
    </div>
  )
}
