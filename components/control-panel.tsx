"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { PipelineStage } from "@/types/pipeline"
import { Eye, EyeOff, Box, Activity, Layers, Palette, SunMedium, Play, Pause, RotateCcw } from "lucide-react"

interface ControlPanelProps {
  currentStage: PipelineStage
  wireframe: boolean
  setWireframe: (value: boolean) => void
  showVertices: boolean
  setShowVertices: (value: boolean) => void
  showNormals: boolean
  setShowNormals: (value: boolean) => void
  backfaceCulling: boolean
  setBackfaceCulling: (value: boolean) => void
  showDepthBuffer: boolean
  setShowDepthBuffer: (value: boolean) => void
  lightingMode: string
  setLightingMode: (value: string) => void
  showShadows: boolean
  setShowShadows: (value: boolean) => void
  animationEnabled: boolean
  setAnimationEnabled: (value: boolean) => void
  showStats: boolean
  setShowStats: (value: boolean) => void
}

export function ControlPanel({
  currentStage,
  wireframe,
  setWireframe,
  showVertices,
  setShowVertices,
  showNormals,
  setShowNormals,
  backfaceCulling,
  setBackfaceCulling,
  showDepthBuffer,
  setShowDepthBuffer,
  lightingMode,
  setLightingMode,
  showShadows,
  setShowShadows,
  animationEnabled,
  setAnimationEnabled,
  showStats,
  setShowStats,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState("general")

  // Automatically switch to stage tab when a stage is selected
  useEffect(() => {
    if (currentStage !== "complete") {
      setActiveTab("stage")
    }
  }, [currentStage])

  // Render controls based on the current pipeline stage
  const renderStageControls = () => {
    switch (currentStage) {
      case "vertex":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-vertices" className="flex items-center gap-2">
                <Box size={16} />
                Show Vertices
              </Label>
              <Switch id="show-vertices" checked={showVertices} onCheckedChange={setShowVertices} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-normals" className="flex items-center gap-2">
                <Activity size={16} />
                Show Normals
              </Label>
              <Switch id="show-normals" checked={showNormals} onCheckedChange={setShowNormals} />
            </div>
          </div>
        )
      case "primitive":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="wireframe" className="flex items-center gap-2">
                <Layers size={16} />
                Wireframe Mode
              </Label>
              <Switch id="wireframe" checked={wireframe} onCheckedChange={setWireframe} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="backface-culling" className="flex items-center gap-2">
                {backfaceCulling ? <Eye size={16} /> : <EyeOff size={16} />}
                Backface Culling
              </Label>
              <Switch id="backface-culling" checked={backfaceCulling} onCheckedChange={setBackfaceCulling} />
            </div>
          </div>
        )
      case "rasterization":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="depth-buffer" className="flex items-center gap-2">
                <Layers size={16} />
                Depth Buffer
              </Label>
              <Switch id="depth-buffer" checked={showDepthBuffer} onCheckedChange={setShowDepthBuffer} />
            </div>
          </div>
        )
      case "fragment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette size={16} />
                Shading Model
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={lightingMode === "directional" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLightingMode("directional")}
                  className={
                    lightingMode !== "directional" ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : ""
                  }
                >
                  Phong
                </Button>
                <Button
                  variant={lightingMode === "point" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLightingMode("point")}
                  className={
                    lightingMode !== "point" ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : ""
                  }
                >
                  PBR
                </Button>
                <Button
                  variant={lightingMode === "spot" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLightingMode("spot")}
                  className={
                    lightingMode !== "spot" ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : ""
                  }
                >
                  Normal
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shadows" className="flex items-center gap-2">
                <SunMedium size={16} />
                Shadows
              </Label>
              <Switch id="shadows" checked={showShadows} onCheckedChange={setShowShadows} />
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center text-sm text-gray-400">
            Select a specific pipeline stage to see relevant controls
          </div>
        )
    }
  }

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="general">General Controls</TabsTrigger>
            <TabsTrigger value="stage">Stage Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="animation" className="flex items-center gap-2">
                {animationEnabled ? <Play size={16} /> : <Pause size={16} />}
                Animation
              </Label>
              <Switch id="animation" checked={animationEnabled} onCheckedChange={setAnimationEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stats" className="flex items-center gap-2">
                <Activity size={16} />
                Show Stats
              </Label>
              <Switch id="stats" checked={showStats} onCheckedChange={setShowStats} />
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
                onClick={() => {
                  // Reset camera position
                  const event = new CustomEvent("reset-camera")
                  window.dispatchEvent(event)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Camera
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stage" className="space-y-4">
            {renderStageControls()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

