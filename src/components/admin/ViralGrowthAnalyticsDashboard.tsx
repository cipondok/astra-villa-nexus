import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Gift, Star, Shield, BarChart3, Activity } from 'lucide-react';
import { useReferralGrowthMetrics, usePublishedReviews } from '@/hooks/usePostDealEngine';

export default function ViralGrowthAnalyticsDashboard() {
  const { data: metrics = [], isLoading: metricsLoading } = useReferralGrowthMetrics();
  const { data: reviews = [], isLoading: reviewsLoading } = usePublishedReviews(20);

  const latestMetric = metrics[0] as any;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + (r.overall_score || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Viral Growth & Trust Analytics</h2>
          <p className="text-xs text-muted-foreground">Post-deal conversion, reviews, and referral growth</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{latestMetric?.total_referrals ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-chart-1" />
            <p className="text-2xl font-bold">{latestMetric?.viral_coefficient?.toFixed(2) ?? '0.00'}</p>
            <p className="text-[10px] text-muted-foreground">Viral Coefficient</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-2 text-chart-4" />
            <p className="text-2xl font-bold">{avgRating}</p>
            <p className="text-[10px] text-muted-foreground">Avg Review Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 mx-auto mb-2 text-chart-3" />
            <p className="text-2xl font-bold">
              {latestMetric?.referral_funding_rate ? `${(latestMetric.referral_funding_rate * 100).toFixed(0)}%` : '0%'}
            </p>
            <p className="text-[10px] text-muted-foreground">Referral→Funding Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Funnel */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Referral Funnel Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {[
              { label: 'Referral Links Shared', value: latestMetric?.total_referrals ?? 0, pct: 100 },
              { label: 'Signup Conversions', value: Math.round((latestMetric?.total_referrals ?? 0) * (latestMetric?.referral_signup_rate ?? 0)), pct: (latestMetric?.referral_signup_rate ?? 0) * 100 },
              { label: 'Funded Investors', value: Math.round((latestMetric?.total_referrals ?? 0) * (latestMetric?.referral_funding_rate ?? 0)), pct: (latestMetric?.referral_funding_rate ?? 0) * 100 },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{step.label}</span>
                  <span className="font-semibold">{step.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(step.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-chart-4" />
            Recent Verified Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No published reviews yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= (review.overall_score || 0) ? 'text-chart-4 fill-chart-4' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[9px] gap-1">
                      <Shield className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  </div>
                  {review.review_text && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Referrers */}
      {latestMetric?.top_referrers && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">Referrer data available in detailed reports</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
