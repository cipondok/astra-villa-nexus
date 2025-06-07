
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Shield, Users, Database, Globe, Mail, Bell } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SystemSettingsData {
  site_name?: string;
  site_url?: string;
  site_description?: string;
  maintenance_mode?: boolean;
  require_email_verification?: boolean;
  enable_google_auth?: boolean;
  session_timeout?: string;
  enable_email_notifications?: boolean;
  admin_email?: string;
  enable_two_factor?: boolean;
  max_login_attempts?: string;
}

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async (): Promise<SystemSettingsData> => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*');
        
        if (error) {
          console.error('Error fetching settings:', error);
          throw error;
        }
        
        // Convert array to object for easier access
        const settingsObj = data?.reduce((acc: SystemSettingsData, setting: any) => {
          const key = setting.key as keyof SystemSettingsData;
          if (key in acc || Object.prototype.hasOwnProperty.call({} as SystemSettingsData, key)) {
            (acc as any)[key] = setting.value;
          }
          return acc;
        }, {} as SystemSettingsData) || {};
        
        return settingsObj;
      } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
      }
    },
    retry: 1,
    retryDelay: 2000,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        });
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

  const handleSettingUpdate = (key: string, value: any, category: string = 'general') => {
    updateSettingMutation.mutate({ key, value, category });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">General Settings</CardTitle>
                  <CardDescription>Basic system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        defaultValue={settings?.site_name || "AstraVilla"}
                        onBlur={(e) => handleSettingUpdate('site_name', e.target.value, 'general')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-url">Site URL</Label>
                      <Input
                        id="site-url"
                        defaultValue={settings?.site_url || "https://astravilla.com"}
                        onBlur={(e) => handleSettingUpdate('site_url', e.target.value, 'general')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      defaultValue={settings?.site_description || "Luxury real estate platform"}
                      onBlur={(e) => handleSettingUpdate('site_description', e.target.value, 'general')}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance-mode"
                      defaultChecked={settings?.maintenance_mode || false}
                      onCheckedChange={(checked) => handleSettingUpdate('maintenance_mode', checked, 'general')}
                    />
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Authentication Settings
                  </CardTitle>
                  <CardDescription>Configure authentication methods and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-verification"
                      defaultChecked={settings?.require_email_verification ?? true}
                      onCheckedChange={(checked) => handleSettingUpdate('require_email_verification', checked, 'auth')}
                    />
                    <Label htmlFor="email-verification">Require Email Verification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="google-auth"
                      defaultChecked={settings?.enable_google_auth || false}
                      onCheckedChange={(checked) => handleSettingUpdate('enable_google_auth', checked, 'auth')}
                    />
                    <Label htmlFor="google-auth">Enable Google Authentication</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Select
                      defaultValue={settings?.session_timeout || "24"}
                      onValueChange={(value) => handleSettingUpdate('session_timeout', value, 'auth')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure system notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-notifications"
                      defaultChecked={settings?.enable_email_notifications ?? true}
                      onCheckedChange={(checked) => handleSettingUpdate('enable_email_notifications', checked, 'notifications')}
                    />
                    <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      defaultValue={settings?.admin_email || "admin@astravilla.com"}
                      onBlur={(e) => handleSettingUpdate('admin_email', e.target.value, 'notifications')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="two-factor"
                      defaultChecked={settings?.enable_two_factor || false}
                      onCheckedChange={(checked) => handleSettingUpdate('enable_two_factor', checked, 'security')}
                    />
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Select
                      defaultValue={settings?.max_login_attempts || "5"}
                      onValueChange={(value) => handleSettingUpdate('max_login_attempts', value, 'security')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
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
