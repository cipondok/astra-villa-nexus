import { useState, useCallback, useRef, useEffect } from 'react';
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
  scene: any;
  camera: any;
  renderer: any;
  controls?: any;
  metrics: ModelPerformanceMetrics;
  lodLevels?: any[];
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
  const rendererRef = useRef<any>(null);
  const { trackInteraction } = useUserBehaviorAnalytics();

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

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const vendor = gl.getParameter(gl.VENDOR);
    const renderer = gl.getParameter(gl.RENDERER);
    
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

  const loadOptimizedModel = useCallback(async (
    modelUrl: string,
    container: HTMLElement,
    customSettings?: Partial<ModelOptimizationSettings>
  ): Promise<OptimizedModel> => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const THREE = await import('three');
      const settings = { ...detectOptimalSettings(), ...customSettings };
      setOptimizationSettings(settings);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      
      const renderer = new THREE.WebGLRenderer({ 
        antialias: !settings.enableOcclusion,
        alpha: true,
        powerPreference: 'high-performance'
      });
      
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      renderer.extensions.get('OES_element_index_uint');
      renderer.extensions.get('WEBGL_compressed_texture_s3tc');
      
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      const optimizedScene = await loadAndOptimizeModel(modelUrl, settings);
      scene.add(optimizedScene);

      setupOptimizedLighting(scene, settings);

      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);

      const loadTime = performance.now() - startTime;
      
      const metrics = await calculatePerformanceMetrics(renderer, scene, loadTime);
      setPerformanceMetrics(metrics);

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

  const optimizeForPerformance = useCallback(async (
    scene: any,
    camera: any,
    renderer: any
  ) => {
    const THREE = await import('three');
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
        
        if (fps < 30) {
          renderer.setPixelRatio(1);
          scene.traverse((object: any) => {
            if (object instanceof THREE.Mesh) {
              optimizeMeshForPerformance(object);
            }
          });
        } else if (fps > 50) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(performanceMonitor);
    };
    
    performanceMonitor();
  }, []);

  const createLODSystem = useCallback(async (geometry: any): Promise<any[]> => {
    const THREE = await import('three');
    const lod = new THREE.LOD();
    
    const highDetail = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    lod.addLevel(highDetail, 0);
    
    const mediumGeometry = optimizeGeometry(geometry, 0.7);
    const mediumDetail = new THREE.Mesh(mediumGeometry, new THREE.MeshBasicMaterial());
    lod.addLevel(mediumDetail, 50);
    
    const lowGeometry = optimizeGeometry(geometry, 0.3);
    const lowDetail = new THREE.Mesh(lowGeometry, new THREE.MeshBasicMaterial());
    lod.addLevel(lowDetail, 200);
    
    return [lod];
  }, []);

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

// Helper functions

async function loadAndOptimizeModel(url: string, settings: ModelOptimizationSettings): Promise<any> {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
  
  const loader = new GLTFLoader();
  
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
  loader.setDRACOLoader(dracoLoader);
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf: any) => {
        const scene = gltf.scene;
        scene.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            optimizeMesh(child, settings);
          }
        });
        resolve(scene);
      },
      (progress: any) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      reject
    );
  });
}

async function optimizeMesh(mesh: any, settings: ModelOptimizationSettings) {
  const THREE = await import('three');
  if (mesh.geometry instanceof THREE.BufferGeometry) {
    const geometry = mesh.geometry;
    const vertexCount = geometry.getAttribute('position')?.count || 0;
    if (vertexCount > (settings.maxVertices || 50000)) {
      mesh.geometry = optimizeGeometry(geometry, 0.5);
    }
    if (geometry.getAttribute('position')) {
      geometry.computeBoundingBox();
    }
    if (!geometry.getAttribute('normal')) {
      geometry.computeVertexNormals();
    }
  }
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    optimizeMaterial(mesh.material, settings);
  }
  mesh.frustumCulled = true;
}

function optimizeMeshForPerformance(mesh: any) {
  if (mesh.material && typeof mesh.material === 'object') {
    mesh.material.roughness = 1;
    mesh.material.metalness = 0;
  }
}

function optimizeGeometry(geometry: any, ratio: number): any {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  
  if (!positions) return geometry;
  
  const newVertexCount = Math.floor(positions.count * ratio);
  const stride = Math.floor(positions.count / newVertexCount);
  
  // We need THREE for BufferGeometry/BufferAttribute but this is a sync helper.
  // Return original geometry if we can't optimize synchronously.
  // The caller already has THREE loaded.
  try {
    const newPositions = new Float32Array(newVertexCount * 3);
    for (let i = 0; i < newVertexCount; i++) {
      const sourceIndex = i * stride;
      newPositions[i * 3] = positions.getX(sourceIndex);
      newPositions[i * 3 + 1] = positions.getY(sourceIndex);
      newPositions[i * 3 + 2] = positions.getZ(sourceIndex);
    }
    
    // Use geometry constructor from the same module
    const newGeometry = geometry.clone();
    newGeometry.setAttribute('position', new geometry.getAttribute('position').constructor(newPositions, 3));
    
    if (normals) {
      const newNormals = new Float32Array(newVertexCount * 3);
      for (let i = 0; i < newVertexCount; i++) {
        const sourceIndex = i * stride;
        newNormals[i * 3] = normals.getX(sourceIndex);
        newNormals[i * 3 + 1] = normals.getY(sourceIndex);
        newNormals[i * 3 + 2] = normals.getZ(sourceIndex);
      }
      newGeometry.setAttribute('normal', new geometry.getAttribute('normal').constructor(newNormals, 3));
    }
    
    return newGeometry;
  } catch {
    return geometry;
  }
}

function optimizeMaterial(material: any, settings: ModelOptimizationSettings) {
  if (material.map) {
    optimizeTexture(material.map, settings.textureSize || 1024);
  }
  if (material.normalMap) {
    optimizeTexture(material.normalMap, Math.floor((settings.textureSize || 1024) / 2));
  }
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
      break;
  }
}

function optimizeTexture(texture: any, maxSize: number) {
  texture.minFilter = 1006; // THREE.LinearFilter
  texture.magFilter = 1006;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
}

async function setupOptimizedLighting(scene: any, settings: ModelOptimizationSettings) {
  const THREE = await import('three');
  
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
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
  
  const fillLight = new THREE.DirectionalLight(0x8FCDFF, 0.3);
  fillLight.position.set(-10, 0, -10);
  scene.add(fillLight);
}

async function calculatePerformanceMetrics(
  renderer: any,
  scene: any,
  loadTime: number
): Promise<ModelPerformanceMetrics> {
  const THREE = await import('three');
  let triangleCount = 0;
  let textureMemory = 0;
  
  scene.traverse((object: any) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      const geometry = object.geometry;
      if (geometry.index) {
        triangleCount += geometry.index.count / 3;
      } else {
        triangleCount += geometry.getAttribute('position')?.count / 3 || 0;
      }
    }
  });
  
  const memoryUsage = renderer.info.memory.geometries * 1024 + renderer.info.memory.textures * 2048;
  
  return {
    loadTime,
    renderTime: 0,
    memoryUsage,
    triangleCount: Math.round(triangleCount),
    textureMemory,
    fps: 60
  };
}
