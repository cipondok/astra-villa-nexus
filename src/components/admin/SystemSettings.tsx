
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Database, Mail, Shield, Globe } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    max_upload_size: '10',
    currency: 'IDR',
    timezone: 'Asia/Jakarta'
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Convert array of settings to object
      const settingsObj = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setSettings({ ...settings, ...settingsObj });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Settings Updated", "System settings have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleSave = (category: string) => {
    Object.entries(settings).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key, value, category });
    });
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Globe className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="database">
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic site configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      placeholder="Astra Villa"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={settings.site_description}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                      placeholder="Your premier property marketplace"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        placeholder="IDR"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        placeholder="Asia/Jakarta"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance_mode"
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                    />
                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  </div>
                  <Button onClick={() => handleSave('general')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Email configuration and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="contact@astravilla.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                    />
                    <Label htmlFor="email_notifications">Enable Email Notifications</Label>
                  </div>
                  <Button onClick={() => handleSave('email')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Security and access control</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registration_enabled"
                      checked={settings.registration_enabled}
                      onCheckedChange={(checked) => handleInputChange('registration_enabled', checked)}
                    />
                    <Label htmlFor="registration_enabled">Enable User Registration</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_upload_size">Max Upload Size (MB)</Label>
                    <Input
                      id="max_upload_size"
                      type="number"
                      value={settings.max_upload_size}
                      onChange={(e) => handleInputChange('max_upload_size', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <Button onClick={() => handleSave('security')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Settings</CardTitle>
                  <CardDescription>Database maintenance and optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Tables
                    </Button>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Database operations should be performed with caution. 
                      Always backup your data before performing maintenance operations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
