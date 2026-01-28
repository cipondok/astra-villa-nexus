import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDesignSystem } from '@/stores/designSystemStore';
import { toast } from 'sonner';
import { 
  Type, 
  Palette, 
  Square, 
  MessageSquare, 
  Layers, 
  MousePointer,
  RotateCcw,
  Save
} from 'lucide-react';

const WebsiteDesignControl = () => {
  const { config, updateConfig, resetConfig } = useDesignSystem();

  const handleSave = () => {
    toast.success('Design system settings saved successfully');
  };

  const handleReset = () => {
    resetConfig();
    toast.info('Design system reset to defaults');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Design System</h2>
          <p className="text-muted-foreground">Configure the global design tokens and component settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Typography</span>
          </TabsTrigger>
          <TabsTrigger value="spacing" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Spacing</span>
          </TabsTrigger>
          <TabsTrigger value="borders" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            <span className="hidden sm:inline">Borders</span>
          </TabsTrigger>
          <TabsTrigger value="animations" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Animations</span>
          </TabsTrigger>
          <TabsTrigger value="toasts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Toasts</span>
          </TabsTrigger>
          <TabsTrigger value="buttons" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            <span className="hidden sm:inline">Buttons</span>
          </TabsTrigger>
        </TabsList>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Font Families</CardTitle>
              <CardDescription>Configure the fonts used across the application</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="heading-font">Heading Font</Label>
                <Input
                  id="heading-font"
                  value={config.fontFamily.heading}
                  onChange={(e) => updateConfig({
                    fontFamily: { ...config.fontFamily, heading: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <Input
                  id="body-font"
                  value={config.fontFamily.body}
                  onChange={(e) => updateConfig({
                    fontFamily: { ...config.fontFamily, body: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mono-font">Monospace Font</Label>
                <Input
                  id="mono-font"
                  value={config.fontFamily.mono}
                  onChange={(e) => updateConfig({
                    fontFamily: { ...config.fontFamily, mono: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Sizes</CardTitle>
              <CardDescription>Define the typography scale</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              {Object.entries(config.fontSize).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`font-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`font-${key}`}
                    value={value}
                    onChange={(e) => updateConfig({
                      fontSize: { ...config.fontSize, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>Configure the spacing tokens used for margins and padding</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              {Object.entries(config.spacing).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`spacing-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`spacing-${key}`}
                    value={value}
                    onChange={(e) => updateConfig({
                      spacing: { ...config.spacing, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Borders Tab */}
        <TabsContent value="borders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
              <CardDescription>Configure corner rounding for UI elements</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              {Object.entries(config.borderRadius).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`radius-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`radius-${key}`}
                    value={value}
                    onChange={(e) => updateConfig({
                      borderRadius: { ...config.borderRadius, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shadows</CardTitle>
              <CardDescription>Define box shadow styles for depth</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.entries(config.shadows).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`shadow-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`shadow-${key}`}
                    value={value}
                    onChange={(e) => updateConfig({
                      shadows: { ...config.shadows, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Animation Durations</CardTitle>
              <CardDescription>Configure transition timing</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {Object.entries(config.animations.duration).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`duration-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`duration-${key}`}
                    value={value}
                    onChange={(e) => updateConfig({
                      animations: {
                        ...config.animations,
                        duration: { ...config.animations.duration, [key]: e.target.value }
                      }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easing Function</CardTitle>
              <CardDescription>Define the animation timing curve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="easing">Easing Curve</Label>
                <Input
                  id="easing"
                  value={config.animations.easing}
                  onChange={(e) => updateConfig({
                    animations: { ...config.animations, easing: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toasts Tab */}
        <TabsContent value="toasts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toast Settings</CardTitle>
              <CardDescription>Configure notification behavior and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="toast-position">Position</Label>
                  <Select
                    value={config.toastSettings.position}
                    onValueChange={(value: typeof config.toastSettings.position) => updateConfig({
                      toastSettings: { ...config.toastSettings, position: value }
                    })}
                  >
                    <SelectTrigger id="toast-position">
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
                  <Label htmlFor="toast-duration">Duration (ms): {config.toastSettings.duration}</Label>
                  <Slider
                    id="toast-duration"
                    value={[config.toastSettings.duration]}
                    min={1000}
                    max={10000}
                    step={500}
                    onValueChange={([value]) => updateConfig({
                      toastSettings: { ...config.toastSettings, duration: value }
                    })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Show Progress Bar</Label>
                    <p className="text-sm text-muted-foreground">Display countdown indicator</p>
                  </div>
                  <Switch
                    checked={config.toastSettings.showProgress}
                    onCheckedChange={(checked) => updateConfig({
                      toastSettings: { ...config.toastSettings, showProgress: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toast-max">Max Visible: {config.toastSettings.maxVisible}</Label>
                  <Slider
                    id="toast-max"
                    value={[config.toastSettings.maxVisible]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([value]) => updateConfig({
                      toastSettings: { ...config.toastSettings, maxVisible: value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modal Settings</CardTitle>
              <CardDescription>Configure dialog and popup behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Backdrop Blur</Label>
                    <p className="text-sm text-muted-foreground">Blur background when modal opens</p>
                  </div>
                  <Switch
                    checked={config.modalSettings.backdropBlur}
                    onCheckedChange={(checked) => updateConfig({
                      modalSettings: { ...config.modalSettings, backdropBlur: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Close on Outside Click</Label>
                    <p className="text-sm text-muted-foreground">Allow closing by clicking backdrop</p>
                  </div>
                  <Switch
                    checked={config.modalSettings.closeOnOutsideClick}
                    onCheckedChange={(checked) => updateConfig({
                      modalSettings: { ...config.modalSettings, closeOnOutsideClick: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Show Close Button</Label>
                    <p className="text-sm text-muted-foreground">Display X button in corner</p>
                  </div>
                  <Switch
                    checked={config.modalSettings.showCloseButton}
                    onCheckedChange={(checked) => updateConfig({
                      modalSettings: { ...config.modalSettings, showCloseButton: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-animation">Animation Style</Label>
                  <Select
                    value={config.modalSettings.animation}
                    onValueChange={(value: typeof config.modalSettings.animation) => updateConfig({
                      modalSettings: { ...config.modalSettings, animation: value }
                    })}
                  >
                    <SelectTrigger id="modal-animation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Defaults</CardTitle>
              <CardDescription>Configure default button appearance</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="button-size">Default Size</Label>
                <Select
                  value={config.buttonSettings.defaultSize}
                  onValueChange={(value: typeof config.buttonSettings.defaultSize) => updateConfig({
                    buttonSettings: { ...config.buttonSettings, defaultSize: value }
                  })}
                >
                  <SelectTrigger id="button-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button-variant">Default Variant</Label>
                <Select
                  value={config.buttonSettings.defaultVariant}
                  onValueChange={(value: typeof config.buttonSettings.defaultVariant) => updateConfig({
                    buttonSettings: { ...config.buttonSettings, defaultVariant: value }
                  })}
                >
                  <SelectTrigger id="button-variant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Button Preview</CardTitle>
              <CardDescription>See how buttons look with current settings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default" size={config.buttonSettings.defaultSize === 'md' ? 'default' : config.buttonSettings.defaultSize}>Default</Button>
              <Button variant="secondary" size={config.buttonSettings.defaultSize === 'md' ? 'default' : config.buttonSettings.defaultSize}>Secondary</Button>
              <Button variant="outline" size={config.buttonSettings.defaultSize === 'md' ? 'default' : config.buttonSettings.defaultSize}>Outline</Button>
              <Button variant="ghost" size={config.buttonSettings.defaultSize === 'md' ? 'default' : config.buttonSettings.defaultSize}>Ghost</Button>
              <Button variant="destructive" size={config.buttonSettings.defaultSize === 'md' ? 'default' : config.buttonSettings.defaultSize}>Destructive</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteDesignControl;
