/**
 * ==============================================================================================
 * SERVICIO DE API - FORECASTING
 * ==============================================================================================
 * 
 * Centraliza todas las llamadas HTTP relacionadas con forecasting
 */

import axios from "axios";
import { logger } from "../logger";
import { handleError } from "../../lib/errors";
import { API } from "../../config/constants";
import type { ForecastConfiguration } from "./types";
import type { 
    UploadResponse,
    ForecastStartResponse,
    ForecastStatusResponse,
    ForecastResultResponse,
} from "./types";



export const forecastService = {

    /**
     * Sube un archivo al servidor para procesamiento
     * 
     * ENDPOINT POST /upload
     * 
     * @params file - Archivo a subir
     * @params onProgress - Callback opcional para reportar progreso (0 - 100)
     * @returns Metadatos del archivo procesado
     */
    uploadFile: async (
        file: File, 
        onProgress?: (progress: number) => void
    ): Promise<UploadResponse> => {
        try {
            logger.info("API", "Subiendo archivo", {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
            });

            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post<UploadResponse>(
                `${API.BASE_URL}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },

                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percentedCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percentedCompleted);
                        }
                    },
                }
            );

            logger.info("API", "Archivo subido exitosamente", {
                fileId: response.data.fileId,
                rowCount: response.data.rowCount,
            });

            return response.data;
        } catch (error) {
            throw handleError(error, "API", "Upload file");
        }
    },


    /**
     * Inicia un trabajo de forecasting
     * 
     * ENDPOINT: POST /forecast
     */
    startForecast: async (
        config: ForecastConfiguration
    ): Promise<ForecastStartResponse> => {
        try {
            logger.info("API", "Iniciando forecast", {
                fileId: config.fileId,
                horizon: config.horizon,
                seriesIdentifiers: config.mapping.seriesIdentifiers.length,
            });

            const response = await axios.post<ForecastStartResponse>(
                `${API.BASE_URL}/forecast`,
                config
            );

            logger.info("API", "Forecast iniciado", {
                jobId: response.data.jobId,
            });

            return response.data;
        } catch (error) {
            throw handleError(error, "API", "Start forecast");
        }
    },


    /**
     * Consulta el estado de un trabajo de forecasting
     */
    getForecastStatus: async (jobId: string): Promise<ForecastStatusResponse> => {
        try {
            logger.debug("API", "Consultado status de forecast", { jobId });

            const response = await axios.get<ForecastStatusResponse>(
                `${API.BASE_URL}/forecast/${jobId}/status`
            );


            if (response.data.status === "completed" || response.data.status === "failed") {
                logger.info("API", `Forecast ${response.data.status}`, {
                    jobId,
                    status: response.data.status,
                    stage: response.data.stage,
                    error: response.data.error,
                });
            }

            return response.data;
        } catch (error) {
            throw handleError(error, "API", "Get forecast status");
        }
    },


    /**
     * Obtiene los resultados completos de un forecast
     * 
     * ENDPOINT GET /forecast{jobId}
     */
    getForecastResults: async (jobId: string): Promise<ForecastResultResponse> => {
        try {
            logger.info("API", "Obtiendo resultados de forecast", { jobId });
            const response = await axios.get<ForecastResultResponse>(
                `${API.BASE_URL}/forecast/${jobId}`
            );

            logger.info("API", "Resultados obtenidos", {
                jobId,
                seriesCount: response.data.seriesIds.length,
                predictionsCount: response.data.predictions.length
            });

            return response.data;
        } catch (error) {
            throw handleError(error, "API", "Get forecast results")
        }
    },
};
