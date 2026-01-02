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
 * Unidades temporales soportadas para el horizonte de predicci??n
 */
export type TimeUnit = 'days' | 'weeks' | 'months';


/**
 * El horizonte define cu??nto tiempo adelante queremos predecir
 */ 
export interface ForecastHorizon {
    value: number;      // Cantidad de periodos
    unit: TimeUnit;     // Unidad temporal
}


/**
 * Configuraci??n completa del mapping de columnas del dataset
 */
export interface ColumnMapping {
    timestamp: string;              // Columna de fecha/tiempo (obligatorio)
    target: string;                 // Variable a predecir (obligatorio)
    seriesIdentifiers: string[];    // Columnas que identifican series (min 1)
}

/**
 * Configuraci??n completa para enviar al backend
 */
export interface ForecastConfiguration {
    fileId: string;                     // ID del archivo en el backend
    mapping: ColumnMapping;            // Mapeo de columnas
    horizon: ForecastHorizon;     // Horizonte de predicci??n
}

/**
 * Validaciones predefinidas para el horizonte
 * Como gu??a para el usuario
 */
export interface HorizonValidation {
    maxRecommended: number;             // Maximo recomendado de periodos (porcentaje del historico)
    isValid: boolean;                   // ??El valor actual es v??lido?
    warningMessage?: string;            // Mensaje si excede lo recomendado
}


// ===========================================================
// P??GINA DE RESULTADOS ResultsPage.tsx
// ===========================================================

type JobStatus = "queued" | "running" | "completed" | "failed"

export interface ForecastStatusResponse {
    jobId: string;
    status: JobStatus;
    stage: string;
    message?: string | null;
    error?: string | null
}
