/**
 * Tests para datasetService
 * Consume POST /api/v1/upload y GET /api/v1/datasets
 * 
 * Usa MSW para interceptar las peticiones HTTP reales
 */

import { describe, it, expect, beforeEach } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "@/test/setup"
import { datasetService } from "../datasetService"
import { API } from "@/config/constants"
import type { DatasetUploadResponse, DatasetListResponse } from "../types"


const TEST_TENANT_ID = "00000000-0000-0000-0000-000000000000"
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001"


// ========================================================================
// Mocks de respuestas del backend
// ========================================================================

/** Mock de respuesta exitosa del endpoint POST /upload */
const mockUploadResponse: DatasetUploadResponse = {
    fileId: "550e8400-e29b-41d4-a716-446655440000",
    columns: [
        "COD_SUCURSAL", "COD_PRODUCTO", "COD_CANAL",
        "COD_ACCTS", "COD_REGION", "COD_DIST",
        "FECHA", "CAJAS", "IMP_NETO_MN"
    ],
    rowCount: 177575,
    message: "Dataset cargado y persistido exitosamente",
    checksum: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
}

/** Mock de respuesta exitosa del endpoint GET /datasets */
const mockListResponse: DatasetListResponse = {
    total: 2,
    items: [
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            filename: "ventas_2022.csv",
            file_size_bytes: 1048576,
            row_count: 177575,
            created_at: "2026-02-08T23:00:00Z",
        },
        {
            id: "660e8400-e29b-41d4-a716-446655440001",
            filename: "ventas_2023.xlsx",
            file_size_bytes: 2097152,
            row_count: 250000,
            created_at: "2026-02-07T15:30:00Z",
        },
    ],
}

/**
 * Archivo simulador para pruebas de upload
 */
function createMockFile(name = "test.csv"): File {
    const content = `COD_SUCURSAL,COD_PRODUCTO,COD_CANAL,COD_ACCTS,COD_REGION,COD_DIST,CAJAS,IMP_NETO_MN
2018,508462,001,201020401,0101,99999,17.312,500.015`
    return new File([content], name, { type: "text/csv" })
}


// ========================================================================
// Suite: uploadDataset
// ========================================================================
describe("datasetService.uploadDataset", () => {

    beforeEach(() => {
        server.use(
            http.post(`${API.BASE_URL}/upload`, () => {
                return HttpResponse.json(mockUploadResponse)
            })
        )
    })

    it("deberia subir archivo y retornar respuesta exitosa", async () => {
        // Arrange
        const file = createMockFile()

        // Act
        const result = await datasetService.uploadDataset(
            file, TEST_TENANT_ID, TEST_USER_ID
        )

        // Assert
        expect(result.fileId).toBe("550e8400-e29b-41d4-a716-446655440000")
        expect(result.rowCount).toBe(177575)
        expect(result.columns).toHaveLength(9)
        expect(result.checksum).toBeDefined()
    })

    it("deberia enviar headers X-Tenant-ID y X-User-ID", async () => {
        // Arrange: Capturamos los headers que llegan al servidor
        let capturedTenantId: string | null = null
        let caputuredUserId: string | null = null

        server.use(
            http.post(`${API.BASE_URL}/upload`, ({ request }) => {
                capturedTenantId = request.headers.get("X-Tenant-ID")
                caputuredUserId = request.headers.get("X-User-ID")
                return HttpResponse.json(mockUploadResponse)
            })
        )

        // Act
        await datasetService.uploadDataset(
            createMockFile(), TEST_TENANT_ID, TEST_USER_ID
        )

        // Assert
        expect(capturedTenantId).toBe(TEST_TENANT_ID)
        expect(caputuredUserId).toBe(TEST_USER_ID)
    })

    it("deberia lanzar error si tenantId esta vacio", async () => {
        await expect(
            datasetService.uploadDataset(createMockFile(), "", TEST_USER_ID)
        ).rejects.toThrow()
    })

    it("deberia lanzar error si userId esta vacio", async () => {
        await expect(
            datasetService.uploadDataset(createMockFile(), TEST_TENANT_ID, "")
        ).rejects.toThrow()
    })
})


// ========================================================================
// Suite: listDatasets
// ========================================================================

describe("datasetService.listDatasets", () => {

    beforeEach(() => {
        server.use(
            http.get(`${API.BASE_URL}/datasets`, () => {
                return HttpResponse.json(mockListResponse)
            })
        )
    })

    it("deberia retornar lista de datasets", async () => {
        // Act
        const result = await datasetService.listDatasets(TEST_TENANT_ID)

        // Assert
        expect(result.total).toBe(2)
        expect(result.items).toHaveLength(2)
        expect(result.items[0].filename).toBe("ventas_2022.csv")
        expect(result.items[1].filename).toBe("ventas_2023.xlsx")
    })

    it("deberia enviar limit y offset como query params", async () => {
        // Arrange
        let capturedURL: URL | null = null

        server.use(
            http.get(`${API.BASE_URL}/datasets`, ({ request }) => {
                capturedURL = new URL(request.url)
                return HttpResponse.json(mockListResponse)
            })
        )

        // Act
        await datasetService.listDatasets(TEST_TENANT_ID, 10, 20)

        // Assert
        expect(capturedURL).not.toBeNull()
        expect(capturedURL!.searchParams.get("limit")).toBe("10")
        expect(capturedURL!.searchParams.get("offset")).toBe("20")
    })

    it("deberia enviar header X-Tenant-ID", async () => {
        // Arrange
        let capturedTenantId: string | null = null

        server.use(
            http.get(`${API.BASE_URL}/datasets`, ({ request }) => {
                capturedTenantId = request.headers.get("X-Tenant-ID")
                return HttpResponse.json(mockListResponse)
            })
        )

        // Act
        await datasetService.listDatasets(TEST_TENANT_ID)

        // Assert
        expect(capturedTenantId).toBe(TEST_TENANT_ID)
    })

    it("deberia lanzar error si tenantId esta vacio", async () => {
        await expect(
            datasetService.listDatasets("")
        ).rejects.toThrow()
    })
})

