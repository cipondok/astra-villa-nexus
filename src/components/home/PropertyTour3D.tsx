import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Jakarta-Style Skyscraper - Type 1: Tall Glass Tower (like Wisma 46)
function TallGlassTower({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.08;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base Podium */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 1, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Main Tower - Very Tall */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[1.5, 6, 1.5]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Glass Panels Grid */}
      {[...Array(20)].map((_, floor) => (
        <group key={floor}>
          {[...Array(4)].map((_, side) => (
            <mesh 
              key={side}
              position={[
                side === 0 ? 0.76 : side === 1 ? -0.76 : 0,
                0.6 + floor * 0.3,
                side === 2 ? 0.76 : side === 3 ? -0.76 : 0
              ]}
              rotation={[0, side * Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.4, 0.25]} />
              <meshStandardMaterial 
                color="#4FC3F7"
                emissive={color}
                emissiveIntensity={0.8}
                metalness={1}
                roughness={0}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Antenna/Spire */}
      <mesh position={[0, 7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0} />
      </mesh>
      
      <pointLight position={[0, 7, 0]} intensity={3} distance={10} color={color} />
    </group>
  );
}

// Jakarta-Style Skyscraper - Type 2: Modern Office Tower
function ModernOfficeTower({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.08;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Lower Tower */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1.8, 2, 1.8]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Upper Tower - Tapered */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.85}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Crown/Top */}
      <mesh position={[0, 5.3, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.5, 0.6, 6]} />
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.95}
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Windows */}
      {[...Array(15)].map((_, i) => (
        <group key={i}>
          {[0, 1, 2, 3].map((side) => (
            <mesh 
              key={side}
              position={[
                side === 0 ? 0.91 : side === 1 ? -0.91 : 0,
                1 + i * 0.3,
                side === 2 ? 0.91 : side === 3 ? -0.91 : 0
              ]}
              rotation={[0, side * Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.6, 0.25]} />
              <meshStandardMaterial 
                color="#87CEEB"
                emissive="#FFD700"
                emissiveIntensity={1 + Math.random() * 0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      <pointLight position={[0, 5.5, 0]} intensity={3} distance={8} color="#FFD700" />
    </group>
  );
}

// Jakarta-Style Skyscraper - Type 3: Triangular Modern Tower
function TriangularTower({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.08;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.6, 3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Main Triangular Tower */}
      <mesh position={[0, 2.5, 0]} castShadow rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.8, 1.1, 4, 3]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.85}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Top Section */}
      <mesh position={[0, 4.8, 0]} castShadow rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 0.8, 3]} />
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.95}
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Edge Lights */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * Math.PI * 2 / 3) * 0.9,
            2.5,
            Math.sin(i * Math.PI * 2 / 3) * 0.9
          ]}
        >
          <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={2}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}
      
      <pointLight position={[0, 5.2, 0]} intensity={4} distance={10} color="#FFD700" />
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
      {/* Camera - Jakarta Skyline View */}
      <PerspectiveCamera makeDefault position={[2, 4, 12]} fov={65} />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 5}
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
      
      {/* Jakarta Skyline - Front Row (Tallest) */}
      <group position={[-6, 0, 2]} scale={1.2}>
        <TallGlassTower position={[0, 0, 0]} color="#3B82F6" delay={0} />
      </group>
      <group position={[-2, 0, 1]} scale={1.1}>
        <ModernOfficeTower position={[0, 0, 0]} color="#10B981" delay={0.3} />
      </group>
      <TriangularTower position={[0, 0, 0]} color="#FFD700" delay={0.6} />
      <group position={[2, 0, 1]} scale={1.15}>
        <TallGlassTower position={[0, 0, 0]} color="#F59E0B" delay={0.9} />
      </group>
      <group position={[6, 0, 2]} scale={1.1}>
        <ModernOfficeTower position={[0, 0, 0]} color="#06B6D4" delay={1.2} />
      </group>
      
      {/* Jakarta Skyline - Second Row (Medium Height) */}
      <group position={[-9, 0, -2]} scale={0.9}>
        <TriangularTower position={[0, 0, 0]} color="#8B5CF6" delay={1.5} />
      </group>
      <group position={[-5, 0, -3]} scale={0.85}>
        <TallGlassTower position={[0, 0, 0]} color="#EC4899" delay={1.8} />
      </group>
      <group position={[-1, 0, -2.5]} scale={0.8}>
        <ModernOfficeTower position={[0, 0, 0]} color="#3B82F6" delay={2.1} />
      </group>
      <group position={[3, 0, -2.5]} scale={0.9}>
        <TallGlassTower position={[0, 0, 0]} color="#10B981" delay={2.4} />
      </group>
      <group position={[7, 0, -3]} scale={0.85}>
        <TriangularTower position={[0, 0, 0]} color="#F97316" delay={2.7} />
      </group>
      <group position={[10, 0, -2]} scale={0.8}>
        <ModernOfficeTower position={[0, 0, 0]} color="#06B6D4" delay={3} />
      </group>
      
      {/* Jakarta Skyline - Background Row (Smaller) */}
      <group position={[-11, 0, -7]} scale={0.6}>
        <TallGlassTower position={[0, 0, 0]} color="#8B5CF6" delay={3.3} />
      </group>
      <group position={[-7, 0, -8]} scale={0.55}>
        <ModernOfficeTower position={[0, 0, 0]} color="#F59E0B" delay={3.6} />
      </group>
      <group position={[-3, 0, -7.5]} scale={0.5}>
        <TriangularTower position={[0, 0, 0]} color="#3B82F6" delay={3.9} />
      </group>
      <group position={[0, 0, -9]} scale={0.6}>
        <TallGlassTower position={[0, 0, 0]} color="#EC4899" delay={4.2} />
      </group>
      <group position={[4, 0, -7.5]} scale={0.55}>
        <ModernOfficeTower position={[0, 0, 0]} color="#10B981" delay={4.5} />
      </group>
      <group position={[8, 0, -8]} scale={0.5}>
        <TriangularTower position={[0, 0, 0]} color="#F97316" delay={4.8} />
      </group>
      <group position={[12, 0, -7]} scale={0.6}>
        <TallGlassTower position={[0, 0, 0]} color="#06B6D4" delay={5.1} />
      </group>
      
      {/* Floating Property Icons Above Jakarta Skyline */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.2}>
        <PropertyIcon position={[-4, 5, 3]} delay={0} />
      </Float>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1.2}>
        <PropertyIcon position={[4, 5, 3]} delay={1} />
      </Float>
      <Float speed={2.8} rotationIntensity={0.5} floatIntensity={1.2}>
        <PropertyIcon position={[0, 6, 1]} delay={0.5} />
      </Float>
      <Float speed={2.6} rotationIntensity={0.5} floatIntensity={1.2}>
        <PropertyIcon position={[-6, 4.5, 0]} delay={0.8} />
      </Float>
      <Float speed={3.2} rotationIntensity={0.5} floatIntensity={1.2}>
        <PropertyIcon position={[6, 4.5, 0]} delay={1.3} />
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
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 15, 60]} />
        <Scene />
      </Canvas>
    </div>
  );
}
