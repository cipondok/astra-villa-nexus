import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface HouseModelProps {
  scale?: number;
  position?: [number, number, number];
}

const AnimatedHouse = ({ scale = 1, position = [0, 0, 0] }: HouseModelProps) => {
  const houseRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (houseRef.current) {
      // Gentle floating motion
      houseRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      houseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Hover effect
      if (hovered) {
        houseRef.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 8) * 0.05));
      } else {
        houseRef.current.scale.setScalar(scale);
      }
    }
    
    if (roofRef.current) {
      roofRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  return (
    <group 
      ref={houseRef} 
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* House Base */}
      <Box args={[2, 1.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#4F46E5" 
          roughness={0.3}
          metalness={0.1}
        />
      </Box>
      
      {/* Roof */}
      <Box ref={roofRef} args={[2.4, 0.3, 2.4]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color="#DC2626" 
          roughness={0.4}
          metalness={0.2}
        />
      </Box>
      
      {/* Roof Peak */}
      <Box args={[2.6, 0.8, 0.2]} position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#B91C1C" />
      </Box>
      <Box args={[2.6, 0.8, 0.2]} position={[0, 1.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="#B91C1C" />
      </Box>
      
      {/* Windows */}
      <Box args={[0.4, 0.4, 0.05]} position={[-0.6, 0.3, 1.02]}>
        <meshStandardMaterial color="#FEF3C7" emissive="#FEF3C7" emissiveIntensity={0.2} />
      </Box>
      <Box args={[0.4, 0.4, 0.05]} position={[0.6, 0.3, 1.02]}>
        <meshStandardMaterial color="#FEF3C7" emissive="#FEF3C7" emissiveIntensity={0.2} />
      </Box>
      
      {/* Door */}
      <Box args={[0.3, 0.8, 0.05]} position={[0, -0.35, 1.02]}>
        <meshStandardMaterial color="#92400E" />
      </Box>
      
      {/* Door Handle */}
      <Sphere args={[0.03]} position={[0.1, -0.35, 1.05]}>
        <meshStandardMaterial color="#FCD34D" metalness={0.8} roughness={0.2} />
      </Sphere>
      
      {/* Chimney */}
      <Box args={[0.3, 0.8, 0.3]} position={[0.8, 1.8, 0.5]}>
        <meshStandardMaterial color="#7C2D12" />
      </Box>
      
      {/* Garden Elements */}
      <Sphere args={[0.15]} position={[-1.5, -0.7, 1.2]}>
        <meshStandardMaterial color="#16A34A" />
      </Sphere>
      <Sphere args={[0.12]} position={[1.3, -0.7, 1.1]}>
        <meshStandardMaterial color="#DC2626" />
      </Sphere>
      <Sphere args={[0.1]} position={[-1.2, -0.7, -1.3]}>
        <meshStandardMaterial color="#7C3AED" />
      </Sphere>
    </group>
  );
};

const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = React.useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8B5CF6"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  
  useFrame((state) => {
    // Dynamic camera movement
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 8;
    camera.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.3) * 2;
    camera.position.z = 8 + Math.cos(state.clock.elapsedTime * 0.2) * 3;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

const Scene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Ground */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#16A34A" roughness={0.8} />
      </Plane>
      
      {/* Multiple Houses */}
      <AnimatedHouse position={[0, 0, 0]} scale={1.2} />
      <AnimatedHouse position={[-6, 0, -2]} scale={0.8} />
      <AnimatedHouse position={[6, 0, -3]} scale={0.9} />
      <AnimatedHouse position={[-3, 0, 4]} scale={0.7} />
      <AnimatedHouse position={[4, 0, 3]} scale={0.85} />
      
      {/* Floating Text */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.8}
        color="#1F2937"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Premium Properties
      </Text>
      
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="#6B7280"
        anchorX="center"
        anchorY="middle"
      >
        Your Dream Home Awaits
      </Text>
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Camera Controller */}
      <CameraController />
    </>
  );
};

interface AdvancedProperty3DProps {
  className?: string;
  height?: string;
}

const AdvancedProperty3D = ({ className, height = "100vh" }: AdvancedProperty3DProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden",
        className
      )}
      style={{ height }}
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading 3D Experience...</p>
          </div>
        </div>
      )}
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [8, 3, 8], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #E0F2FE, #FBBF24)' }}
        onCreated={() => setIsLoaded(true)}
      >
        <Scene />
      </Canvas>
      
      {/* Overlay UI Elements */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top Overlay */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Discover Properties
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full px-6 py-2 inline-block">
            Immersive 3D Property Experience
          </p>
        </div>
        
        {/* Bottom Action Area */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
              🏠 Explore premium properties in stunning 3D
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
                Start Exploring
              </button>
              <button className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg border border-gray-200 dark:border-gray-700">
                View Gallery
              </button>
            </div>
          </div>
        </div>
        
        {/* Corner Elements */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <span className="text-2xl">🏡</span>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">3D Interactive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedProperty3D;