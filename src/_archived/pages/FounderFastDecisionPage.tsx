import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFounderFastDecision } from '@/hooks/useFounderFastDecision';
import {
  Zap, Target, Shield, ArrowRight, CheckCircle2, Clock,
  AlertTriangle, BarChart3, Brain, Gauge, Crosshair,
} from 'lucide-react';

const tierColors: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function FounderFastDecisionPage() {
  const { criteria, tiers, riskProfiles, dailyRitual, checklists, clarityRoadmap, totalWeight } = useFounderFastDecision();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Founder Fast Decision Framework
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Structured rapid decision-making for high-impact execution</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Tier Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiers.map(tier => (
            <Card key={tier.label} className="border-border bg-card">
              <CardContent className="p-3">
                <Badge className={`text-[9px] border ${tierColors[tier.color]} mb-1`}>{tier.label}</Badge>
                <p className="text-xs font-bold text-foreground">{tier.score}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tier.timeframe}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="scoring" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="scoring" className="text-xs">Scoring Matrix</TabsTrigger>
            <TabsTrigger value="tiers" className="text-xs">Decision Tiers</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">Risk vs Reward</TabsTrigger>
            <TabsTrigger value="ritual" className="text-xs">Daily Ritual</TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">Checklists</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs">Clarity Roadmap</TabsTrigger>
          </TabsList>

          {/* Scoring Matrix */}
          <TabsContent value="scoring" className="space-y-3">
            {criteria.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{c.name}</span>
                      </div>
                      <Badge className="text-[9px] bg-primary/15 text-primary">Weight: {c.weight}%</Badge>
                    </div>
                    <Progress value={(c.weight / 30) * 100} className="h-1.5 mb-2" />
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Key Question</span>
                      <p className="text-[11px] text-primary font-medium mt-0.5">{c.question}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {(['low', 'mid', 'high'] as const).map(level => (
                        <div key={level} className="rounded border border-border bg-muted/10 p-2">
                          <Badge variant="outline" className="text-[9px] mb-1 capitalize">{level === 'mid' ? 'Medium' : level}</Badge>
                          <p className="text-[10px] text-foreground">{c.scoringGuide[level]}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Card className="border-border bg-card">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Total Weight Validation</span>
                <Badge className={`text-xs ${totalWeight === 100 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {totalWeight}%
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision Tiers */}
          <TabsContent value="tiers" className="space-y-3">
            {tiers.map((tier, i) => (
              <motion.div key={tier.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`text-xs border ${tierColors[tier.color]}`}>{tier.label}</Badge>
                      <span className="text-sm font-bold text-foreground">Score {tier.score}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Crosshair className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Action</span>
                        </div>
                        <p className="text-[11px] text-foreground">{tier.action}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Timeframe</span>
                        </div>
                        <p className="text-[11px] text-foreground">{tier.timeframe}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Brain className="w-3 h-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Founder Role</span>
                        </div>
                        <p className="text-[11px] text-foreground">{tier.founderInvolvement}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Risk vs Reward */}
          <TabsContent value="risk" className="space-y-3">
            {riskProfiles.map((rp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-foreground">{rp.archetype}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <div className="rounded border border-border bg-red-500/5 p-2">
                        <span className="text-[10px] text-muted-foreground block">Risk Level</span>
                        <span className="text-[11px] text-foreground">{rp.riskLevel}</span>
                      </div>
                      <div className="rounded border border-border bg-emerald-500/5 p-2">
                        <span className="text-[10px] text-muted-foreground block">Reward Potential</span>
                        <span className="text-[11px] text-foreground">{rp.rewardPotential}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Decision Protocol</span>
                      <p className="text-[11px] text-primary font-medium mt-0.5">{rp.decision}</p>
                    </div>
                    <div className="rounded border border-border bg-muted/10 p-2">
                      <span className="text-[10px] text-muted-foreground">Example: </span>
                      <span className="text-[10px] text-foreground italic">{rp.example}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Daily Ritual */}
          <TabsContent value="ritual" className="space-y-3">
            {dailyRitual.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className="w-14 text-center shrink-0">
                      <span className="text-xs font-bold text-primary">{r.time}</span>
                      <p className="text-[9px] text-muted-foreground">{r.duration}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-foreground">{r.activity}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.output}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Checklists */}
          <TabsContent value="checklist" className="space-y-3">
            {checklists.map((cl, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{cl.phase}</span>
                    </div>
                    <div className="space-y-2">
                      {cl.items.map((item, ii) => (
                        <div key={ii} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Clarity Roadmap */}
          <TabsContent value="roadmap" className="space-y-3">
            {clarityRoadmap.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{phase.phase}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{phase.title}</p>
                        <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-2.5 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Focus</span>
                      <p className="text-[11px] text-foreground mt-0.5">{phase.focus}</p>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {phase.practices.map((p, pi) => (
                        <div key={pi} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[11px] text-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Shield className="w-3 h-3 text-primary" />
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
