import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Advanced Indonesian Building Component
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
      {/* Modern Indonesian Tower Base - Wider */}
      <mesh position={[0, -1.5, 0]} castShadow>
        <boxGeometry args={[2.5, 0.4, 2.5]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Podium Level - Shopping/Retail */}
      <mesh position={[0, -1, 0]} castShadow>
        <boxGeometry args={[2.3, 0.8, 2.3]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Main Tower - Sleek Modern Indonesian Style */}
      <mesh ref={meshRef} castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 3.5, 2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </mesh>
      
      {/* Upper Levels - Tapering Design */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 1.8]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.85}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.9}
        />
      </mesh>
      
      {/* Penthouse Level */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.95}
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Modern Indonesian Roof Feature - Stylized Traditional Shape */}
      <mesh position={[0, 3.7, 0]} castShadow>
        <coneGeometry args={[1.3, 0.5, 4]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.95}
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Decorative Spire - Traditional Indonesian Touch */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={1}
          roughness={0}
          emissive="#FFD700"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Glass Facade - Floor by Floor Windows */}
      {[...Array(6)].map((_, floor) => (
        <group key={floor}>
          {/* Front Face Windows */}
          {[...Array(3)].map((_, col) => (
            <mesh 
              key={`front-${col}`}
              position={[-0.7 + col * 0.7, -1.3 + floor * 0.65, 1.01]} 
              castShadow
            >
              <boxGeometry args={[0.5, 0.5, 0.02]} />
              <meshStandardMaterial 
                color="#4FC3F7" 
                emissive="#FFD700"
                emissiveIntensity={1.5 + Math.random() * 0.5}
                metalness={0.95}
                roughness={0.05}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
          
          {/* Side Windows */}
          {[-1, 1].map((side) => (
            <group key={side}>
              {[...Array(3)].map((_, col) => (
                <mesh 
                  key={`side-${col}`}
                  position={[side * 1.01, -1.3 + floor * 0.65, -0.7 + col * 0.7]} 
                  rotation={[0, side * Math.PI / 2, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.5, 0.5, 0.02]} />
                  <meshStandardMaterial 
                    color="#4FC3F7" 
                    emissive="#FFD700"
                    emissiveIntensity={1.5 + Math.random() * 0.5}
                    metalness={0.95}
                    roughness={0.05}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      
      {/* Balcony Accents - Indonesian Modern Style */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`balcony-${i}`} position={[0, -0.5 + i * 1.2, 1.15]} castShadow>
          <boxGeometry args={[2.1, 0.08, 0.25]} />
          <meshStandardMaterial 
            color="#cccccc" 
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Entrance Canopy */}
      <mesh position={[0, -1.1, 1.3]} castShadow>
        <boxGeometry args={[1.5, 0.05, 0.4]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Building Name Sign */}
      <mesh position={[0, 3.5, 1.52]}>
        <boxGeometry args={[1.2, 0.3, 0.05]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive="#FFD700"
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Rooftop Lighting */}
      <pointLight position={[0, 4.2, 0]} intensity={4} distance={8} color="#FFD700" />
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
        <Building position={[0, 0, 0]} color="#3B82F6" delay={0} />
      </group>
      <group position={[-2, 0, 1]} scale={1.1}>
        <Building position={[0, 0, 0]} color="#10B981" delay={0.3} />
      </group>
      <Building position={[0, 0, 0]} color="#FFD700" delay={0.6} />
      <group position={[2, 0, 1]} scale={1.15}>
        <Building position={[0, 0, 0]} color="#F59E0B" delay={0.9} />
      </group>
      <group position={[6, 0, 2]} scale={1.1}>
        <Building position={[0, 0, 0]} color="#06B6D4" delay={1.2} />
      </group>
      
      {/* Jakarta Skyline - Second Row (Medium Height) */}
      <group position={[-9, 0, -2]} scale={0.9}>
        <Building position={[0, 0, 0]} color="#8B5CF6" delay={1.5} />
      </group>
      <group position={[-5, 0, -3]} scale={0.85}>
        <Building position={[0, 0, 0]} color="#EC4899" delay={1.8} />
      </group>
      <group position={[-1, 0, -2.5]} scale={0.8}>
        <Building position={[0, 0, 0]} color="#3B82F6" delay={2.1} />
      </group>
      <group position={[3, 0, -2.5]} scale={0.9}>
        <Building position={[0, 0, 0]} color="#10B981" delay={2.4} />
      </group>
      <group position={[7, 0, -3]} scale={0.85}>
        <Building position={[0, 0, 0]} color="#F97316" delay={2.7} />
      </group>
      <group position={[10, 0, -2]} scale={0.8}>
        <Building position={[0, 0, 0]} color="#06B6D4" delay={3} />
      </group>
      
      {/* Jakarta Skyline - Background Row (Smaller) */}
      <group position={[-11, 0, -7]} scale={0.6}>
        <Building position={[0, 0, 0]} color="#8B5CF6" delay={3.3} />
      </group>
      <group position={[-7, 0, -8]} scale={0.55}>
        <Building position={[0, 0, 0]} color="#F59E0B" delay={3.6} />
      </group>
      <group position={[-3, 0, -7.5]} scale={0.5}>
        <Building position={[0, 0, 0]} color="#3B82F6" delay={3.9} />
      </group>
      <group position={[0, 0, -9]} scale={0.6}>
        <Building position={[0, 0, 0]} color="#EC4899" delay={4.2} />
      </group>
      <group position={[4, 0, -7.5]} scale={0.55}>
        <Building position={[0, 0, 0]} color="#10B981" delay={4.5} />
      </group>
      <group position={[8, 0, -8]} scale={0.5}>
        <Building position={[0, 0, 0]} color="#F97316" delay={4.8} />
      </group>
      <group position={[12, 0, -7]} scale={0.6}>
        <Building position={[0, 0, 0]} color="#06B6D4" delay={5.1} />
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
