import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { FileUpload } from "../components/FileUpload"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Button } from "../../../components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { ModelSelector } from "../components/ModelSelector"

export default function TechnicalPage() {
  const [dataset, setDataset] = React.useState<any[] | null>(null)
  
  // Estado para el mapeo de columnas
  const [mapping, setMapping] = React.useState({
    timestamp: "",
    target: "",
  })

const [modelConfig, setModelConfig] = React.useState<any>(null)

  // Extraemos los nombres de las columnas del primer registro del dataset
  const columns = dataset && dataset.length > 0 ? Object.keys(dataset[0]) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Forecasting</h1>
        <p className="text-muted-foreground">Prepara los datos para el entrenamiento del modelo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Carga y Configuración (2/3 de ancho) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Carga de Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onDataLoaded={(data) => setDataset(data)} />
            </CardContent>
          </Card>

          {dataset && (
            <Card className="animate-in fade-in slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle>2. Mapeo de Columnas</CardTitle>
                <CardDescription>Define la estructura técnica de tus datos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de Timestamp */}
                  <div className="space-y-2">
                    <Label>Columna de Tiempo (Timestamp)</Label>
                    <Select onValueChange={(val) => setMapping(prev => ({...prev, timestamp: val}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selector de Target */}
                  <div className="space-y-2">
                    <Label>Variable Objetivo (Target)</Label>
                    <Select onValueChange={(val) => setMapping(prev => ({...prev, target: val}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {mapping.target && mapping.timestamp && (
            <Card className="animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                    <CardTitle>Selección de Modelo</CardTitle>
                    <CardDescription>Elige y configura el modelo de forecasting.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ModelSelector onConfigChange={(config) => setModelConfig(config)}/>
                </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha: Resumen de Validación (1/3 de ancho) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Registros:</span>
                <span className="font-mono">{dataset?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Columnas detectadas:</span>
                <span className="font-mono">{columns.length}</span>
              </div>
              
              <hr className="border-border" />

              {/* Status de configuración */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {mapping.timestamp ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <AlertCircle className="text-yellow-500 h-4 w-4" />}
                  <span className={mapping.timestamp ? "text-foreground" : "text-muted-foreground"}>Timestamp configurado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {mapping.target ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <AlertCircle className="text-yellow-500 h-4 w-4" />}
                  <span className={mapping.target ? "text-foreground" : "text-muted-foreground"}>Target configurado</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                disabled={!mapping.timestamp || !mapping.target}
              >
                Confirmar Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}