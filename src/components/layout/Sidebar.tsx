import * as React from "react"
import { NavLink } from "react-router-dom"
import { 
    LayoutDashboard,
    TrendingUp,
    FilePieChart,
    Settings
} from "lucide-react"
import { cn } from "../../lib/utils"

// Definimos la estructua de los items de navegacion para que el componente sea mantenible
const navItems = [
    { name: "Inicio", href: "/", icon: LayoutDashboard },
    { name: "Generar Predicción", href: "/forecast", icon: TrendingUp },
    { name: "Resultados", href: "/results", icon: FilePieChart },
]

export function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14">
            <div className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                // Estilo base: Texto sutil y hover con fondo suave
                                "text-muted-foreground hover:text-foreground hover:bg-accent",
                                // Estilo activo: Si la URL coicide, resaltamos con el color primario
                                isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                            )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </NavLink>
                ))}
            </div>

            {/* SECCIÓN INFERIOR OPCIONAL PARA AJUSTES DEL SISTEMA */}
            <div className="p-4 border-t">
                <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Settings className="h-4 w-4" />
                    Configuracion
                </button>
            </div>
        </aside>
    )
}