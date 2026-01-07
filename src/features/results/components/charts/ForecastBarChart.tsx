/**
 * Grafico de barras para visualizar prediccioens agregadas segun frecuencia temporal
 */

import { useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card"
import { BarChart3 } from "lucide-react"
import type { ForecastPrediction, ForecastHorizon, TimeUnit } from "../../../../services/api"
import { detectAndAggregate } from "../../utils/aggregations"
import { logger } from "../../../../services/logger"

/**
 * Props del componente ForecastBarChart
 * 
 * @property predictions        - Array de todas las predicciones del resultado
 * @property selectedSeriesId   - ID de la serie que se dee visualizar
 * @property horizon            - Objeto con configuracion del horizonte temporal
 * @property title              - (Opcional) Titulo personalizado para el grafico
 * @property height             - (Opcional) Altura del grafico
 */
interface ForecastBarChartProps {
    predictions: ForecastPrediction[];
    selectedSeriesId: string;
    horizon: ForecastHorizon;
    title?: string;
    height?: string;
}


/**
 * Componente ForecastBarChart
 * 
 * Renderiza un grafico de barras con predicciones agregadas segun la frecuencia temporal
 */
export function ForecastBarChart({
    predictions,
    selectedSeriesId,
    horizon,
    title = "Predicciones Agregadas",
    height = "h-96"
}: ForecastBarChartProps) {

    // TODO: Centralizar esta funcion en un src/lib/utils si se repite en otros archivos
    // Formateador de numeros para tooltips y etiquetas
    const numberFormatter = useMemo(
        () => new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2}),
        []
    );

    // Filtrado y agregacion de datos
    const aggregatedData = useMemo(() => {
        const filteredPredictions = predictions.filter(
            (pred) => pred.unique_id === selectedSeriesId
        );

        logger.debug("RESULTS", "Filtrando predicciones para grafico de barras", {
            totalPredictions: predictions.length,
            filteredCount: filteredPredictions.length,
            seriesId: selectedSeriesId,
            horizon: horizon
        });

        // Agregar datos segun frecuencia temporal
        const aggregated = detectAndAggregate(filteredPredictions, horizon);

        logger.info("RESULTS", "Datos agregados para grafico de barras", {
            inputCount: filteredPredictions.length,
            outputCount: aggregated.length,
            unit: horizon.unit,
            data: aggregated
        });

        return aggregated;

    }, [predictions, selectedSeriesId, horizon]);


    // Genera texto descriptivo segun el tipo de agregacion
    const chartDescription = useMemo(() => {
        switch (horizon.unit) {
            case "days":
                return "Promedio de predicciones agrupadas por dia de la semana";
            case "weeks":
                return "Prediccioens por semana del año";
            case "months":
                return "Predicciones por mes";
            default:
                return "Predicciones agregadas"
        }
    }, [horizon.unit]);

    const hasData = aggregatedData.length > 0;

    return (
        <Card>
            {/* HEADER */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
            </CardHeader>
            {/* CONTENT */}
            <CardContent className="border-t pt-6">
                {hasData ? (
                    <div className={`${height} md:${height}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={aggregatedData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="label"
                                    stroke="hsl(var(--border))"
                                    tick={{ fill: "hsl(var(--foreground))"}}
                                    label={{
                                        value: getXAxisLabel(horizon.unit),
                                        position: "insideBottom",
                                        offset: -5,
                                        fill: "hsl(var(--muted-foreground))"
                                    }}
                                />
                                <YAxis 
                                    stroke="hsl(var(--border))"
                                    tick={{ fill: "hsl(var(--foreground))"}}
                                    tickFormatter={(value) => numberFormatter.format(value)}
                                    label={{
                                        value: "Valor promedio",
                                        angle: -90,
                                        position: "insideLeft",
                                        fill: "hsl(var(--muted-foreground))"
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: "#3b82f6", opacity: 0.1 }}
                                    content={({ active, payload}) => {
                                        if (!active || !payload || payload.length === 0) return null;
                                        const data = payload[0].payload;

                                        return (
                                            <div className="rounded-md border bg-background px-3 py-2 shadow-lg">
                                                <div className="text-xs font-bold text-foreground mb-1">
                                                    {data.label}
                                                </div>
                                                {/* VALOR PROMEDIO */}
                                                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                                    <span>Promedio:</span>
                                                    <span className="font-mono font-semibold text-foreground">
                                                        {numberFormatter.format(data.value)} unidades
                                                    </span>
                                                </div>
                                                {/* CONTADOR: Cantidad de predicciones promediadas */}
                                                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mt-1">
                                                    <span>Predicciones:</span>
                                                    <span className="font-mono">
                                                        {data.count}
                                                    </span>
                                                </div>
                                                {/* MENSAJE CONTEXTUAL */}
                                                {horizon.unit == "days" && data.count > 1 && (
                                                    <div className="mt-2 pt-2 border-t border-border text-xs italic text-muted-foreground">
                                                        Este es el promedio de {data.count} dias en el pronostico 
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                />

                                {/* BARRAS DEL GRAFICO */}
                                <Bar 
                                    dataKey="value"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    name="Prediccion"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ): (
                    // PLACEHOLDER
                    <div className={`${height} md:${height} flex items-center justify-center`}>
                        <div className="text-center space-y-2">
                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground italic">
                                No hay datos disponibles para la serie seleccionada
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Verifica que la serie tenga predicciones generadas
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * Helper
 * Retorna la etiqueta apropiada para el eje X segun el tipo de agregacion
 * 
 * @param unit - Unidad temporal del horizonte
 * @returns String con la etiqueta apropiada para el eje X
 */
function getXAxisLabel(unit: TimeUnit): string {
    switch (unit) {
        case "days":
            return "Dia de la semana";
        case "weeks":
            return "Semana del año";
        case "months":
            return "Mes";
        default:
            return "Categoria";
    }
}