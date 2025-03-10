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
// Example: Vertex stage shader logic
const vertexShader = `
  void main() {
    // Transform vertices from model space to clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
```

### Geometry Processing

This stage demonstrates:
- Primitive assembly (how vertices form triangles)
- Back-face culling
- Clipping against the view frustum

### Rasterization Stage

Visualizes how geometric primitives are converted to fragments (potential pixels):
- Triangle traversal
- Perspective-correct interpolation
- Screen-space transformation

### Fragment Stage

Shows the pixel-level operations:
- Texture sampling
- Color computation
- Lighting calculations (Phong model and PBR)
- Material properties application

```javascript
// Example: Fragment stage shader with Phong lighting
const fragmentShader = `
  uniform vec3 lightPosition;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 lightDir = normalize(lightPosition - vPosition);
    float diff = max(dot(vNormal, lightDir), 0.0);
    gl_FragColor = vec4(diff * diffuseColor, 1.0);
  }
`;
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

#### Wireframe Visualization Shader

```glsl
// Vertex shader
uniform float wireframeThickness;
varying vec3 vBarycentric;

void main() {
  // Pass barycentric coordinates for wireframe rendering
  vBarycentric = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
varying vec3 vBarycentric;
uniform vec3 wireframeColor;
uniform float wireframeThickness;

void main() {
  // Calculate distance to closest edge for wireframe effect
  float minDistance = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
  float edgeFactor = smoothstep(0.0, wireframeThickness, minDistance);
  
  // Blend between wireframe color and model color
  gl_FragColor = mix(vec4(wireframeColor, 1.0), vec4(0.5, 0.5, 0.5, 1.0), edgeFactor);
}
```

#### Normal Visualization Shader

```glsl
// Vertex shader
varying vec3 vNormal;

void main() {
  vNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
varying vec3 vNormal;

void main() {
  // Visualize normals as RGB colors
  vec3 normalColor = normalize(vNormal) * 0.5 + 0.5;
  gl_FragColor = vec4(normalColor, 1.0);
}
```

#### Phong Lighting Implementation

```glsl
// Fragment shader excerpt for Phong lighting
uniform vec3 lightPosition;
uniform vec3 viewPosition;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Ambient component
  vec3 ambient = ambientColor;
  
  // Diffuse component
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(lightPosition - vPosition);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * diffuseColor;
  
  // Specular component
  vec3 viewDir = normalize(viewPosition - vPosition);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
  vec3 specular = spec * specularColor;
  
  // Combine lighting components
  vec3 result = ambient + diffuse + specular;
  gl_FragColor = vec4(result, 1.0);
}
```

### Integration with Three.js

Our implementation connects these GLSL shaders with Three.js materials using `ShaderMaterial` or `RawShaderMaterial`:

```javascript
const customMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPosition: { value: new THREE.Vector3(5, 5, 5) },
    ambientColor: { value: new THREE.Color(0.1, 0.1, 0.1) },
    diffuseColor: { value: new THREE.Color(0.7, 0.7, 0.7) },
    specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
    shininess: { value: 30.0 }
  },
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderSource
});
```

### Dynamic Shader Manipulation

Our project allows real-time modification of shader parameters, enabling users to see immediate visual feedback:

```javascript
// Example: Updating shader uniforms based on UI controls
useEffect(() => {
  if (material.current) {
    material.current.uniforms.lightPosition.value.set(
      lightPosition.x,
      lightPosition.y,
      lightPosition.z
    );
    material.current.uniforms.shininess.value = shininess;
  }
}, [lightPosition, shininess]);
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
- All contributors and testers who helped refine this visualization

---

Designed and developed for educational purposes to make computer graphics concepts more accessible and understandable.
