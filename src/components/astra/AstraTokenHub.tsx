import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Gift, 
  Calendar, 
  TrendingUp, 
  History, 
  Users,
  CheckCircle,
  Clock,
  Star,
  Award,
  Copy,
  ExternalLink,
  Send,
  ArrowUpDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRoles';
import AstraTokenTransfer from './AstraTokenTransfer';
import AstraTransferHistory from './AstraTransferHistory';
import { useNavigate } from 'react-router-dom';

interface TokenBalance {
  total_tokens: number;
  available_tokens: number;
  locked_tokens: number;
  lifetime_earned: number;
}

interface TokenTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
  reference_type?: string;
}

interface CheckinStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  todayCheckin?: {
    tokens_earned: number;
    bonus_multiplier: number;
  };
}

const AstraTokenHub = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [referralCode, setReferralCode] = useState('');

  // Fetch token balance
  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ['astra-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_balance', userId: user.id }
      });
      
      return data?.balance as TokenBalance;
    },
    enabled: !!user?.id
  });

  // Fetch transactions
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['astra-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_transactions', userId: user.id }
      });
      
      return data?.transactions as TokenTransaction[];
    },
    enabled: !!user?.id
  });

  // Fetch checkin status
  const { data: checkinStatus, isLoading: loadingCheckin } = useQuery({
    queryKey: ['astra-checkin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_checkin_status', userId: user.id }
      });
      
      return data as CheckinStatus;
    },
    enabled: !!user?.id
  });

  // Daily checkin mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'daily_checkin', userId: user.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
      queryClient.invalidateQueries({ queryKey: ['astra-checkin-status'] });
      queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
      
      if (data.success) {
        showSuccess('Daily Check-in Complete!', data.message);
      } else {
        showError('Check-in Failed', data.message);
      }
    },
    onError: (error) => {
      showError('Error', `Failed to check in: ${error.message}`);
    }
  });

  // Welcome bonus mutation
  const welcomeBonusMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'welcome_bonus', userId: user.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
      queryClient.invalidateQueries({ queryKey: ['astra-transactions'] });
      
      if (data.success) {
        showSuccess('Welcome Bonus Claimed!', data.message);
      } else {
        showError('Bonus Already Claimed', data.message);
      }
    },
    onError: (error) => {
      showError('Error', `Failed to claim welcome bonus: ${error.message}`);
    }
  });

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'welcome_bonus': return <Gift className="h-4 w-4 text-blue-600" />;
      case 'daily_checkin': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'transaction_reward': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'referral': return <Users className="h-4 w-4 text-purple-600" />;
      case 'spend': return <ExternalLink className="h-4 w-4 text-red-600" />;
      default: return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount < 0) return 'text-red-600';
    switch (type) {
      case 'welcome_bonus': return 'text-blue-600';
      case 'daily_checkin': return 'text-green-600';
      case 'transaction_reward': return 'text-orange-600';
      case 'referral': return 'text-purple-600';
      default: return 'text-green-600';
    }
  };

  const getStreakReward = (streak: number) => {
    if (streak >= 30) return { multiplier: '3x', color: 'text-purple-600' };
    if (streak >= 14) return { multiplier: '2x', color: 'text-orange-600' };
    if (streak >= 7) return { multiplier: '1.5x', color: 'text-blue-600' };
    return { multiplier: '1x', color: 'text-green-600' };
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${user?.id}`;
    navigator.clipboard.writeText(link);
    showSuccess('Copied!', 'Referral link copied to clipboard');
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to access your ASTRA Token Hub</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-8 w-8 text-yellow-600" />
            ASTRA Token Hub
          </h2>
          <p className="text-muted-foreground">Earn, manage, and track your ASTRA tokens</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {formatTokenAmount(balance?.total_tokens || 0)} ASTRA
        </Badge>
      </div>

      {/* Token Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available Tokens</p>
                <p className="text-2xl font-bold">{formatTokenAmount(balance?.available_tokens || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                <p className="text-2xl font-bold">{formatTokenAmount(balance?.lifetime_earned || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Locked Tokens</p>
                <p className="text-2xl font-bold">{formatTokenAmount(balance?.locked_tokens || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earn" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="earn">Earn Tokens</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="transactions">History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Transfer Tab */}
        <TabsContent value="transfer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AstraTokenTransfer />
            <AstraTransferHistory />
          </div>
        </TabsContent>

        {/* Earn Tokens Tab */}
        <TabsContent value="earn" className="space-y-4">
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Admin Tools
                </CardTitle>
                <CardDescription>
                  Admin accounts cannot claim rewards. Manage ASTRA settings and analytics instead.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button onClick={() => navigate('/settings')} className="w-full">
                    Open ASTRA Admin Settings
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/admin')} className="w-full">
                    Open Admin Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Check-in */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Check-in
                  </CardTitle>
                  <CardDescription>
                    Check in daily to earn tokens and build your streak!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Current Streak</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{checkinStatus?.currentStreak || 0}</span>
                        <span className="text-sm text-muted-foreground">days</span>
                        {checkinStatus?.currentStreak && checkinStatus.currentStreak >= 7 && (
                          <Badge className={`${getStreakReward(checkinStatus.currentStreak).color} bg-transparent border`}>
                            {getStreakReward(checkinStatus.currentStreak).multiplier} Bonus
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => checkinMutation.mutate()}
                      disabled={checkinStatus?.hasCheckedInToday || checkinMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {checkinStatus?.hasCheckedInToday ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Checked In
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          {checkinMutation.isPending ? 'Checking In...' : 'Check In'}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {checkinStatus?.hasCheckedInToday && checkinStatus.todayCheckin && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Earned {formatTokenAmount(checkinStatus.todayCheckin.tokens_earned)} ASTRA tokens today!
                        {checkinStatus.todayCheckin.bonus_multiplier > 1 && (
                          <span className="font-medium"> ({checkinStatus.todayCheckin.bonus_multiplier}x streak bonus)</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Streak Milestones</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>7 days: 1.5x bonus</span>
                        <span>14 days: 2x bonus</span>
                      </div>
                      <div className="flex justify-between">
                        <span>30 days: 3x bonus</span>
                        <span>Keep the streak alive!</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Welcome Bonus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Welcome Bonus
                  </CardTitle>
                  <CardDescription>
                    Claim your one-time welcome bonus to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎉</div>
                    <div>
                      <p className="text-lg font-semibold">Ready to claim your welcome bonus?</p>
                      <p className="text-sm text-muted-foreground">Get started with free ASTRA tokens</p>
                    </div>
                    <Button 
                      onClick={() => welcomeBonusMutation.mutate()}
                      disabled={welcomeBonusMutation.isPending}
                      className="w-full"
                      variant="default"
                    >
                      {welcomeBonusMutation.isPending ? 'Claiming...' : 'Claim Welcome Bonus'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Earning Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ways to Earn ASTRA Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2 p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto text-green-600" />
                  <h3 className="font-medium">Daily Check-in</h3>
                  <p className="text-sm text-muted-foreground">Earn tokens daily with streak bonuses</p>
                </div>
                <div className="text-center space-y-2 p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-orange-600" />
                  <h3 className="font-medium">Transactions</h3>
                  <p className="text-sm text-muted-foreground">Earn % rewards on platform transactions</p>
                </div>
                <div className="text-center space-y-2 p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-purple-600" />
                  <h3 className="font-medium">Referrals</h3>
                  <p className="text-sm text-muted-foreground">Invite friends and earn bonus tokens</p>
                </div>
                <div className="text-center space-y-2 p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto text-blue-600" />
                  <h3 className="font-medium">Special Events</h3>
                  <p className="text-sm text-muted-foreground">Participate in platform events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>View all your ASTRA token transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatTokenAmount(transaction.amount)} ASTRA
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Start earning tokens to see your transaction history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Refer Friends & Earn
              </CardTitle>
              <CardDescription>Invite friends and both of you earn bonus tokens!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">How Referrals Work</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Share your unique referral link with friends</p>
                  <p>• When they sign up and complete verification, you both earn tokens</p>
                  <p>• The more friends you refer, the more tokens you earn!</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referral-link">Your Referral Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-link"
                    value={`${window.location.origin}/signup?ref=${user.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h3 className="font-medium">Friends Referred</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Coins className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                  <h3 className="font-medium">Referral Earnings</h3>
                  <p className="text-2xl font-bold">0 ASTRA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Reward System
              </CardTitle>
              <CardDescription>Understand how you earn tokens on our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Token Earning Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Daily Check-in</span>
                          <Badge>10-25 ASTRA</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Base amount varies by user role</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Transaction Rewards</span>
                          <Badge>1-5%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Percentage of transaction value</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Referral Bonus</span>
                          <Badge>50-200 ASTRA</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Per successful referral</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Welcome Bonus</span>
                          <Badge>100-500 ASTRA</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">One-time signup bonus</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Streak Bonuses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>7 Day Streak</span>
                      <Badge variant="outline" className="text-blue-600">1.5x Multiplier</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>14 Day Streak</span>
                      <Badge variant="outline" className="text-orange-600">2x Multiplier</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span>30 Day Streak</span>
                      <Badge variant="outline" className="text-purple-600">3x Multiplier</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenHub;