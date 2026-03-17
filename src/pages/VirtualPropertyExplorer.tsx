import { useState, useRef, useMemo, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Float, MeshDistortMaterial, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Eye, TrendingUp, DollarSign, MapPin, Maximize2, Minimize2, ChevronRight,
  Sparkles, BarChart3, Home, Building2, Layers, Info, ArrowUpRight,
  Play, Pause, RotateCcw, Move3D, Compass, Star, Zap, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Property Data ───────────────────────────────────────────────────
const PROPERTIES = [
  {
    id: 'v1',
    name: 'Villa Serenity',
    location: 'Canggu, Bali',
    type: 'Luxury Villa',
    price: 'Rp 12.5B',
    priceNum: 12500000000,
    sqm: 450,
    bedrooms: 4,
    bathrooms: 5,
    pool: true,
    opportunityScore: 92,
    rentalYield: 8.4,
    appreciation: 14.2,
    theme: 'tropical',
    color: '#10b981',
    description: 'A stunning contemporary villa with infinity pool overlooking rice paddies. Open-plan living, imported Italian marble, and smart home integration throughout.',
    hotspots: [
      { id: 'h1', label: 'Infinity Pool', position: [3, 0.5, -2] as [number, number, number], detail: '15m infinity edge pool with Bali stone deck', icon: '🏊' },
      { id: 'h2', label: 'Master Suite', position: [-3, 2, 1] as [number, number, number], detail: 'King suite with private terrace and ocean view', icon: '🛏️' },
      { id: 'h3', label: 'Living Pavilion', position: [0, 1, 3] as [number, number, number], detail: 'Open-air living with 8m ceiling and garden view', icon: '🏡' },
      { id: 'h4', label: 'Chef Kitchen', position: [2, 1, 2] as [number, number, number], detail: 'Professional kitchen with imported appliances', icon: '👨‍🍳' },
    ],
  },
  {
    id: 'v2',
    name: 'Sky Penthouse',
    location: 'SCBD, Jakarta',
    type: 'Luxury Apartment',
    price: 'Rp 18.8B',
    priceNum: 18800000000,
    sqm: 320,
    bedrooms: 3,
    bathrooms: 4,
    pool: false,
    opportunityScore: 85,
    rentalYield: 6.8,
    appreciation: 9.5,
    theme: 'urban',
    color: '#6366f1',
    description: 'Ultra-premium penthouse in Jakarta\'s most prestigious business district. Floor-to-ceiling glass, private elevator, and panoramic city skyline views.',
    hotspots: [
      { id: 'h1', label: 'Sky Lounge', position: [2, 2.5, -1] as [number, number, number], detail: 'Private rooftop terrace with 360° city views', icon: '🌃' },
      { id: 'h2', label: 'Gallery Hall', position: [-2, 1.5, 2] as [number, number, number], detail: 'Double-height gallery with curated art wall', icon: '🖼️' },
      { id: 'h3', label: 'Wine Room', position: [3, 0.5, 2] as [number, number, number], detail: 'Temperature-controlled 200-bottle cellar', icon: '🍷' },
      { id: 'h4', label: 'Spa Bath', position: [-3, 1, -2] as [number, number, number], detail: 'Japanese onsen-inspired master bath', icon: '♨️' },
    ],
  },
  {
    id: 'v3',
    name: 'Sawah Residence',
    location: 'Ubud, Bali',
    type: 'Eco Villa',
    price: 'Rp 8.2B',
    priceNum: 8200000000,
    sqm: 380,
    bedrooms: 3,
    bathrooms: 4,
    pool: true,
    opportunityScore: 88,
    rentalYield: 9.1,
    appreciation: 16.8,
    theme: 'nature',
    color: '#f59e0b',
    description: 'Award-winning sustainable villa surrounded by terraced rice fields. Reclaimed teak construction, solar-powered, with natural spring water feature.',
    hotspots: [
      { id: 'h1', label: 'Yoga Deck', position: [3, 1, 0] as [number, number, number], detail: 'Elevated platform overlooking rice terraces', icon: '🧘' },
      { id: 'h2', label: 'Organic Garden', position: [-2, 0.5, 3] as [number, number, number], detail: 'Farm-to-table herb and vegetable garden', icon: '🌿' },
      { id: 'h3', label: 'River Lounge', position: [0, 0.5, -3] as [number, number, number], detail: 'Covered pavilion over natural stream', icon: '🏞️' },
      { id: 'h4', label: 'Treehouse Suite', position: [-3, 3, -1] as [number, number, number], detail: 'Elevated sleeping pod in banyan canopy', icon: '🌳' },
    ],
  },
];

const PRICE_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: 100 + Math.sin(i / 2) * 5 + i * 2.5 + Math.random() * 3,
}));

const MASTERPLAN_UNITS = [
  { id: 'u1', name: 'Type A — Grand Villa', sqm: 450, price: 'Rp 12.5B', units: 8, available: 3, color: '#10b981' },
  { id: 'u2', name: 'Type B — Garden Villa', sqm: 320, price: 'Rp 8.8B', units: 12, available: 5, color: '#6366f1' },
  { id: 'u3', name: 'Type C — Pool Suite', sqm: 180, price: 'Rp 4.5B', units: 20, available: 12, color: '#f59e0b' },
  { id: 'u4', name: 'Type D — Studio Loft', sqm: 85, price: 'Rp 2.2B', units: 30, available: 18, color: '#ec4899' },
];

// ─── 3D Components ───────────────────────────────────────────────────
function VillaModel({ theme }: { theme: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  const envPreset = theme === 'urban' ? 'city' : theme === 'nature' ? 'forest' : 'sunset';

  return (
    <>
      <Environment preset={envPreset as any} background blur={0.6} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#fbbf24" />

      {/* Main Structure */}
      <group ref={meshRef}>
        {/* Base Platform */}
        <RoundedBox args={[6, 0.3, 4]} radius={0.05} position={[0, -0.15, 0]}>
          <meshStandardMaterial color="hsl(220, 15%, 20%)" roughness={0.3} metalness={0.1} />
        </RoundedBox>

        {/* Main Building */}
        <RoundedBox args={[4, 2, 3]} radius={0.08} position={[0, 1, 0]}>
          <meshStandardMaterial color="hsl(220, 10%, 90%)" roughness={0.4} metalness={0.05} transparent opacity={0.85} />
        </RoundedBox>

        {/* Roof */}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[4.4, 0.15, 3.4]} />
          <meshStandardMaterial color="hsl(220, 15%, 25%)" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Windows */}
        {[[-1.2, 1.2, 1.51], [0, 1.2, 1.51], [1.2, 1.2, 1.51]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color="hsl(200, 80%, 70%)" transparent opacity={0.3} roughness={0} metalness={0.8} />
          </mesh>
        ))}

        {/* Pool / Feature */}
        {theme !== 'urban' && (
          <mesh position={[0, 0.05, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 1.5]} />
            <MeshDistortMaterial color="hsl(195, 80%, 55%)" transparent opacity={0.6} distort={0.15} speed={2} />
          </mesh>
        )}

        {/* Pillars */}
        {[[-2.1, 1, 1.5], [2.1, 1, 1.5]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
            <meshStandardMaterial color="hsl(220, 10%, 75%)" />
          </mesh>
        ))}

        {/* Landscaping spheres */}
        {[[3.2, 0.4, 1], [-3.2, 0.6, -1], [3, 0.3, -2]].map((pos, i) => (
          <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh position={pos as [number, number, number]}>
              <sphereGeometry args={[0.3 + i * 0.1, 16, 16]} />
              <meshStandardMaterial color={theme === 'nature' ? 'hsl(130, 50%, 40%)' : theme === 'urban' ? 'hsl(220, 15%, 50%)' : 'hsl(150, 60%, 45%)'} roughness={0.8} />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={theme === 'nature' ? 'hsl(130, 30%, 25%)' : theme === 'urban' ? 'hsl(220, 10%, 15%)' : 'hsl(35, 40%, 30%)'} roughness={1} />
      </mesh>
    </>
  );
}

function Hotspot3D({ hotspot, onClick, isActive }: { hotspot: typeof PROPERTIES[0]['hotspots'][0]; onClick: () => void; isActive: boolean }) {
  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <Html position={hotspot.position} center distanceFactor={8}>
        <button
          onClick={onClick}
          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer ${
            isActive
              ? 'bg-primary/30 border-primary/50 scale-110 shadow-lg shadow-primary/20'
              : 'bg-background/60 border-border/30 hover:bg-primary/20 hover:border-primary/40 hover:scale-105'
          }`}
        >
          <span className="text-sm">{hotspot.icon}</span>
          <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {hotspot.label}
          </span>
          {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
        </button>
      </Html>
    </Float>
  );
}

// ─── Chart Tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/40 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-mono font-bold text-foreground">{payload[0].value.toFixed(1)}</p>
    </div>
  );
}

// ─── Investment Overlay ──────────────────────────────────────────────
function InvestmentOverlay({ property }: { property: typeof PROPERTIES[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 z-10 w-64 space-y-2"
    >
      {/* Opportunity Score */}
      <div className="backdrop-blur-md bg-background/70 border border-border/30 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Opportunity Score</span>
          <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
            <Zap className="h-2.5 w-2.5 mr-0.5" /> AI Rated
          </Badge>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">{property.opportunityScore}</span>
          <span className="text-xs text-muted-foreground mb-1">/100</span>
        </div>
        <Progress value={property.opportunityScore} className="h-1.5 mt-1" />
      </div>

      {/* Mini Price Trend */}
      <div className="backdrop-blur-md bg-background/70 border border-border/30 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">12M Price Trend</span>
          <span className="text-[10px] font-bold text-emerald-400 ml-auto flex items-center">
            <ArrowUpRight className="h-3 w-3" /> +{property.appreciation}%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={PRICE_TREND} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#trendGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Indicators */}
      <div className="backdrop-blur-md bg-background/70 border border-border/30 rounded-xl p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[9px] text-muted-foreground uppercase">Rental Yield</span>
            <p className="text-sm font-bold text-emerald-400">{property.rentalYield}%</p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground uppercase">Appreciation</span>
            <p className="text-sm font-bold text-primary">{property.appreciation}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function VirtualPropertyExplorer() {
  const [selectedProperty, setSelectedProperty] = useState(PROPERTIES[0]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<'explore' | 'masterplan'>('explore');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHotspotData = useMemo(
    () => selectedProperty.hotspots.find(h => h.id === activeHotspot),
    [selectedProperty, activeHotspot]
  );

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Move3D className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-serif">Virtual Property Explorer</h1>
                <p className="text-xs text-muted-foreground">Immersive 3D walkthroughs with investment intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="explore" className="text-[10px] h-6 gap-1"><Eye className="h-3 w-3" /> Explore</TabsTrigger>
                  <TabsTrigger value="masterplan" className="text-[10px] h-6 gap-1"><Layers className="h-3 w-3" /> Masterplan</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {viewMode === 'explore' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── 3D Viewport (8 cols) ── */}
            <div className="lg:col-span-8">
              <div ref={containerRef} className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/20" style={{ height: isFullscreen ? '100vh' : '560px' }}>
                {/* Canvas */}
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <Move3D className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-muted-foreground">Loading 3D environment...</p>
                    </div>
                  </div>
                }>
                  <Canvas camera={{ position: [8, 5, 8], fov: 50 }} shadows>
                    <VillaModel theme={selectedProperty.theme} />
                    {selectedProperty.hotspots.map((h) => (
                      <Hotspot3D
                        key={h.id}
                        hotspot={h}
                        isActive={activeHotspot === h.id}
                        onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
                      />
                    ))}
                    <OrbitControls
                      autoRotate={autoRotate}
                      autoRotateSpeed={0.5}
                      enablePan={false}
                      minDistance={5}
                      maxDistance={15}
                      minPolarAngle={Math.PI / 6}
                      maxPolarAngle={Math.PI / 2.2}
                    />
                  </Canvas>
                </Suspense>

                {/* Investment Overlay */}
                {showOverlay && <InvestmentOverlay property={selectedProperty} />}

                {/* Hotspot Detail Panel */}
                <AnimatePresence>
                  {activeHotspotData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-4 left-4 right-4 z-10"
                    >
                      <div className="backdrop-blur-md bg-background/80 border border-border/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{activeHotspotData.icon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{activeHotspotData.label}</h3>
                            <p className="text-xs text-muted-foreground">{activeHotspotData.detail}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls Bar */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 backdrop-blur-sm border border-border/30" onClick={() => setAutoRotate(!autoRotate)}>
                    {autoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 backdrop-blur-sm border border-border/30" onClick={() => setShowOverlay(!showOverlay)}>
                    <BarChart3 className={`h-3.5 w-3.5 ${showOverlay ? 'text-primary' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 backdrop-blur-sm border border-border/30" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                {/* Navigation hint */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/20">
                  <Compass className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Drag to orbit · Scroll to zoom</span>
                </div>
              </div>

              {/* Property Selector Strip */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {PROPERTIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProperty(p); setActiveHotspot(null); }}
                    className={`flex-shrink-0 rounded-xl border p-3 text-left transition-all duration-200 min-w-[200px] ${
                      selectedProperty.id === p.id
                        ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                        : 'bg-card/30 border-border/20 hover:border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                      <MapPin className="h-2.5 w-2.5" /> {p.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{p.price}</span>
                      <Badge variant="outline" className="text-[8px] h-4 text-emerald-400 border-emerald-400/30">{p.opportunityScore}/100</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right Panel (4 cols) ── */}
            <div className="lg:col-span-4 space-y-4">
              {/* Property Info */}
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px]">{selectedProperty.type}</Badge>
                    <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-400/30 bg-emerald-400/5">
                      <Star className="h-2.5 w-2.5 mr-0.5" /> Score {selectedProperty.opportunityScore}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-serif mt-1">{selectedProperty.name}</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {selectedProperty.location}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
                  <Separator className="opacity-20" />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Price', value: selectedProperty.price },
                      { label: 'Area', value: `${selectedProperty.sqm} m²` },
                      { label: 'Bedrooms', value: selectedProperty.bedrooms },
                      { label: 'Bathrooms', value: selectedProperty.bathrooms },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <span className="text-[9px] text-muted-foreground uppercase">{stat.label}</span>
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Metrics */}
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Investment Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {[
                    { label: 'Rental Yield', value: `${selectedProperty.rentalYield}%`, progress: selectedProperty.rentalYield * 10, color: 'text-emerald-400' },
                    { label: 'YoY Appreciation', value: `+${selectedProperty.appreciation}%`, progress: selectedProperty.appreciation * 5, color: 'text-primary' },
                    { label: 'Opportunity Score', value: `${selectedProperty.opportunityScore}/100`, progress: selectedProperty.opportunityScore, color: 'text-amber-400' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">{m.label}</span>
                        <span className={`text-xs font-bold ${m.color}`}>{m.value}</span>
                      </div>
                      <Progress value={Math.min(m.progress, 100)} className="h-1" />
                    </div>
                  ))}

                  {/* Price Trend */}
                  <div className="pt-2">
                    <span className="text-[10px] text-muted-foreground">Price Index (12M)</span>
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={PRICE_TREND} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sideGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#sideGrad)" strokeWidth={1.5} dot={false} />
                        <Tooltip content={<ChartTooltip />} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Hotspots List */}
              <Card className="bg-card/40 border-border/30">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" /> Property Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1">
                  {selectedProperty.hotspots.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        activeHotspot === h.id
                          ? 'bg-primary/5 border border-primary/20'
                          : 'hover:bg-muted/10 border border-transparent'
                      }`}
                    >
                      <span className="text-lg">{h.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground">{h.label}</span>
                        <p className="text-[10px] text-muted-foreground truncate">{h.detail}</p>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${activeHotspot === h.id ? 'rotate-90 text-primary' : ''}`} />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ── Masterplan Mode ── */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 3D Masterplan Viewport */}
              <div className="lg:col-span-8">
                <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/20" style={{ height: '480px' }}>
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-muted/10">
                      <Move3D className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  }>
                    <Canvas camera={{ position: [12, 8, 12], fov: 45 }} shadows>
                      <Environment preset="sunset" background blur={0.8} />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={0.7} />

                      {/* Masterplan Ground */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                        <planeGeometry args={[30, 30]} />
                        <meshStandardMaterial color="hsl(150, 25%, 22%)" roughness={1} />
                      </mesh>

                      {/* Unit Blocks */}
                      {MASTERPLAN_UNITS.map((u, i) => {
                        const positions = [
                          [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4]
                        ];
                        const [x, , z] = positions[i];
                        const height = 1 + (u.sqm / 200);
                        return (
                          <group key={u.id} position={[x, height / 2, z]}>
                            <RoundedBox args={[3, height, 3]} radius={0.1}>
                              <meshStandardMaterial color={u.color} transparent opacity={0.7} roughness={0.3} />
                            </RoundedBox>
                            <Html position={[0, height / 2 + 0.5, 0]} center>
                              <div className="whitespace-nowrap px-2 py-1 rounded bg-background/80 backdrop-blur-sm border border-border/30 text-center">
                                <p className="text-[9px] font-bold text-foreground">{u.name.split(' — ')[1]}</p>
                                <p className="text-[8px] text-muted-foreground">{u.available}/{u.units} available</p>
                              </div>
                            </Html>
                          </group>
                        );
                      })}

                      {/* Central pathway */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <planeGeometry args={[1.5, 15]} />
                        <meshStandardMaterial color="hsl(35, 30%, 55%)" roughness={0.9} />
                      </mesh>
                      <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, 0]}>
                        <planeGeometry args={[1.5, 15]} />
                        <meshStandardMaterial color="hsl(35, 30%, 55%)" roughness={0.9} />
                      </mesh>

                      <OrbitControls autoRotate autoRotateSpeed={0.3} enablePan={false} minDistance={8} maxDistance={25} maxPolarAngle={Math.PI / 2.5} />
                    </Canvas>
                  </Suspense>

                  <div className="absolute top-4 left-4 z-10">
                    <div className="backdrop-blur-md bg-background/70 border border-border/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">ASTRA Villa Development</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Canggu, Bali · 70 units across 4 types</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Types Panel */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" /> Unit Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {MASTERPLAN_UNITS.map((u) => (
                      <div key={u.id} className="rounded-lg border border-border/20 p-3 hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: u.color }} />
                          <span className="text-xs font-semibold text-foreground">{u.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <span className="text-[8px] text-muted-foreground uppercase">Area</span>
                            <p className="text-[10px] font-bold text-foreground">{u.sqm}m²</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-muted-foreground uppercase">Price</span>
                            <p className="text-[10px] font-bold text-foreground">{u.price}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-muted-foreground uppercase">Available</span>
                            <p className="text-[10px] font-bold text-emerald-400">{u.available}/{u.units}</p>
                          </div>
                        </div>
                        <Progress value={(u.available / u.units) * 100} className="h-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card/60 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Developer Advantage</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { icon: Shield, label: 'Freehold Title', desc: 'Full ownership with clean certificates' },
                        { icon: TrendingUp, label: '14% Avg Appreciation', desc: 'Projected from infrastructure development' },
                        { icon: DollarSign, label: 'Rental Pool Option', desc: 'Managed rental with guaranteed yield' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <item.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                            <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-2 text-xs">
                      <Info className="h-3.5 w-3.5 mr-1.5" /> Request Developer Brochure
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
