"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import type { PipelineStage } from "@/types/pipeline"
import { DirectionalLight, SpotLight, PointLight } from "@/components/lights"
import { CustomPostProcessing } from "@/components/custom-post-processing"

// 更新props接口以包含后处理效果标志
interface SceneProps {
  currentStage: PipelineStage
  environment: string
  wireframe: boolean
  showVertices: boolean
  showNormals: boolean
  backfaceCulling: boolean
  showDepthBuffer: boolean
  lightingMode: string
  showShadows: boolean
  animationEnabled: boolean
  // 后处理props
  enableBloom?: boolean
  enableChromatic?: boolean
  enableNoise?: boolean
  enableVignette?: boolean
  enableDotScreen?: boolean
  enableScanline?: boolean
  enablePixel?: boolean
}

export function Scene({
  currentStage,
  environment,
  wireframe,
  showVertices,
  showNormals,
  backfaceCulling,
  showDepthBuffer,
  lightingMode,
  showShadows,
  animationEnabled,
  enableBloom,
  enableChromatic,
  enableNoise,
  enableVignette,
  enableDotScreen,
  enableScanline,
  enablePixel,
}: SceneProps) {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  const pointLightRef = useRef<THREE.PointLight>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const { gl, camera, scene } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const [torusRotation, setTorusRotation] = useState(0)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null)
  const timeRef = useRef(0)

  // 创建基本几何形状组
  const geometryGroup = useMemo(() => {
    const group = new THREE.Group()

    // 创建立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x6699ff,
      metalness: 0.3,
      roughness: 0.7,
    })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cube.position.set(-1.5, 0, 0)
    cube.castShadow = true
    cube.receiveShadow = true
    group.add(cube)

    // 创建球体
    const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6666,
      metalness: 0.1,
      roughness: 0.2,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(1.5, 0, 0)
    sphere.castShadow = true
    sphere.receiveShadow = true
    group.add(sphere)

    // 创建环面
    const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100)
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x66ff99,
      metalness: 0.5,
      roughness: 0.5,
    })
    const torus = new THREE.Mesh(torusGeometry, torusMaterial)
    torus.position.set(0, 1.2, 0)
    torus.rotation.x = Math.PI / 2
    torus.castShadow = true
    torus.receiveShadow = true
    group.add(torus)

    // 创建地面平面
    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.1,
      roughness: 0.9,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = Math.PI / 2
    plane.position.y = -1.5
    plane.receiveShadow = true
    group.add(plane)

    return group
  }, [])

  // 组件挂载时设置模型
  useEffect(() => {
    if (groupRef.current) {
      // 清除当前组中的所有对象
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0])
      }

      // 添加新的几何体组
      groupRef.current.add(geometryGroup.clone())
      setModelLoaded(true)
    }
  }, [geometryGroup])

  // 使用 useEffect 替代 useHelper 来创建辅助对象
  useEffect(() => {
    // 创建方向光辅助器
    if (directionalLightRef.current) {
      const dirLightHelper = new THREE.DirectionalLightHelper(
        directionalLightRef.current,
        0.5,
        new THREE.Color("yellow"),
      )
      directionalLightRef.current.parent?.add(dirLightHelper)

      return () => {
        directionalLightRef.current?.parent?.remove(dirLightHelper)
      }
    }
  }, [])

  useEffect(() => {
    // 创建点光源辅助器
    if (pointLightRef.current) {
      const pointLightHelper = new THREE.PointLightHelper(pointLightRef.current, 0.5, new THREE.Color("hotpink"))
      pointLightRef.current.parent?.add(pointLightHelper)

      return () => {
        pointLightRef.current?.parent?.remove(pointLightHelper)
      }
    }
  }, [])

  useEffect(() => {
    // 创建聚光灯辅助器
    if (spotLightRef.current) {
      const spotLightHelper = new THREE.SpotLightHelper(spotLightRef.current, new THREE.Color("cyan"))
      spotLightRef.current.parent?.add(spotLightHelper)

      return () => {
        spotLightRef.current?.parent?.remove(spotLightHelper)
      }
    }
  }, [])

  // 模型加载后重置相机
  useEffect(() => {
    if (modelLoaded && camera) {
      camera.position.set(5, 5, 5)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }
  }, [modelLoaded, camera])

  // 环面动画
  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime()

    if (animationEnabled) {
      setTorusRotation(clock.getElapsedTime() * 0.5)
    }

    // 更新光栅化阶段的像素材质
    if (currentStage === "rasterization" && !showDepthBuffer) {
      groupRef.current?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material
          if (material instanceof THREE.ShaderMaterial && material.uniforms && material.uniforms.time) {
            material.uniforms.time.value = timeRef.current
          }
        }
      })
    }
  })

  useEffect(() => {
    if (groupRef.current) {
      // 查找环面（第三个子对象）
      const torus = groupRef.current.children[0]?.children[2]
      if (torus) {
        torus.rotation.z = torusRotation
      }
    }
  }, [torusRotation])

  // 处理窗口事件
  useEffect(() => {
    // 窗口大小变化时重置相机
    const handleResize = () => {
      if (camera) {
        // 检查相机是否是透视相机
        if ("aspect" in camera) {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
        }
      }
    }

    window.addEventListener("resize", handleResize)

    // 用户点击重置按钮时重置相机
    const handleResetCamera = () => {
      if (camera) {
        camera.position.set(5, 5, 5)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      }
    }

    window.addEventListener("reset-camera", handleResetCamera)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("reset-camera", handleResetCamera)
    }
  }, [camera])

  // 根据环境更新光照
  useEffect(() => {
    // 不再完全移除光源，而是更新现有光源
    let ambientIntensity = 0.5;
    let ambientColor = 0x404040;
    let directionalIntensity = 1.5;
    let directionalColor = 0xffffff;
    let lightPosition: [number, number, number] = [5, 5, 5];

    switch (environment) {
      case "daytime":
        ambientIntensity = 0.7;
        ambientColor = 0xffffff;
        directionalIntensity = 1.5;
        directionalColor = 0xffffff;
        lightPosition = [5, 5, 5];
        break;
      case "nighttime":
        ambientIntensity = 0.2;
        ambientColor = 0x101020;
        directionalIntensity = 0.8;
        directionalColor = 0xaaaaff;
        lightPosition = [3, 5, 3];
        break;
      case "rainy":
        ambientIntensity = 0.4;
        ambientColor = 0x606080;
        directionalIntensity = 1.0;
        directionalColor = 0xcccccc;
        lightPosition = [4, 6, 4];
        break;
    }

    // 更新或创建环境光
    if (ambientLightRef.current) {
      ambientLightRef.current.color.set(ambientColor);
      ambientLightRef.current.intensity = ambientIntensity;
    } else {
      const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
      scene.add(ambientLight);
      ambientLightRef.current = ambientLight;
    }

    // 更新方向光属性
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = directionalIntensity;
      directionalLightRef.current.color.set(directionalColor);
      directionalLightRef.current.position.set(...lightPosition);
      // 确保阴影图需要更新
      directionalLightRef.current.shadow.needsUpdate = true;
    }

    // 更新点光源属性
    if (pointLightRef.current) {
      pointLightRef.current.intensity = directionalIntensity;
      pointLightRef.current.color.set(directionalColor);
      pointLightRef.current.position.set(...lightPosition);
      pointLightRef.current.shadow.needsUpdate = true;
    }

    // 更新聚光灯属性
    if (spotLightRef.current) {
      spotLightRef.current.intensity = directionalIntensity;
      spotLightRef.current.color.set(directionalColor);
      spotLightRef.current.position.set(...lightPosition);
      spotLightRef.current.shadow.needsUpdate = true;
    }

    // 强制更新场景中所有材质
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            mat.needsUpdate = true;
          });
        } else {
          object.material.needsUpdate = true;
        }
      }
    });

  }, [scene, environment]);

  // 根据当前阶段应用可视化
  useEffect(() => {
    if (!groupRef.current || groupRef.current.children.length === 0) return

    // 获取第一个子对象，应该是我们的几何体组
    const geometryGroup = groupRef.current.children[0]
    if (!geometryGroup) return

    // 清除之前的可视化
    while (groupRef.current.children.length > 1) {
      groupRef.current.remove(groupRef.current.children[1])
    }

    // 根据当前阶段应用可视化
    switch (currentStage) {
      case "vertex":
        applyVertexVisualization(geometryGroup, showVertices, showNormals)
        break
      case "primitive":
        applyPrimitiveVisualization(geometryGroup, wireframe, backfaceCulling)
        break
      case "rasterization":
        applyRasterizationVisualization(geometryGroup, showDepthBuffer)
        break
      case "fragment":
        applyFragmentVisualization(geometryGroup, lightingMode)
        break
      case "postprocessing":
        applyPostProcessingVisualization(geometryGroup)
        break
      case "complete":
      default:
        applyCompleteVisualization(geometryGroup)
        break
    }
  }, [currentStage, showVertices, showNormals, wireframe, backfaceCulling, showDepthBuffer, lightingMode])

  // 在组件加载后进行额外的初始化
  useEffect(() => {
    if (currentStage === "complete" && groupRef.current) {
      // 确保Complete阶段下所有材质都正确初始化
      groupRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => {
              mat.needsUpdate = true;
            });
          } else {
            object.material.needsUpdate = true;
          }
        }
      });
    }
  }, [currentStage, modelLoaded]);

  // 顶点可视化
  const applyVertexVisualization = (group: THREE.Object3D, showVertices: boolean, showNormals: boolean) => {
    // 对所有网格应用线框
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // 深度克隆材质以避免修改原始材质
        const material =
          object.material instanceof THREE.Material
            ? object.material.clone()
            : Array.isArray(object.material)
              ? object.material.map((m) => m.clone())
              : new THREE.MeshBasicMaterial()

        if (!Array.isArray(material)) {
          // 使用类型断言确保TypeScript知道这个材质有wireframe属性
          const basicMaterial = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            color: new THREE.Color(0x888888),
          })
          object.material = basicMaterial
        }
      }
    })

    if (showVertices) {
      // 从所有网格中提取顶点
      const vertices: THREE.Vector3[] = []
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const geometry = object.geometry
          const positionAttribute = geometry.getAttribute("position")

          for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3()
            vertex.fromBufferAttribute(positionAttribute, i)
            vertex.applyMatrix4(object.matrixWorld)
            vertices.push(vertex)
          }
        }
      })

      // 为顶点创建点
      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices)
      const pointsMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.1,
        sizeAttenuation: true,
      })
      const points = new THREE.Points(pointsGeometry, pointsMaterial)
      groupRef.current?.add(points)
    }

    if (showNormals) {
      // 从所有网格中提取法线
      const normalLines: THREE.Vector3[] = []
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const geometry = object.geometry
          const positionAttribute = geometry.getAttribute("position")
          const normalAttribute = geometry.getAttribute("normal")

          if (normalAttribute) {
            for (let i = 0; i < positionAttribute.count; i++) {
              const vertex = new THREE.Vector3()
              vertex.fromBufferAttribute(positionAttribute, i)
              vertex.applyMatrix4(object.matrixWorld)

              const normal = new THREE.Vector3()
              normal.fromBufferAttribute(normalAttribute, i)
              normal.transformDirection(object.matrixWorld)

              normalLines.push(vertex.clone())
              normalLines.push(vertex.clone().add(normal.multiplyScalar(0.2)))
            }
          }
        }
      })

      // 为法线创建线
      const linesGeometry = new THREE.BufferGeometry().setFromPoints(normalLines)
      const linesMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff })
      const lines = new THREE.LineSegments(linesGeometry, linesMaterial)
      groupRef.current?.add(lines)
    }
  }

  // 图元可视化
  const applyPrimitiveVisualization = (group: THREE.Object3D, wireframe: boolean, backfaceCulling: boolean) => {
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // 深度克隆材质以避免修改原始材质
        const material = new THREE.MeshBasicMaterial({
          color: wireframe ? 0x00ff00 : 0xffffff,
          wireframe: wireframe,
          side: backfaceCulling ? THREE.FrontSide : THREE.DoubleSide,
          vertexColors: false,
          transparent: true,
          opacity: wireframe ? 0.8 : 1.0,
        })

        // 如果不是线框模式，使用不同的可视化
        if (!wireframe) {
          // 为三角形创建棋盘格图案
          const geometry = object.geometry.clone()
          const positionAttribute = geometry.getAttribute("position")
          const colors = []

          // 为三角形分配交替的颜色
          for (let i = 0; i < positionAttribute.count; i += 3) {
            const color = i % 6 === 0 ? new THREE.Color(0xff5555) : new THREE.Color(0x55ff55)
            colors.push(color.r, color.g, color.b)
            colors.push(color.r, color.g, color.b)
            colors.push(color.r, color.g, color.b)
          }

          // 将颜色添加到几何体
          geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

          // 更新材质以使用顶点颜色
          material.vertexColors = true
          material.transparent = true
          material.opacity = 0.9

          // 替换几何体
          object.geometry.dispose()
          object.geometry = geometry
        }

        object.material = material
      }
    })
  }

  // 光栅化可视化
  const applyRasterizationVisualization = (group: THREE.Object3D, showDepthBuffer: boolean) => {
    // 配置渲染器以进行深度缓冲区可视化
    if (showDepthBuffer) {
      gl.setClearColor(0x000000)
    } else {
      gl.setClearColor(0x000000, 0)
    }

    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (showDepthBuffer) {
          // 创建深度材质
          const depthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            side: THREE.DoubleSide,
          })

          // 使用userData存储near和far值
          depthMaterial.userData = {
            near: 1,
            far: 20,
          }

          object.material = depthMaterial
        } else {
          // 创建像素着色器材质
          const pixelMaterial = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: timeRef.current },
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
                // 创建像素化效果
                float pixelSize = 0.05;
                vec2 pixelatedUV = floor(vUv / pixelSize) * pixelSize;
                
                // 添加网格图案
                float gridLine = step(0.98, mod(vUv.x / pixelSize, 1.0)) + 
                                step(0.98, mod(vUv.y / pixelSize, 1.0));
                
                // 基于UV坐标的基本颜色
                vec3 color = vec3(pixelatedUV.x, pixelatedUV.y, sin(time) * 0.5 + 0.5);
                
                // 应用网格线
                color = mix(color, vec3(0.0), gridLine);
                
                gl_FragColor = vec4(color, 1.0);
              }
            `,
            side: THREE.DoubleSide,
          })
          object.material = pixelMaterial
        }
      }
    })
  }

  // 片段可视化
  const applyFragmentVisualization = (group: THREE.Object3D, lightingMode: string) => {
    // 基于着色模型创建材质
    const materials = {
      phong: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        specular: 0x111111,
        side: THREE.DoubleSide,
      }),
      pbr: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.5,
        side: THREE.DoubleSide,
        emissive: 0x222222,
        emissiveIntensity: 0.2,
      }),
      normal: new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
      }),
    }

    // 根据着色模型选择应用材质
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        switch (lightingMode) {
          case "directional":
            object.material = materials.phong.clone()
            break
          case "point":
            object.material = materials.pbr.clone()
            break
          case "spot":
            object.material = materials.normal.clone()
            break
          default:
            object.material = materials.phong.clone()
        }
      }
    })
  }

  // 后处理可视化 - 修改为使用标准材质
  const applyPostProcessingVisualization = (group: THREE.Object3D) => {
    // 重置场景到与complete阶段相同的状态
    if (groupRef.current) {
      // 清除当前组中的所有对象
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0]
        if (child instanceof THREE.Mesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry.dispose()
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose()
          } else if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          }
        }
        groupRef.current.remove(child)
      }

      // 添加新的几何体组，使用标准材质（与complete阶段相同）
      groupRef.current.add(geometryGroup.clone())
    }
  }

  // 完整可视化（默认）
  const applyCompleteVisualization = (group: THREE.Object3D) => {
    // 重置位置
    group.position.set(0, 0, 0)

    // 重新创建一个新的几何体组，以确保材质是原始状态
    if (groupRef.current) {
      // 清除当前组中的所有对象
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0]
        if (child instanceof THREE.Mesh || child.type === "Mesh") {
          const mesh = child as THREE.Mesh
          mesh.geometry.dispose()
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose()
          } else if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          }
        }
        groupRef.current.remove(child)
      }

      // 添加新的几何体组
      groupRef.current.add(geometryGroup.clone())
    }
  }

  // 根据所选模式渲染适当的光照
  const renderLighting = () => {
    switch (lightingMode) {
      case "directional":
        return <DirectionalLight ref={directionalLightRef} castShadow={showShadows} position={[5, 5, 5]} />
      case "point":
        return <PointLight ref={pointLightRef} castShadow={showShadows} position={[5, 5, 5]} />
      case "spot":
        return <SpotLight ref={spotLightRef} castShadow={showShadows} position={[5, 5, 5]} />
      default:
        return <DirectionalLight ref={directionalLightRef} castShadow={showShadows} position={[5, 5, 5]} />
    }
  }

  // 根据环境设置背景颜色
  const getBackgroundColor = () => {
    switch (environment) {
      case "daytime":
        return "#f0f8ff" // 浅蓝色天空
      case "nighttime":
        return "#0a0a1a" // 深蓝色夜晚
      case "rainy":
        return "#202030" // 深灰色阴天
      default:
        return "#f0f8ff"
    }
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={40} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={100}
        target={[0, 0, 0]}
        // 添加这些属性以确保控制在所有渲染管线中正常工作
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        enablePan={true}
        enabled={true}
      />

      <color attach="background" args={[getBackgroundColor()]} />

      {renderLighting()}

      <group ref={groupRef} />

      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        fadeDistance={50}
        fadeStrength={1.5}
      />

      {/* 在后处理阶段添加自定义后处理 */}
      {currentStage === "postprocessing" && (
        <CustomPostProcessing
          enableBloom={enableBloom}
          enableChromatic={enableChromatic}
          enableNoise={enableNoise}
          enableVignette={enableVignette}
          enableDotScreen={enableDotScreen}
          enableScanline={enableScanline}
          enablePixel={enablePixel}
        />
      )}
    </>
  )
}

// // 添加到可视化组件中的通用函数
// function safeCloneScene(originalScene: THREE.Group) {
//   // 创建新组而不是克隆
//   const newGroup = new THREE.Group();
  
//   // 仅复制必要的属性
//   originalScene.traverse((originalObject) => {
//     if (originalObject instanceof THREE.Mesh) {
//       // 克隆网格但使用引用的几何体以节省内存
//       const clonedMesh = new THREE.Mesh(
//         originalObject.geometry, 
//         originalObject.material.clone()
//       );
      
//       // 复制变换
//       clonedMesh.position.copy(originalObject.position);
//       clonedMesh.rotation.copy(originalObject.rotation);
//       clonedMesh.scale.copy(originalObject.scale);
      
//       // 复制矩阵
//       clonedMesh.matrix.copy(originalObject.matrix);
//       clonedMesh.matrixWorld.copy(originalObject.matrixWorld);
      
//       newGroup.add(clonedMesh);
//     }
//   });
  
//   return newGroup;
// }

