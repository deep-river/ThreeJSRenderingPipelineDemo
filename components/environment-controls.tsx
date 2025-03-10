"use client"

import { Button } from "@/components/ui/button"
import { Sun, Moon, CloudRain } from "lucide-react"

interface EnvironmentControlsProps {
  environment: string
  setEnvironment: (environment: string) => void
}

export function EnvironmentControls({ environment, setEnvironment }: EnvironmentControlsProps) {
  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 flex gap-2">
      <Button
        variant={environment === "daytime" ? "default" : "outline"}
        size="icon"
        onClick={() => setEnvironment("daytime")}
        title="Daytime Environment"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={environment === "nighttime" ? "default" : "outline"}
        size="icon"
        onClick={() => setEnvironment("nighttime")}
        title="Nighttime Environment"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={environment === "rainy" ? "default" : "outline"}
        size="icon"
        onClick={() => setEnvironment("rainy")}
        title="Rainy Environment"
      >
        <CloudRain className="h-4 w-4" />
      </Button>
    </div>
  )
}

