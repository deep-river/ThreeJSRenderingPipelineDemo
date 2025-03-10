# Three.js Rendering Pipeline Demo

<div align="center">
  <strong>🔗 <a href="https://threejs-rendering-pipeline-demo.vercel.app/">在线演示 | Live Demo</a> 🔗</strong>
</div>

An interactive educational visualization of the 3D graphics rendering pipeline implemented using Three.js and React.

![Three.js Rendering Pipeline Demo](https://raw.githubusercontent.com/deep-river/ThreeJSRenderingPipelineDemo/refs/heads/main/Screenshots/ThreeJSRPD-01.jpg)
![Three.js Rendering Pipeline Demo](https://raw.githubusercontent.com/deep-river/ThreeJSRenderingPipelineDemo/refs/heads/main/Screenshots/ThreeJSRPD-02.jpg)

## Introduction

This project provides a comprehensive visualization of the modern 3D graphics rendering pipeline. It allows students, educators, and graphics enthusiasts to explore each stage of the pipeline interactively, helping to demystify the complex processes that transform 3D data into 2D images on your screen.

## Features

- **Interactive Pipeline Visualization**: Step through each stage of the rendering pipeline
- **Multiple Rendering Stages**: Vertex, Fragment, Geometry, Rasterization, and Complete Rendering
- **Environment Settings**: Switch between daytime, nighttime, and rainy environments
- **Lighting Models**: Toggle between Phong and PBR (Physically Based Rendering) shading models
- **Real-time Parameter Adjustments**: Modify lighting parameters, camera position, and model properties
- **Educational Annotations**: Learn about each pipeline stage with informative overlays

## Technology Stack

- **Frontend Framework**: React with Next.js
- **3D Graphics**: Three.js
- **State Management**: React Context API and useState/useEffect hooks
- **Styling**: Tailwind CSS
- **TypeScript**: For type safety and improved developer experience
- **Shader Programming**: GLSL for custom shader implementations

## Graphics Rendering Pipeline Overview

The 3D graphics rendering pipeline is a sequence of stages that transforms 3D scene data into a 2D image. The main stages are:

1. **Vertex Processing**: Transforms vertices from 3D object space to 2D screen space
2. **Geometry Processing**: Handles primitive assembly, clipping, and culling
3. **Rasterization**: Converts vector information to pixels (fragments)
4. **Fragment Processing**: Determines the color of each pixel through lighting calculations and texturing
5. **Output Merging**: Combines fragment colors with the frame buffer

## Implementation Details

### Vertex Stage Visualization

Our implementation shows how vertices are processed before rendering. Users can observe:
- Model, view, and projection transformations
- Vertex shader operations
- Wireframe representation of the geometry

```javascript
vertexShader: `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
```

### Geometry Processing

This stage demonstrates:
- Primitive assembly (how vertices form triangles)
- Back-face culling
- Clipping against the view frustum

Our implementation applies color-coding to triangles and allows toggling of back-face culling:

```javascript
// PrimitiveVisualization component applies these materials
const material = new THREE.MeshBasicMaterial({
  color: wireframe ? 0x00ff00 : 0xffffff,
  wireframe: wireframe,
  side: backfaceCulling ? THREE.FrontSide : THREE.DoubleSide,
  vertexColors: false,
  transparent: true,
  opacity: wireframe ? 0.8 : 1.0,
})

// For non-wireframe mode, we create a checkerboard pattern
// by assigning alternating colors to triangles
if (!wireframe) {
  const colors = []
  
  // Alternating colors for triangles
  for (let i = 0; i < positionAttribute.count; i += 3) {
    const color = i % 6 === 0 ? new THREE.Color(0xff5555) : new THREE.Color(0x55ff55)
    colors.push(color.r, color.g, color.b)
    colors.push(color.r, color.g, color.b)
    colors.push(color.r, color.g, color.b)
  }
  
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  material.vertexColors = true
}
```

### Rasterization Stage

Visualizes how geometric primitives are converted to fragments (potential pixels):
- Triangle traversal
- Perspective-correct interpolation
- Screen-space transformation

```javascript
// Rasterization stage pixel visualization shader
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
`
```

### Fragment Stage

Shows the pixel-level operations:
- Texture sampling
- Color computation
- Lighting calculations (Phong model and PBR)
- Material properties application

Our implementation includes a split-view shader that shows different aspects of fragment processing:

```javascript
// Fragment stage shader with quadrant visualization
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
`
```

### Complete Rendering

The final stage combines all previous stages into a complete rendering pipeline, allowing users to see the fully rendered 3D scene with all lighting and material effects applied.

## Custom GLSL Shader Implementation

This project extensively utilizes GLSL (OpenGL Shading Language) to create custom visual effects for each pipeline stage. GLSL allows us to directly program the GPU, providing both educational insight and visual fidelity.

### GLSL Shader Architecture

Our shaders are organized to demonstrate specific rendering concepts:

1. **Vertex Shaders**: Manipulate vertex positions and pass attributes to fragment shaders
2. **Fragment Shaders**: Determine the final color of each pixel

### Example Custom Shader Implementations

#### Fragment Visualization Quadrant Shader

This shader divides the screen into four quadrants, each showing a different aspect of fragment processing:

```glsl
// Vertex shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
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
```

#### Pixelation Rasterization Shader

This shader demonstrates the rasterization process by creating a pixelated effect with visible grid lines:

```glsl
// Vertex shader
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
uniform float time;
varying vec2 vUv;

void main() {
  // Create pixelated effect
  float pixelSize = 0.05;
  vec2 pixelatedUV = floor(vUv / pixelSize) * pixelSize;
  
  // Add grid pattern
  float gridLine = step(0.98, mod(vUv.x / pixelSize, 1.0)) + 
                  step(0.98, mod(vUv.y / pixelSize, 1.0));
  
  // Base color based on UV coordinates
  vec3 color = vec3(pixelatedUV.x, pixelatedUV.y, sin(time) * 0.5 + 0.5);
  
  // Apply grid lines
  color = mix(color, vec3(0.0), gridLine);
  
  gl_FragColor = vec4(color, 1.0);
}
```

### Integration with Three.js

Our implementation connects these GLSL shaders with Three.js materials using `ShaderMaterial`:

```javascript
// Example from RasterizationVisualization
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
      // Create pixelated effect
      float pixelSize = 0.05;
      vec2 pixelatedUV = floor(vUv / pixelSize) * pixelSize;
      
      // Add grid pattern
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
```

### Dynamic Shader Manipulation

Our project allows real-time modification of shader parameters, enabling users to see immediate visual feedback:

```javascript
// Animation for pixel material from RasterizationVisualization
useFrame(({ clock }) => {
  if (!showDepthBuffer) {
    pixelMaterial.uniforms.time.value = clock.getElapsedTime()
  }
})

// Animate the split material from FragmentVisualization
useFrame(({ clock }) => {
  if (splitView) {
    splitMaterial.uniforms.time.value = clock.getElapsedTime()
  }
})
```

### Stage-Specific Shader Techniques

Each pipeline stage uses specialized shader techniques:

1. **Vertex Stage**: Emphasizes position transformations and coordinate spaces
2. **Geometry Stage**: Visualizes primitive assembly and geometric attributes
3. **Rasterization Stage**: Shows pixel coverage and interpolation
4. **Fragment Stage**: Demonstrates lighting calculations and material properties
5. **Complete Stage**: Combines all techniques for the final rendered image

By implementing custom GLSL shaders for each stage, our project provides an interactive "glass box" view into the rendering pipeline, allowing users to understand the complex algorithms that power modern real-time graphics.

## Educational Value

This project was designed with education in mind and can be used to:

- Illustrate complex graphics concepts visually
- Provide an interactive tool for computer graphics courses
- Help students understand the relationship between code and visual output
- Demonstrate how modern GPUs process 3D data
- Explore different lighting models and their effects on rendering

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/threejs-rendering-pipeline-demo.git
```

2. Install dependencies:
```bash
cd threejs-rendering-pipeline-demo
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for their excellent 3D library
- WebGL and graphics programming resources that inspired this educational tool

---

Designed and developed for educational purposes to make computer graphics concepts more accessible and understandable.