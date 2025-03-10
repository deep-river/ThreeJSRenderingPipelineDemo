"use client"

import { useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"

// 定义后处理效果的props接口
interface CustomPostProcessingProps {
  enableBloom?: boolean
  enableChromatic?: boolean
  enableNoise?: boolean
  enableVignette?: boolean
  enableDotScreen?: boolean
  enableScanline?: boolean
  enablePixel?: boolean
}

// 自定义着色器定义
const BloomShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 1.5 },
    threshold: { value: 0.2 },
    smoothing: { value: 0.9 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float threshold;
    uniform float smoothing;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 提取亮度超过阈值的部分
      float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      float contribution = smoothstep(threshold, threshold + smoothing, brightness);
      
      // 增强亮部
      vec3 bloomColor = color.rgb * contribution * intensity;
      
      // 将增强的亮部添加到原始颜色
      gl_FragColor = vec4(color.rgb + bloomColor, color.a);
    }
  `,
}

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: new THREE.Vector2(0.005, 0.005) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 offset;
    varying vec2 vUv;

    void main() {
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cg = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      
      gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
    }
  `,
}

const NoiseShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    opacity: { value: 0.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float opacity;
    varying vec2 vUv;

    // 简单的伪随机函数
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 生成噪点
      float noise = random(vUv + time) * opacity;
      
      // 添加噪点到原始颜色
      gl_FragColor = vec4(color.rgb + vec3(noise), color.a);
    }
  `,
}

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.5 },
    darkness: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 计算到中心的距离
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      
      // 应用暗角效果
      float vignette = smoothstep(offset, offset + 0.4, dist);
      color.rgb = mix(color.rgb, color.rgb * (1.0 - darkness), vignette);
      
      gl_FragColor = color;
    }
  `,
}

const DotScreenShader = {
  uniforms: {
    tDiffuse: { value: null },
    dotSize: { value: 1.5 },
    dotSpacing: { value: 5.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float dotSize;
    uniform float dotSpacing;
    varying vec2 vUv;

    void main() {
      // 获取原始颜色
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 计算点阵网格
      vec2 grid = floor(gl_FragCoord.xy / dotSpacing);
      vec2 offset = mod(gl_FragCoord.xy, dotSpacing) / dotSpacing - 0.5;
      
      // 计算到点中心的距离
      float dist = length(offset);
      
      // 根据原始颜色的亮度调整点的大小
      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float size = dotSize * brightness * 0.5;
      
      // 如果距离小于点的大小，则显示点
      if (dist < size) {
        gl_FragColor = color;
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 黑色背景
      }
    }
  `,
}

// 改进的Scanline着色器 - 更接近老式显示器效果
const ScanlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    lineWidth: { value: 0.2 },
    lineCount: { value: 80.0 },
    time: { value: 0.0 },
    intensity: { value: 0.1 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float lineWidth;
    uniform float lineCount;
    uniform float time;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 创建多条垂直扫描线
      float lines = fract(vUv.y * lineCount + time * 5.0);
      
      // 创建细线效果，宽度为lineWidth
      float scanline = step(1.0 - lineWidth, lines) + step(lines, lineWidth);
      
      // 应用扫描线效果
      vec3 scanlineColor = mix(color.rgb, color.rgb * (1.0 - intensity), scanline);
      
      gl_FragColor = vec4(scanlineColor, color.a);
    }
  `,
}

// 修改PixelShader中的window引用
const PixelShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) }, // 初始值设为1,1，稍后在客户端更新
    pixelSize: { value: 8.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;

    void main() {
      // 计算像素化的UV坐标
      vec2 dxy = pixelSize / resolution;
      vec2 pixelatedUV = vec2(
        dxy.x * floor(vUv.x / dxy.x),
        dxy.y * floor(vUv.y / dxy.y)
      );
      
      // 采样像素化后的颜色
      vec4 color = texture2D(tDiffuse, pixelatedUV);
      
      // 添加像素边缘
      vec2 gridUV = fract(vUv * (resolution / pixelSize));
      float gridLine = step(0.95, max(gridUV.x, gridUV.y));
      color.rgb = mix(color.rgb, color.rgb * 0.8, gridLine * 0.5);
      
      gl_FragColor = color;
    }
  `,
}

export function CustomPostProcessing({
  enableBloom = false,
  enableChromatic = false,
  enableNoise = false,
  enableVignette = false,
  enableDotScreen = false,
  enableScanline = false,
  enablePixel = false,
}: CustomPostProcessingProps) {
  // 获取Three.js渲染上下文
  const { gl, scene, camera, size } = useThree()

  // 创建引用来存储EffectComposer和各种Pass
  const composerRef = useRef<EffectComposer | null>(null)
  const bloomPassRef = useRef<ShaderPass | null>(null)
  const chromaticPassRef = useRef<ShaderPass | null>(null)
  const noisePassRef = useRef<ShaderPass | null>(null)
  const vignettePassRef = useRef<ShaderPass | null>(null)
  const dotScreenPassRef = useRef<ShaderPass | null>(null)
  const scanlinePassRef = useRef<ShaderPass | null>(null)
  const pixelPassRef = useRef<ShaderPass | null>(null)

  // 初始化后处理管线
  useEffect(() => {
    // 创建EffectComposer
    const composer = new EffectComposer(gl)

    // 添加RenderPass（渲染场景到目标）
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // 创建各种效果Pass
    const bloomPass = new ShaderPass(BloomShader)
    bloomPass.enabled = enableBloom
    composer.addPass(bloomPass)
    bloomPassRef.current = bloomPass

    const chromaticPass = new ShaderPass(ChromaticAberrationShader)
    chromaticPass.enabled = enableChromatic
    composer.addPass(chromaticPass)
    chromaticPassRef.current = chromaticPass

    const noisePass = new ShaderPass(NoiseShader)
    noisePass.enabled = enableNoise
    composer.addPass(noisePass)
    noisePassRef.current = noisePass

    const vignettePass = new ShaderPass(VignetteShader)
    vignettePass.enabled = enableVignette
    composer.addPass(vignettePass)
    vignettePassRef.current = vignettePass

    const dotScreenPass = new ShaderPass(DotScreenShader)
    dotScreenPass.enabled = enableDotScreen
    composer.addPass(dotScreenPass)
    dotScreenPassRef.current = dotScreenPass

    const scanlinePass = new ShaderPass(ScanlineShader)
    scanlinePass.enabled = enableScanline
    composer.addPass(scanlinePass)
    scanlinePassRef.current = scanlinePass

    const pixelPass = new ShaderPass(PixelShader)
    pixelPass.enabled = enablePixel
    pixelPass.uniforms.resolution.value.set(size.width, size.height)
    composer.addPass(pixelPass)
    pixelPassRef.current = pixelPass

    // 保存composer引用
    composerRef.current = composer

    // 清理函数
    return () => {
      composer.dispose()
    }
  }, [gl, scene, camera, size])

  // 更新效果状态
  useEffect(() => {
    if (bloomPassRef.current) bloomPassRef.current.enabled = enableBloom
    if (chromaticPassRef.current) chromaticPassRef.current.enabled = enableChromatic
    if (noisePassRef.current) noisePassRef.current.enabled = enableNoise
    if (vignettePassRef.current) vignettePassRef.current.enabled = enableVignette
    if (dotScreenPassRef.current) dotScreenPassRef.current.enabled = enableDotScreen
    if (scanlinePassRef.current) scanlinePassRef.current.enabled = enableScanline
    if (pixelPassRef.current) pixelPassRef.current.enabled = enablePixel
  }, [enableBloom, enableChromatic, enableNoise, enableVignette, enableDotScreen, enableScanline, enablePixel])

  // 处理窗口大小变化
  useEffect(() => {
    if (pixelPassRef.current && pixelPassRef.current.uniforms.resolution) {
      pixelPassRef.current.uniforms.resolution.value.set(size.width, size.height)
    }
  }, [size])

  // 在每一帧更新和渲染效果
  useFrame(({ clock }) => {
    if (composerRef.current) {
      // 更新时间相关的uniform
      if (noisePassRef.current && noisePassRef.current.uniforms.time) {
        noisePassRef.current.uniforms.time.value = clock.getElapsedTime()
      }

      if (scanlinePassRef.current && scanlinePassRef.current.uniforms.time) {
        scanlinePassRef.current.uniforms.time.value = clock.getElapsedTime()
      }

      // 使用composer渲染场景
      composerRef.current.render()
    }
  }, 1) // 优先级设为1，确保在正常渲染之后执行

  // 这个组件不渲染任何可见内容
  return null
}

