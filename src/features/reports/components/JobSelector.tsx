/**
 * Componente selector de Jobs para la pagina de reportes
 * 
 * Muestra un dropdown con los jobs disponibles que tienen
 * status 'completed' en la base de datos
 * 
 * USO:
 * ```tsx
 * <JobSelector
 *   jobs={jobs}
 *   selectedJobId={selectedId}
 *   onSelectJob={(jobId) => setSelectedId(jobId)}
 *   isLoading={isLoading}
 * />
 */

import type { JobSummary } from "@/services/api/types"

/**
 * Props del componente
 *  - jobs: Lista de jobs disponibles del backend
 *  - selectedJobId: ID del job actualmente seleccionado  (puede ser null)
 *  - onSelectJob: Callback cuando el usuario selecciona un job
 *  - isLoading: Estado de carga (para deshabilitar el selector)
 *  - disabled: Deshabilitar el selector manualmente
 */
interface JobSelectorProps {
    jobs: JobSummary[]
    selectedJobId: string | null
    onSelectJob: (jobId: string) => void
    isLoading?: boolean
    disabled?: boolean
}

/**
 * Componente del selector de jobs
 */
export function JobSelector({
    jobs,
    selectedJobId,
    onSelectJob,
    isLoading = false,
    disabled = false
}: JobSelectorProps) {

    /**
     * Handler paa cuando cambia la seleccion del dropdown
     */
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value) {
            onSelectJob(value)
        }
    }

    return (
        <div className="w-full max-w-md">
            <label
                htmlFor="job-selector"
                className="block text-sm font-medium mb-2"
            >
                Seleccionar Pronostico
            </label>
            <div className="relative">
                <select
                    id="job-selector"
                    value={selectedJobId || ""}
                    onChange={handleChange}
                    disabled={isLoading || disabled || jobs.length === 0}
                    className="w-full p-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="" disabled>
                        {
                            isLoading
                                ? "Cargando..."
                                : jobs.length === 0
                                    ? "No hay pronósticos disponibles"
                                    : "Selecciona un pronóstico"
                        }
                    </option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                            {job.id}
                        </option>
                    ))}
                </select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {jobs.length > 0
                    ? `${jobs.length} pronóstico${jobs.length > 1 ? "s" : ""} disponible${jobs.length > 1 ? "s" : ""}`
                    : "Ejecuta un pronóstico para ver opciones"
                }
            </p>
        </div>
    )
}