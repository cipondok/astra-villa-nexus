import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text3D, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated Building Component - Improved Design
function Building({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.15;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base/Foundation */}
      <mesh position={[0, -1.6, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 2]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Main Building - Multi-level */}
      <mesh ref={meshRef} castShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[1.8, 2.5, 1.8]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.7}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Top Floor - Smaller */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Roof - Gold */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[1.1, 0.6, 4]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Windows - Grid Pattern */}
      {[...Array(4)].map((_, floor) => (
        <group key={floor}>
          {[...Array(2)].map((_, col) => (
            <group key={col}>
              <mesh position={[col === 0 ? -0.6 : 0.6, -1 + floor * 0.6, 0.91]} castShadow>
                <boxGeometry args={[0.35, 0.4, 0.03]} />
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={2}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Window frame */}
              <mesh position={[col === 0 ? -0.6 : 0.6, -1 + floor * 0.6, 0.92]} castShadow>
                <boxGeometry args={[0.4, 0.45, 0.02]} />
                <meshStandardMaterial 
                  color="#333333" 
                  metalness={0.5}
                  roughness={0.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      
      {/* Door */}
      <mesh position={[0, -1.1, 0.91]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.03]} />
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Balconies */}
      <mesh position={[0, 0.8, 1]} castShadow>
        <boxGeometry args={[1.8, 0.05, 0.3]} />
        <meshStandardMaterial 
          color="#cccccc" 
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Floating Property Icon - Improved with Home Icon
function PropertyIcon({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + delay) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* House Base */}
      <mesh>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.6, 0.5, 4]} />
        <meshStandardMaterial 
          color="#FFA500" 
          metalness={0.9}
          roughness={0.1}
          emissive="#FFA500"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Glow sphere at top */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.8, 0]} intensity={3} distance={5} color="#FFD700" />
    </group>
  );
}

// Ground Plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#151515"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  );
}

// Particles/Stars
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useEffect(() => {
    if (particlesRef.current) {
      const positions = new Float32Array(200 * 3);
      for (let i = 0; i < 200; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 20 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
      particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={0.08} 
        color="#FFD700" 
        transparent 
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// Main 3D Scene
function Scene() {
  return (
    <>
      {/* Camera - Closer and better angle */}
      <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={60} />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
      
      {/* Lighting - Brighter */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={2.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={1.5} color="#FFD700" />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#FFD700" />
      <spotLight position={[0, 15, 0]} intensity={2} angle={0.6} penumbra={0.5} color="#FFD700" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Buildings - Property Tour - More Detailed */}
      <Building position={[-4.5, 0, 0]} color="#3B82F6" delay={0} />
      <Building position={[0, 0, -2]} color="#10B981" delay={0.5} />
      <Building position={[4.5, 0, 0]} color="#F59E0B" delay={1} />
      
      {/* Additional smaller buildings for depth */}
      <group position={[-7, 0, -4]} scale={0.6}>
        <Building position={[0, 0, 0]} color="#8B5CF6" delay={1.5} />
      </group>
      <group position={[7, 0, -4]} scale={0.6}>
        <Building position={[0, 0, 0]} color="#EC4899" delay={2} />
      </group>
      
      {/* Floating Icons - Improved Home Icons */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
        <PropertyIcon position={[-3, 4, 1]} delay={0} />
      </Float>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <PropertyIcon position={[3, 4, 1]} delay={1} />
      </Float>
      <Float speed={2.8} rotationIntensity={0.5} floatIntensity={1}>
        <PropertyIcon position={[0, 5, -1]} delay={0.5} />
      </Float>
      
      {/* Particles */}
      <Particles />
      
      {/* Ground with Reflection */}
      <Ground />
      
      {/* Additional Lighting for Glow */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 5, -3]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <pointLight intensity={2} distance={10} color="#FFD700" />
        </group>
      </Float>
    </>
  );
}

// Main Component Export
export default function PropertyTour3D() {
  return (
    <div className="w-full h-full">
      <Canvas 
        shadows 
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 50]} />
        <Scene />
      </Canvas>
    </div>
  );
}
