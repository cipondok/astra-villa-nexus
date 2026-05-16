import React, { Suspense, useRef, useState, useCallback, lazy } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Text, Box, Sphere, Plane } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { BaseProperty } from '@/types/property';
import { cn } from '@/lib/utils';
import Price from '@/components/ui/Price';
import {
  RotateCcw, Sun, Moon, Maximize2, Minimize2, Link2, Link2Off,
  Building2, TrendingUp, Bed, Bath, Maximize, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// ─── Demo Villa Scene ────────────────────────────────────────────────
function DemoVillaScene({ color = '#e0c9a0', scale = 1 }: { color?: string; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main building */}
      <Box args={[3, 2, 4]} position={[0, 1, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </Box>
      {/* Roof */}
      <Box args={[3.4, 0.3, 4.4]} position={[0, 2.15, 0]} castShadow>
        <meshStandardMaterial color="#8b7355" roughness={0.5} />
      </Box>
      {/* Pool */}
      <Box args={[2, 0.2, 3]} position={[3, 0.1, 0]}>
        <meshStandardMaterial color="#4da8da" roughness={0.1} metalness={0.3} transparent opacity={0.8} />
      </Box>
      {/* Garden */}
      <Sphere args={[0.6, 16, 16]} position={[-2.5, 0.6, 1.5]} castShadow>
        <meshStandardMaterial color="#4a7c59" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.5, 16, 16]} position={[-2.5, 0.5, -1]} castShadow>
        <meshStandardMaterial color="#5a8c69" roughness={0.8} />
      </Sphere>
      {/* Door */}
      <Box args={[0.6, 1.2, 0.1]} position={[0, 0.6, 2.05]}>
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </Box>
      {/* Windows */}
      <Box args={[0.5, 0.5, 0.1]} position={[-1, 1.3, 2.05]}>
        <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.5} transparent opacity={0.6} />
      </Box>
      <Box args={[0.5, 0.5, 0.1]} position={[1, 1.3, 2.05]}>
        <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.5} transparent opacity={0.6} />
      </Box>
    </group>
  );
}

// ─── Scene Component ─────────────────────────────────────────────────
interface SceneProps {
  property: BaseProperty;
  isNight: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  syncedTarget?: THREE.Vector3;
  syncedPosition?: THREE.Vector3;
  onControlsChange?: (target: THREE.Vector3, position: THREE.Vector3) => void;
  isSynced: boolean;
}

function Scene({ property, isNight, controlsRef, syncedTarget, syncedPosition, onControlsChange, isSynced }: SceneProps) {
  // Sync camera when synced mode is on
  useFrame(() => {
    if (isSynced && controlsRef.current && syncedTarget && syncedPosition) {
      controlsRef.current.target.lerp(syncedTarget, 0.1);
      controlsRef.current.object.position.lerp(syncedPosition, 0.1);
      controlsRef.current.update();
    }
  });

  const handleChange = useCallback(() => {
    if (controlsRef.current && onControlsChange) {
      onControlsChange(
        controlsRef.current.target.clone(),
        controlsRef.current.object.position.clone()
      );
    }
  }, [controlsRef, onControlsChange]);

  const color = property.property_type === 'villa' ? '#e0c9a0' : '#c5ccd3';
  const scale = Math.min(1.2, Math.max(0.7, (property.area_sqm || 200) / 200));

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        onChange={handleChange}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* Lighting */}
      <ambientLight intensity={isNight ? 0.15 : 0.4} />
      <directionalLight
        position={isNight ? [5, 8, -3] : [10, 15, 5]}
        intensity={isNight ? 0.3 : 1.2}
        color={isNight ? '#6b7db3' : '#fff5e6'}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {isNight && (
        <>
          <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffd699" distance={8} />
          <pointLight position={[3, 0.5, 0]} intensity={0.3} color="#4da8da" distance={5} />
        </>
      )}

      <Environment preset={isNight ? 'night' : 'sunset'} />

      {/* Ground */}
      <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color={isNight ? '#1a2a1a' : '#3a5a3a'} roughness={0.9} />
      </Plane>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={20} blur={2} />

      {/* Demo model */}
      <DemoVillaScene color={color} scale={scale} />

      {/* Property label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color={isNight ? '#ffffff' : '#1a1a1a'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {property.title?.slice(0, 25) || 'Property'}
      </Text>
    </>
  );
}

// ─── Property Info Overlay ───────────────────────────────────────────
function PropertyInfoOverlay({ property, side }: { property: BaseProperty; side: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "absolute bottom-3 z-10 p-3 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-lg max-w-[220px]",
        side === 'left' ? 'left-3' : 'right-3'
      )}
    >
      <h4 className="font-bold text-xs text-foreground truncate">{property.title}</h4>
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground truncate">{property.location}</span>
      </div>
      <Price amount={property.price} className="text-xs font-bold text-primary mt-1" />
      <div className="flex gap-2 mt-1.5">
        {property.bedrooms && (
          <div className="flex items-center gap-0.5">
            <Bed className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{property.bedrooms}</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-0.5">
            <Bath className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{property.bathrooms}</span>
          </div>
        )}
        {property.area_sqm && (
          <div className="flex items-center gap-0.5">
            <Maximize className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{property.area_sqm}m²</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
interface Smart3DCompareProps {
  propertyA: BaseProperty;
  propertyB: BaseProperty;
  onClose?: () => void;
}

export default function Smart3DCompare({ propertyA, propertyB, onClose }: Smart3DCompareProps) {
  const [isNight, setIsNight] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const controlsRefA = useRef<OrbitControlsImpl>(null);
  const controlsRefB = useRef<OrbitControlsImpl>(null);

  const [syncTarget, setSyncTarget] = useState<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const [syncPosition, setSyncPosition] = useState<THREE.Vector3>(new THREE.Vector3(8, 6, 8));

  // When A moves, B follows
  const handleControlsChangeA = useCallback((target: THREE.Vector3, position: THREE.Vector3) => {
    if (isSynced) {
      setSyncTarget(target);
      setSyncPosition(position);
    }
  }, [isSynced]);

  const resetViews = () => {
    const defaultPos = new THREE.Vector3(8, 6, 8);
    const defaultTarget = new THREE.Vector3(0, 1, 0);
    [controlsRefA, controlsRefB].forEach(ref => {
      if (ref.current) {
        ref.current.object.position.copy(defaultPos);
        ref.current.target.copy(defaultTarget);
        ref.current.update();
      }
    });
    setSyncTarget(defaultTarget);
    setSyncPosition(defaultPos);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden border border-border bg-card",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      )}
    >
      {/* Controls Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-full px-4 py-2 border border-border/50 shadow-lg">
        <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20">
          <Building2 className="h-3 w-3" /> 3D Compare
        </Badge>

        <div className="h-4 w-px bg-border" />

        <Button
          size="icon-sm"
          variant={isSynced ? "default" : "ghost"}
          onClick={() => setIsSynced(!isSynced)}
          title={isSynced ? "Synced orbit" : "Independent orbit"}
        >
          {isSynced ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
        </Button>

        <Button size="icon-sm" variant="ghost" onClick={() => setIsNight(!isNight)} title="Toggle day/night">
          {isNight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </Button>

        <Button size="icon-sm" variant="ghost" onClick={resetViews} title="Reset views">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <Button size="icon-sm" variant="ghost" onClick={toggleFullscreen} title="Fullscreen">
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Split-Screen Divider Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-px h-full absolute left-1/2 -translate-x-1/2 bg-border/50" />
        <Badge className="bg-background/90 text-foreground border border-border shadow-md text-[9px]">VS</Badge>
      </div>

      {/* Split Screen */}
      <div className={cn("grid grid-cols-2 gap-px bg-border/30", isFullscreen ? "h-screen" : "h-[500px]")}>
        {/* Left - Property A */}
        <div className="relative bg-gradient-to-br from-muted to-card overflow-hidden">
          <PropertyInfoOverlay property={propertyA} side="left" />
          <Canvas shadows gl={{ antialias: true, alpha: false }}>
            <Suspense fallback={null}>
              <Scene
                property={propertyA}
                isNight={isNight}
                controlsRef={controlsRefA}
                onControlsChange={handleControlsChangeA}
                isSynced={false}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Right - Property B */}
        <div className="relative bg-gradient-to-br from-card to-muted overflow-hidden">
          <PropertyInfoOverlay property={propertyB} side="right" />
          <Canvas shadows gl={{ antialias: true, alpha: false }}>
            <Suspense fallback={null}>
              <Scene
                property={propertyB}
                isNight={isNight}
                controlsRef={controlsRefB}
                syncedTarget={syncTarget}
                syncedPosition={syncPosition}
                isSynced={isSynced}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Bottom Comparison Stats */}
      <div className="grid grid-cols-2 gap-px bg-border/30">
        <CompactStats property={propertyA} />
        <CompactStats property={propertyB} />
      </div>
    </div>
  );
}

function CompactStats({ property }: { property: BaseProperty }) {
  return (
    <div className="bg-card p-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{property.title}</p>
        <Price amount={property.price} className="text-sm font-black text-primary" />
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        {property.bedrooms && <span>{property.bedrooms} BR</span>}
        {property.bathrooms && <span>{property.bathrooms} BA</span>}
        {property.area_sqm && <span>{property.area_sqm}m²</span>}
      </div>
    </div>
  );
}
