import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "../../context/ThemeProvider"
import { Button } from "../ui/button"

export function ThemeToggle() {
    // Extraemos el tema actual y la funcion para cambiarlo del contexto flobal
    const { theme, setTheme } = useTheme()
    
    const toggleTheme = () => {
        if ( theme === 'light' ) setTheme('dark')
        else if ( theme === 'dark' ) setTheme('system')
        else setTheme('light')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Cambiar tema"
            className="relative h-9 w-9"
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'}`} />

            <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'}`} />

            <Monitor className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'}`} />

            <span className="sr-only">Cambiar tema</span>
        </Button>
    )
}