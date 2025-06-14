import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Maximize, Minimize, Ruler, Eye, Palette, Map, Webcam, Sun, LayoutGrid } from 'lucide-react';
import PropertyModel from './PropertyModel3D';
import MeasurementTool from './MeasurementTool';
import VirtualStagingPanel from './VirtualStagingPanel';
import EmotionTracker from './EmotionTracker';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3, MathUtils } from 'three';
import LightingPanel from './LightingPanel';

interface PropertyViewer3DProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Loading 3D Model... {progress.toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

interface SceneControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  isTopView: boolean;
  measurementMode: boolean;
}

const SceneController = ({ controlsRef, isTopView, measurementMode }: SceneControllerProps) => {
  useFrame((state) => {
    if (controlsRef.current) {
      if (isTopView) {
        state.camera.position.lerp(new Vector3(0, 40, 0.1), 0.05);
        controlsRef.current.target.lerp(new Vector3(0, 0, 0), 0.05);
        controlsRef.current.enableRotate = false;
      } else {
        controlsRef.current.enableRotate = !measurementMode;
      }
      controlsRef.current.update();
    }
  });

  return null;
}

const PropertyViewer3D = ({ isOpen, onClose, propertyId, propertyTitle }: PropertyViewer3DProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<'orbit' | 'measure' | 'staging' | 'lighting'>('orbit');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [stagingStyle, setStagingStyle] = useState<string>('modern');
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEmotionTrackingEnabled, setIsEmotionTrackingEnabled] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [emotionTrackingStatus, setEmotionTrackingStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [emotionError, setEmotionError] = useState<string | null>(null);
  const [isTopView, setIsTopView] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(12); // Default to noon
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleToolChange = (tool: 'orbit' | 'measure' | 'staging' | 'lighting') => {
    setActiveTool(tool);
    setMeasurementMode(tool === 'measure');
  };

  const getLightingProps = (time: number) => {
    const hour = time % 24;
    const angle = (hour / 24) * 2 * Math.PI;

    const sunX = 20 * Math.cos(angle - Math.PI / 2);
    const sunY = 20 * Math.sin(angle - Math.PI / 2);
    const sunPosition: [number, number, number] = [sunX, sunY, 10];

    let sunIntensity = 0;
    let ambientIntensity = 0.1;
    let environmentPreset: 'dawn' | 'apartment' | 'sunset' | 'night' = 'night';

    if (hour >= 5 && hour < 7) { // Dawn
      sunIntensity = MathUtils.mapLinear(hour, 5, 7, 0, 0.8);
      ambientIntensity = MathUtils.mapLinear(hour, 5, 7, 0.1, 0.3);
      environmentPreset = 'dawn';
    } else if (hour >= 7 && hour < 17) { // Day
      sunIntensity = 1;
      ambientIntensity = 0.4;
      environmentPreset = 'apartment';
    } else if (hour >= 17 && hour < 19) { // Sunset
      sunIntensity = MathUtils.mapLinear(hour, 17, 19, 1, 0);
      ambientIntensity = MathUtils.mapLinear(hour, 17, 19, 0.4, 0.2);
      environmentPreset = 'sunset';
    } else { // Night
      sunIntensity = 0.1; // A little moonlight
      ambientIntensity = 0.1;
      environmentPreset = 'night';
    }
    
    if (sunY < 0) {
      sunIntensity *= Math.max(0, 1 + sunY / 20);
    } else {
      sunIntensity = Math.min(1.5, sunIntensity);
    }

    return { sunPosition, sunIntensity, ambientIntensity, environmentPreset };
  };

  const lightingProps = getLightingProps(timeOfDay);
  
  useEffect(() => {
    if (!isOpen && isTopView) {
        setIsTopView(false);
    }
  }, [isOpen, isTopView])

  const stagingStyles = [
    { id: 'modern', name: 'Modern', color: 'bg-blue-500' },
    { id: 'classic', name: 'Classic', color: 'bg-amber-500' },
    { id: 'minimalist', name: 'Minimalist', color: 'bg-gray-500' },
    { id: 'luxury', name: 'Luxury', color: 'bg-purple-500' },
    { id: 'scandinavian', name: 'Scandinavian', color: 'bg-green-500' },
    { id: 'industrial', name: 'Industrial', color: 'bg-orange-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'fixed inset-0 max-w-none w-screen h-screen' : 'max-w-6xl w-full h-[80vh]'} p-0 bg-black`}>
        <div className="relative w-full h-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <DialogTitle className="text-xl font-bold text-white">{propertyTitle}</DialogTitle>
                <p className="text-sm text-gray-300">3D Virtual Tour</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tool Panel */}
          <div className="absolute top-20 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div className="flex flex-col gap-2">
              <Button
                variant={activeTool === 'orbit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleToolChange('orbit')}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Eye className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <Button
                variant={activeTool === 'measure' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleToolChange('measure')}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Ruler className="h-4 w-4 mr-2" />
                Measure
              </Button>
              <Button
                variant={activeTool === 'staging' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleToolChange('staging')}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Palette className="h-4 w-4 mr-2" />
                Staging
              </Button>
              <Button
                variant={activeTool === 'lighting' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleToolChange('lighting')}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Lighting
              </Button>
              <Button
                variant={isTopView ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsTopView(!isTopView)}
                className="text-white hover:bg-white/20 justify-start"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Top View
              </Button>
              <Button
                variant={showNeighborhood ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowNeighborhood(!showNeighborhood)}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Map className="h-4 w-4 mr-2" />
                Area
              </Button>
              <Button
                variant={emotionTrackingStatus !== 'idle' && emotionTrackingStatus !== 'error' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (isEmotionTrackingEnabled) {
                    setIsEmotionTrackingEnabled(false);
                    setDetectedEmotion(null);
                    setEmotionTrackingStatus('idle');
                    setEmotionError(null);
                  } else {
                    setIsEmotionTrackingEnabled(true);
                    setEmotionTrackingStatus('loading');
                  }
                }}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Webcam className="h-4 w-4 mr-2" />
                Emotion AI
              </Button>
            </div>
          </div>

          {/* Virtual Staging Panel */}
          {activeTool === 'staging' && (
            <VirtualStagingPanel
              styles={stagingStyles}
              activeStyle={stagingStyle}
              onStyleChange={setStagingStyle}
            />
          )}

          {/* Lighting Panel */}
          {activeTool === 'lighting' && (
            <LightingPanel
              timeOfDay={timeOfDay}
              onTimeChange={setTimeOfDay}
            />
          )}

          {/* Status Badges */}
          <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
            <Badge className="bg-green-500/80 text-white backdrop-blur-sm">
              AR Ready
            </Badge>
            <Badge className="bg-blue-500/80 text-white backdrop-blur-sm">
              4K Quality
            </Badge>
            {measurementMode && (
              <Badge className="bg-orange-500/80 text-white backdrop-blur-sm animate-pulse">
                Measurement Active
              </Badge>
            )}
          </div>

          {/* Emotion Tracking UI */}
          {isEmotionTrackingEnabled && (
            <EmotionTracker
              onReady={() => setEmotionTrackingStatus('ready')}
              onEmotionChange={setDetectedEmotion}
              onError={(error) => {
                  setEmotionTrackingStatus('error');
                  setEmotionError(error);
                  setIsEmotionTrackingEnabled(false);
              }}
            />
          )}

          {/* 3D Canvas */}
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 5, 10], fov: 75 }}
            className="w-full h-full"
            onPointerDown={() => { if(isTopView) setIsTopView(false) }}
          >
            <Suspense fallback={<Loader />}>
              <SceneController
                controlsRef={controlsRef}
                isTopView={isTopView}
                measurementMode={measurementMode}
              />
              <Environment preset={lightingProps.environmentPreset} />
              <ambientLight intensity={lightingProps.ambientIntensity} />
              <directionalLight 
                position={lightingProps.sunPosition} 
                intensity={lightingProps.sunIntensity}
                castShadow
              />
              
              <PropertyModel 
                propertyId={propertyId}
                stagingStyle={stagingStyle}
                showNeighborhood={showNeighborhood}
              />
              
              {measurementMode && <MeasurementTool />}
              
              <OrbitControls
                ref={controlsRef}
                enabled={!measurementMode}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={80}
              />
            </Suspense>
          </Canvas>

          {/* UI elements at bottom */}
          <div className="absolute bottom-4 right-4 left-4 z-10 flex justify-between items-end">
            {/* Instructions */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-sm">
              <h4 className="font-semibold mb-2">How to Navigate:</h4>
              <ul className="text-sm space-y-1">
                <li>• Click & drag to rotate view</li>
                <li>• Scroll to zoom in/out</li>
                <li>• Right-click & drag to pan</li>
                {measurementMode && <li>• Click two points to measure distance</li>}
              </ul>
            </div>
            
            {/* Emotion Status */}
            <div className="flex flex-col items-end gap-2">
              {emotionTrackingStatus === 'loading' && (
                  <Badge className="bg-yellow-500/80 text-white backdrop-blur-sm">
                      Loading Emotion AI...
                  </Badge>
              )}
              {emotionTrackingStatus === 'ready' && detectedEmotion && (
                  <Badge className="bg-purple-500/80 text-white backdrop-blur-sm capitalize">
                      Emotion: {detectedEmotion}
                  </Badge>
              )}
              {emotionTrackingStatus === 'error' && emotionError && (
                  <Badge variant="destructive" className="backdrop-blur-sm max-w-[240px] text-wrap text-center">
                    {emotionError}
                  </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewer3D;
