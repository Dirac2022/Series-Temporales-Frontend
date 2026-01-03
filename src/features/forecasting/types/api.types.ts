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
 * Unidades temporales soportadas para el horizonte de prediccion
 */
export type TimeUnit = 'days' | 'weeks' | 'months';


/**
 * El horizonte define cuanto tiempo adelante queremos predecir
 */ 
export interface ForecastHorizon {
    value: number;      // Cantidad de periodos
    unit: TimeUnit;     // Unidad temporal
}


/**
 * Configuracion completa del mapping de columnas del dataset
 */
export interface ColumnMapping {
    timestamp: string;              // Columna de fecha/tiempo (obligatorio)
    target: string;                 // Variable a predecir (obligatorio)
    seriesIdentifiers: string[];    // Columnas que identifican series (min 1)
}

/**
 * Configuracion completa para enviar al backend
 */
export interface ForecastConfiguration {
    fileId: string;                     // ID del archivo en el backend
    mapping: ColumnMapping;            // Mapeo de columnas
    horizon: ForecastHorizon;     // Horizonte de prediccion
}

/**
 * Validaciones predefinidas para el horizonte
 * Como guia para el usuario
 */
export interface HorizonValidation {
    maxRecommended: number;             // Maximo recomendado de periodos (porcentaje del historico)
    isValid: boolean;                   // El valor actual es valido?
    warningMessage?: string;            // Mensaje si excede lo recomendado
}


// ===========================================================
// PAGINA DE RESULTADOS ResultsPage.tsx
// ===========================================================

type JobStatus = "queued" | "running" | "completed" | "failed"

export interface ForecastStatusResponse {
    jobId: string;
    status: JobStatus;
    stage: string;
    message?: string | null;
    error?: string | null
}
