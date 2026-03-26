import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield, BookOpen, MessageSquare, Brain, Target, ChevronRight,
  Users, Handshake, CheckCircle2, AlertTriangle, Lightbulb, Crosshair, Zap
} from 'lucide-react';

type NegotiationType = 'investor' | 'developer' | 'agent';
type PrepPhase = 'research' | 'communication' | 'psychology';

interface PrepCheckItem {
  id: string;
  label: string;
  phase: PrepPhase;
  forTypes: NegotiationType[];
}

interface NegotiationPlaybook {
  type: NegotiationType;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  priorities: string[];
  doList: string[];
  dontList: string[];
  powerPhrases: string[];
}

const PHASE_CONFIG: Record<PrepPhase, { label: string; icon: React.ElementType; color: string }> = {
  research:      { label: 'Preparation',   icon: BookOpen,      color: 'text-blue-500' },
  communication: { label: 'Communication', icon: MessageSquare, color: 'text-emerald-500' },
  psychology:    { label: 'Positioning',   icon: Brain,         color: 'text-purple-500' },
};

const PREP_CHECKLIST: PrepCheckItem[] = [
  { id: 'c1', label: 'Research counterpart background & priorities', phase: 'research', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c2', label: 'Define best-case and walk-away boundaries', phase: 'research', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c3', label: 'Prepare 3 data-backed talking points', phase: 'research', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c4', label: 'Anticipate top 3 objections with responses', phase: 'research', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c5', label: 'Practice controlled speaking pace', phase: 'communication', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c6', label: 'Prepare opening value statement', phase: 'communication', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c7', label: 'Plan strategic silence moments', phase: 'communication', forTypes: ['investor', 'developer'] },
  { id: 'c8', label: 'Visualize successful outcome', phase: 'psychology', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c9', label: 'Adopt collaborative framing language', phase: 'psychology', forTypes: ['investor', 'developer', 'agent'] },
  { id: 'c10', label: 'Ground in long-term vision narrative', phase: 'psychology', forTypes: ['investor'] },
];

const PLAYBOOKS: NegotiationPlaybook[] = [
  {
    type: 'investor', label: 'Investor Discussions', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30',
    priorities: ['Valuation terms and equity allocation', 'Board composition and governance', 'Milestone expectations and reporting'],
    doList: ['Lead with traction metrics and growth trajectory', 'Show technical moat depth (450+ tables, AI engine)', 'Frame investment as partnership, not transaction', 'Use silence after key value statements'],
    dontList: ['Reveal desperation or urgency for capital', 'Agree to terms under pressure without review', 'Over-promise unrealistic timelines'],
    powerPhrases: ['"Our data moat compounds with every transaction."', '"We\'re building the intelligence layer, not just a marketplace."', '"Our unit economics improve as supply grows — here\'s the data."'],
  },
  {
    type: 'developer', label: 'Developer Partnerships', icon: Handshake, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30',
    priorities: ['Exclusive listing access terms', 'Data-driven investor targeting value', 'Commission and revenue sharing model'],
    doList: ['Demonstrate investor demand signals for their projects', 'Show AI targeting capability with real examples', 'Offer early-mover exclusivity incentives', 'Present competitor developer success stories'],
    dontList: ['Promise guaranteed sales or lead volumes', 'Undervalue platform positioning leverage', 'Accept exclusivity without reciprocal commitment'],
    powerPhrases: ['"We match your inventory to pre-qualified investor demand."', '"Our AI scores your project before launch — here\'s a sample report."', '"Early partners get preferential visibility as we scale."'],
  },
  {
    type: 'agent', label: 'Agent Onboarding', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30',
    priorities: ['Lead quality and volume expectations', 'Commission transparency', 'Platform ease of use and support'],
    doList: ['Show concrete lead flow examples', 'Emphasize zero listing cost to start', 'Highlight CRM and deal tracking tools', 'Offer personal onboarding assistance'],
    dontList: ['Oversell lead volume before validation', 'Ignore agent concerns about platform complexity', 'Skip demonstrating the agent dashboard'],
    powerPhrases: ['"Your listings get AI-scored and matched to active investors."', '"We handle the demand side — you focus on closing."', '"Top agents on our platform see X inquiries per listing."'],
  },
];

const STORAGE_KEY = 'astra_negotiation_prep';

function loadChecked(): Record<string, boolean> {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return {};
    const p = JSON.parse(s);
    if (p.date !== new Date().toDateString()) return {};
    return p.checked;
  } catch { return {}; }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), checked }));
}

export default function NegotiationMindsetPage() {
  const [selectedType, setSelectedType] = useState<NegotiationType>('investor');
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);
  const [notes, setNotes] = useState('');

  const toggleCheck = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    saveChecked(updated);
  };

  const relevantChecks = PREP_CHECKLIST.filter((c) => c.forTypes.includes(selectedType));
  const checkedCount = relevantChecks.filter((c) => checked[c.id]).length;
  const readiness = relevantChecks.length > 0 ? Math.round((checkedCount / relevantChecks.length) * 100) : 0;
  const playbook = PLAYBOOKS.find((p) => p.type === selectedType)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Crosshair className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Negotiation Mindset</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Strategic preparation model for calm, logical, and persuasive high-stakes discussions.
          </p>
        </motion.div>

        {/* Type Selector */}
        <div className="flex gap-2">
          {PLAYBOOKS.map((pb) => {
            const Icon = pb.icon;
            const active = selectedType === pb.type;
            return (
              <button
                key={pb.type}
                onClick={() => setSelectedType(pb.type)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                  active ? `${pb.bg} ${pb.color}` : 'bg-card border-border/50 text-muted-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" /> {pb.label}
              </button>
            );
          })}
        </div>

        {/* Readiness Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Preparation Readiness
            </span>
            <span className={`text-lg font-bold ${readiness >= 80 ? 'text-emerald-500' : readiness >= 50 ? 'text-amber-500' : 'text-destructive'}`}>{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {readiness >= 80 ? 'Ready to negotiate with confidence.' : readiness >= 50 ? 'Partially prepared — complete remaining items.' : 'More preparation needed before the meeting.'}
          </p>
        </Card>

        <Separator />

        {/* Preparation Checklist */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Pre-Meeting Checklist
          </h2>
          <div className="space-y-2">
            {relevantChecks.map((item) => {
              const phase = PHASE_CONFIG[item.phase];
              const PhaseIcon = phase.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    checked[item.id] ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/50 hover:border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked[item.id] ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {checked[item.id] && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm flex-1 ${checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.label}</span>
                  <Badge variant="outline" className={`text-[10px] h-5 ${phase.color}`}>
                    <PhaseIcon className="w-3 h-3 mr-0.5" />{phase.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Playbook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Do / Don't */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {playbook.doList.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                  <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-emerald-500" />{item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Don't
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {playbook.dontList.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                  <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-destructive" />{item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Power Phrases */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Power Phrases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playbook.powerPhrases.map((phrase, i) => (
              <div key={i} className="p-2 rounded-md bg-primary/5 border border-primary/20 text-sm text-foreground italic">{phrase}</div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Meeting Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key points, counterpart motivations, desired outcomes..." className="text-sm min-h-[80px]" />
          </CardContent>
        </Card>

        {/* Final Goal */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Negotiation Principle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preparation eliminates anxiety. Data eliminates guesswork. Silence communicates confidence.
              Enter every negotiation with clear boundaries, collaborative framing, and long-term vision certainty.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
