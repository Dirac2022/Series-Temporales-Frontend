import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import axios from "axios"
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { BackendFileResponse } from "../types/api.types"

interface FileUploadProps {
    onUploadSuccess: (data: BackendFileResponse, originalName: string) => void;
}

export function FileUpload({ onUploadSuccess}: FileUploadProps) {
    
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


    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' debe coincidir con el nombre esperado por el backend

        setIsUploading(true);
        setProgress(0);

        try{
            const response = await axios.post<BackendFileResponse>(
                `${import.meta.env.VITE_API_BASE_URL}/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total || file.size;
                        const current = Math.round((progressEvent.loaded * 100) / total);
                        setProgress(current);
                    },
                }
            );

            onUploadSuccess(response.data, file.name);
        } catch (error) {
            console.error("Error en el transporte de datos. Revisa la conexión con el backend:", error);
            alert("No se pudo subir el archivo")
        } finally {
            setIsUploading(false);
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
                        <p>Subiendo dataset: {progress}%</p>
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