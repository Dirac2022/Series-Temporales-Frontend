/**
 * Test para el hook que consume getFilteredPredictions del servicio.
 * Usa renderHook de Testing Library para testear hooks de React
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useFilteredPredictions } from "../useFilteredPredictions"
import { seriesService } from "../../../../services/api/seriesService"
import type { ForecastPrediction, ForecastPredictionResponse } from "../../../../services/api/types"

/**
 * Mock del servicio
 */
vi.mock('../../../../services/api/seriesService', () => ({
    seriesService: {
        getFilteredPredictions: vi.fn(),
    },
}))


/**
 * Datos de prueba
 */
const mockPredictions: ForecastPredictionResponse = [
    {
        unique_id: '100306_508462_2_100321_801_99999',
        ds: '2025-01-22T00:00:00+00:00',
        yhat: 100.0,
        y_lower: 90.0,
        y_upper: 110.0,
    },
    {
        unique_id: '100306_508462_2_100321_801_99999',
        ds: '2025-01-23T00:00:00+00:00',
        yhat: 105.0,
        y_lower: 95.0,
        y_upper: 115.0,
    }
]

/**
 * Tests
 */
describe('useFilteredPredictions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('deberia iniciar con estado vacio', () => {
        const { result } = renderHook(() => useFilteredPredictions())

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('deberia obtener predicciones cuando se llama fetch', async () => {
        vi.mocked(seriesService.getFilteredPredictions).mockResolvedValue(mockPredictions)
        const { result } = renderHook(() => useFilteredPredictions())
        await act(async () => {
            await result.current.fetch({
                warehouse_code: '100306',
                product_code: '508462',
                channel_code: '2',
                acct_code: '100321',
                territory_code: '801',
                dist_code: '99999'
            })
        })

        await waitFor(() => {
            expect(result.current.data).toEqual(mockPredictions)
            expect(result.current.isLoading).toBe(false)
        })

        expect(seriesService.getFilteredPredictions).toHaveBeenCalledWith({
            warehouse_code: '100306',
            product_code: '508462',
            channel_code: '2',
            acct_code: '100321',
            territory_code: '801',
            dist_code: '99999',
        })
    })

    it('deberia manejar errores del servicio', async () => {
        const mockError = new Error('Error de prueba')
        vi.mocked(seriesService.getFilteredPredictions).mockRejectedValue(mockError)
        const { result } = renderHook(() => useFilteredPredictions())
        await act(async () => {
            await result.current.fetch({ warehouse_code: '100306' })
        })

        await waitFor(() => {
            expect(result.current.error).not.toBeNull()
            expect(result.current.data).toEqual([])
        })
    })

    it('deberia limpiar datos cuando se llama clear', async () => {
        vi.mocked(seriesService.getFilteredPredictions).mockResolvedValue(mockPredictions)
        const { result } = renderHook(() => useFilteredPredictions())
        await act(async () => {
            await result.current.fetch({ warehouse_code: '100306' })
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })

        act(() => {
            result.current.clear()
        })

        expect(result.current.data).toEqual([])
        expect(result.current.error).toBeNull()
    })

    it('deberia mostrar isLoading durante la peticion', async () => {
        let resolvePromise: (value: ForecastPredictionResponse) => void
        const promise = new Promise<ForecastPredictionResponse>((resolve) => {
            resolvePromise = resolve
        })

        vi.mocked(seriesService.getFilteredPredictions).mockReturnValue(promise)
        const { result } = renderHook(() => useFilteredPredictions())

        act(() => {
            result.current.fetch({ warehouse_code: '100306' })
        })

        expect(result.current.isLoading).toBe(true)

        await act(async () => {
            resolvePromise(mockPredictions)
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })
})