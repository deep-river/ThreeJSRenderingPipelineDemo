"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"

interface RasterizationVisualizationProps {
  scene: THREE.Group
  showDepthBuffer: boolean
}

export function RasterizationVisualization({ scene, showDepthBuffer }: RasterizationVisualizationProps) {
  const { gl } = useThree()

  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Create a custom depth material for visualization
  const depthMaterial = useMemo(() => {
    // 正确创建 MeshDepthMaterial
    const material = new THREE.MeshDepthMaterial()

    // 设置必要的属性
    material.depthPacking = THREE.RGBADepthPacking
    material.side = THREE.DoubleSide

    // 设置 near 和 far 值
    material.userData.near = 1
    material.userData.far = 20

    return material
  }, [])

  // Create a custom shader material for pixel visualization
  const pixelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          // Create a pixelated effect
          float pixelSize = 0.02;
          vec2 pixelatedUV = floor(vUv / pixelSize) * pixelSize;
          
          // Add a grid pattern
          float gridLine = step(0.98, mod(vUv.x / pixelSize, 1.0)) + 
                          step(0.98, mod(vUv.y / pixelSize, 1.0));
          
          // Base color based on UV coordinates
          vec3 color = vec3(pixelatedUV.x, pixelatedUV.y, sin(time) * 0.5 + 0.5);
          
          // Apply grid lines
          color = mix(color, vec3(0.0), gridLine);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })
  }, [])

  // Apply materials based on visualization mode
  useEffect(() => {
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (showDepthBuffer) {
          object.material = depthMaterial
        } else {
          object.material = pixelMaterial
        }
      }
    })

    // Configure renderer for depth buffer visualization
    if (showDepthBuffer) {
      gl.setClearColor(0x000000)
    } else {
      gl.setClearColor(0x000000, 0)
    }

    return () => {
      gl.setClearColor(0x000000, 0)
    }
  }, [clonedScene, depthMaterial, pixelMaterial, showDepthBuffer, gl])

  // Animate the pixel material
  useFrame(({ clock }) => {
    if (!showDepthBuffer) {
      pixelMaterial.uniforms.time.value = clock.getElapsedTime()
    }
  })

  return <primitive object={clonedScene} />
}

