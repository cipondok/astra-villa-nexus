
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Droplets, Save, RefreshCw, Eye, Settings } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";

const PropertyWatermarkSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { themeSettings } = useThemeSettings();

  const { data: watermarkSettings, isLoading } = useQuery({
    queryKey: ['watermark-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'watermark_enabled',
          'watermark_text',
          'watermark_position',
          'watermark_opacity',
          'watermark_size',
          'watermark_color'
        ]);
      
      if (error) throw error;
      
      const settings: any = {};
      data?.forEach((setting) => {
        settings[setting.key] = setting.value;
      });
      
      return {
        enabled: settings.watermark_enabled || false,
        text: settings.watermark_text || 'AstraVilla Realty',
        position: settings.watermark_position || 'bottom-right',
        opacity: settings.watermark_opacity || 50,
        size: settings.watermark_size || 16,
        color: settings.watermark_color || themeSettings.primaryColor
      };
    },
  });

  const [localSettings, setLocalSettings] = useState({
    enabled: false,
    text: 'AstraVilla Realty',
    position: 'bottom-right',
    opacity: 50,
    size: 16,
    color: themeSettings.primaryColor
  });

  useEffect(() => {
    if (watermarkSettings) {
      setLocalSettings(watermarkSettings);
    }
  }, [watermarkSettings]);

  const updateWatermarkMutation = useMutation({
    mutationFn: async (settings: any) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key: `watermark_${key}`,
        value: value as any,
        category: 'watermark',
        description: `Watermark ${key} setting`
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: update.key,
            value: update.value,
            category: update.category,
            description: update.description,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Watermark Settings Updated", "Watermark settings have been saved successfully.");
      queryClient.invalidateQueries({ queryKey: ['watermark-settings'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleSave = () => {
    updateWatermarkMutation.mutate(localSettings);
  };

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-3" style={{ color: themeSettings.primaryColor }} />
        <span className="text-muted-foreground">Loading watermark settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeSettings.primaryColor }}>
            Property Watermark Settings
          </h3>
          <p className="text-muted-foreground">
            Configure watermarks for property images and virtual tours
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateWatermarkMutation.isPending}
          className="text-white font-medium px-6"
          style={{ 
            backgroundColor: themeSettings.primaryColor,
            borderColor: themeSettings.primaryColor 
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateWatermarkMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Basic Configuration Card */}
        <Card className="border hover:shadow-lg transition-all duration-200" style={{ borderColor: `${themeSettings.primaryColor}20` }}>
          <CardHeader className="pb-4" style={{ backgroundColor: `${themeSettings.primaryColor}08` }}>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeSettings.primaryColor}15` }}>
                <Settings className="h-5 w-5" style={{ color: themeSettings.primaryColor }} />
              </div>
              Basic Configuration
            </CardTitle>
            <CardDescription>
              Essential watermark settings for property images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Watermark */}
            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: `${themeSettings.primaryColor}20`, backgroundColor: `${themeSettings.primaryColor}05` }}>
              <div className="space-y-1">
                <Label htmlFor="watermark-enabled" className="font-medium">Enable Watermark</Label>
                <p className="text-sm text-muted-foreground">
                  Add watermark to all property images
                </p>
              </div>
              <Switch
                id="watermark-enabled"
                checked={localSettings.enabled}
                onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
              />
            </div>

            {/* Watermark Text */}
            <div className="space-y-3">
              <Label htmlFor="watermark-text" className="font-medium">Watermark Text</Label>
              <Input
                id="watermark-text"
                value={localSettings.text}
                onChange={(e) => handleSettingChange('text', e.target.value)}
                placeholder="Enter watermark text"
                className="border focus:ring-2 transition-all"
                style={{ 
                  borderColor: `${themeSettings.primaryColor}30`,
                  '--tw-ring-color': `${themeSettings.primaryColor}40`
                } as React.CSSProperties}
              />
            </div>

            {/* Position Selection */}
            <div className="space-y-3">
              <Label htmlFor="watermark-position" className="font-medium">Position</Label>
              <Select 
                value={localSettings.position} 
                onValueChange={(value) => handleSettingChange('position', value)}
              >
                <SelectTrigger className="border focus:ring-2" style={{ 
                  borderColor: `${themeSettings.primaryColor}30`,
                  '--tw-ring-color': `${themeSettings.primaryColor}40`
                } as React.CSSProperties}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="border" style={{ borderColor: `${themeSettings.primaryColor}20` }}>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label htmlFor="watermark-color" className="font-medium">Watermark Color</Label>
              <div className="flex gap-3">
                <Input
                  id="watermark-color"
                  type="color"
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  className="w-20 h-12 p-1 border rounded-lg cursor-pointer"
                  style={{ borderColor: `${themeSettings.primaryColor}40` }}
                />
                <Input
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 border focus:ring-2"
                  style={{ 
                    borderColor: `${themeSettings.primaryColor}30`,
                    '--tw-ring-color': `${themeSettings.primaryColor}40`
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Preview Card */}
        <Card className="border hover:shadow-lg transition-all duration-200" style={{ borderColor: `${themeSettings.primaryColor}20` }}>
          <CardHeader className="pb-4" style={{ backgroundColor: `${themeSettings.primaryColor}08` }}>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeSettings.primaryColor}15` }}>
                <Eye className="h-5 w-5" style={{ color: themeSettings.primaryColor }} />
              </div>
              Appearance & Preview
            </CardTitle>
            <CardDescription>
              Fine-tune watermark appearance and see live preview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Opacity Slider */}
            <div className="space-y-3">
              <Label className="font-medium flex items-center justify-between">
                <span>Opacity</span>
                <span className="font-bold text-sm px-2 py-1 rounded" style={{ 
                  color: themeSettings.primaryColor,
                  backgroundColor: `${themeSettings.primaryColor}10`
                }}>
                  {localSettings.opacity}%
                </span>
              </Label>
              <div className="px-2">
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={[localSettings.opacity]}
                  onValueChange={(value) => handleSettingChange('opacity', value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-3">
              <Label className="font-medium flex items-center justify-between">
                <span>Font Size</span>
                <span className="font-bold text-sm px-2 py-1 rounded" style={{ 
                  color: themeSettings.primaryColor,
                  backgroundColor: `${themeSettings.primaryColor}10`
                }}>
                  {localSettings.size}px
                </span>
              </Label>
              <div className="px-2">
                <Slider
                  min={10}
                  max={48}
                  step={2}
                  value={[localSettings.size]}
                  onValueChange={(value) => handleSettingChange('size', value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <Label className="font-medium flex items-center gap-2" style={{ color: themeSettings.primaryColor }}>
                <Droplets className="h-4 w-4" />
                Live Preview
              </Label>
              <div 
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-40 rounded-xl border overflow-hidden shadow-inner"
                style={{ borderColor: `${themeSettings.primaryColor}20` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-lg bg-gray-200 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Property Image Preview</p>
                  </div>
                </div>
                
                {localSettings.enabled && (
                  <div
                    className={`absolute font-semibold pointer-events-none select-none ${
                      localSettings.position === 'top-left' ? 'top-3 left-3' :
                      localSettings.position === 'top-center' ? 'top-3 left-1/2 transform -translate-x-1/2' :
                      localSettings.position === 'top-right' ? 'top-3 right-3' :
                      localSettings.position === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                      localSettings.position === 'bottom-left' ? 'bottom-3 left-3' :
                      localSettings.position === 'bottom-center' ? 'bottom-3 left-1/2 transform -translate-x-1/2' :
                      'bottom-3 right-3'
                    }`}
                    style={{
                      color: localSettings.color,
                      opacity: localSettings.opacity / 100,
                      fontSize: `${localSettings.size}px`,
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5), 0 0 5px rgba(255,255,255,0.3)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                    }}
                  >
                    {localSettings.text}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyWatermarkSettings;
