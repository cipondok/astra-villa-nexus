
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, RefreshCw, Check, X } from "lucide-react";
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
  site_description: string;
  contact_email: string;
  support_phone: string;
  max_file_size: string;
  session_timeout: string;
  api_rate_limit: string;
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
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    support_phone: "+1-555-0123",
    max_file_size: "10",
    session_timeout: "30",
    api_rate_limit: "1000"
  });

  const [savingStates, setSavingStates] = useState<{[key: string]: 'idle' | 'saving' | 'success' | 'error'}>({});
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: systemSettings, isLoading, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      console.log('Fetching system settings from database...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) {
        console.error('Error fetching system settings:', error);
        throw new Error(`Failed to fetch settings: ${error.message}`);
      }
      
      console.log('Fetched system settings:', data?.length || 0, 'settings');
      return data || [];
    },
    retry: 2,
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
            if (setting.value && typeof setting.value === 'object' && setting.value.value !== undefined) {
              (loadedSettings as any)[key] = setting.value.value;
            } else if (setting.value !== null) {
              (loadedSettings as any)[key] = setting.value;
            }
          }
        } catch (error) {
          console.error('Error processing setting:', setting.key, error);
        }
      });
      
      setSettings(loadedSettings);
    }
  }, [systemSettings]);

  // Individual setting mutation
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      console.log('Saving individual setting:', key, value);
      
      const settingData = {
        key,
        value,
        category,
        description: `System setting for ${key.replace(/_/g, ' ')}`
      };
      
      const { error } = await supabase
        .from('system_settings')
        .upsert(settingData, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw new Error(`Failed to save ${key}: ${error.message}`);
      }
      
      return { key, value, category };
    },
    onMutate: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'saving' }));
    },
    onSuccess: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'success' }));
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

    // Determine category
    let category = 'general';
    if (['email_verification', 'two_factor_auth', 'user_registration'].includes(key)) {
      category = 'authentication';
    } else if (['email_notifications', 'push_notifications'].includes(key)) {
      category = 'notifications';
    } else if (['data_backup', 'auto_updates', 'maintenance_mode'].includes(key)) {
      category = 'system';
    } else if (['site_name', 'site_description', 'contact_email', 'support_phone'].includes(key)) {
      category = 'website';
    } else if (['max_file_size', 'session_timeout', 'api_rate_limit'].includes(key)) {
      category = 'performance';
    }

    // Auto-save for switches immediately
    if (typeof value === 'boolean') {
      saveSettingMutation.mutate({ key, value, category });
    }
  };

  const handleInputSave = (key: keyof SettingsState) => {
    const value = settings[key];
    let category = 'general';
    
    if (['site_name', 'site_description', 'contact_email', 'support_phone'].includes(key)) {
      category = 'website';
    } else if (['max_file_size', 'session_timeout', 'api_rate_limit'].includes(key)) {
      category = 'performance';
    }

    saveSettingMutation.mutate({ key, value, category });
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

  const SettingCard = ({ 
    title, 
    description, 
    settingKey, 
    children 
  }: { 
    title: string; 
    description: string; 
    settingKey: string; 
    children: React.ReactNode; 
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <Label className="font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
      <div className="ml-4 min-w-[24px] flex justify-center">
        {savingStates[settingKey] && savingStates[settingKey] !== 'idle' && getSaveIcon(settingKey)}
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
                Configure system-wide settings. Settings auto-save when changed.
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
              {/* Authentication Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication & Security</h3>
                <div className="grid grid-cols-1 gap-4">
                  <SettingCard
                    title="Email Verification"
                    description="Require email verification for new users"
                    settingKey="email_verification"
                  >
                    <Switch
                      checked={settings.email_verification}
                      onCheckedChange={(checked) => handleSettingChange('email_verification', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                  
                  <SettingCard
                    title="Two-Factor Authentication"
                    description="Enable 2FA for enhanced security"
                    settingKey="two_factor_auth"
                  >
                    <Switch
                      checked={settings.two_factor_auth}
                      onCheckedChange={(checked) => handleSettingChange('two_factor_auth', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                  
                  <SettingCard
                    title="User Registration"
                    description="Allow new user registrations"
                    settingKey="user_registration"
                  >
                    <Switch
                      checked={settings.user_registration}
                      onCheckedChange={(checked) => handleSettingChange('user_registration', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="grid grid-cols-1 gap-4">
                  <SettingCard
                    title="Email Notifications"
                    description="Send system notifications via email"
                    settingKey="email_notifications"
                  >
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                  
                  <SettingCard
                    title="Push Notifications"
                    description="Enable browser push notifications"
                    settingKey="push_notifications"
                  >
                    <Switch
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                </div>
              </div>

              {/* System Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Management</h3>
                <div className="grid grid-cols-1 gap-4">
                  <SettingCard
                    title="Maintenance Mode"
                    description="Enable maintenance mode for updates"
                    settingKey="maintenance_mode"
                  >
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                  
                  <SettingCard
                    title="Data Backup"
                    description="Enable automatic data backups"
                    settingKey="data_backup"
                  >
                    <Switch
                      checked={settings.data_backup}
                      onCheckedChange={(checked) => handleSettingChange('data_backup', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                  
                  <SettingCard
                    title="Auto Updates"
                    description="Automatically install system updates"
                    settingKey="auto_updates"
                  >
                    <Switch
                      checked={settings.auto_updates}
                      onCheckedChange={(checked) => handleSettingChange('auto_updates', checked)}
                      className="mt-2"
                    />
                  </SettingCard>
                </div>
              </div>

              {/* Website Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Website Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="site_name">Site Name</Label>
                      <Input
                        id="site_name"
                        value={settings.site_name}
                        onChange={(e) => handleSettingChange('site_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('site_name')}
                      disabled={savingStates.site_name === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('site_name')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('contact_email')}
                      disabled={savingStates.contact_email === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('contact_email')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="support_phone">Support Phone</Label>
                      <Input
                        id="support_phone"
                        value={settings.support_phone}
                        onChange={(e) => handleSettingChange('support_phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('support_phone')}
                      disabled={savingStates.support_phone === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('support_phone')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
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
                      onClick={() => handleInputSave('site_description')}
                      disabled={savingStates.site_description === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('site_description')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance & Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                      <Input
                        id="max_file_size"
                        type="number"
                        value={settings.max_file_size}
                        onChange={(e) => handleSettingChange('max_file_size', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('max_file_size')}
                      disabled={savingStates.max_file_size === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('max_file_size')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="session_timeout">Session Timeout (min)</Label>
                      <Input
                        id="session_timeout"
                        type="number"
                        value={settings.session_timeout}
                        onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('session_timeout')}
                      disabled={savingStates.session_timeout === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('session_timeout')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="api_rate_limit">API Rate Limit (req/hr)</Label>
                      <Input
                        id="api_rate_limit"
                        type="number"
                        value={settings.api_rate_limit}
                        onChange={(e) => handleSettingChange('api_rate_limit', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleInputSave('api_rate_limit')}
                      disabled={savingStates.api_rate_limit === 'saving'}
                      size="sm"
                      className="mt-6"
                    >
                      {getSaveIcon('api_rate_limit')}
                    </Button>
                  </div>
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
