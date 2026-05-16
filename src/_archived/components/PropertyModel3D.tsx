
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface PropertyModel3DProps {
  propertyId: string;
  stagingStyle: string;
  showNeighborhood: boolean;
}

const PropertyModel3D = ({ propertyId, stagingStyle, showNeighborhood }: PropertyModel3DProps) => {
  const houseRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (houseRef.current) {
      houseRef.current.rotation.y += delta * 0.1;
    }
  });

  const getStagingColor = (style: string) => {
    switch (style) {
      case 'modern': return '#2563eb';
      case 'classic': return '#d97706';
      case 'minimalist': return '#6b7280';
      case 'luxury': return '#7c3aed';
      case 'scandinavian': return '#059669';
      case 'industrial': return '#ea580c';
      default: return '#2563eb';
    }
  };

  return (
    <group>
      <group ref={houseRef}>
        {/* Foundation */}
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[8, 0.5, 6]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
        
        {/* Walls */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[8, 3, 6]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
        
        {/* Roof */}
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[9, 0.3, 7]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Windows */}
        <mesh position={[-2.5, 1.8, 3.1]}>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
        </mesh>
        <mesh position={[2.5, 1.8, 3.1]}>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
        </mesh>
        
        {/* Door */}
        <mesh position={[0, 1.25, 3.1]}>
          <boxGeometry args={[1, 2.5, 0.1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* Virtual Staging Furniture */}
      <group>
        {/* Living Room Sofa */}
        <mesh position={[-1, 0.4, 1]}>
          <boxGeometry args={[3, 0.8, 1.5]} />
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </mesh>
        
        {/* Coffee Table */}
        <mesh position={[-1, 0.2, -0.5]}>
          <boxGeometry args={[1.5, 0.4, 1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Dining Table */}
        <mesh position={[2, 0.4, 0]}>
          <boxGeometry args={[2, 0.8, 1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Chairs */}
        <mesh position={[1.2, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </mesh>
        <mesh position={[2.8, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </mesh>
      </group>

      {/* Neighborhood Elements */}
      {showNeighborhood && (
        <group>
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>
          
          {/* Nearby Buildings */}
          <mesh position={[15, 2, 0]}>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color="#d3d3d3" />
          </mesh>
          <mesh position={[-15, 3, 5]}>
            <boxGeometry args={[3, 6, 3]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          
          {/* Trees */}
          <group position={[8, 0, 8]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.5, 3, 0.5]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 4, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#228b22" />
            </mesh>
          </group>
          
          {/* Street */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -10]}>
            <planeGeometry args={[60, 4]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default PropertyModel3D;
