import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioManager, PortfolioData } from '@/hooks/usePortfolioManager';
import { useDealAlerts, DealAlert } from '@/hooks/useDealAlerts';
import { useUserAiProfile } from '@/hooks/useUserAiProfile';
import { lazy, Suspense } from 'react';
const AIReadinessBadge = lazy(() => import('@/components/ai/AIReadinessBadge'));
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, TrendingUp, Home, DollarSign, Shield, Bell,
  Flame, Sparkles, ArrowUpRight, AlertTriangle, BarChart3,
  ChevronRight, Target, Zap, Eye,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const ROIAnalyticsDashboard = lazy(() => import('@/components/investor/ROIAnalyticsDashboard'));

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

const HEAT_COLORS: Record<string, string> = {
  'Very Hot': 'text-red-500 bg-red-500/10',
  'Hot': 'text-orange-500 bg-orange-500/10',
  'Warm': 'text-amber-500 bg-amber-500/10',
  'Stable': 'text-blue-500 bg-blue-500/10',
  'Cool': 'text-slate-400 bg-slate-400/10',
};

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// AI Recommendations hook
function useAIRecommendations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['investor-ai-recs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'match_property', payload: { limit: 6 } },
      });
      if (error) throw error;
      return data?.recommendations || data?.properties || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
}

// Market heat hook
function useMarketHeat() {
  return useQuery({
    queryKey: ['investor-market-heat'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'demand_intelligence' },
      });
      if (error) throw error;
      return data?.data?.hotspots || data?.data?.cities || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portfolio = usePortfolioManager();
  const recommendations = useAIRecommendations();
  const marketHeat = useMarketHeat();
  const dealAlerts = useDealAlerts();
  const aiProfile = useUserAiProfile();

  const p = portfolio.data as PortfolioData | undefined;
  const alerts = dealAlerts.data || [];
  const recs = (recommendations.data || []) as any[];
  const heatData = (marketHeat.data || []) as any[];

  // Derive portfolio stats
  const totalInvested = p?.portfolio_value || 0;
  const projectedValue = p?.projected_value_5y || 0;
  const blendedROI = p?.average_roi || 0;
  const annualRentalIncome = p?.properties
    ? p.properties.reduce((sum, prop) => sum + (prop.rental_yield / 100) * prop.price, 0)
    : 0;

  // Allocation pie data
  const allocationData = p?.properties
    ? Object.entries(
        p.properties.reduce((acc, prop) => {
          const type = prop.property_type || 'Other';
          acc[type] = (acc[type] || 0) + prop.price;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const riskScore = p ? Math.round(
    (p.geo_concentration ? 20 : 0) +
    (p.type_concentration ? 15 : 0) +
    (100 - (p.avg_investment_score || 50)) * 0.5 +
    (p.properties.length < 3 ? 15 : 0)
  ) : 0;
  const riskLevel = riskScore <= 30 ? 'Low' : riskScore <= 60 ? 'Medium' : 'High';
  const riskColor = riskScore <= 30 ? 'text-emerald-500' : riskScore <= 60 ? 'text-amber-500' : 'text-destructive';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 backdrop-blur-sm">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Investor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered insights for your property portfolio
                {aiProfile.data && (
                  <Badge variant="outline" className="ml-2 text-[10px] capitalize">{aiProfile.data.buyer_type}</Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/portfolio-dashboard')}>
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Full Portfolio
            </Button>
            <Button size="sm" onClick={() => navigate('/recommendations')}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Picks
            </Button>
          </div>
        </motion.div>

        {/* ═══════ PORTFOLIO OVERVIEW ═══════ */}
        <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Invested', value: totalInvested, icon: DollarSign, format: formatIDR, sub: `${p?.total_properties || 0} properties` },
              { label: 'Projected Value (5Y)', value: projectedValue, icon: TrendingUp, format: formatIDR, sub: projectedValue > totalInvested ? `+${formatShort(projectedValue - totalInvested)}` : '—' },
              { label: 'Blended ROI', value: blendedROI, icon: Target, format: (v: number) => `${v.toFixed(1)}%`, sub: '5-year average' },
              { label: 'Annual Rental Income', value: annualRentalIncome, icon: Home, format: formatIDR, sub: 'Estimated gross' },
            ].map((kpi, i) => (
              <Card key={i} className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <kpi.icon className="w-4 h-4" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  {portfolio.isLoading ? (
                    <Skeleton className="h-7 w-32" />
                  ) : (
                    <>
                      <p className="text-xl font-bold text-foreground">{kpi.format(kpi.value)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══════ LEFT: AI Recs + Market Heat ═══════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Recommendations
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/recommendations')}>
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendations.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                    </div>
                  ) : recs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Browse properties to get personalized recommendations</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recs.slice(0, 6).map((rec: any, i: number) => (
                        <div
                          key={rec.id || i}
                          className="flex gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                          onClick={() => navigate(`/property/${rec.id}`)}
                        >
                          {rec.thumbnail_url ? (
                            <img src={rec.thumbnail_url} alt="" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0">
                              <Home className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {rec.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{rec.city || rec.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {rec.match_score != null && (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                                  {Math.round(rec.match_score)}% match
                                </Badge>
                              )}
                              <span className="text-[10px] font-medium text-foreground">
                                {formatShort(rec.price)}
                              </span>
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Heat */}
            <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" /> Market Heat Map
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/market-intelligence')}>
                      Full Report <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {marketHeat.isLoading ? (
                    <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                  ) : heatData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No market data available</p>
                  ) : (
                    <div className="space-y-2">
                      {heatData.slice(0, 8).map((city: any, i: number) => {
                        const heat = city.heat_level || city.market_status || 'Stable';
                        const heatCls = HEAT_COLORS[heat] || HEAT_COLORS['Stable'];
                        const score = city.demand_heat_score || city.activity_score || city.score || 0;
                        return (
                          <div key={city.city || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/15 border border-border/20">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{city.city || city.name}</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${heatCls}`}>{heat}</span>
                              </div>
                              <Progress value={Math.min(100, score)} className="h-1 mt-1.5" />
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-foreground">{score}</p>
                              <p className="text-[9px] text-muted-foreground">
                                {city.growth_rate != null ? `${city.growth_rate > 0 ? '+' : ''}${city.growth_rate.toFixed(1)}%` : '—'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ═══════ RIGHT: Risk + Allocation + Alerts ═══════ */}
          <div className="space-y-6">
            {/* Portfolio Risk */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Portfolio Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolio.isLoading ? (
                    <Skeleton className="h-32" />
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="relative w-28 h-28 mx-auto">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted/20" />
                            <circle
                              cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                              strokeDasharray={`${riskScore * 2.64} 264`}
                              strokeLinecap="round"
                              className={riskScore <= 30 ? 'stroke-emerald-500' : riskScore <= 60 ? 'stroke-amber-500' : 'stroke-destructive'}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-bold ${riskColor}`}>{riskScore}</span>
                            <span className="text-[10px] text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`mt-2 text-xs ${riskColor}`}>{riskLevel} Risk</Badge>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-xs">
                        {[
                          { label: 'Geographic Diversification', ok: !p?.geo_concentration },
                          { label: 'Asset Type Diversification', ok: !p?.type_concentration },
                          { label: 'Portfolio Size (3+)', ok: (p?.total_properties || 0) >= 3 },
                          { label: 'Avg Investment Score', ok: (p?.avg_investment_score || 0) >= 60 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className={item.ok ? 'text-emerald-500' : 'text-amber-500'}>{item.ok ? '✓' : '⚠'}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Allocation Pie */}
            {allocationData.length > 0 && (
              <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={allocationData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2} className="stroke-card">
                          {allocationData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [formatIDR(v), 'Value']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      {allocationData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Smart Alerts */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Smart Alerts
                      {dealAlerts.unreadCount > 0 && (
                        <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground">{dealAlerts.unreadCount}</Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {dealAlerts.isLoading ? (
                    <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-6">
                      <Zap className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">No alerts yet — we'll notify you of deals, price drops & opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {alerts.slice(0, 8).map((alert: DealAlert) => {
                        const isUnread = !alert.is_read;
                        const dealPct = alert.metadata?.deal_score_percent;
                        return (
                          <div
                            key={alert.id}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:border-primary/30 ${
                              isUnread ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-border/20'
                            }`}
                            onClick={() => alert.property_id && navigate(`/property/${alert.property_id}`)}
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{alert.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{alert.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {dealPct != null && (
                                    <Badge variant="secondary" className="text-[8px] h-3.5 px-1">
                                      {dealPct.toFixed(0)}% below market
                                    </Badge>
                                  )}
                                  <span className="text-[9px] text-muted-foreground">
                                    {new Date(alert.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                              {isUnread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Top/Weakest Performers */}
        {p && (p.top_performer || p.weakest_performer) && (
          <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.top_performer && (
                <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Top Performer</p>
                      <p className="text-sm font-semibold text-foreground truncate">{p.top_performer.title}</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-500">{p.top_performer.roi_5y.toFixed(1)}%</span>
                  </CardContent>
                </Card>
              )}
              {p.weakest_performer && (
                <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Eye className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Needs Attention</p>
                      <p className="text-sm font-semibold text-foreground truncate">{p.weakest_performer.title}</p>
                    </div>
                    <span className="text-lg font-bold text-amber-500">{p.weakest_performer.roi_5y.toFixed(1)}%</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* ROI Forecast Analytics */}
        <motion.div {...fadeIn}>
          <Separator className="my-6" />
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            AI ROI Forecast Analytics
          </h2>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ROIAnalyticsDashboard />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
