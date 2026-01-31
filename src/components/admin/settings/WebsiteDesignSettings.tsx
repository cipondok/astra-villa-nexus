import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Palette, 
  Moon, 
  Sun, 
  Type, 
  Sparkles, 
  Layout, 
  Save, 
  RotateCcw,
  Monitor,
  Smartphone,
  Eye,
  Zap,
  Box,
  MessageSquare,
  Bell,
  MousePointer
} from 'lucide-react';

interface ColorConfig {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  ring: string;
}

interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseFontSize: string;
  headingScale: number;
}

interface AnimationConfig {
  enabled: boolean;
  reducedMotion: boolean;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easing: string;
  hoverScale: number;
  fadeInDuration: string;
}

interface ComponentConfig {
  borderRadius: string;
  shadowIntensity: string;
  glassmorphism: boolean;
  buttonSize: 'sm' | 'default' | 'lg';
  toastPosition: string;
  toastDuration: number;
  modalAnimation: string;
  modalBackdropBlur: boolean;
}

const defaultLightColors: ColorConfig = {
  background: '0 0% 100%',
  foreground: '224 71% 4%',
  primary: '220 70% 50%',
  primaryForeground: '210 20% 98%',
  secondary: '220 14% 96%',
  secondaryForeground: '220 9% 46%',
  accent: '43 74% 66%',
  accentForeground: '43 74% 15%',
  muted: '220 14% 96%',
  mutedForeground: '220 9% 46%',
  card: '0 0% 100%',
  cardForeground: '224 71% 4%',
  border: '220 13% 91%',
  ring: '220 70% 50%',
};

const defaultDarkColors: ColorConfig = {
  background: '224 71% 4%',
  foreground: '210 20% 98%',
  primary: '217 91% 60%',
  primaryForeground: '220 70% 10%',
  secondary: '215 28% 17%',
  secondaryForeground: '210 20% 98%',
  accent: '43 74% 66%',
  accentForeground: '43 74% 15%',
  muted: '215 28% 17%',
  mutedForeground: '217 10% 64%',
  card: '222 47% 11%',
  cardForeground: '210 20% 98%',
  border: '215 28% 17%',
  ring: '217 91% 60%',
};

const defaultTypography: TypographyConfig = {
  headingFont: 'Playfair Display, serif',
  bodyFont: 'Inter, sans-serif',
  monoFont: 'SF Mono, Consolas, monospace',
  baseFontSize: '16px',
  headingScale: 1.25,
};

const defaultAnimations: AnimationConfig = {
  enabled: true,
  reducedMotion: false,
  durationFast: '150ms',
  durationNormal: '300ms',
  durationSlow: '500ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  hoverScale: 1.05,
  fadeInDuration: '300ms',
};

const defaultComponents: ComponentConfig = {
  borderRadius: '0.5rem',
  shadowIntensity: 'medium',
  glassmorphism: true,
  buttonSize: 'default',
  toastPosition: 'top-right',
  toastDuration: 5000,
  modalAnimation: 'scale',
  modalBackdropBlur: true,
};

const WebsiteDesignSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  const [lightColors, setLightColors] = useState<ColorConfig>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<ColorConfig>(defaultDarkColors);
  const [typography, setTypography] = useState<TypographyConfig>(defaultTypography);
  const [animations, setAnimations] = useState<AnimationConfig>(defaultAnimations);
  const [components, setComponents] = useState<ComponentConfig>(defaultComponents);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'design_light_colors',
          'design_dark_colors',
          'design_typography',
          'design_animations',
          'design_components'
        ]);

      if (error) throw error;

      data?.forEach((setting) => {
        try {
          const parsed = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
          
          switch (setting.key) {
            case 'design_light_colors':
              setLightColors({ ...defaultLightColors, ...parsed });
              break;
            case 'design_dark_colors':
              setDarkColors({ ...defaultDarkColors, ...parsed });
              break;
            case 'design_typography':
              setTypography({ ...defaultTypography, ...parsed });
              break;
            case 'design_animations':
              setAnimations({ ...defaultAnimations, ...parsed });
              break;
            case 'design_components':
              setComponents({ ...defaultComponents, ...parsed });
              break;
          }
        } catch (e) {
          console.error('Error parsing setting:', setting.key, e);
        }
      });
    } catch (error) {
      console.error('Error loading design settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value: JSON.stringify(value),
        category: 'design',
        description: `Website design setting: ${key}`,
        is_public: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      await Promise.all([
        saveSetting('design_light_colors', lightColors),
        saveSetting('design_dark_colors', darkColors),
        saveSetting('design_typography', typography),
        saveSetting('design_animations', animations),
        saveSetting('design_components', components),
      ]);

      // Apply to CSS variables
      applyDesignSettings();

      toast({
        title: "Design Settings Saved",
        description: "Your website design has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving design settings:', error);
      toast({
        title: "Error",
        description: "Failed to save design settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyDesignSettings = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = isDark ? darkColors : lightColors;

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);
    root.style.setProperty('--font-mono', typography.monoFont);
    root.style.setProperty('--font-size-base', typography.baseFontSize);

    // Apply animations
    root.style.setProperty('--duration-fast', animations.durationFast);
    root.style.setProperty('--duration-normal', animations.durationNormal);
    root.style.setProperty('--duration-slow', animations.durationSlow);
    root.style.setProperty('--easing', animations.easing);

    // Apply component settings
    root.style.setProperty('--radius', components.borderRadius);
  };

  const resetToDefaults = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    setTypography(defaultTypography);
    setAnimations(defaultAnimations);
    setComponents(defaultComponents);
    toast({
      title: "Reset Complete",
      description: "All settings have been reset to defaults. Save to apply.",
    });
  };

  const ColorInput = ({ 
    label, 
    value, 
    onChange,
    description 
  }: { 
    label: string; 
    value: string; 
    onChange: (val: string) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div 
          className="w-8 h-8 rounded-md border shadow-sm"
          style={{ backgroundColor: `hsl(${value})` }}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="H S% L%"
        className="font-mono text-xs"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Website Design Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize colors, typography, animations, and component styles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveAllSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="colors" className="flex items-center gap-2 text-xs">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2 text-xs">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="animations" className="flex items-center gap-2 text-xs">
            <Sparkles className="h-4 w-4" />
            Animations
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2 text-xs">
            <Layout className="h-4 w-4" />
            Components
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6 mt-6">
          {/* Mode Selector */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Editing:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('light')}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </Button>
              <Button
                variant={previewMode === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('dark')}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {previewMode === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  {previewMode === 'light' ? 'Light' : 'Dark'} Theme Colors
                </CardTitle>
                <CardDescription>
                  Define HSL color values (e.g., "220 70% 50%")
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(previewMode === 'light' ? lightColors : darkColors).map(([key, value]) => (
                  <ColorInput
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={value}
                    onChange={(val) => {
                      if (previewMode === 'light') {
                        setLightColors(prev => ({ ...prev, [key]: val }));
                      } else {
                        setDarkColors(prev => ({ ...prev, [key]: val }));
                      }
                    }}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-6 rounded-lg border space-y-4"
                  style={{
                    backgroundColor: `hsl(${previewMode === 'light' ? lightColors.background : darkColors.background})`,
                    color: `hsl(${previewMode === 'light' ? lightColors.foreground : darkColors.foreground})`,
                    borderColor: `hsl(${previewMode === 'light' ? lightColors.border : darkColors.border})`,
                  }}
                >
                  <h3 className="text-xl font-bold">Preview Card</h3>
                  <p style={{ color: `hsl(${previewMode === 'light' ? lightColors.mutedForeground : darkColors.mutedForeground})` }}>
                    This is how your content will look with these colors.
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium"
                      style={{
                        backgroundColor: `hsl(${previewMode === 'light' ? lightColors.primary : darkColors.primary})`,
                        color: `hsl(${previewMode === 'light' ? lightColors.primaryForeground : darkColors.primaryForeground})`,
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium"
                      style={{
                        backgroundColor: `hsl(${previewMode === 'light' ? lightColors.accent : darkColors.accent})`,
                        color: `hsl(${previewMode === 'light' ? lightColors.accentForeground : darkColors.accentForeground})`,
                      }}
                    >
                      Accent Button
                    </button>
                  </div>
                  <div 
                    className="p-4 rounded-md"
                    style={{
                      backgroundColor: `hsl(${previewMode === 'light' ? lightColors.card : darkColors.card})`,
                      borderColor: `hsl(${previewMode === 'light' ? lightColors.border : darkColors.border})`,
                      borderWidth: '1px',
                    }}
                  >
                    <p className="text-sm">Nested card component</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Font Families
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select 
                    value={typography.headingFont}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, headingFont: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select 
                    value={typography.bodyFont}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, bodyFont: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                      <SelectItem value="Source Sans Pro, sans-serif">Source Sans Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monospace Font</Label>
                  <Select 
                    value={typography.monoFont}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, monoFont: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SF Mono, Consolas, monospace">SF Mono</SelectItem>
                      <SelectItem value="Fira Code, monospace">Fira Code</SelectItem>
                      <SelectItem value="JetBrains Mono, monospace">JetBrains Mono</SelectItem>
                      <SelectItem value="Monaco, monospace">Monaco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Base Font Size</Label>
                  <Select 
                    value={typography.baseFontSize}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, baseFontSize: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14px">14px (Compact)</SelectItem>
                      <SelectItem value="16px">16px (Default)</SelectItem>
                      <SelectItem value="18px">18px (Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Scale: {typography.headingScale}</Label>
                  <Slider
                    value={[typography.headingScale]}
                    onValueChange={([val]) => setTypography(prev => ({ ...prev, headingScale: val }))}
                    min={1.1}
                    max={1.5}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls size ratio between heading levels
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Typography Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div style={{ fontFamily: typography.headingFont }}>
                  <h1 className="text-3xl font-bold">Heading 1</h1>
                  <h2 className="text-2xl font-semibold">Heading 2</h2>
                  <h3 className="text-xl font-medium">Heading 3</h3>
                </div>
                <div style={{ fontFamily: typography.bodyFont, fontSize: typography.baseFontSize }}>
                  <p className="text-base">
                    This is body text. It should be comfortable to read across long paragraphs.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Smaller supporting text for descriptions and metadata.
                  </p>
                </div>
                <div style={{ fontFamily: typography.monoFont }}>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    const code = "monospace";
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Animation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Animations</Label>
                    <p className="text-xs text-muted-foreground">Master toggle for all animations</p>
                  </div>
                  <Switch
                    checked={animations.enabled}
                    onCheckedChange={(val) => setAnimations(prev => ({ ...prev, enabled: val }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">Respect user's reduced motion preference</p>
                  </div>
                  <Switch
                    checked={animations.reducedMotion}
                    onCheckedChange={(val) => setAnimations(prev => ({ ...prev, reducedMotion: val }))}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fast Duration</Label>
                    <Select 
                      value={animations.durationFast}
                      onValueChange={(val) => setAnimations(prev => ({ ...prev, durationFast: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100ms">100ms</SelectItem>
                        <SelectItem value="150ms">150ms</SelectItem>
                        <SelectItem value="200ms">200ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Normal Duration</Label>
                    <Select 
                      value={animations.durationNormal}
                      onValueChange={(val) => setAnimations(prev => ({ ...prev, durationNormal: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200ms">200ms</SelectItem>
                        <SelectItem value="300ms">300ms</SelectItem>
                        <SelectItem value="400ms">400ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Slow Duration</Label>
                    <Select 
                      value={animations.durationSlow}
                      onValueChange={(val) => setAnimations(prev => ({ ...prev, durationSlow: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400ms">400ms</SelectItem>
                        <SelectItem value="500ms">500ms</SelectItem>
                        <SelectItem value="600ms">600ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hover Scale: {animations.hoverScale}</Label>
                  <Slider
                    value={[animations.hoverScale]}
                    onValueChange={([val]) => setAnimations(prev => ({ ...prev, hoverScale: val }))}
                    min={1}
                    max={1.15}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Easing Function</Label>
                  <Select 
                    value={animations.easing}
                    onValueChange={(val) => setAnimations(prev => ({ ...prev, easing: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cubic-bezier(0.4, 0, 0.2, 1)">Ease Out (Default)</SelectItem>
                      <SelectItem value="cubic-bezier(0, 0, 0.2, 1)">Ease In</SelectItem>
                      <SelectItem value="cubic-bezier(0.4, 0, 1, 1)">Ease In Out</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bounce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Animation Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {animations.enabled ? (
                  <>
                    <div 
                      className="p-4 bg-primary/10 rounded-lg cursor-pointer transition-all"
                      style={{
                        transitionDuration: animations.durationNormal,
                        transitionTimingFunction: animations.easing,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `scale(${animations.hoverScale})`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <p className="text-sm font-medium">Hover to see scale effect</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className="animate-fade-in">Fade In</Badge>
                      <Badge className="animate-scale-in" variant="secondary">Scale In</Badge>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Animations are disabled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Component Styles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={components.borderRadius}
                    onValueChange={(val) => setComponents(prev => ({ ...prev, borderRadius: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (0)</SelectItem>
                      <SelectItem value="0.25rem">Small (0.25rem)</SelectItem>
                      <SelectItem value="0.5rem">Medium (0.5rem)</SelectItem>
                      <SelectItem value="0.75rem">Large (0.75rem)</SelectItem>
                      <SelectItem value="1rem">Extra Large (1rem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shadow Intensity</Label>
                  <Select 
                    value={components.shadowIntensity}
                    onValueChange={(val) => setComponents(prev => ({ ...prev, shadowIntensity: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Glassmorphism Effect</Label>
                    <p className="text-xs text-muted-foreground">Frosted glass effect on cards</p>
                  </div>
                  <Switch
                    checked={components.glassmorphism}
                    onCheckedChange={(val) => setComponents(prev => ({ ...prev, glassmorphism: val }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Button Size</Label>
                  <Select 
                    value={components.buttonSize}
                    onValueChange={(val: 'sm' | 'default' | 'lg') => setComponents(prev => ({ ...prev, buttonSize: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="default">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Toast & Modal Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Toast Position</Label>
                  <Select 
                    value={components.toastPosition}
                    onValueChange={(val) => setComponents(prev => ({ ...prev, toastPosition: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Toast Duration: {components.toastDuration}ms</Label>
                  <Slider
                    value={[components.toastDuration]}
                    onValueChange={([val]) => setComponents(prev => ({ ...prev, toastDuration: val }))}
                    min={2000}
                    max={10000}
                    step={500}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Modal Animation</Label>
                  <Select 
                    value={components.modalAnimation}
                    onValueChange={(val) => setComponents(prev => ({ ...prev, modalAnimation: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modal Backdrop Blur</Label>
                    <p className="text-xs text-muted-foreground">Blur background when modal is open</p>
                  </div>
                  <Switch
                    checked={components.modalBackdropBlur}
                    onCheckedChange={(val) => setComponents(prev => ({ ...prev, modalBackdropBlur: val }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Component Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Component Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div 
                  className="p-4 border bg-card"
                  style={{ borderRadius: components.borderRadius }}
                >
                  <p className="text-sm font-medium mb-2">Card with radius</p>
                  <div className="flex gap-2">
                    <Button size={components.buttonSize}>
                      <MousePointer className="h-4 w-4 mr-2" />
                      Button
                    </Button>
                    <Button size={components.buttonSize} variant="outline">
                      Outline
                    </Button>
                  </div>
                </div>

                {components.glassmorphism && (
                  <div 
                    className="p-4 border backdrop-blur-xl bg-white/10 dark:bg-black/10"
                    style={{ borderRadius: components.borderRadius }}
                  >
                    <p className="text-sm font-medium">Glassmorphism Effect</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteDesignSettings;
