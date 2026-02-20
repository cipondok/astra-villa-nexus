import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Gem, Award, Users, TrendingUp, ArrowUpCircle, Settings } from 'lucide-react';
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

interface VIPAnalyticsDashboardProps {
  onNavigate?: (section: string) => void;
}

export function VIPAnalyticsDashboard({ onNavigate }: VIPAnalyticsDashboardProps) {
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
      case 'diamond': return <Gem className="h-4 w-4 text-chart-2" />;
      case 'platinum': return <Crown className="h-4 w-4 text-chart-4" />;
      case 'gold': return <Award className="h-4 w-4 text-chart-3" />;
      default: return <Award className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">VIP Analytics Dashboard</h2>
            <p className="text-[10px] text-muted-foreground">Track VIP member distribution and activity</p>
          </div>
        </div>
        {onNavigate && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[10px] gap-1"
            onClick={() => onNavigate('user-levels')}
          >
            <Settings className="h-3 w-3" />
            Manage Levels
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="p-2 rounded-lg border bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
              <Users className="h-3 w-3 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold">{totalVIPUsers}</div>
              <div className="text-[9px] text-muted-foreground">{vipPercentage}% of all users</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-chart-2/5 border-chart-2/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-chart-2/10 rounded flex items-center justify-center">
              <Gem className="h-3 w-3 text-chart-2" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {distribution?.find(d => getMembershipFromUserLevel(d.level_name) === 'diamond')?.count || 0}
              </div>
              <div className="text-[9px] text-muted-foreground">Diamond Members</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-chart-4/5 border-chart-4/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-chart-4/10 rounded flex items-center justify-center">
              <Crown className="h-3 w-3 text-chart-4" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {distribution?.find(d => getMembershipFromUserLevel(d.level_name) === 'platinum')?.count || 0}
              </div>
              <div className="text-[9px] text-muted-foreground">Platinum Members</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* VIP Distribution */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              VIP Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingDistribution ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : distribution?.length ? (
              <div className="space-y-2">
                {distribution.map((item) => {
                  const percentage = totalVIPUsers ? (item.count / totalVIPUsers) * 100 : 0;
                  const membership = getMembershipFromUserLevel(item.level_name);
                  
                  const barColor = membership === 'diamond' ? 'hsl(var(--chart-2))' :
                    membership === 'platinum' ? 'hsl(var(--chart-4))' :
                    membership === 'gold' ? 'hsl(var(--chart-3))' : 'hsl(var(--muted-foreground))';
                  
                  return (
                    <div key={item.level_name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getLevelIcon(item.level_name)}
                          <span className="text-[10px] font-medium">{item.level_name}</span>
                        </div>
                        <Badge variant="secondary" className="text-[8px] h-4 px-1">{item.count} users</Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-[10px]">No VIP users yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <ArrowUpCircle className="h-3 w-3 text-chart-2" />
              Recent VIP Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingUpgrades ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentUpgrades?.length ? (
              <div className="space-y-1.5">
                {recentUpgrades.slice(0, 6).map((upgrade) => (
                  <div key={upgrade.user_id} className="flex items-center justify-between p-1.5 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {upgrade.avatar_url ? (
                          <img src={upgrade.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-medium">
                            {upgrade.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[10px]">{upgrade.full_name}</p>
                        <p className="text-[8px] text-muted-foreground">
                          {new Date(upgrade.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <VIPLevelBadge level={upgrade.level_name} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-[10px]">No recent VIP activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VIPAnalyticsDashboard;
