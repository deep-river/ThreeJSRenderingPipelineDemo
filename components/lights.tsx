"use client"

import { useRef, useEffect } from "react"
import { forwardRef } from "react"
import * as THREE from "three"

interface LightProps {
  castShadow?: boolean
  position?: [number, number, number]
}

export const DirectionalLight = forwardRef<THREE.DirectionalLight, LightProps>(
  ({ castShadow = true, position = [5, 5, 5] }, ref) => {
    return (
      <directionalLight
        ref={ref}
        position={position}
        intensity={1.5}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    )
  },
)

DirectionalLight.displayName = "DirectionalLight"

export const PointLight = forwardRef<THREE.PointLight, LightProps>(
  ({ castShadow = true, position = [5, 5, 5] }, ref) => {
    // 修复类型错误 - 使用正确的类型
    const pointLightRef = useRef<THREE.Object3D>(null)

    // 使用条件检查来避免类型错误
    useEffect(() => {
      if (pointLightRef.current) {
        const helper = new THREE.PointLightHelper(
          pointLightRef.current as unknown as THREE.PointLight,
          0.5,
          new THREE.Color("hotpink"),
        )
        pointLightRef.current.parent?.add(helper)

        return () => {
          pointLightRef.current?.parent?.remove(helper)
        }
      }
    }, [])

    return (
      <pointLight
        ref={ref}
        position={position}
        intensity={1}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        distance={20}
        decay={2}
      />
    )
  },
)

PointLight.displayName = "PointLight"

export const SpotLight = forwardRef<THREE.SpotLight, LightProps>(({ castShadow = true, position = [5, 5, 5] }, ref) => {
  // 修复类型错误 - 使用正确的类型
  const spotLightRef = useRef<THREE.Object3D>(null)

  // 使用条件检查来避免类型错误
  useEffect(() => {
    if (spotLightRef.current) {
      const helper = new THREE.SpotLightHelper(
        spotLightRef.current as unknown as THREE.SpotLight,
        new THREE.Color("cyan"),
      )
      spotLightRef.current.parent?.add(helper)

      return () => {
        spotLightRef.current?.parent?.remove(helper)
      }
    }
  }, [])

  return (
    <spotLight
      ref={ref}
      position={position}
      angle={Math.PI / 6}
      penumbra={0.5}
      intensity={1.5}
      castShadow={castShadow}
      shadow-mapSize={[1024, 1024]}
      target-position={[0, 0, 0]}
    />
  )
})

SpotLight.displayName = "SpotLight"

