import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, FirstPersonControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Sun, Moon, RotateCcw, Eye, Maximize2, Navigation } from 'lucide-react';
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

// Realistic Modern Villa 3D Component
const RealisticModernVilla = ({ isNightMode, showDimensions }: { isNightMode: boolean; showDimensions: boolean }) => {
  const villaRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  // Enhanced lighting setup
  useEffect(() => {
    // Clear existing lights
    scene.children.filter(child => child.type.includes('Light')).forEach(light => {
      scene.remove(light);
    });

    if (isNightMode) {
      // Night atmosphere
      const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.2);
      scene.add(ambientLight);
      
      // Moonlight with realistic shadows
      const moonLight = new THREE.DirectionalLight(0x8bb5ff, 0.5);
      moonLight.position.set(-20, 15, 10);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = 4096;
      moonLight.shadow.mapSize.height = 4096;
      moonLight.shadow.camera.near = 0.1;
      moonLight.shadow.camera.far = 100;
      moonLight.shadow.camera.left = -30;
      moonLight.shadow.camera.right = 30;
      moonLight.shadow.camera.top = 30;
      moonLight.shadow.camera.bottom = -30;
      scene.add(moonLight);
      
      // Interior warm lighting
      const interiorLights = [
        { pos: [-4, 2.5, 0], color: 0xffa366, intensity: 1.2 },
        { pos: [2, 2.5, 0], color: 0xffa366, intensity: 1.0 },
        { pos: [-2, 5.5, -2], color: 0xffa366, intensity: 0.8 },
        { pos: [4, 2.5, 2], color: 0xffa366, intensity: 0.6 }
      ];
      
      interiorLights.forEach(light => {
        const pointLight = new THREE.PointLight(light.color, light.intensity, 20);
        pointLight.position.set(light.pos[0], light.pos[1], light.pos[2]);
        scene.add(pointLight);
      });
    } else {
      // Daylight setup
      const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.6);
      scene.add(ambientLight);
      
      // Realistic sunlight
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
      sunLight.position.set(25, 20, 15);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.camera.near = 0.1;
      sunLight.shadow.camera.far = 100;
      sunLight.shadow.camera.left = -30;
      sunLight.shadow.camera.right = 30;
      sunLight.shadow.camera.top = 30;
      sunLight.shadow.camera.bottom = -30;
      scene.add(sunLight);
      
      // Sky fill light
      const skyLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
      skyLight.position.set(-10, 10, -10);
      scene.add(skyLight);
    }
  }, [isNightMode, scene]);

  return (
    <group ref={villaRef}>
      {/* Landscaped Foundation */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[25, 0.6, 20]} />
        <meshStandardMaterial 
          color={isNightMode ? "#2a2a2a" : "#c8c8c8"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Main Villa Structure - Ground Floor */}
      <group>
        {/* Central living area */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 4, 10]} />
          <meshStandardMaterial 
            color={isNightMode ? "#f5f5f5" : "#ffffff"} 
            roughness={0.1}
            metalness={0.05}
          />
        </mesh>
        
        {/* Stone accent wall */}
        <mesh position={[7.1, 2, 0]} castShadow>
          <boxGeometry args={[0.2, 4, 10]} />
          <meshStandardMaterial 
            color={isNightMode ? "#4a4a4a" : "#6b6b6b"} 
            roughness={1.0}
            metalness={0.0}
            normalScale={new THREE.Vector2(0.5, 0.5)}
          />
        </mesh>
        
        {/* Modern entrance extension */}
        <mesh position={[0, 1.8, 5.2]} castShadow>
          <boxGeometry args={[4, 3.6, 0.4]} />
          <meshStandardMaterial 
            color={isNightMode ? "#e8e8e8" : "#f8f8f8"} 
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </group>
      
      {/* Second Floor - Contemporary Design */}
      <group position={[-2, 6, -1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10, 3.5, 8]} />
          <meshStandardMaterial 
            color={isNightMode ? "#f0f0f0" : "#ffffff"} 
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>
        
        {/* Modern balcony */}
        <mesh position={[0, -1.5, 4.2]} castShadow>
          <boxGeometry args={[8, 0.3, 1.5]} />
          <meshStandardMaterial 
            color={isNightMode ? "#e0e0e0" : "#f5f5f5"} 
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Glass balcony railing */}
        <mesh position={[0, -0.75, 4.8]}>
          <boxGeometry args={[8, 1.5, 0.1]} />
          <meshStandardMaterial 
            color={0x87ceeb}
            transparent 
            opacity={0.3}
            roughness={0.0}
            metalness={0.1}
          />
        </mesh>
      </group>
      
      {/* Architectural Features */}
      <group>
        {/* Modern columns */}
        {[-3, 3].map((x, i) => (
          <mesh key={i} position={[x, 2, 5.5]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4]} />
            <meshStandardMaterial 
              color={isNightMode ? "#e8e8e8" : "#ffffff"} 
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
        ))}
        
        {/* Roof overhang */}
        <mesh position={[0, 4.3, 5]} castShadow>
          <boxGeometry args={[8, 0.2, 2]} />
          <meshStandardMaterial 
            color={isNightMode ? "#3a3a3a" : "#666666"} 
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      </group>
      
      {/* Contemporary Windows */}
      <group>
        {/* Floor-to-ceiling living room windows */}
        <mesh position={[0, 2.5, 5.15]}>
          <boxGeometry args={[12, 3.5, 0.05]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffb366" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.9 : 0.4}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
            roughness={0.0}
            metalness={0.1}
          />
        </mesh>
        
        {/* Second floor windows */}
        <mesh position={[-2, 6.5, 3.05]}>
          <boxGeometry args={[8, 2.5, 0.05]} />
          <meshStandardMaterial 
            color={isNightMode ? "#ffb366" : "#87ceeb"} 
            transparent 
            opacity={isNightMode ? 0.8 : 0.4}
            emissive={isNightMode ? "#ff8c00" : "#000000"}
            emissiveIntensity={isNightMode ? 0.2 : 0}
          />
        </mesh>
        
        {/* Side windows */}
        {[-7, 7].map((x, i) => (
          <mesh key={i} position={[x, 2.5, 0]}>
            <boxGeometry args={[0.05, 2, 6]} />
            <meshStandardMaterial 
              color={isNightMode ? "#ffb366" : "#87ceeb"} 
              transparent 
              opacity={isNightMode ? 0.7 : 0.4}
              emissive={isNightMode ? "#ff8c00" : "#000000"}
              emissiveIntensity={isNightMode ? 0.2 : 0}
            />
          </mesh>
        ))}
      </group>
      
      {/* Modern Entrance */}
      <group position={[0, 0, 5.3]}>
        {/* Main door */}
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[2.5, 4, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#2a2a2a" : "#1a1a1a"} 
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[1, 2, 0.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial 
            color="#c0c0c0" 
            metalness={0.95} 
            roughness={0.05} 
          />
        </mesh>
        
        {/* Steps */}
        {[0, -0.2, -0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0.3 + i * 0.2]} receiveShadow>
            <boxGeometry args={[4, 0.2, 0.4]} />
            <meshStandardMaterial 
              color={isNightMode ? "#d0d0d0" : "#e8e8e8"} 
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Modern Roof System */}
      <group>
        {/* Main flat roof */}
        <mesh position={[0, 4.4, 0]} castShadow>
          <boxGeometry args={[14.5, 0.3, 10.5]} />
          <meshStandardMaterial 
            color={isNightMode ? "#2a2a2a" : "#4a4a4a"} 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* Second floor roof */}
        <mesh position={[-2, 7.9, -1]} castShadow>
          <boxGeometry args={[10.5, 0.3, 8.5]} />
          <meshStandardMaterial 
            color={isNightMode ? "#2a2a2a" : "#4a4a4a"} 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* Roof edge details */}
        <mesh position={[0, 4.6, 0]}>
          <boxGeometry args={[15, 0.1, 11]} />
          <meshStandardMaterial 
            color={isNightMode ? "#1a1a1a" : "#333333"} 
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      </group>
      
      {/* Landscaping */}
      <group>
        {/* Lawn areas */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial 
            color={isNightMode ? "#1a4a1a" : "#4ade80"} 
            roughness={0.9}
          />
        </mesh>
        
        {/* Decorative trees */}
        {[
          [-12, 0, 8], [15, 0, -6], [-10, 0, -12], [12, 0, 10]
        ].map((pos, i) => (
          <group key={i} position={[pos[0], pos[1], pos[2]]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 3]} />
              <meshStandardMaterial 
                color={isNightMode ? "#3a2817" : "#654321"} 
                roughness={0.9}
              />
            </mesh>
            {/* Tree canopy */}
            <mesh position={[0, 4, 0]}>
              <sphereGeometry args={[2, 8, 8]} />
              <meshStandardMaterial 
                color={isNightMode ? "#1a3a1a" : "#228b22"} 
                roughness={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* ASTRA Villa Signage */}
      <group position={[0, 0, 8]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2]} />
          <meshStandardMaterial 
            color={isNightMode ? "#2a2a2a" : "#654321"} 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
        
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[4, 1, 0.1]} />
          <meshStandardMaterial 
            color={isNightMode ? "#1a1a1a" : "#2c3e50"}
            emissive={isNightMode ? "#1a3a5a" : "#000000"}
            emissiveIntensity={isNightMode ? 0.3 : 0}
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
        
        <Text
          position={[0, 1.8, 0.06]}
          fontSize={0.3}
          color={isNightMode ? "#ffffff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          ASTRA VILLA
        </Text>
        
        {isNightMode && (
          <pointLight
            position={[0, 2.8, 0.5]}
            color="#ffffff"
            intensity={1.2}
            distance={8}
          />
        )}
      </group>
      
      {/* Enhanced 3D Dimensions */}
      {showDimensions && (
        <group>
          {/* Length dimension with line */}
          <group position={[0, -1, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[14, 0.02, 0.02]} />
              <meshStandardMaterial color="#ff0000" />
            </mesh>
            <Html position={[0, -0.5, 0]}>
              <div className="bg-white/95 dark:bg-black/95 px-3 py-2 rounded-lg border shadow-lg text-center">
                <div className="font-bold text-red-600">14.0m</div>
                <div className="text-xs text-muted-foreground">Length</div>
              </div>
            </Html>
          </group>
          
          {/* Width dimension with line */}
          <group position={[8, -1, 0]} rotation={[0, Math.PI/2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[10, 0.02, 0.02]} />
              <meshStandardMaterial color="#00ff00" />
            </mesh>
            <Html position={[0, -0.5, 0]} rotation={[0, -Math.PI/2, 0]}>
              <div className="bg-white/95 dark:bg-black/95 px-3 py-2 rounded-lg border shadow-lg text-center">
                <div className="font-bold text-green-600">10.0m</div>
                <div className="text-xs text-muted-foreground">Width</div>
              </div>
            </Html>
          </group>
          
          {/* Height dimension with line */}
          <group position={[-8, 4, 0]} rotation={[0, 0, Math.PI/2]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[8, 0.02, 0.02]} />
              <meshStandardMaterial color="#0000ff" />
            </mesh>
            <Html position={[0, -0.5, 0]} rotation={[0, 0, -Math.PI/2]}>
              <div className="bg-white/95 dark:bg-black/95 px-3 py-2 rounded-lg border shadow-lg text-center">
                <div className="font-bold text-blue-600">8.0m</div>
                <div className="text-xs text-muted-foreground">Height</div>
              </div>
            </Html>
          </group>
        </group>
      )}
    </group>
  );
};

// Enhanced camera presets with walking views
const cameraPresets = {
  front: { position: [0, 2, 15], target: [0, 1, 0] },
  side: { position: [15, 2, 0], target: [0, 1, 0] },
  top: { position: [0, 20, 0], target: [0, 0, 0] },
  iso: { position: [10, 8, 10], target: [0, 1, 0] },
  walk: { position: [0, 1.7, 12], target: [0, 1.7, 0] },
  entrance: { position: [0, 1.5, 8], target: [0, 2, 5] }
};

const Enhanced3DPropertyViewer = ({ 
  className, 
  propertyData = { width: 14, length: 10, height: 8, floors: 2 }
}: Enhanced3DPropertyViewerProps) => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [isWalkingMode, setIsWalkingMode] = useState(false);
  const [currentView, setCurrentView] = useState<keyof typeof cameraPresets>('iso');
  const controlsRef = useRef<any>(null);

  const handleViewChange = (view: keyof typeof cameraPresets) => {
    if (controlsRef.current) {
      const preset = cameraPresets[view];
      controlsRef.current.object.position.set(preset.position[0], preset.position[1], preset.position[2]);
      controlsRef.current.target.set(preset.target[0], preset.target[1], preset.target[2]);
      controlsRef.current.update();
      setCurrentView(view);
    }
  };

  const handleReset = () => {
    handleViewChange('iso');
    setIsWalkingMode(false);
  };

  const toggleWalkingMode = () => {
    const newWalkingMode = !isWalkingMode;
    setIsWalkingMode(newWalkingMode);
    if (newWalkingMode) {
      handleViewChange('walk');
    } else {
      handleViewChange('iso');
    }
  };

  return (
    <div className={cn("relative w-full h-[70vh] bg-gradient-to-br from-slate-50 to-blue-100 dark:from-gray-900 dark:to-blue-900", className)}>
      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20">
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">Controls</h3>
          
          {/* Day/Night toggle */}
          <Button
            onClick={() => setIsNightMode(!isNightMode)}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
          >
            {isNightMode ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            {isNightMode ? 'Night' : 'Day'}
          </Button>
          
          {/* Walking mode toggle */}
          <Button
            onClick={toggleWalkingMode}
            variant={isWalkingMode ? "default" : "outline"}
            size="sm"
            className="w-full justify-start gap-2 text-xs"
          >
            <Navigation className="h-3 w-3" />
            Walk Mode
          </Button>
          
          {/* Dimensions toggle */}
          <Button
            onClick={() => setShowDimensions(!showDimensions)}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
          >
            <Maximize2 className="h-3 w-3" />
            {showDimensions ? 'Hide' : 'Show'} Dims
          </Button>
          
          {/* Reset view */}
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Top-right view presets */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20">
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">Views</h3>
        <div className="grid grid-cols-2 gap-1">
          {Object.keys(cameraPresets).map((view) => (
            <Button
              key={view}
              onClick={() => handleViewChange(view as keyof typeof cameraPresets)}
              variant={currentView === view ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-1"
            >
              {view.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Property info panel */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20">
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">ASTRA Villa</h3>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex justify-between gap-3">
            <span>Size:</span>
            <span className="font-mono">{propertyData.length}×{propertyData.width}m</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Height:</span>
            <span className="font-mono">{propertyData.height}m</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Floors:</span>
            <span className="font-mono">{propertyData.floors}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Area:</span>
            <span className="font-mono">{propertyData.length * propertyData.width}m²</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20">
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Drag:</strong> Rotate</p>
          <p><strong>Scroll:</strong> Zoom</p>
          <p><strong>Right:</strong> Pan</p>
          {isWalkingMode && <p><strong>WASD:</strong> Walk</p>}
        </div>
      </div>

      {/* 3D Canvas - Responsive height */}
      <Canvas
        shadows
        camera={{ 
          position: [10, 8, 10], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        className="cursor-grab active:cursor-grabbing w-full h-full"
      >
        <OrbitControls
          ref={controlsRef}
          enablePan={!isWalkingMode}
          enableZoom={true}
          enableRotate={!isWalkingMode}
          minDistance={3}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
        
        <RealisticModernVilla isNightMode={isNightMode} showDimensions={showDimensions} />
      </Canvas>
    </div>
  );
};

export default Enhanced3DPropertyViewer;