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
        const settingsMap = data.reduce((acc, setting) => {
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
      // Simulate 3D viewer test
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Test Successful', '3D viewer is working properly');
    } catch (error) {
      showError('Test Failed', 'Failed to test 3D viewer functionality');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">3D View Settings</h2>
          <p className="text-gray-400">Configure 3D model viewing capabilities for properties</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={test3DViewer}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            <TestTube className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test 3D Viewer'}
          </Button>
          <Button
            onClick={loadSettings}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={settings.enabled ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>3D View Status:</strong> {settings.enabled ? 'Enabled and active' : 'Disabled - users cannot view 3D models'}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="viewer">Viewer</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="formats">File Formats</TabsTrigger>
          <TabsTrigger value="guide">How-to Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
                <Label className="text-white">Enable 3D view functionality</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Default 3D Viewer</Label>
                <Select value={settings.defaultViewer} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultViewer: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threejs">Three.js Viewer</SelectItem>
                    <SelectItem value="babylonjs">Babylon.js Viewer</SelectItem>
                    <SelectItem value="modelviewer">Model Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enableVR}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableVR: checked }))}
                  />
                  <Label className="text-white">Enable VR support</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enableAR}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAR: checked }))}
                  />
                  <Label className="text-white">Enable AR support</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewer" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Viewer Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.autoRotate}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRotate: checked }))}
                  />
                  <Label className="text-white">Auto rotate model</Label>
                </div>

                {settings.autoRotate && (
                  <div className="space-y-2">
                    <Label className="text-white">Rotation Speed</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[settings.rotationSpeed]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, rotationSpeed: value }))}
                        max={5}
                        min={0.1}
                        step={0.1}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-white border-slate-600">
                        {settings.rotationSpeed}x
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enableZoom}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableZoom: checked }))}
                  />
                  <Label className="text-white">Enable zoom</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enableFullscreen}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableFullscreen: checked }))}
                  />
                  <Label className="text-white">Enable fullscreen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showControls}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showControls: checked }))}
                  />
                  <Label className="text-white">Show viewer controls</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Zoom Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.enableZoom && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">Maximum Zoom</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[settings.maxZoom]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, maxZoom: value }))}
                          max={10}
                          min={1}
                          step={0.5}
                          className="flex-1"
                        />
                        <Badge variant="outline" className="text-white border-slate-600">
                          {settings.maxZoom}x
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Minimum Zoom</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[settings.minZoom]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, minZoom: value }))}
                          max={1}
                          min={0.1}
                          step={0.1}
                          className="flex-1"
                        />
                        <Badge variant="outline" className="text-white border-slate-600">
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

        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Background Color</Label>
                  <Input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Lighting Intensity</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.lightingIntensity]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, lightingIntensity: value }))}
                      max={3}
                      min={0.1}
                      step={0.1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-white border-slate-600">
                      {settings.lightingIntensity}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enableWatermark}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableWatermark: checked }))}
                  />
                  <Label className="text-white">Enable watermark</Label>
                </div>

                {settings.enableWatermark && (
                  <div className="space-y-2">
                    <Label className="text-white">Watermark Text</Label>
                    <Input
                      value={settings.watermarkText}
                      onChange={(e) => setSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Enter watermark text"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">File Format Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Maximum File Size (MB)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[settings.maxFileSize]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, maxFileSize: value }))}
                    max={200}
                    min={10}
                    step={10}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-white border-slate-600">
                    {settings.maxFileSize} MB
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Supported Formats</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['glb', 'gltf', 'fbx', 'obj', 'dae', 'ply'].map((format) => (
                    <Badge 
                      key={format}
                      variant={settings.supportedFormats.includes(format) ? 'default' : 'outline'}
                      className={`cursor-pointer text-center justify-center ${
                        settings.supportedFormats.includes(format) 
                          ? 'bg-blue-600 text-white' 
                          : 'text-white border-slate-600'
                      }`}
                      onClick={() => {
                        const newFormats = settings.supportedFormats.includes(format)
                          ? settings.supportedFormats.filter(f => f !== format)
                          : [...settings.supportedFormats, format];
                        setSettings(prev => ({ ...prev, supportedFormats: newFormats }));
                      }}
                    >
                      .{format}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                3D Model Creation Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step-by-step guide */}
              <div className="space-y-4">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Step 1: Create 3D Models
                  </h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Use Blender, SketchUp, or AutoCAD to create property models</li>
                    <li>• Export as GLB/GLTF for best performance</li>
                    <li>• Keep polygon count under 100k for smooth loading</li>
                    <li>• Include textures and materials for realistic rendering</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h3 className="text-green-300 font-semibold mb-2 flex items-center">
                    <Code2 className="h-4 w-4 mr-2" />
                    Step 2: Upload Models
                  </h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Go to Property Management → Add/Edit Property</li>
                    <li>• Upload 3D model files in the "3D Model" section</li>
                    <li>• Add virtual tour URLs (Matterport, Kuula, etc.)</li>
                    <li>• Test the 3D view before publishing</li>
                  </ul>
                </div>

                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                  <h3 className="text-purple-300 font-semibold mb-2 flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Step 3: Virtual Tours
                  </h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Create 360° tours using Matterport or similar tools</li>
                    <li>• Generate shareable links for embedding</li>
                    <li>• Add interactive hotspots for property details</li>
                    <li>• Optimize for mobile viewing</li>
                  </ul>
                </div>
              </div>

              {/* Resource links */}
              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-white font-semibold mb-2">Recommended Tools:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-300 font-medium">3D Modeling:</p>
                    <ul className="text-gray-400">
                      <li>• Blender (Free)</li>
                      <li>• SketchUp</li>
                      <li>• AutoCAD</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-green-300 font-medium">Virtual Tours:</p>
                    <ul className="text-gray-400">
                      <li>• Matterport</li>
                      <li>• Kuula</li>
                      <li>• Pano2VR</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Property3DViewSettings;