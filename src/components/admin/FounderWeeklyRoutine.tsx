
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, TrendingUp, Handshake, Cpu, Megaphone, Clock,
  Calendar, Sun, Moon, Coffee, Zap, Target, Shield,
  BarChart3, CheckCircle, AlertTriangle, Heart
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────

interface TimeBlock {
  time: string;
  duration: string;
  activity: string;
  category: string;
  energy: 'high' | 'medium' | 'low';
  description: string;
}

interface DaySchedule {
  day: string;
  theme: string;
  blocks: TimeBlock[];
}

const categoryMeta: Record<string, { icon: typeof Brain; color: string; pct: number }> = {
  strategic: { icon: Brain, color: 'text-amber-500', pct: 20 },
  growth: { icon: TrendingUp, color: 'text-green-500', pct: 25 },
  partnerships: { icon: Handshake, color: 'text-blue-500', pct: 15 },
  product: { icon: Cpu, color: 'text-purple-500', pct: 20 },
  brand: { icon: Megaphone, color: 'text-pink-500', pct: 10 },
  recovery: { icon: Heart, color: 'text-red-400', pct: 10 },
};

const weekSchedule: DaySchedule[] = [
  {
    day: 'Monday',
    theme: 'Strategy & Planning',
    blocks: [
      { time: '06:00', duration: '1h', activity: 'Morning Clarity Ritual', category: 'recovery', energy: 'medium', description: 'Exercise, journaling, weekly intention setting — no screens for first 30 min' },
      { time: '07:00', duration: '2h', activity: 'Strategic Thinking Block', category: 'strategic', energy: 'high', description: 'Market analysis, competitive positioning review, roadmap decisions. Deep work — no meetings.' },
      { time: '09:00', duration: '30m', activity: 'Weekly KPI Review', category: 'growth', energy: 'high', description: 'Review admin dashboard: traffic, listings, agents, inquiries. Flag anomalies.' },
      { time: '09:30', duration: '1h', activity: 'Team Standup + Sprint Planning', category: 'product', energy: 'high', description: 'Align priorities with team. Set 3 "must-ship" items for the week.' },
      { time: '10:30', duration: '2h', activity: 'Growth Execution Review', category: 'growth', energy: 'high', description: 'SEO indexing progress, content pipeline status, listing acquisition numbers.' },
      { time: '12:30', duration: '1h', activity: 'Lunch + Industry Reading', category: 'recovery', energy: 'low', description: 'Proptech news, competitor updates, investor newsletters.' },
      { time: '13:30', duration: '2h', activity: 'Product Oversight', category: 'product', energy: 'medium', description: 'Review AI feature progress, test new deployments, analyze user feedback.' },
      { time: '15:30', duration: '1h', activity: 'Partnership Pipeline Review', category: 'partnerships', energy: 'medium', description: 'Update CRM, prep outreach for the week, follow up on warm leads.' },
      { time: '16:30', duration: '30m', activity: 'End-of-Day Capture', category: 'strategic', energy: 'low', description: 'Document decisions, update task tracker, prep tomorrow.' },
    ],
  },
  {
    day: 'Tuesday',
    theme: 'Growth & Outreach',
    blocks: [
      { time: '06:00', duration: '1h', activity: 'Morning Routine', category: 'recovery', energy: 'medium', description: 'Exercise, healthy breakfast, mental preparation.' },
      { time: '07:00', duration: '1.5h', activity: 'Content Creation Block', category: 'brand', energy: 'high', description: 'Write LinkedIn post, draft thought leadership article, or record short video.' },
      { time: '08:30', duration: '2h', activity: 'Agent Outreach & Calls', category: 'growth', energy: 'high', description: 'Call top agent prospects, onboarding follow-ups, relationship building.' },
      { time: '10:30', duration: '1.5h', activity: 'Developer Partnership Meetings', category: 'partnerships', energy: 'high', description: 'Scheduled calls/meetings with property developers for listing partnerships.' },
      { time: '12:00', duration: '1h', activity: 'Lunch + Networking', category: 'recovery', energy: 'low', description: 'Coffee meeting with ecosystem contact or solo recharge.' },
      { time: '13:00', duration: '2h', activity: 'SEO & Traffic Deep Dive', category: 'growth', energy: 'medium', description: 'Analyze keyword rankings, review indexed pages, plan next content batch.' },
      { time: '15:00', duration: '1.5h', activity: 'Product Feature Testing', category: 'product', energy: 'medium', description: 'Test AI valuation accuracy, review search UX, check mobile experience.' },
      { time: '16:30', duration: '30m', activity: 'Daily Wrap', category: 'strategic', energy: 'low', description: 'Update metrics log, document learnings.' },
    ],
  },
  {
    day: 'Wednesday',
    theme: 'Partnerships & Product',
    blocks: [
      { time: '06:00', duration: '1h', activity: 'Morning Routine', category: 'recovery', energy: 'medium', description: 'Exercise + mindfulness practice.' },
      { time: '07:00', duration: '2h', activity: 'Deep Product Work', category: 'product', energy: 'high', description: 'AI roadmap planning, feature specs, architecture decisions with engineer.' },
      { time: '09:00', duration: '1h', activity: 'Investor Narrative Refinement', category: 'strategic', energy: 'high', description: 'Update pitch deck, refine financial model, prepare data room materials.' },
      { time: '10:00', duration: '2h', activity: 'Partnership Meetings', category: 'partnerships', energy: 'high', description: 'Bank partnership discussions, agency alliance calls, university housing meetings.' },
      { time: '12:00', duration: '1h', activity: 'Lunch Break', category: 'recovery', energy: 'low', description: 'Complete disconnect — no work.' },
      { time: '13:00', duration: '1.5h', activity: 'Growth Metrics Action', category: 'growth', energy: 'medium', description: 'Review A/B test results, adjust ad experiments, listing quality audit.' },
      { time: '14:30', duration: '1.5h', activity: 'Community & Social Engagement', category: 'brand', energy: 'medium', description: 'Respond to comments, engage in property forums, LinkedIn networking.' },
      { time: '16:00', duration: '1h', activity: 'Admin Dashboard Review', category: 'product', energy: 'low', description: 'Check AI health, system alerts, platform performance metrics.' },
    ],
  },
  {
    day: 'Thursday',
    theme: 'Execution & Scale',
    blocks: [
      { time: '06:00', duration: '1h', activity: 'Morning Routine', category: 'recovery', energy: 'medium', description: 'Exercise + reading (non-work related).' },
      { time: '07:00', duration: '2h', activity: 'City Expansion Planning', category: 'strategic', energy: 'high', description: 'Analyze next city targets, review supply gap data, plan activation timeline.' },
      { time: '09:00', duration: '2h', activity: 'Listing Supply Sprint', category: 'growth', energy: 'high', description: 'Agent onboarding calls, developer listing uploads, quality review sessions.' },
      { time: '11:00', duration: '1h', activity: 'Advisor / Mentor Call', category: 'partnerships', energy: 'high', description: 'Weekly check-in with startup advisor or investor mentor.' },
      { time: '12:00', duration: '1h', activity: 'Lunch + Learning', category: 'recovery', energy: 'low', description: 'Listen to startup/proptech podcast while eating.' },
      { time: '13:00', duration: '2h', activity: 'Product Sprint Review', category: 'product', energy: 'medium', description: 'Review shipped features, user analytics, bug triage, next sprint prep.' },
      { time: '15:00', duration: '1h', activity: 'Performance Marketing Review', category: 'growth', energy: 'medium', description: 'Check ad spend ROI, adjust campaigns, validate CAC trends.' },
      { time: '16:00', duration: '1h', activity: 'Thought Leadership Writing', category: 'brand', energy: 'low', description: 'Draft market insight article or prepare speaking engagement materials.' },
    ],
  },
  {
    day: 'Friday',
    theme: 'Reflection & Planning',
    blocks: [
      { time: '06:00', duration: '1h', activity: 'Morning Routine', category: 'recovery', energy: 'medium', description: 'Light exercise + gratitude journaling.' },
      { time: '07:00', duration: '1.5h', activity: 'Weekly Metrics Report', category: 'growth', energy: 'high', description: 'Compile WoW metrics, prepare team update, flag wins and blockers.' },
      { time: '08:30', duration: '1h', activity: 'Team Retrospective', category: 'product', energy: 'high', description: 'What shipped, what blocked, what to improve. Keep to 30-45 min.' },
      { time: '09:30', duration: '1.5h', activity: 'Strategic Review & Decisions', category: 'strategic', energy: 'high', description: 'Make pending decisions, update roadmap, reallocate resources if needed.' },
      { time: '11:00', duration: '1h', activity: 'Investor / Fundraising Prep', category: 'strategic', energy: 'high', description: 'Send investor updates, prep for next week pitch meetings, refine deck.' },
      { time: '12:00', duration: '1h', activity: 'Celebration Lunch', category: 'recovery', energy: 'low', description: 'Acknowledge weekly wins. Solo or team lunch.' },
      { time: '13:00', duration: '1h', activity: 'Next Week Planning', category: 'strategic', energy: 'medium', description: 'Calendar audit, meeting prep, set top 3 priorities for next week.' },
      { time: '14:00', duration: '1h', activity: 'Content Scheduling', category: 'brand', energy: 'low', description: 'Schedule next week social posts, review content calendar.' },
      { time: '15:00', duration: '-', activity: 'Early Close', category: 'recovery', energy: 'low', description: 'End early Friday. Recharge for sustainable long-term execution.' },
    ],
  },
];

const energyColors = { high: 'bg-green-500', medium: 'bg-amber-500', low: 'bg-muted-foreground' };

// ─── Component ─────────────────────────────────────────────

const FounderWeeklyRoutine = () => {
  const [selectedDay, setSelectedDay] = useState(0);

  // Compute weekly hours per category
  const weeklyHours: Record<string, number> = {};
  weekSchedule.forEach(day => {
    day.blocks.forEach(b => {
      const hrs = parseFloat(b.duration) || 0;
      weeklyHours[b.category] = (weeklyHours[b.category] || 0) + hrs;
    });
  });
  const totalHrs = Object.values(weeklyHours).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Founder Weekly Operating Routine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Structured execution framework — ~{totalHrs.toFixed(0)}h/week across 6 focus areas
        </p>
      </div>

      {/* Time Allocation Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(categoryMeta).map(([key, meta]) => {
          const hrs = weeklyHours[key] || 0;
          const pct = totalHrs > 0 ? Math.round((hrs / totalHrs) * 100) : 0;
          return (
            <Card key={key} className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <meta.icon className={`h-3.5 w-3.5 ${meta.color}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{key}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{hrs.toFixed(1)}h</p>
                <Progress value={pct} className="h-1 mt-1" />
                <p className="text-[9px] text-muted-foreground mt-0.5">{pct}% of week</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Principles */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Operating Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Energy Management', icon: Zap, items: ['High-energy tasks before 11am', 'No meetings before 9am (deep work shield)', 'Mandatory lunch disconnect', 'Friday early close for recovery'] },
              { title: 'Focus Protection', icon: Target, items: ['Max 3 meetings/day', 'Batch similar tasks (calls, reviews, writing)', 'Phone on DND during deep work', 'Weekly theme days reduce context-switching'] },
              { title: 'Anti-Burnout Rules', icon: Heart, items: ['10h recovery time/week minimum', 'No work Saturday (emergency-only Sunday)', 'Exercise 5x/week non-negotiable', 'Monthly full-day off-grid reset'] },
            ].map((principle) => (
              <div key={principle.title} className="border border-border/40 rounded-xl p-3 bg-card/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <principle.icon className="h-4 w-4 text-primary" />
                  <p className="text-[11px] font-semibold text-foreground">{principle.title}</p>
                </div>
                <ul className="space-y-1">
                  {principle.items.map((item, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary">▸</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <Tabs defaultValue="0" className="w-full">
        <TabsList className="flex h-auto gap-1 bg-muted/50 p-1">
          {weekSchedule.map((day, i) => (
            <TabsTrigger
              key={i}
              value={String(i)}
              className="text-xs gap-1 data-[state=active]:bg-background flex-1"
              onClick={() => setSelectedDay(i)}
            >
              <Calendar className="h-3 w-3" />
              {day.day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {weekSchedule.map((day, dayIdx) => (
          <TabsContent key={dayIdx} value={String(dayIdx)} className="mt-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{day.day}</h3>
                <p className="text-[11px] text-muted-foreground">Theme: {day.theme}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {day.blocks.reduce((s, b) => s + (parseFloat(b.duration) || 0), 0).toFixed(1)}h scheduled
              </Badge>
            </div>

            {/* Timeline */}
            <div className="space-y-1">
              {day.blocks.map((block, bIdx) => {
                const meta = categoryMeta[block.category];
                const Icon = meta?.icon || Clock;
                return (
                  <div key={bIdx} className="flex gap-3 group">
                    {/* Time Column */}
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className="text-[11px] font-mono text-muted-foreground">{block.time}</span>
                    </div>
                    {/* Timeline Bar */}
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 border-background ${energyColors[block.energy]}`} />
                      {bIdx < day.blocks.length - 1 && <div className="w-px flex-1 bg-border/50 min-h-[20px]" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`h-3.5 w-3.5 ${meta?.color || 'text-muted-foreground'}`} />
                        <span className="text-[12px] font-medium text-foreground">{block.activity}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{block.duration}</Badge>
                        <div className={`w-1.5 h-1.5 rounded-full ${energyColors[block.energy]}`} title={`${block.energy} energy`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{block.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Weekly Rhythm Summary */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Weekly Rhythm at a Glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {weekSchedule.map((day) => (
              <div key={day.day} className="border border-border/40 rounded-lg p-2 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground mb-1">{day.day.slice(0, 3)}</p>
                <p className="text-[9px] text-muted-foreground mb-1.5">{day.theme}</p>
                <div className="space-y-0.5">
                  {Object.entries(categoryMeta).map(([cat, meta]) => {
                    const hrs = day.blocks.filter(b => b.category === cat).reduce((s, b) => s + (parseFloat(b.duration) || 0), 0);
                    if (hrs === 0) return null;
                    return (
                      <div key={cat} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full`} style={{ background: `var(--${cat === 'strategic' ? 'chart-3' : cat === 'growth' ? 'chart-2' : cat === 'partnerships' ? 'chart-1' : cat === 'product' ? 'chart-4' : cat === 'brand' ? 'chart-5' : 'muted-foreground'})` }} />
                        <span className="text-[9px] text-muted-foreground capitalize">{cat.slice(0, 4)}</span>
                        <span className="text-[9px] text-foreground ml-auto">{hrs}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Non-Negotiable Rituals */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Non-Negotiable Weekly Rituals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Daily (Every Day)</p>
              <ul className="space-y-1.5">
                {[
                  'Morning exercise before any screen time (6:00-6:45)',
                  'Review yesterday\'s 3 top metrics before standup',
                  'End-of-day 10-min journal: decisions made, lessons learned',
                  'No Slack/WhatsApp during deep work blocks',
                ].map((r, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Weekly (Fixed Slots)</p>
              <ul className="space-y-1.5">
                {[
                  'Monday 07:00 — 2h strategic deep work (no exceptions)',
                  'Tuesday 07:00 — Content creation for personal brand',
                  'Thursday 11:00 — Advisor/mentor check-in call',
                  'Friday 13:00 — Next week planning + calendar audit',
                  'Friday 15:00 — Early close to prevent burnout debt',
                ].map((r, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderWeeklyRoutine;
