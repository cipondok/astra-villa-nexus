
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Coins, Settings } from "lucide-react";

interface TokenSettingValue {
  amount?: number;
  percentage?: number;
  enabled?: boolean;
  price?: number;
  daily_limit?: number;
  [key: string]: any;
}

interface TokenSetting {
  id: string;
  setting_key: string;
  setting_value: TokenSettingValue;
  description: string;
}

const AstraTokenSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: tokenSettings, isLoading } = useQuery({
    queryKey: ['astra-token-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as TokenSetting[];
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('astra_token_settings')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "ASTRA token settings updated");
      queryClient.invalidateQueries({ queryKey: ['astra-token-settings'] });
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      showError("Error", "Failed to update settings");
    },
  });

  const handleSettingUpdate = (setting: TokenSetting, key: string, value: any) => {
    const newValue = { ...setting.setting_value };
    newValue[key] = key === 'enabled' ? value : Number(value);
    
    updateSettingMutation.mutate({
      id: setting.id,
      updates: { setting_value: newValue }
    });
  };

  const renderSettingInputs = (setting: TokenSetting) => {
    const value = setting.setting_value as TokenSettingValue;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</h3>
            <p className="text-sm text-muted-foreground">{setting.description}</p>
          </div>
          <Switch
            checked={value?.enabled || false}
            onCheckedChange={(enabled) => handleSettingUpdate(setting, 'enabled', enabled)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(value || {}).map(([key, val]) => {
            if (key === 'enabled') return null;
            
            return (
              <div key={key}>
                <Label className="text-sm">{key.replace(/_/g, ' ')}</Label>
                <Input
                  type="number"
                  value={val as string}
                  onChange={(e) => handleSettingUpdate(setting, key, e.target.value)}
                  placeholder={`Enter ${key}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="card-ios">
        <CardContent className="p-6">
          <div className="text-center">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-ios">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          ASTRA Token Configuration
        </CardTitle>
        <CardDescription>
          Configure token rewards, pricing, and limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tokenSettings?.map((setting) => (
            <div key={setting.id} className="p-4 border rounded-lg">
              {renderSettingInputs(setting)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraTokenSettings;
