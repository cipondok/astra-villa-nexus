import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Route, Users, BarChart3, Clock, Star, Zap, Shield,
  AlertTriangle, ArrowUpRight, MapPin, DollarSign, Activity,
  RefreshCw, ChevronRight, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVendorServiceRequests, useVendorPerformanceMetrics } from '@/hooks/useVendorJobRouting';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const WEIGHTS = [
  { label: 'Customer Rating', weight: 30, icon: Star, color: 'hsl(var(--chart-1))' },
  { label: 'Job Completion Rate', weight: 25, icon: BarChart3, color: 'hsl(var(--chart-2))' },
  { label: 'Response Time', weight: 20, icon: Clock, color: 'hsl(var(--chart-3))' },
  { label: 'Price Competitiveness', weight: 10, icon: DollarSign, color: 'hsl(var(--chart-4))' },
  { label: 'Geographic Proximity', weight: 10, icon: MapPin, color: 'hsl(var(--chart-5))' },
  { label: 'Workload Capacity', weight: 5, icon: Activity, color: 'hsl(var(--chart-1))' },
];

const ESCALATION_RULES = [
  { trigger: 'No vendor response in 2 hours', action: 'Auto-offer to next ranked vendor', severity: 'warning' },
  { trigger: 'All top 5 vendors decline', action: 'Activate backup list + notify admin', severity: 'warning' },
  { trigger: 'No response in 6 hours', action: 'Escalate to operations manager', severity: 'critical' },
  { trigger: 'SLA deadline approaching (< 4h remaining)', action: 'Emergency assignment with bonus incentive', severity: 'critical' },
  { trigger: 'Vendor cancels after acceptance', action: 'Auto-reassign + flag vendor for review', severity: 'critical' },
];

const ROLLOUT_PHASES = [
  { phase: 'Phase 1 — Manual + Score', weeks: '1-2', items: ['Deploy scoring algorithm', 'Admin reviews ranked list before assignment', 'Collect accuracy feedback from ops team', 'Calibrate weights based on real outcomes'] },
  { phase: 'Phase 2 — Semi-Auto', weeks: '3-4', items: ['Auto-assign for low-value jobs (< Rp 5M)', 'Admin approval still required for high-value', 'Activate SLA monitoring and escalation alerts', 'Begin tracking vendor response patterns'] },
  { phase: 'Phase 3 — Full Automation', weeks: '5-8', items: ['Auto-assign for all categories', 'Escalation engine runs autonomously', 'Performance-based weight recalibration (monthly)', 'Admin override available as safety net'] },
  { phase: 'Phase 4 — Intelligence Loop', weeks: '9-12', items: ['ML-driven weight optimization from outcomes', 'Predictive capacity planning per vendor', 'Dynamic pricing suggestions based on demand', 'Cross-category vendor development recommendations'] },
];

const CATEGORIES = ['renovation', 'interior', 'cleaning', 'legal', 'furnishing'];

export default function VendorJobRoutingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: requests = [], isLoading: loadingRequests } = useVendorServiceRequests();
  const { data: metrics = [], isLoading: loadingMetrics } = useVendorPerformanceMetrics(selectedCategory);

  const statusCounts = requests.reduce((acc: Record<string, number>, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Route className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vendor Job Routing Engine</h1>
              <p className="text-sm text-muted-foreground">Intelligent service allocation based on 6 weighted performance signals</p>
            </div>
          </div>
        </motion.div>

        {/* Status Summary */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => (
            <Card key={s} className={statusCounts[s] ? 'border-primary/30' : ''}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground capitalize">{s.replace('_', ' ')}</p>
                <p className="text-2xl font-black tabular-nums text-foreground">{statusCounts[s] || 0}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="algorithm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="metrics">Vendor Metrics</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="rollout">Rollout</TabsTrigger>
          </TabsList>

          {/* ── Algorithm ── */}
          <TabsContent value="algorithm" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" />Routing Score Formula</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-1">
                  <p className="text-foreground font-semibold">Score = Σ (normalised(Signalᵢ) × Weightᵢ)</p>
                  <p className="text-muted-foreground text-xs">Range: 0–100 | Higher = better vendor match</p>
                </div>
                {WEIGHTS.map((w, i) => (
                  <motion.div key={w.label} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border">
                    <div className="p-1.5 rounded-lg" style={{ background: `${w.color}20` }}>
                      <w.icon className="h-4 w-4" style={{ color: w.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{w.label}</span>
                    <Progress value={w.weight} className="w-24 h-2" />
                    <span className="text-sm font-bold tabular-nums w-10 text-right">{w.weight}%</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Normalisation Rules</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { var: 'Rating', rule: '0–5 stars → linear 0–100' },
                    { var: 'Completion Rate', rule: 'Already 0–100%, pass-through' },
                    { var: 'Response Time', rule: 'Inverse: 0 min = 100, 180+ min = 0' },
                    { var: 'Price Score', rule: 'Already 0–100, pass-through' },
                    { var: 'Proximity', rule: 'Inverse haversine: 0 km = 100, service_radius km = 0' },
                    { var: 'Capacity', rule: 'Inverse utilization: 0% used = 100, 100% used = 0' },
                  ].map(r => (
                    <div key={r.var} className="flex items-start gap-3 p-2 rounded-lg bg-muted/40">
                      <span className="text-foreground font-medium w-32 shrink-0">{r.var}</span>
                      <span className="text-muted-foreground">{r.rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Pipeline ── */}
          <TabsContent value="pipeline" className="space-y-4">
            {loadingRequests ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Loading requests...</CardContent></Card>
            ) : requests.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No service requests yet. Jobs will appear here when created.</CardContent></Card>
            ) : (
              requests.slice(0, 20).map((req: any, i: number) => (
                <motion.div key={req.id} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.04 }}>
                  <Card className="border-l-4" style={{ borderLeftColor: req.status === 'completed' ? 'hsl(var(--chart-2))' : req.status === 'assigned' ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground))' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{req.category}</Badge>
                            <Badge variant={req.urgency === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">{req.urgency}</Badge>
                            {req.district && <span className="text-[10px] text-muted-foreground">{req.district}</span>}
                          </div>
                        </div>
                        <Badge variant={req.status === 'completed' ? 'default' : 'outline'} className="capitalize shrink-0">{req.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* ── Vendor Metrics ── */}
          <TabsContent value="metrics" className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={!selectedCategory ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(undefined)}>All</Badge>
              {CATEGORIES.map(c => (
                <Badge key={c} variant={selectedCategory === c ? 'default' : 'outline'} className="cursor-pointer capitalize" onClick={() => setSelectedCategory(c)}>{c}</Badge>
              ))}
            </div>

            {loadingMetrics ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Loading metrics...</CardContent></Card>
            ) : metrics.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No vendor metrics available yet. Metrics populate as vendors complete jobs.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.slice(0, 20).map((m: any, i: number) => (
                  <motion.div key={m.id} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.04 }}>
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize text-[10px]">{m.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-bold tabular-nums">{Number(m.avg_rating).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-[10px] text-muted-foreground">Completion</p><p className="text-sm font-bold tabular-nums">{Number(m.completion_rate).toFixed(0)}%</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Resp. Time</p><p className="text-sm font-bold tabular-nums">{Number(m.avg_response_minutes).toFixed(0)}m</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Active Jobs</p><p className="text-sm font-bold tabular-nums">{m.current_active_jobs}/{m.max_concurrent_jobs}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Price Score</span>
                          <Progress value={Number(m.price_competitiveness_score)} className="flex-1 h-1.5" />
                          <span className="text-[10px] font-bold tabular-nums">{Number(m.price_competitiveness_score).toFixed(0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Escalation ── */}
          <TabsContent value="escalation" className="space-y-4">
            {ESCALATION_RULES.map((esc, i) => (
              <motion.div key={esc.trigger} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card className={`border-l-4 ${esc.severity === 'critical' ? 'border-l-destructive' : 'border-l-yellow-500'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${esc.severity === 'critical' ? 'text-destructive' : 'text-yellow-500'}`} />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-semibold text-foreground">{esc.trigger}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" />{esc.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="bg-muted/30">
              <CardContent className="p-5 space-y-2">
                <p className="text-sm font-medium text-foreground">Routing Flow</p>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {['Request Created', 'Score Vendors', 'Rank Top 5', 'Offer Jobs', 'Wait for Response', 'Auto-Escalate if Timeout', 'Assign & Confirm'].map((s, i, arr) => (
                    <React.Fragment key={s}>
                      <Badge variant="outline">{s}</Badge>
                      {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Rollout ── */}
          <TabsContent value="rollout" className="space-y-5">
            {ROLLOUT_PHASES.map((phase, i) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{phase.phase}</span>
                      <Badge variant="secondary" className="text-xs">Weeks {phase.weeks}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phase.items.map(item => (
                        <div key={item} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/40">
                          <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
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
