/**
 * Servicio para la gestión de datos maestros
 * Endpoint: POST /api/v1/masters/{entity_type}/upload
 */
import axios from "axios";
import { logger } from "../logger";
import { handleError } from "../../lib/errors";
import { API } from "../../config/constants";

export type MasterEntityType =
    | "products"
    | "channels"
    | "accounts"
    | "territories"
    | "warehouses"
    | "distributors";

export interface MasterUploadResponse {
    message: string;
    processed_count: number;
}

export const masterService = {

    /**
     * Sube un archivo CSV de datos maestros
     * 
     * @param file Archivo CSV a subir
     * @param entityType Tipo de entidad maestra
     * @param onProgress Callback opcional para progeso (0-100)
     */
    uploadMasterData: async (
        file: File,
        entityType: MasterEntityType,
        onProgress?: (progress: number) => void
    ): Promise<MasterUploadResponse> => {
        try {
            logger.info("API", `Iniciando carga maestra para ${entityType}`, {
                fileName: file.name,
                size: file.size
            });

            const formData = new FormData();
            formData.append("file", file);

            const url = `${API.BASE_URL}/masters/${entityType}/upload`;

            const response = await axios.post<MasterUploadResponse>(
                url,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percent);
                        }
                    }
                }
            );

            logger.info("API", `Carga maestra completada para ${entityType}`, {
                processed: response.data.processed_count
            });

            return response.data;

        } catch (error) {
            throw handleError(error, "API", `Upload master ${entityType}`);
        }
    }
};
