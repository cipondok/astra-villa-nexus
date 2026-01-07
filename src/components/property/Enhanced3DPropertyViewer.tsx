import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Box as BoxIcon, 
  Eye, 
  Ruler, 
  Camera, 
  Settings, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Move,
  Maximize2,
  Download,
  Share2
} from 'lucide-react';
import { BaseProperty } from '@/types/property';

interface Enhanced3DPropertyViewerProps {
  property: BaseProperty;
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

// 3D House Model Component
function HouseModel({ scale = 1 }: { scale?: number }) {
  const meshRef = useRef<any>();
  
  // Ensure scale is valid
  const validScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
  
  useFrame((state, delta) => {
    if (meshRef.current && delta) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={meshRef} scale={[validScale, validScale, validScale]}>
      {/* Foundation */}
      <Box args={[5, 0.3, 4]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Floor */}
      <Box args={[4.5, 0.1, 3.5]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#d4b896" />
      </Box>
      
      {/* Front Wall with thickness */}
      <Box args={[4.5, 2.5, 0.25]} position={[0, 1.65, 1.625]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      
      {/* Back Wall */}
      <Box args={[4.5, 2.5, 0.25]} position={[0, 1.65, -1.625]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      
      {/* Left Wall */}
      <Box args={[0.25, 2.5, 3.5]} position={[-2.25, 1.65, 0]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      
      {/* Right Wall */}
      <Box args={[0.25, 2.5, 3.5]} position={[2.25, 1.65, 0]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      
      {/* Hip Roof - Main sections */}
      {/* Front slope */}
      <Box args={[5.2, 0.15, 2]} position={[0, 3.2, 0.8]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Back slope */}
      <Box args={[5.2, 0.15, 2]} position={[0, 3.2, -0.8]} rotation={[-0.5, 0, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Left slope */}
      <Box args={[1.5, 0.15, 2]} position={[-1.85, 3.2, 0]} rotation={[0, 0, 0.5]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Right slope */}
      <Box args={[1.5, 0.15, 2]} position={[1.85, 3.2, 0]} rotation={[0, 0, -0.5]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Roof Ridge */}
      <Box args={[3.5, 0.2, 0.2]} position={[0, 3.8, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      {/* Door Frame */}
      <Box args={[0.9, 1.8, 0.15]} position={[1.2, 1.3, 1.7]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Door */}
      <Box args={[0.8, 1.7, 0.08]} position={[1.2, 1.25, 1.73]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      {/* Door Handle */}
      <Sphere args={[0.04]} position={[1.5, 1.2, 1.74]}>
        <meshStandardMaterial color="#ffd700" />
      </Sphere>
      
      {/* Window Frames */}
      {/* Left Window Frame */}
      <Box args={[0.9, 0.9, 0.15]} position={[-1, 1.4, 1.7]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Left Window Glass */}
      <Box args={[0.8, 0.8, 0.05]} position={[-1, 1.4, 1.72]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </Box>
      
      {/* Right Window Frame */}
      <Box args={[0.9, 0.9, 0.15]} position={[0.2, 1.4, 1.7]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Right Window Glass */}
      <Box args={[0.8, 0.8, 0.05]} position={[0.2, 1.4, 1.72]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </Box>
      
      {/* Side Window */}
      <Box args={[0.15, 0.9, 0.9]} position={[2.37, 1.4, -0.5]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      <Box args={[0.05, 0.8, 0.8]} position={[2.39, 1.4, -0.5]}>
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </Box>
      
      {/* Window Sills */}
      <Box args={[1, 0.1, 0.2]} position={[-1, 0.9, 1.8]}>
        <meshStandardMaterial color="#d4d4d4" />
      </Box>
      
      <Box args={[1, 0.1, 0.2]} position={[0.2, 0.9, 1.8]}>
        <meshStandardMaterial color="#d4d4d4" />
      </Box>
      
      {/* Chimney */}
      <Box args={[0.4, 1.2, 0.4]} position={[-1.5, 4.5, -0.5]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      
      {/* Gutters */}
      <Box args={[5.4, 0.1, 0.1]} position={[0, 2.8, 1.8]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      <Box args={[5.4, 0.1, 0.1]} position={[0, 2.8, -1.8]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Property Labels */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        Realistic 3D House Model
      </Text>
    </group>
  );
}

// Measurement Tool Component  
function MeasurementTool() {
  const [startPoint, setStartPoint] = useState<[number, number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number, number] | null>(null);

  // Only render if both points are valid
  const shouldRender = startPoint && endPoint && 
    Array.isArray(startPoint) && Array.isArray(endPoint) &&
    startPoint.length === 3 && endPoint.length === 3 &&
    startPoint.every(n => typeof n === 'number' && !isNaN(n)) &&
    endPoint.every(n => typeof n === 'number' && !isNaN(n));

  if (!shouldRender) {
    return null;
  }

  const distance = Math.sqrt(
    Math.pow(endPoint[0] - startPoint[0], 2) +
    Math.pow(endPoint[1] - startPoint[1], 2) +
    Math.pow(endPoint[2] - startPoint[2], 2)
  );

  const midPoint: [number, number, number] = [
    (startPoint[0] + endPoint[0]) / 2,
    (startPoint[1] + endPoint[1]) / 2 + 0.3,
    (startPoint[2] + endPoint[2]) / 2
  ];

  return (
    <group>
      <Sphere args={[0.05]} position={startPoint}>
        <meshStandardMaterial color="#ff0000" />
      </Sphere>
      <Sphere args={[0.05]} position={endPoint}>
        <meshStandardMaterial color="#ff0000" />
      </Sphere>
      <Text
        position={midPoint}
        fontSize={0.2}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        {distance.toFixed(2)}m
      </Text>
    </group>
  );
}

const Enhanced3DPropertyViewer: React.FC<Enhanced3DPropertyViewerProps> = ({
  property,
  threeDModelUrl,
  virtualTourUrl,
  isFullscreen = false,
  onFullscreenToggle
}) => {
  const [activeTab, setActiveTab] = useState("3d-model");
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([8, 6, 8]);
  const [modelScale, setModelScale] = useState([1]);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);

  // Ensure camera position is always valid
  const validCameraPosition: [number, number, number] = cameraPosition && cameraPosition.length === 3 
    ? cameraPosition 
    : [8, 6, 8];
  
  // Ensure model scale is always valid
  const validModelScale = modelScale && modelScale.length > 0 && typeof modelScale[0] === 'number' 
    ? modelScale[0] 
    : 1;

  const resetCamera = () => {
    setCameraPosition([8, 6, 8]);
    setModelScale([1]);
  };

  const handleScreenshot = () => {
    // Implementation for taking screenshot
    console.log('Taking screenshot...');
  };

  const handleShare = () => {
    // Implementation for sharing 3D view
    console.log('Sharing 3D view...');
  };

  return (
    <Card className={`w-full glass-card border-glass-border overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl'}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
              <BoxIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-semibold">3D Property Experience</span>
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary">Interactive</Badge>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleScreenshot} className="glass-effect">
              <Camera className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="glass-effect">
              <Share2 className="h-4 w-4" />
            </Button>
            {onFullscreenToggle && (
              <Button variant="outline" size="sm" onClick={onFullscreenToggle} className="glass-effect">
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pb-4 pt-4 bg-muted/30">
            <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm p-1 rounded-xl border border-border/50">
              <TabsTrigger value="3d-model" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">3D Model</TabsTrigger>
              <TabsTrigger value="virtual-tour" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Virtual Tour</TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">3D Tools</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="3d-model" className="m-0">
            <div className={`${isFullscreen ? 'h-screen' : 'h-96'} relative bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-900 dark:to-slate-800`}>
              <Canvas 
                camera={{ position: validCameraPosition, fov: 50 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
              >
                <Suspense fallback={null}>
                  <OrbitControls 
                    enablePan={true} 
                    enableZoom={true} 
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={20}
                  />
                  
                  {/* Lighting */}
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1}
                    castShadow={false}
                  />
                  
                  {/* 3D Model */}
                  <HouseModel scale={validModelScale} />
                  
                  {/* Ground */}
                  <Box args={[20, 0.1, 20]} position={[0, -0.05, 0]}>
                    <meshStandardMaterial color="#90EE90" />
                  </Box>
                  
                  {/* Measurement Tool */}
                  {showMeasurements && <MeasurementTool />}
                  
                </Suspense>
              </Canvas>
              
              {/* 3D Controls Overlay */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={resetCamera}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowMeasurements(!showMeasurements)}
                    className={showMeasurements ? 'bg-blue-100' : ''}
                  >
                    <Ruler className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowWireframe(!showWireframe)}
                    className={showWireframe ? 'bg-blue-100' : ''}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium">Scale</div>
                  <Slider
                    value={modelScale}
                    onValueChange={(value) => setModelScale(value)}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-24"
                  />
                </div>
              </div>
              
              {/* Property Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Bedrooms:</span>
                    <span>{property.bedrooms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bathrooms:</span>
                    <span>{property.bathrooms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span>{property.area_sqm || 'N/A'}m²</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="virtual-tour" className="m-0">
            <div className={`${isFullscreen ? 'h-screen' : 'h-96'} bg-gray-100 flex items-center justify-center`}>
              {virtualTourUrl ? (
                <iframe 
                  src={virtualTourUrl} 
                  className="w-full h-full border-0"
                  allow="fullscreen"
                />
              ) : (
                <div className="text-center space-y-4">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Virtual Tour Available Soon</h3>
                    <p className="text-gray-500">Interactive 360° virtual tour coming soon</p>
                  </div>
                  <Button variant="outline">
                    Request Virtual Tour
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tools" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Measurement Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant={showMeasurements ? "default" : "outline"} 
                    className="w-full"
                    onClick={() => setShowMeasurements(!showMeasurements)}
                  >
                    {showMeasurements ? 'Hide' : 'Show'} Distance Measurement
                  </Button>
                  <div className="text-sm text-gray-600">
                    Click two points in the 3D view to measure distance between them.
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    View Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Model Scale</label>
                    <Slider
                      value={modelScale}
                      onValueChange={(value) => setModelScale(value)}
                      max={3}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">Current: {validModelScale}x</div>
                  </div>
                  
                  <Button variant="outline" className="w-full" onClick={resetCamera}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset View
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Capture & Share
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={handleScreenshot}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Screenshot
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share 3D View
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Move className="h-5 w-5" />
                    Navigation Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Rotate:</strong> Left click + drag</div>
                  <div><strong>Zoom:</strong> Mouse wheel or right click + drag</div>
                  <div><strong>Pan:</strong> Middle click + drag</div>
                  <div><strong>Reset:</strong> Double click</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Enhanced3DPropertyViewer;