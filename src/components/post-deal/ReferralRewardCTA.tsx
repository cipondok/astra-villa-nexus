import { Gift, Copy, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserReferralCode } from '@/hooks/useReferralTracking';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ReferralRewardCTA() {
  const { user } = useAuth();
  const { getUserReferralCode } = useUserReferralCode();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getUserReferralCode(user.id).then(setRefCode);
    }
  }, [user?.id]);

  const referralLink = refCode ? `${window.location.origin}/?ref=${refCode}` : null;

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    }
  };

  return (
    <Card className="border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-background">
      <CardHeader className="p-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gift className="h-4 w-4 text-chart-4" />
          Invite Investors & Earn Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-xs text-muted-foreground">
          Share your referral link with fellow investors. Earn wallet credits when they sign up and fund their first investment.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-chart-4">Rp 500K</p>
            <p className="text-[10px] text-muted-foreground">Per signup</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-chart-1">Rp 1M</p>
            <p className="text-[10px] text-muted-foreground">First funding</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-primary">∞</p>
            <p className="text-[10px] text-muted-foreground">No limit</p>
          </div>
        </div>

        {referralLink ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border/50">
              <code className="text-[10px] flex-1 truncate text-muted-foreground">{referralLink}</code>
              <Button size="sm" variant="ghost" onClick={copyLink} className="h-7 px-2">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1 text-xs" onClick={copyLink}>
                <Copy className="h-3 w-3" /> Copy Link
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                <Users className="h-3 w-3" /> Share
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" className="w-full gap-1 text-xs">
            <ArrowRight className="h-3 w-3" /> Join Referral Program
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Rewards credited to your wallet upon qualifying milestones.
        </p>
      </CardContent>
    </Card>
  );
}
