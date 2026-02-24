import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, DollarSign, Share2, MousePointerClick, TrendingUp, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const ReferralDashboardTab = () => {
  const { user } = useAuth();

  const { data: affiliate, isLoading: affLoading } = useQuery({
    queryKey: ['affiliate-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: trackingData = [] } = useQuery({
    queryKey: ['referral-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: shareCount = 0 } = useQuery({
    queryKey: ['share-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('property_shares' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const totalClicks = trackingData.reduce((sum, t) => sum + (t.click_count || 0), 0);
  const totalConversions = trackingData.filter((t) => t.status === 'converted').length;

  const copyReferralLink = () => {
    if (affiliate?.referral_code) {
      const link = `${window.location.origin}/?ref=${affiliate.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    }
  };

  const handleJoinProgram = async () => {
    if (!user?.id) return;
    await supabase.from('affiliates').insert({ user_id: user.id });
    window.location.reload();
  };

  if (affLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center space-y-3">
          <Share2 className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">Join the Referral Program</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Earn rewards by sharing properties and inviting friends to Astra Villa Realty.
          </p>
          <Button onClick={handleJoinProgram}>
            <UserPlus className="h-4 w-4 mr-2" />
            Join Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { icon: Share2, label: 'Shares', value: shareCount, color: 'text-primary' },
    { icon: MousePointerClick, label: 'Clicks', value: totalClicks, color: 'text-chart-1' },
    { icon: Users, label: 'Referrals', value: affiliate.total_referrals || 0, color: 'text-chart-4' },
    { icon: DollarSign, label: 'Earnings', value: `${affiliate.total_earnings || 0}`, color: 'text-chart-3' },
  ];

  return (
    <div className="space-y-3">
      {/* Referral Code + Copy */}
      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Your Referral Code</p>
            <p className="font-mono font-bold text-lg text-primary">{affiliate.referral_code}</p>
          </div>
          <Button size="sm" onClick={copyReferralLink} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Referral Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {trackingData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No referral activity yet. Share properties to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {trackingData.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.share_channel || 'direct'}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {t.click_count || 0} clicks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={t.status === 'converted' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {t.status || 'pending'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {t.created_at ? formatDistanceToNow(new Date(t.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboardTab;
