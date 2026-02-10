import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Loader2, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { logger } from "../../../services/logger"
import { masterService, type MasterEntityType } from "../../../services/api"
import { getErrorInfo, handleError } from "../../../lib/errors"

interface MasterUploadCardProps {
    entityType: MasterEntityType;
    title: string;
    description: string;
}

type UploadState = "idle" | "confirm" | "uploading" | "success" | "error";

export function MasterUploadCard({ entityType, title, description }: MasterUploadCardProps) {

    const [status, setStatus] = React.useState<UploadState>("idle");
    const [progress, setProgress] = React.useState(0);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [resultMessage, setResultMessage] = React.useState<string>("");

    // Configuración de Dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxFiles: 1,
        disabled: status === "uploading",
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                setSelectedFile(file);
                setStatus("confirm");
                logger.debug("UI", `Archivo seleccionado para ${entityType}`, { fileName: file.name });
            }
        }
    });

    /**
     * Confirma y ejecuta la carga
     */
    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setStatus("uploading");
        setProgress(0);

        try {
            const response = await masterService.uploadMasterData(selectedFile, entityType, (pct) => {
                setProgress(pct);
            });

            setResultMessage(`Dataset cargado: ${selectedFile.name} (${response.processed_count.toLocaleString()} filas)`);
            setStatus("success");

            // Auto-reset después de 5 segundos? No, mejor dejarlo visible.

        } catch (error) {
            const appError = handleError(error, "UI", `Upload master ${entityType}`);
            const info = getErrorInfo(appError);
            setResultMessage(info.message);
            setStatus("error");
        }
    };

    /**
     * Cancela la selección
     */
    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar abrir el dropzone de nuevo
        setSelectedFile(null);
        setStatus("idle");
        setResultMessage("");
    };

    /**
     * Resetea el componente solo si está en error o success
     */
    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setStatus("idle");
        setResultMessage("");
    };

    return (
        <div
            className={cn(
                "group relative border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm transition-all h-full flex flex-col",
                status === "idle" && "hover:border-primary/50 hover:shadow-md"
            )}
        >
            {/* Header del Card */}
            <div className="p-4 space-y-1 border-b bg-muted/20">
                <h3 className="font-semibold tracking-tight text-base flex items-center gap-2">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Cuerpo del Card - Area Interactiva */}
            <div className="flex-1 p-4 relative min-h-[160px] flex flex-col justify-center">

                {/* 1. ESTADO: IDLE (Dropzone) */}
                {status === "idle" && (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "absolute inset-0 m-2 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className={cn("h-8 w-8 mb-2 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
                        <p className="text-sm font-medium">Arrastra tu CSV aquí</p>
                        <p className="text-xs text-muted-foreground mt-1">o haz clic para buscar</p>
                    </div>
                )}

                {/* 2. ESTADO: CONFIRMACION */}
                {status === "confirm" && selectedFile && (
                    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-1.5 rounded-full max-w-full">
                            <FileText className="h-4 w-4" />
                            <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-md text-center">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mx-auto mb-1" />
                            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                                Esto reemplazará todos los datos existentes.
                            </p>
                        </div>

                        <div className="flex gap-2 w-full">
                            <Button size="sm" variant="ghost" className="flex-1" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button size="sm" className="flex-1" onClick={handleConfirmUpload}>
                                Confirmar
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. ESTADO: UPLOADING */}
                {status === "uploading" && (
                    <div className="flex flex-col items-center justify-center w-full space-y-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subiendo...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. ESTADO: SUCCESS o ERROR */}
                {(status === "success" || status === "error") && (
                    <div className="flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
                        {status === "success" ? (
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                                <XCircle className="h-6 w-6" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className={cn("text-sm font-medium", status === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
                                {status === "success" ? "Carga Exitosa" : "Error en la carga"}
                            </p>
                            <p className="text-xs text-muted-foreground break-words max-w-[200px] mx-auto">
                                {resultMessage}
                            </p>
                        </div>

                        <Button size="sm" variant="outline" onClick={handleReset} className="h-8 text-xs">
                            {status === "success" ? "Cargar otro" : "Intentar de nuevo"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Banner de estado fijo abajo (solo success) - Replica exacta del screenshot */}
            {status === "success" && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900/50 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                        {resultMessage}
                    </span>
                </div>
            )}
        </div>
    );
}
