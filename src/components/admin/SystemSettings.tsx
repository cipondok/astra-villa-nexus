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
import { Settings, Loader2, RefreshCw, AlertCircle } from "lucide-react";
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

  const { data: settings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      console.log('Fetching system settings...');
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*');
        
        if (error) {
          console.error('Settings fetch error:', error);
          throw error;
        }
        
        console.log('Settings fetched successfully:', data);
        return data as SystemSetting[];
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        // Return empty array on error to prevent infinite loading
        return [];
      }
    },
    retry: 2,
    retryDelay: 3000,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      console.log('Processing settings:', settings);
      const siteNameSetting = settings.find(setting => setting.key === 'site_name');
      const primaryColorSetting = settings.find(setting => setting.key === 'primary_color');
      const defaultCurrencySetting = settings.find(setting => setting.key === 'default_currency');
      const timezoneSetting = settings.find(setting => setting.key === 'timezone');
      const maintenanceModeSetting = settings.find(setting => setting.key === 'maintenance_mode');

      const newSettings = {
        site_name: siteNameSetting?.value || "AstraVilla Realty",
        primary_color: primaryColorSetting?.value || "#3b82f6",
        default_currency: defaultCurrencySetting?.value || "USD",
        timezone: timezoneSetting?.value || "UTC",
        maintenance_mode: maintenanceModeSetting?.value || false,
      };
      
      console.log('Updating general settings:', newSettings);
      setGeneralSettings(newSettings);
    } else if (settings && settings.length === 0) {
      // If settings array is empty, use defaults
      console.log('No settings found, using defaults');
      setGeneralSettings({
        site_name: "AstraVilla Realty",
        primary_color: "#3b82f6",
        default_currency: "USD",
        timezone: "UTC",
        maintenance_mode: false,
      });
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      console.log('Updating setting:', { key, value, category });
      
      try {
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
        
        if (error) {
          console.error('Setting update error:', error);
          throw error;
        }
        
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
        
        console.log('Setting updated successfully');
      } catch (err) {
        console.error('Failed to update setting:', err);
        throw err;
      }
    },
    onSuccess: () => {
      showSuccess("Settings Updated", "System settings have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings-theme'] });
    },
    onError: (error: any) => {
      console.error('Setting update failed:', error);
      showError("Update Failed", error.message || "Failed to update settings");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Settings Loading Error</h3>
              <p className="text-destructive mb-4">
                {error?.message || "Unable to load system settings. This might be due to database permissions or RLS policies."}
              </p>
              <div className="space-x-2">
                <Button 
                  onClick={() => refetch()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Reset to defaults and allow manual configuration
                    setGeneralSettings({
                      site_name: "AstraVilla Realty",
                      primary_color: "#3b82f6",
                      default_currency: "USD",
                      timezone: "UTC",
                      maintenance_mode: false,
                    });
                  }}
                >
                  Use Defaults
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Settings className="h-6 w-6 text-primary" />
            System Settings & Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure all aspects of your platform from this central control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <div className="bg-muted/20 rounded-lg p-2 border border-border/50">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 bg-transparent h-auto p-1">
                <TabsTrigger 
                  value="general" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-background border border-border"
                >
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="auth" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20 bg-background border border-border"
                >
                  Auth
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-background border border-border"
                >
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-background border border-border"
                >
                  Properties
                </TabsTrigger>
                <TabsTrigger 
                  value="surveys" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-background border border-border"
                >
                  Surveys
                </TabsTrigger>
                <TabsTrigger 
                  value="compliance" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-pink-50 dark:hover:bg-pink-900/20 bg-background border border-border"
                >
                  Compliance
                </TabsTrigger>
                <TabsTrigger 
                  value="staff" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 bg-background border border-border"
                >
                  Staff
                </TabsTrigger>
                <TabsTrigger 
                  value="support" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-background border border-border"
                >
                  Support
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-background border border-border"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="apis" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 bg-background border border-border"
                >
                  APIs
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-background border border-border"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="seo" 
                  className="whitespace-nowrap text-xs px-2 py-2 rounded-md data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-background border border-border"
                >
                  SEO
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">General Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Basic site settings and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Site Name</Label>
                      <Input
                        value={generalSettings.site_name}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                        className="bg-background border-border text-foreground"
                        placeholder="Enter site name"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'site_name', value: generalSettings.site_name, category: 'general' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Site Name'
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={generalSettings.primary_color}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primary_color: e.target.value })}
                          className="bg-background border-border w-20 h-10"
                        />
                        <Input
                          value={generalSettings.primary_color}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primary_color: e.target.value })}
                          className="bg-background border-border text-foreground flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'primary_color', value: generalSettings.primary_color, category: 'general' })}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Color'
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Default Currency</Label>
                      <Select value={generalSettings.default_currency} onValueChange={(value) => setGeneralSettings({ ...generalSettings, default_currency: value })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="USD" className="text-foreground">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR" className="text-foreground">EUR - Euro</SelectItem>
                          <SelectItem value="GBP" className="text-foreground">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY" className="text-foreground">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD" className="text-foreground">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD" className="text-foreground">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CHF" className="text-foreground">CHF - Swiss Franc</SelectItem>
                          <SelectItem value="CNY" className="text-foreground">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="INR" className="text-foreground">INR - Indian Rupee</SelectItem>
                          <SelectItem value="IDR" className="text-foreground">IDR - Indonesian Rupiah</SelectItem>
                          <SelectItem value="SGD" className="text-foreground">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="MYR" className="text-foreground">MYR - Malaysian Ringgit</SelectItem>
                          <SelectItem value="THB" className="text-foreground">THB - Thai Baht</SelectItem>
                          <SelectItem value="PHP" className="text-foreground">PHP - Philippine Peso</SelectItem>
                          <SelectItem value="VND" className="text-foreground">VND - Vietnamese Dong</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'default_currency', value: generalSettings.default_currency, category: 'general' })}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Currency'
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-medium">Timezone</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="UTC" className="text-foreground">UTC</SelectItem>
                          <SelectItem value="America/New_York" className="text-foreground">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago" className="text-foreground">Central Time</SelectItem>
                          <SelectItem value="America/Denver" className="text-foreground">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles" className="text-foreground">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London" className="text-foreground">London</SelectItem>
                          <SelectItem value="Europe/Paris" className="text-foreground">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo" className="text-foreground">Tokyo</SelectItem>
                          <SelectItem value="Asia/Shanghai" className="text-foreground">Shanghai</SelectItem>
                          <SelectItem value="Asia/Jakarta" className="text-foreground">Jakarta</SelectItem>
                          <SelectItem value="Asia/Singapore" className="text-foreground">Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => updateSettingMutation.mutate({ key: 'timezone', value: generalSettings.timezone, category: 'general' })}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Timezone'
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground font-medium">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground mt-1">Enable to temporarily disable site access</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={generalSettings.maintenance_mode}
                          onCheckedChange={(checked) => {
                            setGeneralSettings({ ...generalSettings, maintenance_mode: checked });
                            updateSettingMutation.mutate({ key: 'maintenance_mode', value: checked, category: 'general' });
                          }}
                          disabled={updateSettingMutation.isPending}
                        />
                        <Badge variant={generalSettings.maintenance_mode ? "destructive" : "default"} className="min-w-[60px] justify-center">
                          {generalSettings.maintenance_mode ? "ON" : "OFF"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Authentication Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure authentication methods and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Authentication settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Roles Management</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">User roles management content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Properties Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Settings related to property listings and display
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Properties configuration content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surveys">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Surveys Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage survey settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Surveys configuration content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Compliance Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure compliance-related settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Compliance settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Staff Management</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage staff accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Staff management content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Support Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure support channels and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Support settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Security Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure security settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Security settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apis">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">API Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage API keys and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">API settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Notifications Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure notification settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">Notifications settings content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">SEO Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure SEO settings and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">SEO settings content coming soon...</p>
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
