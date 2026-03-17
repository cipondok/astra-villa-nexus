import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Award, Heart, Shield, BarChart3,
  Star, Zap, Target, Calendar, MessageSquare, Building2,
  CheckCircle2, ArrowRight, Crown, Eye, Handshake, Rocket,
  Clock, Gift, Megaphone, LineChart, ThumbsUp, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetentionAction {
  title: string;
  description: string;
  frequency: string;
  impact: 'high' | 'medium';
  icon: typeof Users;
  steps: string[];
}

interface LifecycleStage {
  stage: string;
  timeframe: string;
  goal: string;
  color: string;
  bgColor: string;
  icon: typeof Users;
  actions: { action: string; metric: string }[];
}

const PILLARS: { title: string; subtitle: string; icon: typeof Users; color: string; bgColor: string; actions: RetentionAction[] }[] = [
  {
    title: 'Performance Visibility',
    subtitle: 'Show agents their impact — data drives commitment',
    icon: BarChart3,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    actions: [
      {
        title: 'Monthly Listing Engagement Report',
        description: 'Automated report showing views, inquiries, saves, and conversion rates per listing',
        frequency: '1st of every month',
        impact: 'high',
        icon: LineChart,
        steps: [
          'Pull per-listing analytics: views, saves, inquiries, viewing requests',
          'Compare month-over-month with trend arrows',
          'Highlight top performer with "🏆 Best Listing" badge',
          'Include city-level benchmark: "Your listings get 2.3x more inquiries than average"',
          'Deliver via in-app notification + email summary',
        ],
      },
      {
        title: 'Top-Performing Property Highlights',
        description: 'Weekly spotlight on their best-performing listing with actionable insights',
        frequency: 'Every Monday',
        impact: 'medium',
        icon: Star,
        steps: [
          'Identify listing with highest engagement-to-inquiry conversion',
          'Send personalized message: "[Property X] received 45 views this week — 3x your average"',
          'Suggest replicating success factors on other listings (photo count, description length, pricing)',
          'Offer to feature it in the weekly "Editor\'s Pick" section if it qualifies',
        ],
      },
    ],
  },
  {
    title: 'Motivation Incentives',
    subtitle: 'Reward activity with visibility — the most valuable currency',
    icon: Gift,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    actions: [
      {
        title: 'Featured Listing Placement',
        description: 'Active agents earn premium positioning in search results and homepage',
        frequency: 'Ongoing — tier-based',
        impact: 'high',
        icon: Crown,
        steps: [
          'Define "active" threshold: ≥5 listings updated in last 30 days + ≥80% inquiry response rate',
          'Auto-promote 1 listing per active agent to "Featured" carousel on homepage',
          'Rotate featured slots weekly to maintain fairness',
          'Show agents their visibility boost: "Featured placement = 4.2x more views"',
          'Upgrade to permanent featured status for agents maintaining 3+ months of activity',
        ],
      },
      {
        title: 'Additional Marketing Exposure',
        description: 'Amplify agent listings through platform marketing channels',
        frequency: 'Monthly for qualifying agents',
        impact: 'medium',
        icon: Megaphone,
        steps: [
          'Include top agent listings in platform social media posts (Instagram, LinkedIn)',
          'Feature in monthly "Market Picks" email newsletter sent to all registered investors',
          'Offer co-branded marketing materials agents can share with their own network',
          'Priority inclusion in developer partnership showcases and open house events',
        ],
      },
    ],
  },
  {
    title: 'Relationship Building',
    subtitle: 'Agents are partners, not vendors — treat them accordingly',
    icon: Heart,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    actions: [
      {
        title: 'Regular Feedback Conversations',
        description: 'Scheduled check-ins to understand agent needs and platform friction points',
        frequency: 'Monthly for top agents, quarterly for all',
        impact: 'high',
        icon: MessageSquare,
        steps: [
          'Schedule 15-minute calls with top 20 agents monthly — no agenda, just listen',
          'Ask 3 questions: "What\'s working?", "What\'s frustrating?", "What would make you list more?"',
          'Track feedback in CRM with follow-up actions and deadlines',
          'Close the loop: message them when their feedback leads to a platform change',
          'Quarterly all-agent survey (5 questions max) to catch systemic issues',
        ],
      },
      {
        title: 'Negotiation & Closing Support',
        description: 'Provide AI-powered tools and human assistance for complex deals',
        frequency: 'On-demand',
        impact: 'medium',
        icon: Handshake,
        steps: [
          'Offer AI Negotiation Assistant for real-time pricing guidance during offers',
          'Provide market comparables report agents can share with buyers',
          'Assign dedicated support for deals above certain value thresholds',
          'Post-close: help agents collect testimonials from satisfied buyers',
        ],
      },
    ],
  },
  {
    title: 'Growth Partnership',
    subtitle: 'Position platform as their business growth engine, not just a listing board',
    icon: Rocket,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    actions: [
      {
        title: 'Long-Term Lead Generation Channel',
        description: 'Demonstrate consistent lead flow that makes the platform indispensable',
        frequency: 'Ongoing — data-driven',
        impact: 'high',
        icon: Target,
        steps: [
          'Share monthly "Lead Source Report": show how many qualified leads came from ASTRA vs other channels',
          'Track and display agent-specific ROI: "You\'ve received 23 qualified leads worth est. Rp 2.3B this quarter"',
          'Offer lead distribution priority based on response speed and closing rate',
          'Create agent success stories: "Agent X closed 5 deals in 3 months through ASTRA leads"',
        ],
      },
      {
        title: 'Developer Project Collaboration',
        description: 'Connect agents with exclusive developer partnerships for new project launches',
        frequency: 'Per project launch',
        impact: 'high',
        icon: Building2,
        steps: [
          'Invite top-performing agents to exclusive developer pre-launch briefings',
          'Offer first-mover listing rights for new development projects',
          'Co-host virtual launch events where agents present to their investor networks',
          'Revenue sharing model for developer projects sourced through agent relationships',
        ],
      },
    ],
  },
];

const LIFECYCLE: LifecycleStage[] = [
  {
    stage: 'Onboarding',
    timeframe: 'Week 1–2',
    goal: 'First listing published + first inquiry received',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    icon: Rocket,
    actions: [
      { action: 'Welcome call — walkthrough of agent tools', metric: 'Call completed within 48h' },
      { action: 'Assist with first 3 listings — photo tips, description optimization', metric: 'Listing quality score ≥ 70' },
      { action: 'Send first "You got a view!" notification to build excitement', metric: 'Agent opens notification' },
    ],
  },
  {
    stage: 'Activation',
    timeframe: 'Week 3–8',
    goal: 'Agent responds to inquiries + adds 5+ listings',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: Zap,
    actions: [
      { action: 'Share first performance report with benchmarks', metric: '≥80% inquiry response rate' },
      { action: 'Offer featured placement for their best listing', metric: 'Listing gets 2x baseline views' },
      { action: 'Invite to agent community group for peer learning', metric: 'Agent joins and engages' },
    ],
  },
  {
    stage: 'Retention',
    timeframe: 'Month 3–12',
    goal: 'Consistent listing activity + closing deals',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    icon: Shield,
    actions: [
      { action: 'Monthly engagement reports with ROI metrics', metric: '≥1 deal closed per quarter' },
      { action: 'Quarterly feedback call — listen and act on pain points', metric: 'NPS ≥ 8' },
      { action: 'Marketing co-promotion for top performers', metric: 'Agent refers another agent' },
    ],
  },
  {
    stage: 'Loyalty',
    timeframe: 'Year 1+',
    goal: 'Agent becomes platform advocate + multi-project partner',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    icon: Crown,
    actions: [
      { action: 'Developer project collaboration invitations', metric: 'Agent participates in 1+ launches' },
      { action: 'Agent success story published on platform', metric: 'Story generates 3+ agent sign-ups' },
      { action: 'Advisory board invitation for platform direction input', metric: 'Agent provides strategic feedback' },
    ],
  },
];

const HEALTH_SIGNALS = [
  { signal: 'No new listing in 14+ days', risk: 'high', response: 'Personal check-in call + offer listing optimization help', icon: AlertIcon },
  { signal: 'Inquiry response rate drops below 50%', risk: 'high', response: 'Send "you have unanswered leads" nudge + review workload', icon: AlertIcon },
  { signal: 'No login in 7+ days', risk: 'medium', response: 'Share a market insight relevant to their area + new feature update', icon: AlertIcon },
  { signal: 'Listing views declining month-over-month', risk: 'medium', response: 'Proactive listing optimization suggestions with specific improvements', icon: AlertIcon },
  { signal: 'Agent asks to remove listings', risk: 'high', response: 'Immediate call — understand reason, offer solutions before they leave', icon: AlertIcon },
];

function AlertIcon() { return null; }

export default function AgentRetentionPage() {
  const [activeTab, setActiveTab] = useState('pillars');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
                Agent Retention Playbook
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Structured engagement to build a loyal, high-performing agent network</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
              <Shield className="h-3 w-3 mr-1.5" />4 pillars · {PILLARS.reduce((s, p) => s + p.actions.length, 0)} actions
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pillars">Retention Pillars</TabsTrigger>
            <TabsTrigger value="lifecycle">Agent Lifecycle</TabsTrigger>
            <TabsTrigger value="health">Churn Signals</TabsTrigger>
          </TabsList>

          {/* ═══ PILLARS ═══ */}
          <TabsContent value="pillars" className="space-y-4">
            {PILLARS.map((pillar, pi) => {
              const PIcon = pillar.icon;
              return (
                <motion.div key={pi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                          <PIcon className={cn('h-5 w-5', pillar.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{pillar.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{pillar.subtitle}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {pillar.actions.map((action, ai) => {
                        const AIcon = action.icon;
                        return (
                          <div key={ai} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                            <div className="flex items-center gap-2 mb-2">
                              <AIcon className={cn('h-4 w-4', pillar.color)} />
                              <p className="text-xs font-bold text-foreground flex-1">{action.title}</p>
                              <Badge variant="outline" className="text-[7px]">
                                <Clock className="h-2 w-2 mr-0.5" />{action.frequency}
                              </Badge>
                              <Badge variant={action.impact === 'high' ? 'default' : 'outline'} className="text-[7px]">
                                {action.impact} impact
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-2">{action.description}</p>
                            <div className="space-y-1">
                              {action.steps.map((step, si) => (
                                <div key={si} className="flex items-start gap-2">
                                  <span className="text-[8px] font-bold text-muted-foreground w-3 flex-shrink-0 mt-0.5">{si + 1}</span>
                                  <p className="text-[10px] text-foreground">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ LIFECYCLE ═══ */}
          <TabsContent value="lifecycle" className="space-y-3">
            {LIFECYCLE.map((stage, i) => {
              const SIcon = stage.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stage.bgColor)}>
                          <SIcon className={cn('h-5 w-5', stage.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{stage.stage}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">{stage.timeframe}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            <span className="font-bold">Goal:</span> {stage.goal}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1.5">
                        {stage.actions.map((a, j) => (
                          <div key={j} className="flex items-start gap-3 p-2 rounded-lg bg-muted/10 border border-border/20">
                            <CheckCircle2 className={cn('h-3.5 w-3.5 flex-shrink-0 mt-0.5', stage.color)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-foreground">{a.action}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                <span className="font-bold">Success metric:</span> {a.metric}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Retention Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      Agent retention is not about preventing exits — it's about making the platform so valuable that leaving means losing a competitive advantage. Every report, every featured slot, every feedback call should reinforce: "My business is better because of ASTRA Villa."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CHURN SIGNALS ═══ */}
          <TabsContent value="health" className="space-y-3">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-destructive" />
                  Early Warning Signals
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Detect disengagement before it becomes churn — each signal has a pre-built response</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {HEALTH_SIGNALS.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'p-3 rounded-lg border',
                      s.risk === 'high'
                        ? 'bg-destructive/5 border-destructive/15'
                        : 'bg-chart-1/5 border-chart-1/15'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={s.risk === 'high' ? 'destructive' : 'outline'} className="text-[7px]">
                        {s.risk} risk
                      </Badge>
                      <p className="text-xs font-bold text-foreground">{s.signal}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-foreground">{s.response}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Response Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      Never automate the response to a high-risk churn signal. A personal call from someone who knows their name and portfolio is 5x more effective than any automated email. The goal is to make them feel like a partner, not a number.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
