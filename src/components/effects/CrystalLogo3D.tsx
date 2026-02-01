import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MeshTransmissionMaterial, 
  Environment, 
  Float,
  useTexture,
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';

interface CrystalBubbleProps {
  logoUrl: string;
}

const CrystalBubble = ({ logoUrl }: CrystalBubbleProps) => {
  const bubbleRef = useRef<THREE.Mesh>(null);
  const logoRef = useRef<THREE.Mesh>(null);
  const hologramRef = useRef<THREE.Mesh>(null);
  
  // Load logo texture
  const logoTexture = useTexture(logoUrl);
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  
  // Vibrant holographic rainbow material
  const hologramMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        void main() {
          // Create vibrant rainbow based on viewing angle
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float hue = fract(vUv.x * 0.5 + vUv.y * 0.5 + vPosition.x * 0.3 + time * 0.15);
          vec3 rainbow = hsv2rgb(vec3(hue, 0.9, 1.0));
          
          // Shimmer effect
          float shimmer = sin(vUv.x * 20.0 + time * 3.0) * 0.5 + 0.5;
          shimmer *= sin(vUv.y * 15.0 - time * 2.0) * 0.5 + 0.5;
          
          float alpha = fresnel * 0.4 + shimmer * 0.15;
          gl_FragColor = vec4(rainbow, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (bubbleRef.current) {
      bubbleRef.current.rotation.y = t * 0.15;
      bubbleRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    
    if (hologramRef.current) {
      hologramMaterial.uniforms.time.value = t;
      hologramRef.current.rotation.y = -t * 0.1;
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
        <Sphere ref={bubbleRef} args={[1, 64, 64]}>
          <MeshTransmissionMaterial
            backside
            samples={32}
            resolution={1024}
            transmission={0.98}
            roughness={0}
            thickness={0.8}
            ior={2.4}
            chromaticAberration={1}
            anisotropy={0.5}
            distortion={0.5}
            distortionScale={0.8}
            temporalDistortion={0.2}
            clearcoat={1}
            clearcoatRoughness={0}
            attenuationDistance={0.3}
            attenuationColor="#ffffff"
            color="#f8faff"
            reflectivity={1}
          />
        </Sphere>

        {/* Holographic rainbow overlay */}
        <Sphere ref={hologramRef} args={[1.02, 64, 64]} material={hologramMaterial} />

        {/* Inner bubble layer for depth */}
        <Sphere args={[0.85, 32, 32]}>
          <meshPhysicalMaterial
            transparent
            opacity={0.1}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Logo inside the bubble */}
        <mesh ref={logoRef} position={[0, 0, 0.1]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            emissive="#d6b67e"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner glow for logo */}
        <pointLight position={[0, 0, 0.5]} intensity={0.8} color="#d6b67e" distance={2} />
        
        {/* Rainbow rim lights for vibrant refraction */}
        <pointLight position={[1.5, 0, 0]} intensity={0.6} color="#ff0066" distance={4} />
        <pointLight position={[-1.5, 0, 0]} intensity={0.6} color="#00ffff" distance={4} />
        <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#ff00ff" distance={4} />
        <pointLight position={[0, -1.5, 0]} intensity={0.5} color="#00ff66" distance={4} />
        <pointLight position={[0, 0, 1.5]} intensity={0.4} color="#ffff00" distance={4} />
        <pointLight position={[0, 0, -1.5]} intensity={0.4} color="#0066ff" distance={4} />
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
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.6} color="#e8e0ff" />
        <directionalLight position={[0, -5, 0]} intensity={0.4} color="#ffe0f0" />
        
        <CrystalBubble logoUrl={logoUrl} />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default CrystalLogo3D;
