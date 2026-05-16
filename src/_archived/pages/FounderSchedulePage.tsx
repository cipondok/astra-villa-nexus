import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Clock, Brain, Code, Coffee, Phone, BarChart3, BookOpen,
  Target, Zap, Sun, Sunset, Moon
} from 'lucide-react';

type BlockCategory = 'strategy' | 'deep_work' | 'break' | 'external' | 'operations' | 'learning';

interface TimeBlock {
  id: string;
  start: string;
  end: string;
  label: string;
  category: BlockCategory;
  description: string;
  tasks: string[];
  durationMinutes: number;
}

const BLOCK_CONFIG: Record<BlockCategory, { icon: React.ElementType; color: string; bg: string }> = {
  strategy:   { icon: Brain,     color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/30' },
  deep_work:  { icon: Code,      color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30' },
  break:      { icon: Coffee,    color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/50' },
  external:   { icon: Phone,     color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  operations: { icon: BarChart3, color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30' },
  learning:   { icon: BookOpen,  color: 'text-pink-500',    bg: 'bg-pink-500/10 border-pink-500/30' },
};

const SCHEDULE: TimeBlock[] = [
  {
    id: 'morning-strategy', start: '08:00', end: '09:00', label: 'Strategic Review', category: 'strategy',
    description: 'Morning priority planning and metric review.',
    tasks: ['Review overnight metrics & alerts', 'Set 3 daily priorities', 'Check deal pipeline status'], durationMinutes: 60,
  },
  {
    id: 'deep-work', start: '09:00', end: '12:00', label: 'Deep Work Block', category: 'deep_work',
    description: 'Focused product building or key growth initiatives.',
    tasks: ['Feature development & code review', 'AI scoring engine improvements', 'UX iteration on core flows', 'No meetings — phone silent'], durationMinutes: 180,
  },
  {
    id: 'break', start: '12:00', end: '13:00', label: 'Break & Reset', category: 'break',
    description: 'Mental reset and recharge.',
    tasks: ['Lunch away from screen', 'Short walk or exercise', 'Quick news scan'], durationMinutes: 60,
  },
  {
    id: 'external', start: '13:00', end: '16:00', label: 'External Execution', category: 'external',
    description: 'Agent onboarding, investor outreach, partnership discussions.',
    tasks: ['Agent onboarding calls', 'Investor outreach & follow-ups', 'Partnership discussions', 'User feedback calls'], durationMinutes: 180,
  },
  {
    id: 'operations', start: '16:00', end: '18:00', label: 'Pipeline & Ops', category: 'operations',
    description: 'Deal pipeline tracking and operational follow-ups.',
    tasks: ['Update CRM deal stages', 'Follow up stalled negotiations', 'Review listing quality', 'Admin & team coordination'], durationMinutes: 120,
  },
  {
    id: 'learning', start: '20:00', end: '21:00', label: 'Learning & Research', category: 'learning',
    description: 'Market research reflection and skill development.',
    tasks: ['Read proptech industry news', 'Study competitor moves', 'Content ideas for next publish', 'Reflect on daily execution'], durationMinutes: 60,
  },
];

const TOTAL_PRODUCTIVE = SCHEDULE.filter((b) => b.category !== 'break').reduce((s, b) => s + b.durationMinutes, 0);

function getCurrentBlock(): string | null {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const block of SCHEDULE) {
    const [sh, sm] = block.start.split(':').map(Number);
    const [eh, em] = block.end.split(':').map(Number);
    if (mins >= sh * 60 + sm && mins < eh * 60 + em) return block.id;
  }
  return null;
}

function TimeBlockCard({ block, isActive }: { block: TimeBlock; isActive: boolean }) {
  const cfg = BLOCK_CONFIG[block.category];
  const Icon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
      <Card className={`overflow-hidden transition-all ${isActive ? 'ring-2 ring-primary/50 shadow-md' : ''}`}>
        <div className="flex">
          {/* Time gutter */}
          <div className={`w-20 shrink-0 flex flex-col items-center justify-center border-r ${cfg.bg} p-3`}>
            <span className="text-xs font-bold text-foreground">{block.start}</span>
            <div className="w-px h-3 bg-border my-0.5" />
            <span className="text-[10px] text-muted-foreground">{block.end}</span>
          </div>

          <div className="flex-1 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${cfg.color}`} />
              <span className="text-sm font-semibold text-foreground">{block.label}</span>
              {isActive && <Badge variant="default" className="text-[10px] h-5 gap-1"><Zap className="w-3 h-3" />Now</Badge>}
              <Badge variant="outline" className="text-[10px] h-5 ml-auto">{block.durationMinutes}m</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{block.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {block.tasks.map((t, i) => (
                <span key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function FounderSchedulePage() {
  const activeBlock = getCurrentBlock();

  const categoryTotals = SCHEDULE.reduce<Record<string, number>>((acc, b) => {
    if (b.category !== 'break') acc[b.category] = (acc[b.category] || 0) + b.durationMinutes;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Founder Daily Schedule</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Structured time allocation for balanced product execution, deal generation, and strategic thinking.
          </p>
        </motion.div>

        {/* Summary Strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5"><Sun className="w-3.5 h-3.5 text-amber-500" /></div>
            <div className="text-xl font-bold text-foreground">{Math.round(TOTAL_PRODUCTIVE / 60)}h</div>
            <div className="text-[11px] text-muted-foreground">Productive Hours</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5"><Sunset className="w-3.5 h-3.5 text-orange-500" /></div>
            <div className="text-xl font-bold text-foreground">{SCHEDULE.length}</div>
            <div className="text-[11px] text-muted-foreground">Time Blocks</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5"><Moon className="w-3.5 h-3.5 text-purple-500" /></div>
            <div className="text-xl font-bold text-primary">{activeBlock ? 'Active' : 'Off-hours'}</div>
            <div className="text-[11px] text-muted-foreground">Status</div>
          </Card>
        </motion.div>

        {/* Time allocation breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Time Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(categoryTotals).map(([cat, mins]) => {
              const cfg = BLOCK_CONFIG[cat as BlockCategory];
              const Icon = cfg.icon;
              const pct = Math.round((mins / TOTAL_PRODUCTIVE) * 100);
              return (
                <div key={cat} className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
                  <span className="text-xs w-28 truncate text-muted-foreground capitalize">{cat.replace('_', ' ')}</span>
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-foreground w-14 text-right">{Math.round(mins / 60)}h ({pct}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Separator />

        {/* Schedule */}
        <div className="space-y-3">
          {SCHEDULE.map((block, i) => (
            <motion.div key={block.id} transition={{ delay: i * 0.04 }}>
              <TimeBlockCard block={block} isActive={block.id === activeBlock} />
            </motion.div>
          ))}
        </div>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Execution Rhythm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Maintain consistent daily execution rhythm — protect deep work mornings,
              batch external interactions in afternoons, and close each day with reflection and learning.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
