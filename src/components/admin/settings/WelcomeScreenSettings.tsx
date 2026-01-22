import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Save, 
  Monitor, 
  Sparkles, 
  Palette,
  Timer,
  LayoutGrid,
  Eye,
  Play,
  RefreshCw,
  X,
  Settings2,
  Paintbrush,
  Move,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeScreenSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const WelcomeScreenSettings = ({ settings, loading, onInputChange, onSave }: WelcomeScreenSettingsProps) => {
  const [previewActive, setPreviewActive] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewMessage, setPreviewMessage] = useState('Loading data...');

  // Animation preview
  useEffect(() => {
    if (previewActive) {
      setPreviewProgress(0);
      setPreviewMessage('Loading data...');
      
      const messages = ['Loading data...', 'Processing...', 'Almost done...', 'Completing...'];
      let msgIndex = 0;
      
      const progressInterval = setInterval(() => {
        setPreviewProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => setPreviewActive(false), 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      const messageInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setPreviewMessage(messages[msgIndex]);
      }, 800);

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
      };
    }
  }, [previewActive]);

  const getPositionClasses = () => {
    const position = settings.loadingPopupPosition || 'bottom-right';
    switch (position) {
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-4 right-4';
    }
  };

  const getBarStyle = () => {
    const style = settings.loadingPopupBarStyle || 'shimmer';
    switch (style) {
      case 'solid':
        return 'bg-primary';
      case 'gradient':
        return 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]';
      default:
        return 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Welcome Screen & Loading Settings
          </h2>
          <p className="text-[10px] text-muted-foreground">Configure loading screens, progress popups, and animations</p>
        </div>
        <Button size="sm" onClick={onSave} disabled={loading} className="h-7 text-xs px-3">
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="welcome" className="text-[10px] h-7 gap-1">
            <Sparkles className="h-3 w-3" />
            Welcome Screen
          </TabsTrigger>
          <TabsTrigger value="popup" className="text-[10px] h-7 gap-1">
            <LayoutGrid className="h-3 w-3" />
            Progress Popup
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-[10px] h-7 gap-1">
            <Eye className="h-3 w-3" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        {/* Welcome Screen Tab */}
        <TabsContent value="welcome" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Enable Welcome Screen</Label>
                    <p className="text-[8px] text-muted-foreground">Show animated loading on first visit</p>
                  </div>
                  <Switch
                    checked={settings.welcomeScreenEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('welcomeScreenEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Quick Login Button</Label>
                    <p className="text-[8px] text-muted-foreground">Show login form on welcome screen</p>
                  </div>
                  <Switch
                    checked={settings.welcomeQuickLoginEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('welcomeQuickLoginEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Show Connection Status</Label>
                    <p className="text-[8px] text-muted-foreground">Display database connection indicator</p>
                  </div>
                  <Switch
                    checked={settings.welcomeShowConnectionStatus !== false}
                    onCheckedChange={(checked) => onInputChange('welcomeShowConnectionStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Skip on Return Visit</Label>
                    <p className="text-[8px] text-muted-foreground">Only show for first-time visitors</p>
                  </div>
                  <Switch
                    checked={settings.welcomeSkipOnReturn === true}
                    onCheckedChange={(checked) => onInputChange('welcomeSkipOnReturn', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Paintbrush className="h-3.5 w-3.5" />
                Animation & Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Animation Style
                  </Label>
                  <Select
                    value={settings.welcomeAnimationStyle || 'gradient'}
                    onValueChange={(value) => onInputChange('welcomeAnimationStyle', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient Flow</SelectItem>
                      <SelectItem value="particles">Floating Particles</SelectItem>
                      <SelectItem value="minimal">Minimal Clean</SelectItem>
                      <SelectItem value="luxury">Luxury Glow</SelectItem>
                      <SelectItem value="pulse">Pulse Effect</SelectItem>
                      <SelectItem value="wave">Wave Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Loading Duration: {settings.welcomeLoadingDuration || 1750}ms
                  </Label>
                  <Slider
                    value={[settings.welcomeLoadingDuration || 1750]}
                    onValueChange={([value]) => onInputChange('welcomeLoadingDuration', value)}
                    min={500}
                    max={5000}
                    step={250}
                    className="py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">Background Style</Label>
                  <Select
                    value={settings.welcomeBackgroundStyle || 'dark'}
                    onValueChange={(value) => onInputChange('welcomeBackgroundStyle', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="blur">Glassmorphic Blur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">Loading Indicator</Label>
                  <Select
                    value={settings.welcomeLoadingIndicator || 'dots'}
                    onValueChange={(value) => onInputChange('welcomeLoadingIndicator', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dots">Bouncing Dots</SelectItem>
                      <SelectItem value="spinner">Spinner</SelectItem>
                      <SelectItem value="bar">Progress Bar</SelectItem>
                      <SelectItem value="pulse">Pulse Circle</SelectItem>
                      <SelectItem value="wave">Wave Bars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Primary Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.welcomePrimaryColor || '#7f5af0'}
                      onChange={(e) => onInputChange('welcomePrimaryColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.welcomePrimaryColor || '#7f5af0'}
                      onChange={(e) => onInputChange('welcomePrimaryColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Accent Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.welcomeAccentColor || '#2cb67d'}
                      onChange={(e) => onInputChange('welcomeAccentColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.welcomeAccentColor || '#2cb67d'}
                      onChange={(e) => onInputChange('welcomeAccentColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Background</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.welcomeBackgroundColor || '#000000'}
                      onChange={(e) => onInputChange('welcomeBackgroundColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.welcomeBackgroundColor || '#000000'}
                      onChange={(e) => onInputChange('welcomeBackgroundColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Text Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.welcomeTextColor || '#ffffff'}
                      onChange={(e) => onInputChange('welcomeTextColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.welcomeTextColor || '#ffffff'}
                      onChange={(e) => onInputChange('welcomeTextColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                Logo Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="p-2 bg-muted/30 rounded-md">
                <p className="text-[10px] text-muted-foreground">
                  Welcome screen logo is managed in <strong>Branding → Welcome Logo</strong>. Upload a transparent PNG (recommended: 200x200px).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Popup Tab */}
        <TabsContent value="popup" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                Popup Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Enable Progress Popup</Label>
                    <p className="text-[8px] text-muted-foreground">Show popup during operations</p>
                  </div>
                  <Switch
                    checked={settings.loadingPopupEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('loadingPopupEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Auto-hide on Complete</Label>
                    <p className="text-[8px] text-muted-foreground">Automatically dismiss when done</p>
                  </div>
                  <Switch
                    checked={settings.loadingPopupAutoHide !== false}
                    onCheckedChange={(checked) => onInputChange('loadingPopupAutoHide', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Allow Manual Dismiss</Label>
                    <p className="text-[8px] text-muted-foreground">Show close button on popup</p>
                  </div>
                  <Switch
                    checked={settings.loadingPopupDismissible !== false}
                    onCheckedChange={(checked) => onInputChange('loadingPopupDismissible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div>
                    <Label className="text-[10px] font-medium">Show Percentage</Label>
                    <p className="text-[8px] text-muted-foreground">Display progress percentage</p>
                  </div>
                  <Switch
                    checked={settings.loadingPopupShowPercent !== false}
                    onCheckedChange={(checked) => onInputChange('loadingPopupShowPercent', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Move className="h-3.5 w-3.5" />
                Position & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">Popup Position</Label>
                  <Select
                    value={settings.loadingPopupPosition || 'bottom-right'}
                    onValueChange={(value) => onInputChange('loadingPopupPosition', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="center">Center Screen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">
                    Auto-hide Delay: {settings.loadingPopupAutoHideDelay || 1500}ms
                  </Label>
                  <Slider
                    value={[settings.loadingPopupAutoHideDelay || 1500]}
                    onValueChange={([value]) => onInputChange('loadingPopupAutoHideDelay', value)}
                    min={500}
                    max={5000}
                    step={250}
                    className="py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">Popup Size</Label>
                  <Select
                    value={settings.loadingPopupSize || 'medium'}
                    onValueChange={(value) => onInputChange('loadingPopupSize', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (240px)</SelectItem>
                      <SelectItem value="medium">Medium (320px)</SelectItem>
                      <SelectItem value="large">Large (400px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium">Animation Style</Label>
                  <Select
                    value={settings.loadingPopupAnimation || 'slide'}
                    onValueChange={(value) => onInputChange('loadingPopupAnimation', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Slide In</SelectItem>
                      <SelectItem value="fade">Fade In</SelectItem>
                      <SelectItem value="scale">Scale Up</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Paintbrush className="h-3.5 w-3.5" />
                Visual Design
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-medium">Progress Bar Style</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['shimmer', 'solid', 'gradient', 'glow'].map((style) => (
                    <button
                      key={style}
                      onClick={() => onInputChange('loadingPopupBarStyle', style)}
                      className={cn(
                        "p-2 rounded-md border text-[9px] font-medium capitalize transition-all",
                        (settings.loadingPopupBarStyle || 'shimmer') === style
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-medium">Popup Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['default', 'glass', 'solid'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => onInputChange('loadingPopupTheme', theme)}
                      className={cn(
                        "p-2 rounded-md border text-[9px] font-medium capitalize transition-all",
                        (settings.loadingPopupTheme || 'default') === theme
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Bar Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.loadingPopupBarColor || '#7f5af0'}
                      onChange={(e) => onInputChange('loadingPopupBarColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.loadingPopupBarColor || '#7f5af0'}
                      onChange={(e) => onInputChange('loadingPopupBarColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Accent Color</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.loadingPopupAccentColor || '#2cb67d'}
                      onChange={(e) => onInputChange('loadingPopupAccentColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.loadingPopupAccentColor || '#2cb67d'}
                      onChange={(e) => onInputChange('loadingPopupAccentColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Background</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={settings.loadingPopupBgColor || '#1a1a2e'}
                      onChange={(e) => onInputChange('loadingPopupBgColor', e.target.value)}
                      className="h-7 w-10 p-0.5 cursor-pointer"
                    />
                    <Input
                      value={settings.loadingPopupBgColor || '#1a1a2e'}
                      onChange={(e) => onInputChange('loadingPopupBgColor', e.target.value)}
                      className="h-7 text-[9px] flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-medium">Border Radius</Label>
                  <Select
                    value={settings.loadingPopupBorderRadius || 'xl'}
                    onValueChange={(value) => onInputChange('loadingPopupBorderRadius', value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Preview Tab */}
        <TabsContent value="preview" className="space-y-3 mt-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs text-foreground flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  Live Preview
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0">Interactive</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-[10px] px-2"
                    onClick={() => setPreviewActive(true)}
                    disabled={previewActive}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {previewActive ? 'Running...' : 'Start Preview'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      setPreviewActive(false);
                      setPreviewProgress(0);
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-[10px]">
                See how your loading popup will appear with current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {/* Preview Container */}
              <div className="relative bg-gradient-to-br from-muted/50 to-muted rounded-lg border border-border/50 h-[300px] overflow-hidden">
                {/* Simulated page content */}
                <div className="absolute inset-0 p-4 opacity-30">
                  <div className="space-y-3">
                    <div className="h-8 bg-muted-foreground/20 rounded-md w-1/3" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-2/3" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-muted-foreground/20 rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Popup */}
                <AnimatePresence>
                  {previewActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 50, scale: 0.9 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className={cn(
                        "absolute z-10",
                        settings.loadingPopupSize === 'small' ? 'w-60' : 
                        settings.loadingPopupSize === 'large' ? 'w-[400px]' : 'w-80',
                        getPositionClasses()
                      )}
                    >
                      <div className={cn(
                        "backdrop-blur-xl border shadow-2xl overflow-hidden",
                        settings.loadingPopupTheme === 'glass' 
                          ? 'bg-background/70 border-border/30' 
                          : settings.loadingPopupTheme === 'solid'
                          ? 'bg-background border-border'
                          : 'bg-background/95 border-border/50',
                        settings.loadingPopupBorderRadius === 'none' ? 'rounded-none' :
                        settings.loadingPopupBorderRadius === 'sm' ? 'rounded-sm' :
                        settings.loadingPopupBorderRadius === 'md' ? 'rounded-md' :
                        settings.loadingPopupBorderRadius === 'lg' ? 'rounded-lg' :
                        settings.loadingPopupBorderRadius === 'full' ? 'rounded-3xl' : 'rounded-2xl'
                      )}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 className="w-4 h-4 text-primary" />
                            </motion.div>
                            <span className="text-sm font-medium text-foreground">Loading</span>
                          </div>
                          {settings.loadingPopupDismissible !== false && (
                            <button className="p-1 rounded-full hover:bg-muted transition-colors">
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <motion.p
                            key={previewMessage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-muted-foreground mb-3"
                          >
                            {previewMessage}
                          </motion.p>

                          {/* Progress bar */}
                          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-full",
                                getBarStyle()
                              )}
                              initial={{ width: '0%' }}
                              animate={{ width: `${previewProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                            {(settings.loadingPopupBarStyle === 'shimmer' || !settings.loadingPopupBarStyle) && (
                              <motion.div
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                                  width: '30%'
                                }}
                                animate={{ x: ['-100%', '400%'] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </div>

                          {/* Percentage */}
                          {settings.loadingPopupShowPercent !== false && (
                            <div className="flex items-center justify-end mt-2">
                              <span className="text-xs font-bold tabular-nums text-primary">
                                {Math.round(previewProgress)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Loading dots */}
                        <div className="flex items-center justify-center gap-1.5 pb-3">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 rounded-full bg-primary"
                              animate={{
                                y: [0, -4, 0],
                                opacity: [0.3, 1, 0.3]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.08
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Position Indicator */}
                {!previewActive && (
                  <div className={cn(
                    "absolute z-10 p-3 border-2 border-dashed border-primary/50 rounded-lg bg-primary/10",
                    settings.loadingPopupSize === 'small' ? 'w-60' : 
                    settings.loadingPopupSize === 'large' ? 'w-[400px]' : 'w-80',
                    getPositionClasses()
                  )}>
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <LayoutGrid className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Popup Position</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Position Selector */}
              <div className="mt-3">
                <Label className="text-[10px] font-medium mb-2 block">Quick Position Select</Label>
                <div className="grid grid-cols-5 gap-1 p-2 bg-muted/30 rounded-md">
                  {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onInputChange('loadingPopupPosition', pos)}
                      className={cn(
                        "p-2 rounded text-[8px] font-medium transition-all capitalize",
                        settings.loadingPopupPosition === pos || (!settings.loadingPopupPosition && pos === 'bottom-right')
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      )}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-foreground flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Current Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Position</p>
                  <p className="text-[10px] font-medium capitalize">
                    {(settings.loadingPopupPosition || 'bottom-right').replace('-', ' ')}
                  </p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Size</p>
                  <p className="text-[10px] font-medium capitalize">{settings.loadingPopupSize || 'medium'}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Bar Style</p>
                  <p className="text-[10px] font-medium capitalize">{settings.loadingPopupBarStyle || 'shimmer'}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Theme</p>
                  <p className="text-[10px] font-medium capitalize">{settings.loadingPopupTheme || 'default'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WelcomeScreenSettings;
