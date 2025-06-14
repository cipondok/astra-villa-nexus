
import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Maximize, Minimize, Ruler, Eye, Palette, Map } from 'lucide-react';
import PropertyModel from './PropertyModel3D';
import MeasurementTool from './MeasurementTool';
import VirtualStagingPanel from './VirtualStagingPanel';

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

const PropertyViewer3D = ({ isOpen, onClose, propertyId, propertyTitle }: PropertyViewer3DProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<'orbit' | 'measure' | 'staging'>('orbit');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [stagingStyle, setStagingStyle] = useState<string>('modern');
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleToolChange = (tool: 'orbit' | 'measure' | 'staging') => {
    setActiveTool(tool);
    setMeasurementMode(tool === 'measure');
  };

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
                variant={showNeighborhood ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowNeighborhood(!showNeighborhood)}
                className="text-white hover:bg-white/20 justify-start"
              >
                <Map className="h-4 w-4 mr-2" />
                Area
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

          {/* 3D Canvas */}
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 5, 10], fov: 75 }}
            className="w-full h-full"
          >
            <Suspense fallback={<Loader />}>
              <Environment preset="apartment" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              <PropertyModel 
                propertyId={propertyId}
                stagingStyle={stagingStyle}
                showNeighborhood={showNeighborhood}
              />
              
              {measurementMode && <MeasurementTool />}
              
              <OrbitControls
                enabled={!measurementMode}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={50}
              />
            </Suspense>
          </Canvas>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-sm">
            <h4 className="font-semibold mb-2">How to Navigate:</h4>
            <ul className="text-sm space-y-1">
              <li>• Click & drag to rotate view</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Right-click & drag to pan</li>
              {measurementMode && <li>• Click two points to measure distance</li>}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewer3D;
