import * as React from "react"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Info } from "lucide-react"

interface SeriesIdentifierSelectorProps {
    availableColumns: string [];
    excludedColumns: string[];      // Columnas que no se pueden seleccionar (timestamp y target)
    selectedColumns: string[];
    onSelectionChange: (columns: string[]) => void;
}


export function SeriesIdentifierSelector({
    availableColumns, 
    excludedColumns,
    selectedColumns,
    onSelectionChange
} : SeriesIdentifierSelectorProps) {

    // Filtra las columnas que el usuario puede seleccionar
    const selectableColumns = availableColumns.filter(
        col => !excludedColumns.includes(col)
    );

    // Majeo de cilck en una columna
    // Si la columna esta seleccionada -> se quita la selección
    // Si la columna no esta seleccionada -> Se selecciona
    const toggleColumn = (column: string) => {
        if (selectedColumns.includes(column)) {
            onSelectionChange(selectedColumns.filter(col => col !== column));
        } else {
            onSelectionChange([...selectedColumns, column]);
        }
    };

    const estimatedSeriesCount = selectedColumns.length > 0 ? Math.pow(10, selectedColumns.length) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Identificadores de Serie</CardTitle>
                <CardDescription>Selecciona las columnas que identifican cada serie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mensaje informativo con icono */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-medium mb-1">Se generará una predicción por cada combinación única</p>
                        <p className="text-blue-700 dark:text-blue-300">
                            {selectedColumns.length == 0 && "Selecciona al menos una columna para continuar"}
                            {selectedColumns.length == 1 && `Ejemplo: Una predicción por cada ${selectedColumns[0]} único`}
                            {selectedColumns.length >= 2 && `Ejemplo: Una predicción por cada combinación de ${selectedColumns.join(' + ')}`}
                        </p>
                    </div>
                </div>
                {/* Grid de columnas seleccionables */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectableColumns.map(column => {
                        const isSelected = selectedColumns.includes(column);
                        return (
                            <Button
                                key={column}
                                onClick={() => toggleColumn(column)}
                                variant={isSelected ? 'default': 'secondary'}
                                size='sm'
                                type='button'
                                className="w-full"
                            >
                                {column}
                            </Button>
                        );
                    })}
                </div>

                {/* Resumen de selección */}
                {selectedColumns.length > 0 && (
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            {/* Lado izquierdo: Columnas seleccionadas */}
                            <div className="flex flex-wrap gap-1">
                                <Label className="text-xs text-muted-foreground mr-2">
                                    Seleccionadas:
                                </Label>
                                {selectedColumns.map(col => (
                                    <Badge key={col} variant="secondary" className="text-xs">
                                        {col}
                                    </Badge>
                                ))}
                            </div>
                            {/* Lado izquierdo: Estimacion de la cantidad de series */}
                            {/* <div className="text-xs text-muted-foreground">
                                ~{estimatedSeriesCount.toLocaleString()} series estimadas
                            </div> */}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
