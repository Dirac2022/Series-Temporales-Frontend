import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { FileUpload } from "../components/FileUpload"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { CheckCircle2, AlertCircle, TrendingUp, Calendar } from "lucide-react"
import { SeriesIdentifierSelector } from "../components/SeriesIdentifierSelector"
import type { BackendFileResponse, ForecastHorizon, TimeUnit, ForecastConfiguration } from "../types/api.types"
import { API, DAY_EQUIVALENCE, STORAGE_KEYS, UNIT_LABELS, VALIDATION } from "../../../config/constants"
import { logger } from "../../../services/logger"

export default function ForecastingPage() {

  const navigate = useNavigate();

  // Estado para los metadatos devueltos por el servidor
  const [metadata, setMetadata] = React.useState<BackendFileResponse | null>(null);

  // Nombre del archvivo original
  const [fileName, setFileName] = React.useState<string>("");

  // Estado para el mapeo de columnas
  const [mapping, setMapping] = React.useState({
    timestamp: "", // Columna de tiempo
    target: "", // Columna objetivo
  });

  // Identificadores de series
  const [seriesIdentifiers, setSeriesIdentifiers] = React.useState<string[]>([]);

  // Horizonte de prediccion
  // Valores por defecto: Prediccion de 4 semanas
  const [horizon, setHorizon] = React.useState<ForecastHorizon>({
    value: 4,
    unit: 'weeks'
  });

  // Array de columnas disponibles
  const columns = metadata?.columns || [];


  // Columnas que no se pueden usar como identificadores 
  // filter(Boolean) evita valores vaciios. Previene errores cuando el usario aun no selecciono
  const excludedColumns = [mapping.timestamp, mapping.target].filter(Boolean)


  const estimatedSeriesCount = React.useMemo(() => {
    if (!metadata) return 1;
    if (seriesIdentifiers.length === 0) return 1;
    return Math.min(metadata.rowCount, Math.pow(10, seriesIdentifiers.length));
  }, [metadata, seriesIdentifiers.length]);

  // TODO: Por mejorar
  // Flexible por si el horizonte es diario | semanal | mensual.
  // Calcula el maximo recomendado usando el historico promedio por serie.
  // const maxRecommendedHorizon = React.useMemo(() => {
  //   if (!metadata) return 0;

  //   const rowsPerSeries = Math.max(1, Math.floor(metadata.rowCount / estimatedSeriesCount));
  //   const maxDays = Math.floor(rowsPerSeries * VALIDATION.MAX_HORIZON_PERCENTAGE);

  //   const max_allowed = Math.max(1, Math.floor(maxDays / DAY_EQUIVALENCE[horizon.unit]));
  //   logger.debug("VALIDATION", "Horizonte máximo", {
  //     rowCount: metadata.rowCount,
  //     estimatedSeriesCount: estimatedSeriesCount,
  //     rowsPerSeries: rowsPerSeries,
  //     maxDays: maxDays,
  //     day_equivalente: DAY_EQUIVALENCE[horizon.unit],
  //     max_allowed: max_allowed,
  //   });
    
  //   return max_allowed;
  //   // return Math.max(
  //   //   1,
  //   //   Math.floor(maxDays / DAY_EQUIVALENCE[horizon.unit])
  //   // );
  // }, [metadata, horizon.unit, estimatedSeriesCount]);

  // const isHorizonValid = horizon.value <= maxRecommendedHorizon;

  // Handler cuando se carga exitosamente un archivo
  const handleUploadSuccess = (data: BackendFileResponse, name: string) => {
    setMetadata(data);
    setFileName(name);
  };

  // Condiciones para habilitar el boton de prediccion
  const canGenerateForecast = metadata !== null &&
    mapping.timestamp !== "" &&
    mapping.target !== "" &&
    seriesIdentifiers.length > 0;
    // && isHorizonValid;

  // Handler para generar prediccion
  const handleGenerateForecast = async () => {
    if (!canGenerateForecast || !metadata) return;

    // Construccion del Payload segon el contrato definido en api.types.ts
    const config: ForecastConfiguration = {
      fileId: metadata.fileId,
      mapping: {
        timestamp: mapping.timestamp,
        target: mapping.target,
        seriesIdentifiers: seriesIdentifiers
      },
      horizon: horizon
    };

    try {
      const response = await axios.post(`${API.BASE_URL}/forecast`, config)

      // Navegacion a resultados
      // Si el backend aun no retorna un ID, usamos uno termporal para el placeholder
      const jobId = response.data.jobId || "new-forecast-job";
      window.localStorage.setItem(STORAGE_KEYS.LAST_FORECAST_JOB, jobId);
      navigate(`/results/${jobId}`);
    } catch (error) {
      console.error("Error al iniciar la prediccion:", error);
      alert("Error al conectar con el motor de ML. Verifica la consola");
    }
  };


  return (
    <div className="space-y-6">
      {/* ENCABEZADO DE PAGINA */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Generar Prediccion</h1>
        <p className="text-muted-foreground">
          Carga tus datos historicos y configura los parametros de prediccion
        </p>
      </div>

      {/* LAYOUT PRINCIPAL: 2 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COLUMNA IZQUIERDA: CONFIGURACION */}
        <div className="md:col-span-2 space-y-6">
          {/* CARGA DE DATOS HACIA EL BACKEND */}
          <Card>
            <CardHeader>
              <CardTitle>Cargar Datos Historicos</CardTitle>
              <CardDescription>Sube un archivo con tu historico</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadSuccess={(data, name) => {
                setMetadata(data);
                setFileName(name);
              }}
              />
            </CardContent>
          </Card>

          {/* MENSAJE DE EXITO (Condicional) */}
          {metadata && (
            <div className="flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 rounded-md animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Dataset cargado: <span className="font-bold">{fileName}</span>
                {" "}({metadata.rowCount.toLocaleString()} filas)
              </span>
            </div>
          )}

          {/* MAPEO DE COLUMNAS (si los hay xd)*/}
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar columnas</CardTitle>
                <CardDescription>Indica que columnas usar para la fecha y la variable a predecir (target)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* COLUMNA DE TIEMPO */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Columna de tiempo (Requerido)
                  </Label>
                  <Select onValueChange={(v) => setMapping(p => ({ ...p, timestamp: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* VARIABLE OBJETIVO */}
                <div className="space-y-2">
                  <Label>Variable a predecir (Requerido)</Label>
                  <Select onValueChange={(v) => setMapping(p => ({ ...p, target: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* IDENTIFICADORES DE SERIES */}
          {mapping.timestamp && mapping.target && (
            <SeriesIdentifierSelector
              availableColumns={columns}
              excludedColumns={excludedColumns}
              selectedColumns={seriesIdentifiers}
              onSelectionChange={setSeriesIdentifiers}
            />
          )}

          { /**
           * HORIZONTE DE PREDICCION
           * Datos -> Mapeo -> identificadores -> HORIZONTE
           * No se abruma al usuario con todo a la vez
           */}
          {seriesIdentifiers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Horizonte de prediccion</CardTitle>
                <CardDescription>
                  ¿Cuanto tiempo adelante quieres predecir?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* INPUT: CANTIDAD DE PERIODOS */}
                  <div className="space-y-2">
                    <Label htmlFor="horizon-value">Cantidad</Label>
                    <Input
                      id="horizon-value"
                      type="number"
                      min="1"
                      // max={maxRecommendedHorizon}
                      value={horizon.value}
                      onChange={(e) => setHorizon(prev => ({ ...prev, value: Number(e.target.value) }))}
                    />
                  </div>
                  {/* UNIDAD TEMPORAL */}
                  <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Select
                      value={horizon.unit}
                      onValueChange={(v: TimeUnit) => setHorizon(prev => ({ ...prev, unit: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* OPCIONES HARDCODEADAS, YA QUE SON SOLO 3 OPCIONES QUE PROBABLEMENTE NO CAMBIARON */}
                        <SelectItem value="days">{UNIT_LABELS.days}</SelectItem>
                        <SelectItem value="weeks">{UNIT_LABELS.weeks}</SelectItem>
                        <SelectItem value="months">{UNIT_LABELS.months}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                { /**
                 * HORIZONTE EXCESIVO
                 * SOLO SE MUESTRA SI EL HORIZONTE EXCEDE LO RECOMENDADO
                 */}
                {/* {!isHorizonValid && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900 dark:text-yellow-100">
                      <p className="font-medium">Horizonte muy largo</p>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        Se recomienda maximo {maxRecommendedHorizon} {UNIT_LABELS[horizon.unit]}
                        {" "}basado en el historico promedio por serie. Predicciones muy lejanas pueden ser menos precisas
                      </p>
                    </div>
                  </div>
                )} */}

                {/* RECOMENDACION */}
                {/* <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <strong>Recomendacion:</strong> El horizonte recomendado es hasta el {Math.round(VALIDATION.MAX_HORIZON_PERCENTAGE * 100)}% del historico promedio por serie
                  {" "}(~{maxRecommendedHorizon} {UNIT_LABELS[horizon.unit]} en tu caso.)
                </div> */}
              </CardContent>
            </Card>
          )}
        </div>

        {/* COLUMNA DERECHA: PANEL DE ESTADO */}
        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Estado del Proceso</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* RESUMEN DE DATOS */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Filas cargadas en el servidor:</span>
                <span className="font-mono">{metadata?.rowCount || 0}</span>
              </div>
              <hr />
              {/* CHECKLIST DE TAREAS */}
              <ul className="space-y-3">
                <StatusItem label="Archivo cargado" isComplete={!!metadata} />
                <StatusItem label="Columna de fecha" isComplete={!!mapping.timestamp} />
                <StatusItem label="Variable a predecir" isComplete={!!mapping.target} />
                <StatusItem label="Identificadores definidos" isComplete={seriesIdentifiers.length > 0} />
                {/* <StatusItem label="Horizonte configurado" isComplete={isHorizonValid} /> */}
              </ul>
              {/* BOTON PRINCIPAL */}
              <Button
                className="w-full mt-4"
                disabled={!canGenerateForecast}
                onClick={handleGenerateForecast}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Generar Prediccion
              </Button>
              {/* MENSAJE DE AYUDA (boton deshabilitado) */}
              {!canGenerateForecast && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Completa todos los pasos para continuar
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )

}

// Componente auxiliar
// Componente pequeño para items del checklist
function StatusItem({ label, isComplete }: { label: string, isComplete: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground opacity-50" />
      )}
      <span className={isComplete ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </li>
  )
}


