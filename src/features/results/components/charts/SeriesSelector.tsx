/**
 * Selector reutilizable para elegir series de pronosticos en visualizaciones.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label"

/**
 * Props del componente selector
 * 
 * @property seriesIds - Array de identificadores unicos de series disponibles
 * @property value - ID de la serie seleccionada
 * @property onValueChange - Callback que se ejecuta cuando el usuario selecciona una serie diferente
 *                           Recibe el nuevo seriesId como argumento
 * @property label - (Opcional) Texto descriptivo que aparece encima del selector
 */
interface SeriesSelectorProps {
    seriesIds: string[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
}


/**
 * Componente SeriesSelector
 * 
 * Renderiza un dropdown accesible con todas las series disponibles
 */
export function SeriesSelector({
    seriesIds,
    value,
    onValueChange,
    label = "Seleccionar Serie"
}: SeriesSelectorProps) {

    const hasSeries = seriesIds && seriesIds.length > 0;

    return (
        <div className="space-y-2">
            {/* ETIQUETA DESCRIPTIVA DEL SELECTOR */}
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                { label }
                {/* BADGE INFORMATIVO */}
                {hasSeries && (
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {seriesIds.length} {seriesIds.length === 1 ? "serie" : "series"}
                    </span>
                )}
            </Label>

            {/* SELECT COMPONENT */}
            <Select value={value} onValueChange={onValueChange} disabled={!hasSeries}>
                {/* SELECT TRIGGER */}
                <SelectTrigger className="w-full">
                    {/* SELECT VALUE */}
                    <SelectValue placeholder={!hasSeries ? "No hay series disponibles" : "Selecciona una serie..."} />     
                </SelectTrigger>
                {/* SELECT CONTENT */}
                <SelectContent>
                    {hasSeries && seriesIds.map((id) => (
                        <SelectItem key={id} value={id}>
                            {id}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {!hasSeries && (
                <p className="text-xs text-muted-foreground italic">
                    No se encontraron series para visualizar. Verifica que el pronóstico se haya completado correctamente.
                </p>
            )}

        </div>
    )
}