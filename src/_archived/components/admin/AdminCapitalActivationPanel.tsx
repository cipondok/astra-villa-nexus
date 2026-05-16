import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCapitalActivationDashboard, useFundingFunnelAnalytics } from '@/hooks/useWalletFunding';
import Price from '@/components/ui/Price';
import {
  TrendingUp, Users, Wallet, Target, AlertTriangle,
  CheckCircle2, Loader2, BarChart3, Zap, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const AdminCapitalActivationPanel = () => {
  const { data: dashboard, isLoading: dashLoading } = useCapitalActivationDashboard(30);
  const { data: funnel, isLoading: funnelLoading } = useFundingFunnelAnalytics(30);

  const isLoading = dashLoading || funnelLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const funnelConversions = funnel?.conversions || {};
  const funnelStages = funnel?.funnel || [];

  const kpiCards = [
    {
      title: 'Daily Funding Volume',
      value: dashboard?.total_funded_amount || 0,
      icon: TrendingUp,
      color: 'text-primary',
      isPrice: true,
    },
    {
      title: 'First-Time Depositors',
      value: dashboard?.first_time_depositors || 0,
      icon: Users,
      color: 'text-emerald-600',
    },
    {
      title: 'Funding Success Rate',
      value: `${dashboard?.funding_success_rate || 0}%`,
      icon: Target,
      color: 'text-chart-1',
    },
    {
      title: 'Avg Funding Amount',
      value: funnelConversions.avg_funding_amount || 0,
      icon: Wallet,
      color: 'text-amber-600',
      isPrice: true,
    },
    {
      title: 'View → Click Rate',
      value: `${funnelConversions.view_to_click_pct || 0}%`,
      icon: Zap,
      color: 'text-violet-600',
    },
    {
      title: 'Click → Success Rate',
      value: `${funnelConversions.click_to_success_pct || 0}%`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
  ];

  // Funnel visualization
  const maxUsers = Math.max(...funnelStages.map((s: any) => s.unique_users), 1);

  const stageLabels: Record<string, string> = {
    wallet_viewed: 'Wallet Viewed',
    funding_cta_clicked: 'CTA Clicked',
    payment_session_started: 'Payment Started',
    payment_completed: 'Payment Completed',
    funding_failed: 'Failed',
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h2 className="text-xl font-bold text-foreground">Capital Activation Command Center</h2>
        <p className="text-sm text-muted-foreground">Wallet funding conversion optimization & investor capital inflow analytics</p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                {card.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {card.isPrice ? <Price amount={card.value as number} /> : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Funding Funnel */}
      <motion.div variants={fadeUp}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Funding Conversion Funnel (30 days)
            </CardTitle>
            <CardDescription>Investor journey from wallet view to successful funding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelStages.filter((s: any) => s.stage !== 'funding_failed').map((stage: any, idx: number) => {
                const pct = maxUsers > 0 ? (stage.unique_users / maxUsers) * 100 : 0;
                const isFailed = stage.stage === 'funding_failed';
                return (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-36 text-xs font-medium text-foreground shrink-0">
                      {stageLabels[stage.stage] || stage.stage}
                    </div>
                    <div className="flex-1">
                      <Progress value={pct} className="h-6" />
                    </div>
                    <div className="w-16 text-right">
                      <Badge variant="outline" className={`text-xs ${isFailed ? 'text-destructive' : ''}`}>
                        {stage.unique_users}
                      </Badge>
                    </div>
                    {idx < funnelStages.length - 2 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                );
              })}
              {/* Failed separately */}
              {funnelStages.find((s: any) => s.stage === 'funding_failed') && (
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <div className="w-36 text-xs font-medium text-destructive shrink-0 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed Attempts
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={(funnelStages.find((s: any) => s.stage === 'funding_failed')?.unique_users || 0) / maxUsers * 100}
                      className="h-6"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <Badge variant="outline" className="text-xs text-destructive">
                      {funnelStages.find((s: any) => s.stage === 'funding_failed')?.unique_users || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nudge & Experiment Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Nudge Performance</CardTitle>
            <CardDescription>Automated funding prompts effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{dashboard?.nudges_sent || 0}</p>
                <p className="text-xs text-muted-foreground">Nudges Sent</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-emerald-600">{dashboard?.nudges_converted || 0}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Conversion rate: {dashboard?.nudges_sent
                ? ((dashboard.nudges_converted / dashboard.nudges_sent) * 100).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
            <CardDescription>Wallet funding engine status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Funding Engine: Active
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Nudge Automation: Active
              </Badge>
              <Badge variant="outline" className={
                (dashboard?.funding_success_rate || 0) < 50
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }>
                Success Rate: {(dashboard?.funding_success_rate || 0) < 50 ? 'Low' : 'Healthy'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {dashboard?.experiments_count || 0} experiments tracked in period
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminCapitalActivationPanel;
