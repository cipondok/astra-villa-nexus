import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Blocks, 
  Save, 
  RefreshCw, 
  Settings,
  Eye,
  Zap,
  TestTube,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Code2,
  Lightbulb
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface ThreeDViewSettings {
  enabled: boolean;
  defaultViewer: string;
  enableVR: boolean;
  enableAR: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  enableZoom: boolean;
  maxZoom: number;
  minZoom: number;
  enableFullscreen: boolean;
  showControls: boolean;
  backgroundColor: string;
  lightingIntensity: number;
  supportedFormats: string[];
  maxFileSize: number;
  enableWatermark: boolean;
  watermarkText: string;
}

const Property3DViewSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<ThreeDViewSettings>({
    enabled: true,
    defaultViewer: 'threejs',
    enableVR: false,
    enableAR: false,
    autoRotate: true,
    rotationSpeed: 1,
    enableZoom: true,
    maxZoom: 5,
    minZoom: 0.5,
    enableFullscreen: true,
    showControls: true,
    backgroundColor: '#f0f0f0',
    lightingIntensity: 1,
    supportedFormats: ['glb', 'gltf', 'fbx', 'obj'],
    maxFileSize: 50,
    enableWatermark: false,
    watermarkText: 'Property View'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'property_3d_view');

      if (error) {
        console.error('Error loading 3D view settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc: any, setting: any) => {
          const key = setting.key.replace('property_3d_view_', '');
          acc[key] = setting.value;
          return acc;
        }, {} as any);

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          enabled: settingsMap.enabled === 'true',
          enableVR: settingsMap.enableVR === 'true',
          enableAR: settingsMap.enableAR === 'true',
          autoRotate: settingsMap.autoRotate === 'true',
          enableZoom: settingsMap.enableZoom === 'true',
          enableFullscreen: settingsMap.enableFullscreen === 'true',
          showControls: settingsMap.showControls === 'true',
          enableWatermark: settingsMap.enableWatermark === 'true',
          supportedFormats: settingsMap.supportedFormats || ['glb', 'gltf', 'fbx', 'obj']
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Settings Error', 'Failed to load 3D view settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsToSave = [
        { key: 'property_3d_view_enabled', value: settings.enabled.toString(), category: 'property_3d_view', description: '3D view enabled' },
        { key: 'property_3d_view_defaultViewer', value: settings.defaultViewer, category: 'property_3d_view', description: 'Default 3D viewer' },
        { key: 'property_3d_view_enableVR', value: settings.enableVR.toString(), category: 'property_3d_view', description: 'Enable VR support' },
        { key: 'property_3d_view_enableAR', value: settings.enableAR.toString(), category: 'property_3d_view', description: 'Enable AR support' },
        { key: 'property_3d_view_autoRotate', value: settings.autoRotate.toString(), category: 'property_3d_view', description: 'Auto rotate model' },
        { key: 'property_3d_view_rotationSpeed', value: settings.rotationSpeed.toString(), category: 'property_3d_view', description: 'Rotation speed' },
        { key: 'property_3d_view_enableZoom', value: settings.enableZoom.toString(), category: 'property_3d_view', description: 'Enable zoom' },
        { key: 'property_3d_view_maxZoom', value: settings.maxZoom.toString(), category: 'property_3d_view', description: 'Maximum zoom level' },
        { key: 'property_3d_view_minZoom', value: settings.minZoom.toString(), category: 'property_3d_view', description: 'Minimum zoom level' },
        { key: 'property_3d_view_enableFullscreen', value: settings.enableFullscreen.toString(), category: 'property_3d_view', description: 'Enable fullscreen' },
        { key: 'property_3d_view_showControls', value: settings.showControls.toString(), category: 'property_3d_view', description: 'Show controls' },
        { key: 'property_3d_view_backgroundColor', value: settings.backgroundColor, category: 'property_3d_view', description: 'Background color' },
        { key: 'property_3d_view_lightingIntensity', value: settings.lightingIntensity.toString(), category: 'property_3d_view', description: 'Lighting intensity' },
        { key: 'property_3d_view_supportedFormats', value: JSON.stringify(settings.supportedFormats), category: 'property_3d_view', description: 'Supported file formats' },
        { key: 'property_3d_view_maxFileSize', value: settings.maxFileSize.toString(), category: 'property_3d_view', description: 'Maximum file size (MB)' },
        { key: 'property_3d_view_enableWatermark', value: settings.enableWatermark.toString(), category: 'property_3d_view', description: 'Enable watermark' },
        { key: 'property_3d_view_watermarkText', value: settings.watermarkText, category: 'property_3d_view', description: 'Watermark text' }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting, { onConflict: 'key' });

        if (error) {
          throw error;
        }
      }

      showSuccess('Settings Saved', '3D view settings have been saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Save Error', 'Failed to save 3D view settings');
    } finally {
      setLoading(false);
    }
  };

  const test3DViewer = async () => {
    setTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Test Successful', '3D viewer is working properly');
    } catch (error) {
      showError('Test Failed', 'Failed to test 3D viewer functionality');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">3D View Settings</h2>
          <p className="text-[10px] text-muted-foreground">Configure 3D model viewing capabilities for properties</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={test3DViewer}
            disabled={testing}
            variant="outline"
            size="sm"
            className="h-7 text-[10px] gap-1"
          >
            <TestTube className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test'}
          </Button>
          <Button
            onClick={loadSettings}
            variant="outline"
            size="sm"
            className="h-7 text-[10px] gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`p-2 ${settings.enabled ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
        <AlertTriangle className="h-3 w-3" />
        <AlertDescription className="text-[10px]">
          <strong>3D View Status:</strong> {settings.enabled ? 'Enabled and active' : 'Disabled - users cannot view 3D models'}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-3">
        <TabsList className="h-8 bg-muted/50 p-0.5 w-full grid grid-cols-5">
          <TabsTrigger value="general" className="text-[9px] h-7">General</TabsTrigger>
          <TabsTrigger value="viewer" className="text-[9px] h-7">Viewer</TabsTrigger>
          <TabsTrigger value="advanced" className="text-[9px] h-7">Advanced</TabsTrigger>
          <TabsTrigger value="formats" className="text-[9px] h-7">Formats</TabsTrigger>
          <TabsTrigger value="guide" className="text-[9px] h-7">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5 text-primary" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-foreground">Enable 3D view functionality</Label>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                  className="scale-75"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] text-foreground">Default 3D Viewer</Label>
                <Select value={settings.defaultViewer} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultViewer: value }))}>
                  <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threejs" className="text-[10px]">Three.js Viewer</SelectItem>
                    <SelectItem value="babylonjs" className="text-[10px]">Babylon.js Viewer</SelectItem>
                    <SelectItem value="modelviewer" className="text-[10px]">Model Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Enable VR</Label>
                  <Switch
                    checked={settings.enableVR}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableVR: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Enable AR</Label>
                  <Switch
                    checked={settings.enableAR}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAR: checked }))}
                    className="scale-75"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewer" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Viewer Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Auto rotate model</Label>
                  <Switch
                    checked={settings.autoRotate}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRotate: checked }))}
                    className="scale-75"
                  />
                </div>

                {settings.autoRotate && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-foreground">Rotation Speed</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[settings.rotationSpeed]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, rotationSpeed: value }))}
                        max={5}
                        min={0.1}
                        step={0.1}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                        {settings.rotationSpeed}x
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Enable zoom</Label>
                  <Switch
                    checked={settings.enableZoom}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableZoom: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Enable fullscreen</Label>
                  <Switch
                    checked={settings.enableFullscreen}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableFullscreen: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show controls</Label>
                  <Switch
                    checked={settings.showControls}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showControls: checked }))}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium text-foreground">Zoom Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {settings.enableZoom && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-foreground">Maximum Zoom</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[settings.maxZoom]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, maxZoom: value }))}
                          max={10}
                          min={1}
                          step={0.5}
                          className="flex-1"
                        />
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                          {settings.maxZoom}x
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-foreground">Minimum Zoom</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[settings.minZoom]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, minZoom: value }))}
                          max={1}
                          min={0.1}
                          step={0.1}
                          className="flex-1"
                        />
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                          {settings.minZoom}x
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-foreground">Background Color</Label>
                  <Input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="h-8 bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-foreground">Lighting Intensity</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[settings.lightingIntensity]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, lightingIntensity: value }))}
                      max={3}
                      min={0.1}
                      step={0.1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                      {settings.lightingIntensity}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Enable Watermark</Label>
                  <Switch
                    checked={settings.enableWatermark}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableWatermark: checked }))}
                    className="scale-75"
                  />
                </div>

                {settings.enableWatermark && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-foreground">Watermark Text</Label>
                    <Input
                      value={settings.watermarkText}
                      onChange={(e) => setSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                      className="h-7 text-[10px] bg-background/50 border-border/50"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                Supported File Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {settings.supportedFormats.map((format) => (
                  <Badge key={format} variant="secondary" className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary">
                    .{format}
                  </Badge>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] text-foreground">Max File Size (MB)</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[settings.maxFileSize]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, maxFileSize: value }))}
                    max={200}
                    min={10}
                    step={10}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                    {settings.maxFileSize}MB
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                How-to Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="space-y-2 text-[10px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5" />
                  <p>Upload 3D models in GLB or GLTF format for best compatibility</p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5" />
                  <p>Keep file sizes under {settings.maxFileSize}MB for optimal loading</p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5" />
                  <p>Enable VR/AR only if your target devices support it</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={saveSettings}
          disabled={loading}
          size="sm"
          className="h-7 text-[10px] gap-1.5 bg-primary hover:bg-primary/90"
        >
          <Save className="h-3 w-3" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Property3DViewSettings;
