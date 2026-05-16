/**
 * Investor Portfolio Dashboard
 * Premium dashboard showing portfolio value, ROI, risk, and market insights
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Shield, BarChart3, Globe, Wallet,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';
import { useLuxuryMicrocopy } from '@/hooks/useLuxuryMicrocopy';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioMetric {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

const InvestorPortfolioDashboard = memo(() => {
  const { formatPrice, geoProfile } = useGeoPersonalization();
  const copy = useLuxuryMicrocopy();
  const { user } = useAuth();

  // Simulated portfolio data — in production, pull from Supabase
  const metrics = useMemo((): PortfolioMetric[] => [
    {
      label: 'Portfolio Value',
      value: formatPrice(15750000000),
      change: 12.4,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Total ROI',
      value: '+24.8%',
      change: 3.2,
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Annual Yield',
      value: '8.6%',
      change: 0.4,
      icon: BarChart3,
      color: 'text-amber-400',
    },
    {
      label: 'Risk Level',
      value: 'Moderate',
      icon: Shield,
      color: 'text-sky-400',
    },
  ], [formatPrice]);

  const insights = useMemo(() => [
    {
      title: 'Bali Market Momentum',
      description: 'Villa sector showing 15% YoY appreciation — consider increased allocation',
      type: 'opportunity' as const,
    },
    {
      title: 'Jakarta Central Stabilizing',
      description: 'Apartment oversupply easing — price floor established at IDR 35M/sqm',
      type: 'insight' as const,
    },
    {
      title: 'New Regulation Alert',
      description: 'Foreign ownership eased in select tourist zones — expanded investment access',
      type: 'alert' as const,
    },
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {copy.label('portfolio')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of your investment performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5" />
          {geoProfile.country}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <Card className="bg-card/50 border-border/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={cn('w-4 h-4', metric.color)} />
                  {metric.change !== undefined && (
                    <span className={cn(
                      'text-[10px] font-medium flex items-center gap-0.5',
                      metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {metric.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(metric.change)}%
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-foreground tracking-tight">{metric.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Market Insights */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/50 border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  insight.type === 'opportunity' && 'bg-emerald-500/5 border-emerald-500/20',
                  insight.type === 'insight' && 'bg-primary/5 border-primary/20',
                  insight.type === 'alert' && 'bg-amber-500/5 border-amber-500/20',
                )}
              >
                <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

InvestorPortfolioDashboard.displayName = 'InvestorPortfolioDashboard';

export default InvestorPortfolioDashboard;
