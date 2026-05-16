import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useListingDemandForecast } from '@/hooks/useListingDemandForecast';
import {
  Activity, BarChart3, ArrowRight, Target, Zap, CalendarDays,
  TrendingUp, Shield, Gauge, Sun, CloudRain, Flame, Snowflake,
} from 'lucide-react';

const tierColors: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const demandIcons: Record<string, React.ReactNode> = {
  peak: <Flame className="w-3.5 h-3.5 text-red-400" />,
  high: <Sun className="w-3.5 h-3.5 text-amber-400" />,
  moderate: <CloudRain className="w-3.5 h-3.5 text-blue-400" />,
  low: <Snowflake className="w-3.5 h-3.5 text-cyan-400" />,
};

const demandColors: Record<string, string> = {
  peak: 'bg-red-500/15 text-red-400',
  high: 'bg-amber-500/15 text-amber-400',
  moderate: 'bg-blue-500/15 text-blue-400',
  low: 'bg-cyan-500/15 text-cyan-400',
};

export default function ListingDemandForecastPage() {
  const { variables, outputs, tiers, seasonalPatterns, accuracyRoadmap, deployment, totalWeight } = useListingDemandForecast();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Listing Demand Forecasting Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Predictive demand scoring, time-to-sell estimation & pricing optimization</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Tier Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiers.map(tier => (
            <Card key={tier.label} className="border-border bg-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge className={`text-[9px] border ${tierColors[tier.color]}`}>{tier.label}</Badge>
                  <span className="text-[10px] text-muted-foreground">{tier.score}</span>
                </div>
                <p className="text-xs font-bold text-foreground">{tier.timeToSell}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tier.pricingAction}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="model" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="model" className="text-xs">Forecast Model</TabsTrigger>
            <TabsTrigger value="outputs" className="text-xs">Output Insights</TabsTrigger>
            <TabsTrigger value="tiers" className="text-xs">Tier Details</TabsTrigger>
            <TabsTrigger value="seasonal" className="text-xs">Seasonal Cycles</TabsTrigger>
            <TabsTrigger value="accuracy" className="text-xs">Accuracy Roadmap</TabsTrigger>
            <TabsTrigger value="deployment" className="text-xs">Deployment</TabsTrigger>
          </TabsList>

          {/* Forecast Model Variables */}
          <TabsContent value="model" className="space-y-3">
            {variables.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{v.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-[9px] bg-primary/15 text-primary">Weight: {v.weight}%</Badge>
                        <Badge variant="outline" className="text-[9px]">{v.updateFrequency}</Badge>
                      </div>
                    </div>
                    <Progress value={(v.weight / 25) * 100} className="h-1.5 mb-2" />
                    <p className="text-[11px] text-foreground mb-2">{v.description}</p>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground">Source: </span>
                      <span className="text-[10px] text-primary font-mono">{v.source}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="border-border bg-card">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Total Weight Validation</span>
                <Badge className={`text-xs ${totalWeight === 100 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {totalWeight}% {totalWeight === 100 ? '✓ Valid' : '✗ Invalid'}
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Output Insights */}
          <TabsContent value="outputs" className="space-y-3">
            {outputs.map((out, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{out.metric}</span>
                    </div>
                    <p className="text-[11px] text-foreground mb-3">{out.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-0.5">Output Format</span>
                        <p className="text-[11px] text-foreground">{out.format}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-primary/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Action Trigger</span>
                        </div>
                        <p className="text-[11px] text-primary">{out.actionTrigger}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Tier Details */}
          <TabsContent value="tiers" className="space-y-3">
            {tiers.map((tier, i) => (
              <motion.div key={tier.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border ${tierColors[tier.color]}`}>{tier.label}</Badge>
                        <span className="text-sm font-bold text-foreground">Score {tier.score}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{tier.timeToSell}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Target className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pricing Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{tier.pricingAction}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Marketing Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{tier.marketingAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Seasonal Cycles */}
          <TabsContent value="seasonal" className="space-y-3">
            {seasonalPatterns.map((sp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{sp.period}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {demandIcons[sp.demandLevel]}
                        <Badge className={`text-[9px] ${demandColors[sp.demandLevel]}`}>{sp.demandLevel}</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-foreground mb-2">{sp.driver}</p>
                    <div className="rounded border border-border bg-primary/5 p-2">
                      <span className="text-[10px] text-muted-foreground">Pricing Guidance: </span>
                      <span className="text-[11px] text-primary font-medium">{sp.pricingGuidance}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Accuracy Roadmap */}
          <TabsContent value="accuracy" className="space-y-3">
            {accuracyRoadmap.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                          <Badge className="text-[9px] bg-primary/15 text-primary">{phase.targetAccuracy}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.initiatives.map((init, ii) => (
                        <div key={ii} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{init}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Data Requirement</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.dataRequirement}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deployment" className="space-y-3">
            {deployment.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.deliverables.map((d, di) => (
                        <div key={di} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Success Metric</span>
                      </div>
                      <p className="text-[11px] text-foreground">{phase.successMetric}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
