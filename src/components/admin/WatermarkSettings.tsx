
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
import { Upload, Image as ImageIcon, Type, Save, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface WatermarkSettingsProps {
  propertyId: string;
}

const WatermarkSettings = ({ propertyId }: WatermarkSettingsProps) => {
  const [settings, setSettings] = useState({
    is_enabled: true,
    watermark_type: 'text',
    text_content: 'VillaAstra',
    text_color: '#FFFFFF',
    text_opacity: 0.70,
    text_size: 24,
    text_font: 'Arial',
    watermark_image_url: '',
    image_opacity: 0.70,
    image_scale: 1.00,
    position_x: 'center',
    position_y: 'center',
    offset_x: 0,
    offset_y: 0,
    applies_to_all: false
  });

  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch watermark settings
  const { data: watermarkSettings, isLoading } = useQuery({
    queryKey: ['watermark-settings', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_watermark_settings')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (watermarkSettings) {
      setSettings({
        is_enabled: watermarkSettings.is_enabled ?? true,
        watermark_type: watermarkSettings.watermark_type ?? 'text',
        text_content: watermarkSettings.text_content ?? 'VillaAstra',
        text_color: watermarkSettings.text_color ?? '#FFFFFF',
        text_opacity: watermarkSettings.text_opacity ?? 0.70,
        text_size: watermarkSettings.text_size ?? 24,
        text_font: watermarkSettings.text_font ?? 'Arial',
        watermark_image_url: watermarkSettings.watermark_image_url ?? '',
        image_opacity: watermarkSettings.image_opacity ?? 0.70,
        image_scale: watermarkSettings.image_scale ?? 1.00,
        position_x: watermarkSettings.position_x ?? 'center',
        position_y: watermarkSettings.position_y ?? 'center',
        offset_x: watermarkSettings.offset_x ?? 0,
        offset_y: watermarkSettings.offset_y ?? 0,
        applies_to_all: watermarkSettings.applies_to_all ?? false
      });
    }
  }, [watermarkSettings]);

  // Generate AV filename
  const generateAVFilename = (originalFile: File): string => {
    const extension = originalFile.name.split('.').pop();
    const randomDigits = Math.random().toString().slice(2, 17).padStart(15, '0');
    return `AV${randomDigits}.${extension}`;
  };

  // Upload watermark image
  const uploadWatermarkImage = async (file: File): Promise<string> => {
    const fileName = `watermarks/${generateAVFilename(file)}`;
    
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Failed to upload watermark image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Save watermark settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: typeof settings) => {
      let watermarkImageUrl = settingsData.watermark_image_url;
      
      // Upload new watermark image if selected
      if (watermarkImageFile) {
        watermarkImageUrl = await uploadWatermarkImage(watermarkImageFile);
      }

      const dataToSave = {
        property_id: propertyId,
        ...settingsData,
        watermark_image_url: watermarkImageUrl,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('property_watermark_settings')
        .upsert(dataToSave, { onConflict: 'property_id' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Watermark Settings Saved", "Watermark settings have been updated successfully.");
      setWatermarkImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['watermark-settings', propertyId] });
    },
    onError: (error: any) => {
      showError("Save Failed", error.message);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkImageFile(file);
    } else {
      showError("Invalid File", "Please select a valid image file.");
    }
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const previewWatermark = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw sample image placeholder
      ctx.fillStyle = '#ddd';
      ctx.fillRect(50, 50, 300, 200);
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Property Image', canvas.width / 2, canvas.height / 2);
      
      // Draw watermark preview
      if (settings.is_enabled) {
        if (settings.watermark_type === 'text' || settings.watermark_type === 'both') {
          ctx.globalAlpha = settings.text_opacity;
          ctx.fillStyle = settings.text_color;
          ctx.font = `${settings.text_size}px ${settings.text_font}`;
          ctx.textAlign = 'center';
          
          let x = canvas.width / 2;
          let y = canvas.height / 2;
          
          if (settings.position_x === 'left') x = 50;
          if (settings.position_x === 'right') x = canvas.width - 50;
          if (settings.position_y === 'top') y = 50;
          if (settings.position_y === 'bottom') y = canvas.height - 50;
          
          x += settings.offset_x;
          y += settings.offset_y;
          
          ctx.fillText(settings.text_content, x, y);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Watermark Settings
        </CardTitle>
        <CardDescription>
          Configure watermark settings for property images. Changes apply to new uploads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Loading watermark settings...</div>
        ) : (
          <>
            {/* Enable/Disable Watermark */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Watermark</Label>
                <p className="text-sm text-muted-foreground">Apply watermark to property images</p>
              </div>
              <Switch
                checked={settings.is_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_enabled: checked }))}
              />
            </div>

            {settings.is_enabled && (
              <>
                {/* Watermark Type */}
                <div className="space-y-2">
                  <Label>Watermark Type</Label>
                  <Select value={settings.watermark_type} onValueChange={(value) => setSettings(prev => ({ ...prev, watermark_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="image">Image Only</SelectItem>
                      <SelectItem value="both">Text + Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Settings */}
                {(settings.watermark_type === 'text' || settings.watermark_type === 'both') && (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Text Watermark Settings
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Input
                          value={settings.text_content}
                          onChange={(e) => setSettings(prev => ({ ...prev, text_content: e.target.value }))}
                          placeholder="VillaAstra"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.text_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.text_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Font Size: {settings.text_size}px</Label>
                        <Slider
                          value={[settings.text_size]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, text_size: value }))}
                          min={12}
                          max={72}
                          step={1}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Opacity: {Math.round(settings.text_opacity * 100)}%</Label>
                        <Slider
                          value={[settings.text_opacity]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, text_opacity: value }))}
                          min={0.1}
                          max={1}
                          step={0.05}
                        />
                      </div>
                      
                      <div className="space-y-2 col-span-2">
                        <Label>Font Family</Label>
                        <Select value={settings.text_font} onValueChange={(value) => setSettings(prev => ({ ...prev, text_font: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Settings */}
                {(settings.watermark_type === 'image' || settings.watermark_type === 'both') && (
                  <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image Watermark Settings
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Watermark Image</Label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="watermark-upload"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('watermark-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                          {watermarkImageFile && (
                            <span className="text-sm text-green-600 flex items-center">
                              Selected: {watermarkImageFile.name}
                            </span>
                          )}
                        </div>
                        {settings.watermark_image_url && !watermarkImageFile && (
                          <img src={settings.watermark_image_url} alt="Current watermark" className="w-20 h-20 object-cover rounded border" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Image Opacity: {Math.round(settings.image_opacity * 100)}%</Label>
                          <Slider
                            value={[settings.image_opacity]}
                            onValueChange={([value]) => setSettings(prev => ({ ...prev, image_opacity: value }))}
                            min={0.1}
                            max={1}
                            step={0.05}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Image Scale: {Math.round(settings.image_scale * 100)}%</Label>
                          <Slider
                            value={[settings.image_scale]}
                            onValueChange={([value]) => setSettings(prev => ({ ...prev, image_scale: value }))}
                            min={0.1}
                            max={3}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Position Settings */}
                <div className="space-y-4 p-4 border rounded-lg bg-purple-50">
                  <h4 className="font-medium">Position Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Horizontal Position</Label>
                      <Select value={settings.position_x} onValueChange={(value) => setSettings(prev => ({ ...prev, position_x: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Vertical Position</Label>
                      <Select value={settings.position_y} onValueChange={(value) => setSettings(prev => ({ ...prev, position_y: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>X Offset: {settings.offset_x}px</Label>
                      <Slider
                        value={[settings.offset_x]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, offset_x: value }))}
                        min={-200}
                        max={200}
                        step={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Y Offset: {settings.offset_y}px</Label>
                      <Slider
                        value={[settings.offset_y]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, offset_y: value }))}
                        min={-200}
                        max={200}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img src={previewWatermark()} alt="Watermark preview" className="max-w-full h-auto" />
                  </div>
                </div>

                {/* Global Setting */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <Label className="text-base font-medium">Apply to All Properties</Label>
                    <p className="text-sm text-muted-foreground">Use these settings for all properties by default</p>
                  </div>
                  <Switch
                    checked={settings.applies_to_all}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, applies_to_all: checked }))}
                  />
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saveSettingsMutation.isPending}
                className="flex items-center gap-2"
              >
                {saveSettingsMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WatermarkSettings;
