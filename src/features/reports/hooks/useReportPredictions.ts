/**
 * Hook para consumir reportService y manejar paginacion de 20 en 20
 * 
 * USO:
 * ```tsx
 * const {
 *   allRows,
 *   visibleRows,
 *   currentPage,
 *   totalPage,
 *   isLoading,
 *   error,
 *   fetch,
 *   nextPage,
 *   prevPage
 * } = useReportPredictions()
 * 
 * const handleLoad = () => fetch(jobId, tenantId)
 * ```
 */
import { useState, useCallback, useMemo } from "react"
import { reportService } from "@/services/api/reportService"
import { handleError, type AppError } from "@/lib/errors"
import { logger } from "@/services/logger"
import type { ReportRow } from "@/services/api/types"

const PAGE_SIZE = 20

/**
 * Interfaz que define lo que retorna el hook
 */
interface UseReportPredictionsReturn {
    allRows: ReportRow[]            // Todas las filas caragadas del backend
    visibleRows: ReportRow[]        // Filas visilbes en la pagina actual
    currentPage: number
    totalPage: number
    isLoading: boolean
    error: AppError | null
    fetch: (jobId: string, tenantId: string) => Promise<void>
    nextPage: () => void
    prevPage: () => void
}

/**
 * Hook principal para manejo de reportes con paginacion
 */
export function useReportPredictions(): UseReportPredictionsReturn {
    const [allRows, setAllRows] = useState<ReportRow[]>([])
    const [currentPage, SetCurrentPage] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<AppError | null>(null)

    const totalPage = useMemo(() => {
        if (allRows.length == 0) return 0
        return Math.ceil(allRows.length / PAGE_SIZE)
    }, [allRows.length])

    const visibleRows = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE
        const endIndex = startIndex + PAGE_SIZE
        return allRows.slice(startIndex, endIndex)
    }, [allRows, currentPage])

    const fetch = useCallback(async (jobId: string, tenantId: string) => {
        setIsLoading(true)
        setError(null)

        try {
            logger.info("REPORTS", "Obteniendo reporte de predicciones", { jobId })
            const response = await reportService.getReportPredictions(jobId, tenantId)
            setAllRows(response.rows)
            SetCurrentPage(1)
            logger.info("REPORTS", "Reporte cargado exitosamente", {
                totalRows: response.totalRows,
                pages: Math.ceil(response.rows.length / PAGE_SIZE)
            })

        } catch (err) {
            const appError = handleError(err, "REPORT", "Fetch report predictions")
            setError(appError)
            setAllRows([])
            logger.error("REPORT", "Error obteniendo reporte", {
                error: appError.message,
                jobId
            })

        } finally {
            setIsLoading(false)
        }
    }, [])


    // Avanza pagina
    const nextPage = useCallback(() => {
        SetCurrentPage(prev => {
            if (prev >= totalPage) return prev
            return prev + 1
        })
    }, [totalPage])

    // Retrocede pagina
    const prevPage = useCallback(() => {
        SetCurrentPage(prev => {
            if (prev <= 1) return prev
            return prev - 1
        })
    }, [])

    return {
        allRows,
        visibleRows,
        currentPage,
        totalPage,
        isLoading,
        error,
        fetch,
        nextPage,
        prevPage,
    }
}