/**
 * =============================================================================
 * PAGINA: ReportPage
 * =============================================================================
 * 
 * Pagina de reporte completo con visualizaciones de predicciones
 */

import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Download, Loader2, Table as TableIcon } from "lucide-react"

// Componentes de graficos
import { SeriesSelector } from "../components/charts/SeriesSelector"
import { ForecastLineChart } from "../../../components/charts/ForecastLineChart"
import { ForecastBarChart } from "../components/charts/ForecastBarChart"

// Servicios y tipado
import { forecastService } from "../../../services/api"
import { handleError } from "../../../lib/errors"
import { logger } from "../../../services/logger"
import type { ForecastResultResponse, ForecastPrediction } from "../../../services/api"
import { REPORT } from "../../../config/constants"


/**
 * Funcion de utilidad para formatear fecha
 */
const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString("es-Pe");
};


/**
 * Función de utilidad para exportar a CSV
 * 
 * Crea un archivo CSV con todas las prediccioens y dispara la descarga
 * 
 * @param data - Arreglo de predicciones
 * @param filename - Nombre del archivo a descargar
 */
const exportToCSV = (data: ForecastPrediction[], filename: string) => {
    // Define los encabezados del archivo CSV
    const headers = "unique_id,fecha,prediccion";

    // Conevierte cada objeto de prediccion en una fila de texto
    const rows = data.map(p => `${p.unique_id},${formatDate(p.ds)},${p.yhat}}`).join("\n");

    const csvContent = `${headers}\n${rows}`;

    // Crea Blob y dispara la descarga en el navegador
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera URL temporal
    URL.revokeObjectURL(url);

    logger.info("REPORT", "CSV exportado", {
        filename,
        rowCount: data.length,
    });
};

/**
 * Componente principal de la pagina de reporte
 * 
 */
export default function ReportPage() {

    // ROUTING: Obtener jobId de la URL
    const { jobId } = useParams<{ jobId: string }>();

    // Datos completos del forecast
    const [results, setResults] = useState<ForecastResultResponse | null>(null);
    //const [predictions, setPredictions] = useState<ForecastPrediction[]>([])

    // Iniciador de la carga
    const [isLoading, setIsLoading] = useState(true);

    // Serie seleccionada para visualizacion
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");

    /**
     * Carga de datos al montar el componente
     * Si el usuario entra directamente por URL, necesitamos pedir los datos al API
     */
    useEffect(() => {

        if (!jobId) {
            logger.warn("REPORT", "No se proporciono jobId");
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                logger.info("REPORT", "Cargando datos completos del forecast", { jobId });
                const result = await forecastService.getForecastResults(jobId);
                setResults(result);

                // Selecciona la primera serie por defecto
                if (result.seriesIds.length > 0) {
                    setSelectedSeriesId(result.seriesIds[0]);
                    logger.debug("REPORT", "Serie seleccionada automaticamente", {
                        seriesId: result.seriesIds[0]
                    });
                }

                logger.info("REPORT", "Datos cargado exitosamente", {
                    seriesCount: result.seriesIds.length,
                    predictionsCount: result.predictions.length,
                    historyCount: result.history.length
                });

            } catch (error) {
                handleError(error, "REPORT", "Error al cargar los datos del reporte");
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [jobId]);

    /**
     * Data optimizada para la visualizacion
     * Limite de filas segun REPORT.MAX_ROWS_DISPLAYED
     */
    const displayData = useMemo(() => {
        if (!results) return [];

        const maxRows = Math.min(results.predictions.length, REPORT.MAX_ROWS_DISPLAYED);
        return results.predictions.slice(0, maxRows);
    }, [results])

    // RENDERIZADO CONDICIONAL: Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h'8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generando vista de reporte...</p>
            </div>
        );
    }

    /**
     * RENDERIZADO CONDICIONAL: sin datos
     * 
     * Si no hay resultados despues de cargar (error o jobId invalido)
     */
    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-lg font-medium">
                    No se pudieron cargar los datos del reporte
                </p>
                <Button asChild variant="outline">
                    <Link to="/forecast">Volver al inicio</Link>
                </Button>
            </div>
        );
    }

    /**
     * RENDERIZADO PRINCIPAL
     */
    return (
        <div className="space-y-6">
            {/* NAVEGACION SUPERIOR */}
            <div className="flex items-center justify-between">
                {/* BOTON DE VOLVER */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/results/${jobId}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Reporte</h1>
                </div>

                {/* BOTON DE DESCARGA CSV */}
                <Button onClick={() => exportToCSV(results.predictions, `forecast_${jobId}.csv`)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV
                </Button>
            </div>

            {/* TABLA DE PREDICCIONES */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        Previsualización de predicciones
                    </CardTitle>
                    <CardDescription>
                        {displayData.length > REPORT.MAX_ROWS_DISPLAYED && `Mostrando las primeras ${displayData.length} filas del pronosico generado`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        {/* TABLA SIMPLE DE TRES COLUMNAS */}
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">unique_id</th>
                                    <th className="px-4 py-3 text-left font-medium">fecha</th>
                                    <th className="px-4 py-3 text-right font-medium">prediccion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {displayData.map((row, index) => (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-mono">{row.unique_id}</td>
                                        <td className="px-4 py-3 font-mono">{formatDate(row.ds)}</td>
                                        <td className="px-4 py-3  text-right font-mono font-bold text-primary">
                                            {row.yhat.toFixed(3)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* VISUALIZACIONES POR SERIE */}
            <div className="pt-4 space-y-6">
                {/* SELECTOR DE SERIES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visualizacion por Serie</CardTitle>
                        <CardDescription>
                            Selecciona una serie para visualizar sus prediccioens en detalle
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SeriesSelector
                            seriesIds={results.seriesIds}
                            value={selectedSeriesId}
                            onValueChange={(newSeriesId) => {
                                setSelectedSeriesId(newSeriesId);
                                logger.info("REPORT", "Serie seleccionada manualmente", {
                                    previousSeries: selectedSeriesId,
                                    newSeries: newSeriesId,
                                    jobId: results.jobId
                                });
                            }}
                            label="Serie a visualizar"
                        />
                    </CardContent>
                </Card>

                {/* GRAFICO DE LINEAS */}
                {selectedSeriesId && (
                    <ForecastLineChart
                        history={results.history}
                        predictions={results.predictions}
                        selectedSeriesId={selectedSeriesId}
                        title="Historico y Pronostico"
                        height="h-96"
                    />
                )}

                {/* GRAFICO DE BARRAS */}
                {selectedSeriesId && (
                    <ForecastBarChart
                        predictions={results.predictions}
                        selectedSeriesId={selectedSeriesId}
                        horizon={results.horizon}
                        title="Analisis agregado"
                        height="h-96"
                    />
                )}

                {/* SI NO HAY SERIE SELECCIONADA */}
                {!selectedSeriesId && results.seriesIds.length > 0 && (
                    <Card>
                        <CardContent className="flex items-center justify-center h-48">
                            <p className="text-muted-foreground italic">
                                Selecciona una serie para visualizar los graficos
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* SI NO HAY SERIES DISPONIBLES */}
                {results.seriesIds.length == 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                            <p className="text-lg font-medium">No hay series disponibles</p>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                El pronostico no genero series de datos. Verifica la configuracion del pronostico y vuelve a intentar
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}