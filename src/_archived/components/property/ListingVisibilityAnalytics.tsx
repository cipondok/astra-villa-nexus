import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionType } from '@/hooks/useSubscriptionType';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Zap,
  BarChart3,
  Target,
  ArrowUpRight,
} from 'lucide-react';

interface ListingVisibilityAnalyticsProps {
  propertyId: string;
}

interface VisibilityData {
  property_id: string;
  city: string;
  current_rank_position: number;
  total_listings: number;
  visibility_percentile: number;
  last_7_days: {
    impressions: number;
    views: number;
    engagement_rate: number;
  };
  subscription: {
    current: string;
    impact: string;
  };
  upgrade_potential: {
    potential_rank_improvement: number;
    simulated_rank_with_pro: number;
    current_rank: number;
  };
  ranking_score: number;
}

export default function ListingVisibilityAnalytics({ propertyId }: ListingVisibilityAnalyticsProps) {
  const { user } = useAuth();
  const { subscriptionType } = useSubscriptionType();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing-visibility-analytics', propertyId],
    queryFn: async (): Promise<VisibilityData> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const { data: res, error: fnErr } = await supabase.functions.invoke(
        'core-engine',
        {
          headers: { Authorization: `Bearer ${token}` },
          body: { mode: 'listing_visibility_analytics', property_id: propertyId },
        }
      );

      if (fnErr) throw fnErr;
      if (res?.error) throw new Error(res.error);
      return res.data;
    },
    enabled: !!propertyId && !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const percentile = data.visibility_percentile;
  const isFree = data.subscription.current === 'free';
  const improvement = data.upgrade_potential.potential_rank_improvement;

  // Simulated weekly movement (derived from engagement signals)
  const weeklyMovement = data.last_7_days.views > 10 ? Math.ceil(data.last_7_days.views / 15) : data.last_7_days.views > 0 ? 1 : -1;

  // Percentile badge color
  const percentileBg =
    percentile >= 90
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      : percentile >= 70
        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
        : percentile >= 40
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
          : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';

  return (
    <Card className="border-border/60 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
            Listing Visibility
          </CardTitle>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold border ${percentileBg}`}>
            Top {Math.max(1, Math.round(100 - percentile))}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Large Rank Position ── */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-foreground">
                #{data.current_rank_position}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                / {data.total_listings}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              in <span className="font-semibold text-foreground/80">{data.city || 'City'}</span>
            </p>
          </div>

          {/* Weekly Movement */}
          <div className="flex items-center gap-1">
            {weeklyMovement > 0 ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 border text-[11px] font-bold gap-0.5 hover:bg-emerald-500/20">
                <TrendingUp className="h-3 w-3" />
                +{weeklyMovement}
              </Badge>
            ) : weeklyMovement < 0 ? (
              <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 border text-[11px] font-bold gap-0.5 hover:bg-red-500/20">
                <TrendingDown className="h-3 w-3" />
                {weeklyMovement}
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground border-border border text-[11px] font-bold gap-0.5">
                <Minus className="h-3 w-3" />
                0
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">this week</span>
          </div>
        </div>

        {/* ── Rank Progress Bar ── */}
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-1 transition-all duration-700"
              style={{ width: `${Math.max(5, percentile)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Lower visibility</span>
            <span>Higher visibility</span>
          </div>
        </div>

        {/* ── Metrics Grid ── */}
        <div className="grid grid-cols-3 gap-2">
          <MetricCell
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Impressions"
            value={formatNum(data.last_7_days.impressions)}
            sub="7 days"
          />
          <MetricCell
            icon={<MousePointerClick className="h-3.5 w-3.5" />}
            label="Clicks"
            value={formatNum(data.last_7_days.views)}
            sub="7 days"
          />
          <MetricCell
            icon={<Target className="h-3.5 w-3.5" />}
            label="Engagement"
            value={`${data.last_7_days.engagement_rate}%`}
            sub="rate"
            highlight={data.last_7_days.engagement_rate > 5}
          />
        </div>

        {/* ── Subscription Insight ── */}
        {isFree && improvement > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="p-1 rounded-md bg-amber-500/15 shrink-0 mt-0.5">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug">
                  Upgrade to Pro could improve your ranking by{' '}
                  <span className="text-amber-600 dark:text-amber-400">
                    ~{improvement} position{improvement !== 1 ? 's' : ''}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Move from #{data.current_rank_position} → #{data.upgrade_potential.simulated_rank_with_pro}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
              onClick={() => navigate('/membership')}
            >
              <Zap className="h-3.5 w-3.5" />
              Upgrade to Pro
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {!isFree && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{data.subscription.impact}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Sub-components ── */

function MetricCell({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-center space-y-1">
      <div className="flex justify-center text-muted-foreground">{icon}</div>
      <p className={`text-base font-bold leading-none ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
      <p className="text-[9px] text-muted-foreground/60">{sub}</p>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
