
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
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

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      console.log('Fetching system settings');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) {
        console.error('Error fetching system settings:', error);
        throw error;
      }
      
      console.log('Fetched system settings:', data?.length || 0);
      return data;
    },
  });

  // Load settings from database when component mounts
  useEffect(() => {
    if (systemSettings && systemSettings.length > 0) {
      const loadedSettings = { ...settings };
      
      systemSettings.forEach((setting: any) => {
        if (setting.value && typeof setting.value === 'object' && setting.value.value !== undefined) {
          loadedSettings[setting.key as keyof typeof settings] = setting.value.value;
        } else if (setting.value !== null) {
          loadedSettings[setting.key as keyof typeof settings] = setting.value;
        }
      });
      
      console.log('Loaded settings from database:', loadedSettings);
      setSettings(loadedSettings);
    }
  }, [systemSettings]);

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      console.log('Saving setting:', key, value, category);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value: { value }, // Store as JSON with value property
          category,
          description: `System setting for ${key.replace(/_/g, ' ')}`
        });
      
      if (error) {
        console.error('Error saving setting:', error);
        throw error;
      }
      
      console.log('Setting saved successfully');
    },
    onSuccess: () => {
      showSuccess("Settings Saved", "System settings have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Save settings mutation error:', error);
      showError("Save Failed", error.message);
    },
  });

  const handleSave = async () => {
    console.log('Saving all settings:', settings);
    
    try {
      // Save each setting individually
      const promises = Object.entries(settings).map(([key, value]) => {
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
        
        return saveSettingMutation.mutateAsync({ key, value, category });
      });
      
      await Promise.all(promises);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    console.log('Setting changed:', key, value);
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
                Configure system-wide settings and preferences
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="text-center py-8">
              Loading settings...
            </div>
          ) : (
            <>
              {/* Authentication Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication & Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Require email verification for new users</p>
                    </div>
                    <Switch
                      checked={settings.email_verification}
                      onCheckedChange={(checked) => handleSettingChange('email_verification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                    </div>
                    <Switch
                      checked={settings.two_factor_auth}
                      onCheckedChange={(checked) => handleSettingChange('two_factor_auth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                    </div>
                    <Switch
                      checked={settings.user_registration}
                      onCheckedChange={(checked) => handleSettingChange('user_registration', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send system notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode for updates</p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Data Backup</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
                    </div>
                    <Switch
                      checked={settings.data_backup}
                      onCheckedChange={(checked) => handleSettingChange('data_backup', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Auto Updates</Label>
                      <p className="text-sm text-muted-foreground">Automatically install system updates</p>
                    </div>
                    <Switch
                      checked={settings.auto_updates}
                      onCheckedChange={(checked) => handleSettingChange('auto_updates', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Website Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Website Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="support_phone">Support Phone</Label>
                    <Input
                      id="support_phone"
                      value={settings.support_phone}
                      onChange={(e) => handleSettingChange('support_phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={settings.site_description}
                      onChange={(e) => handleSettingChange('site_description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance & Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                    <Input
                      id="max_file_size"
                      type="number"
                      value={settings.max_file_size}
                      onChange={(e) => handleSettingChange('max_file_size', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      value={settings.session_timeout}
                      onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_rate_limit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="api_rate_limit"
                      type="number"
                      value={settings.api_rate_limit}
                      onChange={(e) => handleSettingChange('api_rate_limit', e.target.value)}
                    />
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
