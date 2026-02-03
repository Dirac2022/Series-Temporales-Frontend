/**
 * Pagina principal para el reporte enriquecido de predicciones
 * Integra ReportTable, ReportPagination y ExportExcelButton
 */

import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Table as TableIcon } from "lucide-react"
import { ReportTable } from "../components/ReportTable"
import { ReportPagination } from "../components/ReportPagination"
import { ExportExcelButton } from "../components/ExportExcelButton"
import { useReportPredictions } from "../hooks/useReportPredictions"
import { logger } from "@/services/logger"

// TODO: Por mejorar
const TENANT_ID = "00000000-0000-0000-0000-000000000000"

/**
 * Componente principal de la pagina de reporte Excel
 */
export default function ExcelReportPage() {
    const { jobId } = useParams<{ jobId: string }>()

    // Hook que maneja el estado del reporte y paginacion
    const {
        allRows,
        visibleRows,
        currentPage,
        totalPage,
        isLoading,
        error,
        fetch,
        nextPage,
        prevPage
    } = useReportPredictions()

    // Para cargar datos cuando el componente monta o jobId cambia
    useEffect(() => {
        if (!jobId) {
            logger.warn("REPORTS", "No se proporciono jobId en la URL")
            return
        }

        logger.info("REPORTS", "Iniciando carga de reporte", { jobId })
        fetch(jobId, TENANT_ID)
    }, [jobId, fetch])

    // Estado de carga
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando reporte...</p>
            </div>
        )
    }

    // Estado de error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-lg font-medium text-destructive">
                    Error al cargar el reporte
                </p>
                <p className="text-sm text-muted-foreground">
                    {error.message}
                </p>
                <Button asChild variant="outline">
                    <Link to="/">Volver al inicio</Link>
                </Button>
            </div>
        )
    }

    // Sin jobId
    if (!jobId) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-lg font-medium">
                    No se especificó un job para el reporte
                </p>
                <Button asChild variant="outline">
                    <Link to="/">Volver al inicio</Link>
                </Button>
            </div>
        )
    }

    // Principal
    return (
        <div className="space-y-6">
            {/* NAVEGACION SUPERIOR */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Reporte de predicciones
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Job: {jobId}
                        </p>
                    </div>
                </div>
                {/* BOTON PARA EXPORTAR EXCEL */}
                <ExportExcelButton
                    rows={allRows}
                    disabled={allRows.length === 0}
                />
            </div>
            {/* CARD CON TABLA Y PAGINACION */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        Reporte
                    </CardTitle>
                    <CardDescription>
                        {allRows.length > 0 ? `${allRows.length} registros totales` : "Sin datos disponibles"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ReportTable
                        rows={visibleRows}
                        isLoading={isLoading}
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
        </div>
    )
}