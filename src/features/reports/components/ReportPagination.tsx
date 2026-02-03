/**
 * Componente de paginacion para navegar entre paginas del reporte
 */

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Props del componente
 * - currentPage: Pagina actual (1-indexed)
 * - totalPage: Total de paginas disponibles
 * - totalRows: Total de filas en el reporte completo
 * - onPrevPage: Callback cuando se presiona "Anterior"
 * - onNextPage: Callback cuando se presiona "Siguiente"
 */
interface ReportPaginationProps {
    currentPage: number
    totalPage: number
    totalRows: number
    onPrevPage: () => void
    onNextPage: () => void
}

/**
 * Componente de paginacion con botones Anterior/Posterior
 */
export function ReportPagination({
    currentPage,
    totalPage,
    totalRows,
    onPrevPage,
    onNextPage,
}: ReportPaginationProps) {

    if (totalPage <= 1) return null

    const pageSize = 20
    const startRow = (currentPage - 1) * pageSize + 1
    const endRow = Math.min(currentPage * pageSize, totalRows)

    const isPrevDisabled = currentPage <= 1
    const isNextDisabled = currentPage >= totalPage

    return (
        <div className="flex items-center justify-between mt-4">
            {/* INDICADOR DE RANGO */}
            <p className="text-sm text-muted-foreground">
                Mostrando {startRow}-{endRow} de {totalRows} registros
            </p>
            {/* CONTENEDOR DE BOTONES */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={isPrevDisabled}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>
                <span className="px-3 py-2 text-sm font-medium">
                    Página {currentPage} de {totalPage}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={isNextDisabled}
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}