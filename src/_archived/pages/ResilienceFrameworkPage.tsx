import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart, Eye, Dumbbell, Wind, Smile, Star, Shield, BookOpen,
  ChevronRight, Target, Sun, Flame, Trophy
} from 'lucide-react';

type PracticeCategory = 'perspective' | 'strength' | 'regulation';

interface ResilienceHabit {
  id: string;
  label: string;
  category: PracticeCategory;
  checked: boolean;
}

interface JournalEntry {
  date: string;
  win: string;
  obstacle: string;
  learning: string;
  mood: number;
}

const CAT_CONFIG: Record<PracticeCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  perspective: { label: 'Perspective', icon: Eye,      color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/30' },
  strength:    { label: 'Strength',    icon: Dumbbell, color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30' },
  regulation:  { label: 'Regulation',  icon: Wind,     color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
};

const DAILY_HABITS: Omit<ResilienceHabit, 'checked'>[] = [
  { id: 'r1', label: 'Reconnect with long-term platform vision', category: 'perspective' },
  { id: 'r2', label: 'Reframe one setback as a learning signal', category: 'perspective' },
  { id: 'r3', label: 'Reflect on one progress milestone', category: 'strength' },
  { id: 'r4', label: 'Celebrate one small execution win', category: 'strength' },
  { id: 'r5', label: 'Complete a physical activity session', category: 'regulation' },
  { id: 'r6', label: 'Practice 5 minutes of mindfulness', category: 'regulation' },
  { id: 'r7', label: 'Take structured downtime (no work)', category: 'regulation' },
];

const AFFIRMATIONS = [
  'Building something meaningful takes time — stay the course.',
  'Every rejection refines the product closer to market fit.',
  'Slow progress is still progress. Compounding wins.',
  'The hardest days build the strongest founders.',
  'Uncertainty is the price of building something new.',
  'Focus on what you can control today.',
  'Your persistence is your greatest competitive advantage.',
];

const MOODS = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 2, emoji: '😐', label: 'Neutral' },
  { value: 3, emoji: '🙂', label: 'Steady' },
  { value: 4, emoji: '😊', label: 'Strong' },
  { value: 5, emoji: '🔥', label: 'On Fire' },
];

const HABITS_KEY = 'astra_resilience_habits';
const JOURNAL_KEY = 'astra_resilience_journal';

function loadHabits(): ResilienceHabit[] {
  try {
    const s = localStorage.getItem(HABITS_KEY);
    if (!s) return DAILY_HABITS.map((h) => ({ ...h, checked: false }));
    const p = JSON.parse(s);
    if (p.date !== new Date().toDateString()) return DAILY_HABITS.map((h) => ({ ...h, checked: false }));
    return p.habits;
  } catch { return DAILY_HABITS.map((h) => ({ ...h, checked: false })); }
}

function saveHabits(habits: ResilienceHabit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify({ date: new Date().toDateString(), habits }));
}

function loadJournal(): JournalEntry[] {
  try { return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); } catch { return []; }
}

function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries.slice(-30)));
}

export default function ResilienceFrameworkPage() {
  const [habits, setHabits] = useState<ResilienceHabit[]>(loadHabits);
  const [journal, setJournal] = useState<JournalEntry[]>(loadJournal);
  const [win, setWin] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [learning, setLearning] = useState('');
  const [mood, setMood] = useState<number>(3);

  useEffect(() => { saveHabits(habits); }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, checked: !h.checked } : h));
  };

  const saveEntry = () => {
    if (!win && !obstacle && !learning) return;
    const entry: JournalEntry = { date: new Date().toISOString(), win, obstacle, learning, mood };
    const updated = [...journal, entry];
    setJournal(updated);
    saveJournal(updated);
    setWin(''); setObstacle(''); setLearning('');
  };

  const checkedCount = habits.filter((h) => h.checked).length;
  const resilienceScore = Math.round((checkedCount / habits.length) * 100);
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  const recentMoods = journal.slice(-7);
  const avgMood = recentMoods.length > 0 ? (recentMoods.reduce((s, e) => s + e.mood, 0) / recentMoods.length).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Founder Resilience</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Maintain motivation and decision clarity through uncertainty and pressure.
          </p>
        </motion.div>

        {/* Affirmation Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Sun className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm font-medium text-foreground italic">"{affirmation}"</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Strip */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${resilienceScore >= 70 ? 'text-emerald-500' : resilienceScore >= 40 ? 'text-amber-500' : 'text-destructive'}`}>{resilienceScore}%</div>
            <div className="text-[11px] text-muted-foreground">Resilience Score</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{checkedCount}/{habits.length}</div>
            <div className="text-[11px] text-muted-foreground">Habits Today</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{avgMood}</div>
            <div className="text-[11px] text-muted-foreground">Avg Mood (7d)</div>
          </Card>
        </div>

        <Separator />

        {/* Daily Resilience Habits */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Daily Practices
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Check off as completed — resets daily.</p>
          <Progress value={resilienceScore} className="h-2 mb-4" />

          <div className="space-y-2">
            {habits.map((habit) => {
              const cat = CAT_CONFIG[habit.category];
              const CatIcon = cat.icon;
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
                  <span className={`text-sm flex-1 ${habit.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{habit.label}</span>
                  <Badge variant="outline" className={`text-[10px] h-5 ${cat.color}`}>
                    <CatIcon className="w-3 h-3 mr-0.5" />{cat.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Reflection Journal */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Daily Reflection
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {/* Mood selector */}
              <div>
                <span className="text-xs text-muted-foreground mb-1.5 block">How are you feeling?</span>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                        mood === m.value ? 'bg-primary/10 border-primary/40' : 'bg-card border-border/50 hover:border-border'
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Trophy className="w-3 h-3" /> Today's Win</label>
                <Textarea value={win} onChange={(e) => setWin(e.target.value)} placeholder="What went well today?" className="text-sm min-h-[60px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Flame className="w-3 h-3" /> Obstacle Faced</label>
                <Textarea value={obstacle} onChange={(e) => setObstacle(e.target.value)} placeholder="What was challenging?" className="text-sm min-h-[60px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Star className="w-3 h-3" /> Learning Signal</label>
                <Textarea value={learning} onChange={(e) => setLearning(e.target.value)} placeholder="What did you learn from it?" className="text-sm min-h-[60px]" />
              </div>
              <button
                onClick={saveEntry}
                disabled={!win && !obstacle && !learning}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
              >
                Save Reflection
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        {journal.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" /> Recent Reflections
              </h2>
              <div className="space-y-2">
                {journal.slice(-5).reverse().map((entry, i) => {
                  const moodInfo = MOODS.find((m) => m.value === entry.mood) || MOODS[2];
                  return (
                    <Card key={i} className="p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{moodInfo.emoji}</span>
                        <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      {entry.win && <p className="text-xs text-foreground"><ChevronRight className="w-3 h-3 inline text-emerald-500" /> {entry.win}</p>}
                      {entry.obstacle && <p className="text-xs text-muted-foreground"><ChevronRight className="w-3 h-3 inline text-amber-500" /> {entry.obstacle}</p>}
                      {entry.learning && <p className="text-xs text-muted-foreground"><ChevronRight className="w-3 h-3 inline text-purple-500" /> {entry.learning}</p>}
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Endurance Mindset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sustain founder confidence and persistence through startup volatility —
              treat every setback as data, protect recovery time, and compound small wins into momentum.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
