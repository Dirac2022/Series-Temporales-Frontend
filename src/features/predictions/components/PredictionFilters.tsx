/**
 * Formulario de filtros para GET /predictions/filtered
 * - 6 campos predefinidos segun el endpoint
 * - Validacion: al menos un campo debe tener valor
 */

import React, { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Label } from "../../../components/ui/label"
import { logger } from "../../../services/logger"
import type { PredictionFilterParams } from "../../../services/api/types"

/**
 * Props del componente
 */
interface PredictionFiltersProps {
    onSearch: (params: PredictionFilterParams) => void
    onClear: () => void
    isLoading?: boolean
}

/**
 * Configuracion de los campos de filtr
 */
const FILTER_FIELDS = [
    { key: "warehouse_code", label: "Código Almacén", placeholder: "ej: 100306" },
    { key: "product_code", label: "Código Producto", placeholder: "ej: 508462" },
    { key: "channel_code", label: "Código Canal", placeholder: "ej: 2" },
    { key: "acct_code", label: "Código Cuenta", placeholder: "ej: 100321" },
    { key: "territory_code", label: "Código Territorio", placeholder: "ej: 801" },
    { key: "dist_code", label: "Código Distribución", placeholder: "ej: 99999" },
] as const

/**
 * Componente principal
 */
export function PredictionFilters({
    onSearch,
    onClear,
    isLoading = false
}: PredictionFiltersProps) {

    const [values, setValues] = useState<PredictionFilterParams>({})

    const handleChange = (key: keyof PredictionFilterParams, value: string) => {
        // Restriccion: Solo permitir digitos numericos
        const numericValue = value.replace(/[^0-9]/g, "")

        setValues((prev) => ({
            ...prev,
            [key]: numericValue || undefined
        }))
    }

    const hasFilters = Object.values(values).some((v) => v && v.trim() !== "")

    // Maneja submit del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasFilters) return
        const cleanParams: PredictionFilterParams = {}
        Object.entries(values).forEach(([key, val]) => {
            if (val && val.trim()) {
                cleanParams[key as keyof PredictionFilterParams] = val.trim()
            }
        })
        logger.info("UI", "Filtros de prediccion aplicados", { params: cleanParams })
        onSearch(cleanParams)
    }

    // Limpia todos los campos
    const handleClear = () => {
        setValues({})
        onClear()
        logger.debug("UI", "Filtros de prediccion limpiados")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* GRID DE CAMPOS DE FILTRO */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FILTER_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                            id={key}
                            type="text"
                            placeholder={placeholder}
                            value={values[key as keyof PredictionFilterParams] || ""}
                            onChange={(e) => handleChange(key as keyof PredictionFilterParams, e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                ))}
            </div>
            {/* BOTONES DE ACCION */}
            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={!hasFilters || isLoading}
                    className="flex-1"
                >
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? "Buscando..." : "Buscar Predicciones"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    disabled={isLoading}
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                </Button>
            </div>
        </form>
    )
}