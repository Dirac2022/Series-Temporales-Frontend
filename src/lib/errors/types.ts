/**
 * =====================================================================================================
 * TIPOS DE ERRORES PERSONALIZADOS
 * =====================================================================================================
 */

/**
 * Error base para todos los errores de la aplicación
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly userMessage: string;
    public readonly details?: unknown;

    constructor(message: string, code: string, userMessage: string, details?: unknown) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.userMessage = userMessage;
        this.details = details;

        // Mantener stack trace correcto
        Object.setPrototypeOf(this, AppError.prototype);
    }
}


/**
 * Error de red/conexión
 */
export class NetworkError extends AppError {
    constructor(message: string = "Error de conexión", details?: unknown) {
        super(
            message,
            "NETWORK_ERROR",
            "No se pudo conectar con el servidor, Verifica tu conexión a internet",
            details
        );
        this.name = "NetworkError";
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}


/**
 * Error de API (respuesta del servidor con error)
 */
export class ApiError extends AppError {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number, userMessage?: string, details?: unknown) {
        // Mensaje por defecto según status code
        const defaultUserMessage = ApiError.getDefaultMessage(statusCode);

        super(
            message,
            `API_ERROR_${statusCode}`,
            userMessage || defaultUserMessage,
            details
        );

        this.name = "ApiError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }


    /**
     * Mensajes por defecto según código HTTP
     */
    private static getDefaultMessage(statusCode: number): string {
        if (statusCode >= 500) {
            return "Error en el servidor. Intenta nuevamente en unos momentos.";
        }
        if (statusCode === 404) {
            return "Recurso no encontrado.";
        }
        if (statusCode === 403) {
            return "No tienes permisos para realizar esta acción.";
        }
        if (statusCode === 401) {
            return "Sesión expirada. Por favor, inicia sesión nuevamente.";
        }
        if (statusCode === 400) {
            return "Los datos enviados no son válidos.";
        }
        return "Error al procesar la solicitud";
    }
}


/**
 * Error de validación (datos incorrectos del usuario)
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(
            message,
            "VALIDATION_ERROR",
            "Por favor, verifica los datos ingresados.",
            details
        );
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
        
    }
}


/**
 * Error de timeout
 */
export class TimeoutError extends AppError {
    constructor(message: string = "Timeout", details?: unknown) {
        super(
            message,
            "TIMEOUT_ERROR",
            "La operación está demorando mucho. Por favor, intenta nuevamente.",
            details
        );
        this.name = "TimeoutError";
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}