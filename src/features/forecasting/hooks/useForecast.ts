/**
 * ==========================================================================
 * HOOK: useForecast
 * ==========================================================================
 * 
 * Hook para iniciar un proceso de forecasting (upload + startForecast);
 * 
 * FLUJO:
 * 1. Usuario sube archivo → uploadFile()
 * 2. Obtiene fileId
 * 3. Inicia forecast con configuración → startForecast()
 * 4. Obtiene jobId
 * 5. Retorna jobId para navegación
 * 
 * Si ya tienes fileId (archivo ya subido), usa startForecastWithFileId()
 * Si necesitas subir + iniciar, usa uploadAndStartForecast()
 */
import { useState } from "react"
import { forecastService } from "../../../services/api"
import { logger } from "../../../services/logger"
import { handleError, AppError } from "../../../lib/errors"
//import type { ForecastConfiguration } from "../types/api.types"
import type { ForecastConfiguration } from "../../../services/api/types"
import type { UploadResponse } from "../../../services/api"


/**
 * Valor de retorno del hook
 */
interface UseForecastReturn {


    /**
     * Iniciar forecast con fileId existente (sin Re-upload)
     * - El archivo ya fue subido en FileUpload
     * - Ya se tiene un fileId valido
     * 
     * @param fileId - ID del archivo ya subido
     * @param config - Configuracion del forecast (mapping + horizon)
     * @returns jobId del forecast iniciado
     */
    startForecastWithFileId: (
        fileId: string,
        config: Omit<ForecastConfiguration, 'fileId'>
    ) => Promise<string>;


    /**
     * Función para subir archivo e iniciar forecast 
     * 
     * @param file - Archivo a subir
     * @param config - Configuracion del forecast (sin fileId, se agrega automaticamente)
     * @returns jobId del forecast iniciado
     * @throws AppError si falla alguna operacion
     */
    uploadAndStartForecast: (
        file: File,
        config: Omit<ForecastConfiguration, 'fileId'>
    ) => Promise<string>;

    /**
     * Si esta ejecutando alguna operacion
     * true durante upload o startForecast
     */
    isLoading: boolean;

    error: AppError | null;

    /**
     * Metadata del archivo subido
     */
    uploadedFileMetadata: UploadResponse | null;

    /**
     * Resetea el estado del hook
     */
    reset: () => void;
}


/**
 * Hook principal
 */
export function useForecast(): UseForecastReturn {
    // Estado del hook
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<AppError | null>(null);
    const [uploadedFileMetadata, setUploadedFileMetadata] = useState<UploadResponse | null>(null);

    /**
     * Iniciar forecast sin re-subir archivo
     */
    const startForecastWithFileId = async (
        fileId: string,
        config: Omit<ForecastConfiguration, 'fileId'>
    ): Promise<string> => {
        setError(null);
        setIsLoading(true);

        try {
            logger.info("FORECAST", "Iniciando forecast con fileId existente", {
                fileId,
                horizon: config.horizon,
                seriesIdentifiers: config.mapping.seriesIdentifiers,
            });

            // Construir configuracion completa
            const forecastConfig: ForecastConfiguration = {
                fileId: fileId,
                mapping: config.mapping,
                horizon: config.horizon
            };

            // Llama directamente a startForecast (Sin upload)
            const forecastResponse = await forecastService.startForecast(forecastConfig);
            logger.info("FORECAST", "Forecast iniciado exitosamente", { jobId: forecastResponse.jobId});
            return forecastResponse.jobId;

        } catch (error) {
            const appError = handleError(error, "FORECAST", "Start forecast with fileId");
            setError(appError);
            throw appError;
        
        } finally {
            setIsLoading(false);
        }
    }


    /**
     * Upload + Start forecast
     * 
     * @params file - Archivo CSV/XLSX/Parquet
     * @params config - Configuracion del forecast (mapping + horizon)
     * @returns jobId del forecast iniciado
     * @throws AppError si falla
     */
    const uploadAndStartForecast = async (
        file: File,
        config: Omit<ForecastConfiguration, 'fileId'>
    ): Promise<string> => {
        // Reset estado previo
        setError(null);
        setIsLoading(true);

        try {
            // Upload del archivo
            logger.info("FORECAST", "Iniciando upload de archivo", {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
            });

            const uploadResponse = await forecastService.uploadFile(file);

            // Guardar metadata para uso posterior
            setUploadedFileMetadata(uploadResponse);

            logger.info("FORECAST", "Archivo subido exitosamente", {
                fileId: uploadResponse.fileId,
                rowCount: uploadResponse.rowCount,
                columns: uploadResponse.columns
            });

            // Iniciar forecast con el fileId obtenido
            const forecastConfig: ForecastConfiguration = {
                fileId: uploadResponse.fileId,
                mapping: config.mapping,
                horizon: config.horizon,
            };

            logger.info("FORECAST", "Iniciando proceso de forecasting", {
                fileId: uploadResponse.fileId,
                horizon: config.horizon,
                seriesIdentifiers: config.mapping.seriesIdentifiers
            });

            const forecastResponse = await forecastService.startForecast(forecastConfig);

            logger.info("FORECAST", "Forecast iniciado exitosamente", { jobId: forecastResponse.jobId})

            return forecastResponse.jobId;

        } catch (error) {
            const appError = handleError(error, "FORECAST", "Upload and start forecast");

            // Guardar error en estado para que un componente lo muestre
            setError(appError);

            // Re lanzar para que el componente pueda manejarlo
            throw appError;
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Resetea el estado del hook
     */
    const reset = () => {
        setIsLoading(false);
        setError(null);
        setUploadedFileMetadata(null);
    };

    return {
        startForecastWithFileId,
        uploadAndStartForecast,
        isLoading,
        error,
        uploadedFileMetadata,
        reset,
    };
}