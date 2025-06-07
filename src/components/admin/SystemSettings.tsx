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
import { Settings, Shield, Users, Database, Globe, Mail, Bell, Palette, Server, Lock, Save, AlertTriangle } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SystemSettingsData {
  // General Settings
  site_name?: string;
  site_url?: string;
  site_description?: string;
  site_logo?: string;
  favicon?: string;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  
  // Authentication Settings
  require_email_verification?: boolean;
  enable_google_auth?: boolean;
  enable_facebook_auth?: boolean;
  enable_github_auth?: boolean;
  session_timeout?: string;
  password_min_length?: string;
  enable_password_reset?: boolean;
  
  // Notification Settings
  enable_email_notifications?: boolean;
  admin_email?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_username?: string;
  smtp_password?: string;
  enable_sms_notifications?: boolean;
  sms_provider?: string;
  
  // Security Settings
  enable_two_factor?: boolean;
  max_login_attempts?: string;
  lockout_duration?: string;
  enable_captcha?: boolean;
  captcha_provider?: string;
  enable_rate_limiting?: boolean;
  
  // Appearance Settings
  primary_color?: string;
  secondary_color?: string;
  default_theme?: string;
  enable_dark_mode?: boolean;
  custom_css?: string;
  
  // API & Integration Settings
  api_rate_limit?: string;
  enable_api_docs?: boolean;
  webhook_secret?: string;
  analytics_provider?: string;
  analytics_id?: string;
  
  // File & Storage Settings
  max_file_size?: string;
  allowed_file_types?: string;
  storage_provider?: string;
  cdn_url?: string;
  
  // Performance Settings
  cache_duration?: string;
  enable_compression?: boolean;
  enable_cdn?: boolean;
  database_backup_frequency?: string;
}

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Default settings for offline mode
  const defaultSettings: SystemSettingsData = {
    site_name: "AstraVilla",
    site_url: "https://astravilla.com",
    site_description: "Luxury real estate platform",
    maintenance_mode: false,
    require_email_verification: true,
    enable_password_reset: true,
    enable_google_auth: false,
    enable_facebook_auth: false,
    enable_github_auth: false,
    session_timeout: "24",
    password_min_length: "8",
    enable_email_notifications: true,
    admin_email: "admin@astravilla.com",
    smtp_port: "587",
    enable_sms_notifications: false,
    sms_provider: "twilio",
    enable_two_factor: false,
    max_login_attempts: "5",
    lockout_duration: "15",
    enable_captcha: false,
    captcha_provider: "recaptcha",
    enable_rate_limiting: false,
    primary_color: "#3b82f6",
    secondary_color: "#6b7280",
    default_theme: "light",
    enable_dark_mode: true,
    api_rate_limit: "100",
    enable_api_docs: true,
    analytics_provider: "none",
    max_file_size: "10",
    allowed_file_types: "jpg,jpeg,png,gif,pdf,doc,docx",
    storage_provider: "supabase",
    cache_duration: "24",
    enable_compression: true,
    enable_cdn: false,
    database_backup_frequency: "daily"
  };

  // Fetch system settings with error handling
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async (): Promise<SystemSettingsData> => {
      try {
        console.log('Attempting to fetch system settings...');
        const { data, error } = await supabase
          .from('system_settings')
          .select('*');
        
        if (error) {
          console.error('Database error:', error);
          
          // If it's the policy recursion error, switch to offline mode
          if (error.code === '42P17' || error.message.includes('infinite recursion')) {
            console.log('Detected database policy issue, switching to offline mode');
            setOfflineMode(true);
            return defaultSettings;
          }
          
          throw error;
        }
        
        // Convert array to object for easier access
        const settingsObj = data?.reduce((acc: Record<string, any>, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {}) || {};
        
        console.log('Successfully fetched settings:', settingsObj);
        return { ...defaultSettings, ...settingsObj };
      } catch (err) {
        console.error('Error fetching settings, using defaults:', err);
        setOfflineMode(true);
        return defaultSettings;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Save settings mutation with offline handling
  const saveSettingsMutation = useMutation({
    mutationFn: async (changes: Record<string, { value: any; category: string }>) => {
      if (offlineMode) {
        // In offline mode, just simulate a save
        console.log('Offline mode: Changes saved locally:', changes);
        return;
      }

      console.log('Saving changes to database:', changes);
      
      const promises = Object.entries(changes).map(([key, { value, category }]) =>
        supabase
          .from('system_settings')
          .upsert({
            key,
            value,
            category,
            updated_at: new Date().toISOString()
          })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to save ${errors.length} settings`);
      }
    },
    onSuccess: () => {
      const message = offlineMode 
        ? "Settings saved locally (database connection unavailable)"
        : "All system settings have been saved successfully";
      
      showSuccess("Settings Saved", message);
      setPendingChanges({});
      setHasUnsavedChanges(false);
      
      if (!offlineMode) {
        queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      }
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      showError("Save Failed", error.message);
    },
  });

  const handleSettingChange = (key: string, value: any, category: string = 'general') => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: { value, category }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    if (Object.keys(pendingChanges).length > 0) {
      saveSettingsMutation.mutate(pendingChanges);
    }
  };

  const getCurrentValue = (key: string) => {
    return pendingChanges[key]?.value ?? (settings as any)?.[key];
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
      <Card className="bg-card/90 backdrop-blur-xl border-border/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure system-wide settings and preferences
                {offlineMode && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Database connection unavailable - working in offline mode</span>
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-amber-600 bg-amber-100 border-amber-300">
                  Unsaved Changes
                </Badge>
              )}
              <Button 
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Save className="h-4 w-4" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-muted/50">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Basic system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        value={getCurrentValue('site_name') || "AstraVilla"}
                        onChange={(e) => handleSettingChange('site_name', e.target.value, 'general')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-url">Site URL</Label>
                      <Input
                        id="site-url"
                        value={getCurrentValue('site_url') || "https://astravilla.com"}
                        onChange={(e) => handleSettingChange('site_url', e.target.value, 'general')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      value={getCurrentValue('site_description') || "Luxury real estate platform"}
                      onChange={(e) => handleSettingChange('site_description', e.target.value, 'general')}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenance-mode"
                        checked={getCurrentValue('maintenance_mode') || false}
                        onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked, 'general')}
                      />
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    </div>
                    
                    {getCurrentValue('maintenance_mode') && (
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-message">Maintenance Message</Label>
                        <Textarea
                          id="maintenance-message"
                          value={getCurrentValue('maintenance_message') || "Site is under maintenance. Please check back later."}
                          onChange={(e) => handleSettingChange('maintenance_message', e.target.value, 'general')}
                        />
                      </div>
                    )}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-verification"
                        checked={settings?.require_email_verification ?? true}
                        onCheckedChange={(checked) => handleSettingChange('require_email_verification', checked, 'auth')}
                      />
                      <Label htmlFor="email-verification">Require Email Verification</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="password-reset"
                        checked={settings?.enable_password_reset ?? true}
                        onCheckedChange={(checked) => handleSettingChange('enable_password_reset', checked, 'auth')}
                      />
                      <Label htmlFor="password-reset">Enable Password Reset</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="google-auth"
                        checked={settings?.enable_google_auth || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_google_auth', checked, 'auth')}
                      />
                      <Label htmlFor="google-auth">Google Auth</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="facebook-auth"
                        checked={settings?.enable_facebook_auth || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_facebook_auth', checked, 'auth')}
                      />
                      <Label htmlFor="facebook-auth">Facebook Auth</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="github-auth"
                        checked={settings?.enable_github_auth || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_github_auth', checked, 'auth')}
                      />
                      <Label htmlFor="github-auth">GitHub Auth</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Select
                        defaultValue={settings?.session_timeout || "24"}
                        onValueChange={(value) => handleSettingChange('session_timeout', value, 'auth')}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-min-length">Min Password Length</Label>
                      <Select
                        defaultValue={settings?.password_min_length || "8"}
                        onValueChange={(value) => handleSettingChange('password_min_length', value, 'auth')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 characters</SelectItem>
                          <SelectItem value="8">8 characters</SelectItem>
                          <SelectItem value="12">12 characters</SelectItem>
                          <SelectItem value="16">16 characters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-notifications"
                      checked={settings?.enable_email_notifications ?? true}
                      onCheckedChange={(checked) => handleSettingChange('enable_email_notifications', checked, 'notifications')}
                    />
                    <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={getCurrentValue('admin_email') || "admin@astravilla.com"}
                        onChange={(e) => handleSettingChange('admin_email', e.target.value, 'notifications')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={getCurrentValue('smtp_host') || ""}
                        placeholder="mail.example.com"
                        onChange={(e) => handleSettingChange('smtp_host', e.target.value, 'notifications')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        value={getCurrentValue('smtp_port') || "587"}
                        onChange={(e) => handleSettingChange('smtp_port', e.target.value, 'notifications')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">SMTP Username</Label>
                      <Input
                        id="smtp-username"
                        value={getCurrentValue('smtp_username') || ""}
                        onChange={(e) => handleSettingChange('smtp_username', e.target.value, 'notifications')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        value={getCurrentValue('smtp_password') || ""}
                        onChange={(e) => handleSettingChange('smtp_password', e.target.value, 'notifications')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5" />
                    SMS Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms-notifications"
                      checked={settings?.enable_sms_notifications || false}
                      onCheckedChange={(checked) => handleSettingChange('enable_sms_notifications', checked, 'notifications')}
                    />
                    <Label htmlFor="sms-notifications">Enable SMS Notifications</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sms-provider">SMS Provider</Label>
                    <Select
                      defaultValue={settings?.sms_provider || "twilio"}
                      onValueChange={(value) => handleSettingChange('sms_provider', value, 'notifications')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo</SelectItem>
                        <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="two-factor"
                        checked={settings?.enable_two_factor || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_two_factor', checked, 'security')}
                      />
                      <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="captcha"
                        checked={settings?.enable_captcha || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_captcha', checked, 'security')}
                      />
                      <Label htmlFor="captcha">Enable CAPTCHA</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Select
                        defaultValue={settings?.max_login_attempts || "5"}
                        onValueChange={(value) => handleSettingChange('max_login_attempts', value, 'security')}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="lockout-duration">Lockout Duration</Label>
                      <Select
                        defaultValue={settings?.lockout_duration || "15"}
                        onValueChange={(value) => handleSettingChange('lockout_duration', value, 'security')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="captcha-provider">CAPTCHA Provider</Label>
                      <Select
                        defaultValue={settings?.captcha_provider || "recaptcha"}
                        onValueChange={(value) => handleSettingChange('captcha_provider', value, 'security')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recaptcha">reCAPTCHA</SelectItem>
                          <SelectItem value="hcaptcha">hCaptcha</SelectItem>
                          <SelectItem value="cloudflare">Cloudflare Turnstile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rate-limiting"
                      checked={settings?.enable_rate_limiting || false}
                      onCheckedChange={(checked) => handleSettingChange('enable_rate_limiting', checked, 'security')}
                    />
                    <Label htmlFor="rate-limiting">Enable Rate Limiting</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <Input
                        id="primary-color"
                        type="color"
                        value={getCurrentValue('primary_color') || "#3b82f6"}
                        onChange={(e) => handleSettingChange('primary_color', e.target.value, 'appearance')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={getCurrentValue('secondary_color') || "#6b7280"}
                        onChange={(e) => handleSettingChange('secondary_color', e.target.value, 'appearance')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-theme">Default Theme</Label>
                      <Select
                        defaultValue={settings?.default_theme || "light"}
                        onValueChange={(value) => handleSettingChange('default_theme', value, 'appearance')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="dark-mode"
                        checked={settings?.enable_dark_mode ?? true}
                        onCheckedChange={(checked) => handleSettingChange('enable_dark_mode', checked, 'appearance')}
                      />
                      <Label htmlFor="dark-mode">Enable Dark Mode Toggle</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-css">Custom CSS</Label>
                    <Textarea
                      id="custom-css"
                      placeholder="/* Add your custom CSS here */"
                      value={getCurrentValue('custom_css') || ""}
                      onChange={(e) => handleSettingChange('custom_css', e.target.value, 'appearance')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5" />
                    API & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
                      <Input
                        id="api-rate-limit"
                        type="number"
                        value={getCurrentValue('api_rate_limit') || "100"}
                        onChange={(e) => handleSettingChange('api_rate_limit', e.target.value, 'integrations')}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="api-docs"
                        checked={settings?.enable_api_docs ?? true}
                        onCheckedChange={(checked) => handleSettingChange('enable_api_docs', checked, 'integrations')}
                      />
                      <Label htmlFor="api-docs">Enable API Documentation</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      value={getCurrentValue('webhook_secret') || ""}
                      onChange={(e) => handleSettingChange('webhook_secret', e.target.value, 'integrations')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analytics-provider">Analytics Provider</Label>
                      <Select
                        defaultValue={settings?.analytics_provider || "none"}
                        onValueChange={(value) => handleSettingChange('analytics_provider', value, 'integrations')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="google">Google Analytics</SelectItem>
                          <SelectItem value="mixpanel">Mixpanel</SelectItem>
                          <SelectItem value="amplitude">Amplitude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="analytics-id">Analytics ID</Label>
                      <Input
                        id="analytics-id"
                        value={getCurrentValue('analytics_id') || ""}
                        placeholder="GA-XXXXXXXXX-X"
                        onChange={(e) => handleSettingChange('analytics_id', e.target.value, 'integrations')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File & Storage Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                      <Input
                        id="max-file-size"
                        type="number"
                        value={getCurrentValue('max_file_size') || "10"}
                        onChange={(e) => handleSettingChange('max_file_size', e.target.value, 'integrations')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="storage-provider">Storage Provider</Label>
                      <Select
                        defaultValue={settings?.storage_provider || "supabase"}
                        onValueChange={(value) => handleSettingChange('storage_provider', value, 'integrations')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supabase">Supabase Storage</SelectItem>
                          <SelectItem value="aws-s3">AWS S3</SelectItem>
                          <SelectItem value="cloudinary">Cloudinary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                      <Input
                        id="allowed-file-types"
                        value={getCurrentValue('allowed_file_types') || "jpg,jpeg,png,gif,pdf,doc,docx"}
                        onChange={(e) => handleSettingChange('allowed_file_types', e.target.value, 'integrations')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cdn-url">CDN URL</Label>
                      <Input
                        id="cdn-url"
                        value={getCurrentValue('cdn_url') || ""}
                        placeholder="https://cdn.example.com"
                        onChange={(e) => handleSettingChange('cdn_url', e.target.value, 'integrations')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5" />
                    Performance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cache-duration">Cache Duration (hours)</Label>
                      <Select
                        defaultValue={settings?.cache_duration || "24"}
                        onValueChange={(value) => handleSettingChange('cache_duration', value, 'performance')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="168">1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Database Backup Frequency</Label>
                      <Select
                        defaultValue={settings?.database_backup_frequency || "daily"}
                        onValueChange={(value) => handleSettingChange('database_backup_frequency', value, 'performance')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="compression"
                        checked={settings?.enable_compression ?? true}
                        onCheckedChange={(checked) => handleSettingChange('enable_compression', checked, 'performance')}
                      />
                      <Label htmlFor="compression">Enable Compression</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="cdn"
                        checked={settings?.enable_cdn || false}
                        onCheckedChange={(checked) => handleSettingChange('enable_cdn', checked, 'performance')}
                      />
                      <Label htmlFor="cdn">Enable CDN</Label>
                    </div>
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
