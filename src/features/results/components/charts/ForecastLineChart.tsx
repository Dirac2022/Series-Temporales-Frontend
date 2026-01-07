/**
 * Grafico de lineas para visualizar datos historicos y predicciones de series temporales
 */
import { useMemo, useCallback } from "react"
import { 
    CartesianGrid,
    Line,
    ReferenceLine,
    Area,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ComposedChart 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { LineChart as LineChartIcon } from "lucide-react"
import type { HistoricalDataPoint, ForecastPrediction } from "../../../../services/api"
import { logger } from "../../../../services/logger"

/**
 * Props del componente ForecastLineChart
 * 
 * @property history - Array de puntos de datos historicos (datos reales pasados)
 * @property predictions - Array de predicciones futuras
 * @property selectedSeriesId - ID de la serie que se quiere visualizar
 * @property title - (Opcional) Titulo personalizado para el grafico
 * @property height - (Opcional) Altura del grafico en pixeles
 */
interface ForecastLineChartProps {
    history: HistoricalDataPoint[];
    predictions: ForecastPrediction[];
    selectedSeriesId: string;
    title?: string;
    height?: string;
}


/**
 * Componente ForecastLineChart
 * 
 * Renderiza un grafico de lineas compuesto que combina:
 *  - Areas (para intervalos de confianza)
 *  - Lineas (para historico y predicciones)
 *  - Linea de referencia (para separar historico/pronostico)
 */
export function ForecastLineChart({
    history,
    predictions,
    selectedSeriesId,
    title = "Proyeccion",
    height = "h-96"
}: ForecastLineChartProps) {

    /**
     * Formateador de numeros para tooltips
     */
    const numberFormatter = useMemo(
        () => new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }),
        []
    );

    /**
     * Formateador de fechas
     */
    const formatDate = useCallback((value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("es-PE");
    }, []);


    /**
     * Construccion de datos para el grafico
     */
    const chartData = useMemo(() => {
        
        const merged = new Map<string, any>();

        // Procesar datos historicos
        history
            .filter((r) => r.unique_id === selectedSeriesId)
            .forEach((r) => {
                merged.set(r.ds, {ds: r.ds, actual: r.y});
            });

        // Procesar predicciones
        predictions
            .filter((r) => r.unique_id === selectedSeriesId)
            .forEach((r) => {
                // Obtener el objeto existente o crear uno nuevo con solo la fecha
                const prev = merged.get(r.ds) ?? { ds: r.ds}
                merged.set(r.ds, {
                    ...prev,
                    yhat: r.yhat,
                    y_lower: r.y_lower,
                    y_upper: r.y_upper,
                });
            });

        // Convertir Map a Array y ordenar
        const sortedData = Array.from(merged.values()).sort(
            (a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime()
        );

        logger.debug("RESULTS", "Datos procesados para grafico de lineas", {
            chartData: sortedData,
            seriesId: selectedSeriesId,
            historicalPoints: history.filter(h => h.unique_id === selectedSeriesId).length,
            predictionsPoints: predictions.filter(p => p.unique_id === selectedSeriesId),
        });

        return sortedData;

    }, [history, predictions, selectedSeriesId]);

    /**
     * Punto de corte
     * Para dibular la linea divisoria entre historico y pronostico
     */
    const forecastStartDate = useMemo(() => {
        const historyDates = history
            .filter((r) => r.unique_id === selectedSeriesId)
            .map((r) => r.ds)
            .sort();

        const lastHistoryDate = historyDates.at(-1) ?? null;

        logger.debug("RESULTS", "Fecha de corte historico/pronostico", {
            lastHistoryDate,
            seriesId: selectedSeriesId,
        });

        return lastHistoryDate;
    }, [history, selectedSeriesId]);


    const hasData = chartData.length > 0;

    return (
        <Card>
            {/* HEADER */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>

            {/* CONTENEDOR DEL GRAFICO */}
            <CardContent className="border-t">
                {hasData ? (
                    <div className={`${height} md:${height}`}>
                        <h3 className="text-center text-sm font-medium mb-2">
                            Pronostico
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="ds"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString("es-PE", {
                                            day: "2-digit", month:"2-digit", year:"2-digit",
                                        })}
                                        label={{ value: "Fecha", position: "insideBottom", offset: -5}}
                                    />
                                    <YAxis 
                                        label={{ value: "Proyeccion", angle: -90, position: "insideLeft"}}
                                    />
                                    {/* TOOLTIP */}
                                    <Tooltip
                                        content={({ active, label, payload}) => {
                                            if (!active || !payload || payload.length === 0) return null;

                                            const relevantData = payload.filter(
                                                p => p.dataKey === "actual" || p.dataKey === "yhat"
                                            );

                                            return (
                                                <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
                                                    {/* FECHA FORMATEADA */}
                                                    <div className="text-xs font-medium text-foreground">
                                                        Fecha: {formatDate(String(label))}
                                                    </div>
                                                    {/* LISTA DE VALORES */}
                                                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                        {relevantData.map((entry) => {
                                                            const name = entry.name === "actual" ? "Serie" : "Pronostico";
                                                            
                                                            return (
                                                                <div
                                                                    key={entry.dataKey}
                                                                    className="flex items-center justify-between gap-3"
                                                                >
                                                                    <span>{name}</span>
                                                                    <span className="font-mono text-foreground">
                                                                        {numberFormatter.format(Number(entry.value))} unidades
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />

                                    {/* INTERVALO DE CONFIANZA */}
                                    <Area 
                                        type="linear" dataKey="y_lower" stroke="none"fill="transparent" isAnimationActive={false}
                                    />
                                    <Area 
                                        type="linear" dataKey="y_upper" stroke="none" fill="#2563eb" fillOpacity={0.2} isAnimationActive={false}
                                    />

                                    {/* LINEA DE REFERENCIA */}
                                    {forecastStartDate && (
                                        <ReferenceLine
                                            x={forecastStartDate} stroke="#9ca3af" strokeWidth={2} strokeDasharray="10 5"
                                        />
                                    )}
                                    {/* LINEA DATOS HISTORICOS */}
                                    <Line 
                                        type="linear" dataKey="actual" stroke="#0f766e" strokeWidth={2} dot={false}
                                    />
                                    {/* LINEA PREDICCION*/}
                                    <Line 
                                        type="linear" dataKey="yhat" stroke="#2563eb" strokeWidth={2} dot={false}
                                    />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    /**
                     * PLACEHOLDER: Mensahe cuando no hay datos
                     */
                    <div className={`${height} md:${height} flex items-center justify-center`}>
                        <p className="text-sm text-muted-foreground italic">
                            Np hay datos disponibles para la serie seleccionada
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

