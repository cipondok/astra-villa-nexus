import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Save, 
  Monitor, 
  Sparkles, 
  Palette,
  Timer,
  LayoutGrid,
  Eye
} from 'lucide-react';

interface WelcomeScreenSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const WelcomeScreenSettings = ({ settings, loading, onInputChange, onSave }: WelcomeScreenSettingsProps) => {
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
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Welcome Screen Settings */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome Screen
            <Badge variant="outline" className="text-[8px] px-1.5 py-0">Initial Loading</Badge>
          </CardTitle>
          <CardDescription className="text-[10px]">
            Configure the initial welcome/loading screen appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Enable Welcome Screen */}
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

            {/* Show Quick Login */}
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

            {/* Animation Style */}
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
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="luxury">Luxury Glow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animation Duration */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Loading Duration (ms)
              </Label>
              <Input
                type="number"
                value={settings.welcomeLoadingDuration || 1750}
                onChange={(e) => onInputChange('welcomeLoadingDuration', parseInt(e.target.value) || 1750)}
                className="h-7 text-xs bg-background/50"
                min={500}
                max={5000}
                step={250}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Progress Popup Settings */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5" />
            Loading Progress Popup
            <Badge variant="outline" className="text-[8px] px-1.5 py-0">Global</Badge>
          </CardTitle>
          <CardDescription className="text-[10px]">
            Configure the floating progress popup that appears during operations
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Enable Popup */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
              <div>
                <Label className="text-[10px] font-medium">Enable Progress Popup</Label>
                <p className="text-[8px] text-muted-foreground">Show progress popup for operations</p>
              </div>
              <Switch
                checked={settings.loadingPopupEnabled !== false}
                onCheckedChange={(checked) => onInputChange('loadingPopupEnabled', checked)}
              />
            </div>

            {/* Auto-hide Popup */}
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

            {/* Popup Position */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Popup Position
              </Label>
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
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-hide Delay */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Auto-hide Delay (ms)
              </Label>
              <Input
                type="number"
                value={settings.loadingPopupAutoHideDelay || 1500}
                onChange={(e) => onInputChange('loadingPopupAutoHideDelay', parseInt(e.target.value) || 1500)}
                className="h-7 text-xs bg-background/50"
                min={500}
                max={5000}
                step={250}
              />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Progress Bar Style */}
          <div className="space-y-2">
            <Label className="text-[10px] font-medium">Progress Bar Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {['shimmer', 'solid', 'gradient'].map((style) => (
                <button
                  key={style}
                  onClick={() => onInputChange('loadingPopupBarStyle', style)}
                  className={`p-2 rounded-md border text-[9px] font-medium capitalize transition-colors ${
                    (settings.loadingPopupBarStyle || 'shimmer') === style
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Info */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" />
            Logo Configuration
          </CardTitle>
          <CardDescription className="text-[10px]">
            Welcome screen logo is managed in the <strong>Branding</strong> tab
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="p-2 bg-muted/30 rounded-md">
            <p className="text-[10px] text-muted-foreground">
              To change the welcome screen logo, go to <strong>Branding → Current Logos → Welcome</strong> and upload a transparent PNG file (recommended size: 200x200px).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreenSettings;
