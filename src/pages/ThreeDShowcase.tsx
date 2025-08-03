import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Plane } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Home, Info, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

// Window data with details
const windowsData = [
  // First Floor - Front Wall
  { id: 'front-1', position: [-1.5, 0.5, 2.01], size: [0.8, 1.2], name: 'Living Room Window', wall: 'Front', floor: 1 },
  { id: 'front-2', position: [1.5, 0.5, 2.01], size: [0.8, 1.2], name: 'Kitchen Window', wall: 'Front', floor: 1 },
  
  // First Floor - Back Wall
  { id: 'back-1', position: [-1, 0.5, -2.01], size: [1.0, 1.2], name: 'Dining Room Window', wall: 'Back', floor: 1 },
  { id: 'back-2', position: [1, 0.5, -2.01], size: [1.0, 1.2], name: 'Bedroom Window', wall: 'Back', floor: 1 },
  
  // First Floor - Left Wall
  { id: 'left-1', position: [-2.01, 0.5, 0], size: [0.8, 1.2], name: 'Side Room Window', wall: 'Left', floor: 1 },
  
  // First Floor - Right Wall
  { id: 'right-1', position: [2.01, 0.5, 0], size: [0.8, 1.2], name: 'Guest Room Window', wall: 'Right', floor: 1 },
  
  // Second Floor - Front Wall
  { id: 'front-3', position: [-1, 3.5, 2.01], size: [0.8, 1.2], name: 'Master Bedroom Window', wall: 'Front', floor: 2 },
  { id: 'front-4', position: [1, 3.5, 2.01], size: [0.8, 1.2], name: 'Study Room Window', wall: 'Front', floor: 2 },
  
  // Second Floor - Back Wall
  { id: 'back-3', position: [-0.5, 3.5, -2.01], size: [0.8, 1.2], name: 'Kids Room Window', wall: 'Back', floor: 2 },
  
  // Second Floor - Left Wall
  { id: 'left-2', position: [-2.01, 3.5, -0.5], size: [0.8, 1.2], name: 'Bathroom Window', wall: 'Left', floor: 2 },
  
  // Second Floor - Right Wall (Terrace Door)
  { id: 'terrace-door', position: [2.01, 3.5, 0.5], size: [1.0, 1.8], name: 'Terrace Door', wall: 'Right', floor: 2, isTerraceEntry: true },
];

// Window Component
const Window = ({ data, isHovered, onHover, onLeave, isDayTime }) => {
  const meshRef = useRef();
  
  const isVertical = data.position[0] === 2.01 || data.position[0] === -2.01;
  const rotation: [number, number, number] = isVertical ? [0, Math.PI / 2, 0] : [0, 0, 0];

  return (
    <group 
      position={[data.position[0], data.position[1], data.position[2]]} 
      rotation={rotation}
    >
      {/* Window Frame */}
      <Box 
        ref={meshRef}
        args={[data.size[0] + 0.1, data.size[1] + 0.1, 0.1]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover && onHover(e);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onLeave && onLeave();
        }}
      >
        <meshStandardMaterial 
          color={isHovered ? "#8B4513" : "#654321"} 
          transparent
          opacity={0.9}
        />
      </Box>
      
      {/* Window Glass */}
      <Box 
        args={[data.size[0], data.size[1], 0.05]} 
        position={[0, 0, 0.05]}
      >
        <meshPhysicalMaterial 
          color={isDayTime ? "#87CEEB" : "#1e3a8a"}
          transparent 
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
        />
      </Box>

      {/* Highlight effect when hovered */}
      {isHovered && (
        <Box 
          args={[data.size[0] + 0.2, data.size[1] + 0.2, 0.15]} 
          position={[0, 0, -0.1]}
        >
          <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
        </Box>
      )}
    </group>
  );
};

// House Structure Component
const HouseStructure = ({ isDayTime }) => {
  return (
    <group>
      {/* First Floor Base */}
      <Box args={[4, 0.2, 4]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* First Floor Walls */}
      <Box args={[4, 2.5, 0.2]} position={[0, 0.25, 2]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[4, 2.5, 0.2]} position={[0, 0.25, -2]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[0.2, 2.5, 4]} position={[-2, 0.25, 0]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[0.2, 2.5, 4]} position={[2, 0.25, 0]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>

      {/* Second Floor Base */}
      <Box args={[4, 0.2, 4]} position={[0, 2.4, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Second Floor Walls */}
      <Box args={[4, 2.5, 0.2]} position={[0, 3.75, 2]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[3, 2.5, 0.2]} position={[-0.5, 3.75, -2]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[0.2, 2.5, 4]} position={[-2, 3.75, 0]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>
      
      <Box args={[0.2, 2.5, 2]} position={[2, 3.75, -1]}>
        <meshStandardMaterial color={isDayTime ? "#F5DEB3" : "#D2B48C"} />
      </Box>

      {/* Roof */}
      <Box args={[4.5, 0.3, 4.5]} position={[0, 5.2, 0]}>
        <meshStandardMaterial color="#8B0000" />
      </Box>

      {/* Terrace Floor */}
      <Box args={[2, 0.1, 2]} position={[1, 2.6, 1]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Terrace Railings */}
      <Box args={[2, 0.8, 0.1]} position={[1, 3.4, 2]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      <Box args={[0.1, 0.8, 2]} position={[2, 3.4, 1]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      <Box args={[2, 0.8, 0.1]} position={[1, 3.4, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
};

// Information Panel Component
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

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold">Loading 3D House Model...</h2>
      <p className="text-muted-foreground">Preparing your immersive experience</p>
    </div>
  </div>
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-4">3D Model Loading Error</h2>
      <p className="text-muted-foreground mb-4">
        There was an issue loading the 3D house model. This might be due to WebGL compatibility.
      </p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  </div>
);

// Main Scene Component
const HouseScene = ({ isDayTime, hoveredWindow, setHoveredWindow, mousePosition, setMousePosition }) => {
  const handleWindowHover = (windowData, event) => {
    setHoveredWindow(windowData);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleWindowLeave = () => {
    setHoveredWindow(null);
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isDayTime ? 0.6 : 0.2} />
      <directionalLight 
        position={isDayTime ? [10, 10, 5] : [5, 5, 5]} 
        intensity={isDayTime ? 1 : 0.3}
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

      {/* Ground */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1.2, 0]}
      >
        <meshStandardMaterial color={isDayTime ? "#90EE90" : "#2F4F2F"} />
      </Plane>
    </>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Model Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={null} resetErrorBoundary={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

const ThreeDShowcase = () => {
  const [isDayTime, setIsDayTime] = useState(true);
  const [hoveredWindow, setHoveredWindow] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
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
            className="bg-gradient-to-b from-sky-200 to-sky-50 dark:from-gray-900 dark:to-gray-800"
            onCreated={(state) => {
              state.gl.setClearColor('#87CEEB');
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
              
              <HouseScene 
                isDayTime={isDayTime}
                hoveredWindow={hoveredWindow}
                setHoveredWindow={setHoveredWindow}
                mousePosition={mousePosition}
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
    </ErrorBoundary>
  );
};

export default ThreeDShowcase;