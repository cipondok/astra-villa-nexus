import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Box, 
  Eye, 
  ExternalLink, 
  Camera, 
  Home,
  Maximize2,
  Play,
  VolumeX,
  Volume2,
  RotateCcw,
  Share2
} from 'lucide-react';
import { BaseProperty } from '@/types/property';

interface SimpleProperty3DViewerProps {
  property: BaseProperty;
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const SimpleProperty3DViewer: React.FC<SimpleProperty3DViewerProps> = ({
  property,
  threeDModelUrl,
  virtualTourUrl,
  isFullscreen = false,
  onFullscreenToggle
}) => {
  const [activeTab, setActiveTab] = useState("virtual-tour");
  const [isMuted, setIsMuted] = useState(true);

  // Sample 3D tour URLs for demo
  const demoTourUrl = virtualTourUrl || "https://my.matterport.com/show/?m=SxQL3iGyoDo";
  const demoModelUrl = threeDModelUrl || "https://sketchfab.com/models/76f0ff8d1c8a4e5a9b9c8c7c3c6c4c1c/embed";

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `IDR ${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `IDR ${(price / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const extractMatterportId = (url: string) => {
    const match = url.match(/m=([^&]+)/);
    return match ? match[1] : null;
  };

  const extractSketchfabId = (url: string) => {
    const match = url.match(/models\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const renderVirtualTour = () => {
    if (!demoTourUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-b from-sky-100 to-blue-50">
          <div className="text-center space-y-4">
            <Eye className="h-16 w-16 text-blue-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Virtual Tour Coming Soon</h3>
              <p className="text-gray-500">Experience this property in immersive 3D</p>
            </div>
            <Button variant="outline">Request Virtual Tour</Button>
          </div>
        </div>
      );
    }

    // Matterport integration
    if (demoTourUrl.includes('matterport.com')) {
      const matterportId = extractMatterportId(demoTourUrl);
      const embedUrl = `https://my.matterport.com/show/?m=${matterportId}&play=1&qs=1&gt=0&hr=0&ts=0`;
      
      return (
        <div className="relative h-full">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 rounded-lg"
            allow="fullscreen; vr"
            allowFullScreen
          />
          {/* Tour Controls Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white/90">
              <Camera className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      );
    }

    // Generic iframe for other tour platforms
    return (
      <iframe
        src={demoTourUrl}
        className="w-full h-full border-0 rounded-lg"
        allow="fullscreen"
        allowFullScreen
      />
    );
  };

  const render3DModel = () => {
    if (!demoModelUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50">
          <div className="text-center space-y-4">
            <Box className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">3D Model Available Soon</h3>
              <p className="text-gray-500">Interactive 3D property model coming soon</p>
            </div>
            <Button variant="outline">Request 3D Model</Button>
          </div>
        </div>
      );
    }

    // Sketchfab integration
    if (demoModelUrl.includes('sketchfab.com')) {
      const sketchfabId = extractSketchfabId(demoModelUrl);
      const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_stop=0&ui_watermark=0`;
      
      return (
        <div className="relative h-full">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 rounded-lg"
            allow="autoplay; fullscreen; vr"
            allowFullScreen
          />
          {/* Model Controls Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <div className="text-xs font-medium mb-1">3D Model Controls</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>🖱️ Drag to rotate</div>
              <div>🔍 Scroll to zoom</div>
              <div>⌨️ Space to pause</div>
            </div>
          </div>
        </div>
      );
    }

    // Generic iframe for other 3D platforms
    return (
      <iframe
        src={demoModelUrl}
        className="w-full h-full border-0 rounded-lg"
        allow="fullscreen"
        allowFullScreen
      />
    );
  };

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Virtual Property Experience
            <Badge variant="outline" className="ml-2">
              {activeTab === 'virtual-tour' ? 'Matterport' : 'Sketchfab'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {onFullscreenToggle && (
              <Button variant="outline" size="sm" onClick={onFullscreenToggle}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="virtual-tour" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Virtual Tour
              </TabsTrigger>
              <TabsTrigger value="3d-model" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                3D Model
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="virtual-tour" className="m-0">
            <div className={`${isFullscreen ? 'h-screen' : 'h-96'} relative`}>
              {renderVirtualTour()}
              
              {/* Property Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 max-w-xs">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <div className="text-sm space-y-1">
                  <div className="font-bold text-primary text-lg">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    {property.bedrooms && (
                      <span>{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    {property.area_sqm && (
                      <span>{property.area_sqm}m²</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="3d-model" className="m-0">
            <div className={`${isFullscreen ? 'h-screen' : 'h-96'} relative`}>
              {render3DModel()}
              
              {/* Model Info Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3">
                <div className="text-xs font-medium mb-2">3D Model Features</div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Box className="h-3 w-3" />
                    Interactive 3D View
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-3 w-3" />
                    HD Textures
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    VR Compatible
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Platform Integration Info */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <h4 className="font-medium mb-1">Matterport Integration</h4>
              <p className="text-gray-600">Professional 3D scans with VR support</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-1">Sketchfab Models</h4>
              <p className="text-gray-600">Interactive architectural 3D models</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-1">Virtual Staging</h4>
              <p className="text-gray-600">AI-powered furniture & decor placement</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleProperty3DViewer;