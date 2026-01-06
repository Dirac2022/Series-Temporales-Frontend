 Arquitectura del Proyecto - Forecast Platform

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables (shadcn/ui)
│   ├── ui/             # Componentes base (Button, Card, Select, etc.)
│   └── layout/         # Layout components (Header, Sidebar, Theme)
│
├── features/           # Features organizadas por dominio
│   ├── forecasting/    # Feature: Creación de forecasts
│   │   ├── components/ # Componentes específicos del feature
│   │   │   ├── FileUpload.tsx
│   │   │   └── SeriesIdentifierSelector.tsx
│   │   ├── hooks/      # Hooks personalizados
│   │   │   └── useForecast.ts
│   │   ├── pages/      # Páginas del feature
│   │   │   └── ForecastingPage.tsx
│   │   └── types/      # Tipos específicos
│   │       └── api.types.ts
│   │
│   └── results/        # Feature: Visualización de resultados
│       ├── hooks/
│       │   └── useForecastStatus.ts
│       ├── pages/
│       │   └── ResultsPage.tsx
│       └── types/
│
├── services/           # Servicios de la aplicación
│   ├── api/           # Servicios de API
│   │   ├── forecastService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── logger/        # Sistema de logging
│       ├── logger.ts
│       ├── types.ts
│       └── index.ts
│
├── lib/               # Librerías y utilidades
│   ├── errors/        # Sistema de manejo de errores
│   │   ├── types.ts
│   │   ├── handlers.ts
│   │   └── index.ts
│   └── utils.ts       # Utilidades generales
│
├── config/            # Configuración centralizada
│   └── constants.ts   # Constantes de la aplicación
│
└── context/           # Context providers (React Context)
    └── ThemeProvider.tsx
```

---

## 🏗️ Patrones de Arquitectura

### **1. Organización por Features**

Cada feature está auto-contenido con sus propios:
- Componentes
- Hooks
- Páginas
- Tipos

**Beneficio:** Fácil agregar/remover features sin afectar otros módulos.

---

### **2. Separación de Responsabilidades**

#### **Componentes (UI)**
- Presentación visual
- Manejo de eventos de UI
- Uso de hooks para lógica

#### **Hooks (Lógica de Negocio)**
- Estado compartido
- Lógica reutilizable
- Side effects (API calls, polling)

#### **Servicios (Comunicación)**
- Llamadas HTTP al backend
- Logging automático
- Manejo de errores consistente

#### **Librerías (Utilidades)**
- Funciones puras
- Sin estado
- Reutilizables en toda la app

---

## 🔄 Flujo de Datos

### **Feature: Forecasting**

```
Usuario → FileUpload → forecastService.uploadFile()
                    ↓
                 Obtiene fileId + metadatos
                    ↓
Usuario configura → mapping, identifiers, horizon
                    ↓
Usuario submit → useForecast.startForecastWithFileId()
                    ↓
              forecastService.startForecast()
                    ↓
              Obtiene jobId → navigate('/results/{jobId}')
```

### **Feature: Results**

```
ResultsPage carga → useForecastStatus(jobId)
                    ↓
              Polling automático cada 2s
                    ↓
              forecastService.getForecastStatus()
                    ↓
         status === 'completed' → getForecastResults()
                    ↓
            Muestra gráfico + métricas
```

---

## 🔐 Sistema de Logging

### **Tres destinos:**

1. **Consola del navegador** (desarrollo)
   - Logs con colores y emojis
   - Filtrados por nivel (debug/info/warn/error)

2. **localStorage** (debugging local)
   - Últimos 100 logs guardados
   - Exportables como JSON

3. **Backend** (producción)
   - Solo errores y warnings
   - Enviados a `/api/v1/logs/frontend`

### **Uso:**

```typescript
import { logger } from '@/services/logger';

logger.debug('MODULE', 'Debug info', { data });
logger.info('MODULE', 'Operation completed', { result });
logger.warn('MODULE', 'Warning message', { context });
logger.error('MODULE', 'Error occurred', { error });
```

---

## ⚠️ Sistema de Manejo de Errores

### **Clases de Error:**

- `AppError` - Error base
- `ApiError` - Errores de API (4xx, 5xx)
- `NetworkError` - Sin conexión/timeout
- `ValidationError` - Datos inválidos
- `TimeoutError` - Operación demoró mucho

### **Flujo:**

```typescript
try {
  await someOperation();
} catch (error) {
  // Convierte cualquier error a AppError tipado
  const appError = handleError(error, 'MODULE', 'Context');
  
  // Extrae mensaje para usuario
  const info = getErrorInfo(appError);
  
  // Muestra al usuario
  alert(`${info.title}: ${info.message}`);
  
  // El logging ya ocurrió automáticamente
}
```

---

## 🎨 Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Gráficos
- **Axios** - HTTP client
- **React Dropzone** - File upload

---

## 🚀 Decisiones de Diseño

### **Por qué NO Redux/Zustand?**
- Estado local suficiente para este MVP
- React hooks manejan bien el estado
- Menos complejidad innecesaria

### **Por qué hooks personalizados?**
- `useForecast`: Encapsula lógica de upload + startForecast
- `useForecastStatus`: Encapsula polling con limpieza automática
- Reutilizables y testeables

### **Por qué servicios centralizados?**
- URLs en un solo lugar
- Logging consistente
- Fácil mockear para tests
- Type-safe con TypeScript

---

## 📊 Mejores Prácticas Implementadas

✅ **Single Responsibility** - Cada módulo tiene una responsabilidad

✅ **DRY** - No repetir código (hooks, servicios)

✅ **Type Safety** - TypeScript en toda la app

✅ **Error Handling** - Consistente y centralizado

✅ **Logging** - Estructurado y filtrable

✅ **Separation of Concerns** - UI, lógica, servicios separados

✅ **Clean Code** - Nombres descriptivos, comentarios útiles