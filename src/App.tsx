import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeProvider"
import { Header } from  "./components/layout/Header"
import { Sidebar } from "./components/layout/Sidebar"
import TechnicalPage from "./features/technical/pages/TechnicalPage"

// Placehoders
const Home = () => <h2 className="text-2xl font-bold">Dashboard global</h2>
const Technical = () => <TechnicalPage />
const Executive = () => <h2 className="text-2xl font-bold">Modulo Ejecutivo</h2>
const Comparison = () => <h2 className="text-2xl font-bold">Sistema de Coparacion</h2>

function App() {
  return (
    // Proveedor global de tema
    <ThemeProvider defaultTheme="system">
      <Router>
        {/* Contenedor principal */}
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Header />

          <div className="flex">
            {/* Sidebar a la izquierda, oculto en movil */}
            <Sidebar />
              <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/technical" element={<TechnicalPage />}/>
                    <Route path="/executive" element={<Executive />}/>
                    <Route path="/comparison" element={<Comparison />}/>

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