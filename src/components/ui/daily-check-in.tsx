
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Gift, CheckCircle, AlertTriangle } from 'lucide-react';

const DailyCheckIn = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
    enabled: isAuthenticated,
  });

  // Check daily check-in settings
  const { data: checkInSettings } = useQuery({
    queryKey: ['daily-checkin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'daily_checkin_rewards')
        .eq('category', 'astra_tokens')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value;
    },
    enabled: tokenSystemEnabled,
  });

  // Check if user has already checked in today
  const { data: hasCheckedInToday, refetch } = useQuery({
    queryKey: ['daily-checkin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'daily_check_in')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .limit(1);
      
      if (error && error.code !== 'PGRST116') throw error;
      return data && data.length > 0;
    },
    enabled: isAuthenticated && tokenSystemEnabled,
  });

  const handleCheckIn = async () => {
    if (!user?.id || !tokenSystemEnabled) return;

    setIsLoading(true);
    try {
      // Record the check-in activity
      const { error: activityError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'daily_check_in',
          description: 'Daily check-in completed'
        });

      if (activityError) throw activityError;

      // Get reward amount
      const rewardAmount = checkInSettings && typeof checkInSettings === 'object' 
        ? (checkInSettings as { enabled?: boolean; amount?: number }).amount || 5
        : 5;

      const rewardsEnabled = checkInSettings && typeof checkInSettings === 'object' 
        ? (checkInSettings as { enabled?: boolean; amount?: number }).enabled || false
        : false;

      showSuccess(
        "Check-in Complete!",
        `Daily check-in recorded successfully! ${rewardsEnabled ? `You earned ${rewardAmount} ASTRA tokens!` : ''}`
      );
      
      refetch();
    } catch (error) {
      console.error('Check-in error:', error);
      showError("Error", "Failed to complete daily check-in");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In
          </CardTitle>
          <CardDescription>
            Sign in to claim your daily rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access daily check-in rewards.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!tokenSystemEnabled) {
    return (
      <Card className="w-full max-w-md opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In (Disabled)
          </CardTitle>
          <CardDescription>
            Daily rewards are currently disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ASTRA Token system is disabled. Enable it through Admin Tools to activate daily rewards.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getRewardAmount = () => {
    if (!checkInSettings || typeof checkInSettings !== 'object') return 5;
    return (checkInSettings as { amount?: number }).amount || 5;
  };

  const getRewardsEnabled = () => {
    if (!checkInSettings || typeof checkInSettings !== 'object') return false;
    return (checkInSettings as { enabled?: boolean }).enabled || false;
  };

  const rewardAmount = getRewardAmount();
  const rewardsEnabled = getRewardsEnabled();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Check-In
        </CardTitle>
        <CardDescription>
          {rewardsEnabled 
            ? `Claim your daily ${rewardAmount} ASTRA tokens`
            : 'Daily check-in tracking'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCheckedInToday ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed Today
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              You've already checked in today. Come back tomorrow for your next reward!
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Ready to check in!</p>
              {rewardsEnabled && (
                <p className="text-sm text-muted-foreground">
                  Earn {rewardAmount} ASTRA tokens
                </p>
              )}
            </div>
            <Button 
              onClick={handleCheckIn} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Checking in...' : 'Check In Now'}
            </Button>
          </div>
        )}

        {!rewardsEnabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Daily check-in rewards are currently disabled by administrators.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;
