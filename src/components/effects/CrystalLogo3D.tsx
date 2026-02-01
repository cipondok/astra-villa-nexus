import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MeshTransmissionMaterial, 
  Environment, 
  Float,
  useTexture,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';

interface CrystalCubeProps {
  logoUrl: string;
}

const CrystalCube = ({ logoUrl }: CrystalCubeProps) => {
  const cubeRef = useRef<THREE.Mesh>(null);
  const logoRef = useRef<THREE.Mesh>(null);
  const hologramRef = useRef<THREE.Mesh>(null);
  
  // Load logo texture
  const logoTexture = useTexture(logoUrl);
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  
  // Holographic gradient material
  const hologramMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        void main() {
          float hue = fract(vUv.x + vUv.y + time * 0.3);
          vec3 rainbow = hsv2rgb(vec3(hue, 0.6, 0.9));
          float alpha = 0.15 + 0.1 * sin(vUv.y * 10.0 + time * 2.0);
          gl_FragColor = vec4(rainbow, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (cubeRef.current) {
      cubeRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      cubeRef.current.rotation.x = Math.cos(t * 0.2) * 0.08;
    }
    
    if (hologramRef.current) {
      hologramMaterial.uniforms.time.value = t;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <group>
        {/* Crystal Glass Cube */}
        <RoundedBox
          ref={cubeRef}
          args={[1.6, 1.6, 1.6]}
          radius={0.15}
          smoothness={4}
        >
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.95}
            roughness={0.02}
            thickness={0.5}
            ior={1.5}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
            color="#f0f8ff"
          />
        </RoundedBox>

        {/* Holographic overlay on cube edges */}
        <RoundedBox
          ref={hologramRef}
          args={[1.65, 1.65, 1.65]}
          radius={0.15}
          smoothness={4}
          material={hologramMaterial}
        />

        {/* Logo inside the cube */}
        <mesh ref={logoRef} position={[0, 0, 0]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            emissive="#d6b67e"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Inner glow */}
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#d6b67e" distance={2} />
        
        {/* Subtle rim lights for holographic effect */}
        <pointLight position={[1, 0.5, 1]} intensity={0.3} color="#00ffff" distance={3} />
        <pointLight position={[-1, 0.5, -1]} intensity={0.3} color="#ff00ff" distance={3} />
        <pointLight position={[0, -1, 0]} intensity={0.2} color="#ffff00" distance={3} />
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
    sm: 'h-14 w-14',
    md: 'h-20 w-20',
    lg: 'h-28 w-28',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 35 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#e0e7ff" />
        
        <CrystalCube logoUrl={logoUrl} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default CrystalLogo3D;
