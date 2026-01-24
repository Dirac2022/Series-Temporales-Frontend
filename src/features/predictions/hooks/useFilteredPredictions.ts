/**
 * Hook para consumir el endpoint GET /predictions/filtered
 * 
 * USO:
 * ```tsx
 * const { data, isLoading, error, fetch, clear } = useFilteredPredictions()
 *
 * const handleSearch = () => {
 *   fetch({ warehouse_code: '100306', product_code: '508462' })
 * }
 */
import { useState, useCallback } from "react"
import { seriesService } from "../../../services/api/seriesService"
import { handleError, type AppError } from "../../../lib/errors"
import { logger } from "../../../services/logger"
import type { PredictionFilterParams, ForecastPrediction, ForecastPredictionResponse } from "../../../services/api/types"

/**
 * Define lo que retorna el hook
 */
interface useFilteredPredictionsReturn {
    data: ForecastPredictionResponse
    isLoading: boolean
    error: AppError | null
    fetch: (params: PredictionFilterParams) => Promise<void>
    clear: () => void
}

export function useFilteredPredictions(): useFilteredPredictionsReturn {
    const [data, setData] = useState<ForecastPrediction[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<AppError | null>(null)

    const fetch = useCallback(async (params: PredictionFilterParams) => {
        setIsLoading(true)
        setError(null)

        try {
            logger.info("PREDICTIONS", "Buscando predicciones filtradas", { params })
            const response = await seriesService.getFilteredPredictions(params)
            setData(response)
            logger.info("PREDICTIONS", "Predicciones obtenidas", {
                count: response.length,
                params,
            })

        } catch (err) {
            const appError = handleError(err, "PREDICTIONS", "Fetch filtered predictions")
            setError(appError)
            setData([])

            logger.error("PREDICTIONS", "Error buscando prediccioens", {
                error: appError.message,
                params,
            })

        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * Limpia el estado
     */
    const clear = useCallback(() => {
        setData([])
        setError(null)
        logger.debug("PREDICTIONS", "Estado de prediccioens limpiado")
    }, [])

    return {
        data,
        isLoading,
        error,
        fetch,
        clear,
    }
}