import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeProvider"
import { Header } from "./components/layout/Header"
import { Sidebar } from "./components/layout/Sidebar"
import TechnicalPage from "./features/forecasting/pages/ForecastingPage"
import HomePage from "./features/home/pages/HomePage"
import PredictionsPage from "./features/predictions/pages/PredictionsPage"
import ResultsPage from "./features/results/pages/ResultsPage"
import ReportPage from "./features/reports/pages/ReportPage"
import MasterDatasetsPage from "./features/masters/pages/MasterDatasetsPage"

function App() {

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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/forecast" element={<TechnicalPage />} />
                  <Route path="/predictions" element={<PredictionsPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/results/:jobId" element={<ResultsPage />} />
                  <Route path="/reports/" element={<ReportPage />} />
                  <Route path="/masters" element={<MasterDatasetsPage />} />

                  {/* Ruta 404 */}
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                      <h1 className="text-4xl font-bold">404</h1>
                      <p className="text-muted-foreground">Página no encontrada</p>
                    </div>
                  } />
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
