# Forecast Platform

Frontend para una plataforma de predicción de series temporales. Permite cargar datasets, configurar parámetros de forecasting y visualizar resultados con gráficos interactivos.

## Tech Stack

- **React 19** + TypeScript
- **Vite** como bundler
- **Tailwind CSS** + shadcn/ui para estilos
- **React Router** para navegación
- **Recharts** para visualización de datos
- **Axios** para comunicación con el backend
- **Zustand** para estado global (cuando se necesite)

## Requisitos

- Node.js 18+
- pnpm (recomendado)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/iaperulabs/Series-Temporales-Frontend.git
cd Series-Temporales-Frontend

# Instalar dependencias
pnpm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173` o `http://localhost:3000`

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Si no se define, usa `http://localhost:8000/api/v1` por defecto.

## Estructura del proyecto

```
src/
├── components/         # Componentes UI reutilizables
│   ├── ui/            # Componentes base (Button, Card, Select...)
│   └── layout/        # Header, Sidebar, ThemeToggle
│
├── features/          # Features por dominio
│   ├── forecasting/   # Carga de archivos y configuración
│   └── results/       # Visualización de resultados
│
├── services/          # Servicios
│   ├── api/          # Llamadas HTTP al backend
│   └── logger/       # Sistema de logging
│
├── lib/              # Utilidades
│   └── errors/       # Manejo de errores
│
├── config/           # Constantes y configuración
└── context/          # React Context providers
```

Para más detalles, ver [ARCHITECTURE.md](./ARCHITECTURE.md).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | Ejecutar ESLint |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Página principal |
| `/forecast` | Configuración de forecast (upload, mapeo, horizonte) |
| `/results` | Estado del proceso y gráfico de resultados |
| `/results/:jobId` | Resultados de un job específico |
| `/results/:jobId/report` | Reporte detallado con tabla de predicciones |

## Backend

Este frontend consume una API REST. El backend debe implementar los siguientes endpoints:

- `POST /upload` - Subir archivo CSV/Excel
- `POST /forecast` - Iniciar job de forecasting
- `GET /forecast/:jobId/status` - Consultar estado del job
- `GET /forecast/:jobId` - Obtener resultados

Ver [API_SERVICES.md](./API_SERVICES.md) para documentación detallada de los contratos.

## Licencia

Privado - iaperulabs
