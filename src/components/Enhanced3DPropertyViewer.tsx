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

// Modern Villa model component
const ModernVilla3D = ({ isNightMode, showDimensions }: { isNightMode: boolean; showDimensions: boolean }) => {
  const villaRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  // Lighting setup
  useEffect(() => {
    // Remove existing lights
    scene.children.filter(child => child.type.includes('Light')).forEach(light => {
      scene.remove(light);
    });

    if (isNightMode) {
      // Night lighting
      const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
      scene.add(ambientLight);
      
      // Moonlight
      const moonLight = new THREE.DirectionalLight(0x6a7aa0, 0.4);
      moonLight.position.set(-15, 12, 8);
      moonLight.castShadow = true;
      scene.add(moonLight);
      
      // Warm interior lighting
      const interiorLight1 = new THREE.PointLight(0xffa500, 0.8, 15);
      interiorLight1.position.set(-2, 2, -1);
      scene.add(interiorLight1);
      
      const interiorLight2 = new THREE.PointLight(0xffa500, 0.6, 12);
      interiorLight2.position.set(3, 4, 1);
      scene.add(interiorLight2);
    } else {
      // Day lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);
      
      // Sunlight
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(15, 15, 8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);
    }
  }, [isNightMode, scene]);

  return (
    <group ref={villaRef}>
      {/* Foundation/Base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[16, 0.3, 12]} />
        <meshStandardMaterial color={isNightMode ? "#2a2a2a" : "#d3d3d3"} />
      </mesh>
      
      {/* Ground floor - Stone section (right side) */}
      <mesh position={[5, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 8]} />
        <meshStandardMaterial 
          color={isNightMode ? "#3a3a3a" : "#8b8680"} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ground floor - White modern section (left side) */}
      <mesh position={[-3, 1.5, 0]} castShadow>
        <boxGeometry args={[8, 3, 8]} />
        <meshStandardMaterial 
          color={isNightMode ? "#e8e8e8" : "#ffffff"} 
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>
      
      {/* Second floor - White section */}
      <mesh position={[-1, 4.5, -1]} castShadow>
        <boxGeometry args={[8, 3, 6]} />
        <meshStandardMaterial 
          color={isNightMode ? "#e8e8e8" : "#ffffff"} 
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>
      
      {/* Wood cladding section */}
      <group position={[1, 1.5, 3.9]}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[i * 0.4 - 2.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 3, 0.2]} />
            <meshStandardMaterial 
              color={isNightMode ? "#4a3728" : "#8b7355"} 
              roughness={0.8}
              metalness={0.0}
            />
          </mesh>
        ))}
      </group>
      
      {/* Modern flat roof */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[16.5, 0.3, 12.5]} />
        <meshStandardMaterial 
          color={isNightMode ? "#2a2a2a" : "#666666"} 
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Carport roof */}
      <mesh position={[-5, 3.5, 3]} castShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial 
          color={isNightMode ? "#2a2a2a" : "#666666"} 
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Carport support columns */}
      <mesh position={[-7, 1.75, 4.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.5]} />
        <meshStandardMaterial color={isNightMode ? "#e8e8e8" : "#ffffff"} />
      </mesh>
      <mesh position={[-3, 1.75, 4.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.5]} />
        <meshStandardMaterial color={isNightMode ? "#e8e8e8" : "#ffffff"} />
      </mesh>
      
      {/* Large floor-to-ceiling windows */}
      <group>
        {/* Main living area window */}
        <mesh position={[-3, 2, 4.05]}>
          <boxGeometry args={[6, 2.8, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffa500" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.8 : 0.3}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.4 : 0}
          />
        </mesh>
        
        {/* Second floor windows */}
        <mesh position={[-1, 5, 1.05]}>
          <boxGeometry args={[4, 2, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffa500" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.8 : 0.3}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
          />
        </mesh>
        
        {/* Side stone section windows */}
        <mesh position={[7.5, 2, 1]}>
          <boxGeometry args={[1, 1.5, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffa500" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.7 : 0.3}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[7.5, 2, -1]}>
          <boxGeometry args={[1, 1.5, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffa500" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.7 : 0.3}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
          />
        </mesh>
      </group>
      
      {/* Modern entrance door */}
      <mesh position={[1, 1.4, 4.05]}>
        <boxGeometry args={[1.5, 2.8, 0.1]} />
        <meshStandardMaterial 
          color={isNightMode ? "#1a1a1a" : "#2c2c2c"} 
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[1.5, 1.4, 4.15]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
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
        
        <ModernVilla3D isNightMode={isNightMode} showDimensions={showDimensions} />
      </Canvas>
    </div>
  );
};

export default Enhanced3DPropertyViewer;