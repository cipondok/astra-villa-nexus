import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, ChevronRight, Zap, Star, Crown, Shield,
  TrendingUp, Clock, Eye, Users, Award, Flame, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { scoreAgent, AgentMetricsInput, AgentScoreOutput, AgentTier } from '@/lib/agentPerformance';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const TIER_CONFIG: Record<AgentTier, { color: string; icon: React.ElementType; label: string }> = {
  BRONZE: { color: 'hsl(30 60% 50%)', icon: Shield, label: 'Bronze' },
  SILVER: { color: 'hsl(210 10% 60%)', icon: Shield, label: 'Silver' },
  GOLD: { color: 'hsl(45 90% 50%)', icon: Medal, label: 'Gold' },
  PLATINUM: { color: 'hsl(210 30% 70%)', icon: Crown, label: 'Platinum' },
  DIAMOND: { color: 'hsl(200 80% 60%)', icon: Crown, label: 'Diamond' },
};

const SIGNAL_LABELS: Record<string, string> = {
  response_speed: 'Response Speed',
  viewing_conversion: 'Viewing Conversion',
  deals_closed: 'Deals Closed',
  customer_satisfaction: 'Customer Satisfaction',
  listing_quality: 'Listing Quality',
};

const SAMPLE_AGENTS: (AgentMetricsInput & { name: string; region: string })[] = [
  { name: 'Rina Maharani', region: 'Jakarta Selatan', avg_response_minutes: 4, viewings_booked: 18, viewings_from_leads: 22, deals_closed_period: 7, deals_target: 5, avg_rating: 4.9, total_reviews: 24, listings_optimized: 15, total_listings: 16, active_streak_days: 42, career_deals: 67 },
  { name: 'Bayu Pratama', region: 'Bandung', avg_response_minutes: 12, viewings_booked: 10, viewings_from_leads: 18, deals_closed_period: 4, deals_target: 5, avg_rating: 4.6, total_reviews: 15, listings_optimized: 8, total_listings: 12, active_streak_days: 18, career_deals: 31 },
  { name: 'Sari Dewi', region: 'Surabaya', avg_response_minutes: 22, viewings_booked: 8, viewings_from_leads: 15, deals_closed_period: 3, deals_target: 5, avg_rating: 4.3, total_reviews: 9, listings_optimized: 5, total_listings: 10, active_streak_days: 7, career_deals: 14 },
  { name: 'Adi Nugroho', region: 'Bali', avg_response_minutes: 45, viewings_booked: 5, viewings_from_leads: 14, deals_closed_period: 2, deals_target: 5, avg_rating: 3.8, total_reviews: 6, listings_optimized: 3, total_listings: 9, active_streak_days: 3, career_deals: 8 },
  { name: 'Mega Putri', region: 'Tangerang', avg_response_minutes: 8, viewings_booked: 14, viewings_from_leads: 20, deals_closed_period: 6, deals_target: 5, avg_rating: 4.8, total_reviews: 18, listings_optimized: 12, total_listings: 14, active_streak_days: 28, career_deals: 44 },
];

const ROADMAP = [
  { phase: 'Phase 1 — Score Engine', weeks: '1-2', items: ['Deploy scoring model sebagai client-side utility', 'Tampilkan performance score di agent dashboard', 'Badge system dan milestone notifications'] },
  { phase: 'Phase 2 — Leaderboard', weeks: '3-4', items: ['Weekly dan monthly ranking boards', 'District-level dan national-level competition', 'Real-time position update dengan push notification'] },
  { phase: 'Phase 3 — Rewards Integration', weeks: '5-7', items: ['Auto-trigger bonus commission berdasarkan score threshold', 'Premium lead allocation untuk top-tier agents', 'Exclusive feature access untuk PLATINUM dan DIAMOND'] },
  { phase: 'Phase 4 — Retention Loop', weeks: '8-10', items: ['Streak protection mechanics (miss 1 day = warning, not reset)', 'Seasonal competitions dengan prize pools', 'Team-based challenges untuk collaborative engagement'] },
];

export default function AgentLeaderboardPage() {
  const [input, setInput] = useState<AgentMetricsInput>({
    avg_response_minutes: 15, viewings_booked: 10, viewings_from_leads: 18,
    deals_closed_period: 4, deals_target: 5, avg_rating: 4.5, total_reviews: 12,
    listings_optimized: 8, total_listings: 12, active_streak_days: 14, career_deals: 20,
  });

  const result = useMemo(() => scoreAgent(input), [input]);
  const set = (key: keyof AgentMetricsInput, val: number) => setInput(p => ({ ...p, [key]: val }));

  const leaderboard = useMemo(() =>
    SAMPLE_AGENTS.map(a => {
      const { name, region, ...metrics } = a;
      return { name, region, ...scoreAgent(metrics) };
    }).sort((a, b) => b.performance_score - a.performance_score),
  []);

  const radarData = Object.entries(result.signal_breakdown).map(([k, v]) => ({
    metric: SIGNAL_LABELS[k] ?? k, value: v, fullMark: 100,
  }));

  const tierCfg = TIER_CONFIG[result.tier];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div variants={FADE} initial="hidden" animate="show" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Trophy className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Performance Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Gamification engine for agent productivity & loyalty</p>
          </div>
        </motion.div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          {/* ── Leaderboard ── */}
          <TabsContent value="leaderboard" className="space-y-5">
            <div className="space-y-3">
              {leaderboard.map((agent, idx) => {
                const tc = TIER_CONFIG[agent.tier];
                const TierIcon = tc.icon;
                return (
                  <motion.div key={agent.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: idx * 0.06 }}>
                    <Card className={`${idx === 0 ? 'border-2' : ''}`} style={idx === 0 ? { borderColor: tc.color } : {}}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" style={{ background: `${tc.color}20`, color: tc.color }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
                            <Badge variant="outline" className="text-[10px] shrink-0 gap-1" style={{ borderColor: tc.color, color: tc.color }}>
                              <TierIcon className="h-3 w-3" />{tc.label}
                            </Badge>
                            {agent.bonus_eligible && <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary border-0"><Gift className="h-3 w-3 mr-0.5" />Bonus</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{agent.region}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Badges</p>
                            <p className="text-sm font-semibold tabular-nums">{agent.badges.filter(b => b.earned).length}/{agent.badges.length}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-xl font-black tabular-nums" style={{ color: tc.color }}>{agent.performance_score}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Tier Legend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Tier Progression</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as AgentTier[]).map(t => {
                    const c = TIER_CONFIG[t];
                    const Icon = c.icon;
                    const range = t === 'BRONZE' ? '0-39' : t === 'SILVER' ? '40-59' : t === 'GOLD' ? '60-74' : t === 'PLATINUM' ? '75-89' : '90-100';
                    return (
                      <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
                        <Icon className="h-4 w-4" style={{ color: c.color }} />
                        <span className="text-sm font-medium" style={{ color: c.color }}>{c.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{range}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Simulator ── */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3"><CardTitle className="text-base">Agent Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Avg Response (min)', key: 'avg_response_minutes' as const, min: 1, max: 180 },
                    { label: 'Viewings Booked', key: 'viewings_booked' as const, min: 0, max: 30 },
                    { label: 'Leads Received', key: 'viewings_from_leads' as const, min: 1, max: 30 },
                    { label: 'Deals Closed', key: 'deals_closed_period' as const, min: 0, max: 15 },
                    { label: 'Deal Target', key: 'deals_target' as const, min: 1, max: 15 },
                    { label: 'Total Reviews', key: 'total_reviews' as const, min: 0, max: 50 },
                    { label: 'Listings Optimized', key: 'listings_optimized' as const, min: 0, max: 25 },
                    { label: 'Total Listings', key: 'total_listings' as const, min: 1, max: 25 },
                    { label: 'Streak Days', key: 'active_streak_days' as const, min: 0, max: 60 },
                    { label: 'Career Deals', key: 'career_deals' as const, min: 0, max: 100 },
                  ].map(s => (
                    <div key={s.key} className="space-y-1">
                      <div className="flex justify-between"><Label className="text-xs">{s.label}</Label><span className="text-xs font-medium tabular-nums text-primary">{input[s.key]}</span></div>
                      <Slider value={[input[s.key]]} onValueChange={v => set(s.key, v[0])} min={s.min} max={s.max} step={1} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <div className="flex justify-between"><Label className="text-xs">Avg Rating</Label><span className="text-xs font-medium tabular-nums text-primary">{input.avg_rating.toFixed(1)}</span></div>
                    <Slider value={[input.avg_rating * 10]} onValueChange={v => set('avg_rating', v[0] / 10)} min={10} max={50} step={1} />
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-5">
                {/* Score + Tier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-5 flex flex-col items-center justify-center">
                      <p className="text-4xl font-black tabular-nums" style={{ color: tierCfg.color }}>{result.performance_score}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <tierCfg.icon className="h-4 w-4" style={{ color: tierCfg.color }} />
                        <span className="text-sm font-semibold" style={{ color: tierCfg.color }}>{tierCfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Top {100 - result.rank_percentile}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground mb-2">Bonus Status</p>
                      {result.bonus_eligible ? (
                        <div className="space-y-1.5">
                          <Badge className="bg-primary/10 text-primary border-0"><Gift className="h-3 w-3 mr-1" />Eligible</Badge>
                          <p className="text-xs text-foreground">{result.bonus_reason}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Belum eligible — tingkatkan score ke 85+</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground mb-2">Earned Badges</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.badges.filter(b => b.earned).map(b => (
                          <span key={b.id} className="text-lg" title={b.name}>{b.icon}</span>
                        ))}
                        {result.badges.filter(b => b.earned).length === 0 && <p className="text-xs text-muted-foreground">Belum ada badge</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Radar Chart */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Performance Radar</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                {result.tips.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Improvement Tips</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {result.tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /><span className="text-foreground">{t}</span></div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Badges ── */}
          <TabsContent value="badges" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.badges.map((badge, i) => (
                <motion.div key={badge.id} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.04 }}>
                  <Card className={`h-full transition-colors ${badge.earned ? 'border-primary/30' : 'opacity-50'}`}>
                    <CardContent className="p-5 flex items-start gap-4">
                      <span className="text-3xl">{badge.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                        <Badge variant={badge.earned ? 'default' : 'outline'} className="mt-2 text-[10px]">
                          {badge.earned ? '✓ Earned' : 'Locked'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── Roadmap ── */}
          <TabsContent value="roadmap" className="space-y-5">
            {ROADMAP.map((phase, i) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">{phase.phase}<Badge variant="outline" className="text-xs">Weeks {phase.weeks}</Badge></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phase.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-sm"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground">{item}</span></div>
                    ))}
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
