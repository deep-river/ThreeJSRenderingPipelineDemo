"use client"

import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface FragmentVisualizationProps {
  scene: THREE.Group
  lightingMode: string
}

export function FragmentVisualization({ scene, lightingMode }: FragmentVisualizationProps) {
  // 克隆场景但确保正确处理材质
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // 确保所有材质都被正确初始化
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // 深度克隆材质以避免引用问题
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material = object.material.map(mat => mat.clone());
          } else {
            object.material = object.material.clone();
          }
          // 设置needsUpdate确保材质更新
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              mat.needsUpdate = true;
            });
          } else {
            object.material.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene]);
  
  const [splitView, setSplitView] = useState(false)

  // Toggle split view every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSplitView((prev) => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Create custom materials for visualization
  const materials = useMemo(() => {
    // Base color material
    const baseColorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })

    // Normal visualization material
    const normalMaterial = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
    })

    // Phong material for lighting visualization
    const phongMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0x111111,
      side: THREE.DoubleSide,
    })

    // PBR material for physically based rendering
    const pbrMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.5,
      side: THREE.DoubleSide,
      // Add emissive for better visibility
      emissive: 0x222222,
      emissiveIntensity: 0.2,
    })

    return {
      baseColor: baseColorMaterial,
      normal: normalMaterial,
      phong: phongMaterial,
      pbr: pbrMaterial,
    }
  }, [])

  // Custom shader material for split view visualization
  const splitMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Split the view into quadrants
    vec2 quadrant = step(vec2(0.5), vUv);
    float quadrantIndex = quadrant.x + quadrant.y * 2.0;
    
    vec3 color;
    
    // Quadrant 0: Base color (bottom-left)
    if (quadrantIndex < 0.5) {
      color = vec3(0.8, 0.8, 0.8);
    }
    // Quadrant 1: Normal map (bottom-right)
    else if (quadrantIndex < 1.5) {
      color = vNormal * 0.5 + 0.5;
    }
    // Quadrant 2: Roughness/metalness (top-left)
    else if (quadrantIndex < 2.5) {
      // Simulate roughness/metalness map
      float roughness = mod(vPosition.x * 10.0 + vPosition.y * 10.0 + vPosition.z * 10.0, 1.0);
      float metalness = sin(vPosition.x * 50.0 + time) * 0.5 + 0.5;
      color = vec3(roughness, metalness, 0.0);
    }
    // Quadrant 3: Lighting calculation (top-right)
    else {
      // Simple lighting calculation
      vec3 lightDir = normalize(vec3(sin(time), 1.0, cos(time)));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      vec3 baseColor = vec3(0.8, 0.8, 0.8);
      color = baseColor * diffuse;
    }
    
    // Add grid lines to separate quadrants
    float gridLine = step(0.98, mod(vUv.x, 0.5)) + step(0.98, mod(vUv.y, 0.5));
    color = mix(color, vec3(1.0), gridLine);
    
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
        if (splitView) {
          object.material = splitMaterial
        } else {
          // Apply different materials based on lighting mode
          switch (lightingMode) {
            case "directional":
              object.material = materials.phong
              break
            case "point":
              object.material = materials.pbr
              break
            case "spot":
              object.material = materials.normal
              break
            default:
              object.material = materials.phong
          }
        }

        // Ensure material update is applied
        if (object.material) {
          object.material.needsUpdate = true
        }
      }
    })
  }, [clonedScene, materials, lightingMode, splitView, splitMaterial])

  // 当光照模式变化时确保更新材质
  useEffect(() => {
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const updateMaterial = (material: THREE.Material) => {
          // 根据不同的光照模式更新材质
          if (material instanceof THREE.MeshStandardMaterial || 
              material instanceof THREE.MeshPhongMaterial) {
            material.needsUpdate = true;
          }
        };
        
        if (Array.isArray(object.material)) {
          object.material.forEach(updateMaterial);
        } else {
          updateMaterial(object.material);
        }
      }
    });
  }, [lightingMode, clonedScene]);

  // Animate the split material
  useFrame(({ clock }) => {
    if (splitView) {
      splitMaterial.uniforms.time.value = clock.getElapsedTime()
    }
  })

  return <primitive object={clonedScene} />
}

