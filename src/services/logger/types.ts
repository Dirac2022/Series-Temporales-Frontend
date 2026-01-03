// Niveles de severidda de log logs
export type LogLevel = "debug" | "info" | "warn" | "error"

/**
 * Modulos principales de la aplicación
 * Permite filtrar logs por área funcional
 */
export type LogModule = 
    | "API"             // Llamadas HTTP y comunicación con backend
    | "UI"              // Interacciones de interfaz de usuario
    | "STORAGE"         // Operacioens con localstorage
    | "VALIDATION"      // Validaciones de datos
    | "FORECAST"        // Logica de forecasting (Forecasting)
    | "RESULTS"         // Logica de resultados (Results)
    | "REPORT"          // Reporte
    | "APP"             // Eventos generales de la aplicacion

/**
 * Estructura de un log entry
 * Toda entrada de log debe seguir este formato
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: LogModule;
    message: string;
    data?: unknown;               // Datos adicionales (objetos, errores, etc)
    userAgent?: string;           // Info del navegador (para logs enviados al backend)
    url?: string;                 // ULR donde ocurrió el log  
}

/**
 * Configuracion del logger
 */
export interface LoggerConfig {
    enabledInProduction: boolean;   // ¿Permitir logs en producción?
    minLevel: LogLevel;
    showTimestamp: boolean;
    showModule: boolean;
    persistToLocalStorage: boolean;
    maxLocalStorageLogs: number;
    sendErrorsToBackend: boolean;
    backendLogEndpoint?: string;   // URL del endpoint de logs en backend
}


/**
 * Payload para enviar logs al backend
 */
export interface BackendLogPayload {
    timestamp: string;
    level: LogLevel;
    module: LogModule;
    message: string;
    data?: unknown;
    userAgent: string;
    url: string;
    sessionId?: string;     // Para rastrear sesión del usuario
}
