
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
import { Droplets, Save, RefreshCw } from "lucide-react";
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

  // Update local settings when data loads
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
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: themeSettings.primaryColor }} />
        <span className="ml-2 text-muted-foreground">Loading watermark settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: themeSettings.primaryColor }}>
            Property Watermark Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure watermarks for property images and virtual tours
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateWatermarkMutation.isPending}
          style={{ backgroundColor: themeSettings.primaryColor }}
          className="hover:opacity-90 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateWatermarkMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5" style={{ color: themeSettings.primaryColor }} />
              Watermark Configuration
            </CardTitle>
            <CardDescription className="text-sm">
              Basic watermark settings for property images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="watermark-enabled" className="text-sm font-medium">Enable Watermark</Label>
                <p className="text-xs text-muted-foreground">
                  Add watermark to all property images
                </p>
              </div>
              <Switch
                id="watermark-enabled"
                checked={localSettings.enabled}
                onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark-text" className="text-sm font-medium">Watermark Text</Label>
              <Input
                id="watermark-text"
                value={localSettings.text}
                onChange={(e) => handleSettingChange('text', e.target.value)}
                placeholder="Enter watermark text"
                className="border-2 focus-visible:ring-2"
                style={{ 
                  borderColor: `${themeSettings.primaryColor}20`,
                  '--tw-ring-color': `${themeSettings.primaryColor}40`
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark-position" className="text-sm font-medium">Position</Label>
              <Select 
                value={localSettings.position} 
                onValueChange={(value) => handleSettingChange('position', value)}
              >
                <SelectTrigger className="border-2" style={{ borderColor: `${themeSettings.primaryColor}20` }}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="watermark-color" className="text-sm font-medium">Watermark Color</Label>
              <div className="flex gap-2">
                <Input
                  id="watermark-color"
                  type="color"
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  className="w-16 h-10 p-1 border-2"
                  style={{ borderColor: `${themeSettings.primaryColor}40` }}
                />
                <Input
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1 border-2"
                  style={{ borderColor: `${themeSettings.primaryColor}20` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Appearance Settings</CardTitle>
            <CardDescription className="text-sm">
              Fine-tune watermark appearance and visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="watermark-opacity" className="text-sm font-medium">
                Opacity: <span style={{ color: themeSettings.primaryColor }}>{localSettings.opacity}%</span>
              </Label>
              <Slider
                id="watermark-opacity"
                min={10}
                max={100}
                step={5}
                value={[localSettings.opacity]}
                onValueChange={(value) => handleSettingChange('opacity', value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="watermark-size" className="text-sm font-medium">
                Font Size: <span style={{ color: themeSettings.primaryColor }}>{localSettings.size}px</span>
              </Label>
              <Slider
                id="watermark-size"
                min={10}
                max={48}
                step={2}
                value={[localSettings.size]}
                onValueChange={(value) => handleSettingChange('size', value[0])}
                className="w-full"
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border" style={{ borderColor: `${themeSettings.primaryColor}20` }}>
              <h4 className="font-medium mb-3 text-sm" style={{ color: themeSettings.primaryColor }}>
                Live Preview
              </h4>
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-32 rounded-md border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  Property Image Preview
                </div>
                {localSettings.enabled && (
                  <div
                    className={`absolute text-sm font-medium pointer-events-none ${
                      localSettings.position === 'top-left' ? 'top-2 left-2' :
                      localSettings.position === 'top-center' ? 'top-2 left-1/2 transform -translate-x-1/2' :
                      localSettings.position === 'top-right' ? 'top-2 right-2' :
                      localSettings.position === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                      localSettings.position === 'bottom-left' ? 'bottom-2 left-2' :
                      localSettings.position === 'bottom-center' ? 'bottom-2 left-1/2 transform -translate-x-1/2' :
                      'bottom-2 right-2'
                    }`}
                    style={{
                      color: localSettings.color,
                      opacity: localSettings.opacity / 100,
                      fontSize: `${localSettings.size}px`,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
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
