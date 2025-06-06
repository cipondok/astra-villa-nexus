
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, Text } from '@react-three/drei';
import { Group } from 'three';

interface PropertyModel3DProps {
  propertyId: number;
  stagingStyle: string;
  showNeighborhood: boolean;
}

const PropertyModel3D = ({ propertyId, stagingStyle, showNeighborhood }: PropertyModel3DProps) => {
  const houseRef = useRef<Group>(null);

  useFrame((state, delta) => {
    // Subtle breathing animation for the model
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
      {/* House Structure */}
      <group ref={houseRef}>
        {/* Foundation */}
        <Box args={[8, 0.5, 6]} position={[0, -0.25, 0]}>
          <meshStandardMaterial color="#8b7355" />
        </Box>
        
        {/* Walls */}
        <Box args={[8, 3, 6]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#f5f5f5" />
        </Box>
        
        {/* Roof */}
        <Box args={[9, 0.3, 7]} position={[0, 3.5, 0]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
        
        {/* Windows */}
        <Box args={[1.5, 1.5, 0.1]} position={[-2.5, 1.8, 3.1]}>
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
        </Box>
        <Box args={[1.5, 1.5, 0.1]} position={[2.5, 1.8, 3.1]}>
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
        </Box>
        
        {/* Door */}
        <Box args={[1, 2.5, 0.1]} position={[0, 1.25, 3.1]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
      </group>

      {/* Virtual Staging Furniture */}
      <group>
        {/* Living Room Sofa */}
        <Box args={[3, 0.8, 1.5]} position={[-1, 0.4, 1]}>
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </Box>
        
        {/* Coffee Table */}
        <Box args={[1.5, 0.4, 1]} position={[-1, 0.2, -0.5]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
        
        {/* Dining Table */}
        <Box args={[2, 0.8, 1]} position={[2, 0.4, 0]}>
          <meshStandardMaterial color="#654321" />
        </Box>
        
        {/* Chairs */}
        <Box args={[0.5, 1, 0.5]} position={[1.2, 0.5, 0]}>
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </Box>
        <Box args={[0.5, 1, 0.5]} position={[2.8, 0.5, 0]}>
          <meshStandardMaterial color={getStagingColor(stagingStyle)} />
        </Box>
      </group>

      {/* Neighborhood Elements (when enabled) */}
      {showNeighborhood && (
        <group>
          {/* Ground */}
          <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <meshStandardMaterial color="#90EE90" />
          </Plane>
          
          {/* Nearby Buildings */}
          <Box args={[4, 4, 4]} position={[15, 2, 0]}>
            <meshStandardMaterial color="#d3d3d3" />
          </Box>
          <Box args={[3, 6, 3]} position={[-15, 3, 5]}>
            <meshStandardMaterial color="#f0f0f0" />
          </Box>
          
          {/* Trees */}
          <group position={[8, 0, 8]}>
            <Box args={[0.5, 3, 0.5]} position={[0, 1.5, 0]}>
              <meshStandardMaterial color="#8b4513" />
            </Box>
            <Box args={[2, 2, 2]} position={[0, 4, 0]}>
              <meshStandardMaterial color="#228b22" />
            </Box>
          </group>
          
          {/* Street */}
          <Plane args={[60, 4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -10]}>
            <meshStandardMaterial color="#404040" />
          </Plane>
          
          {/* Location Labels */}
          <Text
            position={[15, 6, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            School Zone
          </Text>
          <Text
            position={[0, 1, -15]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Main Road Access
          </Text>
        </group>
      )}
    </group>
  );
};

export default PropertyModel3D;
