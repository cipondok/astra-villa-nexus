import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface GeneralSettings {
  site_name: string;
  primary_color: string;
  default_currency: string;
  timezone: string;
  maintenance_mode: boolean;
}

const SystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    site_name: "",
    primary_color: "#3b82f6",
    default_currency: "USD",
    timezone: "UTC",
    maintenance_mode: false,
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  useEffect(() => {
    if (settings) {
      const siteNameSetting = settings.find(setting => setting.key === 'site_name');
      const primaryColorSetting = settings.find(setting => setting.key === 'primary_color');
      const defaultCurrencySetting = settings.find(setting => setting.key === 'default_currency');
      const timezoneSetting = settings.find(setting => setting.key === 'timezone');
      const maintenanceModeSetting = settings.find(setting => setting.key === 'maintenance_mode');

      setGeneralSettings({
        site_name: siteNameSetting?.value || "",
        primary_color: primaryColorSetting?.value || "#3b82f6",
        default_currency: defaultCurrencySetting?.value || "USD",
        timezone: timezoneSetting?.value || "UTC",
        maintenance_mode: maintenanceModeSetting?.value || false,
      });
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
      
      // If updating primary color, apply it immediately to CSS
      if (key === 'primary_color') {
        document.documentElement.style.setProperty('--primary-color', value);
        const hex = value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
        document.documentElement.style.setProperty('--primary-color-hover', `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-20)})`);
      }
    },
    onSuccess: () => {
      showSuccess("Settings Updated", "System settings have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings-theme'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  if (isError) {
    return <div>Error loading settings.</div>;
  }

  return (
    <div className="space-y-6 admin-panel-bg min-h-screen p-6">
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-6 w-6" />
            System Settings & Configuration
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure all aspects of your platform from this central control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 glass-card-dark border-white/10 min-w-max">
                <TabsTrigger value="general" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">General</TabsTrigger>
                <TabsTrigger value="auth" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Authentication</TabsTrigger>
                <TabsTrigger value="users" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">User Roles</TabsTrigger>
                <TabsTrigger value="properties" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Properties</TabsTrigger>
                <TabsTrigger value="surveys" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Surveys</TabsTrigger>
                <TabsTrigger value="compliance" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Compliance</TabsTrigger>
                <TabsTrigger value="staff" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Staff</TabsTrigger>
                <TabsTrigger value="support" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Support</TabsTrigger>
                <TabsTrigger value="security" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Security</TabsTrigger>
                <TabsTrigger value="apis" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">APIs</TabsTrigger>
                <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">Notifications</TabsTrigger>
                <TabsTrigger value="seo" className="text-white data-[state=active]:bg-primary-dynamic whitespace-nowrap">SEO</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-4">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">General Configuration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Basic site settings and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Site Name</Label>
                      <Input
                        value={generalSettings.site_name}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Enter site name"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'site_name', value: generalSettings.site_name, category: 'general' })}
                        className="bg-primary-dynamic hover:bg-primary-dynamic"
                      >
                        Save Site Name
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={generalSettings.primary_color}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primary_color: e.target.value })}
                          className="bg-white/5 border-white/20 w-20 h-10"
                        />
                        <Input
                          value={generalSettings.primary_color}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primary_color: e.target.value })}
                          className="bg-white/5 border-white/20 text-white flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'primary_color', value: generalSettings.primary_color, category: 'general' })}
                        className="bg-primary-dynamic hover:bg-primary-dynamic"
                      >
                        Apply Color
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Default Currency</Label>
                      <Select value={generalSettings.default_currency} onValueChange={(value) => setGeneralSettings({ ...generalSettings, default_currency: value })}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                          <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY" className="text-white">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD" className="text-white">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD" className="text-white">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CHF" className="text-white">CHF - Swiss Franc</SelectItem>
                          <SelectItem value="CNY" className="text-white">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="INR" className="text-white">INR - Indian Rupee</SelectItem>
                          <SelectItem value="IDR" className="text-white">IDR - Indonesian Rupiah</SelectItem>
                          <SelectItem value="SGD" className="text-white">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="MYR" className="text-white">MYR - Malaysian Ringgit</SelectItem>
                          <SelectItem value="THB" className="text-white">THB - Thai Baht</SelectItem>
                          <SelectItem value="PHP" className="text-white">PHP - Philippine Peso</SelectItem>
                          <SelectItem value="VND" className="text-white">VND - Vietnamese Dong</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'default_currency', value: generalSettings.default_currency, category: 'general' })}
                        className="bg-primary-dynamic hover:bg-primary-dynamic"
                      >
                        Save Currency
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Timezone</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="UTC" className="text-white">UTC</SelectItem>
                          <SelectItem value="America/New_York" className="text-white">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago" className="text-white">Central Time</SelectItem>
                          <SelectItem value="America/Denver" className="text-white">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles" className="text-white">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London" className="text-white">London</SelectItem>
                          <SelectItem value="Europe/Paris" className="text-white">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo" className="text-white">Tokyo</SelectItem>
                          <SelectItem value="Asia/Shanghai" className="text-white">Shanghai</SelectItem>
                          <SelectItem value="Asia/Jakarta" className="text-white">Jakarta</SelectItem>
                          <SelectItem value="Asia/Singapore" className="text-white">Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'timezone', value: generalSettings.timezone, category: 'general' })}
                        className="bg-primary-dynamic hover:bg-primary-dynamic"
                      >
                        Save Timezone
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Maintenance Mode</Label>
                        <p className="text-sm text-gray-400">Enable to temporarily disable site access</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={generalSettings.maintenance_mode}
                          onCheckedChange={(checked) => {
                            setGeneralSettings({ ...generalSettings, maintenance_mode: checked });
                            updateSettingMutation.mutate({ key: 'maintenance_mode', value: checked, category: 'general' });
                          }}
                        />
                        <Badge variant={generalSettings.maintenance_mode ? "destructive" : "default"}>
                          {generalSettings.maintenance_mode ? "ON" : "OFF"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Authentication Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure authentication methods and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Authentication settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">User Roles Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">User roles management content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Properties Configuration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Settings related to property listings and display
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Properties configuration content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surveys">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Surveys Configuration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage survey settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Surveys configuration content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Compliance Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure compliance-related settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Compliance settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Staff Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage staff accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Staff management content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Support Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure support channels and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Support settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure security settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Security settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apis">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">API Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage API keys and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">API settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Notifications Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure notification settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Notifications settings content</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card className="glass-card-dark border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">SEO Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure SEO settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">SEO settings content</p>
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
