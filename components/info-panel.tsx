"use client"

import { useState, useEffect } from "react"
import type { PipelineStage } from "@/types/pipeline"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

interface InfoPanelProps {
  currentStage: PipelineStage
  showControls: boolean
}

export function InfoPanel({ currentStage, showControls }: InfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close the panel when controls are hidden
  useEffect(() => {
    if (!showControls) {
      setIsOpen(false)
    }
  }, [showControls])

  const getStageInfo = () => {
    switch (currentStage) {
      case "vertex":
        return {
          title: "Vertex Processing",
          description:
            "In this stage, the GPU processes each vertex of the 3D model. Vertex shaders transform the vertices from model space to clip space through a series of matrix transformations (model, view, projection). This stage also handles vertex attributes like positions, normals, and texture coordinates.",
          keyPoints: [
            "Transforms vertices from model space to clip space",
            "Applies model, view, and projection matrices",
            "Processes vertex attributes (position, normal, UV)",
            "Prepares data for primitive assembly",
          ],
        }
      case "primitive":
        return {
          title: "Primitive Assembly",
          description:
            "After vertex processing, the GPU assembles the transformed vertices into primitives (points, lines, triangles). This stage determines how vertices connect to form the 3D geometry. Backface culling is also applied here, removing triangles that face away from the camera to improve performance.",
          keyPoints: [
            "Connects vertices to form primitives (triangles)",
            "Performs backface culling to remove hidden surfaces",
            "Clips primitives against the view frustum",
            "Prepares primitives for rasterization",
          ],
        }
      case "rasterization":
        return {
          title: "Rasterization",
          description:
            "Rasterization converts the 3D primitives into 2D fragments (potential pixels) on the screen. The GPU determines which pixels are covered by each primitive and generates fragments for those pixels. The depth buffer (Z-buffer) is used to handle occlusion, ensuring that only the closest fragments to the camera are visible.",
          keyPoints: [
            "Converts 3D primitives to 2D fragments (potential pixels)",
            "Determines which pixels are covered by each primitive",
            "Uses the depth buffer (Z-buffer) to handle occlusion",
            "Interpolates vertex attributes for each fragment",
          ],
        }
      case "fragment":
        return {
          title: "Fragment Processing",
          description:
            "Fragment shaders process each fragment generated during rasterization. This stage determines the final color of each fragment based on lighting calculations, material properties, and textures. PBR (Physically Based Rendering) calculations for realistic lighting happen here, including diffuse, specular, and ambient components.",
          keyPoints: [
            "Calculates the final color for each fragment",
            "Applies textures (color, normal, roughness, metalness)",
            "Performs lighting calculations (diffuse, specular, ambient)",
            "Handles transparency and other material properties",
          ],
        }
      case "postprocessing":
        return {
          title: "Post-Processing",
          description:
            "Post-processing applies screen-space effects to the rendered image after the 3D scene has been rendered. These effects can enhance the visual quality or create stylistic looks. Common post-processing effects include bloom (glow), chromatic aberration, film grain, vignette, and color grading.",
          keyPoints: [
            "Applies effects to the final rendered image",
            "Enhances visual quality with bloom, depth of field, etc.",
            "Creates stylistic looks with color grading, vignette, etc.",
            "Improves realism with ambient occlusion, motion blur, etc.",
          ],
        }
      case "complete":
      default:
        return {
          title: "Complete Rendering Pipeline",
          description:
            "This view shows the final rendered result after all pipeline stages have been completed. The 3D model is fully rendered with lighting, materials, and textures applied. You can select specific pipeline stages from the controls to visualize and learn about each step of the rendering process.",
          keyPoints: [
            "Final rendered result with all effects applied",
            "Select specific pipeline stages to learn more",
            "Experiment with different visualization options",
            "Explore how 3D graphics are rendered in real-time",
          ],
        }
    }
  }

  const info = getStageInfo()

  if (!showControls) return null

  return (
    <>
      {/* Position the info button to the right of the title box */}
      <Button
        variant="outline"
        size="icon"
        className="ml-2 bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 z-10"
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-black/90 backdrop-blur-md rounded-lg p-6 max-w-md w-full text-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{info.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mb-4 text-gray-300">{info.description}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Concepts:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                {info.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <Button variant="default" className="w-full" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

