import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Calendar, 
  CheckCircle, 
  Gift,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TokenBalance {
  total_tokens: number;
  available_tokens: number;
  locked_tokens: number;
  lifetime_earned: number;
}

interface CheckinStatus {
  hasCheckedInToday: boolean;
  currentStreak: number;
  todayCheckin?: {
    tokens_earned: number;
    bonus_multiplier: number;
  };
}

interface AstraTokenWidgetProps {
  compact?: boolean;
  showTransactionBonus?: boolean;
}

const AstraTokenWidget: React.FC<AstraTokenWidgetProps> = ({ 
  compact = false,
  showTransactionBonus = true 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

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
    enabled: !!user?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch checkin status
  const { data: checkinStatus } = useQuery({
    queryKey: ['astra-checkin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_checkin_status', userId: user.id }
      });
      
      return data as CheckinStatus;
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refresh every minute
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

  // Transaction bonus function
  const triggerTransactionBonus = async (amount: number, transactionType = 'purchase') => {
    if (!user?.id || !showTransactionBonus) return;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { 
          action: 'transaction_reward', 
          userId: user.id, 
          amount,
          referenceType: transactionType 
        }
      });
      
      if (data?.success) {
        showSuccess('Transaction Bonus!', `Earned ${data.tokensAwarded} ASTRA tokens!`);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
      }
    } catch (error) {
      console.error('Transaction bonus error:', error);
    }
  };

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStreakProgress = (streak: number) => {
    if (streak >= 30) return { progress: 100, nextMilestone: 'Max bonus!' };
    if (streak >= 14) return { progress: ((streak - 14) / 16) * 100, nextMilestone: '30 days for 3x bonus' };
    if (streak >= 7) return { progress: ((streak - 7) / 7) * 100, nextMilestone: '14 days for 2x bonus' };
    return { progress: (streak / 7) * 100, nextMilestone: '7 days for 1.5x bonus' };
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Compact version for sidebars/headers
  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">{formatTokenAmount(balance?.total_tokens || 0)} ASTRA</p>
                <p className="text-xs text-muted-foreground">
                  {checkinStatus?.currentStreak || 0} day streak
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {!checkinStatus?.hasCheckedInToday && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => checkinMutation.mutate()}
                  disabled={checkinMutation.isPending}
                  className="h-8 w-8 p-0"
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              )}
              <Link to="/astra-tokens">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Zap className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full widget version
  return (
    <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-600" />
            <span>ASTRA Tokens</span>
          </div>
          <Badge variant="outline" className="bg-white">
            {formatTokenAmount(balance?.total_tokens || 0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-lg font-bold text-green-600">
              {formatTokenAmount(balance?.available_tokens || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lifetime Earned</p>
            <p className="text-lg font-bold text-blue-600">
              {formatTokenAmount(balance?.lifetime_earned || 0)}
            </p>
          </div>
        </div>

        {/* Daily Check-in Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Daily Check-in</span>
            </div>
            <Badge variant={checkinStatus?.hasCheckedInToday ? 'default' : 'secondary'}>
              {checkinStatus?.currentStreak || 0} days
            </Badge>
          </div>

          {checkinStatus?.hasCheckedInToday ? (
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-800 font-medium">
                ✅ Checked in today! 
                {checkinStatus.todayCheckin && (
                  <span className="block text-xs">
                    +{formatTokenAmount(checkinStatus.todayCheckin.tokens_earned)} ASTRA earned
                  </span>
                )}
              </p>
            </div>
          ) : (
            <Button 
              onClick={() => checkinMutation.mutate()}
              disabled={checkinMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {checkinMutation.isPending ? 'Checking In...' : 'Check In Now'}
            </Button>
          )}

          {/* Streak Progress */}
          {checkinStatus?.currentStreak && checkinStatus.currentStreak > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Streak Progress</span>
                <span>{getStreakProgress(checkinStatus.currentStreak).nextMilestone}</span>
              </div>
              <Progress 
                value={getStreakProgress(checkinStatus.currentStreak).progress} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Transaction Bonus Info */}
        {showTransactionBonus && (
          <div className="bg-orange-100 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Transaction Bonus</span>
            </div>
            <p className="text-xs text-orange-700">
              Earn tokens automatically on every purchase and transaction!
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link to="/astra-tokens" className="flex-1">
            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              View Hub
            </Button>
          </Link>
          <Link to="/astra-tokens?tab=referrals" className="flex-1">
            <Button variant="outline" className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Refer Friends
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Export the transaction bonus trigger function for use in other components
export const useTransactionBonus = () => {
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const queryClient = useQueryClient();

  return async (amount: number, transactionType = 'purchase') => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { 
          action: 'transaction_reward', 
          userId: user.id, 
          amount,
          referenceType: transactionType 
        }
      });
      
      if (data?.success) {
        showSuccess('Transaction Bonus!', `Earned ${data.tokensAwarded} ASTRA tokens!`);
        queryClient.invalidateQueries({ queryKey: ['astra-balance'] });
        return data.tokensAwarded;
      }
    } catch (error) {
      console.error('Transaction bonus error:', error);
    }
    return 0;
  };
};

export default AstraTokenWidget;