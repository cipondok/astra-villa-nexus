import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Gift, 
  Calendar, 
  TrendingUp, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Eye,
  DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

interface RewardConfig {
  id: string;
  reward_type: string;
  user_role: string;
  reward_amount: number;
  percentage_rate?: number;
  conditions: any;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
}

interface TokenBalance {
  user_id: string;
  total_tokens: number;
  available_tokens: number;
  locked_tokens: number;
  lifetime_earned: number;
  user_email: string;
  user_name: string;
  user_role: string;
}

const AstraTokenManagement = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<RewardConfig | null>(null);
  const [editingReward, setEditingReward] = useState(false);

  // Fetch reward configurations
  const { data: rewardConfigs, isLoading: loadingConfigs } = useQuery({
    queryKey: ['astra-reward-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_reward_config')
        .select('*')
        .order('reward_type, user_role');
      
      if (error) throw error;
      return data as RewardConfig[];
    }
  });

  // Fetch token balances with user info
  const { data: tokenBalances, isLoading: loadingBalances } = useQuery({
    queryKey: ['astra-token-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_balances')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('total_tokens', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data.map((balance: any) => ({
        ...balance,
        user_email: balance.profiles.email,
        user_name: balance.profiles.full_name || 'Unknown',
        user_role: 'general_user'
      })) as TokenBalance[];
    }
  });

  // Fetch token statistics
  const { data: tokenStats } = useQuery({
    queryKey: ['astra-token-stats'],
    queryFn: async () => {
      const { data: totalTokensData } = await supabase
        .from('astra_token_balances')
        .select('total_tokens.sum()');
      
      const { data: totalUsersData } = await supabase
        .from('astra_token_balances')
        .select('user_id', { count: 'exact' });
      
      const { data: todayTransactionsData } = await supabase
        .from('astra_token_transactions')
        .select('amount')
        .gte('created_at', new Date().toISOString().split('T')[0]);
      
      const totalTokens = totalTokensData?.[0]?.sum || 0;
      const totalUsers = totalUsersData?.length || 0;
      const todayTransactions = todayTransactionsData?.length || 0;
      const todayRewards = todayTransactionsData?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0;
      
      return {
        totalTokens,
        totalUsers,
        todayTransactions,
        todayRewards
      };
    }
  });

  // Update reward configuration
  const updateRewardMutation = useMutation({
    mutationFn: async (reward: Partial<RewardConfig>) => {
      const { error } = await supabase
        .from('astra_reward_config')
        .update(reward)
        .eq('id', reward.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astra-reward-configs'] });
      showSuccess('Reward Updated', 'Reward configuration updated successfully');
      setEditingReward(false);
      setSelectedReward(null);
    },
    onError: (error) => {
      showError('Error', `Failed to update reward: ${error.message}`);
    }
  });

  // Manual token award
  const awardTokensMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      const { data, error } = await supabase.functions.invoke('astra-token-hub', {
        body: {
          action: 'award_tokens',
          userId,
          amount,
          transactionType: 'admin_award',
          description
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astra-token-balances'] });
      queryClient.invalidateQueries({ queryKey: ['astra-token-stats'] });
      showSuccess('Tokens Awarded', 'Tokens awarded successfully');
    },
    onError: (error) => {
      showError('Error', `Failed to award tokens: ${error.message}`);
    }
  });

  const handleSaveReward = (rewardData: Partial<RewardConfig>) => {
    if (selectedReward) {
      updateRewardMutation.mutate({ ...selectedReward, ...rewardData });
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'welcome_bonus': return 'bg-blue-100 text-blue-800';
      case 'daily_checkin': return 'bg-green-100 text-green-800';
      case 'transaction_percentage': return 'bg-orange-100 text-orange-800';
      case 'referral_bonus': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-green-100 text-green-800';
      case 'property_owner': return 'bg-yellow-100 text-yellow-800';
      case 'general_user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ASTRA Token Management</h2>
          <p className="text-muted-foreground">Manage rewards, balances, and token system configuration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => queryClient.invalidateQueries()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{tokenStats?.totalTokens?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Token Holders</p>
                <p className="text-2xl font-bold">{tokenStats?.totalUsers || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Rewards</p>
                <p className="text-2xl font-bold">{tokenStats?.todayRewards?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Transactions</p>
                <p className="text-2xl font-bold">{tokenStats?.todayTransactions || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Reward Configuration</TabsTrigger>
          <TabsTrigger value="balances">Token Balances</TabsTrigger>
          <TabsTrigger value="manual">Manual Awards</TabsTrigger>
        </TabsList>

        {/* Reward Configuration Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reward Configuration
              </CardTitle>
              <CardDescription>Configure reward amounts and conditions for different user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingConfigs ? (
                  <div>Loading reward configurations...</div>
                ) : (
                  <div className="grid gap-4">
                    {rewardConfigs?.map((config) => (
                      <div key={config.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getRewardTypeColor(config.reward_type)}>
                                {config.reward_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getUserRoleColor(config.user_role)}>
                                {config.user_role.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Switch 
                                checked={config.is_active} 
                                onCheckedChange={(checked) => 
                                  updateRewardMutation.mutate({ ...config, is_active: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Amount: {config.reward_amount} ASTRA</span>
                              {config.percentage_rate && (
                                <span>Rate: {(config.percentage_rate * 100).toFixed(2)}%</span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReward(config);
                              setEditingReward(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Token Balances
              </CardTitle>
              <CardDescription>View and monitor user token balances across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBalances ? (
                <div>Loading token balances...</div>
              ) : (
                <div className="space-y-2">
                  {tokenBalances?.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{balance.user_name}</span>
                          <Badge className={getUserRoleColor(balance.user_role)}>
                            {balance.user_role.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{balance.user_email}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-lg">{balance.total_tokens.toLocaleString()} ASTRA</div>
                        <div className="text-sm text-muted-foreground">
                          Available: {balance.available_tokens.toLocaleString()} | 
                          Lifetime: {balance.lifetime_earned.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Awards Tab */}
        <TabsContent value="manual" className="space-y-4">
          <ManualTokenAward onAward={awardTokensMutation.mutate} isLoading={awardTokensMutation.isPending} />
        </TabsContent>
      </Tabs>

      {/* Edit Reward Modal */}
      {editingReward && selectedReward && (
        <RewardEditModal
          reward={selectedReward}
          onSave={handleSaveReward}
          onClose={() => {
            setEditingReward(false);
            setSelectedReward(null);
          }}
          isLoading={updateRewardMutation.isPending}
        />
      )}
    </div>
  );
};

// Manual Token Award Component
const ManualTokenAward = ({ onAward, isLoading }: { onAward: Function; isLoading: boolean }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users-for-award'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleAward = () => {
    if (selectedUser && amount && description) {
      onAward({
        userId: selectedUser,
        amount: parseFloat(amount),
        description
      });
      setSelectedUser('');
      setAmount('');
      setDescription('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Manual Token Award
        </CardTitle>
        <CardDescription>Award tokens to users manually for special cases</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-select">Select User</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Token Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reason for award"
          />
        </div>

        <Button 
          onClick={handleAward} 
          disabled={!selectedUser || !amount || !description || isLoading}
          className="w-full"
        >
          {isLoading ? 'Awarding...' : 'Award Tokens'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Reward Edit Modal Component
const RewardEditModal = ({ 
  reward, 
  onSave, 
  onClose, 
  isLoading 
}: { 
  reward: RewardConfig; 
  onSave: Function; 
  onClose: Function; 
  isLoading: boolean;
}) => {
  const [rewardAmount, setRewardAmount] = useState(reward.reward_amount.toString());
  const [percentageRate, setPercentageRate] = useState((reward.percentage_rate || 0).toString());
  const [isActive, setIsActive] = useState(reward.is_active);

  const handleSave = () => {
    onSave({
      reward_amount: parseFloat(rewardAmount),
      percentage_rate: percentageRate ? parseFloat(percentageRate) : null,
      is_active: isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Reward Configuration</CardTitle>
          <CardDescription>
            {reward.reward_type.replace('_', ' ')} for {reward.user_role.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-amount">Reward Amount</Label>
            <Input
              id="reward-amount"
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
            />
          </div>

          {reward.reward_type === 'transaction_percentage' && (
            <div className="space-y-2">
              <Label htmlFor="percentage-rate">Percentage Rate (decimal)</Label>
              <Input
                id="percentage-rate"
                type="number"
                step="0.0001"
                value={percentageRate}
                onChange={(e) => setPercentageRate(e.target.value)}
                placeholder="e.g., 0.05 for 5%"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => onClose()} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraTokenManagement;