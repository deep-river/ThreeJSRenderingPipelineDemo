"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, Zap, Waves, Circle, Grid, ScanLine, SquareAsterisk } from "lucide-react"

interface PostProcessingControlsProps {
  enableBloom: boolean
  setEnableBloom: (value: boolean) => void
  enableChromatic: boolean
  setEnableChromatic: (value: boolean) => void
  enableNoise: boolean
  setEnableNoise: (value: boolean) => void
  enableVignette: boolean
  setEnableVignette: (value: boolean) => void
  enableDotScreen: boolean
  setEnableDotScreen: (value: boolean) => void
  enableScanline: boolean
  setEnableScanline: (value: boolean) => void
  enablePixel: boolean
  setEnablePixel: (value: boolean) => void
}

export function PostProcessingControls({
  enableBloom,
  setEnableBloom,
  enableChromatic,
  setEnableChromatic,
  enableNoise,
  setEnableNoise,
  enableVignette,
  setEnableVignette,
  enableDotScreen,
  setEnableDotScreen,
  enableScanline,
  setEnableScanline,
  enablePixel,
  setEnablePixel,
}: PostProcessingControlsProps) {
  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
      <h3 className="text-sm font-semibold mb-2">Post-Processing Effects</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bloom" className="flex items-center gap-2 text-xs">
            <Sparkles size={14} className={enableBloom ? "text-yellow-400" : "text-gray-400"} />
            <span className={enableBloom ? "text-yellow-400 font-bold" : ""}>Bloom</span>
          </Label>
          <Switch
            id="bloom"
            checked={enableBloom}
            onCheckedChange={setEnableBloom}
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="chromatic" className="flex items-center gap-2 text-xs">
            <Zap size={14} className={enableChromatic ? "text-purple-400" : "text-gray-400"} />
            <span className={enableChromatic ? "text-purple-400 font-bold" : ""}>Chromatic Aberration</span>
          </Label>
          <Switch
            id="chromatic"
            checked={enableChromatic}
            onCheckedChange={setEnableChromatic}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="noise" className="flex items-center gap-2 text-xs">
            <Waves size={14} className={enableNoise ? "text-blue-400" : "text-gray-400"} />
            <span className={enableNoise ? "text-blue-400 font-bold" : ""}>Noise</span>
          </Label>
          <Switch
            id="noise"
            checked={enableNoise}
            onCheckedChange={setEnableNoise}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="vignette" className="flex items-center gap-2 text-xs">
            <Circle size={14} className={enableVignette ? "text-red-400" : "text-gray-400"} />
            <span className={enableVignette ? "text-red-400 font-bold" : ""}>Vignette</span>
          </Label>
          <Switch
            id="vignette"
            checked={enableVignette}
            onCheckedChange={setEnableVignette}
            className="data-[state=checked]:bg-red-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="dotscreen" className="flex items-center gap-2 text-xs">
            <Grid size={14} className={enableDotScreen ? "text-green-400" : "text-gray-400"} />
            <span className={enableDotScreen ? "text-green-400 font-bold" : ""}>Dot Screen</span>
          </Label>
          <Switch
            id="dotscreen"
            checked={enableDotScreen}
            onCheckedChange={setEnableDotScreen}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="scanline" className="flex items-center gap-2 text-xs">
            <ScanLine size={14} className={enableScanline ? "text-orange-400" : "text-gray-400"} />
            <span className={enableScanline ? "text-orange-400 font-bold" : ""}>Scanline</span>
          </Label>
          <Switch
            id="scanline"
            checked={enableScanline}
            onCheckedChange={setEnableScanline}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pixel" className="flex items-center gap-2 text-xs">
            <SquareAsterisk size={14} className={enablePixel ? "text-cyan-400" : "text-gray-400"} />
            <span className={enablePixel ? "text-cyan-400 font-bold" : ""}>Pixel</span>
          </Label>
          <Switch
            id="pixel"
            checked={enablePixel}
            onCheckedChange={setEnablePixel}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>
      </div>
    </div>
  )
}

