
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Database, Globe, Shield, Mail, Upload } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "Astra Villa",
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    maintenance_mode: false,
    allow_registrations: true,
    default_language: "en"
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
    from_email: "",
    from_name: ""
  });

  const [securitySettings, setSecuritySettings] = useState({
    enable_2fa: true,
    session_timeout: "30",
    max_login_attempts: "5",
    password_min_length: "8"
  });

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ category, settings }: { category: string; settings: any }) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: { data: value },
        category,
        description: `${category} setting for ${key}`
      }));

      for (const setting of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Settings Updated", "System settings have been saved successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleSaveGeneral = () => {
    updateSettingsMutation.mutate({ category: 'general', settings: generalSettings });
  };

  const handleSaveEmail = () => {
    updateSettingsMutation.mutate({ category: 'email', settings: emailSettings });
  };

  const handleSaveSecurity = () => {
    updateSettingsMutation.mutate({ category: 'security', settings: securitySettings });
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
            Configure and manage system-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_name">Site Name</Label>
                      <Input
                        id="site_name"
                        value={generalSettings.site_name}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={generalSettings.contact_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={generalSettings.site_description}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable to show maintenance page to users</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenance_mode}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenance_mode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow User Registrations</Label>
                        <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                      </div>
                      <Switch
                        checked={generalSettings.allow_registrations}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allow_registrations: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select value={generalSettings.default_language} onValueChange={(value) => setGeneralSettings({ ...generalSettings, default_language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Indonesian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSaveGeneral} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={emailSettings.smtp_host}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        value={emailSettings.smtp_port}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_username">SMTP Username</Label>
                      <Input
                        id="smtp_username"
                        value={emailSettings.smtp_username}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={emailSettings.smtp_password}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from_email">From Email</Label>
                      <Input
                        id="from_email"
                        type="email"
                        value={emailSettings.from_email}
                        onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from_name">From Name</Label>
                      <Input
                        id="from_name"
                        value={emailSettings.from_name}
                        onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveEmail} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      checked={securitySettings.enable_2fa}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enable_2fa: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session_timeout"
                        type="number"
                        value={securitySettings.session_timeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                      <Input
                        id="max_login_attempts"
                        type="number"
                        value={securitySettings.max_login_attempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_min_length">Minimum Password Length</Label>
                    <Input
                      id="password_min_length"
                      type="number"
                      value={securitySettings.password_min_length}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleSaveSecurity} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Database className="h-6 w-6 mb-2" />
                      <span>Database Backup</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Import/Export</span>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Advanced Operations</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These operations require careful consideration. Please backup your data before proceeding.
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
