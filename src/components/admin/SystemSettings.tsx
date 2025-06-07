import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Settings, Save, Database, Shield, Globe, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, any>>({});

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      // Convert to object for easier access
      const settingsObj: Record<string, any> = {};
      data.forEach(setting => {
        if (!settingsObj[setting.category]) {
          settingsObj[setting.category] = {};
        }
        settingsObj[setting.category][setting.key] = {
          value: setting.value,
          description: setting.description,
          is_public: setting.is_public
        };
      });
      
      setSettings(settingsObj);
      return settingsObj;
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ category, key, value }: { category: string, key: string, value: any }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        })
        .eq('category', category)
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      showSuccess("Success", "Setting updated successfully");
    },
    onError: (error) => {
      showError("Error", `Failed to update setting: ${error.message}`);
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          value
        }
      }
    }));
  };

  const handleSaveSetting = (category: string, key: string) => {
    const value = settings[category]?.[key]?.value;
    updateSettingMutation.mutate({ category, key, value });
  };

  const renderSettingInput = (category: string, key: string, setting: any) => {
    const value = setting.value;
    
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleSettingChange(category, key, checked)}
          />
          <Label>{value ? 'Enabled' : 'Disabled'}</Label>
        </div>
      );
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleSettingChange(category, key, e.target.value)}
          rows={3}
        />
      );
    }
    
    return (
      <Input
        value={value?.toString() || ''}
        onChange={(e) => {
          const val = e.target.value;
          // Try to parse as number if it looks like one
          const numVal = Number(val);
          const finalVal = !isNaN(numVal) && val !== '' ? numVal : val;
          handleSettingChange(category, key, finalVal);
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Loading system settings...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure global system settings and preferences</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                General Settings
              </CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.general && Object.entries(settings.general).map(([key, setting]: [string, any]) => (
                <div key={key} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</Label>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSetting('general', key)}
                      disabled={updateSettingMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  {renderSettingInput('general', key, setting)}
                </div>
              ))}
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
              <CardDescription>Authentication and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.security && Object.entries(settings.security).map(([key, setting]: [string, any]) => (
                <div key={key} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</Label>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSetting('security', key)}
                      disabled={updateSettingMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  {renderSettingInput('security', key, setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                AI & Automation Settings
              </CardTitle>
              <CardDescription>Configure AI models and automation features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.ai && Object.entries(settings.ai).map(([key, setting]: [string, any]) => (
                <div key={key} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</Label>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSetting('ai', key)}
                      disabled={updateSettingMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  {renderSettingInput('ai', key, setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Billing & Payment Settings
              </CardTitle>
              <CardDescription>Configure billing and payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.billing && Object.entries(settings.billing).map(([key, setting]: [string, any]) => (
                <div key={key} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</Label>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSetting('billing', key)}
                      disabled={updateSettingMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  {renderSettingInput('billing', key, setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
