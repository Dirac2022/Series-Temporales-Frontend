/**
 * Agregaciones Temporales para Graficos de Barras
 * 
 * Agregacion diaria: Agrupa por dia de semana y promedia
 * Agregacion semanal: Agrupa por numero de semama del año ISO
 * Agregacion mensual: Agrupa por nomrbe de mes abreviado
 */

import { getISOWeek } from "date-fns"
import type { ForecastPrediction, TimeUnit, ForecastHorizon } from "../../../services/api"
import { logger } from "../../../services/logger"

/**
 * Interfaz para el resultado de una agregacion.
 * 
 * Representa un punto de datos agregado listo para graficar
 * 
 * @property label - Etiqueta descriptiva para el eje X
 * @property value - Valor agregado para el eje Y
 * @property count - Cantidad de predicciones que se promediaron (Para debugging y validacion)
 * 
 */
export interface AggregatedDataPoint {
    label: string;
    value: number;
    count: number;
}


/**
 * Agrupa predicciones por dia de semana y calcula el promedio de cada dia
 * 
 * @params predictions - Array de prediccioens a agregar
 * @returns Array de puntos agregados ordenados por dia de semana (Lun -> Dom)
 */
export function aggregateByDayOfWeek(
    predictions: ForecastPrediction[]
): AggregatedDataPoint[] {

    // Agrupar predicciones por dia de semana
    const groupedByDay = new Map<number, number[]>();

    predictions.forEach((pred) => {
        const date = new Date(pred.ds); 

        // Domingo = 0 = , ... , Sabado = 6
        const dayOfWeek = date.getDay();

        const existing = groupedByDay.get(dayOfWeek) ?? []; 
        groupedByDay.set(dayOfWeek, [...existing, pred.yhat]) 
    });

    // Calcular promedios y crear etiquetas
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    const result = orderedDays.map((dayNum) => {
        // Si no hay datos para cierto dia, retorna undefined
        const values = groupedByDay.get(dayNum);
        if (!values || values.length === 0) return undefined;

        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;

        return {
            label: dayNames[dayNum],
            value: average,
            count: values.length
        };
    })

    // Filtrar valores undefined
    .filter(Boolean) as AggregatedDataPoint[];

    logger.debug("RESULTS", "Agregacion por dia de semana completada", {
        totalPredictions: predictions.length,
        agregatedPoints: result.length,
        data: result
    });

    return result;
}


/**
 * Agrupa predicciones por numero de semana del año ISO y calcula el promedio
 * 
 * @params predictions - Array de predicciones a agregar
 * @returns Array de puntos agregados ordenados por numero de semana
 * 
 */
export function aggregateByWeek(
    predictions: ForecastPrediction[]
): AggregatedDataPoint[] {

    // Agrupar por numero de semana ISO (1-53)
    const groupedByWeek = new Map<number, number[]>();

    predictions.forEach((pred) => {
        const date = new Date(pred.ds);

        // 2024-12-30 puede ser Semana 1 del 2025
        const weekNumber = getISOWeek(date);

        const existing = groupedByWeek.get(weekNumber) ?? [];
        groupedByWeek.set(weekNumber, [...existing, pred.yhat]);
    });

    // Calcular promedios y crear etiquetas
    const result = Array.from(groupedByWeek.entries())
        .map(([weekNum, values]) => {
            const sum = values.reduce((acc, val) => acc + val, 0);
            const average = sum / values.length;

            return {
                label: `Semana ${weekNum}`,
                value: average,
                count: values.length,
            };
        })

        // Ordenar por numero de semana
        .sort((a, b) => {
            const numA = Number(a.label.split(" ")[1]);
            const numB = Number(b.label.split(" ")[1]);
            return numA - numB;
        });

    logger.debug("RESULTS", "Agregacion por semana completada", {
        totalPredictions: predictions.length,
        aggregatedPoints: result.length,
        weekRange: result.length > 0
            ? `${result[0].label} - ${result[result.length - 1].label}`
            : "N/A",
        data: result
    }); 
    
    return result;
}


/**
 * Agrupa predicciones por mes y calcula el promedio
 * 
 * @param predictions - Array de predicciones a agregar
 * @returns Array de puntos agregados ordenados cronologicamente
 */
export function aggregateByMonth(
    predictions: ForecastPrediction[]
): AggregatedDataPoint[] {

    // Agrupar por mes
    const groupedByMonth = new Map<string, number[]>();

    predictions.forEach((pred) => {
        const date = new Date(pred.ds);
        const year = date.getFullYear();
        const monthIndex = date.getMonth();         // Enero = 0 ,  ..., Diciembre = 11
        

        // Crear una llave unica "YYYY-MM"
        const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`;

        const existing = groupedByMonth.get(monthKey) ?? [];
        groupedByMonth.set(monthKey, [...existing, pred.yhat]);
    });

    const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    // Calcular promedios y crear etiquetas
    const result = Array.from(groupedByMonth.entries())
        .map(([monthKey, values]) => {
            const monthIndex = Number(monthKey.split("-")[1]) - 1;
            const sum = values.reduce((acc, val) => acc + val, 0);
            const average = sum / values.length;

            return {
                label: monthNames[monthIndex],
                value: average,
                count: values.length,
                sortKey: monthKey
            };
        })

        // Orden cronologicamente mediante llave "YYYY-MM"
        .sort((a, b) => {
            return a.sortKey.localeCompare(b.sortKey);
        })

        // Eliminar sortKey del resultado final
        .map(({ sortKey, ...rest}) => rest) as AggregatedDataPoint[];

    logger.debug("RESULTS", "Agregacion por mes completada", {
        totalPredictions: predictions.length,
        aggregatedPoints: result.length,
        monthRange: result.length > 0
            ? `${result[0].label} - ${result[result.length - 1].label}`
            : "N/A",
        data: result
    });

    return result;
}


/**
 * Funcion principal que detecta automaticamente la frecuencia temporal y aplica 
 * la agregacion correspondiente
 * 
 * @param predictions - Array de prediccion (ya filtrado por serie)
 * @param horizon - Objeto con la configuracion del horizonte temporal
 * @returns Array de puntos
 */
export function detectAndAggregate(
    predictions: ForecastPrediction[],
    horizon: ForecastHorizon
): AggregatedDataPoint[] {

    if (predictions.length === 0) {
        logger.warn("RESULTS", "No hay predicciones para agregar", { horizon });
        return [];
    }

    logger.info("RESULTS", "Iniciando agrgacion de predicciones", {
        predictionsCount: predictions.length,
        horizonValue: horizon.value,
        horizonUnit: horizon.unit,
    });

    let result: AggregatedDataPoint[];

    switch (horizon.unit) {
        case "days":
            result = aggregateByDayOfWeek(predictions);
            break;

        case "weeks":
            result = aggregateByWeek(predictions);
            break;

        case "months":
            result = aggregateByMonth(predictions);
            break;

        default:
            logger.error("RESULTS", "Unidad temporal no reconocida", {
                unit: horizon.unit,
                validUnits: ["days", "weeks", "months"]
            });
            return [];
    }

    logger.info("RESULTS", "Agregacion completada exitosamente", {
        inputCount: predictions.length,
        outputCount: result.length,
        unit: horizon.unit,
    })

    return result;
}



