import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, PieChart, BarChart3,
  Target, ArrowRight, Sparkles, Building2, MapPin, Zap,
  Gem, Bell, ChevronRight, Brain, Flame, AlertTriangle,
  LineChart as LineChartIcon, Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioManager } from '@/hooks/usePortfolioManager';
import { useDealAlerts } from '@/hooks/useDealAlerts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';

const stagger = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Formatters ──

const formatCurrency = (n: number) => {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const riskColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-chart-3';
    case 'medium': return 'text-chart-4';
    case 'high': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

// ── Mini sparkline data ──
const sparklineData = [
  { v: 100 }, { v: 102 }, { v: 101 }, { v: 104 }, { v: 103 },
  { v: 106 }, { v: 108 }, { v: 107 }, { v: 110 }, { v: 112 },
  { v: 111 }, { v: 114 }, { v: 117 },
];

// ── Alert type config ──
const alertConfig: Record<string, { icon: React.ElementType; color: string }> = {
  price_drop: { icon: TrendingDown, color: 'text-chart-3 bg-chart-3/10' },
  high_rental_yield: { icon: TrendingUp, color: 'text-primary bg-primary/10' },
  undervalued_property: { icon: Gem, color: 'text-chart-4 bg-chart-4/10' },
  high_market_growth: { icon: BarChart3, color: 'text-chart-1 bg-chart-1/10' },
};

const MobileInvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: portfolio, isLoading } = usePortfolioManager();
  const { data: alerts, unreadCount } = useDealAlerts();

  const dailyChangePercent = useMemo(() => {
    if (!portfolio?.average_roi) return 0;
    // Simulate daily change from annualized ROI
    return +(portfolio.average_roi / 365).toFixed(2);
  }, [portfolio]);

  const quickLinks = [
    { icon: Target, label: 'Deal Finder', path: '/deal-finder', color: 'text-chart-3' },
    { icon: LineChartIcon, label: 'Predict', path: '/price-prediction', color: 'text-primary' },
    { icon: PieChart, label: 'Portfolio', path: '/portfolio-dashboard', color: 'text-chart-4' },
    { icon: Building2, label: 'Off-Market', path: '/off-market-deals', color: 'text-chart-1' },
    { icon: Flame, label: 'Heat Map', path: '/market-intelligence', color: 'text-destructive' },
    { icon: Brain, label: 'AI Advisor', path: '/investment-advisor', color: 'text-primary' },
  ];

  const topAlerts = alerts?.slice(0, 3) ?? [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Sign in to view your portfolio</h2>
          <button onClick={() => navigate('/?auth=true')} className="btn-cta px-8 py-3 rounded-xl text-sm font-medium">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground font-serif">Investor Hub</h1>
            <p className="text-[10px] text-muted-foreground">AI-powered portfolio intelligence</p>
          </div>
          <button
            onClick={() => navigate('/mobile/alerts')}
            className="relative p-2 rounded-xl bg-muted/30 active:scale-95 transition-transform"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 bg-destructive rounded-full flex items-center justify-center text-[9px] text-destructive-foreground font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-44 rounded-2xl" />
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* ── Portfolio Value Hero Card ── */}
            <motion.div
              custom={0}
              variants={stagger}
              initial="initial"
              animate="animate"
              className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-primary/10 via-chart-1/5 to-chart-4/5 border border-primary/15"
            >
              {/* Sparkline background */}
              <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="relative z-10">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Total Portfolio Value</p>
                <h2 className="text-2xl font-bold text-foreground font-serif">
                  {portfolio ? formatCurrency(portfolio.portfolio_value) : 'Rp 0'}
                </h2>

                {/* Daily ROI change */}
                <div className="flex items-center gap-2 mt-1 mb-4">
                  <div className={cn(
                    'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold',
                    dailyChangePercent >= 0 ? 'bg-chart-3/15 text-chart-3' : 'bg-destructive/15 text-destructive'
                  )}>
                    {dailyChangePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent}% today
                  </div>
                  {portfolio && (
                    <span className="text-[10px] text-muted-foreground">
                      5Y → {formatCurrency(portfolio.projected_value_5y)}
                    </span>
                  )}
                </div>

                {/* KPI row */}
                {portfolio && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background/60 backdrop-blur rounded-xl p-2 text-center">
                      <p className="text-[9px] text-muted-foreground">Properties</p>
                      <p className="text-base font-bold text-foreground">{portfolio.total_properties}</p>
                    </div>
                    <div className="bg-background/60 backdrop-blur rounded-xl p-2 text-center">
                      <p className="text-[9px] text-muted-foreground">Avg ROI</p>
                      <p className="text-base font-bold text-chart-3">{portfolio.average_roi.toFixed(1)}%</p>
                    </div>
                    <div className="bg-background/60 backdrop-blur rounded-xl p-2 text-center">
                      <p className="text-[9px] text-muted-foreground">Risk</p>
                      <p className={cn('text-base font-bold capitalize', riskColor(portfolio.risk_level))}>
                        {portfolio.risk_level}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Quick Actions Grid ── */}
            <motion.div custom={1} variants={stagger} initial="initial" animate="animate">
              <div className="grid grid-cols-6 gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-muted/30 active:scale-95 transition-transform"
                  >
                    <link.icon className={cn('h-5 w-5', link.color)} />
                    <span className="text-[8px] font-medium text-foreground">{link.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── AI Alerts Strip ── */}
            {topAlerts.length > 0 && (
              <motion.div custom={2} variants={stagger} initial="initial" animate="animate">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-chart-1" /> AI Alerts
                  </h3>
                  <button onClick={() => navigate('/mobile/alerts')} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                    View All <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {topAlerts.map((alert: any) => {
                    const config = alertConfig[alert.alert_type] || { icon: Bell, color: 'text-muted-foreground bg-muted/30' };
                    const Icon = config.icon;
                    return (
                      <button
                        key={alert.id}
                        onClick={() => alert.property_id && navigate(`/properties/${alert.property_id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 active:scale-[0.98] transition-transform text-left"
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground line-clamp-1">
                            {alert.alert_type?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </p>
                          <p className="text-[9px] text-muted-foreground line-clamp-1">{alert.message}</p>
                        </div>
                        {!alert.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Market Heat Summary ── */}
            <motion.div custom={3} variants={stagger} initial="initial" animate="animate">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-destructive" /> Market Heat
                </h3>
                <button onClick={() => navigate('/market-intelligence')} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                  Full Map <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { city: 'Bali', heat: 92, trend: '+12%', level: 'hot' as const },
                  { city: 'Jakarta', heat: 78, trend: '+6%', level: 'warm' as const },
                  { city: 'Bandung', heat: 65, trend: '+8%', level: 'warm' as const },
                ].map((zone) => (
                  <button
                    key={zone.city}
                    onClick={() => navigate('/market-intelligence')}
                    className="p-3 rounded-xl bg-card border border-border/30 text-center active:scale-95 transition-transform"
                  >
                    <p className="text-[10px] text-muted-foreground font-medium">{zone.city}</p>
                    <p className={cn(
                      'text-lg font-bold',
                      zone.heat >= 80 ? 'text-destructive' : zone.heat >= 60 ? 'text-chart-4' : 'text-chart-3'
                    )}>
                      {zone.heat}
                    </p>
                    <Badge variant="outline" className={cn(
                      'text-[7px] h-4 px-1 mt-0.5',
                      zone.heat >= 80 ? 'text-destructive border-destructive/30' : 'text-chart-4 border-chart-4/30'
                    )}>
                      {zone.trend}
                    </Badge>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Elite Opportunities ── */}
            <motion.div custom={4} variants={stagger} initial="initial" animate="animate">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Elite Opportunities
                </h3>
                <button onClick={() => navigate('/deal-finder')} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                  See All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              {portfolio && portfolio.properties.length > 0 ? (
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {portfolio.properties.slice(0, 6).map((prop) => (
                      <button
                        key={prop.id}
                        onClick={() => navigate(`/properties/${prop.id}`)}
                        className="w-44 shrink-0 rounded-2xl bg-card border border-border/30 overflow-hidden active:scale-[0.97] transition-transform text-left"
                      >
                        <div className="relative">
                          <img
                            src={prop.thumbnail_url || '/placeholder.svg'}
                            alt={prop.title}
                            className="w-full h-24 object-cover"
                            loading="lazy"
                          />
                          {/* Opportunity score ring */}
                          <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                stroke={prop.investment_score >= 80 ? 'hsl(var(--primary))' : prop.investment_score >= 60 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))'}
                                strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 14}`}
                                strokeDashoffset={`${2 * Math.PI * 14 * (1 - (prop.investment_score || 50) / 100)}`}
                              />
                            </svg>
                            <span className="absolute text-[8px] font-bold text-foreground">{prop.investment_score || '—'}</span>
                          </div>
                          {/* Demand heat label */}
                          {prop.demand_heat_score >= 70 && (
                            <Badge className="absolute bottom-1.5 left-1.5 text-[7px] h-4 px-1 bg-destructive/90 text-destructive-foreground border-0">
                              🔥 Hot
                            </Badge>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-[10px] font-semibold text-foreground line-clamp-1">{prop.title}</p>
                          <p className="text-[8px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-2.5 w-2.5" /> {prop.city}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] font-bold text-foreground">{formatCurrency(prop.price)}</span>
                            <span className={cn('text-[9px] font-bold', prop.roi_5y > 0 ? 'text-chart-3' : 'text-destructive')}>
                              {prop.roi_5y > 0 ? '+' : ''}{prop.roi_5y.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/deal-finder')}
                  className="w-full p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">Discover Elite Deals</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">AI-ranked investment opportunities</p>
                </button>
              )}
            </motion.div>

            {/* ── Performance Summary ── */}
            {portfolio && (portfolio.top_performer || portfolio.weakest_performer) && (
              <motion.div custom={5} variants={stagger} initial="initial" animate="animate">
                <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-chart-3" /> Performance
                </h3>
                <div className="space-y-1.5">
                  {portfolio.top_performer && (
                    <button
                      onClick={() => navigate(`/properties/${portfolio.top_performer!.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/15 active:scale-[0.98] transition-transform text-left"
                    >
                      <TrendingUp className="h-5 w-5 text-chart-3 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground line-clamp-1">{portfolio.top_performer.title}</p>
                        <p className="text-[9px] text-muted-foreground">Best performer</p>
                      </div>
                      <span className="text-sm font-bold text-chart-3">+{portfolio.top_performer.roi_5y.toFixed(1)}%</span>
                    </button>
                  )}
                  {portfolio.weakest_performer && (
                    <button
                      onClick={() => navigate(`/properties/${portfolio.weakest_performer!.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/15 active:scale-[0.98] transition-transform text-left"
                    >
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground line-clamp-1">{portfolio.weakest_performer.title}</p>
                        <p className="text-[9px] text-muted-foreground">Needs attention</p>
                      </div>
                      <span className="text-sm font-bold text-destructive">{portfolio.weakest_performer.roi_5y.toFixed(1)}%</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Holdings ── */}
            {portfolio && portfolio.properties.length > 0 && (
              <motion.div custom={6} variants={stagger} initial="initial" animate="animate">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-foreground">Holdings</h3>
                  <button onClick={() => navigate('/portfolio-dashboard')} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {portfolio.properties.slice(0, 5).map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => navigate(`/properties/${prop.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 active:scale-[0.98] transition-transform text-left"
                    >
                      <img
                        src={prop.thumbnail_url || '/placeholder.svg'}
                        alt={prop.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground line-clamp-1">{prop.title}</p>
                        <p className="text-[9px] text-muted-foreground">{prop.city}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-foreground">{formatCurrency(prop.price)}</p>
                        <p className={cn('text-[9px] font-medium', prop.roi_5y > 0 ? 'text-chart-3' : 'text-destructive')}>
                          {prop.roi_5y > 0 ? '+' : ''}{prop.roi_5y.toFixed(1)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileInvestorDashboard;
