import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Crosshair, Flame, ArrowUpRight, ArrowRight, ArrowDownRight,
  HelpCircle, CheckCircle2, XCircle, Target, Zap, Shield, ChevronRight
} from 'lucide-react';

type Tier = 'high' | 'medium' | 'low';
type FilterAnswer = 'yes' | 'no' | null;

interface PriorityItem {
  id: string;
  label: string;
  tier: Tier;
  description: string;
}

const TIER_CONFIG: Record<Tier, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  high:   { label: 'High Priority',   icon: Flame,          color: 'text-destructive',       bg: 'bg-destructive/10 border-destructive/30' },
  medium: { label: 'Medium Priority', icon: ArrowRight,     color: 'text-amber-500',         bg: 'bg-amber-500/10 border-amber-500/30' },
  low:    { label: 'Low Priority',    icon: ArrowDownRight, color: 'text-muted-foreground',  bg: 'bg-muted/30 border-border/50' },
};

const FILTER_QUESTIONS = [
  { id: 'deal_flow', question: 'Will this increase deal flow velocity?', weight: 40 },
  { id: 'trust', question: 'Does this improve investor trust or credibility?', weight: 35 },
  { id: 'revenue', question: 'Can this accelerate revenue realization?', weight: 25 },
];

const PRESET_ITEMS: PriorityItem[] = [
  { id: 'p1', label: 'Agent onboarding outreach', tier: 'high', description: 'Directly grows supply and deal pipeline capacity.' },
  { id: 'p2', label: 'Investor conversion follow-ups', tier: 'high', description: 'Moves active leads toward closed transactions.' },
  { id: 'p3', label: 'Listing quality enforcement', tier: 'high', description: 'Builds trust through accurate, high-quality inventory.' },
  { id: 'p4', label: 'Deal negotiation support', tier: 'high', description: 'Accelerates transaction completion and first revenue.' },
  { id: 'p5', label: 'Search UX optimization', tier: 'medium', description: 'Improves discovery conversion but indirect revenue impact.' },
  { id: 'p6', label: 'AI scoring refinement', tier: 'medium', description: 'Enhances differentiation but needs existing deal flow.' },
  { id: 'p7', label: 'Content marketing experiments', tier: 'medium', description: 'Builds awareness funnel but longer payback cycle.' },
  { id: 'p8', label: 'Referral program iteration', tier: 'medium', description: 'Growth multiplier but requires active user base first.' },
  { id: 'p9', label: 'Dashboard visual polish', tier: 'low', description: 'Nice-to-have but no direct impact on transactions.' },
  { id: 'p10', label: 'Community forum features', tier: 'low', description: 'Long-term engagement play, not urgent for traction.' },
  { id: 'p11', label: 'Profile customization options', tier: 'low', description: 'Minimal impact on core marketplace metrics.' },
  { id: 'p12', label: 'Advanced analytics exports', tier: 'low', description: 'Power-user feature, premature before scale.' },
];

function scoreTier(answers: FilterAnswer[]): { tier: Tier; score: number } {
  let total = 0;
  let maxPossible = 0;
  answers.forEach((a, i) => {
    maxPossible += FILTER_QUESTIONS[i].weight;
    if (a === 'yes') total += FILTER_QUESTIONS[i].weight;
  });
  const score = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
  if (score >= 70) return { tier: 'high', score };
  if (score >= 35) return { tier: 'medium', score };
  return { tier: 'low', score };
}

function FilterButton({ value, current, onClick, icon: Icon, label }: { value: FilterAnswer; current: FilterAnswer; onClick: () => void; icon: React.ElementType; label: string }) {
  const active = value === current;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
        active
          ? value === 'yes' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-destructive/10 border-destructive/30 text-destructive'
          : 'bg-card border-border/50 text-muted-foreground hover:border-border'
      }`}
    >
      <Icon className="w-3 h-3" />{label}
    </button>
  );
}

export default function DecisionPrioritizationPage() {
  const [answers, setAnswers] = useState<FilterAnswer[]>([null, null, null]);
  const [customDecision, setCustomDecision] = useState('');

  const setAnswer = (idx: number, val: FilterAnswer) => {
    setAnswers((prev) => { const n = [...prev]; n[idx] = n[idx] === val ? null : val; return n; });
  };

  const hasAnswers = answers.some((a) => a !== null);
  const result = hasAnswers ? scoreTier(answers) : null;

  const grouped: Record<Tier, PriorityItem[]> = { high: [], medium: [], low: [] };
  PRESET_ITEMS.forEach((item) => grouped[item.tier].push(item));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Crosshair className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Decision Prioritization</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Filter every decision through impact questions to focus founder energy on highest-leverage actions.
          </p>
        </motion.div>

        {/* Priority Filter Tool */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Priority Filter — Score Any Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Describe a decision or initiative..."
              value={customDecision}
              onChange={(e) => setCustomDecision(e.target.value)}
              className="text-sm"
            />
            <div className="space-y-3">
              {FILTER_QUESTIONS.map((q, i) => (
                <div key={q.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{q.question}</span>
                    <Badge variant="outline" className="text-[10px] h-5">{q.weight}% weight</Badge>
                  </div>
                  <div className="flex gap-2">
                    <FilterButton value="yes" current={answers[i]} onClick={() => setAnswer(i, 'yes')} icon={CheckCircle2} label="Yes" />
                    <FilterButton value="no" current={answers[i]} onClick={() => setAnswer(i, 'no')} icon={XCircle} label="No" />
                  </div>
                </div>
              ))}
            </div>

            {result && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg border ${TIER_CONFIG[result.tier].bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  {React.createElement(TIER_CONFIG[result.tier].icon, { className: `w-4 h-4 ${TIER_CONFIG[result.tier].color}` })}
                  <span className={`text-sm font-bold ${TIER_CONFIG[result.tier].color}`}>{TIER_CONFIG[result.tier].label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Impact Score: {result.score}/100</span>
                </div>
                <Progress value={result.score} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {result.tier === 'high' && 'Execute immediately — this directly drives marketplace traction.'}
                  {result.tier === 'medium' && 'Schedule for this week — valuable but not urgent for survival.'}
                  {result.tier === 'low' && 'Defer or delegate — minimal impact on core growth metrics.'}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Decision Tiers */}
        <div className="space-y-4">
          {(['high', 'medium', 'low'] as Tier[]).map((tier) => {
            const cfg = TIER_CONFIG[tier];
            const Icon = cfg.icon;
            const items = grouped[tier];
            return (
              <motion.div key={tier} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <h2 className="text-base font-semibold text-foreground">{cfg.label}</h2>
                  <Badge variant="outline" className={`text-[10px] h-5 ${cfg.color}`}>{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Card key={item.id} className={`p-3 border ${tier === 'high' ? cfg.bg : 'border-border/50'}`}>
                      <div className="flex items-start gap-2">
                        <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
                        <div>
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Focus Principle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every decision must pass the triple filter: deal flow velocity, investor trust, and revenue acceleration.
              If it scores below 35% — defer ruthlessly and protect founder energy for leverage points.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
