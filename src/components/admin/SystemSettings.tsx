
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RefreshCw, Check, X, Globe, Mail, Shield, Database, Palette } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import AstraTokenSettings from "./AstraTokenSettings";
import WatermarkSettings from "./WatermarkSettings";

interface SettingsState {
  // Authentication Settings
  email_verification: boolean;
  two_factor_auth: boolean;
  user_registration: boolean;
  
  // Notification Settings
  email_notifications: boolean;
  push_notifications: boolean;
  
  // System Settings
  maintenance_mode: boolean;
  data_backup: boolean;
  auto_updates: boolean;
  
  // Website Settings
  site_name: string;
  site_title: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  
  // Performance Settings
  max_file_size: string;
  session_timeout: string;
  api_rate_limit: string;
  
  // SEO Settings
  google_analytics_id: string;
  meta_keywords: string;
  meta_description: string;
  
  // Social Media
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  
  // Property Settings
  auto_approve_properties: boolean;
  max_property_images: string;
  property_listing_duration: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    // Authentication
    email_verification: true,
    two_factor_auth: false,
    user_registration: true,
    
    // Notifications
    email_notifications: true,
    push_notifications: false,
    
    // System
    maintenance_mode: false,
    data_backup: true,
    auto_updates: false,
    
    // Website
    site_name: "Astra Villa",
    site_title: "Astra Villa - Premium Property Management",
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    support_phone: "+1-555-0123",
    
    // Performance
    max_file_size: "10",
    session_timeout: "30",
    api_rate_limit: "1000",
    
    // SEO
    google_analytics_id: "",
    meta_keywords: "",
    meta_description: "",
    
    // Social Media
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    
    // Properties
    auto_approve_properties: false,
    max_property_images: "20",
    property_listing_duration: "90"
  });

  const [savingStates, setSavingStates] = useState<{[key: string]: 'idle' | 'saving' | 'success' | 'error'}>({});
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch system settings
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
            
            if (typeof value === 'object' && value !== null) {
              if ('value' in value) {
                value = value.value;
              } else if (typeof value === 'object') {
                value = JSON.stringify(value);
              }
            }
            
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

  // Save setting mutation
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      try {
        console.log('Saving setting:', key, '=', value, 'category:', category);
        
        const settingData = {
          key,
          value,
          category,
          description: `System setting for ${key.replace(/_/g, ' ')}`,
          is_public: false,
          updated_at: new Date().toISOString()
        };
        
        const { data: existingData, error: selectError } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', key)
          .single();
        
        let result;
        if (existingData?.id) {
          const { data, error } = await supabase
            .from('system_settings')
            .update(settingData)
            .eq('id', existingData.id)
            .select();
          
          result = { data, error };
        } else {
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

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSetting = (key: keyof SettingsState) => {
    const value = settings[key];
    let category = 'general';
    
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
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          ) : (
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="authentication" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Auth
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Tokens
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Website Information</CardTitle>
                    <CardDescription>Basic website configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="site_description">Site Description</Label>
                        <Textarea
                          id="site_description"
                          value={settings.site_description}
                          onChange={(e) => handleSettingChange('site_description', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={() => handleSaveSetting('site_description')}
                        disabled={savingStates['site_description'] === 'saving'}
                        size="sm"
                      >
                        {getSaveIcon('site_description')}
                      </Button>
                    </div>
                    <InputWithSave
                      id="contact_email"
                      label="Contact Email"
                      value={settings.contact_email}
                      onChange={(value) => handleSettingChange('contact_email', value)}
                      onSave={() => handleSaveSetting('contact_email')}
                      type="email"
                    />
                    <InputWithSave
                      id="support_phone"
                      label="Support Phone"
                      value={settings.support_phone}
                      onChange={(value) => handleSettingChange('support_phone', value)}
                      onSave={() => handleSaveSetting('support_phone')}
                      type="tel"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Property Settings</CardTitle>
                    <CardDescription>Property management configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      value={settings.max_property_images}
                      onChange={(value) => handleSettingChange('max_property_images', value)}
                      onSave={() => handleSaveSetting('max_property_images')}
                      type="number"
                    />
                    <InputWithSave
                      id="property_listing_duration"
                      label="Property Listing Duration (days)"
                      value={settings.property_listing_duration}
                      onChange={(value) => handleSettingChange('property_listing_duration', value)}
                      onSave={() => handleSaveSetting('property_listing_duration')}
                      type="number"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="authentication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Settings</CardTitle>
                    <CardDescription>User authentication and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SwitchWithLabel
                      id="email_verification"
                      label="Email Verification"
                      description="Require email verification for new accounts"
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Settings</CardTitle>
                    <CardDescription>System performance and limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InputWithSave
                      id="max_file_size"
                      label="Max File Size (MB)"
                      value={settings.max_file_size}
                      onChange={(value) => handleSettingChange('max_file_size', value)}
                      onSave={() => handleSaveSetting('max_file_size')}
                      type="number"
                    />
                    <InputWithSave
                      id="session_timeout"
                      label="Session Timeout (minutes)"
                      value={settings.session_timeout}
                      onChange={(value) => handleSettingChange('session_timeout', value)}
                      onSave={() => handleSaveSetting('session_timeout')}
                      type="number"
                    />
                    <InputWithSave
                      id="api_rate_limit"
                      label="API Rate Limit (requests/hour)"
                      value={settings.api_rate_limit}
                      onChange={(value) => handleSettingChange('api_rate_limit', value)}
                      onSave={() => handleSaveSetting('api_rate_limit')}
                      type="number"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Maintenance</CardTitle>
                    <CardDescription>System maintenance and backup settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SwitchWithLabel
                      id="maintenance_mode"
                      label="Maintenance Mode"
                      description="Put the system in maintenance mode"
                      checked={settings.maintenance_mode}
                      onChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
                    />
                    <SwitchWithLabel
                      id="data_backup"
                      label="Automatic Backups"
                      description="Enable automatic data backups"
                      checked={settings.data_backup}
                      onChange={(checked) => handleSwitchChange('data_backup', checked)}
                    />
                    <SwitchWithLabel
                      id="auto_updates"
                      label="Auto Updates"
                      description="Automatically update system components"
                      checked={settings.auto_updates}
                      onChange={(checked) => handleSwitchChange('auto_updates', checked)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure system notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SwitchWithLabel
                      id="email_notifications"
                      label="Email Notifications"
                      description="Send email notifications to users"
                      checked={settings.email_notifications}
                      onChange={(checked) => handleSwitchChange('email_notifications', checked)}
                    />
                    <SwitchWithLabel
                      id="push_notifications"
                      label="Push Notifications"
                      description="Send push notifications to mobile devices"
                      checked={settings.push_notifications}
                      onChange={(checked) => handleSwitchChange('push_notifications', checked)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <WatermarkSettings />
              </TabsContent>

              <TabsContent value="tokens" className="space-y-6">
                <AstraTokenSettings />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
