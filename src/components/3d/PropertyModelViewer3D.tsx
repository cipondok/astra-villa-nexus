import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center, ContactShadows, Html, useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, RotateCcw, Sun, Sunset, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──
type EnvPreset = 'sunset' | 'city' | 'apartment';

interface PropertyModelViewer3DProps {
  /** Path to GLB/GLTF file, e.g. "/models/villa.glb" */
  modelPath: string;
  /** Uniform scale multiplier (default 1) */
  scale?: number;
  /** Position offset [x, y, z] (default [0,0,0]) */
  position?: [number, number, number];
  /** Initial environment preset */
  environment?: EnvPreset;
  /** Container class */
  className?: string;
}

// ── GLB Model Loader (separated for reuse) ──
function GLBModel({ url, scale = 1, position = [0, 0, 0] }: { url: string; scale: number; position: [number, number, number] }) {
  const { scene } = useGLTF(url);

  // Ensure all meshes cast and receive shadows
  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <Center position={position}>
      <primitive object={scene} scale={scale} />
    </Center>
  );
}

// ── Loading Indicator (in-canvas) ──
function CanvasLoader() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        {/* Animated ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity={0.2} />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke="#C8A96A" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#C8A96A]">
            {Math.round(progress)}%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Loading Model</p>
      </div>
    </Html>
  );
}

// ── Scene Content ──
function SceneContent({
  modelPath, scale, position, environment,
}: {
  modelPath: string; scale: number; position: [number, number, number]; environment: EnvPreset;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, 6, -3]} intensity={0.3} color="#ffe8d0" />

      {/* Model */}
      <Suspense fallback={<CanvasLoader />}>
        <GLBModel url={modelPath} scale={scale} position={position} />
      </Suspense>

      {/* Ground shadows */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={20}
        blur={2.5}
        far={8}
        resolution={512}
      />

      {/* Environment HDRI */}
      <Environment preset={environment} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        target={[0, 1.5, 0]}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

// ── Toolbar Button ──
function ToolBtn({
  onClick, active, children, title,
}: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
        active
          ? 'bg-[#C8A96A]/20 text-[#C8A96A]'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
      )}
    >
      {children}
    </button>
  );
}

// ── Main Component ──
const PropertyModelViewer3D: React.FC<PropertyModelViewer3DProps> = ({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  environment = 'sunset',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [envPreset, setEnvPreset] = useState<EnvPreset>(environment);

  const ENV_CYCLE: EnvPreset[] = ['sunset', 'city', 'apartment'];
  const ENV_ICONS: Record<EnvPreset, React.ElementType> = { sunset: Sunset, city: Building2, apartment: Sun };
  const EnvIcon = ENV_ICONS[envPreset];

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
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full min-h-[400px] bg-[#0B0B0B] rounded-[20px] overflow-hidden border border-[hsl(var(--border))]/10',
        isFullscreen && 'rounded-none',
        className
      )}
    >
      <Canvas
        camera={{ position: [8, 5, 8], fov: 45, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#0B0B0B' }}
      >
        <color attach="background" args={['#0B0B0B']} />
        <fog attach="fog" args={['#0B0B0B', 25, 50]} />
        <SceneContent modelPath={modelPath} scale={scale} position={position} environment={envPreset} />
      </Canvas>

      {/* Floating Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-[#0B0B0B]/70 backdrop-blur-xl border border-[hsl(var(--border))]/10 shadow-2xl">
          <ToolBtn onClick={cycleEnv} title={`Environment: ${envPreset}`}>
            <EnvIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolBtn>
        </div>
      </div>

      {/* Environment label */}
      <AnimatePresence>
        <motion.div
          key={envPreset}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#0B0B0B]/60 backdrop-blur-sm border border-[hsl(var(--border))]/10 z-10"
        >
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{envPreset}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PropertyModelViewer3D;
