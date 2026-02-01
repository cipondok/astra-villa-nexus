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
  
  // Load logo texture
  const logoTexture = useTexture(logoUrl);
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (bubbleRef.current) {
      bubbleRef.current.rotation.y = t * 0.12;
      bubbleRef.current.rotation.x = Math.sin(t * 0.08) * 0.05;
    }
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.1}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <group>
        {/* Logo - positioned in FRONT for maximum clarity */}
        <mesh ref={logoRef} position={[0, 0, 0.6]}>
          <planeGeometry args={[1.4, 1.4]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            emissive="#d6b67e"
            emissiveIntensity={0.4}
            toneMapped={false}
          />
        </mesh>

        {/* Crystal Glass Bubble - Behind logo with subtle effect */}
        <mesh ref={bubbleRef} position={[0, 0, -0.2]}>
          <sphereGeometry args={[1.1, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            resolution={256}
            transmission={0.85}
            roughness={0.05}
            thickness={0.3}
            ior={1.3}
            chromaticAberration={0.4}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.15}
            temporalDistortion={0.05}
            clearcoat={1}
            attenuationDistance={1}
            attenuationColor="#ffffff"
            color="#f0f8ff"
          />
        </mesh>

        {/* Subtle iridescent rim */}
        <mesh position={[0, 0, -0.2]}>
          <sphereGeometry args={[1.12, 48, 48]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.12}
            roughness={0}
            metalness={0.3}
            clearcoat={1}
            iridescence={1}
            iridescenceIOR={2}
            iridescenceThicknessRange={[100, 600]}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Bright lighting for logo visibility */}
        <pointLight position={[0, 0, 1.5]} intensity={1.5} color="#ffffff" distance={4} />
        <pointLight position={[0, 0, -1]} intensity={0.5} color="#d6b67e" distance={3} />
        
        {/* Subtle colored rim lights */}
        <pointLight position={[1.2, 0, 0]} intensity={0.25} color="#00ffff" distance={3} />
        <pointLight position={[-1.2, 0, 0]} intensity={0.25} color="#ff00ff" distance={3} />
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
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#e8e0ff" />
        
        <CrystalBubble logoUrl={logoUrl} />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default CrystalLogo3D;
