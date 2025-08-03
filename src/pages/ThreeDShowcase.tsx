import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Home, Info, RotateCcw, Box as BoxIcon, Eye, MousePointer, Maximize } from 'lucide-react';
import * as THREE from 'three';

// Window data with details
const windowsData = [
  // First Floor
  { id: 'front-1', position: [-1.5, 0.5, 2.01], size: [0.8, 1.2], name: 'Living Room Window', wall: 'Front', floor: 1 },
  { id: 'front-2', position: [1.5, 0.5, 2.01], size: [0.8, 1.2], name: 'Kitchen Window', wall: 'Front', floor: 1 },
  { id: 'back-1', position: [-1, 0.5, -2.01], size: [1.0, 1.2], name: 'Dining Room Window', wall: 'Back', floor: 1 },
  { id: 'back-2', position: [1, 0.5, -2.01], size: [1.0, 1.2], name: 'Bedroom Window', wall: 'Back', floor: 1 },
  { id: 'left-1', position: [-2.01, 0.5, 0], size: [0.8, 1.2], name: 'Side Room Window', wall: 'Left', floor: 1 },
  { id: 'right-1', position: [2.01, 0.5, 0], size: [0.8, 1.2], name: 'Guest Room Window', wall: 'Right', floor: 1 },
  
  // Second Floor
  { id: 'front-3', position: [-1, 3.5, 2.01], size: [0.8, 1.2], name: 'Master Bedroom Window', wall: 'Front', floor: 2 },
  { id: 'front-4', position: [1, 3.5, 2.01], size: [0.8, 1.2], name: 'Study Room Window', wall: 'Front', floor: 2 },
  { id: 'back-3', position: [-0.5, 3.5, -2.01], size: [0.8, 1.2], name: 'Kids Room Window', wall: 'Back', floor: 2 },
  { id: 'left-2', position: [-2.01, 3.5, -0.5], size: [0.8, 1.2], name: 'Bathroom Window', wall: 'Left', floor: 2 },
  { id: 'terrace-door', position: [2.01, 3.5, 0.5], size: [1.0, 1.8], name: 'Terrace Door', wall: 'Right', floor: 2, isTerraceEntry: true },
];

// Simple Box component that handles all props safely
interface SimpleBoxProps {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
  onClick?: (event: any) => void;
  onPointerEnter?: (event: any) => void;
  onPointerLeave?: (event: any) => void;
  transparent?: boolean;
  opacity?: number;
}

const SimpleBox = ({ position, args, color, onClick, onPointerEnter, onPointerLeave, transparent = false, opacity = 1 }: SimpleBoxProps) => {
  const meshRef = useRef();
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial 
        color={color} 
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
};

// Window Component - Simplified
const Window = ({ data, isHovered, onHover, onLeave, isDayTime }) => {
  const isVertical = Math.abs(data.position[0]) > 1.9;
  const rotationY = isVertical ? Math.PI / 2 : 0;

  return (
    <group position={data.position as [number, number, number]} rotation={[0, rotationY, 0]}>
      {/* Window Frame */}
      <SimpleBox
        position={[0, 0, 0]}
        args={[data.size[0] + 0.1, data.size[1] + 0.1, 0.1]}
        color={isHovered ? "#8B4513" : "#654321"}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover && onHover(e);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onLeave && onLeave();
        }}
      />
      
      {/* Window Glass */}
      <SimpleBox
        position={[0, 0, 0.05]}
        args={[data.size[0], data.size[1], 0.05]}
        color={isDayTime ? "#87CEEB" : "#1e3a8a"}
        transparent={true}
        opacity={0.3}
      />

      {/* Highlight when hovered */}
      {isHovered && (
        <SimpleBox
          position={[0, 0, -0.1]}
          args={[data.size[0] + 0.2, data.size[1] + 0.2, 0.15]}
          color="#ffff00"
          transparent={true}
          opacity={0.3}
        />
      )}
    </group>
  );
};

// House Structure - Simplified
const HouseStructure = ({ isDayTime }) => {
  const wallColor = isDayTime ? "#F5DEB3" : "#D2B48C";
  
  return (
    <group>
      {/* First Floor Base */}
      <SimpleBox args={[4, 0.2, 4]} position={[0, -1, 0]} color="#8B4513" />
      
      {/* First Floor Walls */}
      <SimpleBox args={[4, 2.5, 0.2]} position={[0, 0.25, 2]} color={wallColor} />
      <SimpleBox args={[4, 2.5, 0.2]} position={[0, 0.25, -2]} color={wallColor} />
      <SimpleBox args={[0.2, 2.5, 4]} position={[-2, 0.25, 0]} color={wallColor} />
      <SimpleBox args={[0.2, 2.5, 4]} position={[2, 0.25, 0]} color={wallColor} />

      {/* Second Floor Base */}
      <SimpleBox args={[4, 0.2, 4]} position={[0, 2.4, 0]} color="#8B4513" />

      {/* Second Floor Walls */}
      <SimpleBox args={[4, 2.5, 0.2]} position={[0, 3.75, 2]} color={wallColor} />
      <SimpleBox args={[3, 2.5, 0.2]} position={[-0.5, 3.75, -2]} color={wallColor} />
      <SimpleBox args={[0.2, 2.5, 4]} position={[-2, 3.75, 0]} color={wallColor} />
      <SimpleBox args={[0.2, 2.5, 2]} position={[2, 3.75, -1]} color={wallColor} />

      {/* Roof */}
      <SimpleBox args={[4.5, 0.3, 4.5]} position={[0, 5.2, 0]} color="#8B0000" />

      {/* Terrace Floor */}
      <SimpleBox args={[2, 0.1, 2]} position={[1, 2.6, 1]} color="#8B4513" />

      {/* Terrace Railings */}
      <SimpleBox args={[2, 0.8, 0.1]} position={[1, 3.4, 2]} color="#654321" />
      <SimpleBox args={[0.1, 0.8, 2]} position={[2, 3.4, 1]} color="#654321" />
      <SimpleBox args={[2, 0.8, 0.1]} position={[1, 3.4, 0]} color="#654321" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={isDayTime ? "#90EE90" : "#2F4F2F"} />
      </mesh>
    </group>
  );
};

// Scene Component
const Scene = ({ isDayTime, hoveredWindow, setHoveredWindow, setMousePosition }) => {
  const handleWindowHover = (windowData, event) => {
    setHoveredWindow(windowData);
    if (event.clientX && event.clientY) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleWindowLeave = () => {
    setHoveredWindow(null);
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isDayTime ? 0.6 : 0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDayTime ? 1 : 0.4}
        castShadow
      />
      {!isDayTime && (
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffd700" />
      )}

      {/* House Structure */}
      <HouseStructure isDayTime={isDayTime} />

      {/* Windows */}
      {windowsData.map((windowData) => (
        <Window
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

// Info Panel Component
const InfoPanel = ({ windowData, position }) => {
  if (!windowData) return null;

  return (
    <div 
      className="absolute bg-white/90 backdrop-blur-sm border rounded-lg p-4 shadow-lg z-10 min-w-[200px]"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        pointerEvents: 'none'
      }}
    >
      <h3 className="font-semibold text-lg mb-2">{windowData.name}</h3>
      <div className="space-y-1 text-sm">
        <p><span className="font-medium">Wall:</span> {windowData.wall}</p>
        <p><span className="font-medium">Floor:</span> {windowData.floor}</p>
        <p><span className="font-medium">Size:</span> {windowData.size[0]}m × {windowData.size[1]}m</p>
        {windowData.isTerraceEntry && (
          <Badge variant="secondary" className="mt-2">Terrace Access</Badge>
        )}
      </div>
    </div>
  );
};

// Fallback component for when WebGL is not supported
const Fallback3D = () => {
  const features = [
    {
      icon: <BoxIcon className="h-8 w-8 text-primary" />,
      title: "Interactive 3D House Model",
      description: "Explore a detailed house with windows on all walls and floors"
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Window Details",
      description: "Hover over windows to see detailed information about each room"
    },
    {
      icon: <MousePointer className="h-8 w-8 text-primary" />,
      title: "Interactive Features",
      description: "Day/night cycle, terrace access, and orbital controls"
    },
    {
      icon: <Maximize className="h-8 w-8 text-primary" />,
      title: "Second Floor Terrace",
      description: "Spacious terrace with safety railings and wooden flooring"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">3D House Model Showcase</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience an interactive 3D house model with detailed windows, terrace access, and realistic lighting effects.
          </p>
        </div>

        {/* WebGL Not Supported Message */}
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">3D Viewer Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Your browser or device doesn't support WebGL, which is required for the 3D house model. 
              Here are the features you would experience:
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* House Features */}
        <Card>
          <CardHeader>
            <CardTitle>House Model Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Window Placement</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Living Room Window (Front Wall, Floor 1)</li>
                  <li>• Kitchen Window (Front Wall, Floor 1)</li>
                  <li>• Dining Room Window (Back Wall, Floor 1)</li>
                  <li>• Guest Room Window (Right Wall, Floor 1)</li>
                  <li>• Master Bedroom Window (Front Wall, Floor 2)</li>
                  <li>• Terrace Door (Right Wall, Floor 2)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Interactive Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Hover over windows for detailed information</li>
                  <li>• Day/Night lighting cycle toggle</li>
                  <li>• Orbital camera controls (rotate, zoom, pan)</li>
                  <li>• Second-floor terrace with safety railings</li>
                  <li>• Realistic material and lighting effects</li>
                  <li>• Responsive design for all devices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Info */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">3D Technology</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              This 3D house model is built with React Three Fiber and Three.js, 
              providing WebGL-powered interactive 3D visualization with realistic lighting and materials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// WebGL Detection
const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const ThreeDShowcase = () => {
  const [isDayTime, setIsDayTime] = useState(true);
  const [hoveredWindow, setHoveredWindow] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkWebGL = () => {
      const supported = isWebGLSupported();
      setWebGLSupported(supported);
      setLoading(false);
    };
    
    // Small delay to ensure proper detection
    setTimeout(checkWebGL, 100);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading 3D House Model...</h2>
          <p className="text-muted-foreground">Checking WebGL compatibility...</p>
        </div>
      </div>
    );
  }

  if (!webGLSupported) {
    return <Fallback3D />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="relative z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Home className="h-6 w-6" />
                Interactive 3D House Model
              </h1>
              <p className="text-muted-foreground">Explore every detail with interactive windows and terrace</p>
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

      {/* 3D Canvas */}
      <div className="h-[calc(100vh-120px)] relative">
        <Canvas
          camera={{ position: [8, 6, 8], fov: 60 }}
          onCreated={(state) => {
            state.gl.setClearColor(isDayTime ? '#87CEEB' : '#191970');
          }}
        >
          <Suspense fallback={null}>
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
            />
            
            <Scene 
              isDayTime={isDayTime}
              hoveredWindow={hoveredWindow}
              setHoveredWindow={setHoveredWindow}
              setMousePosition={setMousePosition}
            />
          </Suspense>
        </Canvas>

        {/* Information Panel */}
        <InfoPanel windowData={hoveredWindow} position={mousePosition} />

        {/* Features Panel */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Features
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Interactive windows on all walls</li>
            <li>• Second-floor terrace with railings</li>
            <li>• Day/Night lighting cycle</li>
            <li>• Hover for window details</li>
            <li>• Orbit, zoom & pan controls</li>
          </ul>
        </div>

        {/* Controls Info */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2">Controls</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Left Click + Drag:</strong> Rotate</li>
            <li>• <strong>Right Click + Drag:</strong> Pan</li>
            <li>• <strong>Scroll:</strong> Zoom</li>
            <li>• <strong>Hover Windows:</strong> View Info</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThreeDShowcase;