import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Award, Clock, Eye, Handshake, Star, TrendingUp, Users,
  CheckCircle2, AlertTriangle, BarChart3, Shield, Zap,
  Target, Crown, ArrowUpRight, Activity, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateAgentEffectiveness,
  type AgentEffectivenessInput,
  type AgentEffectivenessResult,
} from '@/lib/agentEffectivenessScoring';

/* ═══════════════════════════════════════════
   DEFAULTS
   ═══════════════════════════════════════════ */

const DEFAULTS: AgentEffectivenessInput = {
  avgResponseTimeMinutes: 45,
  totalListingViews: 1200,
  totalInquiries: 60,
  dealsClosedCount: 8,
  totalLeads: 60,
  avgInvestorRating: 4.2,
  totalRatings: 15,
  listingCount: 12,
  lastActiveWithinDays: 3,
};

/* ═══════════════════════════════════════════
   FACTOR META
   ═══════════════════════════════════════════ */

const FACTOR_META = {
  responseSpeed: { label: 'Response Speed', icon: Clock, color: 'text-chart-4', bgColor: 'bg-chart-4/10', barColor: 'bg-chart-4' },
  engagement: { label: 'Listing Engagement', icon: Eye, color: 'text-primary', bgColor: 'bg-primary/10', barColor: 'bg-primary' },
  closureRate: { label: 'Deal Closure', icon: Handshake, color: 'text-chart-2', bgColor: 'bg-chart-2/10', barColor: 'bg-chart-2' },
  investorFeedback: { label: 'Investor Rating', icon: Star, color: 'text-chart-1', bgColor: 'bg-chart-1/10', barColor: 'bg-chart-1' },
} as const;

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function AgentEffectivenessPage() {
  const [inputs, setInputs] = useState<AgentEffectivenessInput>(DEFAULTS);
  const [activeTab, setActiveTab] = useState('simulator');

  const update = <K extends keyof AgentEffectivenessInput>(key: K, value: AgentEffectivenessInput[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const result = useMemo(() => calculateAgentEffectiveness(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                Agent Effectiveness Score
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Measure agent contribution quality with weighted performance factors</p>
            </div>
            <Badge variant="outline" className={cn('text-xs px-3 py-1.5', result.tierColor)}>
              <Award className="h-3 w-3 mr-1.5" />{result.tier}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="simulator">Score Simulator</TabsTrigger>
            <TabsTrigger value="framework">Scoring Framework</TabsTrigger>
            <TabsTrigger value="admin">Admin Playbook</TabsTrigger>
          </TabsList>

          {/* ═══ SIMULATOR ═══ */}
          <TabsContent value="simulator">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Agent Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <SliderInput label="Avg Response Time" value={inputs.avgResponseTimeMinutes} min={1} max={480} step={5}
                      format={v => `${v} min`} icon={Clock} onChange={v => update('avgResponseTimeMinutes', v)} />
                    <SliderInput label="Total Listing Views" value={inputs.totalListingViews} min={0} max={10000} step={50}
                      format={v => v.toLocaleString()} icon={Eye} onChange={v => update('totalListingViews', v)} />
                    <SliderInput label="Total Inquiries" value={inputs.totalInquiries} min={0} max={500} step={1}
                      format={v => `${v}`} icon={Users} onChange={v => update('totalInquiries', v)} />
                    <SliderInput label="Deals Closed" value={inputs.dealsClosedCount} min={0} max={100} step={1}
                      format={v => `${v}`} icon={Handshake} onChange={v => update('dealsClosedCount', v)} />
                    <SliderInput label="Total Leads" value={inputs.totalLeads} min={1} max={500} step={1}
                      format={v => `${v}`} icon={Target} onChange={v => update('totalLeads', v)} />
                    <SliderInput label="Investor Rating" value={inputs.avgInvestorRating} min={0} max={5} step={0.1}
                      format={v => `${v.toFixed(1)}/5.0`} icon={Star} onChange={v => update('avgInvestorRating', v)} />
                    <SliderInput label="Total Ratings" value={inputs.totalRatings} min={0} max={100} step={1}
                      format={v => `${v}`} icon={BarChart3} onChange={v => update('totalRatings', v)} />
                    <SliderInput label="Active Listings" value={inputs.listingCount} min={0} max={100} step={1}
                      format={v => `${v}`} icon={TrendingUp} onChange={v => update('listingCount', v)} />
                    <SliderInput label="Days Since Active" value={inputs.lastActiveWithinDays} min={0} max={60} step={1}
                      format={v => `${v}d`} icon={Zap} onChange={v => update('lastActiveWithinDays', v)} />
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-3 space-y-4">
                {/* Score Badge */}
                <Card className="border border-border bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" opacity={0.2} />
                          <motion.circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke={result.totalScore >= 75 ? 'hsl(var(--chart-2))' : result.totalScore >= 45 ? 'hsl(var(--primary))' : 'hsl(var(--chart-1))'}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.totalScore / 100) }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span key={result.totalScore} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl font-black text-foreground">
                            {result.totalScore}
                          </motion.span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Badge className={cn('text-xs mb-1', result.totalScore >= 75 ? 'bg-chart-2/15 text-chart-2 border-chart-2/20' : result.totalScore >= 45 ? 'bg-primary/15 text-primary border-primary/20' : 'bg-chart-1/15 text-chart-1 border-chart-1/20')} variant="outline">
                          <Crown className="h-3 w-3 mr-1" />{result.tier}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {result.totalScore >= 75
                            ? 'Top-tier agent — prioritize for featured placement and developer partnerships'
                            : result.totalScore >= 45
                            ? 'Solid contributor — targeted support can push them to Elite tier'
                            : 'Needs attention — offer training, reduce lead allocation until metrics improve'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Factor Breakdown */}
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Factor Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.entries(result.factors) as [keyof typeof FACTOR_META, typeof result.factors[keyof typeof result.factors]][]).map(([key, factor]) => {
                      const meta = FACTOR_META[key];
                      const FIcon = meta.icon;
                      return (
                        <div key={key} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', meta.bgColor)}>
                              <FIcon className={cn('h-3 w-3', meta.color)} />
                            </div>
                            <p className="text-[10px] font-bold text-foreground flex-1">{meta.label}</p>
                            <Badge variant="outline" className="text-[7px]">{factor.weight}% weight</Badge>
                            <span className="text-xs font-black text-foreground">{factor.score}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden mb-1.5">
                            <motion.div
                              className={cn('h-full rounded-full', meta.barColor)}
                              initial={{ width: 0 }}
                              animate={{ width: `${factor.score}%` }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-[9px] text-muted-foreground">{factor.detail}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.strengths.length > 0 && (
                    <Card className="border border-chart-2/15 bg-chart-2/3">
                      <CardContent className="p-3 space-y-1.5">
                        <p className="text-[9px] font-bold text-chart-2 uppercase tracking-wider">Strengths</p>
                        {result.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-chart-2 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-foreground">{s}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {result.improvements.length > 0 && (
                    <Card className="border border-chart-1/15 bg-chart-1/3">
                      <CardContent className="p-3 space-y-1.5">
                        <p className="text-[9px] font-bold text-chart-1 uppercase tracking-wider">Improvements</p>
                        {result.improvements.map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-chart-1 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-foreground">{s}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ FRAMEWORK ═══ */}
          <TabsContent value="framework" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weight Model</CardTitle>
                <p className="text-[10px] text-muted-foreground">Weights optimized for investor satisfaction → platform growth alignment</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { factor: 'Response Speed', weight: 30, reason: 'Fastest trust signal — investors judge platforms by how quickly agents reply. Sub-30-minute responses convert 3x better.', thresholds: '≤15 min = 100 · ≤30 min = 90 · ≤60 min = 75 · ≤120 min = 50 · ≤240 min = 30 · >240 min = 10' },
                    { factor: 'Deal Closure Rate', weight: 30, reason: 'Direct revenue impact — agents who close deals prove the platform delivers results, not just traffic.', thresholds: '≥20% = 100 · ≥15% = 85 · ≥10% = 70 · ≥5% = 50 · >0% = 30 · 0% = 5' },
                    { factor: 'Listing Engagement', weight: 20, reason: 'Content quality proxy — high views/listing and inquiry rates indicate agents create compelling, accurate listings.', thresholds: '≥100 views/listing + ≥5% inquiry = 100 · ≥50 + ≥3% = 80 · ≥20 + ≥1.5% = 60 · ≥10 = 40 · <10 = 20' },
                    { factor: 'Investor Feedback', weight: 20, reason: 'Satisfaction guard — ratings prevent high-volume low-quality agents from gaming the system.', thresholds: 'Rating mapped linearly (4.5/5 = 90). No ratings = 40 (neutral). Volume bonus +5 for ≥10 reviews.' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-[8px]">{item.weight}%</Badge>
                        <p className="text-xs font-bold text-foreground">{item.factor}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2">{item.reason}</p>
                      <div className="p-2 rounded bg-muted/10 border border-border/20">
                        <p className="text-[9px] text-foreground font-mono">{item.thresholds}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tier Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { tier: 'Elite Partner', range: '75–100', color: 'text-chart-2', bgColor: 'bg-chart-2/10', desc: 'Featured placement, developer partnership invitations, priority lead distribution' },
                    { tier: 'Active Contributor', range: '45–74', color: 'text-primary', bgColor: 'bg-primary/10', desc: 'Standard lead allocation, targeted coaching to reach Elite, monthly performance reports' },
                    { tier: 'Needs Improvement', range: '0–44', color: 'text-chart-1', bgColor: 'bg-chart-1/10', desc: 'Reduced lead allocation, mandatory check-in call, listing optimization assistance' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                      <Badge variant="outline" className={cn('text-[8px] w-16 justify-center', t.color)}>{t.range}</Badge>
                      <div className="flex-1">
                        <p className={cn('text-xs font-bold', t.color)}>{t.tier}</p>
                        <p className="text-[9px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Activity Penalty</p>
                    <p className="text-[11px] text-muted-foreground">
                      Agents inactive for 14+ days are capped at score 60 regardless of historical performance. This prevents dormant agents from occupying Elite slots while ensuring they can recover quickly by re-engaging.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ADMIN ═══ */}
          <TabsContent value="admin" className="space-y-4">
            {[
              {
                title: 'Featured Placement Priority',
                icon: Crown,
                color: 'text-chart-2',
                bgColor: 'bg-chart-2/10',
                actions: [
                  'Auto-assign homepage Featured carousel slots to Elite Partner agents',
                  'Weight search result ranking by effectiveness score — Elite listings appear 2x higher',
                  'Include Elite agents in developer project launch invitations',
                  'Display tier badge on agent profile visible to investors',
                ],
              },
              {
                title: 'Training & Support Triggers',
                icon: Target,
                color: 'text-chart-1',
                bgColor: 'bg-chart-1/10',
                actions: [
                  'Auto-flag "Needs Improvement" agents for weekly check-in calls',
                  'Send automated listing optimization tips when engagement score < 40',
                  'Offer response time coaching when speed score < 50 — share best-practice templates',
                  'Pair low-scoring agents with Elite mentors for 30-day improvement sprints',
                ],
              },
              {
                title: 'Lead Allocation Rules',
                icon: Users,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
                actions: [
                  'Elite Partners: receive 3x lead share — they convert, so feed them more',
                  'Active Contributors: standard allocation with "prove-up" bonus for improving metrics',
                  'Needs Improvement: reduced to 0.5x until score rises above 45',
                  'New agents (< 30 days): protected allocation of minimum 5 leads for fair evaluation period',
                ],
              },
            ].map((section, i) => {
              const SIcon = section.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.bgColor)}>
                          <SIcon className={cn('h-4 w-4', section.color)} />
                        </div>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1.5">
                      {section.actions.map((action, j) => (
                        <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                          <ArrowUpRight className={cn('h-3 w-3 flex-shrink-0 mt-0.5', section.color)} />
                          <p className="text-[10px] text-foreground">{action}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SLIDER INPUT SUB-COMPONENT
   ═══════════════════════════════════════════ */

function SliderInput({
  label, value, min, max, step, format, icon: Icon, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; icon: typeof Clock; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground">{label}</Label>
        </div>
        <motion.span key={value} initial={{ scale: 1.1, color: 'hsl(var(--primary))' }} animate={{ scale: 1, color: 'hsl(var(--foreground))' }} transition={{ duration: 0.2 }} className="text-xs font-bold">
          {format(value)}
        </motion.span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="cursor-pointer" />
    </div>
  );
}
