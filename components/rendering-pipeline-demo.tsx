"use client"

import { useState, useRef, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Stats, Loader } from "@react-three/drei"
import { Eye, EyeOff } from "lucide-react"
import type { PipelineStage } from "@/types/pipeline"
import { Scene } from "@/components/scene"
import { ControlPanel } from "@/components/control-panel"
import { InfoPanel } from "@/components/info-panel"
import { StageSelector } from "@/components/stage-selector"
import { EnvironmentControls } from "@/components/environment-controls"
import { PostProcessingControls } from "@/components/post-processing-controls"

export function RenderingPipelineDemo() {
  const [currentStage, setCurrentStage] = useState<PipelineStage>("complete")
  const [showControls, setShowControls] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const [environment, setEnvironment] = useState<string>("daytime")
  const [wireframe, setWireframe] = useState(false)
  const [showVertices, setShowVertices] = useState(false)
  const [showNormals, setShowNormals] = useState(false)
  const [backfaceCulling, setBackfaceCulling] = useState(true)
  const [showDepthBuffer, setShowDepthBuffer] = useState(false)
  const [lightingMode, setLightingMode] = useState<string>("directional")
  const [showShadows, setShowShadows] = useState(true)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Post-processing effects
  const [enableBloom, setEnableBloom] = useState(true)
  const [enableChromatic, setEnableChromatic] = useState(true)
  const [enableNoise, setEnableNoise] = useState(true)
  const [enableVignette, setEnableVignette] = useState(false)
  const [enableDotScreen, setEnableDotScreen] = useState(false)
  const [enableScanline, setEnableScanline] = useState(false)
  const [enablePixel, setEnablePixel] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 更新调试信息，但不在控制台输出
  useEffect(() => {
    const newDebugInfo = [
      `Stage: ${currentStage}`,
      `Environment: ${environment}`,
      `Lighting: ${lightingMode}`,
      `Wireframe: ${wireframe}`,
      `Vertices: ${showVertices}`,
      `Normals: ${showNormals}`,
      `Backface Culling: ${backfaceCulling}`,
      `Depth Buffer: ${showDepthBuffer}`,
      `Shadows: ${showShadows}`,
      `Animation: ${animationEnabled}`,
      ...(currentStage === "postprocessing"
        ? [
            `Bloom: ${enableBloom}`,
            `Chromatic: ${enableChromatic}`,
            `Noise: ${enableNoise}`,
            `Vignette: ${enableVignette}`,
            `DotScreen: ${enableDotScreen}`,
            `Scanline: ${enableScanline}`,
            `Pixel: ${enablePixel}`,
          ]
        : []),
    ]
    setDebugInfo(newDebugInfo)
  }, [
    currentStage,
    environment,
    lightingMode,
    wireframe,
    showVertices,
    showNormals,
    backfaceCulling,
    showDepthBuffer,
    showShadows,
    animationEnabled,
    enableBloom,
    enableChromatic,
    enableNoise,
    enableVignette,
    enableDotScreen,
    enableScanline,
    enablePixel,
  ])

  const toggleControls = () => setShowControls(!showControls)

  // Single rendering path for all stages
  return (
    <div className="relative w-full h-full">
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 5, 5], fov: 40 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            currentStage={currentStage}
            environment={environment}
            wireframe={wireframe}
            showVertices={showVertices}
            showNormals={showNormals}
            backfaceCulling={backfaceCulling}
            showDepthBuffer={showDepthBuffer}
            lightingMode={lightingMode}
            showShadows={showShadows}
            animationEnabled={animationEnabled}
            enableBloom={enableBloom}
            enableChromatic={enableChromatic}
            enableNoise={enableNoise}
            enableVignette={enableVignette}
            enableDotScreen={enableDotScreen}
            enableScanline={enableScanline}
            enablePixel={enablePixel}
          />
        </Suspense>
        {showStats && showControls && <Stats className="stats top-0 left-0 !translate-x-[16px] !translate-y-[120px]" />}
      </Canvas>

      <Loader />

      {/* UI Controls */}
      {renderUIControls()}
    </div>
  )

  // Helper function to render UI controls to avoid duplication
  function renderUIControls() {
    return (
      <>
        {/* Stage selector at the top right */}
        <div
          className={`absolute top-4 right-4 z-10 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <StageSelector currentStage={currentStage} setCurrentStage={setCurrentStage} />
        </div>

        {/* Environment controls below stage selector */}
        <div
          className={`absolute top-20 right-4 z-10 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <EnvironmentControls environment={environment} setEnvironment={setEnvironment} />
        </div>

        {/* Post-processing controls when in post-processing stage */}
        {currentStage === "postprocessing" && (
          <div
            className={`absolute top-36 right-4 z-10 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <PostProcessingControls
              enableBloom={enableBloom}
              setEnableBloom={setEnableBloom}
              enableChromatic={enableChromatic}
              setEnableChromatic={setEnableChromatic}
              enableNoise={enableNoise}
              setEnableNoise={setEnableNoise}
              enableVignette={enableVignette}
              setEnableVignette={setEnableVignette}
              enableDotScreen={enableDotScreen}
              setEnableDotScreen={setEnableDotScreen}
              enableScanline={enableScanline}
              setEnableScanline={setEnableScanline}
              enablePixel={enablePixel}
              setEnablePixel={setEnablePixel}
            />
          </div>
        )}

        {/* Title and info panel */}
        <div
          className={`absolute top-0 left-0 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          } flex items-start p-4`}
        >
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
            <h1 className="text-xl font-bold mb-2">3D Rendering Pipeline</h1>
            <p className="text-sm text-gray-300">Interactive educational demo</p>
          </div>

          <InfoPanel currentStage={currentStage} showControls={showControls} />
        </div>

        {/* Control panel at the bottom */}
        <div
          className={`absolute bottom-0 left-0 w-full transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ControlPanel
            currentStage={currentStage}
            wireframe={wireframe}
            setWireframe={setWireframe}
            showVertices={showVertices}
            setShowVertices={setShowVertices}
            showNormals={showNormals}
            setShowNormals={setShowNormals}
            backfaceCulling={backfaceCulling}
            setBackfaceCulling={setBackfaceCulling}
            showDepthBuffer={showDepthBuffer}
            setShowDepthBuffer={setShowDepthBuffer}
            lightingMode={lightingMode}
            setLightingMode={setLightingMode}
            showShadows={showShadows}
            setShowShadows={setShowShadows}
            animationEnabled={animationEnabled}
            setAnimationEnabled={setAnimationEnabled}
            showStats={showStats}
            setShowStats={setShowStats}
          />
        </div>

        {/* Debug panel */}
        <div
          className={`absolute bottom-24 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs z-20 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h3 className="font-bold mb-1">Debug Info:</h3>
          <ul>
            {debugInfo.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
        </div>

        {/* Toggle controls button */}
        <button
          onClick={toggleControls}
          className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/90 transition-colors"
          title={showControls ? "Hide Controls" : "Show Controls"}
        >
          {showControls ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </>
    )
  }
}

