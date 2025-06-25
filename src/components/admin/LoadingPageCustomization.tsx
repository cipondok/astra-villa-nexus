import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Palette, Type, Zap, Eye, Save } from 'lucide-react';

interface LoadingPageSettings {
  // Basic Settings
  enabled: boolean;
  message: string;
  subMessage: string;
  duration: number;
  
  // Branding
  logoText: string;
  logoSubtext: string;
  showConnectionStatus: boolean;
  
  // Animation Settings
  animationType: 'pulse' | 'bounce' | 'spin' | 'gradient' | 'dots';
  animationSpeed: number;
  
  // Color Settings
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  
  // Custom CSS
  customCSS: string;
}

const LoadingPageCustomization = () => {
  const [settings, setSettings] = useState<LoadingPageSettings>({
    enabled: true,
    message: 'Initializing ASTRA Villa...',
    subMessage: 'Please wait while we prepare your experience',
    duration: 3000,
    logoText: 'ASTRA Villa',
    logoSubtext: '',
    showConnectionStatus: true,
    animationType: 'gradient',
    animationSpeed: 2,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#7f5af0',
    gradientFrom: '#7f5af0',
    gradientTo: '#2cb67d',
    fontFamily: 'Inter',
    fontSize: '16',
    fontWeight: '400',
    customCSS: ''
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'loading_page');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          let value = setting.value;
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if not valid JSON
            }
          }
          acc[setting.key] = value;
          return acc;
        }, {} as any);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading loading page settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value,
        category: 'loading_page',
        description: `Loading page setting for ${key}`,
        is_public: false
      }));

      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting, {
            onConflict: 'key,category'
          });
        
        if (error) {
          console.error('Error saving setting:', setting.key, error);
          throw error;
        }
      }

      showSuccess('Settings Saved', 'Loading page settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save loading page settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const previewStyles = {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor,
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    fontWeight: settings.fontWeight,
  };

  const logoStyles = {
    background: `linear-gradient(45deg, ${settings.gradientFrom}, ${settings.gradientTo})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loading Page Customization</h2>
          <p className="text-gray-600">Customize the loading screen experience</p>
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
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-96 flex items-center justify-center relative rounded-lg"
              style={previewStyles}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2" style={logoStyles}>
                    {settings.logoText}
                  </h1>
                  {settings.logoSubtext && (
                    <p className="text-lg opacity-75">{settings.logoSubtext}</p>
                  )}
                </div>
                
                {settings.animationType === 'dots' && (
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{backgroundColor: settings.accentColor}}></div>
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{backgroundColor: settings.accentColor, animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{backgroundColor: settings.accentColor, animationDelay: '0.4s'}}></div>
                  </div>
                )}
                
                {settings.animationType === 'spin' && (
                  <Loader2 className="h-8 w-8 animate-spin" style={{color: settings.accentColor}} />
                )}
                
                <div className="text-center">
                  <p className="text-sm mb-2">{settings.message}</p>
                  {settings.subMessage && (
                    <p className="text-xs opacity-60">{settings.subMessage}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Loading Page</span>
                  <Switch 
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Main Message</label>
                  <Input 
                    value={settings.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Initializing ASTRA Villa..." 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sub Message</label>
                  <Input 
                    value={settings.subMessage}
                    onChange={(e) => handleInputChange('subMessage', e.target.value)}
                    placeholder="Please wait while we prepare your experience" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Display Duration (ms)</label>
                  <Input 
                    type="number"
                    value={settings.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 3000)}
                    placeholder="3000" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Show Connection Status</span>
                  <Switch 
                    checked={settings.showConnectionStatus}
                    onCheckedChange={(checked) => handleInputChange('showConnectionStatus', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Logo Text</label>
                <Input 
                  value={settings.logoText}
                  onChange={(e) => handleInputChange('logoText', e.target.value)}
                  placeholder="ASTRA Villa" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Logo Subtext</label>
                <Input 
                  value={settings.logoSubtext}
                  onChange={(e) => handleInputChange('logoSubtext', e.target.value)}
                  placeholder="Real Estate Platform" 
                />
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
                <label className="text-sm font-medium">Animation Type</label>
                <Select 
                  value={settings.animationType}
                  onValueChange={(value) => handleInputChange('animationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                    <SelectItem value="spin">Spinner</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Animation Speed: {settings.animationSpeed}s</label>
                <Slider
                  value={[settings.animationSpeed]}
                  onValueChange={(value) => handleInputChange('animationSpeed', value[0])}
                  max={5}
                  min={0.5}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styling">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Background Color</label>
                  <Input 
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Text Color</label>
                  <Input 
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Accent Color</label>
                  <Input 
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gradient From</label>
                  <Input 
                    type="color"
                    value={settings.gradientFrom}
                    onChange={(e) => handleInputChange('gradientFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gradient To</label>
                  <Input 
                    type="color"
                    value={settings.gradientTo}
                    onChange={(e) => handleInputChange('gradientTo', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Font Family</label>
                  <Select 
                    value={settings.fontFamily}
                    onValueChange={(value) => handleInputChange('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Orbitron">Orbitron</SelectItem>
                      <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Font Size (px)</label>
                  <Input 
                    type="number"
                    value={settings.fontSize}
                    onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    placeholder="16" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Font Weight</label>
                  <Select 
                    value={settings.fontWeight}
                    onValueChange={(value) => handleInputChange('fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>
                Add custom CSS for advanced styling. Use CSS variables for dynamic values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={settings.customCSS}
                onChange={(e) => handleInputChange('customCSS', e.target.value)}
                placeholder={`/* Custom CSS for loading page */
.loading-container {
  /* Your custom styles here */
}

@keyframes customAnimation {
  /* Your custom animations here */
}`}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingPageCustomization;
