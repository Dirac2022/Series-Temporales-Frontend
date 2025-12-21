/**
 * Representa la respuesta del backend tras procesar el archivo.
 * No recibimos el dataset completo, solo metadados para la UI
 */

export interface BackendFileResponse {
    fileId: string;
    columns: string[];
    rowCount: number;
}