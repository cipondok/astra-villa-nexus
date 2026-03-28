import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center, ContactShadows, Html, useProgress, Float, Text, Sphere } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Sun, Moon, Sunset, Building2, RotateCw, Eye, ArrowUp, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

// ── Types ──
type EnvPreset = 'sunset' | 'city' | 'apartment';

interface CameraPreset {
  id: string;
  label: string;
  icon: React.ElementType;
  position: [number, number, number];
  target: [number, number, number];
}

interface Hotspot {
  id: string;
  label: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  description: string;
  icon: string;
}

interface PropertyModelViewer3DProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  environment?: EnvPreset;
  hotspots?: Hotspot[];
  className?: string;
}

// ── Camera Presets ──
const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'front', label: 'Front', icon: Home, position: [0, 3, 12], target: [0, 1.5, 0] },
  { id: 'top', label: 'Top', icon: ArrowUp, position: [0, 16, 0.1], target: [0, 0, 0] },
  { id: 'interior', label: 'Interior', icon: Eye, position: [1, 2, 1], target: [0, 1.5, -2] },
];

const DEFAULT_HOTSPOTS: Hotspot[] = [
  { id: 'pool', label: 'Infinity Pool', position: [-1, 0.8, 3.5], cameraPosition: [-1, 2.5, 7], description: '15m infinity pool with Bali stone deck and sunset views', icon: '🏊' },
  { id: 'master', label: 'Master Suite', position: [1.5, 4.2, 0.5], cameraPosition: [5, 5.5, 4], description: 'King suite with private terrace and panoramic views', icon: '🛏️' },
  { id: 'living', label: 'Living Pavilion', position: [0, 1.8, 2], cameraPosition: [3, 3, 6], description: 'Open-air living with 8m ceiling and garden view', icon: '🏡' },
  { id: 'garden', label: 'Tropical Garden', position: [-5, 1.5, 2], cameraPosition: [-8, 3, 5], description: 'Landscaped grounds with native flora and water features', icon: '🌴' },
];

// ── Smooth Camera Controller ──
function SmoothCameraController({
  targetPosition,
  targetLookAt,
  isAnimating,
  onComplete,
  autoRotate,
  controlsRef,
}: {
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  isAnimating: boolean;
  onComplete: () => void;
  autoRotate: boolean;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const lerpFactor = 0.04;
  const progressRef = useRef(0);

  useFrame(() => {
    if (!isAnimating || !targetPosition || !targetLookAt) return;

    progressRef.current += lerpFactor;
    const t = Math.min(progressRef.current, 1);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerp(targetPosition, ease * 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt, ease * 0.08);
      controlsRef.current.update();
    }

    const dist = camera.position.distanceTo(targetPosition);
    if (dist < 0.05 || t >= 1) {
      progressRef.current = 0;
      onComplete();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 1.5, 0]}
      minDistance={1.5}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2.05}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      panSpeed={0.4}
      autoRotate={autoRotate && !isAnimating}
      autoRotateSpeed={0.8}
    />
  );
}

// ── Clickable Hotspot ──
function HotspotMarker({
  hotspot,
  isActive,
  onClick,
}: {
  hotspot: Hotspot;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.position.y = hotspot.position[1] + Math.sin(Date.now() * 0.003) * 0.1;
      const s = hovered || isActive ? 1.4 : 1;
      ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.8;
      const ringScale = isActive ? 2.2 : hovered ? 1.8 : 0;
      ringRef.current.scale.lerp(new THREE.Vector3(ringScale, ringScale, ringScale), 0.1);
    }
  });

  return (
    <group>
      {/* Pulsing ring */}
      <mesh ref={ringRef} position={hotspot.position} rotation={[Math.PI / 2, 0, 0]} scale={0}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color="#C8A96A" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Core sphere */}
      <Sphere
        ref={ref}
        args={[0.12, 16, 16]}
        position={hotspot.position}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshPhysicalMaterial
          color={isActive ? '#FFD700' : hovered ? '#E0C080' : '#C8A96A'}
          emissive={isActive ? '#C8A96A' : '#8B7340'}
          emissiveIntensity={isActive ? 2 : hovered ? 1.2 : 0.5}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>

      {/* Label on hover */}
      {(hovered || isActive) && (
        <Float speed={2} floatIntensity={0.2}>
          <Html position={[hotspot.position[0], hotspot.position[1] + 0.45, hotspot.position[2]]} center distanceFactor={8}>
            <div className="px-3 py-1.5 rounded-xl bg-[#0B0B0B]/85 backdrop-blur-xl border border-[#C8A96A]/30 whitespace-nowrap select-none pointer-events-none">
              <span className="text-[11px] font-semibold text-[#C8A96A]">{hotspot.icon} {hotspot.label}</span>
            </div>
          </Html>
        </Float>
      )}
    </group>
  );
}

// ── GLB Model ──
function GLBModel({ url, scale = 1, position = [0, 0, 0] }: { url: string; scale: number; position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
  }, [scene]);
  return <Center position={position}><primitive object={scene} scale={scale} /></Center>;
}

// ── Canvas Loader ──
function CanvasLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity={0.2} />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#C8A96A" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#C8A96A]">{Math.round(progress)}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Loading Model</p>
      </div>
    </Html>
  );
}

// ── Smooth Light Lerp ──
function LerpedLight({ lightRef, target }: { lightRef: React.RefObject<THREE.Light>; target: number }) {
  useFrame(() => {
    if (lightRef.current) lightRef.current.intensity += (target - lightRef.current.intensity) * 0.04;
  });
  return null;
}

// ── Scene ──
function SceneContent({
  modelPath, scale, position, environment, hotspots, activeHotspot, onHotspotClick, autoRotate, controlsRef, cameraTarget, onCameraComplete, isNight,
}: {
  modelPath: string; scale: number; position: [number, number, number]; environment: EnvPreset;
  hotspots: Hotspot[]; activeHotspot: string | null; onHotspotClick: (h: Hotspot) => void;
  autoRotate: boolean; controlsRef: React.RefObject<any>;
  cameraTarget: { position: THREE.Vector3; lookAt: THREE.Vector3 } | null;
  onCameraComplete: () => void;
  isNight: boolean;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.PointLight>(null);

  return (
    <>
      {/* Adaptive lighting */}
      <ambientLight ref={ambientRef} intensity={isNight ? 0.08 : 0.35} color={isNight ? '#1a2a4a' : '#ffffff'} />
      <LerpedLight lightRef={ambientRef} target={isNight ? 0.08 : 0.35} />

      <directionalLight ref={sunRef} position={[8, 12, 5]} intensity={isNight ? 0.05 : 1.4} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={30} shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0005}
        color={isNight ? '#2244aa' : '#ffffff'} />
      <LerpedLight lightRef={sunRef} target={isNight ? 0.05 : 1.4} />

      <directionalLight ref={fillRef} position={[-5, 6, -3]} intensity={isNight ? 0.02 : 0.3} color={isNight ? '#1a3366' : '#ffe8d0'} />
      <LerpedLight lightRef={fillRef} target={isNight ? 0.02 : 0.3} />

      {/* Moonlight */}
      <pointLight ref={moonRef} position={[-8, 15, -5]} intensity={isNight ? 0.5 : 0} color="#6688cc" distance={40} />
      <LerpedLight lightRef={moonRef} target={isNight ? 0.5 : 0} />

      <Suspense fallback={<CanvasLoader />}>
        <GLBModel url={modelPath} scale={scale} position={position} />
      </Suspense>

      {hotspots.map(h => (
        <HotspotMarker key={h.id} hotspot={h} isActive={activeHotspot === h.id} onClick={() => onHotspotClick(h)} />
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={isNight ? 0.2 : 0.5} scale={20} blur={2.5} far={8} resolution={512} />
      <Environment preset={isNight ? 'night' : environment} />

      <SmoothCameraController
        targetPosition={cameraTarget?.position || null}
        targetLookAt={cameraTarget?.lookAt || null}
        isAnimating={!!cameraTarget}
        onComplete={onCameraComplete}
        autoRotate={autoRotate}
        controlsRef={controlsRef}
      />
    </>
  );
}

// ── Toolbar Button ──
function ToolBtn({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button onClick={onClick} title={title}
      className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
        active ? 'bg-[#C8A96A]/20 text-[#C8A96A]' : 'text-muted-foreground hover:text-foreground hover:bg-accent/30')}>
      {children}
    </button>
  );
}

// ── Main Component ──
const PropertyModelViewer3D: React.FC<PropertyModelViewer3DProps> = ({
  modelPath, scale = 1, position = [0, 0, 0], environment = 'sunset', hotspots, className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [envPreset, setEnvPreset] = useState<EnvPreset>(environment);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hotspotInfo, setHotspotInfo] = useState<Hotspot | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{ position: THREE.Vector3; lookAt: THREE.Vector3 } | null>(null);

  const resolvedHotspots = hotspots || DEFAULT_HOTSPOTS;

  const ENV_CYCLE: EnvPreset[] = ['sunset', 'city', 'apartment'];
  const ENV_ICONS: Record<EnvPreset, React.ElementType> = { sunset: Sunset, city: Building2, apartment: Sun };
  const EnvIcon = ENV_ICONS[envPreset];

  const flyTo = useCallback((pos: [number, number, number], lookAt: [number, number, number]) => {
    setCameraTarget({ position: new THREE.Vector3(...pos), lookAt: new THREE.Vector3(...lookAt) });
  }, []);

  const handlePreset = useCallback((preset: CameraPreset) => {
    setActiveHotspot(null);
    setHotspotInfo(null);
    flyTo(preset.position, preset.target);
  }, [flyTo]);

  const handleHotspotClick = useCallback((h: Hotspot) => {
    setActiveHotspot(h.id);
    setHotspotInfo(h);
    flyTo(h.cameraPosition, h.position);
  }, [flyTo]);

  const handleCameraComplete = useCallback(() => {
    setCameraTarget(null);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const cycleEnv = useCallback(() => {
    setEnvPreset(prev => ENV_CYCLE[(ENV_CYCLE.indexOf(prev) + 1) % ENV_CYCLE.length]);
  }, []);

  return (
    <div ref={containerRef}
      className={cn('relative w-full h-full min-h-[400px] bg-[#0B0B0B] rounded-[20px] overflow-hidden border border-[hsl(var(--border))]/10', isFullscreen && 'rounded-none', className)}>
      <Canvas camera={{ position: [8, 5, 8], fov: 45, near: 0.1, far: 100 }} shadows dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} style={{ background: '#0B0B0B' }}>
        <color attach="background" args={['#0B0B0B']} />
        <fog attach="fog" args={['#0B0B0B', 25, 50]} />
        <SceneContent
          modelPath={modelPath} scale={scale} position={position} environment={envPreset}
          hotspots={resolvedHotspots} activeHotspot={activeHotspot} onHotspotClick={handleHotspotClick}
          autoRotate={autoRotate} controlsRef={controlsRef} cameraTarget={cameraTarget} onCameraComplete={handleCameraComplete}
        />
      </Canvas>

      {/* ── Camera Preset Buttons (left side) ── */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
        <div className="px-1.5 py-1.5 rounded-2xl bg-[#0B0B0B]/70 backdrop-blur-xl border border-[hsl(var(--border))]/10 flex flex-col gap-1">
          {CAMERA_PRESETS.map(p => (
            <ToolBtn key={p.id} onClick={() => handlePreset(p)} title={p.label}>
              <p.icon className="h-4 w-4" />
            </ToolBtn>
          ))}
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-[#0B0B0B]/70 backdrop-blur-xl border border-[hsl(var(--border))]/10 shadow-2xl">
          <ToolBtn onClick={() => setAutoRotate(!autoRotate)} active={autoRotate} title={autoRotate ? 'Stop rotation' : 'Auto rotate'}>
            <RotateCw className={cn('h-4 w-4', autoRotate && 'animate-spin')} style={autoRotate ? { animationDuration: '3s' } : {}} />
          </ToolBtn>
          <div className="w-px h-5 bg-[hsl(var(--border))]/10 mx-0.5" />
          <ToolBtn onClick={cycleEnv} title={`Environment: ${envPreset}`}>
            <EnvIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolBtn>
        </div>
      </div>

      {/* ── Environment Label ── */}
      <AnimatePresence>
        <motion.div key={envPreset} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#0B0B0B]/60 backdrop-blur-sm border border-[hsl(var(--border))]/10 z-10">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{envPreset}</span>
        </motion.div>
      </AnimatePresence>

      {/* ── Hotspot Info Panel ── */}
      <AnimatePresence>
        {hotspotInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute bottom-20 left-1/2 z-20 w-[320px]"
          >
            <div className="rounded-2xl bg-[#0B0B0B]/85 backdrop-blur-xl border border-[#C8A96A]/20 shadow-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{hotspotInfo.icon}</span>
                  <h4 className="text-sm font-bold text-[#C8A96A]">{hotspotInfo.label}</h4>
                </div>
                <button
                  onClick={() => { setHotspotInfo(null); setActiveHotspot(null); }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{hotspotInfo.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyModelViewer3D;
