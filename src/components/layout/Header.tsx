import * as React from "react"
import { ThemeToggle } from "./ThemeToggle"
import { BarChart3, Menu } from "lucide-react"
import { Button } from "../ui/button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 max-w-screen-2xl mx-auto">
                
                {/* Seccion izquierda: Logo y Nombre */}
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:inline-block">
                        Forecast<span className="text-primary">Platform</span>
                    </span>
                </div>

                { /* Seccion derecha: Acciones y navegacion */ }
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>

                    <nav className="flex items-center gap-1">
                        <ThemeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}