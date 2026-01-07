import { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Box, Eye, ExternalLink, CheckCircle, AlertCircle, 
  Loader2, HelpCircle, Video, MapPin, Sparkles 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Virtual3DStepProps {
  formData: {
    virtual_tour_url?: string;
    three_d_model_url?: string;
    [key: string]: any;
  };
  onUpdate: (field: string, value: any) => void;
}

type Platform = 'matterport' | 'sketchfab' | 'kuula' | 'generic' | 'unknown';

interface ValidationResult {
  isValid: boolean;
  platform: Platform;
  message: string;
}

const Virtual3DStep = ({ formData, onUpdate }: Virtual3DStepProps) => {
  const [activeTab, setActiveTab] = useState<'virtual-tour' | '3d-model'>('virtual-tour');
  const [isValidating, setIsValidating] = useState(false);
  const [tourValidation, setTourValidation] = useState<ValidationResult | null>(null);
  const [modelValidation, setModelValidation] = useState<ValidationResult | null>(null);

  const detectPlatform = useCallback((url: string): Platform => {
    if (!url) return 'unknown';
    if (url.includes('matterport.com') || url.includes('my.matterport.com')) return 'matterport';
    if (url.includes('sketchfab.com')) return 'sketchfab';
    if (url.includes('kuula.co')) return 'kuula';
    if (url.startsWith('http')) return 'generic';
    return 'unknown';
  }, []);

  const validateUrl = useCallback(async (url: string, type: 'tour' | 'model'): Promise<ValidationResult> => {
    if (!url || url.trim() === '') {
      return { isValid: false, platform: 'unknown', message: 'No URL provided' };
    }

    const platform = detectPlatform(url);
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return { isValid: false, platform: 'unknown', message: 'Invalid URL format' };
    }

    // Platform-specific validation
    switch (platform) {
      case 'matterport':
        const matterportId = url.match(/m=([^&]+)/)?.[1] || url.match(/\/show\/([^/?]+)/)?.[1];
        if (!matterportId) {
          return { isValid: false, platform, message: 'Invalid Matterport URL. Expected format: https://my.matterport.com/show/?m=YOUR_ID' };
        }
        return { isValid: true, platform, message: 'Valid Matterport tour URL' };

      case 'sketchfab':
        const sketchfabId = url.match(/models\/([^/?]+)/)?.[1] || url.match(/sketchfab\.com\/3d-models\/[^\/]+-([a-f0-9]+)/)?.[1];
        if (!sketchfabId) {
          return { isValid: false, platform, message: 'Invalid Sketchfab URL. Use the embed URL from Sketchfab.' };
        }
        return { isValid: true, platform, message: 'Valid Sketchfab model URL' };

      case 'kuula':
        const kuulaId = url.match(/share\/([^/?]+)/)?.[1] || url.match(/post\/([^/?]+)/)?.[1];
        if (!kuulaId) {
          return { isValid: false, platform, message: 'Invalid Kuula URL. Expected format: https://kuula.co/share/YOUR_ID' };
        }
        return { isValid: true, platform, message: 'Valid Kuula 360° tour URL' };

      case 'generic':
        return { isValid: true, platform, message: 'URL format accepted' };

      default:
        return { isValid: false, platform: 'unknown', message: 'Unsupported platform or invalid URL' };
    }
  }, [detectPlatform]);

  const handleTourUrlChange = async (url: string) => {
    onUpdate('virtual_tour_url', url);
    
    if (url.trim()) {
      setIsValidating(true);
      const result = await validateUrl(url, 'tour');
      setTourValidation(result);
      setIsValidating(false);
    } else {
      setTourValidation(null);
    }
  };

  const handleModelUrlChange = async (url: string) => {
    onUpdate('three_d_model_url', url);
    
    if (url.trim()) {
      setIsValidating(true);
      const result = await validateUrl(url, 'model');
      setModelValidation(result);
      setIsValidating(false);
    } else {
      setModelValidation(null);
    }
  };

  const getPlatformInfo = (platform: Platform) => {
    const info = {
      matterport: { 
        name: 'Matterport', 
        color: 'bg-red-500/10 text-red-500 border-red-500/30',
        icon: '🏠',
        description: 'Premium 3D virtual tours with dollhouse view'
      },
      sketchfab: { 
        name: 'Sketchfab', 
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
        icon: '🎮',
        description: 'Interactive 3D models with annotations'
      },
      kuula: { 
        name: 'Kuula 360°', 
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
        icon: '📷',
        description: '360° photo tours and panoramas'
      },
      generic: { 
        name: '3D View', 
        color: 'bg-muted text-muted-foreground border-border',
        icon: '🔗',
        description: 'Custom embed URL'
      },
      unknown: { 
        name: 'Unknown', 
        color: 'bg-muted text-muted-foreground border-border',
        icon: '❓',
        description: 'Enter a valid URL'
      }
    };
    return info[platform];
  };

  const renderUrlInput = (
    type: 'tour' | 'model',
    value: string | undefined,
    onChange: (url: string) => void,
    validation: ValidationResult | null,
    placeholder: string,
    helpText: string
  ) => (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${
            validation?.isValid === true 
              ? 'border-emerald-500/50 focus:border-emerald-500' 
              : validation?.isValid === false 
                ? 'border-destructive/50 focus:border-destructive'
                : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : validation?.isValid === true ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : validation?.isValid === false ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : null}
        </div>
      </div>
      
      {validation && (
        <Alert className={`py-2 ${validation.isValid ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-destructive/30 bg-destructive/5'}`}>
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription className={`text-sm ${validation.isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>
              {validation.message}
            </AlertDescription>
            {validation.platform !== 'unknown' && (
              <Badge className={`ml-auto ${getPlatformInfo(validation.platform).color}`}>
                {getPlatformInfo(validation.platform).icon} {getPlatformInfo(validation.platform).name}
              </Badge>
            )}
          </div>
        </Alert>
      )}
      
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <HelpCircle className="h-3 w-3" />
        {helpText}
      </p>
    </div>
  );

  const renderPreview = (url: string | undefined, type: 'tour' | 'model') => {
    if (!url) return null;
    
    const platform = detectPlatform(url);
    const platformInfo = getPlatformInfo(platform);
    
    return (
      <Card className="overflow-hidden border-border/50">
        <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted relative flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center text-3xl border border-primary/20">
              {platformInfo.icon}
            </div>
            <div>
              <Badge className={`${platformInfo.color} mb-2`}>
                {platformInfo.name}
              </Badge>
              <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                {platformInfo.description}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-3 right-3 gap-2"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">3D & Virtual Tours</h3>
            <p className="text-sm text-muted-foreground">Add immersive 3D experiences to your property</p>
          </div>
          <Badge variant="outline" className="ml-auto">Optional</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'virtual-tour' | '3d-model')}>
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

        <TabsContent value="virtual-tour" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="virtual-tour-url" className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Virtual Tour URL
            </Label>
            {renderUrlInput(
              'tour',
              formData.virtual_tour_url,
              handleTourUrlChange,
              tourValidation,
              'https://my.matterport.com/show/?m=...',
              'Supports Matterport, Kuula 360°, and other virtual tour platforms'
            )}
          </div>
          
          {renderPreview(formData.virtual_tour_url, 'tour')}
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Supported Virtual Tour Platforms
              </h4>
              <div className="grid gap-2">
                {[
                  { platform: 'matterport' as Platform, example: 'my.matterport.com/show/?m=...' },
                  { platform: 'kuula' as Platform, example: 'kuula.co/share/...' },
                ].map(({ platform, example }) => {
                  const info = getPlatformInfo(platform);
                  return (
                    <div key={platform} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                      <span className="text-lg">{info.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{info.name}</p>
                        <p className="text-xs text-muted-foreground">{example}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3d-model" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="3d-model-url" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              3D Model URL
            </Label>
            {renderUrlInput(
              'model',
              formData.three_d_model_url,
              handleModelUrlChange,
              modelValidation,
              'https://sketchfab.com/models/...',
              'Supports Sketchfab, Matterport, and other 3D model platforms'
            )}
          </div>
          
          {renderPreview(formData.three_d_model_url, 'model')}
          
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Box className="h-4 w-4 text-blue-500" />
                Supported 3D Model Platforms
              </h4>
              <div className="grid gap-2">
                {[
                  { platform: 'sketchfab' as Platform, example: 'sketchfab.com/models/...' },
                  { platform: 'matterport' as Platform, example: 'my.matterport.com/show/?m=...' },
                ].map(({ platform, example }) => {
                  const info = getPlatformInfo(platform);
                  return (
                    <div key={platform} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                      <span className="text-lg">{info.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{info.name}</p>
                        <p className="text-xs text-muted-foreground">{example}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tips for Better 3D Tours
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use Matterport for professional real estate virtual tours
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Kuula is great for 360° photo panoramas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Sketchfab works best for 3D architectural models
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Properties with 3D tours get 3x more engagement
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Virtual3DStep;
