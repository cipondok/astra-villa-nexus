
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
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  Play, 
  Pause, 
  Settings,
  Image,
  Timer,
  Shuffle,
  AlertCircle
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import PropertySlideshow from '@/components/PropertySlideshow';

interface SlideSettings {
  autoplay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  slideEffect: string;
  slideSpeed: number;
  pauseOnHover: boolean;
  infiniteLoop: boolean;
  randomOrder: boolean;
  maxSlides: number;
}

const PropertySlideSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<SlideSettings>({
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    slideEffect: 'slide',
    slideSpeed: 300,
    pauseOnHover: true,
    infiniteLoop: true,
    randomOrder: false,
    maxSlides: 8
  });
  const [loading, setLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  // Force re-render of preview when settings change
  useEffect(() => {
    if (isPreviewMode) {
      setPreviewKey(prev => prev + 1);
    }
  }, [settings, isPreviewMode]);

  const loadSettings = async () => {
    try {
      console.log('Loading slide settings...');
      
      // Add timeout to the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 10000);
      });

      const queryPromise = supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'property_slides');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading slide settings:', error);
        showError('Database Error', 'Failed to load slide settings. Please check your connection.');
        return;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc, setting) => {
          const key = setting.key.replace('property_slides_', '');
          acc[key] = setting.value;
          return acc;
        }, {} as any);

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          autoplay: settingsMap.autoplay === 'true',
          showDots: settingsMap.showDots === 'true',
          showArrows: settingsMap.showArrows === 'true',
          pauseOnHover: settingsMap.pauseOnHover === 'true',
          infiniteLoop: settingsMap.infiniteLoop === 'true',
          randomOrder: settingsMap.randomOrder === 'true',
        }));
        
        console.log('Slide settings loaded successfully');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.message === 'Database connection timeout') {
        showError('Connection Timeout', 'Database connection timed out. Please check your internet connection and try again.');
      } else {
        showError('Settings Error', 'Failed to load slide settings');
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    console.log('Starting to save slide settings...');
    
    try {
      const settingsToSave = [
        { key: 'property_slides_autoplay', value: settings.autoplay.toString(), category: 'property_slides', description: 'Auto-play slides' },
        { key: 'property_slides_interval', value: settings.interval.toString(), category: 'property_slides', description: 'Slide interval in milliseconds' },
        { key: 'property_slides_showDots', value: settings.showDots.toString(), category: 'property_slides', description: 'Show navigation dots' },
        { key: 'property_slides_showArrows', value: settings.showArrows.toString(), category: 'property_slides', description: 'Show navigation arrows' },
        { key: 'property_slides_slideEffect', value: settings.slideEffect, category: 'property_slides', description: 'Slide transition effect' },
        { key: 'property_slides_slideSpeed', value: settings.slideSpeed.toString(), category: 'property_slides', description: 'Slide transition speed' },
        { key: 'property_slides_pauseOnHover', value: settings.pauseOnHover.toString(), category: 'property_slides', description: 'Pause on hover' },
        { key: 'property_slides_infiniteLoop', value: settings.infiniteLoop.toString(), category: 'property_slides', description: 'Infinite loop' },
        { key: 'property_slides_randomOrder', value: settings.randomOrder.toString(), category: 'property_slides', description: 'Random slide order' },
        { key: 'property_slides_maxSlides', value: settings.maxSlides.toString(), category: 'property_slides', description: 'Maximum slides to show' }
      ];

      console.log('Attempting to save settings to database...');

      // Add timeout to the save operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database save timeout')), 15000);
      });

      const savePromise = supabase
        .from('system_settings')
        .upsert(settingsToSave, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });

      const { error } = await Promise.race([savePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Database save error:', error);
        throw error;
      }

      console.log('Settings saved successfully to database');
      showSuccess('Settings Saved', 'Property slide settings have been saved successfully');
      
      // Refresh preview after saving
      if (isPreviewMode) {
        setPreviewKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      if (error.message === 'Database save timeout') {
        showError('Save Timeout', 'The save operation timed out. Please check your connection and try again.');
      } else if (error.message?.includes('timeout')) {
        showError('Connection Issue', 'Database connection is unstable. Please try again in a moment.');
      } else {
        showError('Save Error', 'Failed to save slide settings. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('Save operation completed');
    }
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      setPreviewKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Property Slide Settings</h2>
          <p className="text-gray-400">Configure how property image slides behave and appear</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={togglePreviewMode}
            variant="outline"
            size="sm"
          >
            {isPreviewMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPreviewMode ? 'Stop Preview' : 'Live Preview'}
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

      {/* Connection Status Warning */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div>
            <p className="text-yellow-300 font-medium">Database Connection Status</p>
            <p className="text-yellow-200 text-sm">
              If saving takes too long, there might be connection issues. Please ensure your internet connection is stable.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Playback Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.autoplay}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoplay: checked }))}
                  />
                  <Label className="text-white">Auto-play slides</Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Slide Interval (seconds)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.interval / 1000]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, interval: value * 1000 }))}
                      max={30}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-white border-slate-600">
                      {settings.interval / 1000}s
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.pauseOnHover}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pauseOnHover: checked }))}
                  />
                  <Label className="text-white">Pause on hover</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.infiniteLoop}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, infiniteLoop: checked }))}
                  />
                  <Label className="text-white">Infinite loop</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showDots}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDots: checked }))}
                  />
                  <Label className="text-white">Show navigation dots</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showArrows}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showArrows: checked }))}
                  />
                  <Label className="text-white">Show navigation arrows</Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Maximum Slides</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.maxSlides]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, maxSlides: value }))}
                      max={20}
                      min={3}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-white border-slate-600">
                      {settings.maxSlides}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Slide Effect</Label>
                  <Select value={settings.slideEffect} onValueChange={(value) => setSettings(prev => ({ ...prev, slideEffect: value }))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="flip">Flip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Transition Speed (ms)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.slideSpeed]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, slideSpeed: value }))}
                      max={2000}
                      min={100}
                      step={50}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-white border-slate-600">
                      {settings.slideSpeed}ms
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  checked={settings.randomOrder}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, randomOrder: checked }))}
                />
                <Label className="text-white flex items-center">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random slide order
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Live Preview</span>
                <Badge variant={isPreviewMode ? "default" : "secondary"}>
                  {isPreviewMode ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPreviewMode ? (
                <div className="bg-slate-900/50 rounded-lg p-4 min-h-[400px]">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Current Settings Applied:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Autoplay: {settings.autoplay ? 'On' : 'Off'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Interval: {settings.interval / 1000}s
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Dots: {settings.showDots ? 'On' : 'Off'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Arrows: {settings.showArrows ? 'On' : 'Off'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Effect: {settings.slideEffect}
                      </Badge>
                    </div>
                  </div>
                  <div className="border border-slate-700 rounded-lg overflow-hidden bg-white">
                    <PropertySlideshow key={previewKey} />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Preview Mode Inactive</h3>
                    <p className="text-gray-400 mb-4">Click "Live Preview" to see changes in real-time</p>
                    <Button onClick={togglePreviewMode} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Start Live Preview
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving... (This may take a moment)
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PropertySlideSettings;
