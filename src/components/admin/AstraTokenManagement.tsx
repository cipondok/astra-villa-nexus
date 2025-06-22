
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Users, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TokenSetting {
  amount: number;
  enabled: boolean;
}

interface TokenSettings {
  signup_bonus: TokenSetting;
  daily_checkin: TokenSetting;
  profile_completion: TokenSetting;
  minimum_rent_payment: TokenSetting;
}

interface UserInfo {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

const AstraTokenManagement = () => {
  const [settings, setSettings] = useState<TokenSettings>({
    signup_bonus: { amount: 100, enabled: true },
    daily_checkin: { amount: 5, enabled: true },
    profile_completion: { amount: 50, enabled: true },
    minimum_rent_payment: { amount: 10, enabled: true },
  });
  
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTokenSettings();
    loadUsers();
  }, []);

  const loadTokenSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'astra_token_%');

      if (error) throw error;

      if (data) {
        const newSettings = { ...settings };
        data.forEach(setting => {
          const settingKey = setting.key.replace('astra_token_', '');
          if (newSettings[settingKey as keyof TokenSettings]) {
            const settingValue = setting.value as any;
            if (typeof settingValue === 'object' && settingValue !== null) {
              newSettings[settingKey as keyof TokenSettings] = {
                amount: Number(settingValue.amount) || 0,
                enabled: Boolean(settingValue.enabled)
              };
            }
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading token settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profilesData) {
        setUsers(profilesData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTokenSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: `astra_token_${key}`,
            value: value,
            category: 'astra_tokens',
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
      
      alert('Token settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'general_user' : 'admin';
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ASTRA Token Management
          </CardTitle>
          <CardDescription>
            Manage token rewards and user administration (Disabled - Enable in Tools Management)
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          ASTRA Token system is currently disabled. Enable it through Tools Management to activate these features.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Token Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(settings).map(([key, setting]) => (
              <Card key={key} className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {key.replace('_', ' ')} Reward
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${key}-enabled`}>Enable Reward</Label>
                    <Switch
                      id={`${key}-enabled`}
                      checked={setting.enabled}
                      disabled={true}
                      onCheckedChange={(enabled) =>
                        setSettings(prev => ({
                          ...prev,
                          [key]: { ...prev[key as keyof TokenSettings], enabled }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-amount`}>Token Amount</Label>
                    <Input
                      id={`${key}-amount`}
                      type="number"
                      value={setting.amount}
                      disabled={true}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          [key]: { ...prev[key as keyof TokenSettings], amount: Number(e.target.value) }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={saveTokenSettings} 
                disabled={true}
                className="w-full"
              >
                Save Token Settings (Disabled)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <Badge variant="destructive">Admin</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? "destructive" : "default"}
                          onClick={() => toggleAdminStatus(user.id, user.role)}
                        >
                          {user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenManagement;
