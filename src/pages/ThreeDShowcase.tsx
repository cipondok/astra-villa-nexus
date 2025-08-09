import React, { useState, useRef, Suspense, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sun, Moon, Home, Info, RotateCcw, Box as BoxIcon, Eye, MousePointer, Maximize,
  Camera, Ruler, Maximize2, RotateCw, ZoomIn, ZoomOut, Move3D, Grid3X3,
  Download, Fullscreen, MapPin, Building, AlertTriangle, RefreshCw
} from 'lucide-react';
import * as THREE from 'three';

// Enhanced window data with more details
const windowsData = [
  // First Floor - Front Wall
  { id: 'front-1', position: [-1.5, 0.5, 2.01], size: [1.2, 1.4], name: 'Living Room Bay Window', wall: 'Front', floor: 1, type: 'Bay Window', material: 'Double Glazed' },
  { id: 'front-2', position: [1.5, 0.5, 2.01], size: [0.8, 1.2], name: 'Kitchen Window', wall: 'Front', floor: 1, type: 'Casement', material: 'Triple Glazed' },
  
  // First Floor - Back Wall
  { id: 'back-1', position: [-1, 0.5, -2.01], size: [1.0, 1.2], name: 'Dining Room Window', wall: 'Back', floor: 1, type: 'Sliding', material: 'Double Glazed' },
  { id: 'back-2', position: [1, 0.5, -2.01], size: [1.0, 1.2], name: 'Guest Bedroom Window', wall: 'Back', floor: 1, type: 'Casement', material: 'Double Glazed' },
  
  // First Floor - Side Walls
  { id: 'left-1', position: [-2.01, 0.5, 0], size: [0.8, 1.2], name: 'Study Room Window', wall: 'Left', floor: 1, type: 'Fixed', material: 'Double Glazed' },
  { id: 'right-1', position: [2.01, 0.5, 0], size: [0.8, 1.2], name: 'Utility Room Window', wall: 'Right', floor: 1, type: 'Awning', material: 'Single Glazed' },
  
  // Second Floor - Front Wall
  { id: 'front-3', position: [-1, 3.5, 2.01], size: [1.0, 1.4], name: 'Master Bedroom Window', wall: 'Front', floor: 2, type: 'French Window', material: 'Triple Glazed' },
  { id: 'front-4', position: [1, 3.5, 2.01], size: [0.8, 1.2], name: 'Home Office Window', wall: 'Front', floor: 2, type: 'Casement', material: 'Double Glazed' },
  
  // Second Floor - Back Wall
  { id: 'back-3', position: [-0.5, 3.5, -2.01], size: [0.8, 1.2], name: 'Kids Bedroom Window', wall: 'Back', floor: 2, type: 'Tilt & Turn', material: 'Triple Glazed' },
  
  // Second Floor - Side Walls
  { id: 'left-2', position: [-2.01, 3.5, -0.5], size: [0.6, 1.0], name: 'Bathroom Window', wall: 'Left', floor: 2, type: 'Obscure Glass', material: 'Double Glazed' },
  { id: 'terrace-door', position: [2.01, 3.5, 0.5], size: [1.2, 2.0], name: 'Terrace French Doors', wall: 'Right', floor: 2, type: 'French Doors', material: 'Triple Glazed', isTerraceEntry: true },
];

// Enhanced materials and textures - Optimized for stable colors
const createMaterials = () => ({
  brick: new THREE.MeshStandardMaterial({ 
    color: new THREE.Color('#CD853F'),
    roughness: 0.8,
    metalness: 0.1,
  }),
  roof: new THREE.MeshStandardMaterial({ 
    color: new THREE.Color('#8B0000'),
    roughness: 0.9,
    metalness: 0.0,
  }),
  wood: new THREE.MeshStandardMaterial({ 
    color: new THREE.Color('#8B4513'),
    roughness: 0.7,
    metalness: 0.0,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#87CEEB'),
    transparent: true,
    opacity: 0.3,
    roughness: 0.0,
    metalness: 0.0,
    transmission: 0.8,
    ior: 1.5,
    clearcoat: 1.0,
  }),
  windowFrame: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#654321'),
    roughness: 0.6,
    metalness: 0.2,
  }),
});

const materials = createMaterials();

// Enhanced Box component with better materials
interface EnhancedBoxProps {
  position: [number, number, number];
  args: [number, number, number];
  material: THREE.Material;
  onClick?: (event: any) => void;
  onPointerEnter?: (event: any) => void;
  onPointerLeave?: (event: any) => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const EnhancedBox = ({ position, args, material, onClick, onPointerEnter, onPointerLeave, castShadow = true, receiveShadow = true }: EnhancedBoxProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={args} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

// Enhanced Window Component
const RealisticWindow = ({ data, isHovered, onHover, onLeave, isDayTime }) => {
  const isVertical = Math.abs(data.position[0]) > 1.9;
  const rotationY = isVertical ? Math.PI / 2 : 0;

  return (
    <group position={data.position as [number, number, number]} rotation={[0, rotationY, 0]}>
      {/* Window Frame - Outer */}
      <EnhancedBox
        position={[0, 0, 0]}
        args={[data.size[0] + 0.15, data.size[1] + 0.15, 0.15]}
        material={materials.windowFrame}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover && onHover(e);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onLeave && onLeave();
        }}
      />
      
      {/* Window Frame - Inner */}
      <EnhancedBox
        position={[0, 0, 0.05]}
        args={[data.size[0] + 0.05, data.size[1] + 0.05, 0.05]}
        material={materials.windowFrame}
      />
      
      {/* Window Glass */}
      <EnhancedBox
        position={[0, 0, 0.08]}
        args={[data.size[0], data.size[1], 0.02]}
        material={materials.glass}
        castShadow={false}
      />

      {/* Window Dividers */}
      {/* Horizontal divider */}
      <EnhancedBox
        position={[0, 0, 0.1]}
        args={[data.size[0], 0.02, 0.01]}
        material={materials.windowFrame}
      />
      
      {/* Vertical divider */}
      <EnhancedBox
        position={[0, 0, 0.1]}
        args={[0.02, data.size[1], 0.01]}
        material={materials.windowFrame}
      />

      {/* Highlight when hovered */}
      {isHovered && (
        <EnhancedBox
          position={[0, 0, -0.1]}
          args={[data.size[0] + 0.3, data.size[1] + 0.3, 0.1]}
          material={new THREE.MeshBasicMaterial({ color: "#ffff00", transparent: true, opacity: 0.3 })}
          castShadow={false}
          receiveShadow={false}
        />
      )}
    </group>
  );
};

// Enhanced House Structure with improved realism
const RealisticHouseStructure = ({ isDayTime, wireframeMode }) => {
  const activeMaterials = wireframeMode ? 
    {
      brick: new THREE.MeshBasicMaterial({ color: '#CD853F', wireframe: true }),
      roof: new THREE.MeshBasicMaterial({ color: '#8B0000', wireframe: true }),
      wood: new THREE.MeshBasicMaterial({ color: '#8B4513', wireframe: true }),
    } : materials;

  return (
    <group>
      {/* Enhanced Foundation with steps */}
      <EnhancedBox args={[4.8, 0.6, 4.8]} position={[0, -1.3, 0]} 
        material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#696969'), roughness: 0.9 })} />
      
      {/* Foundation Steps */}
      <EnhancedBox args={[2.0, 0.2, 1.0]} position={[0, -0.9, 2.5]} 
        material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#708090'), roughness: 0.8 })} />
      <EnhancedBox args={[2.0, 0.2, 0.8]} position={[0, -0.7, 2.6]} 
        material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#708090'), roughness: 0.8 })} />
      
      {/* First Floor Base */}
      <EnhancedBox args={[4.2, 0.25, 4.2]} position={[0, -0.95, 0]} material={activeMaterials.wood} />
      
      {/* Enhanced First Floor Walls with texture variation */}
      <EnhancedBox args={[4.2, 2.8, 0.25]} position={[0, 0.4, 2.1]} material={activeMaterials.brick} />
      <EnhancedBox args={[4.2, 2.8, 0.25]} position={[0, 0.4, -2.1]} material={activeMaterials.brick} />
      <EnhancedBox args={[0.25, 2.8, 4.2]} position={[-2.1, 0.4, 0]} material={activeMaterials.brick} />
      <EnhancedBox args={[0.25, 2.8, 4.2]} position={[2.1, 0.4, 0]} material={activeMaterials.brick} />

      {/* Decorative Corner Pillars */}
      <EnhancedBox args={[0.3, 3.0, 0.3]} position={[-2.0, 0.5, 2.0]} 
        material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#8B7355'), roughness: 0.7 })} />
      <EnhancedBox args={[0.3, 3.0, 0.3]} position={[2.0, 0.5, 2.0]} 
        material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#8B7355'), roughness: 0.7 })} />

      {/* Second Floor Base */}
      <EnhancedBox args={[4.2, 0.25, 4.2]} position={[0, 2.5, 0]} material={activeMaterials.wood} />

      {/* Enhanced Second Floor Walls */}
      <EnhancedBox args={[4.2, 2.8, 0.25]} position={[0, 3.9, 2.1]} material={activeMaterials.brick} />
      <EnhancedBox args={[3.2, 2.8, 0.25]} position={[-0.5, 3.9, -2.1]} material={activeMaterials.brick} />
      <EnhancedBox args={[0.25, 2.8, 4.2]} position={[-2.1, 3.9, 0]} material={activeMaterials.brick} />
      <EnhancedBox args={[0.25, 2.8, 2.2]} position={[2.1, 3.9, -1]} material={activeMaterials.brick} />

      {/* Enhanced Roof Structure */}
      <group>
        {/* Main Roof Base */}
        <EnhancedBox args={[5.0, 0.35, 5.0]} position={[0, 5.7, 0]} material={activeMaterials.roof} />
        
        {/* Roof Slopes */}
        <mesh position={[0, 6.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.0, 1.2, 8]} />
          <primitive object={activeMaterials.roof} attach="material" />
        </mesh>
        
        {/* Chimney */}
        <EnhancedBox args={[0.6, 2.0, 0.6]} position={[-1.5, 6.5, -1]} 
          material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#8B0000'), roughness: 0.8 })} />
        <EnhancedBox args={[0.8, 0.3, 0.8]} position={[-1.5, 7.6, -1]} 
          material={new THREE.MeshStandardMaterial({ color: new THREE.Color('#696969'), roughness: 0.9 })} />
      </group>

      {/* Enhanced Terrace with detailed flooring */}
      <EnhancedBox args={[2.4, 0.2, 2.4]} position={[1, 2.6, 1]} material={activeMaterials.wood} />
      
      {/* Detailed Terrace Planks */}
      {Array.from({ length: 12 }, (_, i) => (
        <EnhancedBox 
          key={`plank-${i}`}
          args={[2.2, 0.05, 0.12]} 
          position={[1, 2.72, 0.0 + i * 0.17]} 
          material={new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(wireframeMode ? '#D2691E' : '#CD853F'), 
            roughness: 0.9,
            wireframe: wireframeMode 
          })} 
        />
      ))}

      {/* Enhanced Terrace Railings with posts */}
      {/* Front Railing System */}
      <EnhancedBox args={[2.4, 1.2, 0.12]} position={[1, 3.6, 2.15]} material={activeMaterials.wood} />
      <EnhancedBox args={[2.4, 0.08, 0.08]} position={[1, 3.2, 2.15]} material={activeMaterials.wood} />
      {/* Vertical Posts */}
      {Array.from({ length: 6 }, (_, i) => (
        <EnhancedBox 
          key={`post-front-${i}`}
          args={[0.08, 1.2, 0.08]} 
          position={[0.1 + i * 0.4, 3.6, 2.1]} 
          material={activeMaterials.wood} 
        />
      ))}
      
      {/* Right Railing System */}
      <EnhancedBox args={[0.12, 1.2, 2.4]} position={[2.15, 3.6, 1]} material={activeMaterials.wood} />
      <EnhancedBox args={[0.08, 0.08, 2.4]} position={[2.15, 3.2, 1]} material={activeMaterials.wood} />
      {/* Vertical Posts */}
      {Array.from({ length: 6 }, (_, i) => (
        <EnhancedBox 
          key={`post-right-${i}`}
          args={[0.08, 1.2, 0.08]} 
          position={[2.1, 3.6, 0.1 + i * 0.4]} 
          material={activeMaterials.wood} 
        />
      ))}
      
      {/* Back Railing */}
      <EnhancedBox args={[2.4, 1.2, 0.12]} position={[1, 3.6, -0.15]} material={activeMaterials.wood} />

      {/* Enhanced Front Door with frame */}
      <EnhancedBox args={[1.0, 2.2, 0.12]} position={[0, 1.1, 2.12]} 
        material={new THREE.MeshStandardMaterial({ 
          color: new THREE.Color('#654321'), 
          roughness: 0.6,
          wireframe: wireframeMode 
        })} />
      {/* Door Frame */}
      <EnhancedBox args={[1.2, 2.4, 0.15]} position={[0, 1.2, 2.08]} 
        material={new THREE.MeshStandardMaterial({ 
          color: new THREE.Color('#8B7355'), 
          roughness: 0.7,
          wireframe: wireframeMode 
        })} />
      
      {/* Door Handle */}
      <mesh position={[0.4, 1.1, 2.2]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Enhanced Ground Landscaping */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={isDayTime ? "#228B22" : "#1a5d1a"} roughness={0.9} />
      </mesh>
      
      {/* Garden Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 4]} receiveShadow>
        <planeGeometry args={[2.0, 4]} />
        <meshStandardMaterial color="#708090" roughness={0.8} />
      </mesh>
      
      {/* Decorative Garden Elements */}
      {/* Small bushes */}
      <mesh position={[-3, -1.2, 3]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
      <mesh position={[3, -1.2, 3]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
      
      {/* Trees */}
      <group position={[-6, -1.5, -6]}>
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4, 0]} castShadow>
          <sphereGeometry args={[1.2, 8, 6]} />
          <meshStandardMaterial color="#228B22" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// Enhanced Info Panel
const EnhancedInfoPanel = ({ windowData, position }) => {
  if (!windowData) return null;

  return (
    <div 
      className="absolute bg-white/95 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-4 shadow-xl z-20 min-w-[280px] max-w-[320px]"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 340),
        top: Math.max(position.y - 10, 10),
        pointerEvents: 'none'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Building className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-primary">{windowData.name}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-medium text-gray-600">Location</p>
          <p className="text-gray-800">{windowData.wall} Wall</p>
        </div>
        <div>
          <p className="font-medium text-gray-600">Floor</p>
          <p className="text-gray-800">Floor {windowData.floor}</p>
        </div>
        <div>
          <p className="font-medium text-gray-600">Dimensions</p>
          <p className="text-gray-800">{windowData.size[0]}m × {windowData.size[1]}m</p>
        </div>
        <div>
          <p className="font-medium text-gray-600">Type</p>
          <p className="text-gray-800">{windowData.type}</p>
        </div>
        <div className="col-span-2">
          <p className="font-medium text-gray-600">Glazing</p>
          <p className="text-gray-800">{windowData.material}</p>
        </div>
      </div>
      
      {windowData.isTerraceEntry && (
        <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800">
          <MapPin className="h-3 w-3 mr-1" />
          Terrace Access
        </Badge>
      )}
    </div>
  );
};

// 3D Tools Panel Component - Collapsible and Compact
const ToolsPanel = ({ 
  onResetView, 
  onToggleWireframe, 
  wireframeMode, 
  onToggleGrid,
  gridMode,
  onCameraPreset,
  onMeasureMode,
  measureMode,
  onScreenshot,
  onFullscreen 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const cameraPresets = [
    { name: 'Front', icon: Camera, value: 'front' },
    { name: 'Back', icon: Camera, value: 'back' },
    { name: 'Left', icon: Camera, value: 'left' },
    { name: 'Right', icon: Camera, value: 'right' },
    { name: 'Top', icon: Camera, value: 'top' },
    { name: 'Isometric', icon: Camera, value: 'iso' },
  ];

  return (
    <div className="absolute top-20 left-4 z-50">
      {/* Tools Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 bg-white/95 hover:bg-white/100 text-gray-800 border border-gray-200 shadow-lg backdrop-blur-sm"
        size="sm"
      >
        <Move3D className="h-4 w-4 mr-2" />
        Tools
        {isOpen ? <span className="ml-2">▼</span> : <span className="ml-2">▶</span>}
      </Button>

      {/* Collapsible Tools Panel */}
      {isOpen && (
        <div className="bg-white/98 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 p-4 w-72 max-h-[70vh] overflow-y-auto z-50">
          {/* Quick Actions */}
          <div className="mb-4">
            <p className="font-semibold text-sm mb-2 text-gray-700">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={wireframeMode ? "default" : "outline"}
                onClick={onToggleWireframe}
                className="text-xs h-8"
              >
                <Grid3X3 className="h-3 w-3 mr-1" />
                Wire
              </Button>
              <Button
                size="sm"
                variant={gridMode ? "default" : "outline"}
                onClick={onToggleGrid}
                className="text-xs h-8"
              >
                <Grid3X3 className="h-3 w-3 mr-1" />
                Grid
              </Button>
              <Button
                size="sm"
                variant={measureMode ? "default" : "outline"}
                onClick={onMeasureMode}
                className="text-xs h-8"
              >
                <Ruler className="h-3 w-3 mr-1" />
                Measure
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onResetView}
                className="text-xs h-8"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Camera Views */}
          <div className="mb-4">
            <p className="font-semibold text-sm mb-2 text-gray-700">Camera Views</p>
            <div className="grid grid-cols-2 gap-1">
              {cameraPresets.map((preset) => (
                <Button
                  key={preset.value}
                  size="sm"
                  variant="outline"
                  onClick={() => onCameraPreset(preset.value)}
                  className="text-xs h-8 justify-start"
                >
                  <preset.icon className="h-3 w-3 mr-1" />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Export Tools */}
          <div>
            <p className="font-semibold text-sm mb-2 text-gray-700">Export & View</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onScreenshot}
                className="w-full text-xs h-8 justify-start"
              >
                <Download className="h-3 w-3 mr-2" />
                Download Screenshot
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onFullscreen}
                className="w-full text-xs h-8 justify-start"
              >
                <Fullscreen className="h-3 w-3 mr-2" />
                Enter Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scene Component
const EnhancedScene = ({ 
  isDayTime, 
  hoveredWindow, 
  setHoveredWindow, 
  setMousePosition, 
  wireframeMode,
  gridMode,
  controlsRef 
}) => {
  const handleWindowHover = (windowData, event) => {
    setHoveredWindow(windowData);
    if (event.clientX && event.clientY) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleWindowLeave = () => {
    setHoveredWindow(null);
  };

  // Stable wireframe mode without causing color blasting
  const [wireframeMaterials, setWireframeMaterials] = React.useState(null);
  
  React.useEffect(() => {
    if (wireframeMode && !wireframeMaterials) {
      // Create separate wireframe materials to prevent color issues
      const newWireframeMaterials = {
        brick: new THREE.MeshBasicMaterial({ color: '#CD853F', wireframe: true }),
        roof: new THREE.MeshBasicMaterial({ color: '#8B0000', wireframe: true }),
        wood: new THREE.MeshBasicMaterial({ color: '#8B4513', wireframe: true }),
        glass: new THREE.MeshBasicMaterial({ color: '#87CEEB', wireframe: true, transparent: true, opacity: 0.5 }),
        windowFrame: new THREE.MeshBasicMaterial({ color: '#654321', wireframe: true }),
      };
      setWireframeMaterials(newWireframeMaterials);
    } else if (!wireframeMode && wireframeMaterials) {
      setWireframeMaterials(null);
    }
  }, [wireframeMode, wireframeMaterials]);

  return (
    <>
      {/* Environment and Lighting */}
      <Environment preset={isDayTime ? "sunset" : "night"} />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={isDayTime ? 0.4 : 0.2} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDayTime ? 1.2 : 0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Additional lights for realism */}
      <pointLight position={[-5, 8, 5]} intensity={0.3} color="#FFF8DC" />
      <pointLight position={[5, 8, -5]} intensity={0.3} color="#FFF8DC" />
      
      {!isDayTime && (
        <>
          <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffd700" />
          <pointLight position={[1, 3, 1]} intensity={0.4} color="#ffaa00" />
        </>
      )}

      {/* Grid Helper */}
      {gridMode && (
        <gridHelper args={[20, 20, '#888888', '#444444']} position={[0, -1.5, 0]} />
      )}

      {/* Contact Shadows for better ground integration */}
      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.4} 
        scale={15} 
        blur={2.5} 
        far={4.5} 
      />

      {/* House Structure */}
      <RealisticHouseStructure isDayTime={isDayTime} wireframeMode={wireframeMode} />

      {/* Windows */}
      {windowsData.map((windowData) => (
        <RealisticWindow
          key={windowData.id}
          data={windowData}
          isHovered={hoveredWindow?.id === windowData.id}
          onHover={(event) => handleWindowHover(windowData, event)}
          onLeave={handleWindowLeave}
          isDayTime={isDayTime}
        />
      ))}
    </>
  );
};

// WebGL compatibility check function
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!context) {
      return { supported: false, error: 'WebGL not supported by browser' };
    }
    
    // Check for required WebGL extensions
    const requiredExtensions = ['OES_element_index_uint', 'WEBGL_depth_texture'];
    const missingExtensions = [];
    
    for (const ext of requiredExtensions) {
      if (!context.getExtension(ext)) {
        missingExtensions.push(ext);
      }
    }
    
    // Check WebGL capabilities
    const maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE) as number;
    const maxVertexUniforms = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS) as number;
    
    if (maxTextureSize < 1024 || maxVertexUniforms < 128) {
      return { 
        supported: false, 
        error: 'WebGL capabilities insufficient',
        details: `Max texture: ${maxTextureSize}, Max uniforms: ${maxVertexUniforms}`
      };
    }
    
    return { 
      supported: true, 
      capabilities: { maxTextureSize, maxVertexUniforms },
      missingExtensions 
    };
  } catch (error: any) {
    return { supported: false, error: `WebGL check failed: ${error.message}` };
  }
};

// Main Component
const ThreeDShowcase = () => {
  const [isDayTime, setIsDayTime] = useState(true);
  const [hoveredWindow, setHoveredWindow] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [wireframeMode, setWireframeMode] = useState(false);
  const [gridMode, setGridMode] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [webglSupport, setWebglSupport] = useState<any>(null);
  const controlsRef = useRef<any>();

  // WebGL compatibility check on mount
  useEffect(() => {
    const checkSupport = () => {
      const support = checkWebGLSupport();
      setWebglSupport(support);
      
      if (!support.supported) {
        setWebglError(support.error);
        setLoading(false);
        return;
      }
      
      // Add a delay to ensure proper initialization
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    };
    
    checkSupport();
  }, []);

  const handleCameraPreset = useCallback((preset: string) => {
    if (!controlsRef.current) return;
    
    const positions = {
      front: [0, 3, 8],
      back: [0, 3, -8],
      left: [-8, 3, 0],
      right: [8, 3, 0],
      top: [0, 15, 0],
      iso: [8, 6, 8],
    };
    
    const position = positions[preset as keyof typeof positions];
    if (position && controlsRef.current.object && controlsRef.current.target) {
      controlsRef.current.object.position.set(...position);
      controlsRef.current.target.set(0, 2, 0);
      controlsRef.current.update();
    }
  }, []);

  const handleResetView = useCallback(() => {
    handleCameraPreset('iso');
  }, [handleCameraPreset]);

  const handleScreenshot = useCallback(() => {
    // This would capture the canvas content
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = '3d-house-model.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const element = document.querySelector('.canvas-container');
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  }, []);

  // Handle retry for WebGL issues
  const handleRetry = useCallback(() => {
    setWebglError(null);
    setLoading(true);
    
    // Force a re-check of WebGL support
    setTimeout(() => {
      const support = checkWebGLSupport();
      setWebglSupport(support);
      
      if (!support.supported) {
        setWebglError(support.error);
      }
      setLoading(false);
    }, 500);
  }, []);

  // Error state for WebGL compatibility issues
  if (webglError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              3D Model Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>WebGL Compatibility Issue:</strong> {webglError}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Possible Solutions:</h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Try updating your web browser to the latest version</li>
                <li>Enable hardware acceleration in your browser settings</li>
                <li>Update your graphics drivers</li>
                <li>Try switching to a different browser (Chrome, Firefox, Safari)</li>
                <li>Disable browser extensions that might interfere with WebGL</li>
              </ul>
              
              {webglSupport?.details && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  <strong>Technical Details:</strong> {webglSupport.details}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Go Back Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Loading Realistic 3D House Model...</h2>
          <p className="text-muted-foreground">Checking WebGL compatibility and preparing visualization...</p>
          {webglSupport?.capabilities && (
            <div className="text-xs text-muted-foreground">
              WebGL Supported • Max Texture Size: {webglSupport.capabilities.maxTextureSize}px
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="relative z-20 bg-background/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Home className="h-6 w-6" />
                Realistic 3D House Model
              </h1>
              <p className="text-muted-foreground">Professional virtual house tour with advanced tools</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDayTime(!isDayTime)}
                className="flex items-center gap-2"
              >
                {isDayTime ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDayTime ? 'Night Mode' : 'Day Mode'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas with Error Boundary */}
      <div className="h-[calc(100vh-120px)] relative canvas-container">
        <Canvas
          camera={{ position: [8, 6, 8], fov: 60 }}
          shadows
          className="bg-gradient-to-b from-sky-100 to-sky-50 dark:from-gray-900 dark:to-gray-800"
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: true
          }}
          onCreated={({ gl }) => {
            // Optimize WebGL settings for better compatibility
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <OrbitControls 
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={25}
              maxPolarAngle={Math.PI / 2.1}
              enableDamping
              dampingFactor={0.05}
            />
            
            <EnhancedScene 
              isDayTime={isDayTime}
              hoveredWindow={hoveredWindow}
              setHoveredWindow={setHoveredWindow}
              setMousePosition={setMousePosition}
              wireframeMode={wireframeMode}
              gridMode={gridMode}
              controlsRef={controlsRef}
            />
          </Suspense>
        </Canvas>

        {/* Tools Panel */}
        <ToolsPanel
          onResetView={handleResetView}
          onToggleWireframe={() => setWireframeMode(!wireframeMode)}
          wireframeMode={wireframeMode}
          onToggleGrid={() => setGridMode(!gridMode)}
          gridMode={gridMode}
          onCameraPreset={handleCameraPreset}
          onMeasureMode={() => setMeasureMode(!measureMode)}
          measureMode={measureMode}
          onScreenshot={handleScreenshot}
          onFullscreen={handleFullscreen}
        />

        {/* Enhanced Information Panel */}
        <EnhancedInfoPanel windowData={hoveredWindow} position={mousePosition} />

        {/* Features Panel */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-xs shadow-xl">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Model Features
          </h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Realistic materials & textures
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Enhanced lighting & shadows
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Professional 3D tools
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Interactive window details
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Multiple camera angles
            </li>
          </ul>
        </div>

        {/* Controls Info */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-xs shadow-xl">
          <h3 className="font-bold mb-3">Navigation Controls</h3>
          <ul className="text-sm space-y-2">
            <li><strong>Left Click + Drag:</strong> Rotate view</li>
            <li><strong>Right Click + Drag:</strong> Pan camera</li>
            <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
            <li><strong>Hover Windows:</strong> View details</li>
            <li><strong>Tools Panel:</strong> Advanced options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThreeDShowcase;