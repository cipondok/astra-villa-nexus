import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gem, Award, Users, TrendingUp, ArrowUpCircle } from 'lucide-react';
import { getMembershipConfig, getMembershipFromUserLevel } from '@/types/membership';
import VIPLevelBadge from '@/components/ui/VIPLevelBadge';

interface VIPDistribution {
  level_name: string;
  count: number;
}

interface RecentUpgrade {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  level_name: string;
  updated_at: string;
}

export function VIPAnalyticsDashboard() {
  // Fetch VIP distribution
  const { data: distribution, isLoading: loadingDistribution } = useQuery({
    queryKey: ['vip-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_level_id, user_levels(name)')
        .not('user_level_id', 'is', null);

      if (error) throw error;

      // Count by level
      const counts: Record<string, number> = {};
      data?.forEach((profile) => {
        const levelName = Array.isArray(profile.user_levels) 
          ? profile.user_levels[0]?.name 
          : (profile.user_levels as { name: string } | null)?.name;
        if (levelName) {
          counts[levelName] = (counts[levelName] || 0) + 1;
        }
      });

      return Object.entries(counts).map(([level_name, count]) => ({
        level_name,
        count
      })).sort((a, b) => {
        const priorityA = getMembershipConfig(getMembershipFromUserLevel(a.level_name)).priority;
        const priorityB = getMembershipConfig(getMembershipFromUserLevel(b.level_name)).priority;
        return priorityB - priorityA;
      });
    },
    staleTime: 30000,
  });

  // Fetch total users
  const { data: totalUsers } = useQuery({
    queryKey: ['total-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 30000,
  });

  // Fetch recent VIP upgrades (profiles with user_level_id updated recently)
  const { data: recentUpgrades, isLoading: loadingUpgrades } = useQuery({
    queryKey: ['recent-vip-upgrades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, updated_at, user_levels(name)')
        .not('user_level_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((profile) => ({
        user_id: profile.id,
        full_name: profile.full_name || 'Unknown User',
        avatar_url: profile.avatar_url,
        level_name: Array.isArray(profile.user_levels) 
          ? profile.user_levels[0]?.name 
          : (profile.user_levels as { name: string } | null)?.name || 'Basic',
        updated_at: profile.updated_at
      })) || [];
    },
    staleTime: 30000,
  });

  const totalVIPUsers = distribution?.reduce((sum, d) => sum + d.count, 0) || 0;
  const vipPercentage = totalUsers ? ((totalVIPUsers / totalUsers) * 100).toFixed(1) : '0';

  const getLevelIcon = (levelName: string) => {
    const level = getMembershipFromUserLevel(levelName);
    switch (level) {
      case 'diamond': return <Gem className="h-4 w-4 text-cyan-400" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'gold': return <Award className="h-4 w-4 text-yellow-400" />;
      default: return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total VIP Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVIPUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {vipPercentage}% of all users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gem className="h-4 w-4 text-cyan-400" />
              Diamond Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {distribution?.find(d => getMembershipFromUserLevel(d.level_name) === 'diamond')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top tier members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-400" />
              Platinum Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {distribution?.find(d => getMembershipFromUserLevel(d.level_name) === 'platinum')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Premium tier members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VIP Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              VIP Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDistribution ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : distribution?.length ? (
              <div className="space-y-3">
                {distribution.map((item) => {
                  const percentage = totalVIPUsers ? (item.count / totalVIPUsers) * 100 : 0;
                  const membership = getMembershipFromUserLevel(item.level_name);
                  const config = getMembershipConfig(membership);
                  
                  return (
                    <div key={item.level_name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(item.level_name)}
                          <span className="font-medium">{item.level_name}</span>
                        </div>
                        <Badge variant="secondary">{item.count} users</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: config.color.replace('text-', '').includes('cyan') ? '#22d3ee' :
                              config.color.includes('purple') ? '#a855f7' :
                              config.color.includes('yellow') ? '#eab308' :
                              config.color.includes('gray') ? '#9ca3af' : '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No VIP users yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5" />
              Recent VIP Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpgrades ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentUpgrades?.length ? (
              <div className="space-y-3">
                {recentUpgrades.map((upgrade) => (
                  <div key={upgrade.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {upgrade.avatar_url ? (
                          <img src={upgrade.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-medium">
                            {upgrade.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{upgrade.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(upgrade.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <VIPLevelBadge level={upgrade.level_name} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent VIP activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VIPAnalyticsDashboard;
