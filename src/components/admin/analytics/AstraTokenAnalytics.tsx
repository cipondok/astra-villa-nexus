import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Coins, TrendingUp, Users, Calendar, Crown, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AstraTokenAnalytics: React.FC = () => {
  // Fetch token statistics
  const { data: tokenStats } = useQuery({
    queryKey: ['astra-token-stats'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_admin_stats' }
      });
      return data;
    },
    refetchInterval: 30000
  });

  // Fetch top users by token balance
  const { data: topUsers } = useQuery({
    queryKey: ['astra-top-users'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_top_users' }
      });
      return data?.users || [];
    },
    refetchInterval: 60000
  });

  // Fetch recent check-ins
  const { data: recentCheckins } = useQuery({
    queryKey: ['astra-recent-checkins'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('astra-token-hub', {
        body: { action: 'get_recent_checkins' }
      });
      return data?.checkins || [];
    },
    refetchInterval: 30000
  });

  const stats = tokenStats?.stats || {};

  // Derive regular active users (e.g., users with streak >= 7) from recent check-ins
  const regularActiveUsers = React.useMemo(() => {
    if (!recentCheckins || recentCheckins.length === 0) return [] as any[];
    const byUser = new Map<string, any>();
    for (const c of recentCheckins as any[]) {
      const key = c.user_id || c.userId || c.email;
      if (!key) continue;
      const prev = byUser.get(key);
      if (!prev || (c.current_streak || 0) > (prev.current_streak || 0)) {
        byUser.set(key, c);
      }
    }
    return Array.from(byUser.values())
      .filter((u: any) => (u.current_streak || 0) >= 7)
      .sort((a: any, b: any) => (b.current_streak || 0) - (a.current_streak || 0))
      .slice(0, 10);
  }, [recentCheckins]);
  return (
    <div className="space-y-6">
      {/* Admin Tools */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Admin quick actions</div>
          <div className="flex items-center gap-2">
            <a href="/settings" className="inline-flex items-center px-3 py-2 rounded-md border bg-background hover:bg-muted transition-colors text-sm">Open ASTRA Settings</a>
            <a href="/admin" className="inline-flex items-center px-3 py-2 rounded-md border bg-background hover:bg-muted transition-colors text-sm">Open Admin Dashboard</a>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.totalTokensInCirculation?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">In circulation</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.activeUsersCount?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">With token balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Daily Check-ins</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.todayCheckins?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Transfers</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.todayTransfers?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Top Token Holders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers && topUsers.length > 0 ? (
                topUsers.slice(0, 10).map((user: any, index: number) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || user.email || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.total_tokens?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-muted-foreground">tokens</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No token holders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckins.length > 0 ? (
                recentCheckins.slice(0, 10).map((checkin: any) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={checkin.avatar_url} />
                        <AvatarFallback>
                          {checkin.full_name?.charAt(0) || checkin.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{checkin.full_name || checkin.email || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Streak: {checkin.current_streak || 0}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {checkin.created_at && formatDistanceToNow(new Date(checkin.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{checkin.tokens_earned || 0}</p>
                      <p className="text-xs text-muted-foreground">tokens</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent check-ins</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regular Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            Regular Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regularActiveUsers.length > 0 ? (
              regularActiveUsers.map((u: any, index: number) => (
                <div key={(u.user_id || u.userId || u.email || index)} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback>
                        {u.full_name?.charAt(0) || u.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{u.full_name || u.email || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">Streak: {u.current_streak || 0} days</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No regular active users yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Token System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Welcome Bonuses Claimed</h4>
              <p className="text-2xl font-bold text-blue-600">{stats.welcomeBonusesClaimed || '0'}</p>
              <p className="text-sm text-muted-foreground">Total users</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Total Transfers</h4>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTransfers || '0'}</p>
              <p className="text-sm text-muted-foreground">All time</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Average Balance</h4>
              <p className="text-2xl font-bold text-orange-600">{Math.round(stats.averageBalance || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Per active user</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraTokenAnalytics;