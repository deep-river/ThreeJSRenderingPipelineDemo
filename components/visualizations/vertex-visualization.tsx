"use client"

import { useRef } from "react"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface VertexVisualizationProps {
  scene: THREE.Group
  showVertices: boolean
  showNormals: boolean
}

export function VertexVisualization({ scene, showVertices, showNormals }: VertexVisualizationProps) {
  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Extract vertices and normals from the scene
  const { vertices, normals } = useMemo(() => {
    const extractedVertices: THREE.Vector3[] = []
    const extractedNormals: { origin: THREE.Vector3; dir: THREE.Vector3 }[] = []

    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry
        const positionAttribute = geometry.getAttribute("position")
        const normalAttribute = geometry.getAttribute("normal")

        if (positionAttribute && normalAttribute) {
          const worldMatrix = object.matrixWorld

          let vertexCount = 0
          const samplingRate = 100 // Sample fewer vertices for performance

          for (let i = 0; i < positionAttribute.count; i += samplingRate) {
            // Extract vertex position
            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute(positionAttribute, i)
            vertex.applyMatrix4(worldMatrix)
            extractedVertices.push(vertex)

            // Extract normal
            const normal = new THREE.Vector3()
            normal.fromBufferAttribute(normalAttribute, i)
            normal.transformDirection(worldMatrix)

            extractedNormals.push({
              origin: vertex.clone(),
              dir: normal,
            })

            vertexCount++
            if (vertexCount > 500) break // Limit vertex count for performance
          }
        }
      }
    })

    return { vertices: extractedVertices, normals: extractedNormals }
  }, [clonedScene])

  // Create points geometry for vertices
  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints(vertices)
    return geometry
  }, [vertices])

  // Create lines geometry for normals
  const normalsGeometry = useMemo(() => {
    const normalLines: THREE.Vector3[] = []

    normals.forEach(({ origin, dir }) => {
      normalLines.push(origin)
      normalLines.push(origin.clone().add(dir.multiplyScalar(0.5))) // Normal length
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints(normalLines)
    return geometry
  }, [normals])

  // Animation for vertices
  useFrame(({ clock }) => {
    if (showVertices) {
      const pointsMaterial = pointsRef.current?.material as THREE.PointsMaterial
      if (pointsMaterial) {
        pointsMaterial.size = 0.2 + Math.sin(clock.getElapsedTime() * 2) * 0.05 // Point size
      }
    }
  })

  const pointsRef = useRef<THREE.Points>(null)
  const normalsRef = useRef<THREE.LineSegments>(null)

  // Apply wireframe to all meshes
  useEffect(() => {
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.material) {
          object.material = new THREE.MeshBasicMaterial({
            color: 0x888888,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
          })
        }
      }
    })
  }, [clonedScene])

  return (
    <group>
      {/* Render the wireframe model */}
      <primitive object={clonedScene} />

      {/* Render vertices as points */}
      {showVertices && (
        <points ref={pointsRef} geometry={pointsGeometry}>
          <pointsMaterial color={0x00ffff} size={0.2} sizeAttenuation={true} />
        </points>
      )}

      {/* Render normals as lines */}
      {showNormals && (
        <lineSegments ref={normalsRef} geometry={normalsGeometry}>
          <lineBasicMaterial color={0xff00ff} />
        </lineSegments>
      )}
    </group>
  )
}

