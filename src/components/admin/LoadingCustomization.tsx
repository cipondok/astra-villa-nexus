
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Image, Palette, Settings, Eye, Save, RefreshCw } from 'lucide-react';

interface LoadingSettings {
  enabled: boolean;
  logoUrl: string;
  logoSize: number;
  logoOpacity: number;
  mainTitle: string;
  subtitle: string;
  animationType: string;
  animationSpeed: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  showProgress: boolean;
  showConnectionStatus: boolean;
  customCss: string;
  fadeInDuration: number;
  pulseEffect: boolean;
  particleEffect: boolean;
  gradientBackground: boolean;
}

const LoadingCustomization = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<LoadingSettings>({
    enabled: true,
    logoUrl: '',
    logoSize: 100,
    logoOpacity: 100,
    mainTitle: 'ASTRA Villa',
    subtitle: 'Loading, please wait...',
    animationType: 'pulse',
    animationSpeed: 2,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    showProgress: true,
    showConnectionStatus: true,
    customCss: '',
    fadeInDuration: 300,
    pulseEffect: true,
    particleEffect: false,
    gradientBackground: true
  });
  
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'loading_customization');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          let value = setting.value;
          // Handle boolean and number conversions
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          if (!isNaN(Number(value)) && value !== '') value = Number(value);
          acc[setting.key] = value;
          return acc;
        }, {} as any);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading loading settings:', error);
      showError('Error', 'Failed to load loading customization settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        category: 'loading_customization',
        description: `Loading customization setting for ${key}`,
        is_public: true
      }));

      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting, {
            onConflict: 'key,category'
          });
        
        if (error) throw error;
      }

      showSuccess('Settings Saved', 'Loading customization settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save loading customization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `loading-logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('system-assets')
        .getPublicUrl(fileName);

      handleInputChange('logoUrl', data.publicUrl);
      showSuccess('Logo Uploaded', 'Loading logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError('Upload Error', 'Failed to upload logo');
    }
  };

  const animationTypes = [
    { value: 'pulse', label: 'Pulse' },
    { value: 'spin', label: 'Spin' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'scale', label: 'Scale' },
    { value: 'glow', label: 'Glow' },
    { value: 'wave', label: 'Wave' }
  ];

  const previewStyles = {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor,
    background: settings.gradientBackground 
      ? `linear-gradient(135deg, ${settings.backgroundColor}, ${settings.accentColor}20)`
      : settings.backgroundColor
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loading Screen Customization</h2>
          <p className="text-gray-600">Customize loading screens, animations, and branding</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setPreviewMode(!previewMode)} 
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full h-64 flex flex-col items-center justify-center rounded-lg border"
              style={previewStyles}
            >
              {settings.logoUrl && (
                <img 
                  src={settings.logoUrl}
                  alt="Loading Logo"
                  className={`mb-4 animate-${settings.animationType}`}
                  style={{
                    width: `${settings.logoSize}px`,
                    height: 'auto',
                    opacity: settings.logoOpacity / 100,
                    animationDuration: `${settings.animationSpeed}s`
                  }}
                />
              )}
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: settings.textColor }}
              >
                {settings.mainTitle}
              </h1>
              <p style={{ color: `${settings.textColor}80` }}>
                {settings.subtitle}
              </p>
              {settings.showProgress && (
                <div className="w-48 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full animate-pulse"
                    style={{ 
                      backgroundColor: settings.accentColor,
                      width: '60%',
                      transition: 'width 2s ease-in-out'
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enable Custom Loading Screen</Label>
                <Switch 
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainTitle">Main Title</Label>
                  <Input 
                    id="mainTitle"
                    value={settings.mainTitle}
                    onChange={(e) => handleInputChange('mainTitle', e.target.value)}
                    placeholder="ASTRA Villa"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input 
                    id="subtitle"
                    value={settings.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Loading, please wait..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="backgroundColor"
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input 
                      value={settings.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="textColor"
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input 
                      value={settings.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input 
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="showProgress"
                    checked={settings.showProgress}
                    onCheckedChange={(checked) => handleInputChange('showProgress', checked)}
                  />
                  <Label htmlFor="showProgress">Show Progress Bar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="showConnectionStatus"
                    checked={settings.showConnectionStatus}
                    onCheckedChange={(checked) => handleInputChange('showConnectionStatus', checked)}
                  />
                  <Label htmlFor="showConnectionStatus">Show Connection Status</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadLogo}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  {settings.logoUrl && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={settings.logoUrl} 
                        alt="Current logo" 
                        className="w-8 h-8 object-contain"
                      />
                      <Badge variant="outline">Logo Uploaded</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL (Alternative)</Label>
                <Input 
                  id="logoUrl"
                  value={settings.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoSize">Logo Size: {settings.logoSize}px</Label>
                  <Slider 
                    value={[settings.logoSize]}
                    onValueChange={(value) => handleInputChange('logoSize', value[0])}
                    min={50}
                    max={300}
                    step={10}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="logoOpacity">Logo Opacity: {settings.logoOpacity}%</Label>
                  <Slider 
                    value={[settings.logoOpacity]}
                    onValueChange={(value) => handleInputChange('logoOpacity', value[0])}
                    min={10}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animation">
          <Card>
            <CardHeader>
              <CardTitle>Animation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="animationType">Animation Type</Label>
                <Select 
                  value={settings.animationType}
                  onValueChange={(value) => handleInputChange('animationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    {animationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="animationSpeed">Animation Speed: {settings.animationSpeed}s</Label>
                <Slider 
                  value={[settings.animationSpeed]}
                  onValueChange={(value) => handleInputChange('animationSpeed', value[0])}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="fadeInDuration">Fade In Duration: {settings.fadeInDuration}ms</Label>
                <Slider 
                  value={[settings.fadeInDuration]}
                  onValueChange={(value) => handleInputChange('fadeInDuration', value[0])}
                  min={100}
                  max={2000}
                  step={100}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="pulseEffect"
                    checked={settings.pulseEffect}
                    onCheckedChange={(checked) => handleInputChange('pulseEffect', checked)}
                  />
                  <Label htmlFor="pulseEffect">Pulse Effect</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="particleEffect"
                    checked={settings.particleEffect}
                    onCheckedChange={(checked) => handleInputChange('particleEffect', checked)}
                  />
                  <Label htmlFor="particleEffect">Particle Effect</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="gradientBackground"
                    checked={settings.gradientBackground}
                    onCheckedChange={(checked) => handleInputChange('gradientBackground', checked)}
                  />
                  <Label htmlFor="gradientBackground">Gradient Background</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea 
                  id="customCss"
                  value={settings.customCss}
                  onChange={(e) => handleInputChange('customCss', e.target.value)}
                  placeholder="/* Add custom CSS for loading screen */"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">CSS Variables Available:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <code>--loading-bg-color</code>
                  <code>--loading-text-color</code>
                  <code>--loading-accent-color</code>
                  <code>--loading-logo-size</code>
                  <code>--loading-animation-speed</code>
                  <code>--loading-fade-duration</code>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={loadSettings} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Saved
                </Button>
                <Button 
                  onClick={() => setSettings({
                    enabled: true,
                    logoUrl: '',
                    logoSize: 100,
                    logoOpacity: 100,
                    mainTitle: 'ASTRA Villa',
                    subtitle: 'Loading, please wait...',
                    animationType: 'pulse',
                    animationSpeed: 2,
                    backgroundColor: '#000000',
                    textColor: '#ffffff',
                    accentColor: '#3b82f6',
                    showProgress: true,
                    showConnectionStatus: true,
                    customCss: '',
                    fadeInDuration: 300,
                    pulseEffect: true,
                    particleEffect: false,
                    gradientBackground: true
                  })}
                  variant="outline"
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingCustomization;
