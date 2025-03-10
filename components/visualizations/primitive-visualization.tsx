"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"

interface PrimitiveVisualizationProps {
  scene: THREE.Group
  wireframe: boolean
  backfaceCulling: boolean
}

export function PrimitiveVisualization({ scene, wireframe, backfaceCulling }: PrimitiveVisualizationProps) {
  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Apply wireframe and backface culling settings
  useEffect(() => {
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.material) {
          // Create a new material to avoid modifying the original
          const material = new THREE.MeshBasicMaterial({
            color: wireframe ? 0x00ff00 : 0xffffff,
            wireframe: wireframe,
            side: backfaceCulling ? THREE.FrontSide : THREE.DoubleSide,
            vertexColors: false,
            transparent: true,
            opacity: wireframe ? 0.8 : 1.0,
          })

          // If not in wireframe mode, use a different visualization
          if (!wireframe) {
            // Create a checkerboard pattern for triangles
            const geometry = object.geometry
            const positionAttribute = geometry.getAttribute("position")
            const colors = []

            // Assign alternating colors to triangles
            for (let i = 0; i < positionAttribute.count; i += 3) {
              const color = i % 6 === 0 ? new THREE.Color(0xff5555) : new THREE.Color(0x55ff55)
              colors.push(color.r, color.g, color.b)
              colors.push(color.r, color.g, color.b)
              colors.push(color.r, color.g, color.b)
            }

            // Add colors to geometry
            geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

            // Update material to use vertex colors
            material.vertexColors = true
            material.transparent = true
            material.opacity = 0.9
          }

          object.material = material
        }
      }
    })
  }, [clonedScene, wireframe, backfaceCulling])

  return <primitive object={clonedScene} />
}

