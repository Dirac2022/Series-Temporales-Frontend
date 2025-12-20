import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { ModelType, ModelConfiguration } from "../types/models"

// Definición de los modelos disponibles y sus parámetros técnicos
const MODELS_REGISTRY: ModelConfiguration[] = [
  {
    id: 'TFT',
    name: 'Temporal Fusion Transformer',
    description: 'Ideal para datasets grandes con múltiples variables externas.',
    hyperparameters: [
      { name: 'epochs', label: 'Épocas de entrenamiento', type: 'number', defaultValue: 100 },
      { name: 'learning_rate', label: 'Tasa de aprendizaje', type: 'number', defaultValue: 0.001 }
    ]
  },
  {
    id: 'Prophet',
    name: 'Facebook Prophet',
    description: 'Especializado en estacionalidades fuertes y días festivos.',
    hyperparameters: [
      { name: 'changepoint_prior_scale', label: 'Flexibilidad de tendencia', type: 'number', defaultValue: 0.05 }
    ]
  }
]

interface ModelSelectorProps {
  onConfigChange: (config: any) => void;
}

export function ModelSelector({ onConfigChange }: ModelSelectorProps) {
  const [selectedModelId, setSelectedModelId] = React.useState<ModelType | "">("")
  const [params, setParams] = React.useState<Record<string, any>>({})

  // Buscar la configuración del modelo seleccionado actualmente
  const selectedModel = MODELS_REGISTRY.find(m => m.id === selectedModelId)

  // Función para manejar cambios en los parámetros
  const handleParamChange = (name: string, value: any) => {
    const newParams = { ...params, [name]: value };
    setParams(newParams);
    onConfigChange({ modelId: selectedModelId, parameters: newParams });
  }

  return (
    <div className="space-y-6">
      {/* Selector de Modelo Principal */}
      <div className="space-y-2">
        <Label className="text-base">Seleccionar Modelo</Label>
        <Select onValueChange={(val: ModelType) => {
          setSelectedModelId(val);
          // Reiniciar parámetros con los valores por defecto del nuevo modelo
          const model = MODELS_REGISTRY.find(m => m.id === val);
          const defaults = model?.hyperparameters.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.defaultValue }), {});
          setParams(defaults || {});
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elige un algoritmo de forecasting..." />
          </SelectTrigger>
          <SelectContent>
            {MODELS_REGISTRY.map(model => (
              <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Renderizado Dinámico de Hiperparámetros */}
      {selectedModel && (
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Hiperparámetros: {selectedModel.id}
            </CardTitle>
            <CardDescription>{selectedModel.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedModel.hyperparameters.map(param => (
                <div key={param.name} className="space-y-1.5">
                  <Label htmlFor={param.name} className="text-xs uppercase font-bold opacity-70">
                    {param.label}
                  </Label>
                  <Input
                    id={param.name}
                    type={param.type}
                    value={params[param.name] || ""}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}