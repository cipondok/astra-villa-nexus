import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Monitor, Smartphone, Save, RotateCcw, Eye, EyeOff,
  Layers, Sparkles, Box, Image as ImageIcon, Zap, 
  SunMedium, Palette, Move3D, Wind, Upload, Trash2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import slideHero1 from '@/assets/home/slide-hero-1.png';
import slideHero2 from '@/assets/home/slide-hero-2.png';
import slideHero3 from '@/assets/home/slide-hero-3.png';
import slideHero4 from '@/assets/home/slide-hero-4.png';
import slideHero5 from '@/assets/home/slide-hero-5.png';
import slideHero6 from '@/assets/home/slide-hero-6.png';
import slideHero7 from '@/assets/home/slide-hero-7.png';

const DEFAULT_BANNER_IMAGES = [slideHero1, slideHero2, slideHero3, slideHero4, slideHero5, slideHero6, slideHero7];

interface HeroSliderConfig {
  // Banner images (URLs from storage)
  bannerImages: string[];
  sliderHeight: number; // px
  sliderMinHeight: number; // px
  sliderMaxHeight: number; // px
  autoSlideInterval: number; // seconds
  
  // Image settings
  backgroundImage: string;
  imageBrightness: number;
  imageSaturation: number;
  imageBlur: number;

  // Animation settings
  enableEntryAnimation: boolean;
  entryAnimationType: 'fade' | 'slide-up' | 'zoom' | 'parallax';
  entryAnimationDuration: number;
  enableParallax: boolean;
  parallaxIntensity: number;

  // 3D effects
  enable3DEffect: boolean;
  enable3DTilt: boolean;
  tiltIntensity: number;
  enableDepthLayers: boolean;
  depthLayerCount: number;
  enableParticles: boolean;
  particleCount: number;
  particleColor: string;

  // Overlay settings
  enableGradientOverlay: boolean;
  gradientOpacity: number;
  enablePrimaryTint: boolean;
  primaryTintOpacity: number;

  // Advanced
  enableFloatingElements: boolean;
  floatingElementSpeed: number;
  enableGlowEffect: boolean;
  glowIntensity: number;
}

const defaultConfig: HeroSliderConfig = {
  bannerImages: [],
  sliderHeight: 550,
  sliderMinHeight: 400,
  sliderMaxHeight: 650,
  autoSlideInterval: 5,
  backgroundImage: '',
  imageBrightness: 110,
  imageSaturation: 110,
  imageBlur: 0,
  enableEntryAnimation: true,
  entryAnimationType: 'fade',
  entryAnimationDuration: 800,
  enableParallax: false,
  parallaxIntensity: 30,
  enable3DEffect: false,
  enable3DTilt: false,
  tiltIntensity: 15,
  enableDepthLayers: false,
  depthLayerCount: 3,
  enableParticles: false,
  particleCount: 30,
  particleColor: 'primary',
  enableGradientOverlay: true,
  gradientOpacity: 40,
  enablePrimaryTint: true,
  primaryTintOpacity: 5,
  enableFloatingElements: false,
  floatingElementSpeed: 3,
  enableGlowEffect: false,
  glowIntensity: 20,
};

const HeroSliderSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<HeroSliderConfig>(defaultConfig);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved settings
  const { data: savedConfig, isLoading } = useQuery({
    queryKey: ['hero-slider-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'hero_slider_config')
        .maybeSingle();
      if (error) throw error;
      return data?.value ? JSON.parse(data.value as string) as HeroSliderConfig : null;
    },
  });

  useEffect(() => {
    if (savedConfig) {
      setConfig({ ...defaultConfig, ...savedConfig });
    }
  }, [savedConfig]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newConfig: HeroSliderConfig) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'hero_slider_config',
          value: JSON.stringify(newConfig),
          category: 'hero_slider',
          description: 'Hero slider animation and 3D effect settings',
          is_public: true,
        }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slider-config'] });
      toast.success('Hero slider settings saved!');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const updateConfig = <K extends keyof HeroSliderConfig>(key: K, value: HeroSliderConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast.info('Settings reset to defaults');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setUploading(true);
    try {
      const fileName = `banner-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('hero-banners')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('hero-banners')
        .getPublicUrl(fileName);
      
      const newImages = [...(config.bannerImages || []), urlData.publicUrl];
      updateConfig('bannerImages', newImages);
      toast.success('Banner image uploaded!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveBanner = async (index: number) => {
    const url = config.bannerImages[index];
    // Extract file name from URL
    const parts = url.split('/hero-banners/');
    if (parts[1]) {
      await supabase.storage.from('hero-banners').remove([parts[1]]);
    }
    const newImages = config.bannerImages.filter((_, i) => i !== index);
    updateConfig('bannerImages', newImages);
    toast.success('Banner removed');
  };

  // Compute preview styles dynamically
  const previewImageStyle: React.CSSProperties = {
    filter: `brightness(${config.imageBrightness}%) saturate(${config.imageSaturation}%) blur(${config.imageBlur}px)`,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Hero Slider Settings
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure homepage hero animations, 3D effects, and image settings with live preview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate(config)} disabled={saveMutation.isPending} className="h-7 text-xs">
            <Save className="h-3 w-3 mr-1" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Controls Panel */}
        <div className="space-y-3 order-2 xl:order-1">

          {/* Banner Images Management */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-primary" /> Banner Images
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              {/* Info box */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-0.5">Recommended Image Size:</p>
                  <p>• Width: <span className="font-mono text-primary">1920px</span></p>
                  <p>• Height: <span className="font-mono text-primary">600–800px</span></p>
                  <p>• Aspect Ratio: <span className="font-mono text-primary">~3:1</span> (landscape)</p>
                  <p>• Format: JPG/PNG, max 5MB</p>
                </div>
              </div>

              {/* Default banner images (shown when no custom banners) */}
              {(!config.bannerImages || config.bannerImages.length === 0) && (
                <div className="space-y-2">
                  <Label className="text-[11px]">Default Slides ({DEFAULT_BANNER_IMAGES.length})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_BANNER_IMAGES.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-border/50 opacity-80">
                        <img src={url} alt={`Default Slide ${index + 1}`} className="w-full h-20 object-cover" />
                        <div className="absolute top-1 left-1">
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-background/70">
                            Default {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Upload custom banners to replace the defaults above.</p>
                </div>
              )}

              {/* Custom uploaded banners */}
              {config.bannerImages && config.bannerImages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[11px]">Custom Banners ({config.bannerImages.length})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.bannerImages.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-primary/30">
                        <img src={url} alt={`Banner ${index + 1}`} className="w-full h-20 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 text-[10px]"
                            onClick={() => handleRemoveBanner(index)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                            Slide {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {uploading ? 'Uploading...' : 'Upload Banner Image'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slider Size Settings */}
          <Card className="border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Move3D className="h-3.5 w-3.5 text-primary" /> Slider Size
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="space-y-2">
                <Label className="text-[11px]">Height ({config.sliderHeight}px)</Label>
                <Slider value={[config.sliderHeight]} onValueChange={([v]) => updateConfig('sliderHeight', v)} min={200} max={800} step={10} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Min Height ({config.sliderMinHeight}px)</Label>
                <Slider value={[config.sliderMinHeight]} onValueChange={([v]) => updateConfig('sliderMinHeight', v)} min={150} max={500} step={10} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Max Height ({config.sliderMaxHeight}px)</Label>
                <Slider value={[config.sliderMaxHeight]} onValueChange={([v]) => updateConfig('sliderMaxHeight', v)} min={400} max={1000} step={10} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Auto-Slide Interval ({config.autoSlideInterval}s)</Label>
                <Slider value={[config.autoSlideInterval]} onValueChange={([v]) => updateConfig('autoSlideInterval', v)} min={2} max={15} step={1} />
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground">
                  Height uses <span className="font-mono">clamp(minHeight, height, maxHeight)</span> for responsive sizing.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-primary" /> Image Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Brightness ({config.imageBrightness}%)</Label>
                </div>
                <Slider value={[config.imageBrightness]} onValueChange={([v]) => updateConfig('imageBrightness', v)} min={50} max={150} step={5} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Saturation ({config.imageSaturation}%)</Label>
                <Slider value={[config.imageSaturation]} onValueChange={([v]) => updateConfig('imageSaturation', v)} min={50} max={200} step={5} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px]">Blur ({config.imageBlur}px)</Label>
                <Slider value={[config.imageBlur]} onValueChange={([v]) => updateConfig('imageBlur', v)} min={0} max={20} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Animation Settings */}
          <Card className="border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-chart-3" /> Animation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[11px]">Entry Animation</Label>
                <Switch checked={config.enableEntryAnimation} onCheckedChange={(v) => updateConfig('enableEntryAnimation', v)} />
              </div>
              {config.enableEntryAnimation && (
                <>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Animation Type</Label>
                    <Select value={config.entryAnimationType} onValueChange={(v) => updateConfig('entryAnimationType', v as HeroSliderConfig['entryAnimationType'])}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade In</SelectItem>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="zoom">Zoom In</SelectItem>
                        <SelectItem value="parallax">Parallax Reveal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Duration ({config.entryAnimationDuration}ms)</Label>
                    <Slider value={[config.entryAnimationDuration]} onValueChange={([v]) => updateConfig('entryAnimationDuration', v)} min={200} max={2000} step={100} />
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-[11px]">Parallax Scroll</Label>
                <Switch checked={config.enableParallax} onCheckedChange={(v) => updateConfig('enableParallax', v)} />
              </div>
              {config.enableParallax && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Parallax Intensity ({config.parallaxIntensity}%)</Label>
                  <Slider value={[config.parallaxIntensity]} onValueChange={([v]) => updateConfig('parallaxIntensity', v)} min={10} max={80} step={5} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Effects */}
          <Card className="border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Box className="h-3.5 w-3.5 text-accent-foreground" /> 3D Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px]">3D Tilt Effect</Label>
                  <p className="text-[10px] text-muted-foreground">Mouse-follow perspective tilt</p>
                </div>
                <Switch checked={config.enable3DTilt} onCheckedChange={(v) => updateConfig('enable3DTilt', v)} />
              </div>
              {config.enable3DTilt && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Tilt Intensity ({config.tiltIntensity}°)</Label>
                  <Slider value={[config.tiltIntensity]} onValueChange={([v]) => updateConfig('tiltIntensity', v)} min={5} max={30} step={1} />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px]">Depth Layers</Label>
                  <p className="text-[10px] text-muted-foreground">Layered parallax depth effect</p>
                </div>
                <Switch checked={config.enableDepthLayers} onCheckedChange={(v) => updateConfig('enableDepthLayers', v)} />
              </div>
              {config.enableDepthLayers && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Layer Count ({config.depthLayerCount})</Label>
                  <Slider value={[config.depthLayerCount]} onValueChange={([v]) => updateConfig('depthLayerCount', v)} min={2} max={5} step={1} />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px]">Floating Particles</Label>
                  <p className="text-[10px] text-muted-foreground">Ambient floating light particles</p>
                </div>
                <Switch checked={config.enableParticles} onCheckedChange={(v) => updateConfig('enableParticles', v)} />
              </div>
              {config.enableParticles && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Particle Count ({config.particleCount})</Label>
                  <Slider value={[config.particleCount]} onValueChange={([v]) => updateConfig('particleCount', v)} min={10} max={100} step={5} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlay & Glow */}
          <Card className="border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-chart-1" /> Overlay & Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[11px]">Gradient Overlay</Label>
                <Switch checked={config.enableGradientOverlay} onCheckedChange={(v) => updateConfig('enableGradientOverlay', v)} />
              </div>
              {config.enableGradientOverlay && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Overlay Opacity ({config.gradientOpacity}%)</Label>
                  <Slider value={[config.gradientOpacity]} onValueChange={([v]) => updateConfig('gradientOpacity', v)} min={0} max={80} step={5} />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-[11px]">Primary Color Tint</Label>
                <Switch checked={config.enablePrimaryTint} onCheckedChange={(v) => updateConfig('enablePrimaryTint', v)} />
              </div>
              {config.enablePrimaryTint && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Tint Opacity ({config.primaryTintOpacity}%)</Label>
                  <Slider value={[config.primaryTintOpacity]} onValueChange={([v]) => updateConfig('primaryTintOpacity', v)} min={0} max={30} step={1} />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px]">Glow Effect</Label>
                  <p className="text-[10px] text-muted-foreground">Ambient glow around hero</p>
                </div>
                <Switch checked={config.enableGlowEffect} onCheckedChange={(v) => updateConfig('enableGlowEffect', v)} />
              </div>
              {config.enableGlowEffect && (
                <div className="space-y-1">
                  <Label className="text-[11px]">Glow Intensity ({config.glowIntensity}%)</Label>
                  <Slider value={[config.glowIntensity]} onValueChange={([v]) => updateConfig('glowIntensity', v)} min={5} max={50} step={5} />
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px]">Floating Elements</Label>
                  <p className="text-[10px] text-muted-foreground">Slowly drifting decorative shapes</p>
                </div>
                <Switch checked={config.enableFloatingElements} onCheckedChange={(v) => updateConfig('enableFloatingElements', v)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="order-1 xl:order-2 xl:sticky xl:top-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] h-5">
                <Eye className="h-3 w-3 mr-1" /> Live Preview
              </Badge>
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm" className="h-6 w-6 p-0"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm" className="h-6 w-6 p-0"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="h-3 w-3" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showPreview ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showPreview && (
            <Card className="border-border/50 overflow-hidden">
              <div className={cn(
                "relative bg-background overflow-hidden transition-all duration-500",
                previewDevice === 'desktop' ? 'aspect-video' : 'aspect-[9/16] max-w-[220px] mx-auto'
              )}>
                {/* Background Image */}
                <img
                  src={config.bannerImages?.[0] || DEFAULT_BANNER_IMAGES[0]}
                  alt="Hero preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={previewImageStyle}
                />

                {/* Gradient overlay */}
                {config.enableGradientOverlay && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" style={{ opacity: config.gradientOpacity / 100 }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-background/90 pointer-events-none dark:from-black/40" style={{ opacity: config.gradientOpacity / 100 }} />
                  </>
                )}

                {/* Primary tint */}
                {config.enablePrimaryTint && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-primary pointer-events-none" style={{ opacity: config.primaryTintOpacity / 100 }} />
                )}

                {/* Glow effect */}
                {config.enableGlowEffect && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `radial-gradient(ellipse at center, hsl(var(--primary) / ${config.glowIntensity / 100}), transparent 70%)`,
                  }} />
                )}

                {/* Particles preview */}
                {config.enableParticles && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: Math.min(config.particleCount, 20) }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-primary/60 animate-pulse"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Floating elements preview */}
                {config.enableFloatingElements && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="absolute w-8 h-8 rounded-full border border-primary/20 bg-primary/5 animate-pulse"
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${30 + (i % 2) * 20}%`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: `${3 + i}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 3D tilt indicator */}
                {config.enable3DTilt && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="text-[8px] h-4 bg-chart-5/80 text-primary-foreground border-0">
                      <Move3D className="h-2.5 w-2.5 mr-0.5" /> 3D Tilt
                    </Badge>
                  </div>
                )}

                {/* Depth layers indicator */}
                {config.enableDepthLayers && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="text-[8px] h-4 bg-chart-1/80 text-primary-foreground border-0">
                      <Layers className="h-2.5 w-2.5 mr-0.5" /> {config.depthLayerCount} Layers
                    </Badge>
                  </div>
                )}

                {/* Entry animation indicator */}
                {config.enableEntryAnimation && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <Badge className="text-[8px] h-4 bg-chart-3/80 text-primary-foreground border-0">
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> {config.entryAnimationType} ({config.entryAnimationDuration}ms)
                    </Badge>
                  </div>
                )}

                {/* Parallax indicator */}
                {config.enableParallax && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <Badge className="text-[8px] h-4 bg-chart-4/80 text-primary-foreground border-0">
                      <Wind className="h-2.5 w-2.5 mr-0.5" /> Parallax
                    </Badge>
                  </div>
                )}

                {/* Sample content overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center space-y-1">
                    <div className="text-primary-foreground font-bold text-sm drop-shadow-lg">ASTRA Villa</div>
                    <div className="text-primary-foreground/80 text-[10px] drop-shadow">Premium Real Estate</div>
                  </div>
                </div>
              </div>

              {/* Active effects summary */}
              <div className="p-2 bg-muted/30 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground mb-1">Active Effects:</p>
                <div className="flex flex-wrap gap-1">
                  {config.enableEntryAnimation && <Badge variant="secondary" className="text-[9px] h-4">{config.entryAnimationType}</Badge>}
                  {config.enableParallax && <Badge variant="secondary" className="text-[9px] h-4">Parallax</Badge>}
                  {config.enable3DTilt && <Badge variant="secondary" className="text-[9px] h-4">3D Tilt</Badge>}
                  {config.enableDepthLayers && <Badge variant="secondary" className="text-[9px] h-4">Depth</Badge>}
                  {config.enableParticles && <Badge variant="secondary" className="text-[9px] h-4">Particles</Badge>}
                  {config.enableGradientOverlay && <Badge variant="secondary" className="text-[9px] h-4">Gradient</Badge>}
                  {config.enableGlowEffect && <Badge variant="secondary" className="text-[9px] h-4">Glow</Badge>}
                  {config.enableFloatingElements && <Badge variant="secondary" className="text-[9px] h-4">Float</Badge>}
                  {!config.enableEntryAnimation && !config.enableParallax && !config.enable3DTilt && !config.enableParticles && !config.enableGlowEffect && (
                    <span className="text-[10px] text-muted-foreground italic">No effects active</span>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSliderSettings;
