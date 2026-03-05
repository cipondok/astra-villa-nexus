import React, { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center, ContactShadows, Html, useProgress, Text, Box, Sphere } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Price from '@/components/ui/Price';
import { useDigitalTwin, RoomInsight } from '@/hooks/useDigitalTwin';
import {
  Loader2, Box as BoxIcon, TrendingUp, Activity, Flame, Home, ChevronRight,
  Maximize2, Minimize2, RotateCcw, Sun, Moon, Brain, Sparkles, DoorOpen,
  ArrowRight, PaintBucket, Star, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── Loader ───
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium tabular-nums">Loading {progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// ─── GLB Model ───
function PropertyModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <Center><primitive object={scene} /></Center>;
}

// ─── Room Hotspot (3D sphere clickable) ───
function RoomHotspot({ position, room, isActive, onClick }: {
  position: [number, number, number];
  room: RoomInsight;
  isActive: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = room.market_appeal_score >= 85 ? '#22c55e' : room.market_appeal_score >= 70 ? '#f59e0b' : '#3b82f6';

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(isActive ? 1.4 + Math.sin(Date.now() * 0.005) * 0.15 : 1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.8 : 0.3} transparent opacity={0.9} />
      </mesh>
      {isActive && (
        <Html distanceFactor={8} center style={{ pointerEvents: 'none' }}>
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg p-2.5 shadow-xl min-w-[180px] -translate-y-10">
            <p className="text-xs font-bold text-foreground">{room.room_name}</p>
            <p className="text-[10px] text-muted-foreground">{room.size_sqm} sqm</p>
            <p className="text-[10px] text-primary mt-0.5">Appeal: {room.market_appeal_score}/100</p>
          </div>
        </Html>
      )}
      <Html distanceFactor={10} center style={{ pointerEvents: 'none' }}>
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-background/80 border border-border text-[8px] font-bold text-foreground">
          {room.room_name.charAt(0)}
        </div>
      </Html>
    </group>
  );
}

// ─── Placeholder 3D scene (when no GLB) ───
function PlaceholderScene({ rooms, activeRoom, onRoomClick }: {
  rooms: RoomInsight[];
  activeRoom: number | null;
  onRoomClick: (i: number) => void;
}) {
  // Distribute rooms in a grid layout
  const positions: [number, number, number][] = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(rooms.length));
    return rooms.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [(col - (cols - 1) / 2) * 2, 0.5, (row - Math.floor(rooms.length / cols) / 2) * 2] as [number, number, number];
    });
  }, [rooms.length]);

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Room blocks */}
      {rooms.map((room, i) => {
        const scale = Math.max(0.5, room.size_sqm / 30);
        const color = room.market_appeal_score >= 85 ? '#22c55e' : room.market_appeal_score >= 70 ? '#f59e0b' : '#3b82f6';
        return (
          <group key={i} position={positions[i]}>
            <mesh castShadow onClick={(e) => { e.stopPropagation(); onRoomClick(i); }}>
              <boxGeometry args={[scale, scale * 0.6, scale]} />
              <meshStandardMaterial
                color={activeRoom === i ? color : '#2d2d44'}
                emissive={color}
                emissiveIntensity={activeRoom === i ? 0.4 : 0.1}
                transparent
                opacity={0.85}
              />
            </mesh>
            <Html distanceFactor={8} position={[0, scale * 0.4, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="text-[9px] text-white font-semibold bg-black/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                {room.room_name}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

// ─── Score Gauge ───
function ScoreGauge({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value.toFixed(0)}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───
interface DigitalTwinViewerProps {
  propertyId: string;
  className?: string;
}

const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({ propertyId, className }) => {
  const { data: twin, isLoading, isError } = useDigitalTwin(propertyId);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [envPreset, setEnvPreset] = useState<'apartment' | 'sunset' | 'night'>('apartment');
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-muted/20 rounded-xl", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Digital Twin...</p>
        </div>
      </div>
    );
  }

  if (isError || !twin) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-muted/20 rounded-xl", className)}>
        <p className="text-sm text-muted-foreground">Failed to load Digital Twin data.</p>
      </div>
    );
  }

  const hasModel = !!twin.property.glb_model_url;
  const activeRoomData = activeRoom !== null ? twin.room_insights[activeRoom] : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-card border border-border rounded-xl overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-background/90 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{twin.property.title}</h3>
            <p className="text-[10px] text-muted-foreground">{twin.property.city} · {twin.property.property_type}</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] ml-2">
            Digital Twin
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/70 backdrop-blur-md" onClick={() => setShowInsightsPanel(!showInsightsPanel)}>
            <Sparkles className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/70 backdrop-blur-md" onClick={() => controlsRef.current?.reset()}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/70 backdrop-blur-md" onClick={() => setEnvPreset(p => p === 'apartment' ? 'sunset' : p === 'sunset' ? 'night' : 'apartment')}>
            {envPreset === 'night' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/70 backdrop-blur-md" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className={cn("w-full", isFullscreen ? "h-screen" : "h-[500px] sm:h-[600px]")}>
        <Canvas camera={{ position: [0, 4, 8], fov: 50 }} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={<LoaderOverlay />}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow shadow-mapSize={1024} />
            <pointLight position={[-3, 3, -3]} intensity={0.3} color="#f59e0b" />

            {hasModel ? (
              <>
                <PropertyModel url={twin.property.glb_model_url!} />
                {/* Place hotspots around the model */}
                {twin.room_insights.map((room, i) => {
                  const angle = (i / twin.room_insights.length) * Math.PI * 2;
                  const radius = 2;
                  const pos: [number, number, number] = [Math.cos(angle) * radius, 1, Math.sin(angle) * radius];
                  return (
                    <RoomHotspot
                      key={i}
                      position={pos}
                      room={room}
                      isActive={activeRoom === i}
                      onClick={() => setActiveRoom(activeRoom === i ? null : i)}
                    />
                  );
                })}
              </>
            ) : (
              <PlaceholderScene
                rooms={twin.room_insights}
                activeRoom={activeRoom}
                onRoomClick={(i) => setActiveRoom(activeRoom === i ? null : i)}
              />
            )}

            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={15} blur={2} far={5} />
            <Environment preset={envPreset} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            enablePan enableZoom enableRotate
            autoRotate={activeRoom === null}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={2}
            maxDistance={25}
          />
        </Canvas>
      </div>

      {/* Scores bar (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-background/95 to-transparent">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          <ScoreGauge label="Investment" value={twin.scores.investment_score} icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} color="#22c55e" />
          <ScoreGauge label="Demand Heat" value={twin.scores.demand_heat_score} icon={<Flame className="h-3.5 w-3.5 text-rose-500" />} color="#ef4444" />
          <ScoreGauge label="Livability" value={twin.scores.livability_score} icon={<Home className="h-3.5 w-3.5 text-sky-500" />} color="#3b82f6" />
          <ScoreGauge label="Luxury" value={twin.scores.luxury_score} icon={<Star className="h-3.5 w-3.5 text-amber-500" />} color="#f59e0b" />
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground">5yr Forecast</span>
            <span className="text-sm font-bold text-emerald-500">
              <Price amount={twin.price_forecast.forecast_price} short />
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">
              +{twin.price_forecast.growth_rate}%/yr
            </Badge>
          </div>
        </div>
      </div>

      {/* AI Insights Side Panel */}
      <AnimatePresence>
        {showInsightsPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-12 right-3 z-10 w-72 max-h-[calc(100%-8rem)] overflow-y-auto"
          >
            <Card className="bg-background/90 backdrop-blur-md border-border/60 shadow-2xl">
              <CardContent className="p-3 space-y-3">
                {/* Property Insight */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Property Insight</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{twin.property_insights}</p>
                </div>

                <div className="h-px bg-border/50" />

                {/* Investment Analysis */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Investment Analysis</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{twin.investment_analysis}</p>
                </div>

                <div className="h-px bg-border/50" />

                {/* Room Insights */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <DoorOpen className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Room Analysis</span>
                  </div>
                  <div className="space-y-2">
                    {twin.room_insights.map((room, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded-lg border cursor-pointer transition-all",
                          activeRoom === i
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/30 bg-muted/20 hover:border-border/60"
                        )}
                        onClick={() => setActiveRoom(activeRoom === i ? null : i)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground">{room.room_name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground">{room.size_sqm}sqm</span>
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: room.market_appeal_score >= 85 ? '#22c55e' : room.market_appeal_score >= 70 ? '#f59e0b' : '#3b82f6' }}
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{room.ai_insight}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <PaintBucket className="h-2.5 w-2.5" />
                            Reno: <Price amount={room.renovation_cost_estimate} short />
                          </span>
                          <span className="text-[9px] font-medium" style={{ color: room.market_appeal_score >= 85 ? '#22c55e' : room.market_appeal_score >= 70 ? '#f59e0b' : '#3b82f6' }}>
                            Appeal: {room.market_appeal_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalTwinViewer;
