/**
 * Logs en consola del navegador
 * Persistencia en localstorage
 * Envio de errores críticos al backend
 */
import { LogLevel, LogModule, LogEntry, LoggerConfig, BackendLogPayload } from "./types"


/**
 * Clave para almacenar logs en localStorage
 */
const STORAGE_KEY = "forecast_app_logs"

/**
 * Clave para almacenar session ID
 */
const SESSION_ID_KEY = "forecast_session_id"


/**
 * Configuración por defecto del logger
 * En desarrollo: muestra todos los logs
 * En producción: solo errores y warnings
 */
const DEFAULT_CONFIG: LoggerConfig = {
    enabledInProduction: true,
    minLevel: import.meta.env.MODE === "production" ? "warn" : "debug",
    showTimestamp: true,
    showModule: true,
    persistToLocalStorage: import.meta.env.MODE !== "production",
    maxLocalStorageLogs: 100,
    sendErrorsToBackend: true,  // Enviar errores siempre (dev y prod)
    backendLogEndpoint: import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}/logs/frontend`
        : "http://localhost:8000/api/v1/logs/frontend"
};
// VITE_API_BASE_URL=http://localhost:8000/api/v1
/**
 * Mapeo de niveles a prioridad numérica
 */
    const LEVEL_PRIORITY: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };


/**
 * Colores para cada nivel (para consola)
 */
const LEVEL_COLORS: Record<LogLevel, string> = {
    debug: "#6B7280",        // gray
    info: "#3B82F6",         // blue
    warn: "#F59E0B",      // orange
    error: "#EF4444",        // red
};


/**
 * Singleton para asegurar una única instancia en toda la app
 */
class Logger {
    private config: LoggerConfig;
    private isProduction: boolean;
    private sessionId: string;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config};
        this.isProduction = import.meta.env.MODE === "production";
        this.sessionId = this.getOrCreateSessionId();

        // Log inicial del sistema (solo en desarrollo)
        if (!this.isProduction) {
            console.log(
                "%c Logger System Inicializado (Modo hibrido)",
                "color: #10B981; font-weight: bold; font-size: 12px"
            );
            console.log(
                "%c Features: Console + LocalStorage + Backend",
                "color: #8B5CF6; font-size: 10px"
            )
        }
    }

    private getOrCreateSessionId(): string {
        try {
            let sessionId = localStorage.getItem(SESSION_ID_KEY);
            if (!sessionId) {
                sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}}`;
                localStorage.setItem(SESSION_ID_KEY, sessionId)
            }

            return sessionId;
        } catch (error) {
            return `temp_${Date.now()}`;
        }
    }

    /**
     * Determina si un log debe mostrarse según su nivel
     */
    private shouldLog(level: LogLevel): boolean {
        if (this.isProduction && !this.config.enabledInProduction) {
            return false;
        }

        return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.config.minLevel]
    }

    private persistToLocalStorage(entry: LogEntry): void {
        if (!this.config.persistToLocalStorage) {
            return;
        }

        try {
            const existingLogs = this.getStoredLogs();
            existingLogs.push(entry);
            const trimedLogs = existingLogs.slice(-this.config.maxLocalStorageLogs);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimedLogs));
        } catch (error) {
            console.warn("Fallo al persistir log en localStorage:", error);
        }
    }

    private async sendToBackend(entry: LogEntry): Promise<void> {
        if (entry.level !== "error" && entry.level !== "warn") {
            return;
        }

        if (!this.config.sendErrorsToBackend) {
            return;
        }

        if (!this.config.backendLogEndpoint) {
            return;
        }

        try {
            const payload: BackendLogPayload = {
                timestamp: entry.timestamp,
                level: entry.level,
                module: entry.module,
                message: entry.message,
                data: entry.data,
                userAgent: navigator.userAgent,
                url: window.location.href,
                sessionId: this.sessionId
            };
            fetch(this.config.backendLogEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                keepalive: true,
            }).catch((error) => {
                console.warn("FAllo al enviar logs al backend:", error)
            });
        } catch (error) {
            console.warn("Error al preparar logs para envio al backend:", error);
        }
    }

    /**
     * Formatea y muestra un log en consola
     */
    private writeLog(entry: LogEntry): void {
        if (!this.shouldLog(entry.level)) {
            return;
        }

        // Construir prefijo del log
        const parts: string[] = [];

        // Agregar timestamps si esta habilitado
        if (this.config.showTimestamp) {
            const time = new Date(entry.timestamp).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            parts.push(`[${time}]`)
        }

        // Agregar módulo si esta habilitado
        if (this.config.showModule) {
            parts.push(`[${entry.module}]`);
        }

        // Construir mensaje completo
        const prefix = parts.join(' ');
        const color = LEVEL_COLORS[entry.level];

        // Styling para el log
        const style = `color: ${color}; font-weight: bold;`;

        // Métoo de consola según nivel
        const consoleMethod = entry.level === "error" ? console.error 
                            : entry.level == "warn" ? console.warn 
                            : console.log

        if (entry.data !== undefined) { 
            consoleMethod(`%c${prefix}`, style, entry.message, entry.data);
        } else {
            consoleMethod(`%c${prefix}`, style, entry.message);
        }
    }

    /**
     * Crea una entrada de log con el formato estandar
     */
    private createEntry(level: LogLevel, module: LogModule, message: string, data?: unknown) : LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            module,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
    }

    private processLog(entry: LogEntry): void {
        this.writeLog(entry);
        this.persistToLocalStorage(entry);
        this.sendToBackend(entry);
    }


    /**
     * ==================================================================================================
     * MÉTODOS PÚBLICOS
     * ==================================================================================================
     */

    /**
     * Log de nivel DEBUG
    */
    debug(module: LogModule, message: string, data?: unknown): void {
        const entry = this.createEntry("debug", module, message, data);
        this.processLog(entry);
    }

    /**
     * Log de nivel INFO
     */
    info(module: LogModule, message: string, data?: unknown): void {
        const entry = this.createEntry("info", module, message, data);
        this.processLog(entry);
    }

    /**
     * Log de nivel WARNING
     */
    warn(module: LogModule, message: string, data?: unknown): void {
        const entry = this.createEntry("warn", module, message, data);
        this.processLog(entry);
    }

    /**
     * Log de nivel ERROR
     */
    error(module: LogModule, message: string, data?: unknown): void {
        const entry = this.createEntry("error", module, message, data);
        this.processLog(entry);
    }

    getStoredLogs(): LogEntry[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    clearStoredLogs(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
            this.info("STORAGE", "Logs removidos de localstorage");
        } catch (error) {
            console.warn("Fallo al limpiar logs:", error)
        }
    }

    exportLogs(): void {
        const logs = this.getStoredLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `forecast-logs-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info("STORAGE", "Logs exportados a archivo")
    }

    /**
     * Agrupa múltiples logs relacionados (útil para debugging complejo)
     */
    group(label: string, callback: () => void): void {
        if (this.shouldLog("debug")) {
            console.group(`${label}`);
            callback();
            console.groupEnd();
        }
    }

    /**
     * Mide el tiempo de ejecució de una operación
     */
    time(label: string): void {
        if (this.shouldLog("debug")) {
            console.time(`${label}`);
        }
    }

    /**
     * Finaliza medición de tiempo
     */
    timeEnd(label: string): void {
        if (this.shouldLog("debug")) {
            console.timeEnd(`${label}`)
        }
    }

    /**
     * Actualiza la configuración del logger en runtine
     */
    configure(newConfig: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.info("APP", "Logger configuration updated", newConfig);
    }

}

// Exportación singleton
export const logger = new Logger();

// Para testing o casos especiales
export { Logger };
