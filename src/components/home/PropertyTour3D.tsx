import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text3D, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated Building Component
function Building({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Building */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[1.2, 0.8, 4]} />
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      
      {/* Windows */}
      {[...Array(3)].map((_, i) => (
        <group key={i}>
          <mesh position={[-0.5, -0.5 + i, 0.76]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.02]} />
            <meshStandardMaterial 
              color="#4FC3F7" 
              emissive="#4FC3F7"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0.5, -0.5 + i, 0.76]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.02]} />
            <meshStandardMaterial 
              color="#4FC3F7" 
              emissive="#4FC3F7"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Floating Property Icon
function PropertyIcon({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + delay) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.5, 0.15, 16, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        metalness={0.8}
        roughness={0.2}
        emissive="#FFD700"
        emissiveIntensity={0.4}
      />
    </mesh>
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
        size={0.05} 
        color="#FFD700" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main 3D Scene
function Scene() {
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#FFD700" />
      <pointLight position={[10, 5, 10]} intensity={0.5} color="#4FC3F7" />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Buildings - Property Tour */}
      <Building position={[-4, 0, 0]} color="#2196F3" delay={0} />
      <Building position={[0, 0, -2]} color="#4CAF50" delay={0.5} />
      <Building position={[4, 0, 0]} color="#FF9800" delay={1} />
      
      {/* Floating Icons */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <PropertyIcon position={[-2, 4, 2]} delay={0} />
      </Float>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <PropertyIcon position={[2, 4, 2]} delay={1} />
      </Float>
      
      {/* Particles */}
      <Particles />
      
      {/* Ground with Reflection */}
      <Ground />
      
      {/* 3D Text */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 5, -3]}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={1}
            />
          </mesh>
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
