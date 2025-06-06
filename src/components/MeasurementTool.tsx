
import React, { useState, useCallback } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3 } from 'three';

interface Measurement {
  start: Vector3;
  end: Vector3;
  distance: number;
  id: string;
}

const MeasurementTool = () => {
  const { camera, scene } = useThree();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentStart, setCurrentStart] = useState<Vector3 | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    const intersect = event.intersections[0];
    if (intersect && intersect.point) {
      const point = intersect.point.clone();

      if (!currentStart) {
        setCurrentStart(point);
        setIsDrawing(true);
        console.log('Started measurement at:', point);
      } else {
        const distance = currentStart.distanceTo(point);
        const newMeasurement: Measurement = {
          start: currentStart.clone(),
          end: point,
          distance,
          id: `measurement-${Date.now()}`
        };
        
        setMeasurements(prev => [...prev, newMeasurement]);
        setCurrentStart(null);
        setIsDrawing(false);
        console.log('Completed measurement:', newMeasurement);
      }
    }
  }, [currentStart]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${(distance * 100).toFixed(0)} cm`;
    } else {
      return `${distance.toFixed(2)} m`;
    }
  };

  return (
    <group>
      {/* Invisible plane to catch clicks */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent={true} opacity={0} />
      </mesh>

      {/* Render completed measurements */}
      {measurements.map((measurement) => {
        const midpoint = new Vector3()
          .addVectors(measurement.start, measurement.end)
          .multiplyScalar(0.5);

        return (
          <group key={measurement.id}>
            {/* Measurement line using cylinderGeometry */}
            <mesh 
              position={midpoint}
              lookAt={measurement.end}
            >
              <cylinderGeometry args={[0.01, 0.01, measurement.distance]} />
              <meshBasicMaterial color="red" />
            </mesh>
            
            {/* Start point */}
            <mesh position={measurement.start}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="red" />
            </mesh>
            
            {/* End point */}
            <mesh position={measurement.end}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="red" />
            </mesh>
            
            {/* Distance label */}
            <Text
              position={[midpoint.x, midpoint.y + 0.3, midpoint.z]}
              fontSize={0.3}
              color="red"
              anchorX="center"
              anchorY="middle"
            >
              {formatDistance(measurement.distance)}
            </Text>
          </group>
        );
      })}
      
      {/* Instructions when ready to measure */}
      {!isDrawing && measurements.length === 0 && (
        <Text
          position={[0, 5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Click on objects to measure distance
        </Text>
      )}
      
      {/* Instructions when drawing */}
      {isDrawing && (
        <Text
          position={[0, 5, 0]}
          fontSize={0.5}
          color="orange"
          anchorX="center"
          anchorY="middle"
        >
          Click the second point to complete measurement
        </Text>
      )}
    </group>
  );
};

export default MeasurementTool;
