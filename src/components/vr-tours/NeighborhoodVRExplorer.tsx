import React, { useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Html, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin, Building2, TreePine, ShoppingBag, GraduationCap,
  Stethoscope, Utensils, Waves, Mountain, Navigation,
  Play, Pause, Info, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseProperty } from '@/types/property';
import { ThreeCanvasBoundary } from './ThreeCanvasBoundary';

interface POI {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'restaurant' | 'shopping' | 'park' | 'beach' | 'temple' | 'market';
  position: [number, number, number];
  distance: string;
  rating?: number;
}

interface NeighborhoodVRExplorerProps {
  property: BaseProperty;
  isDayMode?: boolean;
  isFullscreen?: boolean;
}

// 3D POI Marker Component
function POIMarker({ poi, onClick }: { poi: POI; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'restaurant': return '🍽️';
      case 'shopping': return '🛒';
      case 'park': return '🌳';
      case 'beach': return '🏖️';
      case 'temple': return '🛕';
      case 'market': return '🏪';
      default: return '📍';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'school': return '#3b82f6';
      case 'hospital': return '#ef4444';
      case 'restaurant': return '#f97316';
      case 'shopping': return '#8b5cf6';
      case 'park': return '#22c55e';
      case 'beach': return '#0ea5e9';
      case 'temple': return '#eab308';
      case 'market': return '#ec4899';
      default: return '#6b7280';
    }
  };

  return (
    <group position={poi.position}>
      {/* Marker pin */}
      <Sphere
        args={[0.3, 16, 16]}
        position={[0, 0.3, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshStandardMaterial color={getColor(poi.type)} emissive={getColor(poi.type)} emissiveIntensity={hovered ? 0.5 : 0.2} />
      </Sphere>

      {/* Pin stem */}
      <Box args={[0.08, 0.6, 0.08]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>

      {/* Info label on hover */}
      {hovered && (
        <Html position={[0, 1, 0]} center distanceFactor={8}>
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border min-w-[120px]">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getIcon(poi.type)}</span>
              <div>
                <p className="text-sm font-medium">{poi.name}</p>
                <p className="text-xs text-muted-foreground">{poi.distance}</p>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Floating icon */}
      <Html position={[0, 0.8, 0]} center distanceFactor={10}>
        <div className="text-2xl animate-bounce">{getIcon(poi.type)}</div>
      </Html>
    </group>
  );
}

// Property Building Component
function PropertyBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main building */}
      <Box args={[2, 3, 2]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>

      {/* Roof */}
      <Box args={[2.2, 0.3, 2.2]} position={[0, 3.15, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>

      {/* Windows */}
      {[-0.5, 0.5].map((x) =>
        [0.5, 1.5, 2.5].map((y) => (
          <Box key={`${x}-${y}`} args={[0.4, 0.5, 0.1]} position={[x, y, 1.01]}>
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
        ))
      )}

      {/* Door */}
      <Box args={[0.6, 1, 0.1]} position={[0, 0.5, 1.01]}>
        <meshStandardMaterial color="#654321" />
      </Box>

      {/* "Your Property" label */}
      <Html position={[0, 4, 0]} center distanceFactor={10}>
        <Badge className="bg-primary animate-pulse whitespace-nowrap">
          <MapPin className="h-3 w-3 mr-1" />
          Your Property
        </Badge>
      </Html>
    </group>
  );
}

// Ground and Roads
function Ground({ isDayMode }: { isDayMode: boolean }) {
  return (
    <group>
      {/* Main ground */}
      <Box args={[100, 0.1, 100]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color={isDayMode ? "#90EE90" : "#2d5a3d"} />
      </Box>

      {/* Roads */}
      <Box args={[100, 0.11, 4]} position={[0, 0, 8]}>
        <meshStandardMaterial color={isDayMode ? "#555555" : "#333333"} />
      </Box>
      <Box args={[4, 0.11, 100]} position={[8, 0, 0]}>
        <meshStandardMaterial color={isDayMode ? "#555555" : "#333333"} />
      </Box>

      {/* Road markings */}
      {[-40, -20, 0, 20, 40].map((x) => (
        <Box key={x} args={[3, 0.12, 0.3]} position={[x, 0, 8]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      ))}
    </group>
  );
}

// Neighborhood Scene
function NeighborhoodScene({
  pois,
  isDayMode,
  onPOIClick
}: {
  pois: POI[];
  isDayMode: boolean;
  onPOIClick: (poi: POI) => void;
}) {
  return (
    <>
      {/* Lighting */}
      {isDayMode ? (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          <Sky sunPosition={[100, 20, 100]} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.2} color="#4a5568" />
          <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#a0aec0" />
          {/* Street lights */}
          {[-20, 0, 20].map((x) => (
            <pointLight key={x} position={[x, 5, 8]} intensity={1} color="#fbbf24" distance={15} />
          ))}
        </>
      )}

      {/* Ground and roads */}
      <Ground isDayMode={isDayMode} />

      {/* Property building (center) */}
      <PropertyBuilding position={[0, 0, 0]} />

      {/* POI markers */}
      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} onClick={() => onPOIClick(poi)} />
      ))}

      {/* Trees for ambiance */}
      {[
        [-5, 0, 5], [5, 0, -5], [-8, 0, -8], [10, 0, 3],
        [-12, 0, 10], [15, 0, -10], [-18, 0, 5], [20, 0, 15]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Trunk */}
          <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          {/* Foliage */}
          <Sphere args={[1, 8, 8]} position={[0, 2.5, 0]}>
            <meshStandardMaterial color={isDayMode ? "#228B22" : "#1a4d1a"} />
          </Sphere>
        </group>
      ))}
    </>
  );
}

const NeighborhoodVRExplorer: React.FC<NeighborhoodVRExplorerProps> = ({
  property,
  isDayMode = true,
  isFullscreen = false
}) => {
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Mock POIs - in production, fetch from neighborhood-simulator edge function
  const mockPOIs: POI[] = [
    { id: '1', name: 'Bali International School', type: 'school', position: [-15, 0, 12], distance: '1.2 km', rating: 4.8 },
    { id: '2', name: 'BIMC Hospital', type: 'hospital', position: [18, 0, -8], distance: '2.5 km', rating: 4.5 },
    { id: '3', name: 'Locavore Restaurant', type: 'restaurant', position: [10, 0, 15], distance: '800 m', rating: 4.9 },
    { id: '4', name: 'Seminyak Square', type: 'shopping', position: [-12, 0, -15], distance: '1.8 km', rating: 4.3 },
    { id: '5', name: 'Echo Beach', type: 'beach', position: [25, 0, 8], distance: '3.2 km', rating: 4.7 },
    { id: '6', name: 'Tirta Empul Temple', type: 'temple', position: [-20, 0, -5], distance: '4.5 km', rating: 4.9 },
    { id: '7', name: 'Ubud Market', type: 'market', position: [8, 0, -18], distance: '2.1 km', rating: 4.4 },
    { id: '8', name: 'Sacred Monkey Forest', type: 'park', position: [-8, 0, 20], distance: '1.5 km', rating: 4.6 },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: MapPin },
    { id: 'school', label: 'Schools', icon: GraduationCap },
    { id: 'hospital', label: 'Health', icon: Stethoscope },
    { id: 'restaurant', label: 'Dining', icon: Utensils },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'beach', label: 'Beach', icon: Waves },
  ];

  const filteredPOIs = activeCategory === 'all'
    ? mockPOIs
    : mockPOIs.filter((poi) => poi.type === activeCategory);

  return (
    <div className={cn(
      "grid gap-4 p-4",
      isFullscreen ? "lg:grid-cols-4 h-screen overflow-auto" : "lg:grid-cols-4"
    )}>
      {/* 3D Neighborhood View */}
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-gradient-to-b from-sky-200 to-emerald-100 lg:col-span-3",
        isFullscreen ? "h-[600px]" : "h-[400px]"
      )}>
        <ThreeCanvasBoundary
          fallback={({ reset, error }) => (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="max-w-md rounded-xl border border-border bg-background/80 backdrop-blur-sm p-4 text-center">
                <p className="text-sm font-medium text-foreground">Neighborhood 3D view failed to load</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The list on the right still works. We’ll re-enable 3D once the WebGL props are stable.
                </p>
                <p className="mt-2 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground break-words">
                  {error.message}
                </p>
                <Button size="sm" className="mt-3" onClick={reset}>
                  Retry 3D
                </Button>
              </div>
            </div>
          )}
        >
          <Canvas 
            camera={{ position: [30, 25, 30], fov: 50 }}
            onCreated={({ gl }) => {
              gl.setClearColor('#87ceeb');
            }}
          >
            <Suspense fallback={null}>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={isAutoRotate}
                autoRotateSpeed={0.5}
                minDistance={15}
                maxDistance={80}
                maxPolarAngle={Math.PI / 2.2}
              />
              <NeighborhoodScene
                pois={filteredPOIs}
                isDayMode={isDayMode}
                onPOIClick={setSelectedPOI}
              />
            </Suspense>
          </Canvas>
        </ThreeCanvasBoundary>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsAutoRotate(!isAutoRotate)}
            >
              {isAutoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {isAutoRotate ? 'Auto-rotating' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Category filters */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex flex-wrap gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-3 w-3 mr-1" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            <Building2 className="h-3 w-3 mr-1" />
            {filteredPOIs.length} Places Nearby
          </Badge>
        </div>
      </div>

      {/* POI Details Panel */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-primary" />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedPOI ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-primary/10 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {selectedPOI.type === 'school' && '🏫'}
                  {selectedPOI.type === 'hospital' && '🏥'}
                  {selectedPOI.type === 'restaurant' && '🍽️'}
                  {selectedPOI.type === 'shopping' && '🛒'}
                  {selectedPOI.type === 'park' && '🌳'}
                  {selectedPOI.type === 'beach' && '🏖️'}
                  {selectedPOI.type === 'temple' && '🛕'}
                  {selectedPOI.type === 'market' && '🏪'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{selectedPOI.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{selectedPOI.type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedPOI.distance}
                    </Badge>
                    {selectedPOI.rating && (
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {selectedPOI.rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3">
                Get Directions
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click a marker to see details</p>
            </div>
          )}

          {/* POI List */}
          <div className="space-y-2 max-h-[250px] overflow-auto">
            {filteredPOIs.map((poi) => (
              <button
                key={poi.id}
                onClick={() => setSelectedPOI(poi)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                  selectedPOI?.id === poi.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-lg">
                  {poi.type === 'school' && '🏫'}
                  {poi.type === 'hospital' && '🏥'}
                  {poi.type === 'restaurant' && '🍽️'}
                  {poi.type === 'shopping' && '🛒'}
                  {poi.type === 'park' && '🌳'}
                  {poi.type === 'beach' && '🏖️'}
                  {poi.type === 'temple' && '🛕'}
                  {poi.type === 'market' && '🏪'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{poi.name}</p>
                  <p className="text-xs text-muted-foreground">{poi.distance}</p>
                </div>
                {poi.rating && (
                  <span className="text-xs text-muted-foreground">⭐ {poi.rating}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeighborhoodVRExplorer;
