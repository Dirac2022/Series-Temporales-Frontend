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




// ===========================================================

/**
 * =================================================================================================
 * TIPOS PARA SERVICIOS DE API
 * =================================================================================================
 * 
 * Define los tipos de request y response para todas las llamadas al backend
 */


/**
 * Response del endpoint POST /upload
 * El backend procesa el archivo y devuelve metadatos
 */
export interface UploadResponse {
    fileId: string;             // ID único del archvivo en el servidor
    columns: string[];          // Columnas detectadas en el archivo
    rowCount: number;           // Cantidad de filas
    message: string;            // Mensaje de confirmación
}


/**
 * Response del endpoint POST /forecast
 * 
 * Inicia un trabajo de forecasting en background
 */
export interface ForecastStartResponse {
    jobId: string;              // ID del trabajo creado
    message: string;            // Mensaje de confirmación
}


/**
 * Status de un trabajo de forecasting
 */
export type ForecastJobStatus = "queued" | "running" | "completed" | "failed";


/**
 * Consulta el estado actual de un trabajo
 */
export interface ForecastStatusResponse {
    jobId: string;
    status: ForecastJobStatus;
    stage: string;              // Etapa actual (preprocessing, training, etc)
    message?: string | null;
    error?: string | null;
    updatedAt: string;          // ISO timestamp de última actualización
}


/**
 * Métricas de error del modelo
 */
export interface ForecastMetrics {
    mae?: number;
    rmse?: number;
    mape?: number;
    wape?: number;
}


/**
 * Una predicción individual
 */
export interface ForecastPrediction {
    unique_id: string;          // ID de la serie temporal
    ds: string;                 // Fecha (date string)
    yhat: number;               // Valor predicho

    // Intervalos de confianza (opcionales)
    y_lower?: number;        // Limite infererior del intervalo
    y_upper?: number;       // Limite superior del intervalo
    confidence_level?: number;    
}


/**
 * Punto de datos históricos
 */
export interface HistoricalDataPoint {
    unique_id: string;
    ds: string;
    y: number;
}


/**
 * Response del endpoint GET /forecast/{jobId}
 */
export interface ForecastResultResponse {
    jobId: string;
    status: ForecastJobStatus;
    seriesIds: string[];
    metrics: ForecastMetrics;
    predictions: ForecastPrediction[];

    history: HistoricalDataPoint[];

    // Datos opcionales
    // Esto podría ser útil
    modelInfo?: {
        modelType: string;          // Modelo usado (NBEATS, TFT, etc.)
        trainedAt: string;          // ISO timestamp
        trainingDuration?: number   // Duración
    }
}
