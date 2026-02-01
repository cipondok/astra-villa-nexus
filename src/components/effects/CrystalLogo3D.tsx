import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MeshTransmissionMaterial, 
  Environment, 
  Float,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';

interface CrystalBubbleProps {
  logoUrl: string;
}

const CrystalBubble = ({ logoUrl }: CrystalBubbleProps) => {
  const bubbleRef = useRef<THREE.Mesh>(null);
  const logoRef = useRef<THREE.Mesh>(null);
  const innerBubbleRef = useRef<THREE.Mesh>(null);
  
  // Load logo texture
  const logoTexture = useTexture(logoUrl);
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (bubbleRef.current) {
      bubbleRef.current.rotation.y = t * 0.15;
      bubbleRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    
    if (innerBubbleRef.current) {
      innerBubbleRef.current.rotation.y = -t * 0.1;
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.4}
      floatingRange={[-0.08, 0.08]}
    >
      <group>
        {/* Crystal Glass Bubble - Outer */}
        <mesh ref={bubbleRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.98}
            roughness={0}
            thickness={0.8}
            ior={2.2}
            chromaticAberration={0.8}
            anisotropy={0.3}
            distortion={0.4}
            distortionScale={0.5}
            temporalDistortion={0.15}
            clearcoat={1}
            attenuationDistance={0.4}
            attenuationColor="#ffffff"
            color="#f8faff"
          />
        </mesh>

        {/* Inner bubble layer for rainbow shimmer effect */}
        <mesh ref={innerBubbleRef}>
          <sphereGeometry args={[1.01, 64, 64]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.15}
            roughness={0}
            metalness={0.5}
            clearcoat={1}
            iridescence={1}
            iridescenceIOR={2.5}
            iridescenceThicknessRange={[100, 800]}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Inner glow layer */}
        <mesh>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.08}
            roughness={0}
            metalness={0.2}
            clearcoat={1}
            side={THREE.BackSide}
            color="#e0f0ff"
          />
        </mesh>

        {/* Logo inside the bubble */}
        <mesh ref={logoRef} position={[0, 0, 0.1]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            emissive="#d6b67e"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Inner glow for logo */}
        <pointLight position={[0, 0, 0.5]} intensity={0.6} color="#d6b67e" distance={2} />
        
        {/* Rainbow rim lights for vibrant refraction */}
        <pointLight position={[1.5, 0, 0]} intensity={0.4} color="#ff0066" distance={4} />
        <pointLight position={[-1.5, 0, 0]} intensity={0.4} color="#00ffff" distance={4} />
        <pointLight position={[0, 1.5, 0]} intensity={0.3} color="#ff00ff" distance={4} />
        <pointLight position={[0, -1.5, 0]} intensity={0.3} color="#00ff66" distance={4} />
      </group>
    </Float>
  );
};

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#e8e0ff" />
        <directionalLight position={[0, -5, 0]} intensity={0.3} color="#ffe0f0" />
        
        <CrystalBubble logoUrl={logoUrl} />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default CrystalLogo3D;
