import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { FileUpload } from "../components/FileUpload"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Button } from "../../../components/ui/button"
import { CheckCircle2, AlertCircle, Car } from "lucide-react"
import { ModelSelector } from "../components/ModelSelector"
import { BackendFileResponse } from "../types/api.types"

export default function TechnicalPage() {
  
  // Estado para los metadatos devueltos por el servidor
  const [metadata, setMetadata] = React.useState<BackendFileResponse | null>(null);

  // Para capturar la intención del usuario
  const [mapping, setMapping] = React.useState({
    timestamp: "",
    target: "",
  });


  const [modelConfig, setModelConfig] = React.useState<any>(null);

  const columns = metadata?.columns || [];
  const [fileName, setFileName] = React.useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Módulo técnico</h1>
        <p className="text-muted-foreground">Configuración avanzada</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-6">
          {/* Carga al backend */}
          <Card>
            <CardHeader>
              <CardTitle>Carga del Dataset</CardTitle>
              <CardDescription>El archivo será procesado integramente en el motor de ML</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadSuccess={(data, name) => {
                setMetadata(data);
                setFileName(name);
                }} 
              />
            </CardContent>
          </Card>


          {metadata && (
            <div className="flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 rounded-md animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Dataset cargado: <span className="font-bold">{fileName}</span></span>
            </div>
          )}
          {/* Mapeo de metadatos (si los hay xd)*/}
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Mapeo de columnas</CardTitle>
                <CardDescription>Indica cómo se deben interpretar las columnas del dataset</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Columna de tiempo (Requerido)</Label>
                  <Select onValueChange={(v) => setMapping(p => ({...p, timestamp: v}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..."/>
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Variable objetivo (Requerido)</Label>
                  <Select onValueChange={(v) => setMapping(p => ({...p, target: v}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..."/>
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modelado */}
          {mapping.timestamp && mapping.target && (
            <Card className="animate-in fade-in slide-in-from-botton-4">
              <CardHeader>
                <CardTitle>Selección de Algoritmo</CardTitle>
              </CardHeader>
              <CardContent>
                <ModelSelector onConfigChange={setModelConfig}/>
              </CardContent>
            </Card>
          )}
        </div>

          {/* Panel de resumen */}
          <aside className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Estado del Proceso</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Filas en el servidor:</span>
                  <span className="font-mono">{metadata?.rowCount.toLocaleString() || 0}</span>
                </div>
                <hr />
                <ul className="space-y-3">
                  <StatusItem label="Archivo recibido" isComplete={!!metadata}/>
                  <StatusItem label="Tiempo Definido" isComplete={!!mapping.timestamp}/>
                  <StatusItem label="Target Definido" isComplete={!!mapping.target} />
                </ul>
                <Button
                  className="w-full mt-4"
                  disabled={!mapping.timestamp || !mapping.target || !modelConfig}
                >
                  Lanzar Entrenamiento
                </Button>
              </CardContent>
            </Card>
          </aside>
      </div>
    </div>
  )

}

function StatusItem({ label, isComplete }: { label: string, isComplete: boolean}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500"/>
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground opacity-50" />
      )}
      <span className={isComplete ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </li>
  )
}