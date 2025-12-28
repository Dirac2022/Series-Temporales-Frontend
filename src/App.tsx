import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeProvider"
import { Header } from  "./components/layout/Header"
import { Sidebar } from "./components/layout/Sidebar"
import TechnicalPage from "./features/forecasting/pages/ForecastingPage"
import ResultsPage from "./features/results/pages/ResultsPage"
import { logger } from "./services/logger"
import { useEffect } from "react"

// Placehoders
const Home = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-foreground">Bienvenido a la Plataforma de Predicción</h2>  
  </div>
)

function App() {
  // Prueba del logger al iniciar el app
  useEffect(() => {
    // Log de inicio de aplicación
    logger.info("APP", "Aplicación iniciada correctamente");

    // Log con datos adicionales
    logger.info("APP", "Información del entorno", {
      mode: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_BASE_URL,
      timestamp: new Date().toISOString()
    });

    // Log de warning
    logger.warn("APP", "Esta es una prueba de warning");

    // Log de error
    logger.error("APP", "Prueba de envío de error al backend", {
      test: true,
      errorType: "test",
      additionalInfo: "Este erro debería aparecer en los logs del backend"
    });

    // Log de debug (solo visible en desarrollo)
    logger.debug("APP", "Logger system test completed", {
      features: ["console", "localStorage", "backend"]
    });
  }, []);

  return (
    // Proveedor global de tema
    <ThemeProvider defaultTheme="system">
      <Router>
        {/* CONTENEDOR PRINCIPAL */}
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Header />

          <div className="flex">
            {/* SIDEBAR A LA IZQUIERDA (Oculto en móvil) */}
            <Sidebar />
              <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/forecast" element={<TechnicalPage />}/>
                    <Route path="/results" element={<ResultsPage />}/>
                    <Route path="/results/:jobId" element={<ResultsPage />}/>

                    {/* Ruta 404 */}
                    <Route path="*" element={
                      <div className="flex flex-col items-center justify-center h-[50vh]">
                        <h1 className="text-4xl font-bold">404</h1>
                        <p className="text-muted-foreground">Página no encontrada</p>
                      </div>
                    }/>
                  </Routes>
                </div>
              </main>
          </div>
        </div>
      </Router>
      
    </ThemeProvider>
  )
}

export default App