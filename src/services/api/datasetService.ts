
/**
 * Servicio para operaciones de datasets
 *
 * Consume los endpoints:
 *   - POST /api/v1/upload   → Subir un dataset (CSV/Excel)
 *   - GET  /api/v1/datasets → Listar datasets del tenant
 *
 * HEADERS REQUERIDOS:
 *   - X-Tenant-ID (ambos endpoints)
 *   - X-User-ID   (solo upload)
 *
 */
import axios from "axios"
import { logger } from "../logger"
import { handleError, ValidationError } from "@/lib/errors"
import { API } from "@/config/constants"
import type { DatasetUploadResponse, DatasetListResponse } from "./types"


/**
 * Servicio para operaciones con datasets
 */
export const datasetService = {

    /**
     * Sube un archivo CSV o Excel al backend para su procesamiento.
     *
     * Envia el archivo como multipart/form-data junto con los headers
     * de autenticacion X-Tenant-ID y X-User-ID. El backend valida
     * formato, columnas, calcula checksum y persiste en Redis + PostgreSQL.
     *
     * @param file - Archivo CSV (.csv) o Excel (.xlsx, .xls) a subir
     * @param tenantId - UUID del tenant (empresa) que sube el dataset
     * @param userId - UUID del usuario que realiza la carga
     * @param onProgress - Callback opcional para reportar progreso (0-100)
     * @returns DatasetUploadResponse con fileId, columns, rowCount, checksum
     * @throws ValidationError si tenantId o userId estan vacios
     * @throws AppError si el backend retorna error (400, 500, etc.)
     */
    async uploadDataset(
        file: File,
        tenantId: string,
        userId: string,
        onProgress?: (percent: number) => void
    ): Promise<DatasetUploadResponse> {

        try {
            // --- Validacion de parametros requeridos ---
            if (!tenantId || tenantId.trim() === "") {
                throw new ValidationError(
                    "tenant_id es requerido para subir un dataset",
                    { tenantId }
                )
            }

            if (!userId || userId.trim() === "") {
                throw new ValidationError(
                    "user_id es requerido para subir un dataset",
                    { userId }
                )
            }

            // --- Construir FormData con el archivo ---
            // FormData permite enviar archivos como multipart/form-data
            // NO establecer Content-Type manualmente; axios lo hace automaticamente
            const formData = new FormData()
            formData.append("file", file) // "file" es el nombre del campo esperado por el backend

            // --- Log de inicio de operacion ---
            logger.debug("DATASETS", "Subiendo dataset al servidor", {
                filename: file.name,       // Nombre original del archivo
                size: file.size,           // Tamaño en bytes
                type: file.type,           // MIME type (text/csv, etc.)
                tenantId,
                userId,
            })

            // --- Construir URL del endpoint ---
            const url = `${API.BASE_URL}/upload`

            // --- Realizar peticion POST con axios ---
            const response = await axios.post<DatasetUploadResponse>(url, formData, {
                headers: {
                    "X-Tenant-ID": tenantId,   // Header de tenant requerido por backend
                    "X-User-ID": userId,       // Header de usuario requerido por backend
                    // Content-Type se establece automaticamente como multipart/form-data
                },
                // onUploadProgress permite reportar progreso de carga al componente
                onUploadProgress: (progressEvent) => {
                    // Solo calcular si conocemos el total del archivo
                    if (onProgress && progressEvent.total) {
                        // Calcular porcentaje: (bytes cargados / total) * 100
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        onProgress(percent) // Notificar al componente que llamo
                    }
                },
            })

            // --- Log de operacion exitosa ---
            logger.info("DATASETS", "Dataset subido exitosamente", {
                fileId: response.data.fileId,
                rowCount: response.data.rowCount,
                columns: response.data.columns.length,
                checksum: response.data.checksum,
            })

            // --- Retornar respuesta del backend ---
            return response.data

        } catch (error) {
            // handleError convierte cualquier error en AppError y lo loggea
            throw handleError(error, "DATASETS", "Upload dataset")
        }
    },


    /**
     * Obtiene la lista paginada de datasets del tenant.
     *
     * El backend retorna datasets ordenados por created_at descendente
     * (mas recientes primero). Soporta paginacion con limit y offset.
     *
     * @param tenantId - UUID del tenant para filtrar datasets
     * @param limit - Cantidad de items por pagina (1-100, default 20)
     * @param offset - Desplazamiento para paginacion (default 0)
     * @returns DatasetListResponse con total y array de DatasetSummary
     * @throws ValidationError si tenantId esta vacio
     * @throws AppError si el backend retorna error
     */
    async listDatasets(
        tenantId: string,
        limit?: number,
        offset?: number
    ): Promise<DatasetListResponse> {

        try {
            // --- Validacion de parametros requeridos ---
            if (!tenantId || tenantId.trim() === "") {
                throw new ValidationError(
                    "tenant_id es requerido para listar datasets",
                    { tenantId }
                )
            }

            // --- Log de inicio de operacion ---
            logger.debug("DATASETS", "Obteniendo lista de datasets", {
                tenantId,
                limit,
                offset,
            })

            // --- Construir URL del endpoint ---
            const url = `${API.BASE_URL}/datasets`

            // --- Construir query params opcionales ---
            // Solo enviar limit y offset si fueron proporcionados
            const params: Record<string, number> = {}
            if (limit !== undefined) params.limit = limit     // ej: ?limit=10
            if (offset !== undefined) params.offset = offset  // ej: ?offset=20

            // --- Realizar peticion GET con axios ---
            const response = await axios.get<DatasetListResponse>(url, {
                headers: {
                    "X-Tenant-ID": tenantId,  // Header de tenant requerido por backend
                },
                params, // axios convierte el objeto a query string automaticamente
            })

            // --- Log de operacion exitosa ---
            logger.info("DATASETS", "Lista de datasets obtenida exitosamente", {
                total: response.data.total,              // Total global de datasets
                itemsReturned: response.data.items.length, // Items en esta pagina
            })

            // --- Retornar respuesta del backend ---
            return response.data

        } catch (error) {
            // handleError convierte cualquier error en AppError y lo loggea
            throw handleError(error, "DATASETS", "List datasets")
        }
    },
}
