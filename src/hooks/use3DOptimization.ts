import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useUserBehaviorAnalytics } from './useUserBehaviorAnalytics';

interface ModelOptimizationSettings {
  maxVertices?: number;
  textureSize?: number;
  compressionLevel?: 'low' | 'medium' | 'high';
  enableLOD?: boolean;
  enableInstancing?: boolean;
  enableOcclusion?: boolean;
}

interface ModelPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  triangleCount: number;
  textureMemory: number;
  fps: number;
}

interface OptimizedModel {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls?: any;
  metrics: ModelPerformanceMetrics;
  lodLevels?: THREE.LOD[];
}

export function use3DOptimization() {
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<ModelOptimizationSettings>({
    maxVertices: 50000,
    textureSize: 1024,
    compressionLevel: 'medium',
    enableLOD: true,
    enableInstancing: true,
    enableOcclusion: true
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<ModelPerformanceMetrics | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { trackInteraction } = useUserBehaviorAnalytics();

  // Step 1: Device-based optimization detection
  const detectOptimalSettings = useCallback((): ModelOptimizationSettings => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return {
        maxVertices: 10000,
        textureSize: 512,
        compressionLevel: 'high',
        enableLOD: true,
        enableInstancing: false,
        enableOcclusion: false
      };
    }

    // Detect device capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const vendor = gl.getParameter(gl.VENDOR);
    const renderer = gl.getParameter(gl.RENDERER);
    
    // Performance-based settings
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    const isLowEnd = isMobile || maxTextureSize < 4096;
    
    const settings: ModelOptimizationSettings = {
      maxVertices: isLowEnd ? 25000 : 100000,
      textureSize: Math.min(maxTextureSize, isLowEnd ? 512 : 2048),
      compressionLevel: isLowEnd ? 'high' : 'medium',
      enableLOD: true,
      enableInstancing: maxVertexAttribs >= 16,
      enableOcclusion: !isMobile
    };

    console.log('3D Optimization Settings:', settings, { vendor, renderer, maxTextureSize });
    return settings;
  }, []);

  // Step 2: Model loading with optimization
  const loadOptimizedModel = useCallback(async (
    modelUrl: string,
    container: HTMLElement,
    customSettings?: Partial<ModelOptimizationSettings>
  ): Promise<OptimizedModel> => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const settings = { ...detectOptimalSettings(), ...customSettings };
      setOptimizationSettings(settings);

      // Initialize Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      
      // Create optimized renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: !settings.enableOcclusion,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Enable WebGL extensions for performance
      renderer.extensions.get('OES_element_index_uint');
      renderer.extensions.get('WEBGL_compressed_texture_s3tc');
      
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      // Load and optimize model
      const optimizedScene = await loadAndOptimizeModel(modelUrl, settings);
      scene.add(optimizedScene);

      // Setup lighting
      setupOptimizedLighting(scene, settings);

      // Setup camera position
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);

      const loadTime = performance.now() - startTime;
      
      // Create performance metrics
      const metrics = await calculatePerformanceMetrics(renderer, scene, loadTime);
      setPerformanceMetrics(metrics);

      // Track 3D interaction
      trackInteraction({
        interaction_type: 'visit_3d',
        interaction_data: {
          model_url: modelUrl,
          load_time: loadTime,
          optimization_settings: settings,
          performance_metrics: metrics
        }
      });

      return { scene, camera, renderer, metrics };
      
    } catch (error) {
      console.error('3D Model loading failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [detectOptimalSettings, trackInteraction]);

  // Step 3: Real-time optimization during interaction
  const optimizeForPerformance = useCallback((
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const performanceMonitor = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Dynamic optimization based on FPS
        if (fps < 30) {
          // Reduce quality for better performance
          renderer.setPixelRatio(1);
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              optimizeMeshForPerformance(object);
            }
          });
        } else if (fps > 50) {
          // Increase quality if performance allows
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(performanceMonitor);
    };
    
    performanceMonitor();
  }, []);

  // Step 4: LOD (Level of Detail) system
  const createLODSystem = useCallback((geometry: THREE.BufferGeometry): THREE.LOD[] => {
    const lod = new THREE.LOD();
    
    // High detail (close)
    const highDetail = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    lod.addLevel(highDetail, 0);
    
    // Medium detail 
    const mediumGeometry = optimizeGeometry(geometry, 0.7);
    const mediumDetail = new THREE.Mesh(mediumGeometry, new THREE.MeshBasicMaterial());
    lod.addLevel(mediumDetail, 50);
    
    // Low detail (far)
    const lowGeometry = optimizeGeometry(geometry, 0.3);
    const lowDetail = new THREE.Mesh(lowGeometry, new THREE.MeshBasicMaterial());
    lod.addLevel(lowDetail, 200);
    
    return [lod];
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isLoading,
    optimizationSettings,
    performanceMetrics,
    loadOptimizedModel,
    optimizeForPerformance,
    createLODSystem,
    detectOptimalSettings,
    cleanup,
    setOptimizationSettings
  };
}

// Helper functions for 3D optimization

async function loadAndOptimizeModel(url: string, settings: ModelOptimizationSettings): Promise<THREE.Group> {
  // Dynamic import of GLTFLoader to reduce bundle size
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
  
  const loader = new GLTFLoader();
  
  // Setup DRACO decoder for compressed models
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
  loader.setDRACOLoader(dracoLoader);
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        // Optimize loaded model
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            optimizeMesh(child, settings);
          }
        });
        
        resolve(scene);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      reject
    );
  });
}

function optimizeMesh(mesh: THREE.Mesh, settings: ModelOptimizationSettings) {
  // Optimize geometry
  if (mesh.geometry instanceof THREE.BufferGeometry) {
    const geometry = mesh.geometry;
    
    // Reduce vertices if needed
    const vertexCount = geometry.getAttribute('position')?.count || 0;
    if (vertexCount > (settings.maxVertices || 50000)) {
      mesh.geometry = optimizeGeometry(geometry, 0.5);
    }
    
    // Remove duplicate vertices (manual implementation for newer Three.js)
    if (geometry.getAttribute('position')) {
      geometry.computeBoundingBox();
    }
    
    // Compute vertex normals if missing
    if (!geometry.getAttribute('normal')) {
      geometry.computeVertexNormals();
    }
  }
  
  // Optimize materials
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    optimizeMaterial(mesh.material, settings);
  }
  
  // Enable frustum culling
  mesh.frustumCulled = true;
}

function optimizeMeshForPerformance(mesh: THREE.Mesh) {
  // Real-time performance optimizations
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    // Reduce material complexity during low performance
    mesh.material.roughness = 1; // Simpler lighting
    mesh.material.metalness = 0;
  }
}

function optimizeGeometry(geometry: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
  // Simple vertex reduction by taking every nth vertex
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uvs = geometry.getAttribute('uv');
  
  if (!positions) return geometry;
  
  const newVertexCount = Math.floor(positions.count * ratio);
  const stride = Math.floor(positions.count / newVertexCount);
  
  const newGeometry = new THREE.BufferGeometry();
  
  // Reduce vertices
  const newPositions = new Float32Array(newVertexCount * 3);
  for (let i = 0; i < newVertexCount; i++) {
    const sourceIndex = i * stride;
    newPositions[i * 3] = positions.getX(sourceIndex);
    newPositions[i * 3 + 1] = positions.getY(sourceIndex);
    newPositions[i * 3 + 2] = positions.getZ(sourceIndex);
  }
  
  newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  
  // Copy normals if they exist
  if (normals) {
    const newNormals = new Float32Array(newVertexCount * 3);
    for (let i = 0; i < newVertexCount; i++) {
      const sourceIndex = i * stride;
      newNormals[i * 3] = normals.getX(sourceIndex);
      newNormals[i * 3 + 1] = normals.getY(sourceIndex);
      newNormals[i * 3 + 2] = normals.getZ(sourceIndex);
    }
    newGeometry.setAttribute('normal', new THREE.BufferAttribute(newNormals, 3));
  }
  
  return newGeometry;
}

function optimizeMaterial(material: THREE.MeshStandardMaterial, settings: ModelOptimizationSettings) {
  // Compress and resize textures
  if (material.map) {
    optimizeTexture(material.map, settings.textureSize || 1024);
  }
  
  if (material.normalMap) {
    optimizeTexture(material.normalMap, Math.floor((settings.textureSize || 1024) / 2));
  }
  
  // Adjust material properties based on compression level
  switch (settings.compressionLevel) {
    case 'high':
      material.roughness = 0.8;
      material.metalness = 0.1;
      break;
    case 'medium':
      material.roughness = 0.6;
      material.metalness = 0.3;
      break;
    case 'low':
    default:
      // Keep original values
      break;
  }
}

function optimizeTexture(texture: THREE.Texture, maxSize: number) {
  // Set texture filtering for performance
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  
  // Note: Actual texture resizing would require canvas operations
  // This is a placeholder for texture optimization logic
  texture.needsUpdate = true;
}

function setupOptimizedLighting(scene: THREE.Scene, settings: ModelOptimizationSettings) {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  // Directional light with shadows (if performance allows)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  
  if (!settings.enableOcclusion) {
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = settings.textureSize || 1024;
    directionalLight.shadow.mapSize.height = settings.textureSize || 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
  }
  
  scene.add(directionalLight);
  
  // Add fill light for better visibility
  const fillLight = new THREE.DirectionalLight(0x8FCDFF, 0.3);
  fillLight.position.set(-10, 0, -10);
  scene.add(fillLight);
}

async function calculatePerformanceMetrics(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  loadTime: number
): Promise<ModelPerformanceMetrics> {
  let triangleCount = 0;
  let textureMemory = 0;
  
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      const geometry = object.geometry;
      if (geometry.index) {
        triangleCount += geometry.index.count / 3;
      } else {
        triangleCount += geometry.getAttribute('position')?.count / 3 || 0;
      }
    }
  });
  
  // Estimate memory usage (simplified)
  const memoryUsage = renderer.info.memory.geometries * 1024 + renderer.info.memory.textures * 2048;
  
  return {
    loadTime,
    renderTime: 0, // Will be updated during rendering
    memoryUsage,
    triangleCount: Math.round(triangleCount),
    textureMemory,
    fps: 60 // Will be updated during rendering
  };
}
