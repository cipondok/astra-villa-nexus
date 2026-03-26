import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Rocket, Clock, CheckCircle2, Sun, Megaphone, MessageSquare,
  Presentation, Moon, Target, ChevronRight, Zap, Eye,
  Users, BarChart3, Shield, Sparkles, Bell, Send,
  ArrowRight, Flame, AlertTriangle, Star, Globe, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskItem {
  task: string;
  owner: string;
  critical: boolean;
}

interface TimeBlock {
  id: string;
  time: string;
  phase: string;
  title: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  objective: string;
  tasks: TaskItem[];
  script?: string;
}

const TIMELINE: TimeBlock[] = [
  {
    id: 'prep',
    time: '06:00 – 08:00',
    phase: 'PRE-LAUNCH',
    title: 'Morning Preparation',
    icon: Sun,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    objective: 'Ensure everything works before anyone sees it — zero tolerance for broken first impressions',
    tasks: [
      { task: 'Full platform smoke test: homepage → search → property detail → inquiry flow → watchlist save', owner: 'Engineering', critical: true },
      { task: 'Verify email/push notification delivery for inquiries — send test inquiry and confirm agent receives it', owner: 'Engineering', critical: true },
      { task: 'Confirm 20+ demo listings are live with complete photos, descriptions, and AI opportunity scores', owner: 'Content', critical: true },
      { task: 'Ensure top 5 listings have scores ≥ 75 — these are the "hero properties" for first impressions', owner: 'AI/Data', critical: true },
      { task: 'Test mobile responsiveness on iPhone and Android — 60%+ of traffic will be mobile', owner: 'Engineering', critical: false },
      { task: 'Pre-load Market Intelligence heat map with current demand data', owner: 'AI/Data', critical: false },
      { task: 'Brief all team members on response protocol: who handles what inquiries, escalation path', owner: 'Operations', critical: true },
    ],
  },
  {
    id: 'announce',
    time: '09:00 – 10:00',
    phase: 'GO LIVE',
    title: 'Public Announcement',
    icon: Megaphone,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    objective: 'Create curiosity and drive first visits — the message is "something new exists" not "buy now"',
    tasks: [
      { task: 'Publish LinkedIn launch post: founder narrative + platform positioning + link to explore', owner: 'Founder', critical: true },
      { task: 'Publish Instagram carousel: 5 slides — problem, solution, AI score demo, featured listing, CTA', owner: 'Growth', critical: true },
      { task: 'Post in 3–5 property investment WhatsApp/Telegram groups with personalized intro message', owner: 'Growth', critical: true },
      { task: 'Send launch email to pre-registered waitlist (if any) with "You\'re among the first" framing', owner: 'Growth', critical: false },
      { task: 'Update all social media bios with platform link and "AI-Powered Property Intelligence" tagline', owner: 'Growth', critical: false },
    ],
    script: `"We just launched ASTRA Villa — an AI-powered property investment platform that scores every listing by investment potential. Instead of browsing hundreds of listings, you see which ones are actually worth your attention. Explore the first opportunities now → [link]"`,
  },
  {
    id: 'outreach',
    time: '10:00 – 13:00',
    phase: 'ACTIVATION',
    title: 'Direct Outreach',
    icon: Send,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    objective: 'Convert pre-warmed contacts into first active users — personal messages, not mass blasts',
    tasks: [
      { task: 'Send personalized WhatsApp to 10 pre-contacted agents: "Platform is live — your listings are featured"', owner: 'Partnerships', critical: true },
      { task: 'Message 15 pre-identified investors: "Here\'s a property scoring 85+ in your target area — take a look"', owner: 'Growth', critical: true },
      { task: 'Ask each contacted agent to save at least 1 listing to their watchlist (demonstrates feature)', owner: 'Partnerships', critical: false },
      { task: 'Encourage 5 investors to submit their first inquiry — even if exploratory', owner: 'Growth', critical: true },
      { task: 'Share specific property links (not homepage) — deep links convert 3x better than generic URLs', owner: 'Growth', critical: false },
      { task: 'Follow up non-responders at 12:00 with a shorter nudge: "Did you see the AI score on this one?"', owner: 'Growth', critical: false },
    ],
  },
  {
    id: 'demo',
    time: '14:00 – 15:00',
    phase: 'SHOWCASE',
    title: 'Live Demonstration Session',
    icon: Presentation,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    objective: 'Show — don\'t tell. A 30-minute live walkthrough creates more conversion than a week of posts',
    tasks: [
      { task: 'Host 30-min Zoom/Google Meet session — max 20 attendees for intimacy', owner: 'Founder', critical: true },
      { task: 'Demo flow: Search → Filter → Property Detail → Opportunity Score → Super Engine → Inquiry', owner: 'Founder', critical: true },
      { task: 'Show one "Elite Opportunity" (score ≥ 85) and walk through WHY the AI scored it high', owner: 'Founder', critical: true },
      { task: 'Open Q&A for last 10 minutes — have team ready to answer technical questions in chat', owner: 'Team', critical: false },
      { task: 'Record session for async sharing with people who couldn\'t attend live', owner: 'Operations', critical: false },
      { task: 'End with CTA: "Explore your first opportunity now" + share direct link in chat', owner: 'Founder', critical: true },
    ],
    script: `"Thank you for joining. In the next 20 minutes, I'll show you how ASTRA Villa helps you find investment-grade properties using AI — not just listings, but scored opportunities. Let me start by searching for properties in Seminyak..."`,
  },
  {
    id: 'followup',
    time: '17:00 – 21:00',
    phase: 'MOMENTUM',
    title: 'Evening Engagement',
    icon: Moon,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    objective: 'Capture the day\'s energy into measurable signals — response speed today sets the platform\'s reputation',
    tasks: [
      { task: 'Respond to EVERY inquiry received today within 2 hours — first impression of platform responsiveness', owner: 'Operations', critical: true },
      { task: 'Send thank-you message to all demo attendees with recording link + "your feedback matters" ask', owner: 'Growth', critical: true },
      { task: 'Collect feedback: send 3-question survey to first 20 users (What did you like? What confused you? Would you use again?)', owner: 'Growth', critical: true },
      { task: 'Document Day 1 metrics: total visits, signups, inquiries, watchlist saves, demo attendees', owner: 'Analytics', critical: true },
      { task: 'Internal team debrief: what worked, what broke, what surprised us, what do we fix tomorrow', owner: 'All', critical: true },
      { task: 'Post "Day 1" update on social media: "X investors explored Y opportunities today — thank you for the incredible response"', owner: 'Growth', critical: false },
    ],
  },
];

const DAY1_TARGETS = [
  { metric: 'Platform Visits', target: '200+', icon: Eye, color: 'text-primary' },
  { metric: 'User Signups', target: '30+', icon: Users, color: 'text-chart-1' },
  { metric: 'Inquiries Submitted', target: '10+', icon: MessageSquare, color: 'text-chart-2' },
  { metric: 'Watchlist Saves', target: '50+', icon: Star, color: 'text-chart-4' },
  { metric: 'Demo Attendees', target: '15+', icon: Presentation, color: 'text-chart-5' },
  { metric: 'Agent Responses', target: '<2h avg', icon: Zap, color: 'text-chart-1' },
];

const CONTINGENCIES = [
  { risk: 'Platform goes down', response: 'Have Vercel/Supabase status bookmarked. Engineering on standby. If >15 min, post "brief maintenance" on social.', severity: 'critical' },
  { risk: 'Zero inquiries by noon', response: 'Pivot: personally send 5 property links to warm investors with "what do you think of this one?" framing.', severity: 'high' },
  { risk: 'Agent doesn\'t respond to inquiry', response: 'Founder responds on behalf within 1 hour. Follow up with agent privately. Don\'t let buyer wait.', severity: 'high' },
  { risk: 'Negative feedback on AI scores', response: 'Acknowledge: "We\'re calibrating continuously — your input improves accuracy." Log specific feedback for model tuning.', severity: 'medium' },
  { risk: 'Demo session technical issues', response: 'Have screen recording of demo flow as backup. Switch to pre-recorded walkthrough if live fails.', severity: 'medium' },
];

export default function LaunchDayPage() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (blockId: string, taskIdx: number) => {
    const key = `${blockId}-${taskIdx}`;
    setCheckedTasks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalTasks = TIMELINE.reduce((s, b) => s + b.tasks.length, 0);
  const completedTasks = checkedTasks.size;
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-chart-1" />
                </div>
                Launch Day Execution Plan
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Hour-by-hour checklist for maximum Day 1 impact</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5 border-border">
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                {completedTasks}/{totalTasks} tasks
              </Badge>
              <Badge variant="outline" className={cn(
                'text-xs px-3 py-1.5',
                progressPct >= 80 ? 'border-chart-2/30 text-chart-2' : progressPct >= 40 ? 'border-chart-4/30 text-chart-4' : 'border-border text-muted-foreground'
              )}>
                {progressPct}% complete
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="targets">Day 1 Targets</TabsTrigger>
            <TabsTrigger value="contingency">Contingency</TabsTrigger>
          </TabsList>

          {/* ═══ TIMELINE ═══ */}
          <TabsContent value="timeline" className="space-y-4">
            {/* Phase nav */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {TIMELINE.map((b, i) => {
                    const BIcon = b.icon;
                    const blockCompleted = b.tasks.filter((_, ti) => checkedTasks.has(`${b.id}-${ti}`)).length;
                    return (
                      <div key={b.id} className="flex items-center gap-1">
                        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-bold', b.bgColor, b.color)}>
                          <BIcon className="h-3 w-3" />
                          {b.time.split('–')[0].trim()}
                          <span className="text-[7px] opacity-60">{blockCompleted}/{b.tasks.length}</span>
                        </div>
                        {i < TIMELINE.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {TIMELINE.map((block, bi) => {
              const BIcon = block.icon;
              const blockCompleted = block.tasks.filter((_, ti) => checkedTasks.has(`${block.id}-${ti}`)).length;
              const allDone = blockCompleted === block.tasks.length;
              return (
                <motion.div key={block.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.06 }}>
                  <Card className={cn('border bg-card', allDone ? 'border-chart-2/20' : 'border-border')}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', block.bgColor)}>
                          <BIcon className={cn('h-5 w-5', block.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn('text-[7px] font-bold', block.color)}>{block.phase}</Badge>
                            <CardTitle className="text-sm">{block.title}</CardTitle>
                            <Badge variant="outline" className="text-[8px] text-muted-foreground ml-auto">
                              <Clock className="h-2.5 w-2.5 mr-1" />{block.time}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{block.objective}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                      <div className="space-y-1.5">
                        {block.tasks.map((t, ti) => {
                          const key = `${block.id}-${ti}`;
                          const isDone = checkedTasks.has(key);
                          return (
                            <div
                              key={ti}
                              className={cn(
                                'flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer',
                                isDone ? 'bg-chart-2/5 border-chart-2/10' : 'bg-muted/5 border-border/20 hover:bg-muted/10'
                              )}
                              onClick={() => toggleTask(block.id, ti)}
                            >
                              <Checkbox checked={isDone} className="mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-[10px]', isDone ? 'text-muted-foreground line-through' : 'text-foreground')}>{t.task}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {t.critical && <Badge variant="outline" className="text-[6px] px-1 py-0 h-3 text-destructive border-destructive/20">Critical</Badge>}
                                <Badge variant="outline" className="text-[6px] px-1 py-0 h-3 text-muted-foreground">{t.owner}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {block.script && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Megaphone className="h-3 w-3 text-primary" />
                            <p className="text-[8px] font-bold text-primary uppercase">Suggested Copy</p>
                          </div>
                          <p className="text-[10px] text-foreground italic leading-relaxed">{block.script}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ TARGETS ═══ */}
          <TabsContent value="targets" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Day 1 success is measured by activity signals, not revenue. Did people show up, explore, and engage?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAY1_TARGETS.map((t, i) => {
                const TIcon = t.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                            <TIcon className={cn('h-4 w-4', t.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-muted-foreground">{t.metric}</p>
                            <p className="text-lg font-black text-foreground">{t.target}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">What "Success" Looks Like</p>
                    <p className="text-[11px] text-muted-foreground">
                      If 30 people sign up, 10 submit inquiries, and agents respond within 2 hours — Day 1 is a success. The goal isn't virality. It's proving that the loop works: user discovers → user engages → agent responds → conversation starts. Everything else scales from this loop.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CONTINGENCY ═══ */}
          <TabsContent value="contingency" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Murphy's Law applies to launch days. Plan the response before the problem occurs.</p>
            {CONTINGENCIES.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn('border bg-card', c.severity === 'critical' ? 'border-destructive/15' : c.severity === 'high' ? 'border-chart-2/15' : 'border-border')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        c.severity === 'critical' ? 'bg-destructive/10' : c.severity === 'high' ? 'bg-chart-2/10' : 'bg-muted/20'
                      )}>
                        <AlertTriangle className={cn(
                          'h-4 w-4',
                          c.severity === 'critical' ? 'text-destructive' : c.severity === 'high' ? 'text-chart-2' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-foreground">{c.risk}</p>
                          <Badge variant="outline" className={cn(
                            'text-[7px]',
                            c.severity === 'critical' ? 'text-destructive border-destructive/20' : c.severity === 'high' ? 'text-chart-2 border-chart-2/20' : 'text-muted-foreground'
                          )}>{c.severity}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{c.response}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Launch Day Mindset</p>
                    <p className="text-[11px] text-muted-foreground">
                      Something will go wrong. That's normal. The quality of your launch is not measured by perfection — it's measured by how fast you recover and how gracefully you communicate. Stay calm, respond fast, fix forward.
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
