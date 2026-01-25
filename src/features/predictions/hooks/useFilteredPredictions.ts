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
import { useState, useCallback, useEffect } from "react"
import { seriesService } from "../../../services/api/seriesService"
import { handleError, type AppError } from "../../../lib/errors"
import { logger } from "../../../services/logger"
import type { PredictionFilterParams, ForecastPrediction, ForecastPredictionResponse } from "../../../services/api/types"

const STORAGE_KEY = "predictions_filtered_data"
const STORAGE_FILTERS_KEY = "predictions_filtered_params"

function getFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const stored = sessionStorage.getItem(key)
        if (!stored) return defaultValue
        return JSON.parse(stored) as T

    } catch (error) {
        logger.error("STORAGE", `Error leyendo ${key} de sessionStorage`, { error })
        return defaultValue
    }
}

function saveToStorage<T>(key: string, value: T): void {
    try {
        sessionStorage.setItem(key, JSON.stringify(value))

    } catch (error) {
        logger.error("STORAGE", `Error guardando ${key} en sessionStorage`, { error })
    }
}

function removeFromStorage(key: string): void {
    try {
        sessionStorage.removeItem(key)

    } catch (error) {
        logger.error("STORAGE", `Error eliminado ${key} de sessionStorage`, { error })
    }
}

/**
 * Define lo que retorna el hook
 */
interface useFilteredPredictionsReturn {
    data: ForecastPredictionResponse
    lastParams: PredictionFilterParams | null
    isLoading: boolean
    error: AppError | null
    fetch: (params: PredictionFilterParams) => Promise<void>
    clear: () => void
}

export function useFilteredPredictions(): useFilteredPredictionsReturn {

    const [data, setData] = useState<ForecastPrediction[]>(
        () => getFromStorage(STORAGE_KEY, [])
    )
    const [lastParams, setLastParams] = useState<PredictionFilterParams | null>(
        () => getFromStorage(STORAGE_FILTERS_KEY, null)
    )

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<AppError | null>(null)


    /**
     * Evita limpiar storage innecesariamente
     */
    useEffect(() => {
        if (data.length > 0) {
            saveToStorage(STORAGE_KEY, data)
            logger.debug("STORAGE", "Predicciones guardadas en sessionStorage", { count: data.length })
        }
    }, [data])

    const fetch = useCallback(async (params: PredictionFilterParams) => {
        setIsLoading(true)
        setError(null)

        try {
            logger.info("PREDICTIONS", "Buscando predicciones filtradas", { params })
            const response = await seriesService.getFilteredPredictions(params)
            setData(response)
            setLastParams(params)
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
     * Limpia el estado y el sessionStorage
     */
    const clear = useCallback(() => {
        setData([])
        setLastParams(null)
        setError(null)
        removeFromStorage(STORAGE_KEY)
        removeFromStorage(STORAGE_FILTERS_KEY)
        logger.debug("PREDICTIONS", "Estado de predicciones limpiado (junto con sessionStorage)")
    }, [])

    return {
        data,
        lastParams,
        isLoading,
        error,
        fetch,
        clear,
    }
}