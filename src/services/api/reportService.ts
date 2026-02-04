/**
 * Servicio para operaciones de reportes de prediccioens
 * Consume el endpoint GET /api/v1/reports/predictions
 * 
 * ENDPOINT: GET /api/v1/reports/predictions?job_id={uuid}
 * HEADER: X-Tenant-ID: {uuid}
 */
import axios from "axios"
import { logger } from "../logger"
import { handleError, ValidationError } from "@/lib/errors"
import { API } from "@/config/constants"
import type { JobsListResponse, ReportResponse } from "./types"


/**
 * Servicio para operaciones de reportes
 */
export const reportService = {

    /**
     * Obtiene el reporte de prediccioens enriquecido para un job especifico
     * 
     * El backend retorna predicciones con datos maestros (territorio, almancen, cuenta, producto)
     * listos para exportar a Excel.
     * 
     * @param jobId - UUID del forecast job
     * @param tenantID - UUID del tenant (requerido en header X-Tenant-ID)
     * @returns ReportResponse con totalRows y array de ReportRow
     * @throws ValidationError si jobId o tenantId estan vacios
     * @throws AppError si el backend retorna error (400, 404, etc.)
     */
    getReportPredictions: async (
        jobId: string,
        tenantId: string,
    ): Promise<ReportResponse> => {

        try {
            if (!jobId || jobId.trim() === "") {
                throw new ValidationError(
                    "job_id es requerido para obtener el reporte",
                    { jobId }
                )
            }

            if (!tenantId || tenantId.trim() === "") {
                throw new ValidationError(
                    "tenant_id es requerido para obtener el reporte",
                    { tenantId }
                )
            }

            logger.debug("API", "Obteniendo reporte de predicciones", { jobId, tenantId })
            const url = `${API.BASE_URL}/reports/predictions`
            const response = await axios.get<ReportResponse>(url, {
                params: { job_id: jobId },
                headers: { "X-Tenant-ID": tenantId }
            })
            logger.info("API", "Reporte de predicciones obtenido existosamente", {
                totalRows: response.data.totalRows,
                jobId
            })

            return response.data

        } catch (error) {
            throw handleError(error, "API", "Get report predictions")
        }
    },


    /**
     * Obtiene la lista de jobs disponibles para reportes
     * 
     * Obtiene los forecast jobs que tienen status 'completed'
     * disponibles para generar reportes Excel
     * 
     * @param tenantId - Identificador de tenant
     * @returns Promise con array de JobSummary (jobs disponibles)
     */
    async getJobs(tenantId: string): Promise<JobsListResponse> {
        try {
            if (!tenantId || tenantId.trim() === "") {
                throw new ValidationError(
                    "tenant_id es requerido para obtener los jobs",
                    { tenantId }
                )
            }

            logger.debug("API", "Obteniendo lista de jobs disponibles", { tenantId })

            const url = `${API.BASE_URL}/reports/jobs`
            const response = await axios.get<JobsListResponse>(url, {
                headers: { "X-Tenant-ID": tenantId }
            })

            logger.info("API", "Lista de jobs obtenida exitosamente", {
                count: response.data.jobs.length
            })

            return response.data

        } catch (error) {
            throw handleError(error, "API", "Get jobs list")
        }
    }
}