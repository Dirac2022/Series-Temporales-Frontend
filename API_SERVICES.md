# API Services & Hooks - Forecast Platform

## 📡 Servicios de API

### **forecastService**

Centraliza todas las llamadas HTTP relacionadas con forecasting.

**Ubicación:** `src/services/api/forecastService.ts`

---

#### **uploadFile()**

Sube un archivo al servidor.

**Uso:**

```typescript
import { forecastService } from '@/services/api';

const response = await forecastService.uploadFile(
  file,
  (progress) => console.log(`${progress}%`)  // Opcional
);

console.log(response.fileId);  // ID del archivo
console.log(response.columns); // Columnas detectadas
console.log(response.rowCount); // Número de filas
```

**Parámetros:**
- `file: File` - Archivo a subir (CSV, XLSX, Parquet)
- `onProgress?: (progress: number) => void` - Callback de progreso (0-100)

**Retorna:** `Promise<UploadResponse>`

**Errores:** Lanza `AppError` si falla

---

####  **startForecast()**

Inicia un trabajo de forecasting.

**Uso:**

```typescript
const response = await forecastService.startForecast({
  fileId: 'file-123',
  mapping: {
    timestamp: 'date',
    target: 'sales',
    seriesIdentifiers: ['product', 'store']
  },
  horizon: { value: 4, unit: 'weeks' }
});

console.log(response.jobId);  // ID del trabajo
```

**Parámetros:**
- `config: ForecastConfiguration`

**Retorna:** `Promise<ForecastStartResponse>`

---

#### **getForecastStatus()**

Consulta el estado de un forecast.

**Uso:**

```typescript
const status = await forecastService.getForecastStatus('job-123');

console.log(status.status);  // 'queued' | 'running' | 'completed' | 'failed'
console.log(status.stage);   // Etapa actual
```

**Parámetros:**
- `jobId: string` - ID del trabajo

**Retorna:** `Promise<ForecastStatusResponse>`

---

#### **getForecastResults()**

Obtiene los resultados de un forecast completado.

**Uso:**

```typescript
const results = await forecastService.getForecastResults('job-123');

console.log(results.predictions);  // Array de predicciones
console.log(results.metrics);      // Métricas de error
console.log(results.history);      // Datos históricos
```

**Parámetros:**
- `jobId: string` - ID del trabajo

**Retorna:** `Promise<ForecastResultResponse>`

---

## 🎣 Hooks Personalizados

### **useForecast()**

Hook para iniciar forecasts.

**Ubicación:** `src/features/forecasting/hooks/useForecast.ts`

**Uso:**

```typescript
import { useForecast } from '../hooks/useForecast';

function MyComponent() {
  const { 
    startForecastWithFileId, 
    isLoading, 
    error 
  } = useForecast();

  const handleStart = async () => {
    try {
      const jobId = await startForecastWithFileId('file-123', {
        mapping: {
          timestamp: 'date',
          target: 'sales',
          seriesIdentifiers: ['product']
        },
        horizon: { value: 4, unit: 'weeks' }
      });
      
      navigate(`/results/${jobId}`);
    } catch (error) {
      // Error ya está loggeado y en el estado del hook
      const info = getErrorInfo(error);
      alert(info.message);
    }
  };

  return (
    <button onClick={handleStart} disabled={isLoading}>
      {isLoading ? 'Procesando...' : 'Generar Forecast'}
    </button>
  );
}
```

**Retorna:**

```typescript
{
  startForecastWithFileId: (fileId, config) => Promise<jobId>,
  uploadAndStartForecast: (file, config) => Promise<jobId>,  // Legacy
  isLoading: boolean,
  error: AppError | null,
  uploadedFileMetadata: UploadResponse | null,
  reset: () => void
}
```

**Cuándo usar cada función:**

- **`startForecastWithFileId()`** ✅ - Usa esta (archivo ya subido)
- **`uploadAndStartForecast()`** ⚠️ - Solo si necesitas subir + iniciar en un paso

---

### **useForecastStatus()**

Hook para polling de estado de forecast.

**Ubicación:** `src/features/results/hooks/useForecastStatus.ts`

**Uso:**

```typescript
import { useForecastStatus } from '../hooks/useForecastStatus';

function MyComponent({ jobId }) {
  const { status, isLoading, error, refetch } = useForecastStatus(jobId);

  if (isLoading) return <Loader />;
  if (error) return <Error error={error} />;
  
  return (
    <div>
      <p>Estado: {status?.status}</p>
      <p>Etapa: {status?.stage}</p>
      <button onClick={refetch}>Refrescar</button>
    </div>
  );
}
```

**Parámetros:**

```typescript
jobId: string | null           // ID del forecast (null = no consultar)
options?: {
  interval?: number,           // Intervalo de polling (default: 2000ms)
  enabled?: boolean,           // Si debe hacer polling (default: true)
  onStatusChange?: (status) => void  // Callback cuando cambia estado
}
```

**Retorna:**

```typescript
{
  status: ForecastStatusResponse | null,
  isLoading: boolean,
  error: AppError | null,
  refetch: () => Promise<void>
}
```

**Características:**

- ✅ Polling automático cada 2 segundos
- ✅ Se detiene cuando status es 'completed' o 'failed'
- ✅ Limpieza automática al desmontar componente
- ✅ Logging automático de cambios de estado

---

## 🛡️ Sistema de Manejo de Errores

### **handleError()**

Convierte cualquier error en `AppError` tipado.

**Uso:**

```typescript
import { handleError, getErrorInfo } from '@/lib/errors';

try {
  await someOperation();
} catch (error) {
  const appError = handleError(error, 'MODULE', 'Operation context');
  const info = getErrorInfo(appError);
  
  alert(`${info.title}: ${info.message}`);
}
```

**Parámetros:**
- `error: unknown` - Error de cualquier tipo
- `module: LogModule` - Módulo donde ocurrió
- `context?: string` - Contexto adicional

**Retorna:** `AppError`

**Beneficios:**
- ✅ Logging automático con TODO el detalle técnico
- ✅ Mensajes amigables para usuario
- ✅ Type-safe
- ✅ Stack traces preservados

---

## 📊 Sistema de Logging

### **logger**

Sistema de logging híbrido.

**Ubicación:** `src/services/logger/logger.ts`

**Uso:**

```typescript
import { logger } from '@/services/logger';

// Nivel DEBUG (solo desarrollo)
logger.debug('MODULE', 'Debug info', { value: 123 });

// Nivel INFO
logger.info('MODULE', 'Operation completed', { result });

// Nivel WARNING
logger.warn('MODULE', 'Something unusual', { context });

// Nivel ERROR
logger.error('MODULE', 'Operation failed', { error });
```

**Módulos disponibles:**
- `'API'` - Llamadas HTTP
- `'UI'` - Interacciones de usuario
- `'STORAGE'` - localStorage
- `'VALIDATION'` - Validaciones
- `'FORECAST'` - Lógica de forecasting
- `'RESULTS'` - Lógica de resultados
- `'APP'` - Eventos generales

**Métodos adicionales:**

```typescript
// Ver logs guardados
const logs = logger.getStoredLogs();

// Limpiar logs
logger.clearStoredLogs();

// Exportar como JSON
logger.exportLogs();

// Agrupar logs relacionados
logger.group('Label', () => {
  logger.info('API', 'Step 1');
  logger.info('API', 'Step 2');
});

// Medir tiempo de operación
logger.time('Operation');
await longOperation();
logger.timeEnd('Operation');
```

**Configuración:**

- **Desarrollo:** Todos los logs en consola
- **Producción:** Solo warnings/errors → enviados al backend
- **localStorage:** Últimos 100 logs guardados

---

## 🔗 Tipos Compartidos

### **ForecastConfiguration**

```typescript
interface ForecastConfiguration {
  fileId: string;
  mapping: ColumnMapping;
  horizon: ForecastHorizon;
}
```

### **ColumnMapping**

```typescript
interface ColumnMapping {
  timestamp: string;              // Columna de fecha
  target: string;                 // Variable a predecir
  seriesIdentifiers: string[];    // Identificadores de serie
}
```

### **ForecastHorizon**

```typescript
interface ForecastHorizon {
  value: number;
  unit: 'days' | 'weeks' | 'months';
}
```

### **ForecastStatusResponse**

```typescript
interface ForecastStatusResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  stage: string;
  message?: string;
  error?: string;
  updatedAt: string;
}
```

---

## 💡 Mejores Prácticas

### **1. Siempre usar servicios en lugar de axios directo:**

```typescript
// ❌ MAL
const response = await axios.get('/api/forecast/123');

// ✅ BIEN
const response = await forecastService.getForecastResults('123');
```

### **2. Usar handleError para manejo consistente:**

```typescript
// ❌ MAL
try {
  await operation();
} catch (error) {
  console.error(error);
  alert('Error');
}

// ✅ BIEN
try {
  await operation();
} catch (error) {
  const appError = handleError(error, 'MODULE', 'Context');
  const info = getErrorInfo(appError);
  alert(`${info.title}: ${info.message}`);
}
```

### **3. Loggear operaciones importantes:**

```typescript
logger.info('MODULE', 'Starting operation', { params });
const result = await operation();
logger.info('MODULE', 'Operation completed', { result });
```

### **4. Usar hooks para lógica reutilizable:**

```typescript
// ❌ MAL: Lógica de polling duplicada en componentes

// ✅ BIEN: Hook encapsula polling
const { status } = useForecastStatus(jobId);
```