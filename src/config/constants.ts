/**
 * CONSTANTES DE LA APLICACIÓN
 */


/**
 * Claves de localStorage
 */
export const STORAGE_KEYS = {
    LAST_FORECAST_JOB: "lastForecastJobId",
    THEME: "forecast-ui-theme",
    FORECAST_METADATA: "forecast_metadata",
    FORECAST_FILENAME: "forecast_filename",
    FORECAST_MAPPING: "forecast_mapping",
    FORECAST_SERIES_IDS: "forecast_series_identifiers",
    FORECAST_HORIZON: "forecast_horizon"
} as const;


/**
 * Configuración de polling para status de forecsat
 * Usado en ReusltsPage
 */
export const POLLING = {
    INTERVAL_MS: 2000,         // Consultar cada 2 segundos
} as const;


/**
 * Conversion de unidades temporales a dias
 * Usado en ForecastingPage
 */
export const DAY_EQUIVALENCE = {
    days: 1,
    weeks: 7,
    months: 30,
} as const;


/**
 * Label en español para unidades temporales
 */
export const UNIT_LABELS = {
    days: "dias",
    weeks: "semanas",
    months: "meses",
} as const;


/**
 * Validación de horizonte de predicción
 */
export const VALIDATION = {
    MAX_HORIZON_PERCENTAGE: 0.1,    // 10% dataset
} as const;


/**
 * URLs base del API
 */
export const API = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
} as const;

/**
 * Constantes de ReportPage
 */
export const REPORT = {
    MAX_ROWS_DISPLAYED: 20,
}