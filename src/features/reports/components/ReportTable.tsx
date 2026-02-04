/**
 * Tabla que muestra filas del reporte de predicciones enriquecidas.
 */

import type { ReportRow } from "@/services/api/types"

/**
 * Props del componente
 * - rows: Array de filas a mostrar (paginadas, max 20)
 * - isLoading: Indica si esta cargando datos
 */
interface ReportTableProps {
    rows: ReportRow[]
    isLoading: boolean
}

/**
 * Componente de tabla para el reporte de predicciones
 */
export function ReportTable({ rows, isLoading }: ReportTableProps) {
    // Estado de carga: Skeleton animado
    if (isLoading) {
        return (
            <div className="space-y-2">
                <div className="h-10 bg-muted/50 rounded animate-pulse" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
                ))}
            </div>
        )
    }

    // Estado vacio: Sin datos
    if (rows.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No hay datos para mostrar. Selecciona un job para cargar el reporte.
            </div>
        )
    }

    // Tabla principal
    return (
        <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Sem</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Región</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Subregión</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Cod Whse</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Whse Nam</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Plaza</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">SKU</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Marca</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Sabor</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Formato</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Botellas</th>
                        <th className="px-3 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                        <th className="px-3 py-3 text-right font-medium text-muted-foreground">Predicción</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((row, index) => (
                        <tr
                            key={`${row.sku}-${row.sem}-${index}`}
                            className="hover:bg-muted/50 transition-colors"
                        >
                            <td className="px-3 py-2 whitespace-nowrap">{row.sem}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.region}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.subregion}</td>
                            <td className="font-mono text-xs">{row.codWhse}</td>
                            <td className="ml-1 text-muted-foreground">{row.whseName}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.plaza}</td>
                            <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{row.sku}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.marca}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.sabor}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.formato}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">{row.botellas}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.tipo}</td>
                            {/* TODO: Revisar si se puede refactorizar en una funcion aparte */}
                            <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-primary">{row.prediccion.toLocaleString("es-PE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}