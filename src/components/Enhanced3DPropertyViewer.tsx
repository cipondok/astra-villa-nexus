import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Sun, Moon, RotateCcw, Eye, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface Enhanced3DPropertyViewerProps {
  className?: string;
  propertyData?: {
    width: number;
    length: number;
    height: number;
    floors: number;
  };
}

// House model component
const House3D = ({ isNightMode, showDimensions }: { isNightMode: boolean; showDimensions: boolean }) => {
  const houseRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  // Lighting setup
  useEffect(() => {
    // Remove existing lights
    scene.children.filter(child => child.type.includes('Light')).forEach(light => {
      scene.remove(light);
    });

    if (isNightMode) {
      // Night lighting
      const ambientLight = new THREE.AmbientLight(0x404080, 0.2);
      scene.add(ambientLight);
      
      // Moonlight
      const moonLight = new THREE.DirectionalLight(0x8080ff, 0.5);
      moonLight.position.set(-10, 10, 5);
      moonLight.castShadow = true;
      scene.add(moonLight);
      
      // Street light
      const streetLight = new THREE.PointLight(0xffaa55, 1, 20);
      streetLight.position.set(-8, 6, 0);
      scene.add(streetLight);
    } else {
      // Day lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);
      
      // Sunlight
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.set(10, 10, 5);
      sunLight.castShadow = true;
      scene.add(sunLight);
    }
  }, [isNightMode, scene]);

  return (
    <group ref={houseRef}>
      {/* Foundation */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 8]} />
        <meshStandardMaterial color={isNightMode ? "#4a4a4a" : "#8b7355"} />
      </mesh>
      
      {/* Main walls with proper thickness */}
      <group>
        {/* Front wall */}
        <mesh position={[0, 1.5, 3.875]} castShadow>
          <boxGeometry args={[10, 3, 0.25]} />
          <meshStandardMaterial color={isNightMode ? "#c0c0c0" : "#f5f5f5"} />
        </mesh>
        
        {/* Back wall */}
        <mesh position={[0, 1.5, -3.875]} castShadow>
          <boxGeometry args={[10, 3, 0.25]} />
          <meshStandardMaterial color={isNightMode ? "#c0c0c0" : "#f5f5f5"} />
        </mesh>
        
        {/* Left wall */}
        <mesh position={[-4.875, 1.5, 0]} castShadow>
          <boxGeometry args={[0.25, 3, 7.75]} />
          <meshStandardMaterial color={isNightMode ? "#c0c0c0" : "#f5f5f5"} />
        </mesh>
        
        {/* Right wall */}
        <mesh position={[4.875, 1.5, 0]} castShadow>
          <boxGeometry args={[0.25, 3, 7.75]} />
          <meshStandardMaterial color={isNightMode ? "#c0c0c0" : "#f5f5f5"} />
        </mesh>
      </group>
      
      {/* Hip roof */}
      <group position={[0, 3.2, 0]}>
        {/* Main roof slopes */}
        <mesh position={[0, 0.6, 2.2]} rotation={[Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[11, 0.1, 3.2]} />
          <meshStandardMaterial color={isNightMode ? "#5a3a1a" : "#8b4513"} />
        </mesh>
        <mesh position={[0, 0.6, -2.2]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[11, 0.1, 3.2]} />
          <meshStandardMaterial color={isNightMode ? "#5a3a1a" : "#8b4513"} />
        </mesh>
        
        {/* Side roof slopes */}
        <mesh position={[3.5, 0.4, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
          <boxGeometry args={[2.8, 0.1, 8.5]} />
          <meshStandardMaterial color={isNightMode ? "#5a3a1a" : "#8b4513"} />
        </mesh>
        <mesh position={[-3.5, 0.4, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
          <boxGeometry args={[2.8, 0.1, 8.5]} />
          <meshStandardMaterial color={isNightMode ? "#5a3a1a" : "#8b4513"} />
        </mesh>
        
        {/* Roof ridge */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[11.2, 0.2, 0.3]} />
          <meshStandardMaterial color={isNightMode ? "#4a2a0a" : "#654321"} />
        </mesh>
      </group>
      
      {/* Windows with frames and night glow */}
      <group>
        {/* Front windows */}
        <mesh position={[-2.5, 1.8, 4]}>
          <boxGeometry args={[1.5, 1.5, 0.15]} />
          <meshStandardMaterial color={isNightMode ? "#1a1a1a" : "#8b6914"} />
        </mesh>
        <mesh position={[-2.5, 1.8, 4.05]}>
          <boxGeometry args={[1.3, 1.3, 0.05]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffaa55" : "#87ceeb"} 
            transparent 
            opacity={0.7}
            emissive={isNightMode ? "#aa6600" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
          />
        </mesh>
        
        <mesh position={[2.5, 1.8, 4]}>
          <boxGeometry args={[1.5, 1.5, 0.15]} />
          <meshStandardMaterial color={isNightMode ? "#1a1a1a" : "#8b6914"} />
        </mesh>
        <mesh position={[2.5, 1.8, 4.05]}>
          <boxGeometry args={[1.3, 1.3, 0.05]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffaa55" : "#87ceeb"} 
            transparent 
            opacity={0.7}
            emissive={isNightMode ? "#aa6600" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
          />
        </mesh>
      </group>
      
      {/* Door with frame */}
      <mesh position={[0, 1.25, 4]}>
        <boxGeometry args={[1.2, 2.5, 0.15]} />
        <meshStandardMaterial color={isNightMode ? "#2a1a0a" : "#8b4513"} />
      </mesh>
      <mesh position={[0, 1.25, 4.05]}>
        <boxGeometry args={[1, 2.3, 0.05]} />
        <meshStandardMaterial color={isNightMode ? "#4a2a1a" : "#a0522d"} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[0.3, 1.25, 4.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      
      {/* ASTRA Villa Sign */}
      <group position={[0, -0.5, 5]}>
        {/* Sign post */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2]} />
          <meshStandardMaterial color={isNightMode ? "#2a2a2a" : "#654321"} />
        </mesh>
        
        {/* Sign board */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[3, 0.8, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#1a1a1a" : "#2c3e50"}
            emissive={isNightMode ? "#1a3a5a" : "#000000"}
            emissiveIntensity={isNightMode ? 0.2 : 0}
          />
        </mesh>
        
        {/* Sign text */}
        <Text
          position={[0, 1.8, 0.06]}
          fontSize={0.25}
          color={isNightMode ? "#ffffff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          ASTRA VILLA
        </Text>
        
        {/* Sign illumination at night */}
        {isNightMode && (
          <pointLight
            position={[0, 2.5, 0.5]}
            color="#ffffff"
            intensity={0.8}
            distance={5}
          />
        )}
      </group>
      
      {/* Dimension lines */}
      {showDimensions && (
        <group>
          {/* Width dimension */}
          <Html position={[0, -1.5, 0]}>
            <div className="text-sm font-mono bg-white/90 dark:bg-black/90 px-2 py-1 rounded border">
              10m
            </div>
          </Html>
          
          {/* Depth dimension */}
          <Html position={[6, 0, 0]} rotation={[0, Math.PI/2, 0]}>
            <div className="text-sm font-mono bg-white/90 dark:bg-black/90 px-2 py-1 rounded border">
              8m
            </div>
          </Html>
          
          {/* Height dimension */}
          <Html position={[-6, 2, 0]}>
            <div className="text-sm font-mono bg-white/90 dark:bg-black/90 px-2 py-1 rounded border">
              4.5m
            </div>
          </Html>
        </group>
      )}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={isNightMode ? "#1a4a1a" : "#4ade80"} />
      </mesh>
    </group>
  );
};

// Camera preset positions
const cameraPresets = {
  front: { position: [0, 2, 15], target: [0, 1, 0] },
  side: { position: [15, 2, 0], target: [0, 1, 0] },
  top: { position: [0, 20, 0], target: [0, 0, 0] },
  iso: { position: [10, 8, 10], target: [0, 1, 0] }
};

const Enhanced3DPropertyViewer = ({ 
  className, 
  propertyData = { width: 10, length: 8, height: 4.5, floors: 1 }
}: Enhanced3DPropertyViewerProps) => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [currentView, setCurrentView] = useState<keyof typeof cameraPresets>('iso');
  const controlsRef = useRef<any>(null);

  const handleViewChange = (view: keyof typeof cameraPresets) => {
    if (controlsRef.current) {
      const preset = cameraPresets[view];
      controlsRef.current.object.position.set(...preset.position);
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
      setCurrentView(view);
    }
  };

  const handleReset = () => {
    handleViewChange('iso');
  };

  return (
    <div className={cn("relative w-full h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-gray-900 dark:to-blue-900", className)}>
      {/* Top-left controls */}
      <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Controls</h3>
          
          {/* Day/Night toggle */}
          <Button
            onClick={() => setIsNightMode(!isNightMode)}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            {isNightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isNightMode ? 'Night' : 'Day'} Mode
          </Button>
          
          {/* Dimensions toggle */}
          <Button
            onClick={() => setShowDimensions(!showDimensions)}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            {showDimensions ? 'Hide' : 'Show'} Dimensions
          </Button>
          
          {/* Reset view */}
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Top-right view presets */}
      <div className="absolute top-6 right-6 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">View Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(cameraPresets).map((view) => (
            <Button
              key={view}
              onClick={() => handleViewChange(view as keyof typeof cameraPresets)}
              variant={currentView === view ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {view.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Property info panel */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">ASTRA Villa</h3>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex justify-between gap-4">
            <span>Dimensions:</span>
            <span className="font-mono">{propertyData.length}m × {propertyData.width}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Height:</span>
            <span className="font-mono">{propertyData.height}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Floors:</span>
            <span className="font-mono">{propertyData.floors}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Total Area:</span>
            <span className="font-mono">{propertyData.length * propertyData.width}m²</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Click & Drag:</strong> Rotate view</p>
          <p><strong>Scroll:</strong> Zoom in/out</p>
          <p><strong>Right Click:</strong> Pan camera</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 50 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
        
        <House3D isNightMode={isNightMode} showDimensions={showDimensions} />
      </Canvas>
    </div>
  );
};

export default Enhanced3DPropertyViewer;