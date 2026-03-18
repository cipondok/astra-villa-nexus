import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Battery, BatteryCharging, Brain, Focus, Moon, Sun,
  Target, Flame, Clock, Wind, Sparkles, Shield, ChevronRight, Zap
} from 'lucide-react';

type EnergyZone = 'peak' | 'active' | 'recovery' | 'recharge';

interface EnergyBlock {
  id: string;
  time: string;
  label: string;
  zone: EnergyZone;
  energyLevel: number;
  tips: string[];
}

interface DailyHabit {
  id: string;
  label: string;
  category: 'energy' | 'focus' | 'recovery';
  description: string;
  checked: boolean;
}

const ZONE_CONFIG: Record<EnergyZone, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  peak:     { icon: Flame,   color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30',   label: 'Peak Performance' },
  active:   { icon: Zap,     color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30',     label: 'Active Execution' },
  recovery: { icon: Wind,    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Recovery' },
  recharge: { icon: Moon,    color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/30', label: 'Recharge' },
};

const ENERGY_CURVE: EnergyBlock[] = [
  { id: 'wake', time: '06:00–07:00', label: 'Morning Activation', zone: 'recovery', energyLevel: 55, tips: ['Hydrate immediately', 'Light movement or stretching', 'No screens for first 20 minutes'] },
  { id: 'strategy', time: '07:00–08:00', label: 'Strategic Planning', zone: 'active', energyLevel: 70, tips: ['Review priorities with fresh mind', 'Set 3 daily outcomes', 'Journal key intentions'] },
  { id: 'deep1', time: '08:00–10:30', label: 'Deep Work — Peak Block', zone: 'peak', energyLevel: 95, tips: ['Highest cognitive demand tasks', 'Phone silent, notifications off', 'Single-task only — no context switching'] },
  { id: 'micro1', time: '10:30–10:45', label: 'Micro-Recovery', zone: 'recovery', energyLevel: 65, tips: ['Stand and move', 'Look at distant objects (eye rest)', 'Breathe deeply for 2 minutes'] },
  { id: 'deep2', time: '10:45–12:00', label: 'Deep Work — Continuation', zone: 'peak', energyLevel: 85, tips: ['Continue complex problem-solving', 'Code review or architecture work', 'Protect from interruptions'] },
  { id: 'lunch', time: '12:00–13:00', label: 'Lunch & Reset', zone: 'recovery', energyLevel: 45, tips: ['Eat away from desk', 'Short walk outdoors', 'Mental detachment from work'] },
  { id: 'external', time: '13:00–15:30', label: 'External Execution', zone: 'active', energyLevel: 70, tips: ['Batch all meetings and calls', 'Agent and investor outreach', 'Use energy for social interactions'] },
  { id: 'micro2', time: '15:30–15:45', label: 'Micro-Recovery', zone: 'recovery', energyLevel: 50, tips: ['Brief meditation or breathing', 'Light snack for blood sugar', 'Reset workspace'] },
  { id: 'ops', time: '15:45–17:30', label: 'Operational Tasks', zone: 'active', energyLevel: 60, tips: ['Pipeline updates and follow-ups', 'Administrative tasks', 'Lower cognitive demand work'] },
  { id: 'wind', time: '17:30–18:00', label: 'Day Wrap-Up', zone: 'recovery', energyLevel: 40, tips: ['Log completed tasks', 'Prepare tomorrow\'s top 3', 'Clean inbox to zero'] },
  { id: 'evening', time: '20:00–21:00', label: 'Learning & Reflection', zone: 'recharge', energyLevel: 35, tips: ['Read industry content', 'Reflect on day\'s wins and learnings', 'No heavy decision-making'] },
  { id: 'sleep', time: '22:00–06:00', label: 'Sleep & Full Recharge', zone: 'recharge', energyLevel: 10, tips: ['Consistent bedtime routine', 'No screens 30 min before bed', 'Target 7–8 hours minimum'] },
];

const DEFAULT_HABITS: DailyHabit[] = [
  { id: 'h1', label: 'Set top 3 daily outcomes', category: 'focus', description: 'Define before starting any work.', checked: false },
  { id: 'h2', label: 'Deep work with zero interruptions', category: 'focus', description: 'Phone silent, no Slack during peak block.', checked: false },
  { id: 'h3', label: 'Single-task during strategy sessions', category: 'focus', description: 'No tab-switching or multitasking.', checked: false },
  { id: 'h4', label: 'Take all micro-recovery breaks', category: 'energy', description: 'Stand, move, breathe between blocks.', checked: false },
  { id: 'h5', label: 'Hydrate consistently', category: 'energy', description: 'Water every 90 minutes minimum.', checked: false },
  { id: 'h6', label: 'Lunch away from desk', category: 'recovery', description: 'Full mental detachment for 30+ minutes.', checked: false },
  { id: 'h7', label: 'Consistent sleep by 22:00', category: 'recovery', description: '7–8 hours for full cognitive restoration.', checked: false },
  { id: 'h8', label: 'Weekly reflection session', category: 'recovery', description: 'Review energy patterns and adjust schedule.', checked: false },
];

const HABIT_CATEGORY_CONFIG = {
  energy:   { label: 'Energy', icon: BatteryCharging, color: 'text-amber-500' },
  focus:    { label: 'Focus', icon: Focus, color: 'text-blue-500' },
  recovery: { label: 'Recovery', icon: Shield, color: 'text-emerald-500' },
};

const STORAGE_KEY = 'astra_energy_habits';

function loadHabits(): DailyHabit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_HABITS;
    const parsed = JSON.parse(stored);
    const today = new Date().toDateString();
    if (parsed.date !== today) return DEFAULT_HABITS;
    return parsed.habits;
  } catch { return DEFAULT_HABITS; }
}

function saveHabits(habits: DailyHabit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), habits }));
}

function getCurrentZone(): EnergyZone {
  const mins = new Date().getHours() * 60 + new Date().getMinutes();
  if (mins >= 480 && mins < 720) return 'peak';
  if (mins >= 780 && mins < 1050) return 'active';
  if (mins >= 1200 || mins < 360) return 'recharge';
  return 'recovery';
}

function EnergyBar({ block }: { block: EnergyBlock }) {
  const cfg = ZONE_CONFIG[block.zone];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-24 shrink-0 text-right">{block.time}</span>
      <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-foreground">{block.label}</span>
          <span className={`text-[10px] font-medium ${cfg.color}`}>{block.energyLevel}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${block.energyLevel}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              block.energyLevel >= 80 ? 'bg-amber-500' :
              block.energyLevel >= 50 ? 'bg-blue-500' :
              block.energyLevel >= 30 ? 'bg-emerald-500' : 'bg-purple-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function EnergyOptimizationPage() {
  const [habits, setHabits] = useState<DailyHabit[]>(loadHabits);
  const currentZone = getCurrentZone();
  const zoneCfg = ZONE_CONFIG[currentZone];
  const ZoneIcon = zoneCfg.icon;

  useEffect(() => { saveHabits(habits); }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, checked: !h.checked } : h));
  };

  const checkedCount = habits.filter((h) => h.checked).length;
  const habitScore = Math.round((checkedCount / habits.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Battery className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Energy Optimization</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sustain founder performance through structured energy management, focus discipline, and recovery habits.
          </p>
        </motion.div>

        {/* Status Strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3">
          <Card className={`p-3 text-center border ${zoneCfg.bg}`}>
            <ZoneIcon className={`w-5 h-5 mx-auto mb-0.5 ${zoneCfg.color}`} />
            <div className={`text-sm font-bold ${zoneCfg.color}`}>{zoneCfg.label}</div>
            <div className="text-[11px] text-muted-foreground">Current Zone</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{checkedCount}/{habits.length}</div>
            <div className="text-[11px] text-muted-foreground">Habits Today</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${habitScore >= 75 ? 'text-emerald-500' : habitScore >= 50 ? 'text-amber-500' : 'text-destructive'}`}>{habitScore}%</div>
            <div className="text-[11px] text-muted-foreground">Discipline Score</div>
          </Card>
        </motion.div>

        <Separator />

        {/* Energy Curve */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Daily Energy Curve
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {ENERGY_CURVE.map((block) => (
                <EnergyBar key={block.id} block={block} />
              ))}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Principles — expandable blocks */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> Block Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENERGY_CURVE.filter((b) => b.zone !== 'recharge' || b.id === 'evening').map((block) => {
              const cfg = ZONE_CONFIG[block.zone];
              const Icon = cfg.icon;
              return (
                <Card key={block.id} className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-xs font-semibold text-foreground">{block.label}</span>
                  </div>
                  {block.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground/50" />
                      {tip}
                    </div>
                  ))}
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Daily Habit Checklist */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Daily Habit Checklist
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Check off habits as you complete them — resets daily.</p>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Discipline Score</span><span>{habitScore}%</span>
          </div>
          <Progress value={habitScore} className="h-2 mb-4" />

          <div className="space-y-2">
            {habits.map((habit) => {
              const catCfg = HABIT_CATEGORY_CONFIG[habit.category];
              const CatIcon = catCfg.icon;
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    habit.checked ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/50 hover:border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    habit.checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {habit.checked && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${habit.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {habit.label}
                    </span>
                    <p className="text-[11px] text-muted-foreground">{habit.description}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${catCfg.color}`}>
                    <CatIcon className="w-3 h-3 mr-0.5" />{catCfg.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Endurance Principle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sustain mental clarity and execution endurance — protect peak hours for deep work,
              enforce micro-recoveries, and maintain sleep consistency as the non-negotiable foundation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
