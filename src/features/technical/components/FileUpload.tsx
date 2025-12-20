import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X } from "lucide-react"
import Papa from "papaparse" // Librería para parsear CSVs
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void // Función que comunica los datos al padre
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [file, setFile] = React.useState<File | null>(null)

  // Configuración de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      
      // Procesamos el archivo CSV inmediatamente
      Papa.parse(selectedFile, {
        header: true, // Convierte la primera fila en llaves del objeto
        skipEmptyLines: true,
        complete: (results) => {
          onDataLoaded(results.data) // Enviamos los datos al componente padre
        }
      })
    }
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all",
          "hover:bg-primary/5 hover:border-primary",
          isDragActive ? "bg-primary/10 border-primary scale-[0.99]" : "border-muted-foreground/25"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>

        {isDragActive ? (
          <p className="text-primary font-medium text-center">¡Suéltalo aquí!</p>
        ) : (
          <div className="text-center">
            <p className="font-semibold text-lg">Haz clic o arrastra un archivo</p>
            <p className="text-sm text-muted-foreground mt-1">Formatos soportados: CSV, Excel (Próximamente Parquet)</p>
          </div>
        )}
      </div>

      {/* Indicador de archivo seleccionado */}
      {file && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md border animate-in slide-in-from-left-2">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setFile(null); onDataLoaded([]); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}