/**
 * Sistema hibrido de logging:
 * Consola del navegador
 * LocalStorage
 * Backend
 */
export { logger, Logger } from "./logger";
export type { LogLevel, LogModule, LogEntry, LoggerConfig, BackendLogPayload } from "./types";