import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Users, DollarSign, Share2, TrendingUp, UserPlus, Award, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import ReferralLeaderboard from '@/components/referral/ReferralLeaderboard';
import CommissionTierTracker from '@/components/referral/CommissionTierTracker';
import CommissionHistoryTable from '@/components/referral/CommissionHistoryTable';
import { useReferralDashboard, useJoinReferralProgram } from '@/hooks/useReferralDashboard';

const ReferralDashboardTab = () => {
  const { data, isLoading, error } = useReferralDashboard();
  const joinProgram = useJoinReferralProgram();

  const copyReferralLink = () => {
    if (data?.affiliate?.referral_code) {
      const link = `${window.location.origin}/?ref=${data.affiliate.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!data?.affiliate) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center space-y-3">
          <Share2 className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">Join the Referral Program</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Earn tiered commissions by sharing properties and inviting investors to ASTRA Villa.
          </p>
          <Button onClick={() => joinProgram.mutate()} disabled={joinProgram.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            {joinProgram.isPending ? 'Joining…' : 'Join Now'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, commission_tier, next_tier, all_tiers, milestone_progress, current_milestone, next_milestone, commissions, recent_activity } = data as any;

  const statCards = [
    { icon: Users, label: 'Referrals', value: stats.total_referrals, color: 'text-chart-4' },
    { icon: TrendingUp, label: 'Converted', value: stats.converted, color: 'text-chart-1' },
    { icon: Wallet, label: 'Pending', value: `IDR ${(stats.pending_earnings || 0).toLocaleString('id-ID')}`, color: 'text-chart-2' },
    { icon: DollarSign, label: 'Total Earned', value: `IDR ${(stats.total_earnings || 0).toLocaleString('id-ID')}`, color: 'text-chart-3' },
  ];

  return (
    <div className="space-y-3">
      {/* Referral Code + Copy */}
      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Your Referral Code</p>
            <p className="font-mono font-bold text-lg text-primary">{data.affiliate.referral_code}</p>
          </div>
          <Button size="sm" onClick={copyReferralLink} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-sm font-bold truncate">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Milestone Progress */}
      {current_milestone && next_milestone && (
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{current_milestone.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Next: {next_milestone.name} — IDR {next_milestone.reward.toLocaleString('id-ID')}
              </Badge>
            </div>
            <Progress value={milestone_progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground text-right">{milestone_progress}% to next milestone</p>
          </CardContent>
        </Card>
      )}

      {/* Commission Tier Tracker */}
      {commission_tier && all_tiers && (
        <CommissionTierTracker
          currentTier={commission_tier}
          nextTier={next_tier}
          allTiers={all_tiers}
          convertedCount={stats.converted}
        />
      )}

      {/* Commission History */}
      <CommissionHistoryTable commissions={commissions || []} />

      {/* Leaderboard */}
      <ReferralLeaderboard limit={10} />

      {/* Recent Activity */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Referral Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {(!recent_activity || recent_activity.length === 0) ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No referral activity yet. Share properties to get started!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recent_activity.slice(0, 10).map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.source_channel || 'direct'}
                    </Badge>
                    {t.referee_email && (
                      <span className="text-xs text-muted-foreground truncate">{t.referee_email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={t.status === 'converted' || t.status === 'rewarded' ? 'default' : 'secondary'}
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
