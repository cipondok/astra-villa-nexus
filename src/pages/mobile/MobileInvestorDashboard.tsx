import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, 
  Target, AlertTriangle, ArrowRight, Sparkles, Building2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioManager } from '@/hooks/usePortfolioManager';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const MobileInvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: portfolio, isLoading } = usePortfolioManager();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 text-gold-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Sign in to view your portfolio</h2>
          <button
            onClick={() => navigate('/auth')}
            className="btn-gold-orange px-8 py-3"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (n: number) => {
    if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}M`;
    if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  };

  const riskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const quickLinks = [
    { icon: Target, label: 'Deal Finder', path: '/deal-finder', color: 'bg-emerald-500/10 text-emerald-500' },
    { icon: BarChart3, label: 'Price Predict', path: '/price-prediction', color: 'bg-blue-500/10 text-blue-500' },
    { icon: PieChart, label: 'Portfolio', path: '/portfolio-dashboard', color: 'bg-purple-500/10 text-purple-500' },
    { icon: Building2, label: 'Off-Market', path: '/off-market-deals', color: 'bg-gold-primary/10 text-gold-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Investor Dashboard</h1>
          <p className="text-xs text-muted-foreground">AI-powered portfolio insights</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </>
        ) : portfolio ? (
          <>
            {/* Portfolio Value Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden p-5"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--gold-primary) / 0.15), hsl(var(--gold-secondary) / 0.08))',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full -mr-8 -mt-8" />
              <p className="text-xs text-muted-foreground font-medium mb-1">Total Portfolio Value</p>
              <h2 className="text-2xl font-bold text-foreground mb-0.5">
                {formatCurrency(portfolio.portfolio_value)}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">5Y Projected:</span>
                <span className="text-sm font-semibold text-emerald-500">
                  {formatCurrency(portfolio.projected_value_5y)}
                </span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Properties</p>
                  <p className="text-lg font-bold text-foreground">{portfolio.total_properties}</p>
                </div>
                <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Avg ROI</p>
                  <p className="text-lg font-bold text-emerald-500">{portfolio.average_roi.toFixed(1)}%</p>
                </div>
                <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Risk</p>
                  <p className={cn("text-lg font-bold capitalize", riskColor(portfolio.risk_level))}>
                    {portfolio.risk_level}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              {quickLinks.map((link, i) => (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl active:scale-95 transition-transform",
                    link.color, "bg-opacity-10"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{link.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Top / Weakest Performers */}
            {(portfolio.top_performer || portfolio.weakest_performer) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Performance</h3>
                {portfolio.top_performer && (
                  <div
                    onClick={() => navigate(`/properties/${portfolio.top_performer!.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{portfolio.top_performer.title}</p>
                      <p className="text-[10px] text-muted-foreground">Best performer</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">+{portfolio.top_performer.roi_5y.toFixed(1)}%</span>
                  </div>
                )}
                {portfolio.weakest_performer && (
                  <div
                    onClick={() => navigate(`/properties/${portfolio.weakest_performer!.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/15 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <TrendingDown className="h-5 w-5 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{portfolio.weakest_performer.title}</p>
                      <p className="text-[10px] text-muted-foreground">Needs attention</p>
                    </div>
                    <span className="text-sm font-bold text-destructive">{portfolio.weakest_performer.roi_5y.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Properties List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Holdings</h3>
                <button onClick={() => navigate('/portfolio-dashboard')} className="text-xs text-gold-primary font-medium flex items-center gap-0.5">
                  View All <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {portfolio.properties.slice(0, 5).map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => navigate(`/properties/${prop.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <img
                    src={prop.thumbnail_url || '/placeholder.svg'}
                    alt={prop.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{prop.title}</p>
                    <p className="text-[10px] text-muted-foreground">{prop.city}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">{formatCurrency(prop.price)}</p>
                    <p className={cn("text-[10px] font-medium", prop.roi_5y > 0 ? 'text-emerald-500' : 'text-destructive')}>
                      {prop.roi_5y > 0 ? '+' : ''}{prop.roi_5y.toFixed(1)}% ROI
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Save properties to build your portfolio</p>
            <button onClick={() => navigate('/search')} className="btn-gold-orange px-6 py-2.5 text-sm">
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileInvestorDashboard;
