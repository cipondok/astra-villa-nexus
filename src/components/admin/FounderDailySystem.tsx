
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sun, Brain, Handshake, Cpu, TrendingUp, Megaphone,
  Moon, Coffee, Zap, Target, BarChart3, CheckCircle,
  Clock, Shield, Heart, AlertTriangle
} from 'lucide-react';

interface TaskItem {
  id: string;
  task: string;
  duration: string;
  tool: string;
  outcome: string;
}

interface DailyBlock {
  key: string;
  name: string;
  time: string;
  duration: string;
  icon: typeof Sun;
  color: string;
  energy: 'peak' | 'high' | 'medium' | 'low';
  principle: string;
  tasks: TaskItem[];
}

const dailyBlocks: DailyBlock[] = [
  {
    key: 'morning',
    name: 'Morning Strategic Focus',
    time: '06:30 – 09:00',
    duration: '2.5h',
    icon: Sun,
    color: 'text-amber-500',
    energy: 'peak',
    principle: 'No meetings, no Slack. Deep thinking only. This is where 80% of strategic value is created.',
    tasks: [
      { id: 'm1', task: 'Review overnight KPIs (traffic, listings, inquiries, agent activity)', duration: '15 min', tool: 'Admin Dashboard → Overview', outcome: 'Anomaly flags identified' },
      { id: 'm2', task: 'Set 3 "Must-Win" priorities for the day', duration: '10 min', tool: 'Journal / Notion', outcome: 'Written top-3 list' },
      { id: 'm3', task: 'Growth bottleneck identification — what is slowing marketplace velocity?', duration: '30 min', tool: 'Analytics + Supply Dashboard', outcome: '1 bottleneck named + action decided' },
      { id: 'm4', task: 'Strategic thinking: roadmap decisions, market positioning, competitive response', duration: '45 min', tool: 'Deep work (no screens if possible)', outcome: 'Decision or thesis documented' },
      { id: 'm5', task: 'Fundraising prep — refine pitch element, update data room, or draft investor update', duration: '30 min', tool: 'Pitch Deck / Financial Model', outcome: 'One fundraising asset improved' },
      { id: 'm6', task: 'Inbox triage — respond only to urgent/high-leverage items', duration: '15 min', tool: 'Email / WhatsApp', outcome: 'Inbox at zero blockers' },
    ],
  },
  {
    key: 'supply',
    name: 'Supply & Partnership Action',
    time: '09:00 – 11:30',
    duration: '2.5h',
    icon: Handshake,
    color: 'text-blue-500',
    energy: 'high',
    principle: 'Relationship work while energy is high. Calls, outreach, and face-to-face before the afternoon dip.',
    tasks: [
      { id: 's1', task: 'Agent outreach calls — new prospects + follow-ups with warm leads', duration: '45 min', tool: 'Phone / WhatsApp / CRM', outcome: '3-5 agent conversations' },
      { id: 's2', task: 'Developer partnership conversations — project listing sourcing', duration: '30 min', tool: 'Scheduled calls / meetings', outcome: '1 developer engaged' },
      { id: 's3', task: 'Listing quality spot-check — review 5-10 newest listings for standards', duration: '15 min', tool: 'Admin → Listing Management', outcome: 'Quality issues flagged' },
      { id: 's4', task: 'Ecosystem networking — reply to partnership inquiries, attend community chats', duration: '20 min', tool: 'WhatsApp Groups / LinkedIn', outcome: 'Network maintained' },
      { id: 's5', task: 'Team check-in — async standup review or quick sync with supply/support team', duration: '15 min', tool: 'Slack / Google Meet', outcome: 'Team blockers cleared' },
      { id: 's6', task: 'Update pipeline tracker — log conversations, next steps, follow-up dates', duration: '15 min', tool: 'CRM / Spreadsheet', outcome: 'Pipeline current' },
    ],
  },
  {
    key: 'product',
    name: 'Product & Intelligence Review',
    time: '11:30 – 13:00',
    duration: '1.5h',
    icon: Cpu,
    color: 'text-purple-500',
    energy: 'high',
    principle: 'Evaluate what the AI and platform are telling you. Let data inform your afternoon decisions.',
    tasks: [
      { id: 'p1', task: 'AI system health check — valuation accuracy, recommendation CTR, search quality', duration: '15 min', tool: 'Admin → AI Health Monitor', outcome: 'AI status confirmed' },
      { id: 'p2', task: 'User feedback review — support tickets, feature requests, NPS signals', duration: '20 min', tool: 'Support Center / Feedback Tab', outcome: 'Top 2 user pain points noted' },
      { id: 'p3', task: 'Feature progress check — what shipped yesterday? what is blocked today?', duration: '15 min', tool: 'Task tracker / GitHub', outcome: 'Shipping status clear' },
      { id: 'p4', task: 'Admin analytics observation — conversion funnels, user journeys, drop-off points', duration: '20 min', tool: 'Analytics Dashboard', outcome: 'Optimization opportunity identified' },
      { id: 'p5', task: 'Feature refinement decisions — approve, prioritize, or park feature requests', duration: '20 min', tool: 'Product backlog', outcome: '2-3 decisions made' },
    ],
  },
  {
    key: 'lunch',
    name: 'Recovery & Recharge',
    time: '13:00 – 14:00',
    duration: '1h',
    icon: Coffee,
    color: 'text-red-400',
    energy: 'low',
    principle: 'Complete disconnect. No screens. Eat properly. This break protects afternoon productivity.',
    tasks: [
      { id: 'l1', task: 'Lunch away from desk — no working meals', duration: '30 min', tool: 'Kitchen / Restaurant', outcome: 'Physical nourishment' },
      { id: 'l2', task: 'Light walk or stretching', duration: '15 min', tool: 'Outside', outcome: 'Mental reset' },
      { id: 'l3', task: 'Optional: industry podcast or audiobook (passive learning)', duration: '15 min', tool: 'Podcast app', outcome: 'Passive insight absorption' },
    ],
  },
  {
    key: 'growth',
    name: 'Growth Execution',
    time: '14:00 – 16:00',
    duration: '2h',
    icon: TrendingUp,
    color: 'text-green-500',
    energy: 'medium',
    principle: 'Review and adjust growth levers. Content, SEO, and marketing experiments need daily attention.',
    tasks: [
      { id: 'g1', task: 'SEO rollout supervision — check indexing status, new pages published, ranking changes', duration: '20 min', tool: 'Search Console / SEO Dashboard', outcome: 'Indexing progress confirmed' },
      { id: 'g2', task: 'Content publishing review — approve or edit scheduled blog posts, social content', duration: '20 min', tool: 'Content Calendar / CMS', outcome: 'Content pipeline flowing' },
      { id: 'g3', task: 'Marketing experiment tracking — paid ad performance, A/B test results, CAC trends', duration: '20 min', tool: 'Google Ads / Meta Ads / Analytics', outcome: 'Experiment data logged' },
      { id: 'g4', task: 'Social media engagement — respond to comments, engage with community', duration: '15 min', tool: 'TikTok / Instagram / LinkedIn', outcome: 'Community engaged' },
      { id: 'g5', task: 'Traffic analysis — daily organic trend, referral sources, top landing pages', duration: '15 min', tool: 'GA4 / Admin Analytics', outcome: 'Traffic health confirmed' },
      { id: 'g6', task: 'Growth action decision — identify 1 thing to double down on or cut tomorrow', duration: '15 min', tool: 'Growth log', outcome: 'One growth lever adjusted' },
    ],
  },
  {
    key: 'visibility',
    name: 'Visibility & Learning',
    time: '16:00 – 17:00',
    duration: '1h',
    icon: Megaphone,
    color: 'text-pink-500',
    energy: 'low',
    principle: 'Wind down with outward-facing and learning activities. Low-energy but high-leverage for long-term brand.',
    tasks: [
      { id: 'v1', task: 'Founder content creation — write or schedule 1 LinkedIn post or tweet', duration: '20 min', tool: 'LinkedIn / Twitter drafts', outcome: '1 post drafted or published' },
      { id: 'v2', task: 'Industry research — read 2-3 proptech/AI/marketplace articles', duration: '15 min', tool: 'Feedly / Twitter lists / newsletters', outcome: 'Market awareness maintained' },
      { id: 'v3', task: 'Competitive analysis — check 1 competitor for new features, content, or positioning', duration: '10 min', tool: 'Competitor websites', outcome: 'Competitive intel updated' },
      { id: 'v4', task: 'Learning investment — 1 chapter, 1 video, or 1 case study on relevant topic', duration: '15 min', tool: 'Books / YouTube / courses', outcome: 'Skill growth' },
    ],
  },
  {
    key: 'close',
    name: 'Day Close & Reset',
    time: '17:00 – 17:30',
    duration: '30m',
    icon: Moon,
    color: 'text-muted-foreground',
    energy: 'low',
    principle: 'Capture everything. Tomorrow\'s you will thank today\'s you for clean documentation.',
    tasks: [
      { id: 'c1', task: 'Daily journal — decisions made, lessons learned, wins and frustrations', duration: '10 min', tool: 'Journal / Notion', outcome: 'Day documented' },
      { id: 'c2', task: 'Tomorrow\'s top 3 — pre-set priorities for morning strategic block', duration: '5 min', tool: 'Sticky note / task app', outcome: 'Morning clarity prepared' },
      { id: 'c3', task: 'Calendar audit — confirm tomorrow\'s meetings, prep any needed materials', duration: '5 min', tool: 'Google Calendar', outcome: 'Tomorrow scheduled' },
      { id: 'c4', task: 'Shutdown ritual — close all tabs, silence notifications, mentally disengage', duration: '5 min', tool: 'Brain', outcome: 'Work-life boundary set' },
    ],
  },
];

const energyConfig = {
  peak: { label: 'Peak', color: 'bg-green-500' },
  high: { label: 'High', color: 'bg-blue-500' },
  medium: { label: 'Medium', color: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-muted-foreground' },
};

const FounderDailySystem = () => {
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [expandedBlock, setExpandedBlock] = useState<string | null>('morning');

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalTasks = dailyBlocks.reduce((s, b) => s + b.tasks.length, 0);
  const completedTasks = checkedTasks.size;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Founder Daily Execution System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          7 time-blocked phases — {totalTasks} tasks — ~11 hours of structured execution
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Today's Execution</span>
            </div>
            <span className="text-sm font-bold text-foreground">{completedTasks}/{totalTasks}</span>
          </div>
          <Progress value={completionPct} className="h-2.5 mb-1" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{completionPct}% complete</span>
            <span className="text-[10px] text-muted-foreground">
              {completionPct === 100 ? '🎯 Perfect execution day!' :
               completionPct >= 75 ? '🔥 Strong progress' :
               completionPct >= 50 ? '⚡ Halfway there' : '☀️ Day in progress'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Time Block Summary */}
      <div className="grid grid-cols-7 gap-1.5">
        {dailyBlocks.map((block) => {
          const blockCompleted = block.tasks.filter(t => checkedTasks.has(t.id)).length;
          const blockPct = Math.round((blockCompleted / block.tasks.length) * 100);
          return (
            <button
              key={block.key}
              onClick={() => setExpandedBlock(expandedBlock === block.key ? null : block.key)}
              className={`rounded-lg p-2 text-center transition-all border ${
                expandedBlock === block.key ? 'border-primary bg-primary/10' :
                blockPct === 100 ? 'border-green-500/30 bg-green-500/5' :
                'border-border/50 bg-card/40 hover:bg-muted/50'
              }`}
            >
              <block.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${block.color}`} />
              <p className="text-[9px] font-medium text-foreground truncate">{block.name.split(' ')[0]}</p>
              <p className="text-[8px] text-muted-foreground">{block.time.split(' – ')[0]}</p>
              <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${energyConfig[block.energy].color}`} />
            </button>
          );
        })}
      </div>

      {/* Expanded Block Detail */}
      {expandedBlock && (() => {
        const block = dailyBlocks.find(b => b.key === expandedBlock);
        if (!block) return null;
        const blockCompleted = block.tasks.filter(t => checkedTasks.has(t.id)).length;
        const blockPct = Math.round((blockCompleted / block.tasks.length) * 100);

        return (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <block.icon className={`h-5 w-5 ${block.color}`} />
                <div className="flex-1">
                  <CardTitle className="text-sm">{block.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{block.time}</span>
                    <Badge variant="outline" className="text-[9px]">{block.duration}</Badge>
                    <div className={`w-2 h-2 rounded-full ${energyConfig[block.energy].color}`} />
                    <span className="text-[9px] text-muted-foreground">{energyConfig[block.energy].label} energy</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{blockCompleted}/{block.tasks.length}</span>
                  <Progress value={blockPct} className="h-1 w-16 mt-0.5" />
                </div>
              </div>
              <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-primary flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {block.principle}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {block.tasks.map((task) => {
                const checked = checkedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 rounded-lg p-2.5 transition-all border ${
                      checked ? 'border-green-500/20 bg-green-500/5' : 'border-border/30 bg-card/30'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-medium ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {task.duration}
                        </span>
                        <span className="text-[9px] text-primary">{task.tool}</span>
                        <span className="text-[9px] text-muted-foreground">→ {task.outcome}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Daily Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            title: 'Energy Architecture',
            icon: Zap,
            rules: [
              'Strategic thinking at peak energy (06:30-09:00)',
              'People work during high energy (09:00-11:30)',
              'Analytical work in mid-morning (11:30-13:00)',
              'Execution and review post-lunch (14:00-16:00)',
              'Creative and passive work at day end (16:00-17:00)',
            ],
          },
          {
            title: 'Non-Negotiable Boundaries',
            icon: Shield,
            rules: [
              'No meetings before 09:00 (deep work shield)',
              'No working through lunch (burnout prevention)',
              'No new tasks after 17:00 (tomorrow\'s problem)',
              'Phone on DND during morning block',
              'Max 2 scheduled calls before noon',
            ],
          },
          {
            title: 'Daily Accountability',
            icon: Target,
            rules: [
              'Top 3 must-wins set before 07:00',
              'Growth bottleneck named every single day',
              '1 partnership action taken daily',
              '1 founder content piece drafted daily',
              'End-of-day journal with decisions + lessons',
            ],
          },
        ].map((section) => (
          <Card key={section.title} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <section.icon className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold text-foreground">{section.title}</p>
              </div>
              <ul className="space-y-1">
                {section.rules.map((rule, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Day Energy Map */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Daily Energy Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-20">
            {dailyBlocks.map((block) => {
              const heightMap = { peak: 100, high: 80, medium: 55, low: 30 };
              return (
                <div key={block.key} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-muted-foreground">{energyConfig[block.energy].label}</span>
                  <div
                    className={`w-full rounded-t ${energyConfig[block.energy].color} opacity-60 transition-all`}
                    style={{ height: `${heightMap[block.energy]}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground">{block.time.split(' ')[0]}</span>
                  <block.icon className={`h-3 w-3 ${block.color}`} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderDailySystem;
