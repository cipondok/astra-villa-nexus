
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

interface UserWalletInfo {
  id: string;
  full_name: string | null;
  email: string;
  wallet_address?: string;
  wallet_verified: boolean;
  is_admin: boolean;
  role: string;
}

const AstraTokenManagement = () => {
  const [settings, setSettings] = useState<TokenSettings>({
    signup_bonus: { amount: 100, enabled: true },
    daily_checkin: { amount: 5, enabled: true },
    profile_completion: { amount: 50, enabled: true },
    minimum_rent_payment: { amount: 10, enabled: true },
  });
  
  const [users, setUsers] = useState<UserWalletInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTokenSettings();
    loadUsers();
  }, []);

  const loadTokenSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('astra_token_settings')
        .select('*');

      if (error) throw error;

      if (data) {
        const newSettings = { ...settings };
        data.forEach(setting => {
          if (newSettings[setting.setting_key as keyof TokenSettings]) {
            // Properly cast the Json type to our TokenSetting interface
            const settingValue = setting.setting_value as any;
            if (typeof settingValue === 'object' && settingValue !== null) {
              newSettings[setting.setting_key as keyof TokenSettings] = {
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
      // Get users with their wallet connections
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

      // Get wallet connections separately
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallet_connections')
        .select('user_id, wallet_address, is_verified');

      if (walletsError) {
        console.error('Error loading wallet connections:', walletsError);
      }

      // Combine the data - only proceed if profilesData exists
      if (profilesData) {
        const usersWithWallets: UserWalletInfo[] = profilesData.map(profile => {
          const walletConnection = walletsData?.find(w => w.user_id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            role: profile.role,
            wallet_address: walletConnection?.wallet_address,
            wallet_verified: walletConnection?.is_verified || false,
            is_admin: profile.role === 'admin'
          };
        });

        setUsers(usersWithWallets);
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
          .from('astra_token_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            description: `Settings for ${key.replace('_', ' ')}`
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

  const toggleWalletVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('wallet_connections')
        .update({ is_verified: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, wallet_verified: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error updating wallet verification:', error);
      alert('Failed to update wallet verification');
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newRole = currentStatus ? 'general_user' : 'admin';
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus, role: newRole }
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
            Manage token rewards, user wallets, and admin functions
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Token Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(settings).map(([key, setting]) => (
              <Card key={key}>
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
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          [key]: { ...prev[key as keyof TokenSettings], amount: Number(e.target.value) }
                        }))
                      }
                      disabled={!setting.enabled}
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
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Token Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Wallet Management</CardTitle>
              <CardDescription>
                Manage user wallet connections and verification status
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
                        {user.wallet_address && (
                          <div className="text-xs text-blue-600">
                            Wallet: {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.wallet_verified ? "default" : "secondary"}>
                          {user.wallet_verified ? "Verified" : "Unverified"}
                        </Badge>
                        {user.is_admin && (
                          <Badge variant="destructive">Admin</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWalletVerification(user.id, user.wallet_verified)}
                          disabled={!user.wallet_address}
                        >
                          {user.wallet_verified ? "Unverify" : "Verify"}
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_admin ? "destructive" : "default"}
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        >
                          {user.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Emergency controls for critical situations. Use with caution.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Emergency Transaction Freeze</CardTitle>
              <CardDescription>
                Temporarily disable all token transactions system-wide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Freeze All Transactions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenManagement;
