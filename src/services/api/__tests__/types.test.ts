/**
 * Tipos para predicciones filtradas
 */

import { describe, it, expect } from "vitest"
import type { PredictionFilterParams, ForecastPrediction } from "../types"

describe('PredictionFilterParams', () => {
    it('deberia aceptar parametros de filtro validos', () => {
        const params: PredictionFilterParams = {
            warehouse_code: '100306',
            product_code: '508462',
        }

        expect(params.warehouse_code).toBe('100306')
        expect(params.product_code).toBe('508462')
    })

    it('deberia aceptar objeto vacio (todos los filtros son opcionales)', () => {
        const params: PredictionFilterParams = {}
        expect(Object.keys(params)).toHaveLength(0)
    })

    it('deberia aceptar todos los filtros disponibles', () => {
        const params: PredictionFilterParams = {
            warehouse_code: '100306',
            product_code: '508462',
            channel_code: '2',
            acct_code: '100321',
            territory_code: '801',
            dist_code: '99999',
        }

        expect(params.warehouse_code).toBe('100306')
        expect(params.channel_code).toBe('2')
    })
})

describe('ForecastPrediction', () => {
    it('deberia requerir todos los campos de prediccion', () => {
        const prediction: ForecastPrediction = {
            unique_id: '100306_508462_2_100321_801_99999',
            ds: '2025-01-22T00:00:00+00:00',
            yhat: 100.0,
            y_lower: 90.0,
            y_upper: 110.0,
        }

        expect(prediction.yhat).toBe(100.0)
        expect(prediction.y_lower).toBe(90.0)
        expect(prediction.y_upper).toBe(110.0)
    })

    it('deberia tener unique_id como string', () => {
        const prediction: ForecastPrediction = {
            unique_id: '100306_508462_2_100321_801_99999',
            ds: '2025-01-22T00:00:00+00:00',
            yhat: 100.0,
            y_lower: 90.0,
            y_upper: 110.0,
        }

        expect(typeof prediction.unique_id).toBe('string')
    })

    it('deberia tener ds como string ISO 8601', () => {
        const prediction: ForecastPrediction = {
            unique_id: 'test',
            ds: '2025-01-22T00:00:00+00:00',
            yhat: 100.0,
            y_lower: 90.0,
            y_upper: 110.0,
        }

        const date = new Date(prediction.ds)
        expect(isNaN(date.getTime())).toBe(false)
    })
})

