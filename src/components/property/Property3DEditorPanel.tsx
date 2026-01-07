import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  ExternalLink, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Play,
  Settings,
  Palette,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Property3DEditorPanelProps {
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  onModelUrlChange: (url: string) => void;
  onTourUrlChange: (url: string) => void;
}

type Platform = 'matterport' | 'sketchfab' | 'kuula' | 'unknown';

const Property3DEditorPanel: React.FC<Property3DEditorPanelProps> = ({
  threeDModelUrl,
  virtualTourUrl,
  onModelUrlChange,
  onTourUrlChange
}) => {
  const [activeTab, setActiveTab] = useState("3d-model");
  const [modelUrlInput, setModelUrlInput] = useState(threeDModelUrl || '');
  const [tourUrlInput, setTourUrlInput] = useState(virtualTourUrl || '');

  // Detect platform from URL
  const detectPlatform = (url: string): Platform => {
    if (!url) return 'unknown';
    if (url.includes('matterport.com') || url.includes('my.matterport')) return 'matterport';
    if (url.includes('sketchfab.com')) return 'sketchfab';
    if (url.includes('kuula.co')) return 'kuula';
    return 'unknown';
  };

  const modelPlatform = detectPlatform(modelUrlInput);
  const tourPlatform = detectPlatform(tourUrlInput);

  // Validate URL
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleModelUrlSave = () => {
    if (isValidUrl(modelUrlInput)) {
      onModelUrlChange(modelUrlInput);
    }
  };

  const handleTourUrlSave = () => {
    if (isValidUrl(tourUrlInput)) {
      onTourUrlChange(tourUrlInput);
    }
  };

  const platformInfo: Record<Platform, { name: string; color: string; icon: string }> = {
    matterport: { name: 'Matterport', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '🏠' },
    sketchfab: { name: 'Sketchfab', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '📦' },
    kuula: { name: 'Kuula 360°', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🔮' },
    unknown: { name: 'Generic', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: '🔗' }
  };

  return (
    <Card className="glass-card border-glass-border overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-navy-primary/80 to-navy-secondary/80 border-b border-glass-border">
        <CardTitle className="flex items-center gap-3 text-text-light">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-primary/30 to-gold-secondary/20 flex items-center justify-center border border-gold-primary/20">
            <Box className="h-5 w-5 text-gold-primary" />
          </div>
          <div>
            <span className="text-lg font-semibold">3D Experience Settings</span>
            <Badge variant="outline" className="ml-2 text-xs border-gold-primary/30 text-gold-primary">
              Optional
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 py-3 bg-navy-primary/30 border-b border-glass-border">
            <TabsList className="grid w-full grid-cols-2 bg-navy-secondary/50 p-1 rounded-xl">
              <TabsTrigger 
                value="3d-model" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg"
              >
                <Box className="h-4 w-4" />
                3D Model
              </TabsTrigger>
              <TabsTrigger 
                value="virtual-tour" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg"
              >
                <Eye className="h-4 w-4" />
                Virtual Tour
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="3d-model" className="m-0 p-4 space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="model-url" className="text-text-light flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gold-primary" />
                3D Model URL
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="model-url"
                    value={modelUrlInput}
                    onChange={(e) => setModelUrlInput(e.target.value)}
                    placeholder="https://sketchfab.com/models/..."
                    className="glass-input pr-10"
                  />
                  {modelUrlInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidUrl(modelUrlInput) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleModelUrlSave}
                  disabled={!isValidUrl(modelUrlInput)}
                  className="bg-gradient-to-r from-gold-primary to-gold-secondary text-dark-bg hover:opacity-90"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Supports Sketchfab embeds, GLB files, or other 3D model URLs
              </p>
            </div>

            {/* Platform Detection */}
            {modelUrlInput && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-text-muted">Detected:</span>
                <Badge className={platformInfo[modelPlatform].color}>
                  {platformInfo[modelPlatform].icon} {platformInfo[modelPlatform].name}
                </Badge>
              </motion.div>
            )}

            {/* Preview */}
            {threeDModelUrl && isValidUrl(threeDModelUrl) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect rounded-xl p-4 border border-glass-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-light flex items-center gap-2">
                    <Play className="h-4 w-4 text-gold-primary" />
                    Preview
                  </span>
                  <Button variant="ghost" size="sm" asChild className="text-gold-primary hover:text-gold-secondary">
                    <a href={threeDModelUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </a>
                  </Button>
                </div>
                <div className="aspect-video bg-navy-secondary/50 rounded-lg border border-glass-border flex items-center justify-center overflow-hidden">
                  <iframe
                    src={threeDModelUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="glass-effect rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
              <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                How to add 3D models
              </h4>
              <ul className="text-sm text-blue-200/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Upload to Sketchfab and get embed URL
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Use Matterport virtual tours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Upload GLB/GLTF files to cloud storage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Create with tools like Blender or SketchUp
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="virtual-tour" className="m-0 p-4 space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="tour-url" className="text-text-light flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gold-primary" />
                Virtual Tour URL
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="tour-url"
                    value={tourUrlInput}
                    onChange={(e) => setTourUrlInput(e.target.value)}
                    placeholder="https://my.matterport.com/show/..."
                    className="glass-input pr-10"
                  />
                  {tourUrlInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidUrl(tourUrlInput) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleTourUrlSave}
                  disabled={!isValidUrl(tourUrlInput)}
                  className="bg-gradient-to-r from-gold-primary to-gold-secondary text-dark-bg hover:opacity-90"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Supports Matterport, Kuula, or other 360° tour platforms
              </p>
            </div>

            {/* Platform Detection */}
            {tourUrlInput && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-text-muted">Detected:</span>
                <Badge className={platformInfo[tourPlatform].color}>
                  {platformInfo[tourPlatform].icon} {platformInfo[tourPlatform].name}
                </Badge>
              </motion.div>
            )}

            {/* Preview */}
            {virtualTourUrl && isValidUrl(virtualTourUrl) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect rounded-xl p-4 border border-glass-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-light flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gold-primary" />
                    Tour Preview
                  </span>
                  <Button variant="ghost" size="sm" asChild className="text-gold-primary hover:text-gold-secondary">
                    <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Take Tour
                    </a>
                  </Button>
                </div>
                <div className="aspect-video bg-navy-secondary/50 rounded-lg border border-glass-border flex items-center justify-center overflow-hidden">
                  <iframe
                    src={virtualTourUrl}
                    className="w-full h-full border-0"
                    allow="fullscreen; vr"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="glass-effect rounded-xl p-4 border border-green-500/20 bg-green-500/5">
              <h4 className="font-medium text-green-300 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Virtual tour options
              </h4>
              <ul className="text-sm text-green-200/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Matterport 3D virtual tours (recommended)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Kuula 360° photo galleries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Interactive floor plans
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-primary">•</span>
                  Video walkthroughs
                </li>
              </ul>
            </div>

            {/* Supported Platforms */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-effect p-3 rounded-xl text-center border border-red-500/20">
                <div className="text-2xl mb-1">🏠</div>
                <div className="text-xs font-medium text-text-light">Matterport</div>
                <div className="text-[10px] text-text-muted">Best for tours</div>
              </div>
              <div className="glass-effect p-3 rounded-xl text-center border border-purple-500/20">
                <div className="text-2xl mb-1">🔮</div>
                <div className="text-xs font-medium text-text-light">Kuula</div>
                <div className="text-[10px] text-text-muted">360° photos</div>
              </div>
              <div className="glass-effect p-3 rounded-xl text-center border border-blue-500/20">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-xs font-medium text-text-light">Sketchfab</div>
                <div className="text-[10px] text-text-muted">3D models</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Property3DEditorPanel;
