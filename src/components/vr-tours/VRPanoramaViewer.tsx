import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { RotateCw, Info, Navigation, ChevronRight } from 'lucide-react';
import type { VRHotspot } from './VRPropertyTourManager';

interface PanoramaSphereProps {
  imageUrl: string;
  hotspots: VRHotspot[];
  onHotspotClick: (hotspot: VRHotspot) => void;
  autoRotate: boolean;
  rotateSpeed: number;
  isDayMode: boolean;
}

const PanoramaSphere: React.FC<PanoramaSphereProps> = ({
  imageUrl,
  hotspots,
  onHotspotClick,
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
  });

  const pitchYawToPosition = (pitch: number, yaw: number, radius: number = 4.5) => {
    const pitchRad = THREE.MathUtils.degToRad(pitch);
    const yawRad = THREE.MathUtils.degToRad(yaw);
    return new THREE.Vector3(
      radius * Math.cos(pitchRad) * Math.sin(yawRad),
      radius * Math.sin(pitchRad),
      radius * Math.cos(pitchRad) * Math.cos(yawRad)
    );
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <ChevronRight className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

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

      {hotspots.map((hotspot) => {
        const position = pitchYawToPosition(hotspot.position.pitch, hotspot.position.yaw);
        return (
          <Html key={hotspot.id} position={position} center distanceFactor={10} occlude={false}>
            <button
              onClick={() => onHotspotClick(hotspot)}
              className={cn(
                "group relative flex items-center justify-center rounded-full p-2.5 transition-all duration-200",
                "bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg",
                "hover:scale-110 cursor-pointer animate-pulse-slow"
              )}
            >
              {getHotspotIcon(hotspot.type)}
              <div className="absolute left-full ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-foreground shadow-lg border border-border">
                  {hotspot.title}
                </div>
              </div>
            </button>
          </Html>
        );
      })}
    </group>
  );
};

// Scene content component
function SceneContent({
  imageUrl,
  hotspots,
  onHotspotClick,
  autoRotate,
  isDayMode
}: {
  imageUrl: string;
  hotspots: VRHotspot[];
  onHotspotClick: (hotspot: VRHotspot) => void;
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

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={0.1}
        maxDistance={0.1}
        rotateSpeed={-0.5}
        zoomSpeed={0.5}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        makeDefault
      />

      <PanoramaSphere
        imageUrl={imageUrl}
        hotspots={hotspots}
        onHotspotClick={onHotspotClick}
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
  hotspots,
  onHotspotClick,
  autoRotate = true,
  isDayMode = true,
  className
}) => {
  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      <Canvas
        camera={{ fov: 75, position: [0, 0, 0.1] }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            imageUrl={imageUrl}
            hotspots={hotspots}
            onHotspotClick={onHotspotClick}
            autoRotate={autoRotate}
            isDayMode={isDayMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default VRPanoramaViewer;
