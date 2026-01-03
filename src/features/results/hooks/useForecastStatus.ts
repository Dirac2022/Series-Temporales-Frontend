/**
 * Hook para consultar el estado de un forecast con polling automático
 * 
 * Consulta el estado cada 2 segundos (POLLING.INTERVAL_MS)
 * Se detiene automáticamente cuando:
 *  - El forecast esta 'completed' o 'failed'
 *  - El componente se desmonta
 *  - El jobId cambia o se vuelve null
 * Loggea automáticamente cambios de estado
 * 
 * USO:
 * ```typescript
 * const { status, isLoading, error } = useForecastStatus(jobId);
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 * if (status?.status === 'completed') {
 *   // Mostrar resultados
 * }
 * ```
 */

import { useState, useEffect, useRef } from "react";
import { forecastService } from "../../../services/api";
import { logger } from "../../../services/logger";
import { handleError, AppError } from "../../../lib/errors";
import { POLLING } from "../../../config/constants";
import type { ForecastStatusResponse } from "../../../services/api";


/**
 * Opciones del hook
 */
interface UseForecastStatusOptions {
    /**
     * Intervalo de polling en milisegundos
     * Default: 200ms (2 segundos)
     */
    interval?: number;

    /**
     * Si debe hacer polling automáticamente
     * Default: true
     */
    enabled?: boolean;

    /**
     * Callback cuando el status cambia
     */
    onStatusChange?: (status: ForecastStatusResponse) => void;
}


/**
 * Valor de retorno del hook
 */
interface UseForecastStatusReturn {
    /**
     * Estado actual del forecast
     * null si aú no se ha consultado o si jobId es null
     */
    status: ForecastStatusResponse | null;

    isLoading: boolean;

    error: AppError | null;

    /**
     * Función para refrescar manualmente
     */
    refetch: () => Promise<void>;
}


/**
 * Hook principal
 * 
 * @param jobId - ID del forecast a consultar (null para no consultar)
 * @param options - Opciones de configuración
 * @returns Estado, loading, error y función refetch
 */
export function useForecastStatus(
    jobId: string | null,
    options: UseForecastStatusOptions = {}
): UseForecastStatusReturn {
    
    // Desestructurar opciones con valores por defecto
    const {
        interval = POLLING.INTERVAL_MS,
        enabled = true,
        onStatusChange,
    } = options;

    // Estado del hook
    const [status, setStatus] = useState<ForecastStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<AppError | null>(null);

    // Ref para el timer del polling
    const timerRef = useRef<number | undefined>(undefined);

    // Ref para el tracking del último status
    // Para detectar cambios y llamar onStatusChange
    const lastStatusRef = useRef<string | null>(null);

    // Función que hace la consulta al API
    const fetchStatus = async () => {
        if (!jobId) {
            setIsLoading(false);
            return;
        }

        try {
            // Consultar API usando el servicio
            const data = await forecastService.getForecastStatus(jobId);

            // Actualizar estado
            setStatus(data);
            setError(null);
            setIsLoading(false);

            if (onStatusChange && data.status !== lastStatusRef.current) {
                onStatusChange(data);
                lastStatusRef.current = data.status;
            }

            // Si terminó (completed o failed), detener polling
            if (data.status === "completed" || data.status === "failed") {
                if (timerRef.current) {
                    window.clearInterval(timerRef.current)
                    timerRef.current = undefined;
                }
                
                logger.info("RESULTS", `Polling detenido: forecast ${data.status}`, {
                    jobId,
                    finalStatus: data.status,
                });
            }

        } catch (error) {
            const appError = handleError(error, "RESULTS", "Fetch forecast status");
            setError(appError);
            setIsLoading(false);

            // Detener polling en caso de error
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = undefined;
            }
        }
    };


    /**
     * Función para refrescar manualmente
     */
    const refetch = async () => {
        setIsLoading(true);
        setError(null);
        await fetchStatus();
    };


    /**
     * Effect principal: Setup y cleanup del polling
     */
    useEffect(() => {
        // No hacer nada si está deshabilitado o no hay jobId
        if (!enabled || !jobId) {
            setIsLoading(false);
            return;
        }

        logger.debug("RESULTS", "Iniciando polling de forecast status", {
            jobId,
            interval,
        });

        // Llamada inicial inmediata
        fetchStatus();

        // Setup del intervalo para polling
        timerRef.current = window.setInterval(fetchStatus, interval);

        // Limpiar interval cuando el componente se desmonta o cambian las dependencias
        return () => {
            if (timerRef.current) {
                logger.debug("RESULTS", "Limpiando polling de forecast status", {
                    jobId,
                });
                window.clearInterval(timerRef.current);
                timerRef.current = undefined;
            }
        };
    }, [jobId, enabled, interval]);

    return {
        status,
        isLoading,
        error,
        refetch,
    };

}