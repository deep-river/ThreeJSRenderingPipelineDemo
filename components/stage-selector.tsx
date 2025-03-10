"use client"

import type React from "react"

import type { PipelineStage } from "@/types/pipeline"
import { Button } from "@/components/ui/button"
import { Box, Layers, Activity, Palette, SunMedium, LayoutGrid } from "lucide-react"

interface StageSelectorProps {
  currentStage: PipelineStage
  setCurrentStage: (stage: PipelineStage) => void
}

export function StageSelector({ currentStage, setCurrentStage }: StageSelectorProps) {
  const stages: { value: PipelineStage; label: string; icon: React.ReactNode }[] = [
    { value: "complete", label: "Complete", icon: <LayoutGrid size={16} /> },
    { value: "vertex", label: "Vertex", icon: <Box size={16} /> },
    { value: "primitive", label: "Primitive", icon: <Layers size={16} /> },
    { value: "rasterization", label: "Rasterization", icon: <Activity size={16} /> },
    { value: "fragment", label: "Fragment", icon: <Palette size={16} /> },
    { value: "postprocessing", label: "Post-Processing", icon: <SunMedium size={16} /> },
  ]

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 flex flex-wrap gap-2">
      {stages.map((stage) => (
        <Button
          key={stage.value}
          variant={currentStage === stage.value ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setCurrentStage(stage.value)}
        >
          {stage.icon}
          <span className="hidden sm:inline">{stage.label}</span>
        </Button>
      ))}
    </div>
  )
}

