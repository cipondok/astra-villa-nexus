import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Box, ExternalLink, Eye, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface Property3DViewerProps {
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  onModelUrlChange: (url: string) => void;
  onTourUrlChange: (url: string) => void;
}

type Platform = 'matterport' | 'sketchfab' | 'kuula' | 'generic' | 'unknown';

const Property3DViewer = ({
  threeDModelUrl,
  virtualTourUrl,
  onModelUrlChange,
  onTourUrlChange
}: Property3DViewerProps) => {
  const [activeTab, setActiveTab] = useState("3d-model");
  const [isValidating, setIsValidating] = useState(false);
  const [modelValidation, setModelValidation] = useState<{ isValid: boolean; message: string; platform: Platform } | null>(null);
  const [tourValidation, setTourValidation] = useState<{ isValid: boolean; message: string; platform: Platform } | null>(null);

  const detectPlatform = useCallback((url: string): Platform => {
    if (!url) return 'unknown';
    if (url.includes('matterport.com')) return 'matterport';
    if (url.includes('sketchfab.com')) return 'sketchfab';
    if (url.includes('kuula.co')) return 'kuula';
    if (url.startsWith('http')) return 'generic';
    return 'unknown';
  }, []);

  const validateUrl = useCallback((url: string): { isValid: boolean; message: string; platform: Platform } => {
    if (!url || url.trim() === '') {
      return { isValid: false, platform: 'unknown', message: '' };
    }

    const platform = detectPlatform(url);
    
    try {
      new URL(url);
    } catch {
      return { isValid: false, platform: 'unknown', message: 'Invalid URL format' };
    }

    const messages = {
      matterport: 'Valid Matterport URL detected',
      sketchfab: 'Valid Sketchfab URL detected',
      kuula: 'Valid Kuula 360° URL detected',
      generic: 'URL format accepted',
      unknown: 'Unsupported platform'
    };

    return { isValid: platform !== 'unknown', platform, message: messages[platform] };
  }, [detectPlatform]);

  const handleModelChange = async (url: string) => {
    onModelUrlChange(url);
    if (url.trim()) {
      setIsValidating(true);
      const result = validateUrl(url);
      setModelValidation(result);
      setIsValidating(false);
    } else {
      setModelValidation(null);
    }
  };

  const handleTourChange = async (url: string) => {
    onTourUrlChange(url);
    if (url.trim()) {
      setIsValidating(true);
      const result = validateUrl(url);
      setTourValidation(result);
      setIsValidating(false);
    } else {
      setTourValidation(null);
    }
  };

  const getPlatformBadge = (platform: Platform) => ({
    matterport: { label: 'Matterport', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
    sketchfab: { label: 'Sketchfab', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    kuula: { label: 'Kuula 360°', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
    generic: { label: 'Generic', color: 'bg-muted text-muted-foreground border-border' },
    unknown: { label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' }
  }[platform]);

  const renderUrlPreview = (url: string | undefined, validation: typeof modelValidation, type: 'model' | 'tour') => {
    if (!url) return null;
    
    const platform = detectPlatform(url);
    const badge = getPlatformBadge(platform);
    
    return (
      <div className="border border-border/50 rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{type === 'model' ? '3D Model' : 'Virtual Tour'} Preview</span>
            <Badge className={badge.color}>{badge.label}</Badge>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
          </Button>
        </div>
        <div className="aspect-video bg-gradient-to-br from-background to-muted rounded-lg border border-border/50 flex items-center justify-center">
          <div className="text-center space-y-2 p-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              {type === 'model' ? <Box className="h-6 w-6 text-primary" /> : <Eye className="h-6 w-6 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {type === 'model' ? '3D Model will be embedded here' : 'Virtual tour will be embedded here'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-semibold">3D Experience</span>
            <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="3d-model" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Box className="h-4 w-4" />
              3D Model
            </TabsTrigger>
            <TabsTrigger value="virtual-tour" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Eye className="h-4 w-4" />
              Virtual Tour
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="3d-model" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="model-url" className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground" />
                3D Model URL
              </Label>
              <div className="relative">
                <Input
                  id="model-url"
                  value={threeDModelUrl || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder="https://sketchfab.com/models/... or https://my.matterport.com/..."
                  className={`pr-10 ${
                    modelValidation?.isValid ? 'border-emerald-500/50' : 
                    modelValidation?.isValid === false ? 'border-destructive/50' : ''
                  }`}
                />
                {modelValidation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {modelValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {modelValidation && modelValidation.message && (
                <Alert className={`py-2 ${modelValidation.isValid ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-destructive/30 bg-destructive/5'}`}>
                  <AlertDescription className={`text-sm ${modelValidation.isValid ? 'text-emerald-600' : 'text-destructive'}`}>
                    {modelValidation.message}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Supports Sketchfab, Matterport, GLB files, or other 3D model URLs
              </p>
            </div>

            {renderUrlPreview(threeDModelUrl, modelValidation, 'model')}

            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  How to add 3D models
                </h4>
                <ul className="text-sm text-blue-600/80 dark:text-blue-400/80 space-y-1.5">
                  <li className="flex items-center gap-2">• Upload to Sketchfab and get embed URL</li>
                  <li className="flex items-center gap-2">• Use Matterport 3D virtual tours</li>
                  <li className="flex items-center gap-2">• Upload GLB/GLTF files to cloud storage</li>
                  <li className="flex items-center gap-2">• Create with Blender or SketchUp</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="virtual-tour" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tour-url" className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Virtual Tour URL
              </Label>
              <div className="relative">
                <Input
                  id="tour-url"
                  value={virtualTourUrl || ''}
                  onChange={(e) => handleTourChange(e.target.value)}
                  placeholder="https://my.matterport.com/show/... or https://kuula.co/share/..."
                  className={`pr-10 ${
                    tourValidation?.isValid ? 'border-emerald-500/50' : 
                    tourValidation?.isValid === false ? 'border-destructive/50' : ''
                  }`}
                />
                {tourValidation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {tourValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {tourValidation && tourValidation.message && (
                <Alert className={`py-2 ${tourValidation.isValid ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-destructive/30 bg-destructive/5'}`}>
                  <AlertDescription className={`text-sm ${tourValidation.isValid ? 'text-emerald-600' : 'text-destructive'}`}>
                    {tourValidation.message}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Supports Matterport, Kuula, and other 360° tour platforms
              </p>
            </div>

            {renderUrlPreview(virtualTourUrl, tourValidation, 'tour')}

            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Virtual tour options
                </h4>
                <ul className="text-sm text-emerald-600/80 dark:text-emerald-400/80 space-y-1.5">
                  <li className="flex items-center gap-2">• Matterport 3D virtual tours</li>
                  <li className="flex items-center gap-2">• Kuula 360° photo galleries</li>
                  <li className="flex items-center gap-2">• Interactive floor plans</li>
                  <li className="flex items-center gap-2">• Video walkthroughs</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Property3DViewer;
