import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut, 
  Info, Navigation, Play, Link2, Eye, Glasses
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourScene, TourHotspot } from '@/hooks/useVideoTours';

interface PanoramaSphereProps {
  imageUrl: string;
  hotspots: TourHotspot[];
  onHotspotClick: (hotspot: TourHotspot) => void;
  autoRotate: boolean;
  rotateSpeed: number;
}

const PanoramaSphere: React.FC<PanoramaSphereProps> = ({
  imageUrl,
  hotspots,
  onHotspotClick,
  autoRotate,
  rotateSpeed
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * rotateSpeed * 0.1;
    }
  });

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation': return <Navigation className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'media': return <Play className="h-4 w-4" />;
      case 'link': return <Link2 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Convert pitch/yaw to 3D position on sphere
  const pitchYawToPosition = (pitch: number, yaw: number, radius: number = 4.5) => {
    const pitchRad = THREE.MathUtils.degToRad(pitch);
    const yawRad = THREE.MathUtils.degToRad(yaw);
    
    return new THREE.Vector3(
      radius * Math.cos(pitchRad) * Math.sin(yawRad),
      radius * Math.sin(pitchRad),
      radius * Math.cos(pitchRad) * Math.cos(yawRad)
    );
  };

  if (!texture) {
    return (
      <Html center>
        <div className="flex items-center gap-2 text-primary-foreground">
          <RotateCw className="h-5 w-5 animate-spin" />
          <span>Loading panorama...</span>
        </div>
      </Html>
    );
  }

  return (
    <group>
      <Sphere ref={meshRef} args={[5, 64, 64]} scale={[-1, 1, 1]}>
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </Sphere>

      {hotspots.map((hotspot) => {
        const position = pitchYawToPosition(
          hotspot.position.pitch,
          hotspot.position.yaw
        );

        return (
          <Html
            key={hotspot.id}
            position={position}
            center
            distanceFactor={10}
            occlude={false}
          >
            <button
              onClick={() => onHotspotClick(hotspot)}
              className={cn(
                "group relative flex items-center justify-center rounded-full p-2 transition-all duration-200",
                "bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg",
                "hover:scale-110 cursor-pointer",
                hotspot.style.size === 'large' ? 'w-12 h-12' : 'w-10 h-10'
              )}
              style={{ backgroundColor: hotspot.style.color || undefined }}
            >
              {getHotspotIcon(hotspot.hotspot_type)}
              
              <div className="absolute left-full ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-foreground shadow-lg">
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

interface Panorama360ViewerProps {
  scene: TourScene;
  hotspots: TourHotspot[];
  onSceneChange?: (sceneId: string) => void;
  settings?: {
    autoRotate: boolean;
    rotateSpeed: number;
    enableZoom: boolean;
    defaultFov: number;
  };
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({
  scene,
  hotspots,
  onSceneChange,
  settings = { autoRotate: true, rotateSpeed: 0.5, enableZoom: true, defaultFov: 75 },
  className,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(settings.autoRotate);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<TourHotspot | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);

  const handleHotspotClick = useCallback((hotspot: TourHotspot) => {
    if (hotspot.hotspot_type === 'navigation' && hotspot.target_scene_id) {
      onSceneChange?.(hotspot.target_scene_id);
    } else {
      setSelectedHotspot(hotspot);
      setShowInfo(true);
    }
  }, [onSceneChange]);

  const handleVRMode = useCallback(() => {
    if ('xr' in navigator) {
      setIsVRMode(!isVRMode);
      // VR session would be initiated here
    }
  }, [isVRMode]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden bg-black",
        isFullscreen ? "fixed inset-0 z-50" : "aspect-video",
        className
      )}
    >
      <Canvas
        camera={{ fov: settings.defaultFov, position: [0, 0, 0.1] }}
        gl={{ antialias: true, alpha: false }}
      >
        <OrbitControls
          enableZoom={settings.enableZoom}
          enablePan={false}
          minDistance={0.1}
          maxDistance={0.1}
          rotateSpeed={-0.5}
          zoomSpeed={0.5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
        <PanoramaSphere
          imageUrl={scene.image_url}
          hotspots={hotspots}
          onHotspotClick={handleHotspotClick}
          autoRotate={isAutoRotating}
          rotateSpeed={settings.rotateSpeed}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
          >
            <RotateCw className={cn("h-4 w-4", isAutoRotating && "animate-spin")} />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleVRMode}
          >
            <Glasses className="h-4 w-4" />
          </Button>
          
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Scene title */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
          <Eye className="h-3 w-3 mr-1" />
          {scene.title}
        </Badge>
      </div>

      {/* VR indicator */}
      {isVRMode && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-primary">
            <Glasses className="h-3 w-3 mr-1" />
            VR Mode
          </Badge>
        </div>
      )}

      {/* Hotspot info modal */}
      {showInfo && selectedHotspot && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-background rounded-xl p-6 max-w-md mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold mb-2">{selectedHotspot.title}</h3>
            {selectedHotspot.description && (
              <p className="text-muted-foreground mb-4">{selectedHotspot.description}</p>
            )}
            
            {selectedHotspot.hotspot_type === 'media' && selectedHotspot.media_url && (
              <div className="mb-4">
                <img 
                  src={selectedHotspot.media_url} 
                  alt={selectedHotspot.title}
                  className="rounded-lg w-full"
                />
              </div>
            )}
            
            {selectedHotspot.hotspot_type === 'link' && selectedHotspot.link_url && (
              <a
                href={selectedHotspot.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more →
              </a>
            )}
            
            <Button
              className="w-full mt-4"
              onClick={() => {
                setShowInfo(false);
                setSelectedHotspot(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Panorama360Viewer;
