/**
 * Tests para el hook useReportPredictions que consume reportService
 * y maneja paginacion de 20 en 20 registros
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useReportPredictions } from "../useReportPredictions"
import { reportService } from "@/services/api/reportService"
import type { ReportResponse } from "@/services/api/types"

/**
 * Mock del servicio
 */
vi.mock("../../../../services/api/reportService", () => ({
    reportService: {
        getReportPredictions: vi.fn()
    },
}))

/**
 * Genera N filas mock para probar paginacion
 */
function generateMockRows(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        sem: 4,
        region: `Region ${i}`,
        subregion: `Subregion ${i}`,
        codWhse: `WH${i.toString().padStart(3, "0")}`,
        whseName: `Almacen ${i}`,
        plaza: `Plaza ${i}`,
        sku: `SKU${i.toString().padStart(5, "0")}`,
        marca: `Marca ${i}`,
        sabor: `Sabor ${i}`,
        formato: "0.5",
        botellas: "6",
        tipo: "PET",
        prediccion: 100 + i
    }))
}

/**
 * Mock con 45 filas para probar paginacion
 */
const mockReportResponse: ReportResponse = {
    totalRows: 45,
    rows: generateMockRows(45),
}

/**
 * Constantes de prueba
 */
const TEST_JOB_ID = "660e8400-e29b-41d4-a716-446655440001"
const TEST_TENANT_ID = "550e8400-e29b-41d4-a716-446655440000"

/**
 * Suite de tests
 */
describe("useReportPredictions", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("deberia iniciar con estado vacio", () => {
        const { result } = renderHook(() => useReportPredictions())

        expect(result.current.allRows).toEqual([])
        expect(result.current.visibleRows).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPage).toBe(0)
    })

    it("deberia cargar datos cuando se llama fetch", async () => {

        // Arrange & Act
        vi.mocked(reportService.getReportPredictions).mockResolvedValue(mockReportResponse)
        const { result } = renderHook(() => useReportPredictions())
        await act(async () => {
            await result.current.fetch(TEST_JOB_ID, TEST_TENANT_ID)
        })

        // Assert
        await waitFor(() => {
            expect(result.current.allRows).toHaveLength(45)
            expect(result.current.visibleRows).toHaveLength(20)
            expect(result.current.totalPage).toBe(3)
            expect(result.current.isLoading).toBe(false)
        })

    })

    it("deberia avanzar a la siguiente pagina con nextPage", async () => {

        // Arrange
        vi.mocked(reportService.getReportPredictions).mockResolvedValue(mockReportResponse)
        const { result } = renderHook(() => useReportPredictions())
        await act(async () => {
            await result.current.fetch(TEST_JOB_ID, TEST_TENANT_ID)
        })

        // Act
        act(() => {
            result.current.nextPage()
        })

        // Assert
        expect(result.current.currentPage).toBe(2)
        expect(result.current.visibleRows).toHaveLength(20)
        expect(result.current.visibleRows[0].region).toBe("Region 20")

    })

    it("deberia retroceder a la pagina anterior con prevPage", async () => {
        // Arrange
        const { result } = renderHook(() => useReportPredictions())
        await act(async () => {
            await result.current.fetch(TEST_JOB_ID, TEST_TENANT_ID)
        })

        // Act
        act(() => {
            result.current.nextPage()
        })
        act(() => {
            result.current.prevPage()
        })

        // Assert
        expect(result.current.currentPage).toBe(1)
        expect(result.current.visibleRows[0].region).toBe("Region 0")
    })

    it("no deberia retroceder antes de la paigna 1", async () => {
        // Arrange
        vi.mocked(reportService.getReportPredictions).mockResolvedValue(mockReportResponse)
        const { result } = renderHook(() => useReportPredictions())
        await act(async () => {
            await result.current.fetch(TEST_JOB_ID, TEST_TENANT_ID)
        })

        // Act
        act(() => { result.current.prevPage() })

        // Assert
        expect(result.current.currentPage).toBe(1)
    })

    it("deberia manejar errores del servicio", async () => {
        // Arrange
        const mockError = new Error("Error de prueba")
        vi.mocked(reportService.getReportPredictions).mockRejectedValue(mockError)
        const { result } = renderHook(() => useReportPredictions())

        // Act
        await act(async () => {
            await result.current.fetch(TEST_JOB_ID, TEST_TENANT_ID)
        })

        // Assert
        await waitFor(() => {
            expect(result.current.error).not.toBeNull()
            expect(result.current.allRows).toEqual([])
        })

    })

})