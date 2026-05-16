import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useDailySalesWarCommand } from '@/hooks/useDailySalesWarCommand';
import {
  Target, Zap, DollarSign, Users, Clock, AlertTriangle,
  TrendingUp, CheckCircle2, Shield, ArrowUp, Phone, Eye,
} from 'lucide-react';

const fmt = (n: number) =>
  n >= 1_000_000_000 ? `Rp ${(n / 1_000_000_000).toFixed(1)}B` :
  n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(0)}M` :
  `Rp ${n.toLocaleString()}`;

const urgencyStyle: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const anim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DailySalesWarCommandPage() {
  const { data, isLoading } = useDailySalesWarCommand();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading command center…</div>
      </div>
    );
  }

  const { priorityDeals, leadMetrics, revenueImpact, scoreboard, checklist, escalationProtocol } = data;
  const targetPct = revenueImpact.dailyCommissionTarget > 0
    ? Math.min(100, Math.round((revenueImpact.dailyCommissionActual / revenueImpact.dailyCommissionTarget) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" />
              Daily Sales War Command
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Daily Target</p>
              <p className="text-sm font-bold text-foreground">{targetPct}%</p>
            </div>
            <div className="w-24">
              <Progress value={targetPct} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Strip */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {[
            { label: 'Pipeline Value', value: fmt(revenueImpact.pipelineValueTotal), icon: DollarSign, accent: 'text-primary' },
            { label: 'Hot Leads', value: leadMetrics.hotLeads, icon: Zap, accent: 'text-orange-400' },
            { label: 'Response Rate', value: `${leadMetrics.responseRate}%`, icon: Clock, accent: 'text-accent-foreground' },
            { label: 'At-Risk Deals', value: revenueImpact.atRiskDeals, icon: AlertTriangle, accent: 'text-destructive' },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={anim}>
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="priority" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="priority" className="text-xs">Priority Deals</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs">Lead Response</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue Impact</TabsTrigger>
            <TabsTrigger value="accountability" className="text-xs">Accountability</TabsTrigger>
          </TabsList>

          {/* ── Priority Deals ── */}
          <TabsContent value="priority" className="space-y-3">
            {priorityDeals.map((deal, i) => (
              <motion.div key={deal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{deal.propertyTitle}</span>
                          <Badge variant="outline" className={`text-[10px] ${urgencyStyle[deal.urgency]}`}>
                            {deal.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">{deal.stage}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{deal.city}</span>
                          <span>•</span>
                          <span>{fmt(deal.priceIdr)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{deal.hoursInStage}h in stage</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">Commission Est.</p>
                        <p className="text-sm font-bold text-primary">{fmt(deal.commissionEstimate)}</p>
                        {deal.agentName && <p className="text-[10px] text-muted-foreground">{deal.agentName}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {priorityDeals.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No active deals in pipeline</p>
            )}
          </TabsContent>

          {/* ── Lead Response ── */}
          <TabsContent value="leads" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'New Inquiries Today', value: leadMetrics.newInquiriesToday, icon: Phone },
                { label: 'Responded < 2h', value: leadMetrics.respondedWithin2h, icon: CheckCircle2 },
                { label: 'Response Rate', value: `${leadMetrics.responseRate}%`, icon: TrendingUp },
                { label: 'Viewings Booked', value: leadMetrics.viewingsBookedToday, icon: Eye },
                { label: 'Viewing Conversion', value: `${leadMetrics.viewingConversionRate}%`, icon: ArrowUp },
                { label: 'Escalated Hot Leads', value: leadMetrics.escalatedLeads, icon: AlertTriangle },
              ].map((m) => (
                <Card key={m.label} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <m.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Escalation Protocol */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  Escalation Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {escalationProtocol.map((ep, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
                      <span className="text-xs font-medium text-destructive min-w-[200px]">{ep.threshold}</span>
                      <span className="text-xs text-foreground flex-1">{ep.action}</span>
                      <Badge variant="outline" className="text-[10px] w-fit">{ep.owner}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Revenue Impact ── */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Commission Tracker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-semibold text-foreground">{fmt(revenueImpact.dailyCommissionTarget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-semibold text-primary">{fmt(revenueImpact.dailyCommissionActual)}</span>
                  </div>
                  <Progress value={targetPct} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">{targetPct}% of daily target</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk & Opportunity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">At-Risk Deals</span>
                    <span className="font-semibold text-destructive">{revenueImpact.atRiskDeals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">At-Risk Value</span>
                    <span className="font-semibold text-destructive">{fmt(revenueImpact.atRiskValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Premium Upsell Targets</span>
                    <span className="font-semibold text-primary">{revenueImpact.premiumUpsellOpportunities}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Closing Today</span>
                    <span className="font-semibold text-foreground">{fmt(revenueImpact.expectedClosingToday)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Accountability ── */}
          <TabsContent value="accountability" className="space-y-4">
            {/* Agent Scoreboard */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Agent Performance Scoreboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Agent', 'Closed', 'Viewings', 'Avg Response', 'Conversion', 'Revenue'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scoreboard.map((a, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{a.agentName}</td>
                          <td className="px-4 py-2.5 text-foreground">{a.dealsClosedToday}</td>
                          <td className="px-4 py-2.5 text-foreground">{a.viewingsConducted}</td>
                          <td className="px-4 py-2.5">
                            <span className={a.responseTimeAvgMin <= 30 ? 'text-primary' : a.responseTimeAvgMin <= 60 ? 'text-yellow-400' : 'text-destructive'}>
                              {a.responseTimeAvgMin}m
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-foreground">{a.conversionRate}%</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{fmt(a.revenueGenerated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Daily Checklist */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Sales Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 transition-colors rounded px-2"
                    onClick={() => toggle(item.id)}
                  >
                    <Checkbox checked={checked.has(item.id)} />
                    <span className={`text-xs flex-1 ${checked.has(item.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                    <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    {checked.size}/{checklist.length} completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
