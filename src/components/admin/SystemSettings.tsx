import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Save, RefreshCw, Check, X, Image, Upload } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SettingsState {
  email_verification: boolean;
  two_factor_auth: boolean;
  maintenance_mode: boolean;
  user_registration: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  data_backup: boolean;
  auto_updates: boolean;
  site_name: string;
  site_title: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  max_file_size: string;
  session_timeout: string;
  api_rate_limit: string;
  google_analytics_id: string;
  meta_keywords: string;
  meta_description: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  auto_approve_properties: boolean;
  max_property_images: string;
  property_listing_duration: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    email_verification: true,
    two_factor_auth: false,
    maintenance_mode: false,
    user_registration: true,
    email_notifications: true,
    push_notifications: false,
    data_backup: true,
    auto_updates: false,
    site_name: "Astra Villa",
    site_title: "Astra Villa - Premium Property Management",
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    support_phone: "+1-555-0123",
    max_file_size: "10",
    session_timeout: "30",
    api_rate_limit: "1000",
    google_analytics_id: "",
    meta_keywords: "",
    meta_description: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    auto_approve_properties: false,
    max_property_images: "20",
    property_listing_duration: "90"
  });

  // Add watermark settings state
  const [watermarkSettings, setWatermarkSettings] = useState({
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
    offset_y: 0
  });

  const [savingStates, setSavingStates] = useState<{[key: string]: 'idle' | 'saving' | 'success' | 'error'}>({});
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch watermark settings
  const { data: globalWatermarkSettings } = useQuery({
    queryKey: ['global-watermark-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'watermark');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Load watermark settings from database
  useEffect(() => {
    if (globalWatermarkSettings && globalWatermarkSettings.length > 0) {
      const loadedWatermarkSettings = { ...watermarkSettings };
      
      globalWatermarkSettings.forEach((setting: any) => {
        const key = setting.key.replace('watermark_', '');
        if (key in loadedWatermarkSettings) {
          let value = setting.value?.value || setting.value;
          
          if (typeof loadedWatermarkSettings[key as keyof typeof loadedWatermarkSettings] === 'boolean') {
            value = Boolean(value === true || value === 'true' || value === 1);
          } else if (typeof loadedWatermarkSettings[key as keyof typeof loadedWatermarkSettings] === 'number') {
            value = parseFloat(value) || 0;
          } else {
            value = String(value || '');
          }
          
          (loadedWatermarkSettings as any)[key] = value;
        }
      });
      
      setWatermarkSettings(loadedWatermarkSettings);
    }
  }, [globalWatermarkSettings]);

  // Fetch system settings with better error handling
  const { data: systemSettings, isLoading, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      try {
        console.log('Fetching system settings from database...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('*');
        
        if (error) {
          console.error('Error fetching system settings:', error);
          // Don't throw error, return empty array instead
          return [];
        }
        
        console.log('Fetched system settings:', data?.length || 0, 'settings');
        return data || [];
      } catch (error) {
        console.error('Unexpected error fetching settings:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Load settings from database
  useEffect(() => {
    if (systemSettings && systemSettings.length > 0) {
      const loadedSettings = { ...settings };
      
      systemSettings.forEach((setting: any) => {
        try {
          const key = setting.key as keyof SettingsState;
          if (key in loadedSettings) {
            let value = setting.value;
            
            // Handle different value formats more safely
            if (typeof value === 'object' && value !== null) {
              if ('value' in value) {
                value = value.value;
              } else if (typeof value === 'object') {
                // If it's still an object, try to extract a meaningful value
                value = JSON.stringify(value);
              }
            }
            
            // Ensure the value is the correct type for the setting
            if (typeof loadedSettings[key] === 'boolean') {
              value = Boolean(value === true || value === 'true' || value === 1);
            } else if (typeof loadedSettings[key] === 'string') {
              value = String(value || '');
            }
            
            (loadedSettings as any)[key] = value;
          }
        } catch (error) {
          console.error('Error processing setting:', setting.key, error);
        }
      });
      
      setSettings(loadedSettings);
    }
  }, [systemSettings]);

  // Individual setting mutation with improved error handling and conflict resolution
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      try {
        console.log('Saving setting:', key, '=', value, 'category:', category);
        
        // Prepare the setting data with proper structure
        const settingData = {
          key,
          value: { value }, // Always wrap in object for consistency
          category,
          description: `System setting for ${key.replace(/_/g, ' ')}`,
          is_public: false,
          updated_at: new Date().toISOString()
        };
        
        // First try to update existing setting
        const { data: existingData, error: selectError } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', key)
          .maybeSingle();
        
        let result;
        if (existingData) {
          // Update existing setting
          const { data, error } = await supabase
            .from('system_settings')
            .update(settingData)
            .eq('key', key)
            .select();
          
          result = { data, error };
        } else {
          // Insert new setting
          const { data, error } = await supabase
            .from('system_settings')
            .insert(settingData)
            .select();
          
          result = { data, error };
        }
        
        if (result.error) {
          console.error('Save error:', result.error);
          throw new Error(`Failed to save ${key}: ${result.error.message}`);
        }
        
        console.log('Successfully saved:', result.data);
        return { key, value, category };
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onMutate: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'saving' }));
    },
    onSuccess: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'success' }));
      showSuccess("Setting Saved", `${key.replace(/_/g, ' ')} has been updated successfully.`);
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any, { key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'error' }));
      showError("Save Failed", `Failed to save ${key.replace(/_/g, ' ')}: ${error.message}`);
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    },
  });

  // Watermark settings mutation
  const saveWatermarkSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const settingKey = `watermark_${key}`;
      
      const settingData = {
        key: settingKey,
        value: { value },
        category: 'watermark',
        description: `Global watermark setting for ${key.replace(/_/g, ' ')}`,
        is_public: false,
        updated_at: new Date().toISOString()
      };
      
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', settingKey)
        .maybeSingle();
      
      let result;
      if (existingData) {
        const { data, error } = await supabase
          .from('system_settings')
          .update(settingData)
          .eq('key', settingKey)
          .select();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('system_settings')
          .insert(settingData)
          .select();
        result = { data, error };
      }
      
      if (result.error) throw result.error;
      return { key, value };
    },
    onSuccess: ({ key }) => {
      showSuccess("Watermark Setting Saved", `${key.replace(/_/g, ' ')} has been updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['global-watermark-settings'] });
    },
    onError: (error: any, { key }) => {
      showError("Save Failed", `Failed to save ${key.replace(/_/g, ' ')}: ${error.message}`);
    },
  });

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSetting = (key: keyof SettingsState) => {
    const value = settings[key];
    let category = 'general';
    
    // Categorize settings
    if (['email_verification', 'two_factor_auth', 'user_registration'].includes(key)) {
      category = 'authentication';
    } else if (['email_notifications', 'push_notifications'].includes(key)) {
      category = 'notifications';
    } else if (['data_backup', 'auto_updates', 'maintenance_mode'].includes(key)) {
      category = 'system';
    } else if (['site_name', 'site_title', 'site_description', 'contact_email', 'support_phone'].includes(key)) {
      category = 'website';
    } else if (['max_file_size', 'session_timeout', 'api_rate_limit'].includes(key)) {
      category = 'performance';
    } else if (['google_analytics_id', 'meta_keywords', 'meta_description'].includes(key)) {
      category = 'seo';
    } else if (['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url'].includes(key)) {
      category = 'social';
    } else if (['auto_approve_properties', 'max_property_images', 'property_listing_duration'].includes(key)) {
      category = 'properties';
    }

    saveSettingMutation.mutate({ key, value, category });
  };

  const handleSwitchChange = (key: keyof SettingsState, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
    
    let category = 'general';
    if (['email_verification', 'two_factor_auth', 'user_registration'].includes(key)) {
      category = 'authentication';
    } else if (['email_notifications', 'push_notifications'].includes(key)) {
      category = 'notifications';
    } else if (['data_backup', 'auto_updates', 'maintenance_mode'].includes(key)) {
      category = 'system';
    } else if (['auto_approve_properties'].includes(key)) {
      category = 'properties';
    }

    // Auto-save switches
    saveSettingMutation.mutate({ key, value: checked, category });
  };

  const getSaveIcon = (key: string) => {
    const state = savingStates[key] || 'idle';
    switch (state) {
      case 'saving':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const InputWithSave = ({ 
    id, 
    label, 
    value, 
    onChange, 
    onSave, 
    type = "text",
    disabled = false 
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    type?: string;
    disabled?: boolean;
  }) => (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="mt-1"
        />
      </div>
      <Button 
        onClick={onSave}
        disabled={savingStates[id] === 'saving' || disabled}
        size="sm"
        className="mb-0"
      >
        {getSaveIcon(id)}
      </Button>
    </div>
  );

  const SwitchWithLabel = ({ 
    id, 
    label, 
    description, 
    checked, 
    onChange 
  }: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <Label className="font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {savingStates[id] && savingStates[id] !== 'idle' && (
          <div className="min-w-[24px] flex justify-center">
            {getSaveIcon(id)}
          </div>
        )}
        <Switch
          checked={checked}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `watermark-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      handleWatermarkSettingChange('watermark_image_url', urlData.publicUrl);
      showSuccess("Image Uploaded", "Watermark image has been uploaded successfully.");
    } catch (error: any) {
      showError("Upload Failed", error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings. Changes are saved automatically for switches.
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="text-center py-8">Loading settings...</div>
          ) : (
            <>
              {/* Global Watermark Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Global Watermark Settings
                </h3>
                <p className="text-sm text-gray-600">Configure default watermark settings for all property images</p>
                
                <div className="space-y-6 p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Enable Watermark</Label>
                    <Switch
                      checked={watermarkSettings.is_enabled}
                      onCheckedChange={(checked) => handleWatermarkSettingChange('is_enabled', checked)}
                    />
                  </div>

                  {watermarkSettings.is_enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Watermark Type</Label>
                        <Select 
                          value={watermarkSettings.watermark_type} 
                          onValueChange={(value) => handleWatermarkSettingChange('watermark_type', value)}
                        >
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

                      {(watermarkSettings.watermark_type === 'text' || watermarkSettings.watermark_type === 'both') && (
                        <>
                          <div className="space-y-2">
                            <Label>Text Content</Label>
                            <Input
                              value={watermarkSettings.text_content}
                              onChange={(e) => handleWatermarkSettingChange('text_content', e.target.value)}
                              placeholder="Enter watermark text"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Text Color</Label>
                              <Input
                                type="color"
                                value={watermarkSettings.text_color}
                                onChange={(e) => handleWatermarkSettingChange('text_color', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Font</Label>
                              <Select 
                                value={watermarkSettings.text_font} 
                                onValueChange={(value) => handleWatermarkSettingChange('text_font', value)}
                              >
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

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Text Size: {watermarkSettings.text_size}px</Label>
                              <Slider
                                value={[watermarkSettings.text_size]}
                                onValueChange={([value]) => handleWatermarkSettingChange('text_size', value)}
                                min={12}
                                max={72}
                                step={1}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Text Opacity: {Math.round(watermarkSettings.text_opacity * 100)}%</Label>
                              <Slider
                                value={[watermarkSettings.text_opacity]}
                                onValueChange={([value]) => handleWatermarkSettingChange('text_opacity', value)}
                                min={0.1}
                                max={1}
                                step={0.05}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {(watermarkSettings.watermark_type === 'image' || watermarkSettings.watermark_type === 'both') && (
                        <>
                          <div className="space-y-2">
                            <Label>Watermark Image</Label>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
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
                              {watermarkSettings.watermark_image_url && (
                                <img 
                                  src={watermarkSettings.watermark_image_url} 
                                  alt="Watermark" 
                                  className="h-12 w-12 object-cover rounded border"
                                />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Image Opacity: {Math.round(watermarkSettings.image_opacity * 100)}%</Label>
                              <Slider
                                value={[watermarkSettings.image_opacity]}
                                onValueChange={([value]) => handleWatermarkSettingChange('image_opacity', value)}
                                min={0.1}
                                max={1}
                                step={0.05}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Image Scale: {watermarkSettings.image_scale}x</Label>
                              <Slider
                                value={[watermarkSettings.image_scale]}
                                onValueChange={([value]) => handleWatermarkSettingChange('image_scale', value)}
                                min={0.5}
                                max={3}
                                step={0.1}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-4">
                        <Label className="font-medium">Position Settings</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Horizontal Position</Label>
                            <Select 
                              value={watermarkSettings.position_x} 
                              onValueChange={(value) => handleWatermarkSettingChange('position_x', value)}
                            >
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
                            <Select 
                              value={watermarkSettings.position_y} 
                              onValueChange={(value) => handleWatermarkSettingChange('position_y', value)}
                            >
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Horizontal Offset: {watermarkSettings.offset_x}px</Label>
                            <Slider
                              value={[watermarkSettings.offset_x]}
                              onValueChange={([value]) => handleWatermarkSettingChange('offset_x', value)}
                              min={-200}
                              max={200}
                              step={5}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Vertical Offset: {watermarkSettings.offset_y}px</Label>
                            <Slider
                              value={[watermarkSettings.offset_y]}
                              onValueChange={([value]) => handleWatermarkSettingChange('offset_y', value)}
                              min={-200}
                              max={200}
                              step={5}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Website Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Website Configuration</h3>
                <div className="space-y-4">
                  <InputWithSave
                    id="site_name"
                    label="Site Name"
                    value={settings.site_name}
                    onChange={(value) => handleSettingChange('site_name', value)}
                    onSave={() => handleSaveSetting('site_name')}
                  />
                  
                  <InputWithSave
                    id="site_title"
                    label="Site Title"
                    value={settings.site_title}
                    onChange={(value) => handleSettingChange('site_title', value)}
                    onSave={() => handleSaveSetting('site_title')}
                  />
                  
                  <InputWithSave
                    id="contact_email"
                    label="Contact Email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(value) => handleSettingChange('contact_email', value)}
                    onSave={() => handleSaveSetting('contact_email')}
                  />
                  
                  <InputWithSave
                    id="support_phone"
                    label="Support Phone"
                    value={settings.support_phone}
                    onChange={(value) => handleSettingChange('support_phone', value)}
                    onSave={() => handleSaveSetting('support_phone')}
                  />
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="site_description">Site Description</Label>
                      <Textarea
                        id="site_description"
                        value={settings.site_description}
                        onChange={(e) => handleSettingChange('site_description', e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleSaveSetting('site_description')}
                      disabled={savingStates.site_description === 'saving'}
                      size="sm"
                    >
                      {getSaveIcon('site_description')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Authentication Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication & Security</h3>
                <div className="space-y-4">
                  <SwitchWithLabel
                    id="email_verification"
                    label="Email Verification"
                    description="Require email verification for new users"
                    checked={settings.email_verification}
                    onChange={(checked) => handleSwitchChange('email_verification', checked)}
                  />
                  
                  <SwitchWithLabel
                    id="two_factor_auth"
                    label="Two-Factor Authentication"
                    description="Enable 2FA for enhanced security"
                    checked={settings.two_factor_auth}
                    onChange={(checked) => handleSwitchChange('two_factor_auth', checked)}
                  />
                  
                  <SwitchWithLabel
                    id="user_registration"
                    label="User Registration"
                    description="Allow new user registrations"
                    checked={settings.user_registration}
                    onChange={(checked) => handleSwitchChange('user_registration', checked)}
                  />
                </div>
              </div>

              {/* System Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Management</h3>
                <div className="space-y-4">
                  <SwitchWithLabel
                    id="maintenance_mode"
                    label="Maintenance Mode"
                    description="Enable maintenance mode for updates"
                    checked={settings.maintenance_mode}
                    onChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
                  />
                  
                  <SwitchWithLabel
                    id="data_backup"
                    label="Data Backup"
                    description="Enable automatic data backups"
                    checked={settings.data_backup}
                    onChange={(checked) => handleSwitchChange('data_backup', checked)}
                  />
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance & Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputWithSave
                    id="max_file_size"
                    label="Max File Size (MB)"
                    type="number"
                    value={settings.max_file_size}
                    onChange={(value) => handleSettingChange('max_file_size', value)}
                    onSave={() => handleSaveSetting('max_file_size')}
                  />
                  
                  <InputWithSave
                    id="session_timeout"
                    label="Session Timeout (min)"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(value) => handleSettingChange('session_timeout', value)}
                    onSave={() => handleSaveSetting('session_timeout')}
                  />
                  
                  <InputWithSave
                    id="api_rate_limit"
                    label="API Rate Limit (req/hr)"
                    type="number"
                    value={settings.api_rate_limit}
                    onChange={(value) => handleSettingChange('api_rate_limit', value)}
                    onSave={() => handleSaveSetting('api_rate_limit')}
                  />
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="space-y-4">
                  <SwitchWithLabel
                    id="email_notifications"
                    label="Email Notifications"
                    description="Send system notifications via email"
                    checked={settings.email_notifications}
                    onChange={(checked) => handleSwitchChange('email_notifications', checked)}
                  />
                  
                  <SwitchWithLabel
                    id="push_notifications"
                    label="Push Notifications"
                    description="Enable browser push notifications"
                    checked={settings.push_notifications}
                    onChange={(checked) => handleSwitchChange('push_notifications', checked)}
                  />
                </div>
              </div>

              {/* SEO & Analytics Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO & Analytics</h3>
                <div className="space-y-4">
                  <InputWithSave
                    id="google_analytics_id"
                    label="Google Analytics ID"
                    value={settings.google_analytics_id || ''}
                    onChange={(value) => handleSettingChange('google_analytics_id', value)}
                    onSave={() => handleSaveSetting('google_analytics_id')}
                  />
                  
                  <InputWithSave
                    id="meta_keywords"
                    label="Default Meta Keywords"
                    value={settings.meta_keywords || ''}
                    onChange={(value) => handleSettingChange('meta_keywords', value)}
                    onSave={() => handleSaveSetting('meta_keywords')}
                  />
                  
                  <InputWithSave
                    id="meta_description"
                    label="Default Meta Description"
                    value={settings.meta_description || ''}
                    onChange={(value) => handleSettingChange('meta_description', value)}
                    onSave={() => handleSaveSetting('meta_description')}
                  />
                </div>
              </div>

              {/* Social Media Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithSave
                    id="facebook_url"
                    label="Facebook Page URL"
                    value={settings.facebook_url || ''}
                    onChange={(value) => handleSettingChange('facebook_url', value)}
                    onSave={() => handleSaveSetting('facebook_url')}
                  />
                  
                  <InputWithSave
                    id="twitter_url"
                    label="Twitter Profile URL"
                    value={settings.twitter_url || ''}
                    onChange={(value) => handleSettingChange('twitter_url', value)}
                    onSave={() => handleSaveSetting('twitter_url')}
                  />
                  
                  <InputWithSave
                    id="instagram_url"
                    label="Instagram Profile URL"
                    value={settings.instagram_url || ''}
                    onChange={(value) => handleSettingChange('instagram_url', value)}
                    onSave={() => handleSaveSetting('instagram_url')}
                  />
                  
                  <InputWithSave
                    id="linkedin_url"
                    label="LinkedIn Profile URL"
                    value={settings.linkedin_url || ''}
                    onChange={(value) => handleSettingChange('linkedin_url', value)}
                    onSave={() => handleSaveSetting('linkedin_url')}
                  />
                </div>
              </div>

              {/* Property Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Management</h3>
                <div className="space-y-4">
                  <SwitchWithLabel
                    id="auto_approve_properties"
                    label="Auto-approve Properties"
                    description="Automatically approve new property listings"
                    checked={settings.auto_approve_properties}
                    onChange={(checked) => handleSwitchChange('auto_approve_properties', checked)}
                  />
                  
                  <InputWithSave
                    id="max_property_images"
                    label="Max Property Images"
                    type="number"
                    value={settings.max_property_images || '20'}
                    onChange={(value) => handleSettingChange('max_property_images', value)}
                    onSave={() => handleSaveSetting('max_property_images')}
                  />
                  
                  <InputWithSave
                    id="property_listing_duration"
                    label="Property Listing Duration (days)"
                    type="number"
                    value={settings.property_listing_duration || '90'}
                    onChange={(value) => handleSettingChange('property_listing_duration', value)}
                    onSave={() => handleSaveSetting('property_listing_duration')}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
