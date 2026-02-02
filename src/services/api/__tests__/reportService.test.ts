/**
 * Tests para el servicio de reportes que consume
 * GET /api/v1/reports/predictions
 */

import { describe, it, expect, beforeEach } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "../../../test/setup"
import { reportService } from "../reportService"
import { API } from "../../../config/constants"
import type { ReportResponse } from "../types"


/**
 * UUID de prueba para simular tenant y job
 */
const TEST_TENANT_ID = "550e8400-e29b-41d4-a716-446655440000"
const TEST_JOB_ID = "660e8400-e29b-41d4-a716-446655440001"

/**
 * Datos mock que sumula la respuesta del backend
 */
const mockReportResponse: ReportResponse = {
    totalRows: 2,
    rows: [
        {
            sem: 4,
            region: "Test Region",
            subregion: "Test Subregion",
            codWhse: "WH001",
            whseName: "Test Almacen Central",
            plaza: "Test Plaza",
            sku: "TESTSKU00123",
            marca: "Dr Pepper",
            sabor: "Lucuma",
            formato: "0.5",
            botellas: "6",
            tipo: "PET",
            prediccion: 1542.75,
        },
        {
            sem: 4,
            region: "Test Region",
            subregion: "Test Subregion",
            codWhse: "WH001",
            whseName: "Test Almacen Central",
            plaza: "Test Plaza",
            sku: "TESTSKU00124",
            marca: "SevenUp",
            sabor: "Jamaica",
            formato: "1.0",
            botellas: "12",
            tipo: "PET",
            prediccion: 890.32,
        }
    ],
}

/**
 * Suite de tests oara reportService.getReportPredictions
 */
describe("reportService.getReportPredictions", () => {
    /**
     * Configuramos el handler por defecto antes de cada test.
     * Valida que el header X-tenant-ID este presente
     */
    beforeEach(() => {
        server.use(
            http.get(`${API.BASE_URL}/api/v1/reports/predictions`, ({ request }) => {
                const tenantId = request.headers.get("X-Tenant-ID")
                if (!tenantId) {
                    return HttpResponse.json(
                        { detail: "tenant_id es requerido" },
                        { status: 400 }
                    )
                }

                return HttpResponse.json(mockReportResponse)
            })
        )
    })

    it("deberia retornar reporte cuando se proporciona job_id y tenant_id validos", async () => {
        // Act
        const result = await reportService.getReportPredictions(TEST_JOB_ID, TEST_TENANT_ID)

        // Assert
        expect(result.totalRows).toBe(2)
        expect(result.rows).toHaveLength(2)
        expect(result.rows[0].marca).toBe("Dr Pepper")
        expect(result.rows[0].prediccion).toBe(1542.75)
    })


    it("deberia lanzar error cuando falta X-Tenant-ID", async () => {
        // Arrange
        server.use(
            http.get(`${API.BASE_URL}/api/v1/reports/predictions`, () => {
                return HttpResponse.json(
                    { detail: "tenant_id es requerido" },
                    { status: 400 }
                )
            })
        )

        // Act & Assert
        await expect(
            reportService.getReportPredictions(TEST_JOB_ID, "")
        ).rejects.toThrow()
    })

    it("deberia lanzar error cuando job no tiene predicciones", async () => {
        // Arrange
        server.use(
            http.get(`${API.BASE_URL}/api/v1/reports/predictions`, () => {
                return HttpResponse.json(
                    { detail: "No se encontraron predicciones para el job" },
                    { status: 404 }
                )
            })
        )

        // Act & Assert
        await expect(
            reportService.getReportPredictions("nonexistent-job-id", TEST_TENANT_ID)
        ).rejects.toThrow()
    })


    it("deberia enviar job_id como query parameter", async () => {
        // Arrange
        let capturedUrl: URL | null = null
        server.use(
            http.get(`${API.BASE_URL}/api/v1/reports/predictions`, ({ request }) => {
                capturedUrl = new URL(request.url)
                return HttpResponse.json(mockReportResponse)
            })
        )

        // Act
        await reportService.getReportPredictions(TEST_JOB_ID, TEST_TENANT_ID)

        // Assert
        expect(capturedUrl).not.toBeNull()
        expect(capturedUrl!.searchParams.get("job_id")).toBe(TEST_JOB_ID)
    })
})