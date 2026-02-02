import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';
import type { VRHotspot } from './VRPropertyTourManager';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

interface PanoramaSphereProps {
  imageUrl: string;
  rotationRef: React.MutableRefObject<{ yaw: number; pitch: number }>;
  autoRotate: boolean;
  rotateSpeed: number;
  isDayMode: boolean;
}

const PanoramaSphere: React.FC<PanoramaSphereProps> = ({
  imageUrl,
  rotationRef,
  autoRotate,
  rotateSpeed,
  isDayMode
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading panorama texture:', error);
        setIsLoading(false);
      }
    );
  }, [imageUrl]);

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * rotateSpeed * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationRef.current.yaw;
      meshRef.current.rotation.x = rotationRef.current.pitch;
      // reset yaw delta each frame (we accumulate deltas from dragging)
      rotationRef.current.yaw = 0;
    }
  });

  if (isLoading) {
    return (
      <Html center>
        <div className="flex items-center gap-2 text-white bg-black/50 rounded-full px-4 py-2">
          <RotateCw className="h-5 w-5 animate-spin" />
          <span>Loading panorama...</span>
        </div>
      </Html>
    );
  }

  if (!texture) {
    return null;
  }

  // Apply day/night filter through material properties
  const materialProps = isDayMode
    ? { color: new THREE.Color(1, 1, 1) }
    : { color: new THREE.Color(0.4, 0.45, 0.6) }; // Blue-ish night tint

  return (
    <group>
      <Sphere ref={meshRef} args={[5, 64, 64]} scale={[-1, 1, 1]}>
        <meshBasicMaterial map={texture} side={THREE.BackSide} {...materialProps} />
      </Sphere>
    </group>
  );
};

// Scene content component
function SceneContent({
  imageUrl,
  rotationRef,
  autoRotate,
  isDayMode
}: {
  imageUrl: string;
  rotationRef: React.MutableRefObject<{ yaw: number; pitch: number }>;
  autoRotate: boolean;
  isDayMode: boolean;
}) {
  return (
    <>
      {/* Environment lighting based on day/night */}
      {isDayMode ? (
        <>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.3} color="#4a5568" />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#a0aec0" />
          <pointLight position={[0, 2, 0]} intensity={0.5} color="#fbbf24" distance={5} />
        </>
      )}
      <PanoramaSphere
        imageUrl={imageUrl}
        rotationRef={rotationRef}
        autoRotate={autoRotate}
        rotateSpeed={0.5}
        isDayMode={isDayMode}
      />
    </>
  );
}

interface VRPanoramaViewerProps {
  imageUrl: string;
  hotspots: VRHotspot[];
  onHotspotClick: (hotspot: VRHotspot) => void;
  autoRotate?: boolean;
  isDayMode?: boolean;
  className?: string;
}

const VRPanoramaViewer: React.FC<VRPanoramaViewerProps> = ({
  imageUrl,
  hotspots: _hotspots,
  onHotspotClick: _onHotspotClick,
  autoRotate = true,
  isDayMode = true,
  className
}) => {
  const rotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number }>({
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      <ThreeCanvasBoundary
        fallback={({ reset, error }) => (
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt="VR panorama preview"
              className="h-full w-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="max-w-md rounded-xl border border-border bg-background/80 backdrop-blur-sm p-4 text-center">
                <p className="text-sm font-medium text-foreground">3D viewer failed to load</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your browser/WebGL context rejected a Three.js prop. You can still use AI staging & tools while we fix the viewer.
                </p>
                <p className="mt-2 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground break-words">
                  {error.message}
                </p>
                <button
                  onClick={reset}
                  className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  Retry 3D Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      >
        <Canvas
          camera={{ fov: 75, position: [0, 0, 1] }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000');
          }}
          onPointerDown={(e) => {
            dragRef.current.dragging = true;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;
          }}
          onPointerUp={() => {
            dragRef.current.dragging = false;
          }}
          onPointerLeave={() => {
            dragRef.current.dragging = false;
          }}
          onPointerMove={(e) => {
            if (!dragRef.current.dragging) return;
            const dx = e.clientX - dragRef.current.lastX;
            const dy = e.clientY - dragRef.current.lastY;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;

            // Sensitivity tuned for touch + mouse.
            rotationRef.current.yaw += dx * 0.003;
            rotationRef.current.pitch = THREE.MathUtils.clamp(
              rotationRef.current.pitch + dy * 0.003,
              -Math.PI / 2 + 0.1,
              Math.PI / 2 - 0.1
            );
          }}
        >
          <Suspense fallback={null}>
            <SceneContent
              imageUrl={imageUrl}
              rotationRef={rotationRef}
              autoRotate={autoRotate}
              isDayMode={isDayMode}
            />
          </Suspense>
        </Canvas>
      </ThreeCanvasBoundary>
    </div>
  );
};

export default VRPanoramaViewer;
