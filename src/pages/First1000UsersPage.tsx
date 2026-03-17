import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Users, Target, Rocket, TrendingUp, Megaphone, Handshake,
  MessageSquare, Video, Linkedin, Gift, Trophy, Zap,
  ArrowRight, CheckCircle2, Clock, BarChart3, Star,
  UserPlus, Share2, Building2, ChevronRight, Activity,
  Globe, Mail, Phone, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENT_USERS = 127;
const TARGET_USERS = 1000;
const WEEKLY_ACTIVE_RATE = 31.2;

const MILESTONES = [
  { target: 50, label: 'Seed Community', reward: 'Founding Member Badge', reached: true },
  { target: 100, label: 'Early Adopters', reward: 'Priority AI Access', reached: true },
  { target: 250, label: 'Critical Mass', reward: 'Exclusive Deal Alerts', reached: false },
  { target: 500, label: 'Growth Phase', reward: 'Premium Tier Trial', reached: false },
  { target: 1000, label: 'PMF Validated', reward: 'Lifetime Benefits', reached: false },
];

const CHANNELS = [
  {
    id: 'direct',
    label: 'Direct Outreach',
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    users: 48,
    target: 300,
    tactics: [
      { action: 'LinkedIn investor group outreach', frequency: 'Daily', status: 'active', impact: 'high' },
      { action: 'Property forum direct messages', frequency: 'Daily', status: 'active', impact: 'high' },
      { action: 'Live AI investment demo sessions', frequency: 'Weekly', status: 'active', impact: 'medium' },
      { action: 'WhatsApp property investor groups', frequency: 'Daily', status: 'planned', impact: 'high' },
    ],
  },
  {
    id: 'content',
    label: 'Content Marketing',
    icon: Video,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    users: 35,
    target: 350,
    tactics: [
      { action: 'Short-form undervalued property insights', frequency: 'Daily', status: 'active', impact: 'high' },
      { action: 'City investment trend analysis threads', frequency: '3x/week', status: 'active', impact: 'medium' },
      { action: 'AI market prediction showcases', frequency: '2x/week', status: 'active', impact: 'high' },
      { action: 'Property ROI case study breakdowns', frequency: 'Weekly', status: 'planned', impact: 'medium' },
    ],
  },
  {
    id: 'partnership',
    label: 'Partnership Growth',
    icon: Handshake,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    users: 28,
    target: 200,
    tactics: [
      { action: 'Active property agent collaborations', frequency: 'Ongoing', status: 'active', impact: 'high' },
      { action: 'Developer project launch features', frequency: 'Per launch', status: 'active', impact: 'medium' },
      { action: 'Real estate event sponsorships', frequency: 'Monthly', status: 'planned', impact: 'medium' },
      { action: 'Property media cross-promotions', frequency: 'Bi-weekly', status: 'planned', impact: 'low' },
    ],
  },
  {
    id: 'referral',
    label: 'Referral Engine',
    icon: Share2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    users: 16,
    target: 150,
    tactics: [
      { action: 'Investor-to-investor referral bonus', frequency: 'Always on', status: 'active', impact: 'high' },
      { action: 'Agent referral commission program', frequency: 'Always on', status: 'active', impact: 'high' },
      { action: 'Tier-based milestone rewards', frequency: 'Automatic', status: 'active', impact: 'medium' },
      { action: 'Viral share challenge campaigns', frequency: 'Monthly', status: 'planned', impact: 'medium' },
    ],
  },
];

const INCENTIVES = [
  { icon: Zap, title: 'Early Opportunity Alerts', desc: 'Priority access to AI-detected undervalued properties before general release', tier: 'First 250 users' },
  { icon: Crown, title: 'Founding Investor Badge', desc: 'Permanent profile badge + elevated trust score for early platform contributors', tier: 'First 100 users' },
  { icon: Gift, title: 'Referral Reward Bonus', desc: '2x referral rewards for users who invite 3+ active investors during growth phase', tier: 'All users' },
  { icon: Star, title: 'Premium Tier Trial', desc: '90-day Platinum membership trial with full AI portfolio tools and deal flow access', tier: 'First 500 users' },
];

const WEEKLY_TARGETS = [
  { week: 'Week 1-2', target: 50, focus: 'Seed — Direct outreach to property investor circles', kpi: '10 demo sessions' },
  { week: 'Week 3-4', target: 100, focus: 'Validate — Content-driven + demo conversions', kpi: '25% activation rate' },
  { week: 'Week 5-8', target: 250, focus: 'Accelerate — Launch referral engine + agent partnerships', kpi: '30% WAU' },
  { week: 'Week 9-12', target: 500, focus: 'Scale — Content virality + developer launches', kpi: '3 partnerships live' },
  { week: 'Week 13-16', target: 1000, focus: 'PMF — Retention-driven growth + community flywheel', kpi: '30%+ WAU sustained' },
];

export default function First1000UsersPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const progressPct = Math.round((CURRENT_USERS / TARGET_USERS) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                First 1,000 Users Playbook
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Targeted acquisition strategy for high-intent property investors
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-2 py-1 border-chart-2/30 text-chart-2">
                <Activity className="h-3 w-3 mr-1" />
                {WEEKLY_ACTIVE_RATE}% WAU
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">{CURRENT_USERS}</p>
                <p className="text-[10px] text-muted-foreground">of {TARGET_USERS} target</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex flex-col items-center" style={{ width: `${100 / MILESTONES.length}%` }}>
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all',
                    m.reached
                      ? 'bg-chart-2 border-chart-2 text-chart-2-foreground'
                      : 'bg-background border-border text-muted-foreground'
                  )}>
                    {m.reached ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[8px] font-bold">{m.target}</span>}
                  </div>
                  <span className={cn(
                    'text-[8px] mt-1 font-medium text-center leading-tight',
                    m.reached ? 'text-chart-2' : 'text-muted-foreground'
                  )}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary via-chart-2 to-chart-4 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard icon={Users} label="Registered Users" value={CURRENT_USERS} sub={`${progressPct}% of target`} />
              <KPICard icon={Activity} label="Weekly Active %" value={`${WEEKLY_ACTIVE_RATE}%`} sub="Target: 25-30%" color="text-chart-2" />
              <KPICard icon={UserPlus} label="This Week" value="+18" sub="vs +12 last week" color="text-chart-4" />
              <KPICard icon={TrendingUp} label="Activation Rate" value="34%" sub="≥2 milestones hit" color="text-primary" />
            </div>

            {/* Channel Performance */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Acquisition Channel Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {CHANNELS.map((ch) => {
                  const ChIcon = ch.icon;
                  const pct = Math.round((ch.users / ch.target) * 100);
                  return (
                    <div key={ch.id} className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', ch.bgColor)}>
                        <ChIcon className={cn('h-4 w-4', ch.color)} />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <p className="text-xs font-semibold text-foreground">{ch.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ch.users}/{ch.target} users</p>
                      </div>
                      <div className="flex-1 h-6 bg-muted/20 rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(5, pct)}%` }}
                          transition={{ duration: 0.8 }}
                          className={cn('h-full rounded-lg opacity-20', ch.bgColor.replace('/10', '/40'))}
                          style={{ backgroundColor: `hsl(var(--${ch.color.replace('text-', '')}))` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-[10px] font-bold text-foreground">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Segment Focus */}
            <Card className="border border-primary/10 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Target Investor Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { segment: 'Active Property Investors', desc: 'Own 2+ investment properties, seeking next opportunity', size: '~40% of target', priority: 'Primary' },
                    { segment: 'First-Time Investors', desc: 'High-income professionals exploring property investment', size: '~35% of target', priority: 'Primary' },
                    { segment: 'Developer Partners', desc: 'Property developers seeking investor exposure for launches', size: '~25% of target', priority: 'Secondary' },
                  ].map((seg, i) => (
                    <div key={i} className="bg-muted/20 rounded-lg p-3 border border-border/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-foreground">{seg.segment}</p>
                        <Badge variant="outline" className={cn(
                          'text-[8px] px-1 py-0 h-3.5',
                          seg.priority === 'Primary' ? 'text-primary border-primary/30' : 'text-muted-foreground border-border'
                        )}>
                          {seg.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2">{seg.desc}</p>
                      <Badge variant="secondary" className="text-[9px]">{seg.size}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHANNELS TAB */}
          <TabsContent value="channels" className="space-y-4">
            {CHANNELS.map((ch) => {
              const ChIcon = ch.icon;
              return (
                <Card key={ch.id} className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', ch.bgColor)}>
                        <ChIcon className={cn('h-3.5 w-3.5', ch.color)} />
                      </div>
                      {ch.label}
                      <Badge variant="outline" className="text-[9px] ml-auto">{ch.users} users acquired</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1.5">
                      {ch.tactics.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                          <div className={cn(
                            'w-1.5 h-1.5 rounded-full flex-shrink-0',
                            t.status === 'active' ? 'bg-chart-2' : 'bg-muted-foreground'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{t.action}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {t.frequency}
                              </span>
                              <Badge variant="outline" className={cn(
                                'text-[8px] px-1 py-0 h-3.5',
                                t.impact === 'high' ? 'text-chart-2 border-chart-2/30' :
                                t.impact === 'medium' ? 'text-amber-500 border-amber-500/30' :
                                'text-muted-foreground border-border'
                              )}>
                                {t.impact} impact
                              </Badge>
                            </div>
                          </div>
                          <Badge variant={t.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">
                            {t.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* INCENTIVES TAB */}
          <TabsContent value="incentives" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCENTIVES.map((inc, i) => {
                const IncIcon = inc.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border border-border bg-card h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IncIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{inc.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{inc.desc}</p>
                            <Badge variant="outline" className="text-[9px] mt-2 text-primary border-primary/20">
                              {inc.tier}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Referral multiplier */}
            <Card className="border border-amber-500/15 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Growth Phase Referral Multiplier</p>
                    <p className="text-[11px] text-muted-foreground">
                      During the path to 1,000 users, all referral rewards are boosted 2x. Invite 3+ active investors to unlock bonus tier.
                    </p>
                  </div>
                  <Badge className="bg-amber-500 text-amber-50 text-xs ml-auto flex-shrink-0">2x Active</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIMELINE TAB */}
          <TabsContent value="timeline" className="space-y-3">
            {WEEKLY_TARGETS.map((wt, i) => {
              const reached = CURRENT_USERS >= wt.target;
              const isCurrent = !reached && (i === 0 || CURRENT_USERS >= WEEKLY_TARGETS[i - 1].target);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={cn(
                    'border bg-card transition-all',
                    isCurrent ? 'border-primary/30 shadow-sm shadow-primary/5' :
                    reached ? 'border-chart-2/20' : 'border-border'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          reached ? 'bg-chart-2/10' : isCurrent ? 'bg-primary/10' : 'bg-muted/20'
                        )}>
                          {reached ? (
                            <CheckCircle2 className="h-5 w-5 text-chart-2" />
                          ) : isCurrent ? (
                            <Rocket className="h-5 w-5 text-primary" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-foreground">{wt.week}</p>
                            <Badge variant="outline" className={cn(
                              'text-[9px]',
                              reached ? 'text-chart-2 border-chart-2/30' :
                              isCurrent ? 'text-primary border-primary/30' :
                              'text-muted-foreground border-border'
                            )}>
                              {wt.target} users
                            </Badge>
                            {isCurrent && <Badge className="bg-primary text-primary-foreground text-[9px]">Current</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{wt.focus}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Target className="h-2.5 w-2.5" /> KPI: {wt.kpi}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* PMF Validation Criteria */}
            <Card className="border border-primary/10 bg-card mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Product-Market Fit Validation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { metric: '1,000 Registered Users', current: `${CURRENT_USERS}`, status: CURRENT_USERS >= 1000 },
                    { metric: '25-30% Weekly Active', current: `${WEEKLY_ACTIVE_RATE}%`, status: WEEKLY_ACTIVE_RATE >= 25 },
                    { metric: '≥34% Activation Rate', current: '34%', status: true },
                  ].map((v, i) => (
                    <div key={i} className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border',
                      v.status ? 'bg-chart-2/5 border-chart-2/20' : 'bg-muted/10 border-border/30'
                    )}>
                      {v.status ? (
                        <CheckCircle2 className="h-4 w-4 text-chart-2 flex-shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-foreground">{v.metric}</p>
                        <p className={cn('text-[10px]', v.status ? 'text-chart-2' : 'text-muted-foreground')}>
                          Current: {v.current}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color = 'text-foreground' }: {
  icon: typeof Users; label: string; value: string | number; sub: string; color?: string;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        </div>
        <div className={cn('text-2xl font-black', color)}>{value}</div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
