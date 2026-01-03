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
    error?: string;
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
    yhat_lower?: number;        // Limite infererior del intervalo
    yhayt_upper?: number;       // Limite superior del intervalo
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
