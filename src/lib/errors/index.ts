/**
 * Centralia las exportaciones del módulo de manejo de errores
 * USO:
 * ```typescript
 * import { handleError, ApiError, getErrorInfo } from '@/lib/errors';
 * 
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   const appError = handleError(error, 'API', 'Some API call');
 *   const info = getErrorInfo(appError);
 *   showToast(info.message);
 * }
 */

export { AppError, NetworkError, ApiError, ValidationError, TimeoutError } from "./types"
export { handleError, getErrorInfo } from "./handlers"
export type { ErrorInfo } from "./handlers"