import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { ArrowLeft, Download, Loader2, Table as TableIcon } from "lucide-react"

// Servicios y tipado
import { forecastService } from "../../../services/api"
import { handleError } from "../../../lib/errors"
import { logger } from "../../../services/logger"
import type { ForecastPrediction } from "../../../services/api"
import { REPORT } from "../../../config/constants"


/**
 * Funcion de utilidad para formatear fecha
 */
const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString("es-Pe");
};


/**
 * Función de utilidad para exportar a CSV
 * @param data - Arreglo de predicciones
 * @param filename - Nombre del archivo a descargar
 */
const exportToCSV = (data: ForecastPrediction[], filename: string) => {
    // Definimos los encabezados del archivo CSV
    const headers = "unique_id, fecha, prediccion";

    // Convertimos cada objeto de prediccion en una fila de texto
    const rows = data.map(p => `${p.unique_id},${formatDate(p.ds)},${p.yhat}}`).join("\n");

    const csvContent = `${headers}\n${rows}`;

    // Creamos Blob y disparamos la descarga en el navegador
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export default function ReportPage() {
    
    const { jobId } = useParams<{ jobId: string}>();
    const [predictions, setPredictions] = useState<ForecastPrediction[]>([])
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Carga de datos al montar el componente
     * Si el usuario entra directamente por URL, necesitamos pedir los datos al API
     */
    useEffect(() => {
        if (!jobId) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                const result = await forecastService.getForecastResults(jobId);
                setPredictions(result.predictions);
            } catch (error) {
                handleError(error, "REPORT", "Error al cargar los datos del reporte");
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
    const maxRowsDisplayed = (predictions.length > REPORT.MAX_ROWS_DISPLAYED) ? REPORT.MAX_ROWS_DISPLAYED : predictions.length;


    const displayData = useMemo(() => predictions.slice(0, maxRowsDisplayed), [predictions]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h'8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generando vista de reporte...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* NAVEGACION SUPERIOR */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/results/${jobId}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Reporte detallado</h1>
                </div>

                {/* BOTON DE DESCARGA CSV */}
                <Button onClick={() => exportToCSV(predictions, `forecast_${jobId}.csv`)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        Previsualización de predicciones
                    </CardTitle>
                    <CardDescription>
                        { displayData.length > REPORT.MAX_ROWS_DISPLAYED && `Mostrando las primeras ${displayData.length} filas del pronosico generado`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        {/* TABLA SIMPLE DE DOS COLUMNAS */}
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
        </div>
    );
}