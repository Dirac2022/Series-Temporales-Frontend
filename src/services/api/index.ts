/**
 * =======================================================================================================
 * BARREL EXPORT - API Services
 * =======================================================================================================
 * 
 * Centraliza las exportaciones de servicios de API
 */

export { forecastService } from "./forecastService"
export { reportService } from "./reportService"
export { seriesService } from "./seriesService"
export { masterService } from "./masterService"

export type {
    UploadResponse,
    ForecastStartResponse,
    ForecastStatusResponse,
    ForecastResultResponse,
    ForecastJobStatus,
    ForecastMetrics,
    ForecastPrediction,
    ForecastHorizon,
    TimeUnit,
    HistoricalDataPoint,
    ForecastConfiguration,
    BackendFileResponse,
    ReportResponse,
    ReportRow,
    JobSummary,
    JobsListResponse,
    PredictionFilterParams,
    ForecastPredictionResponse
} from "./types"

export type {
    MasterEntityType,
    MasterUploadResponse
} from "./masterService"