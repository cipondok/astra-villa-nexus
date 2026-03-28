import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Text, Box, Sphere, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// ── Smooth lerped value hook ──
function useLerpedValue(target: number, speed = 0.04) {
  const ref = useRef(target);
  useFrame(() => { ref.current += (target - ref.current) * speed; });
  return ref;
}

// ── Emissive Window (glows at night) ──
function EmissiveWindow({ position, isNight }: { position: [number, number, number]; isNight: boolean }) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const emissiveTarget = isNight ? 1.8 : 0;
  const emissiveRef = useLerpedValue(emissiveTarget, 0.03);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveRef.current;
    }
  });

  return (
    <Box args={[1.6, 1.8, 0.05]} position={position}>
      <meshPhysicalMaterial
        ref={matRef}
        color={isNight ? '#ffecd2' : '#88c8e8'}
        emissive={isNight ? '#ffb347' : '#000000'}
        emissiveIntensity={0}
        roughness={0.05}
        metalness={0.1}
        transmission={isNight ? 0.1 : 0.6}
        thickness={0.3}
        opacity={isNight ? 0.95 : 0.7}
        transparent
      />
    </Box>
  );
}

// ── Procedural Modern Villa (optimized geometry) ──
function VillaStructure({ isNight }: { isNight: boolean }) {
  const ref = useRef<THREE.Group>(null);

  const windowPositions: [number, number, number][] = useMemo(() => [
    [-2.5, 1.5, 2.01], [0, 1.5, 2.01], [2.5, 1.5, 2.01], [1.5, 4, 2.26],
  ], []);

  // Memoize reused materials to avoid re-creation
  const materials = useMemo(() => ({
    wall1: new THREE.MeshStandardMaterial({ color: '#f5f0e8', roughness: 0.3, metalness: 0.05 }),
    wall2: new THREE.MeshStandardMaterial({ color: '#ede8de', roughness: 0.35, metalness: 0.05 }),
    pool: new THREE.MeshStandardMaterial({ color: '#4da8c4', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 }),
    poolEdge: new THREE.MeshStandardMaterial({ color: '#d4cfc2', roughness: 0.6 }),
    roof: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.5, metalness: 0.3 }),
    pillar: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.3, metalness: 0.5 }),
    ground: new THREE.MeshStandardMaterial({ color: '#3d6b3d', roughness: 0.9 }),
    path: new THREE.MeshStandardMaterial({ color: '#c8b896', roughness: 0.7 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#5a3825', roughness: 0.8 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#2d5a2d', roughness: 0.7 }),
  }), []);

  // Memoize shared geometries (low-poly)
  const geos = useMemo(() => ({
    mainBody: new THREE.BoxGeometry(6, 2.8, 4),
    wing: new THREE.BoxGeometry(4, 2.5, 3.5),
    pool: new THREE.BoxGeometry(4, 0.3, 2),
    poolEdge: new THREE.BoxGeometry(4.2, 0.4, 2.2),
    roofMain: new THREE.BoxGeometry(7, 0.12, 5),
    roofWing: new THREE.BoxGeometry(5, 0.12, 4.5),
    pillar: new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6),
    ground: new THREE.BoxGeometry(16, 0.08, 14),
    path: new THREE.BoxGeometry(1.5, 0.05, 5),
    trunk: new THREE.CylinderGeometry(0.08, 0.12, 2, 5),
    canopy: new THREE.SphereGeometry(0.9, 6, 6),
  }), []);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Main body */}
      <mesh geometry={geos.mainBody} material={materials.wall1} position={[0, 1.4, 0]} />
      {/* Second floor */}
      <mesh geometry={geos.wing} material={materials.wall2} position={[1.5, 4, 0.5]} />

      {/* Windows (emissive at night) */}
      {windowPositions.map((pos, i) => (
        <EmissiveWindow key={`w-${i}`} position={pos} isNight={isNight} />
      ))}

      {/* Pool */}
      <mesh geometry={geos.pool} material={materials.pool} position={[-1, 0.15, 3.5]} />
      <mesh geometry={geos.poolEdge} material={materials.poolEdge} position={[-1, 0.05, 3.5]} />

      {/* Roof overhangs */}
      <mesh geometry={geos.roofMain} material={materials.roof} position={[0, 2.85, 0]} />
      <mesh geometry={geos.roofWing} material={materials.roof} position={[1.5, 5.3, 0.5]} />

      {/* Pillars */}
      {[[-3, 1.4, 2.2], [3, 1.4, 2.2]].map((pos, i) => (
        <mesh key={`p-${i}`} geometry={geos.pillar} material={materials.pillar} position={pos as [number, number, number]} />
      ))}

      {/* Ground */}
      <mesh geometry={geos.ground} material={materials.ground} position={[0, -0.04, 0]} />
      {/* Pathway */}
      <mesh geometry={geos.path} material={materials.path} position={[0, 0.01, 5]} />

      {/* Trees (low-poly) */}
      {[[-5, 0, 2], [5, 0, -3], [-4, 0, -4], [6, 0, 3]].map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          <mesh geometry={geos.trunk} material={materials.trunk} position={[0, 1, 0]} />
          <mesh geometry={geos.canopy} material={materials.leaves} position={[0, 2.5, 0]} />
        </group>
      ))}
    </group>
  );
}

// ── Ambient particles (reduced count) ──
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 40; // Reduced from 80
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#C8A96A" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── Camera command targets ──
export const CAMERA_COMMANDS = {
  'front': { position: [0, 3, 14], lookAt: [0, 2, 0] },
  'living_room': { position: [1, 2.5, 5], lookAt: [0, 1.5, 2.5] },
  'master_suite': { position: [-5, 3, 2], lookAt: [-2.5, 2, 0] },
  'pool': { position: [6, 2, 4], lookAt: [3, 1, 2] },
  'sky_terrace': { position: [4, 6, 4], lookAt: [2, 4, 1] },
  'overview': { position: [10, 6, 10], lookAt: [0, 2, 0] },
  'roi_highlight': { position: [0, 8, 12], lookAt: [0, 2, 0] },
} as const;

export type CameraCommandKey = keyof typeof CAMERA_COMMANDS;

// ── Smooth camera fly-to ──
function CameraController({ command, onComplete, autoRotate }: { command: CameraCommandKey | null; onComplete: () => void; autoRotate: boolean }) {
  const { camera } = useThree();
  const angle = useRef(0);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 2, 0));
  const isFlying = useRef(false);

  React.useEffect(() => {
    if (!command) return;
    const cmd = CAMERA_COMMANDS[command];
    targetPos.current.set(...(cmd.position as [number, number, number]));
    targetLook.current.set(...(cmd.lookAt as [number, number, number]));
    isFlying.current = true;
  }, [command]);

  useFrame((_, dt) => {
    if (isFlying.current) {
      camera.position.lerp(targetPos.current, 0.04);
      currentLook.current.lerp(targetLook.current, 0.04);
      camera.lookAt(currentLook.current);

      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        isFlying.current = false;
        onComplete();
      }
      return;
    }

    if (!autoRotate) return;
    angle.current += dt * 0.15;
    const r = 12;
    camera.position.x = Math.sin(angle.current) * r;
    camera.position.z = Math.cos(angle.current) * r;
    camera.position.y = 5 + Math.sin(angle.current * 0.5) * 1.5;
    camera.lookAt(0, 2, 0);
  });

  return null;
}

// ── Interactive hotspot markers ──
function HotspotMarker({ position, label, onClick }: { position: [number, number, number]; label: string; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.15;
      ref.current.scale.setScalar(hovered ? 1.3 : 1);
    }
  });

  return (
    <group>
      <Sphere
        ref={ref}
        args={[0.15, 16, 16]}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color={hovered ? '#FFD700' : '#C8A96A'}
          emissive={hovered ? '#C8A96A' : '#8B7340'}
          emissiveIntensity={hovered ? 1.5 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      {hovered && (
        <Float speed={2} floatIntensity={0.3}>
          <Text
            position={[position[0], position[1] + 0.5, position[2]]}
            fontSize={0.2}
            color="#C8A96A"
            anchorX="center"
            anchorY="bottom"
            font={undefined}
          >
            {label}
          </Text>
        </Float>
      )}
    </group>
  );
}

// ── Adaptive Lighting System ──
function AdaptiveLighting({ isNight }: { isNight: boolean }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.PointLight>(null);

  const ambientTarget = useLerpedValue(isNight ? 0.08 : 0.4, 0.03);
  const sunTarget = useLerpedValue(isNight ? 0.05 : 1.2, 0.03);
  const fillTarget = useLerpedValue(isNight ? 0.02 : 0.4, 0.03);
  const moonTarget = useLerpedValue(isNight ? 0.6 : 0, 0.03);

  useFrame(() => {
    if (ambientRef.current) ambientRef.current.intensity = ambientTarget.current;
    if (sunRef.current) sunRef.current.intensity = sunTarget.current;
    if (fillRef.current) fillRef.current.intensity = fillTarget.current;
    if (moonRef.current) moonRef.current.intensity = moonTarget.current;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} color={isNight ? '#1a2a4a' : '#ffffff'} />
      <directionalLight ref={sunRef} position={[8, 12, 5]} intensity={1.2} castShadow
        shadow-mapSize-width={512} shadow-mapSize-height={512}
        shadow-camera-far={20} shadow-camera-near={1}
        shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8}
        color={isNight ? '#2244aa' : '#ffffff'}
      />
      <directionalLight ref={fillRef} position={[-5, 8, -3]} intensity={0.4} color={isNight ? '#1a3366' : '#ffe4c4'} />
      <pointLight ref={moonRef} position={[-8, 15, -5]} intensity={0} color="#6688cc" distance={40} />
    </>
  );
}

// ── Scene composition ──
export function PropertyScene({ onHotspotClick, autoRotate, isNight = false, cameraCommand = null, onCameraCommandComplete }: {
  onHotspotClick: (label: string) => void;
  autoRotate: boolean;
  isNight?: boolean;
  cameraCommand?: CameraCommandKey | null;
  onCameraCommandComplete?: () => void;
}) {
  const hotspots: { position: [number, number, number]; label: string }[] = [
    { position: [3, 1, 2], label: 'Infinity Pool' },
    { position: [-2.5, 2, 0], label: 'Master Suite' },
    { position: [0, 1.5, 2.5], label: 'Living Pavilion' },
    { position: [2, 4, 1], label: 'Sky Terrace' },
  ];

  return (
    <>
      <AdaptiveLighting isNight={isNight} />

      <VillaStructure isNight={isNight} />
      <FloatingParticles />
      <CameraController command={cameraCommand} onComplete={onCameraCommandComplete || (() => {})} autoRotate={autoRotate} />

      {hotspots.map(hs => (
        <HotspotMarker key={hs.label} position={hs.position} label={hs.label} onClick={() => onHotspotClick(hs.label)} />
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={isNight ? 0.2 : 0.4} scale={20} blur={2} far={8} />
      <Environment preset={isNight ? 'night' : 'sunset'} />
      {!autoRotate && !cameraCommand && <OrbitControls makeDefault target={[0, 2, 0]} minDistance={5} maxDistance={25} maxPolarAngle={Math.PI / 2.1} enableDamping dampingFactor={0.05} />}
    </>
  );
}

export default PropertyScene;
