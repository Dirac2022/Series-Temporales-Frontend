/**
 * Representa la respuesta del backend tras procesar el archivo.
 * No recibimos el dataset completo, solo metadados para la UI
 */
export interface BackendFileResponse {
    fileId: string;
    columns: string[];
    rowCount: number;
}

/**
 * Unidades temporales soportadas para el horizonte de predicción
 */
export type TimeUnit = 'days' | 'weeks' | 'months';


/**
 * El horizonte define cuánto tiempo adelante queremos predecir
 */ 
export interface ForecastHorizon {
    value: number;      // Cantidad de periodos
    unit: TimeUnit;     // Unidad temporal
}


/**
 * Configuración completa del mapping de columnas del dataset
 */
export interface ColumnMapping {
    timestamp: string;              // Columna de fecha/tiempo (obligatorio)
    target: string;                 // Variable a predecir (obligatorio)
    seriesIdentifiers: string[];    // Columnas que identifican series (min 1)
}

/**
 * Configuración completa para enviar al backend
 */
export interface ForecastConfiguration {
    fileId: string;                     // ID del archivo en el backend
    mappging: ColumnMapping;            // Mapeo de columnas
    horizon: ForecastConfiguration;     // Horizonte de predicción
}

/**
 * Validaciones predefinidas para el horizonte
 * Como guía para el usuario
 */
export interface HorizonValidation {
    maxRecommended: number;             // Máximo recomendado de periodos (20% del histórico)
    isValid: boolean;                   // ¿El valor actual es válido?
    warningMessage?: string;            // Mensaje si excede lo recomendado
}