import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Compass, Globe, Cpu, TrendingUp, Target, Star, Eye,
  ChevronRight, Sparkles, Calendar, BookOpen, CheckCircle2
} from 'lucide-react';

type Pillar = 'market' | 'technology' | 'legacy';

interface VisionPillar {
  id: Pillar;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  aspiration: string;
  description: string;
  milestones: { label: string; horizon: string }[];
}

interface AlignmentCheck {
  id: string;
  question: string;
  pillar: Pillar;
  checked: boolean;
}

const PILLARS: VisionPillar[] = [
  {
    id: 'market', label: 'Market Transformation', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30',
    aspiration: 'Simplify intelligent property investment decisions for every Indonesian investor.',
    description: 'Replace fragmented, opaque property discovery with a data-driven marketplace that empowers confident investment choices.',
    milestones: [
      { label: 'Launch AI-scored marketplace MVP', horizon: 'Month 3' },
      { label: 'Achieve 100+ active investor users', horizon: 'Month 6' },
      { label: 'Become default discovery platform in 3 cities', horizon: 'Year 1' },
      { label: 'Process 1,000+ transactions annually', horizon: 'Year 2' },
    ],
  },
  {
    id: 'technology', label: 'Technology Leadership', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30',
    aspiration: 'Build the most trusted AI-driven investment intelligence infrastructure in Southeast Asia.',
    description: 'Create proprietary scoring, prediction, and matching engines that compound in accuracy with every user interaction.',
    milestones: [
      { label: 'Deploy Opportunity Scoring engine', horizon: 'Month 2' },
      { label: 'Launch autonomous deal discovery', horizon: 'Month 6' },
      { label: 'Achieve 90%+ AI confidence scores', horizon: 'Year 1' },
      { label: 'License intelligence API to institutions', horizon: 'Year 3' },
    ],
  },
  {
    id: 'legacy', label: 'Growth Legacy', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30',
    aspiration: 'Create a scalable platform influencing regional real estate transparency and accessibility.',
    description: 'Build institutional-grade infrastructure that raises the standard for property investment across emerging markets.',
    milestones: [
      { label: 'Establish data transparency standard', horizon: 'Year 1' },
      { label: 'Expand to 10+ Indonesian cities', horizon: 'Year 2' },
      { label: 'Enter first ASEAN cross-border market', horizon: 'Year 3' },
      { label: 'Achieve "Bloomberg for Property" positioning', horizon: 'Year 5' },
    ],
  },
];

const ALIGNMENT_CHECKS: Omit<AlignmentCheck, 'checked'>[] = [
  { id: 'a1', question: 'Does this quarter\'s roadmap advance marketplace simplification?', pillar: 'market' },
  { id: 'a2', question: 'Are we prioritizing features that build investor trust?', pillar: 'market' },
  { id: 'a3', question: 'Is our AI engine accuracy improving measurably?', pillar: 'technology' },
  { id: 'a4', question: 'Are we building data moats that compound over time?', pillar: 'technology' },
  { id: 'a5', question: 'Are our decisions creating long-term platform value?', pillar: 'legacy' },
  { id: 'a6', question: 'Is our architecture designed for multi-market scaling?', pillar: 'legacy' },
];

const STORAGE_KEY = 'astra_vision_framework';

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return { checks: {}, reflection: '', lastReflection: '' };
    return JSON.parse(s);
  } catch { return { checks: {}, reflection: '', lastReflection: '' }; }
}

function saveState(state: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function VisionFrameworkPage() {
  const [state, setState] = useState(loadState);
  const checks = state.checks as Record<string, boolean>;
  const [reflection, setReflection] = useState(state.reflection || '');

  useEffect(() => { saveState({ ...state, reflection }); }, [state, reflection]);

  const toggleCheck = (id: string) => {
    const updated = { ...state, checks: { ...checks, [id]: !checks[id] } };
    setState(updated);
    saveState(updated);
  };

  const saveReflection = () => {
    const updated = { ...state, reflection, lastReflection: new Date().toISOString() };
    setState(updated);
    saveState(updated);
  };

  const checkedCount = ALIGNMENT_CHECKS.filter((c) => checks[c.id]).length;
  const alignmentScore = Math.round((checkedCount / ALIGNMENT_CHECKS.length) * 100);

  const lastReflectionDate = state.lastReflection ? new Date(state.lastReflection).toLocaleDateString() : 'Never';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Vision Framework</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Strategic clarity on long-term platform impact — guiding every decision toward meaningful mission alignment.
          </p>
        </motion.div>

        {/* North Star */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 text-center">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <h2 className="text-lg font-bold text-foreground mb-1">North Star</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Become the intelligence layer that transforms how Southeast Asia discovers,
                evaluates, and invests in property — making every decision data-driven,
                transparent, and confident.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Strip */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${alignmentScore >= 80 ? 'text-emerald-500' : alignmentScore >= 50 ? 'text-amber-500' : 'text-destructive'}`}>{alignmentScore}%</div>
            <div className="text-[11px] text-muted-foreground">Alignment Score</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{checkedCount}/{ALIGNMENT_CHECKS.length}</div>
            <div className="text-[11px] text-muted-foreground">Checks Passed</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-sm font-bold text-foreground">{lastReflectionDate}</div>
            <div className="text-[11px] text-muted-foreground">Last Reflection</div>
          </Card>
        </div>

        <Separator />

        {/* Vision Pillars */}
        <div className="space-y-4">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div key={pillar.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md border ${pillar.bg}`}>
                        <Icon className={`w-4 h-4 ${pillar.color}`} />
                      </div>
                      <CardTitle className="text-base">{pillar.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star className={`w-3.5 h-3.5 ${pillar.color}`} />
                        <span className="text-xs font-semibold text-foreground">Aspiration</span>
                      </div>
                      <p className="text-sm text-foreground italic">{pillar.aspiration}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{pillar.description}</p>
                    <div>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Milestone Path</span>
                      <div className="mt-1.5 space-y-1.5">
                        {pillar.milestones.map((m, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${pillar.color.replace('text-', 'bg-')}`} />
                            <span className="text-xs text-foreground flex-1">{m.label}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{m.horizon}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Separator />

        {/* Alignment Check */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" /> Quarterly Alignment Check
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Review these questions each quarter to ensure roadmap-vision alignment.</p>
          <Progress value={alignmentScore} className="h-2 mb-4" />

          <div className="space-y-2">
            {ALIGNMENT_CHECKS.map((check) => {
              const pillar = PILLARS.find((p) => p.id === check.pillar)!;
              return (
                <button
                  key={check.id}
                  onClick={() => toggleCheck(check.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    checks[check.id] ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/50 hover:border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    checks[check.id] ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {checks[check.id] && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm flex-1 ${checks[check.id] ? 'text-muted-foreground' : 'text-foreground'}`}>{check.question}</span>
                  <Badge variant="outline" className={`text-[10px] h-5 ${pillar.color}`}>{pillar.label}</Badge>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Reflection Journal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Vision Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How does this quarter's work connect to the long-term mission? What needs realignment?"
              className="text-sm min-h-[100px]"
            />
            <button
              onClick={saveReflection}
              disabled={!reflection.trim()}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              Save Reflection
            </button>
          </CardContent>
        </Card>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Mission Anchor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every sprint, feature, and partnership must trace back to the North Star.
              If it doesn't simplify investment decisions, strengthen AI intelligence, or scale transparency — question its priority.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
