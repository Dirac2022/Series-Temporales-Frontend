/**
 * Test para el metodo que consume GET /predictions/filtered
 * Usa MSW para mockear las respuestas HTTP del backend
 */
import { describe, it, expect, beforeEach } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "../../../test/setup"
import { seriesService } from "../seriesService"
import { API } from "../../../config/constants"
import type { ForecastPredictionResponse } from "../types"

/**
 * Datos mock para simular retorno de backend
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
describe('seriesService.getFilteredPredictions', () => {
    beforeEach(() => {
        server.use(
            http.get(`${API.BASE_URL}/predictions/filtered`, ({ request }) => {
                const url = new URL(request.url)
                const validFilters = [
                    'warehouse_code',
                    'product_code',
                    'channel_code',
                    'acct_code',
                    'territory_code',
                    'dist_code',
                ]
                const hasAnyFilter = validFilters.some(
                    filter => url.searchParams.has(filter)
                )
                if (!hasAnyFilter) {
                    return HttpResponse.json(
                        { detail: 'At least one filter is required' },
                        { status: 400 }
                    )
                }

                return HttpResponse.json(mockPredictions)
            })
        )
    })

    it('deberia retornar predicciones cuando se proporcionan filtros validos', async () => {
        const result = await seriesService.getFilteredPredictions({
            warehouse_code: '100306',
        })

        expect(result).toHaveLength(2)
        expect(result[0].yhat).toBe(100.0)
        expect(result[0].unique_id).toBe('100306_508462_2_100321_801_99999')
    })

    it('deberia lanzar error cando no se proporcionan filtros', async () => {
        await expect(
            seriesService.getFilteredPredictions({})
        ).rejects.toThrow()
    })

    it('deberia retornar array vacio cuando no hay concidencias', async () => {
        server.use(
            http.get(`${API.BASE_URL}/predictions/filtered`, () => {
                return HttpResponse.json([])
            })
        )

        const result = await seriesService.getFilteredPredictions({
            warehouse_code: 'NOEXISTENT',
        })

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('deberia enviar multiples filtros en la query', async () => {
        let capturedUrl: URL | null = null
        server.use(
            http.get(`${API.BASE_URL}/predictions/filtered`, ({ request }) => {
                capturedUrl = new URL(request.url)
                return HttpResponse.json(mockPredictions)
            })
        )

        await seriesService.getFilteredPredictions({
            warehouse_code: '100306',
            product_code: '508462',
            channel_code: '2',
            acct_code: '100321',
            territory_code: '801',
            dist_code: '99999',
        })

        expect(capturedUrl).not.toBeNull()
        expect(capturedUrl!.searchParams.get('product_code')).toBe('508462')
        expect(capturedUrl!.searchParams.get('channel_code')).toBe('2')
        expect(capturedUrl!.searchParams.get('acct_code')).toBe('100321')
        expect(capturedUrl!.searchParams.get('territory_code')).toBe('801')
        expect(capturedUrl!.searchParams.get('dist_code')).toBe('99999')
        expect(capturedUrl!.searchParams.get('warehouse_code')).toBe('100306')
    })
})