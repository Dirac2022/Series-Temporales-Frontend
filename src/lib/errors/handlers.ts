/**
 * Funciones utilitarias para manejar errores de forma consistente
 * 
 * FLUJO:
 * 1. Error ocurre
 * 2. handleError() lo convierte a AppError
 * 3. Se loggea AUTOMÁTICAMENTE con:
 *    - Status code exacto
 *    - URL del endpoint
 *    - Método HTTP
 *    - Request/Response data
 *    - Stack trace
 * 4. getErrorInfo() extrae solo mensaje para UI
 * 5. Desarrollador ve TODO en consola/logs
 */

import axios, { AxiosError } from "axios";
import { logger } from "../../services/logger";
import { AppError, ApiError, NetworkError, TimeoutError, ValidationError } from "./types";
import { LogModule } from "../../services/logger";

/**
 * Información extraída de un error para mostrar al usuario
 */
export interface ErrorInfo {
    title: string;
    message: string;
    technical?: string;
}

/**
 * Convierte cualquier error en un AppError tipado
 * 
 * @param error - Error de cualquier tipo
 * @param module - Módulo donde ocurruó (para logging)
 * @param context - Contexto adicional (para logging)
 * @returns AppError tipado con toda la info técnica en details
 * 
 */
export function handleError(
    error: unknown,
    // module: "API" | "UI" | "STORAGE" | "VALIDATION" | "FORECAST" | "RESULT" | "APP" = "APP",
    module: LogModule = "APP",
    context?: string
): AppError {
    
    // Ya es un AppError
    if (error instanceof AppError) {
        logger.error(module, `${context ? context + ': ' : ''}${error.message}`, {
            code: error.code,                   // Código de error
            userMessage: error.userMessage,     // Mensaje para usuario
            details: error.details,             // Todos los detalles técnicos
            stack: error.stack,                 // Stack trace completo
        });
        return error;
    }

    // Error de axios (request HTTP)
    if (axios.isAxiosError(error)) {
        return handleAxiosError(error, module, context);
    }

    // Error nativo de JavaScript
    if (error instanceof Error) {
        logger.error(module, `${context ? context + ': ' : ''}${error.message}`, {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });

        return new AppError(
            error.message,
            "UNKNOWN_ERROR",
            "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
            {
                oriinalError: error.message,
                stack: error.stack,
                name: error.name,
            }
        );
    }

    // Otro tipo
    const errorMessage = typeof error === "string" ? error : "Error desconocido";
    logger.error(module, `${context ? context + ': ' : ''}${errorMessage}`, {
        rawError: error,
        type: typeof error,
    });

    return new AppError(
        errorMessage,
        "UNKNOWN_ERROR",
        "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        {
            originalError: error,
            type: typeof error,
        }
    );
}


/**
 * Maneja errores específicos de Axios
 * 
 * @params error - AxiosError
 * @params module - Módulo para logging
 * @params context  Contexto para logging
 * @returns AppError con roda la info técnica
 * 
 */
function handleAxiosError(
    error: AxiosError,
    module: LogModule,
    context?: string
): AppError {
    const prefix = context ? `${context}: ` : '';

    // CASO 1: Servidor respondió con error (4xx, 5xx)
    if (error.response) {
        const { status, data } = error.response;

        // Extraer mensaje del backend si existe
        // FastAPI suele enviar:  { "detail"_ "mensaje" }
        const backendMessage = 
            typeof data === "object" && data && "detail" in data
            ? String(data.detail)
            : undefined;


        // Logging completo con detalle técnico
        logger.error(module, `${prefix}API Error ${status}`, {
            // Info del error
            statusCode: status,
            statusText: error.response.statusText,

            // Info del request
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            requestsHeaders: error.config?.headers,
            requestData: error.config?.data,

            // Info de la response
            responseData: data,
            responseHeaders: error.response.headers,

            // Mensaje del backend
            backendMessage: backendMessage,
        });
        
        return new ApiError(
            error.message,
            status,
            backendMessage, {
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
                message: error.message,
                code: error.code,
            }
        );
    }


    // CASO 2: Request enviado pero sin respuesta (problema de red)
    if (error.request) {
        logger.error(module, `${prefix}Network Error - No response received`, {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
            message: error.message,
            code: error.code,
        });

        return new NetworkError(error.message, {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
            errorCode: error.code,
        });
    }


    // CASO 3: Timeout
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        logger.error(module, `${prefix}Timeout Error`, {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
            timeoutInSeconds: error.config?.timeout ? error.config.timeout / 1000 : "unknown",
            message: error.message,
        });

        return new TimeoutError(error.message, {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
        });
    }

    // CASO 4: Error al configurar request
    logger.error(module, `${prefix}Request Configuration Error`, {
        message: error.message,
        code: error.code,
        config: error.config,       // Configuración completa del request
    });

    return new AppError(
        error.message,
        "REQUEST_ERROR",
        "Error al configurar la solicitud. Por favor, contacta a soporte.",
        {
            originalError: error.message,
            code: error.code,
            config: error.config,
        }
    );
}


/**
 * Extrae información amigable de un error para mostrar en UI
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * try {
 *   await uploadFile(file);
 * } catch (error) {
 *   const err = handleError(error, 'API', 'Upload file');
 *   // ↑ Ya está loggeado con TODO el detalle
 *   
 *   const info = getErrorInfo(err);
 *   // ↑ Solo extrae mensaje para UI
 *   
 *   toast.error(info.title, info.message); // Mostrar al usuario
 *   
 *   // Si necesitas el error completo:
 *   console.log(err.statusCode);  // Status code exacto
 *   console.log(err.details);     // Todos los detalles técnicos
 * }
 * ```
 * 
 * @param error - AppError con toda la info
 * @returns ErrorInfo con solo lo necesario para UI
 */
export function getErrorInfo(error: AppError): ErrorInfo {
    return {
        title: getErrorTitle(error),
        message: error.userMessage,
        technical: error.message,
    };
}


/**
 * Obtiene un título apropiado según el tipo de error
 */
function getErrorTitle(error: AppError): string {
    if (error instanceof NetworkError) {
        return "Error de conexión";
    }
    if (error instanceof TimeoutError) {
        return "Tiempo agotado";
    }
    if (error instanceof ValidationError) {
        return "Datos inválidos";
    }
    if (error instanceof ApiError) {
        if (error.statusCode >= 500) {
            return "Error del servidor";
        }
        if (error.statusCode === 404) {
            return "No encontrado";
        }
        if (error.statusCode === 403 || error.statusCode === 401) {
            return "Acceso denegado";
        }
        return "Error en la solicitud";
    }
    return "Error";
}


/**
 * Wrapper para funcieons async con manejo de errores automático
 * 
 * @param fn - Función async a ejecutar
 * @param module - Módulo para logging
 * @param context - Contexto para logging
 * @returns Función wrapeada con error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    module: LogModule,
    context?:string
): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
            return await fn(...args);
        } catch (error) {
            throw handleError(error, module, context);
        }
    }) as T;
}
