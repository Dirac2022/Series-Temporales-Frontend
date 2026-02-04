/**
 * Pagina principal de Reportes
 * 
 * Permite al usuario:
 * 1. Seleccionar un job (pronostico) de la lista
 * 2. Ver la tabla paginada con datos enriquecidos
 * 3. Exportar el reporte completo a Excel 
 */

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Table as TableIcon, FileSpreadsheet } from "lucide-react"
import { ReportTable } from "../components/ReportTable"
import { ReportPagination } from "../components/ReportPagination"
import { ExportExcelButton } from "../components/ExportExcelButton"
import { JobSelector } from "../components/JobSelector"
import { useReportPredictions } from "../hooks/useReportPredictions"
import { reportService } from "@/services/api/reportService"
import { logger } from "@/services/logger"
import { handleError } from "@/lib/errors"
import type { JobSummary } from "@/services/api/types"

//  TODO: Agregar a constantes o hacer algo mejor
const TENANT_ID = "00000000-0000-0000-0000-000000000000"

/**
 * Componente principal de la pagina de Reportes
 */
export default function ReportPage() {

    const [jobs, setJobs] = useState<JobSummary[]>([])
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [isLoadingJobs, setIsLoadingJobs] = useState(true)
    const [jobsError, setJobsError] = useState<string | null>(null)

    // Hook para manejar datos del reporte y la paginacion
    const {
        allRows,
        visibleRows,
        currentPage,
        totalPage,
        isLoading: isLoadingReport,
        error: reportError,
        fetch: fetchReport,
        nextPage,
        prevPage,
    } = useReportPredictions()


    // Cargar lista de jobs al montar
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setIsLoadingJobs(true)
                setJobsError(null)

                logger.info("REPORTS", "Cargando lista de jobs disponibles")
                const response = await reportService.getJobs(TENANT_ID)
                setJobs(response.jobs)
                logger.info("REPORTS", "Jobs cargados exitosamente", { count: response.jobs.length })

            } catch (error) {
                const appError = handleError(error, "REPORTS", "Load jobs")
                setJobsError(appError.message)
                logger.error("REPORTS", "Error al cargar jobs", { error: appError.message })

            } finally {
                setIsLoadingJobs(false)
            }
        }

        loadJobs()
    }, [])

    // Handler cuando el usuario selecciona un job
    const handleSelectJob = useCallback((jobId: string) => {
        setSelectedJobId(jobId)
        logger.info("REPORTS", "Job seleccionado, cargando reporte", { jobId })
        fetchReport(jobId, TENANT_ID)
    }, [fetchReport])

    if (isLoadingJobs) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando pronósticos disponibles...</p>
            </div>
        )
    }

    if (jobsError) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-lg font-medium text-destructive">
                    Error al cargar pronósticos
                </p>
                <p className="text-sm text-muted-foreground">
                    {jobsError}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* HEADER DE LA PAGINA */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Reportes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Genera y descarga reportes de predicciones en Excel
                        </p>
                    </div>
                </div>
                {allRows.length > 0 && (
                    <ExportExcelButton
                        rows={allRows}
                        disabled={isLoadingReport}
                    />
                )}
            </div>
            {/* CARD CON SELECTOR DE JOB */}
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Pronóstico</CardTitle>
                    <CardDescription>
                        Elige un pronóstico completado para ver y exportar su reporte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <JobSelector
                        jobs={jobs}
                        selectedJobId={selectedJobId}
                        onSelectJob={handleSelectJob}
                        isLoading={isLoadingJobs}
                    />
                </CardContent>
            </Card>

            {/* CARD CON TABLA Y PAGINACION*/}
            {selectedJobId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="h-5 w-5" />
                            Datos del Reporte
                        </CardTitle>
                        <CardDescription>
                            {isLoadingReport
                                ? "Cargando datos..."
                                : allRows.length > 0
                                    ? `${allRows.length} registros totales`
                                    : "Sin datos disponibles"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {reportError && (
                            <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
                                Error: {reportError.message}
                            </div>
                        )}
                        <ReportTable
                            rows={visibleRows}
                            isLoading={isLoadingReport}
                        />
                        <ReportPagination
                            currentPage={currentPage}
                            totalPage={totalPage}
                            totalRows={allRows.length}
                            onPrevPage={prevPage}
                            onNextPage={nextPage}
                        />
                    </CardContent>
                </Card>
            )}
            {/* CUANDO NO HAY JOB SELECCIONADO */}
            {!selectedJobId && jobs.length > 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground italic">
                            Selecciona un pronóstico para ver el reporte
                        </p>
                    </CardContent>
                </Card>
            )}
            {/* NO HAY JOBS DISPONIBLES */}
            {jobs.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                        <p className="text-lg font-medium">
                            No hay pronósticos disponibles
                        </p>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Ejecuta un pronóstico desde la página "Generar Predicción" para poder generar reportes
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}