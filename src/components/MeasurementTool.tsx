
import React, { useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import { Vector3, Vector2, Raycaster } from 'three';

const MeasurementTool = () => {
  const { camera, scene, gl } = useThree();
  const [measurements, setMeasurements] = useState<Array<{
    start: Vector3;
    end: Vector3;
    distance: number;
    id: string;
  }>>([]);
  const [currentStart, setCurrentStart] = useState<Vector3 | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const raycaster = useRef(new Raycaster());

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      if (!currentStart) {
        setCurrentStart(point.clone());
        setIsDrawing(true);
      } else {
        const distance = currentStart.distanceTo(point);
        const newMeasurement = {
          start: currentStart,
          end: point.clone(),
          distance,
          id: `measurement-${Date.now()}`
        };
        
        setMeasurements(prev => [...prev, newMeasurement]);
        setCurrentStart(null);
        setIsDrawing(false);
      }
    }
  };

  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [currentStart, gl.domElement]);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 100).toFixed(0)} cm`;
    } else {
      return `${distance.toFixed(2)} m`;
    }
  };

  return (
    <group>
      {/* Render completed measurements */}
      {measurements.map((measurement) => {
        const midpoint = new Vector3()
          .addVectors(measurement.start, measurement.end)
          .multiplyScalar(0.5);

        return (
          <group key={measurement.id}>
            {/* Measurement line */}
            <Line
              points={[measurement.start, measurement.end]}
              color="red"
              lineWidth={3}
            />
            
            {/* Start point */}
            <mesh position={[measurement.start.x, measurement.start.y, measurement.start.z]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="red" />
            </mesh>
            
            {/* End point */}
            <mesh position={[measurement.end.x, measurement.end.y, measurement.end.z]}>
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
          Click two points to measure distance
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
