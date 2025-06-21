
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  Settings, 
  Users, 
  TrendingUp, 
  Wallet,
  Send,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenSettings {
  signup_bonus: { amount: number; enabled: boolean };
  daily_checkin: { amount: number; enabled: boolean };
  profile_completion: { amount: number; enabled: boolean };
  minimum_rent_payment: { amount: number; enabled: boolean };
  token_price_usd: { amount: number; enabled: boolean };
  max_daily_earn: { amount: number; enabled: boolean };
}

interface UserTokenBalance {
  id: string;
  email: string;
  full_name: string;
  current_balance: number;
  lifetime_earned: number;
  last_transaction: string;
  wallet_connected: boolean;
}

const TokenConfigurationPanel = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tokenSettings, setTokenSettings] = useState<TokenSettings>({
    signup_bonus: { amount: 100, enabled: true },
    daily_checkin: { amount: 5, enabled: true },
    profile_completion: { amount: 50, enabled: true },
    minimum_rent_payment: { amount: 10, enabled: true },
    token_price_usd: { amount: 0.01, enabled: true },
    max_daily_earn: { amount: 50, enabled: true },
  });

  const [userBalances] = useState<UserTokenBalance[]>([
    {
      id: '1',
      email: 'user1@example.com',
      full_name: 'John Doe',
      current_balance: 250,
      lifetime_earned: 500,
      last_transaction: '2024-01-15',
      wallet_connected: true,
    },
    {
      id: '2',
      email: 'user2@example.com',
      full_name: 'Jane Smith',
      current_balance: 150,
      lifetime_earned: 300,
      last_transaction: '2024-01-14',
      wallet_connected: false,
    },
  ]);

  const [bulkAction, setBulkAction] = useState({
    amount: '',
    reason: '',
    type: 'add' as 'add' | 'subtract',
  });

  const handleSettingUpdate = (key: keyof TokenSettings, field: 'amount' | 'enabled', value: number | boolean) => {
    setTokenSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const saveTokenSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Token settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save token settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkTokenAction = async () => {
    if (!bulkAction.amount || !bulkAction.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would process bulk token action
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`Successfully ${bulkAction.type === 'add' ? 'added' : 'removed'} ${bulkAction.amount} ASTRA tokens`);
      setBulkAction({ amount: '', reason: '', type: 'add' });
    } catch (error) {
      toast.error('Failed to process bulk action');
    } finally {
      setIsLoading(false);
    }
  };

  const settingsCards = Object.entries(tokenSettings).map(([key, setting]) => ({
    key,
    title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Configure ${key.replace(/_/g, ' ')} rewards`,
    setting,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ASTRA Token Configuration
          </CardTitle>
          <CardDescription>
            Manage token rewards, user balances, and system settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Token Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Balances
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Bulk Actions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsCards.map(({ key, title, description, setting }) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="text-sm">{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${key}-enabled`} className="text-sm">Enable Reward</Label>
                    <Switch
                      id={`${key}-enabled`}
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => handleSettingUpdate(key as keyof TokenSettings, 'enabled', enabled)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-amount`} className="text-sm">
                      {key.includes('price') ? 'Price (USD)' : 'Token Amount'}
                    </Label>
                    <Input
                      id={`${key}-amount`}
                      type="number"
                      step={key.includes('price') ? '0.001' : '1'}
                      value={setting.amount}
                      onChange={(e) => handleSettingUpdate(key as keyof TokenSettings, 'amount', Number(e.target.value))}
                      disabled={!setting.enabled}
                    />
                  </div>
                  <Badge variant={setting.enabled ? "default" : "secondary"} className="w-full justify-center">
                    {setting.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={saveTokenSettings} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Token Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                User Token Balances
              </CardTitle>
              <CardDescription>
                View and manage individual user token balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBalances.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.wallet_connected ? "default" : "secondary"}>
                          {user.wallet_connected ? "Wallet Connected" : "No Wallet"}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Last: {user.last_transaction}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold text-blue-600">
                        {user.current_balance} ASTRA
                      </div>
                      <div className="text-sm text-gray-500">
                        Lifetime: {user.lifetime_earned} ASTRA
                      </div>
                      <Button size="sm" variant="outline">
                        Adjust Balance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Bulk Token Actions
              </CardTitle>
              <CardDescription>
                Add or remove tokens from all users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Use bulk actions carefully. These changes will affect all users and cannot be easily undone.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-type">Action Type</Label>
                  <select
                    id="bulk-type"
                    value={bulkAction.type}
                    onChange={(e) => setBulkAction(prev => ({ ...prev, type: e.target.value as 'add' | 'subtract' }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="add">Add Tokens</option>
                    <option value="subtract">Remove Tokens</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bulk-amount">Amount</Label>
                  <Input
                    id="bulk-amount"
                    type="number"
                    placeholder="Enter token amount"
                    value={bulkAction.amount}
                    onChange={(e) => setBulkAction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bulk-reason">Reason</Label>
                <Input
                  id="bulk-reason"
                  placeholder="Enter reason for this action"
                  value={bulkAction.reason}
                  onChange={(e) => setBulkAction(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={handleBulkTokenAction}
                disabled={isLoading || !bulkAction.amount || !bulkAction.reason}
                className="w-full"
                variant={bulkAction.type === 'subtract' ? 'destructive' : 'default'}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {bulkAction.type === 'add' ? 'Add' : 'Remove'} {bulkAction.amount} ASTRA Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tokens Issued</p>
                    <p className="text-2xl font-bold">1,250,000</p>
                  </div>
                  <Coins className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">2,450</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Balance</p>
                    <p className="text-2xl font-bold">510</p>
                  </div>
                  <Wallet className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Token Value</p>
                    <p className="text-2xl font-bold">$0.01</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution Analytics</CardTitle>
              <CardDescription>Overview of token allocation and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">Signup Bonuses</span>
                  <span className="font-bold">245,000 ASTRA (19.6%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">Daily Check-ins</span>
                  <span className="font-bold">412,500 ASTRA (33.0%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="font-medium">Profile Completion</span>
                  <span className="font-bold">122,500 ASTRA (9.8%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="font-medium">Property Transactions</span>
                  <span className="font-bold">470,000 ASTRA (37.6%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenConfigurationPanel;
