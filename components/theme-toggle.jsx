"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
      {theme === "dark" ? <Sun className="h-5 w-5 text-purple-400" /> : <Moon className="h-5 w-5 text-purple-600" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
