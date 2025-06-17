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
          value,
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
          .single();
        
        let result;
        if (existingData?.id) {
          // Update existing setting using ID to avoid constraint conflicts
          const { data, error } = await supabase
            .from('system_settings')
            .update(settingData)
            .eq('id', existingData.id)
            .select();
          
          result = { data, error };
        } else {
          // Insert new setting with proper upsert handling for category+key constraint
          const { data, error } = await supabase
            .from('system_settings')
            .upsert(settingData, { 
              onConflict: 'category,key',
              ignoreDuplicates: false
            })
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

  // Watermark settings mutation with fixed conflict resolution
  const saveWatermarkSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const settingKey = `watermark_${key}`;
      
      const settingData = {
        key: settingKey,
        value,
        category: 'watermark',
        description: `Global watermark setting for ${key.replace(/_/g, ' ')}`,
        is_public: false,
        updated_at: new Date().toISOString()
      };
      
      // Check if setting already exists by key AND category
      const { data: existingData, error: selectError } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', settingKey)
        .eq('category', 'watermark')
        .maybeSingle();
      
      let result;
      if (existingData?.id) {
        // Update existing setting using ID to avoid constraint conflicts
        const { data, error } = await supabase
          .from('system_settings')
          .update(settingData)
          .eq('id', existingData.id)
          .select();
        
        result = { data, error };
      } else {
        // Insert new setting with proper upsert handling for category+key constraint
        const { data, error } = await supabase
          .from('system_settings')
          .upsert(settingData, { 
            onConflict: 'category,key',
            ignoreDuplicates: false
          })
          .select();
        
        result = { data, error };
      }
      
      if (result.error) {
        console.error('Watermark setting save error:', result.error);
        throw result.error;
      }
      
      return { key, value };
    },
    onSuccess: ({ key }) => {
      showSuccess("Watermark Setting Saved", `${key.replace(/_/g, ' ')} has been updated successfully.`);
      queryClient.invalidateQueries({ queryKey: ['global-watermark-settings'] });
    },
    onError: (error: any, { key }) => {
      console.error('Failed to save watermark setting:', key, error);
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

  const handleWatermarkSettingChange = (key: string, value: any) => {
    setWatermarkSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Auto-save watermark settings
    saveWatermarkSettingMutation.mutate({ key, value });
  };

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
            <></>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
