import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, Type, Palette, Clock, Eye, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const WelcomeScreenSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    logoUrl: '/src/assets/astra-logo.png',
    brandName: 'ASTRA',
    tagline: 'Premium Real Estate',
    showProgress: true,
    animationsEnabled: true,
    loadingDuration: 2000,
    showSparkles: true,
    showOrbs: true,
    showGrid: true,
    primaryGradient: true,
  });

  const handleSave = () => {
    toast.success('Welcome screen settings saved successfully');
  };

  const handleReset = () => {
    setSettings({
      enabled: true,
      logoUrl: '/src/assets/astra-logo.png',
      brandName: 'ASTRA',
      tagline: 'Premium Real Estate',
      showProgress: true,
      animationsEnabled: true,
      loadingDuration: 2000,
      showSparkles: true,
      showOrbs: true,
      showGrid: true,
      primaryGradient: true,
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome Screen Settings</h1>
            <p className="text-sm text-muted-foreground">Customize the loading screen appearance and branding</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="branding" className="text-xs gap-1.5">
            <Image className="h-3.5 w-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="animations" className="text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Animations
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo Settings
                </CardTitle>
                <CardDescription className="text-xs">Configure your brand logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Current Logo</Label>
                  <div className="h-24 w-24 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo preview" 
                      className="h-16 w-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).alt = 'Logo not found';
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Logo URL/Path</Label>
                  <Input 
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                    placeholder="/src/assets/logo.png"
                    className="h-8 text-xs"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Upload New Logo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Visual Style
                </CardTitle>
                <CardDescription className="text-xs">Configure visual effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Show Sparkle Particles</Label>
                    <p className="text-[10px] text-muted-foreground">Floating sparkle animations</p>
                  </div>
                  <Switch 
                    checked={settings.showSparkles}
                    onCheckedChange={(checked) => setSettings({...settings, showSparkles: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Show Floating Orbs</Label>
                    <p className="text-[10px] text-muted-foreground">Background orb elements</p>
                  </div>
                  <Switch 
                    checked={settings.showOrbs}
                    onCheckedChange={(checked) => setSettings({...settings, showOrbs: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Show Grid Pattern</Label>
                    <p className="text-[10px] text-muted-foreground">Subtle grid overlay</p>
                  </div>
                  <Switch 
                    checked={settings.showGrid}
                    onCheckedChange={(checked) => setSettings({...settings, showGrid: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Primary Gradient Background</Label>
                    <p className="text-[10px] text-muted-foreground">Use theme colors</p>
                  </div>
                  <Switch 
                    checked={settings.primaryGradient}
                    onCheckedChange={(checked) => setSettings({...settings, primaryGradient: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Text Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4" />
                Brand Text
              </CardTitle>
              <CardDescription className="text-xs">Configure brand name and tagline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Brand Name</Label>
                  <Input 
                    value={settings.brandName}
                    onChange={(e) => setSettings({...settings, brandName: e.target.value})}
                    placeholder="ASTRA"
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Main brand text displayed prominently</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Secondary Text</Label>
                  <Input 
                    value="Villa"
                    disabled
                    className="h-8 text-xs bg-muted"
                  />
                  <p className="text-[10px] text-muted-foreground">Appears after brand name</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tagline</Label>
                <Input 
                  value={settings.tagline}
                  onChange={(e) => setSettings({...settings, tagline: e.target.value})}
                  placeholder="Premium Real Estate"
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Subtitle text under brand name</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timing
                </CardTitle>
                <CardDescription className="text-xs">Configure loading duration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Enable Welcome Screen</Label>
                    <p className="text-[10px] text-muted-foreground">Show loading screen on app start</p>
                  </div>
                  <Switch 
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Loading Duration</Label>
                    <Badge variant="secondary" className="text-[10px]">{settings.loadingDuration}ms</Badge>
                  </div>
                  <Slider
                    value={[settings.loadingDuration]}
                    onValueChange={(value) => setSettings({...settings, loadingDuration: value[0]})}
                    min={1000}
                    max={5000}
                    step={250}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">How long the loading screen displays</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Animation Effects
                </CardTitle>
                <CardDescription className="text-xs">Toggle animation features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Enable Animations</Label>
                    <p className="text-[10px] text-muted-foreground">All motion effects</p>
                  </div>
                  <Switch 
                    checked={settings.animationsEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, animationsEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Show Progress Bar</Label>
                    <p className="text-[10px] text-muted-foreground">Loading progress indicator</p>
                  </div>
                  <Switch 
                    checked={settings.showProgress}
                    onCheckedChange={(checked) => setSettings({...settings, showProgress: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-xs">See how your welcome screen will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 rounded-xl overflow-hidden bg-background border">
                {/* Mini preview of the welcome screen */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  <div className="relative text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="h-10 w-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        <span className="text-primary">{settings.brandName}</span>
                        <span className="text-foreground ml-2">Villa</span>
                      </h3>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                        {settings.tagline}
                      </p>
                    </div>
                    {settings.showProgress && (
                      <div className="w-48 mx-auto">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Loading... 75%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                This is a simplified preview. The actual welcome screen includes more advanced animations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WelcomeScreenSettings;
