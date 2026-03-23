import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, Users, Wallet, Zap, Target, Gift,
  ArrowRight, RefreshCw, Send, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInvestorGrowthDashboard, useGenerateNudges, useGrowthActions, useGrowthExperiments, useInvestorReferrals } from '@/hooks/useInvestorGrowth';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

const InvestorGrowthCommandCenter = () => {
  const { data: dashboard, isLoading } = useInvestorGrowthDashboard();
  const generateNudges = useGenerateNudges();
  const { data: actions } = useGrowthActions('pending');
  const { data: experiments } = useGrowthExperiments();
  const { data: referrals } = useInvestorReferrals();

  const funnel = dashboard?.funnel ?? {};
  const rates = dashboard?.conversionRates ?? [];
  const channels = dashboard?.channelDistribution ?? {};
  const countries = dashboard?.countryDistribution ?? {};

  const stages = [
    { key: 'visit', label: 'Visit', icon: Users, color: 'text-blue-400' },
    { key: 'signup', label: 'Signup', icon: Users, color: 'text-cyan-400' },
    { key: 'verify', label: 'Verify', icon: Target, color: 'text-green-400' },
    { key: 'wallet_view', label: 'Wallet View', icon: Wallet, color: 'text-yellow-400' },
    { key: 'wallet_funded', label: 'Funded', icon: Wallet, color: 'text-emerald-400' },
    { key: 'escrow_started', label: 'Escrow', icon: Zap, color: 'text-purple-400' },
    { key: 'repeat_investment', label: 'Repeat', icon: TrendingUp, color: 'text-pink-400' },
  ];

  const topCountries = Object.entries(countries)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8);

  const maxFunnel = Math.max(...Object.values(funnel).map(Number), 1);

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: funnel.visit ?? 0, icon: Users, color: 'text-blue-400' },
          { label: 'Wallet Funded', value: funnel.wallet_funded ?? 0, icon: Wallet, color: 'text-emerald-400' },
          { label: 'Pending Nudges', value: dashboard?.pendingActions ?? 0, icon: Send, color: 'text-amber-400' },
          { label: 'Total Referrals', value: dashboard?.totalReferrals ?? 0, icon: Gift, color: 'text-pink-400' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...anim(i)}>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <Badge variant="outline" className="text-[10px]">{kpi.label}</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="funnel">Investor Funnel</TabsTrigger>
          <TabsTrigger value="nudges">Growth Actions</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="geo">Geo Distribution</TabsTrigger>
        </TabsList>

        {/* FUNNEL TAB */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Investor Activation Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stages.map((stage, i) => {
                const count = funnel[stage.key] ?? 0;
                const rate = rates.find((r: any) => r.to === stage.key);
                return (
                  <motion.div key={stage.key} {...anim(i)} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <stage.icon className={`h-4 w-4 ${stage.color}`} />
                        <span className="text-foreground font-medium">{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{count.toLocaleString()}</span>
                        {rate && (
                          <Badge variant={rate.rate >= 30 ? 'default' : 'destructive'} className="text-[10px]">
                            {rate.rate}% conv
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={maxFunnel > 0 ? (count / maxFunnel) * 100 : 0} className="h-2" />
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Channel distribution */}
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Source Channel Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(channels).map(([ch, cnt]) => (
                  <div key={ch} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm capitalize text-foreground">{ch}</span>
                    <Badge variant="secondary">{String(cnt)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NUDGES TAB */}
        <TabsContent value="nudges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Growth Nudge Automation</h3>
            <Button
              size="sm"
              onClick={() => generateNudges.mutate(undefined, {
                onSuccess: (d) => toast.success(`Created ${d.nudges_created} nudges`),
                onError: () => toast.error('Failed to generate nudges'),
              })}
              disabled={generateNudges.isPending}
            >
              {generateNudges.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
              Generate Nudges
            </Button>
          </div>
          <div className="space-y-2">
            {(actions ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No pending actions. Generate nudges to create automated outreach.</p>
            )}
            {(actions ?? []).map((a: any, i: number) => (
              <motion.div key={a.action_id} {...anim(i)}>
                <Card className="border-border/40">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mr-2 text-xs">{a.action_type}</Badge>
                      <span className="text-sm text-muted-foreground">{a.trigger_reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px]">{a.action_status}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* EXPERIMENTS TAB */}
        <TabsContent value="experiments" className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Growth Experiments</h3>
          {(experiments ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No experiments configured yet.</p>
          )}
          <div className="grid gap-3">
            {(experiments ?? []).map((exp: any, i: number) => (
              <motion.div key={exp.experiment_id} {...anim(i)}>
                <Card className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-foreground">{exp.experiment_name}</p>
                        <p className="text-xs text-muted-foreground">Variant: {exp.variant} • Type: {exp.experiment_type}</p>
                      </div>
                      <Badge variant={exp.is_active ? 'default' : 'secondary'}>
                        {exp.is_active ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div><p className="text-xs text-muted-foreground">Impressions</p><p className="text-lg font-bold text-foreground">{exp.impressions}</p></div>
                      <div><p className="text-xs text-muted-foreground">Conversions</p><p className="text-lg font-bold text-foreground">{exp.conversions}</p></div>
                      <div><p className="text-xs text-muted-foreground">Conv Rate</p><p className="text-lg font-bold text-foreground">{exp.conversion_rate}%</p></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* REFERRALS TAB */}
        <TabsContent value="referrals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Investor Referral Network</h3>
            <div className="flex gap-2">
              <Badge variant="outline">Total: {dashboard?.totalReferrals ?? 0}</Badge>
              <Badge variant="default">Settled: {dashboard?.settledReferrals ?? 0}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            {(referrals ?? []).map((r: any, i: number) => (
              <motion.div key={r.referral_id} {...anim(i)}>
                <Card className="border-border/40">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="h-4 w-4 text-pink-400" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Code: {r.referral_code}</p>
                        <p className="text-xs text-muted-foreground">{r.referral_reward_type} • {r.reward_amount}</p>
                      </div>
                    </div>
                    <Badge variant={r.reward_settled ? 'default' : 'outline'} className="text-xs">
                      {r.activation_status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* GEO TAB */}
        <TabsContent value="geo" className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Country-Level Investor Growth</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topCountries.map(([country, count], i) => (
              <motion.div key={country} {...anim(i)}>
                <Card className="border-border/40">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{String(count)}</p>
                    <p className="text-xs text-muted-foreground uppercase">{country}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {topCountries.length === 0 && (
            <p className="text-sm text-muted-foreground">No geo data collected yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorGrowthCommandCenter;
