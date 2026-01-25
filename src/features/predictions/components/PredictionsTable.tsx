/**
 * Tabla que muestra predicciones con paginacion interna
 */
import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import type { ForecastPrediction } from "../../../services/api"

/**
 * Props del componente
 */
interface PredictionsTableProps {
    predictions: ForecastPrediction[]
    pageSize?: number
}

/**
 * Componente principal
 */
export function PredictionsTable({
    predictions,
    pageSize = 10,
}: PredictionsTableProps) {

    const [page, setPage] = useState<number>(0)

    // Ordenar predicciones por fecha
    const sortedPredictions = useMemo(() => {
        return [...predictions].sort(
            (a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime()
        )
    }, [predictions])

    // Calcular paginacion
    const totalPages = Math.ceil(sortedPredictions.length / pageSize)
    const startIdx = page * pageSize
    const endIdx = Math.min(startIdx + pageSize, sortedPredictions.length)
    const currentData = sortedPredictions.slice(startIdx, endIdx)

    const formatDate = (value: string) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return date.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Navegacion
    const hasPrev = page > 0
    const hasNext = page < totalPages - 1

    // Si no hay datos
    if (predictions.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            {/* TABLA */}
            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                            <th className="px-4 py-3 text-left font-medium">Serie</th>
                            <th className="px-4 py-3 text-center font-medium">Predicción</th>
                            <th className="px-4 py-3 text-center font-medium">Límite Inf.</th>
                            <th className="px-4 py-3 text-center font-medium">Límite Sup.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentData.map((pred, idx) => (
                            <tr key={`${pred.unique_id}-${pred.ds}-${idx}`} className="hover:bg-muted/50">
                                <td className="px-4 py-3 font-mono text-xs">
                                    {formatDate(pred.ds)}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {pred.unique_id}
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-semibold text-primary">
                                    {pred.yhat.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                                    {pred.y_lower.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                                    {pred.y_upper.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* CONTROLES DE PAGINACION */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {startIdx + 1}-{endIdx} de {sortedPredictions.length}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={!hasNext}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )



}