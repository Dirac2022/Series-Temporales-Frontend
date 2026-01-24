/**
 * Centraliza las llamadas HTTP relacionadas con predicciones filtradas
 * 
 * Endpoints consumidos:
 *  - GET /predictions/filtered -> Predicciones con filtros por codigos
 */
import axios from 'axios'
import { logger } from "../logger"
import { handleError, ValidationError } from "../../lib/errors"
import { API } from "../../config/constants"
import type { PredictionFilterParams, ForecastPrediction, ForecastPredictionResponse } from './types'

/**
 * Servicio para operaciones de predicciones
 */
export const seriesService = {

    /**
     * Obtiene predicciones filtradas por codigos de negocio
     * 
     * ENDPOINT: GET /predictions/filtered?warehouse_code=xxxx&product_code...
     * 
     * 
     * Retorna:
     * --------
     *  Array de ForecastPrediction (puede ser vacio si no hay coincidencias)
     * 
     * @params params - Filtros de busqueda (warehouse_code, product_code,
     *                  channel_code, acct_code, territory_code, dist_code)
     * 
     * @returns Lista de predicciones que coinciden con los filtros
     * @throws AppError si falla o no hay filtros
     *                  
     */
    getFilteredPredictions: async (
        params: PredictionFilterParams
    ): Promise<ForecastPredictionResponse> => {
        try {
            const hasFilters = Object.values(params).some(
                (value) => value !== undefined && value !== ""
            )

            if (!hasFilters) {
                throw new ValidationError(
                    "Se requiere al menos un filtro para buscar predicciones",
                    { params }
                )
            }

            const queryParams: Record<string, string> = {}

            if (params.warehouse_code) {
                queryParams.warehouse_code = params.warehouse_code
            }
            if (params.product_code) {
                queryParams.product_code = params.product_code
            }
            if (params.channel_code) {
                queryParams.channel_code = params.channel_code
            }
            if (params.acct_code) {
                queryParams.acct_code = params.acct_code
            }
            if (params.territory_code) {
                queryParams.territory_code = params.territory_code
            }
            if (params.dist_code) {
                queryParams.dist_code = params.dist_code
            }

            logger.debug("API", "Obteniendo predicciones filtradas", {
                params: queryParams,
            })

            const url = `${API.BASE_URL}/predictions/filtered`
            const response = await axios.get<ForecastPredictionResponse>(
                url,
                { params: queryParams }
            )

            logger.info("API", "Predicciones filtradas obtenidas", {
                count: response.data.length,
                params: queryParams,
            })

            return response.data

        } catch (error) {
            throw handleError(error, "API", "Get filtered predictions")
        }
    },
}
