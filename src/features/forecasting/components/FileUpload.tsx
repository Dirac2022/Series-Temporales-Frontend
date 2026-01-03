import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Loader2 } from "lucide-react" 
// TODO: // FileText from "lucide-react" como vista cuando se carga un archivo
import { cn } from "../../../lib/utils"
import type { BackendFileResponse } from "../../../services/api/types"
import { logger } from "../../../services/logger"
import { forecastService } from "../../../services/api"
import { getErrorInfo, handleError } from "../../../lib/errors"

interface FileUploadProps {
    onUploadSuccess: (data: BackendFileResponse, originalName: string, file: File) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    
    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/octet-stream': ['.parquet']
        },
        maxFiles: 1,
        disabled: isUploading,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) await handleUpload(file);
        }
    });


    /**
     * Upload con progreso real
     * 
     * 1. forecastService.uploadFile() acepta callback de progreso
     * 2. Axios llama al callback multiples veces durante el upload
     * 3. Actualizamos el estado con el progreso real
     * 4. La barra refleja el progreso exacto del upload
     */
    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setProgress(0);

        try{

            logger.info("UI", "Iniciando upload de archivo desde FileUpload", {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            const response = await forecastService.uploadFile(file, (progressPercent) => {
                setProgress(progressPercent);

                // Log cada 25 % para debugging
                if (progressPercent % 25 === 0) {
                    logger.debug("UI", `Upload progress: ${progressPercent}%`, { fileName: file.name,});
                }
            })
            
            logger.info("UI", "Upload completado exitosamente desde FileUpload", {
                fileId: response.fileId,
                rowCount: response.rowCount,
            });

            // Llama a callback con File incluido
            onUploadSuccess(response, file.name, file);

        } catch (error) {
            const appError = handleError(error, "UI", "Upload file from component");
            const info = getErrorInfo(appError)
            logger.error("UI", "Error en upload desde FileUpload", {
                fileName: file.name,
                errorMessage: info.message,
            });
            
            // TODO: Reemplazar con toast/notificacion
            alert(`${info.title}: ${info.message}`);
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all",
                    isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary/5 hover:border-primary",
                    isDragActive ? "bg-primary/10 border-primary" : "border-muted-foreground/25"
                )}
            >
                <input {...getInputProps()}/>

                {isUploading ? (
                    <div className="flex flex-col items-center w-full max-w-xs">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p>Enviando archivo: {progress}%</p>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%`}}
                            />
                        </div>
                    </div>
                    ) : (
                    <div className="text-center">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium">Arrastra tu dataset aquí</p>
                        <p className="text-xs text-muted-foreground">CSV, Excel o Parquet</p>
                    </div>
                )}

            </div>
        </div>
    )
}
