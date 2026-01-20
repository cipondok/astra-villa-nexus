import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AffiliatePanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: affiliate, isLoading } = useQuery({
    queryKey: ['affiliate', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const copyReferralLink = () => {
    if (affiliate?.referral_code) {
      const link = `${window.location.origin}/?ref=${affiliate.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    }
  };

  if (isLoading) return <Card className="animate-pulse h-32" />;

  if (!affiliate) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Affiliate Program
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 text-center">
          <p className="text-xs text-muted-foreground mb-3">Join our affiliate program to earn commissions!</p>
          <Button size="sm" onClick={async () => {
            if (!user?.id) return;
            await supabase.from('affiliates').insert({ user_id: user.id });
            window.location.reload();
          }}>
            Join Program
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Affiliate Dashboard
          </CardTitle>
          <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
            {affiliate.status}
          </Badge>
        </div>
        <CardDescription className="text-[10px] sm:text-xs">
          Code: <span className="font-mono font-bold">{affiliate.referral_code}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{affiliate.total_referrals || 0}</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{affiliate.pending_earnings || 0}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{affiliate.total_earnings || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
        <Button size="sm" className="w-full gap-2" onClick={copyReferralLink}>
          <Copy className="h-3 w-3" />
          Copy Referral Link
        </Button>
      </CardContent>
    </Card>
  );
};
