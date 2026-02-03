/**
 * Boton para exportar el reporte completo a un archivo Excel
 */
import { useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { ReportRow } from "@/services/api/types"
import { logger } from "@/services/logger"
import { handleError } from "@/lib/errors"

/**
 * Props del componente
 * - rows: Todas las filas del reporte
 * - disabled: Si el obton debe estar deshabilitado
 */
interface ExportExcelButtonProps {
    rows: ReportRow[]
    disabled?: boolean
}

/**
 * Componente del boton para exportar a Excel
 */
export function ExportExcelButton({
    rows,
    disabled = false
}: ExportExcelButtonProps) {

    const [isExporting, setIsExporting] = useState(false)

    /**
     * Funcion que genera y descarga el archivo Excel
     * Se ejecuta cuando el usuario hace click en el boton
     */
    const handleExport = async () => {
        if (rows.length === 0) return
        setIsExporting(true)

        try {
            logger.info("REPORTS", "Iniciando exportacion a Excel", { totalRows: rows.length })
            await new Promise(resolve => setTimeout(resolve, 300))

            const excelData = rows.map(row => ({
                "Semana": row.sem,
                "Región": row.region,
                "Subregión": row.subregion,
                "Cod Whse": row.codWhse,
                "Whse Nam": row.whseName,
                "Plaza": row.plaza,
                "SKU": row.sku,
                "Marca": row.marca,
                "Sabor": row.sabor,
                "Formato": row.formato,
                "Botellas": row.botellas,
                "Tipo": row.tipo,
                "Prediccion": row.prediccion,
            }))

            const worksheet = XLSX.utils.json_to_sheet(excelData)
            const workbook = XLSX.utils.book_new()
            // TODO: Quitar nombre de hoja "Predicciones"
            XLSX.utils.book_append_sheet(workbook, worksheet, "Predicciones")
            const today = new Date().toISOString().split("T")[0]
            const filename = `reporte_predicciones_${today}.xlsx`
            XLSX.writeFile(workbook, filename)

        } catch (error) {
            const appError = handleError(error, "REPORTS", "Export Excel")
            logger.error("REPORTS", "Error al exportar Excel", { error: appError.message })

        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            variant="default"
            onClick={handleExport}
            disabled={isExporting || disabled || rows.length === 0}
        >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar Excel"}
        </Button>
    )
}