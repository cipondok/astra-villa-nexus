import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket, Map, Megaphone, FileText, Target, BarChart3,
  DollarSign, Users, Layers, Trophy, ArrowUpRight,
  CheckCircle2, Clock, ChevronRight, ExternalLink,
  Flame, Store, PieChart, Send, Zap
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface ChecklistItem {
  id: string;
  label: string;
  phase: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'intel-districts', label: 'Identify 3 high-liquidity districts', phase: 'Intelligence Prep' },
  { id: 'intel-gaps', label: 'Map vendor category gaps per district', phase: 'Intelligence Prep' },
  { id: 'intel-listings', label: 'Preload 30 premium listings', phase: 'Intelligence Prep' },
  { id: 'intel-vendors', label: 'Preload 40 vendor profiles', phase: 'Intelligence Prep' },
  { id: 'supply-whatsapp', label: 'Execute WhatsApp vendor outreach campaign', phase: 'Supply Activation' },
  { id: 'supply-territory', label: 'Offer early dominance territory slots', phase: 'Supply Activation' },
  { id: 'supply-legal', label: 'Onboard legal + mortgage partners', phase: 'Supply Activation' },
  { id: 'supply-badge', label: 'Create Founding Vendor Badge program', phase: 'Supply Activation' },
  { id: 'demand-videos', label: 'Launch 10 viral property videos', phase: 'Demand Activation' },
  { id: 'demand-ads', label: 'Run Meta lead ads targeting investors', phase: 'Demand Activation' },
  { id: 'demand-report', label: 'Publish AI Top Investment Areas report', phase: 'Demand Activation' },
  { id: 'demand-webinar', label: 'Run investor webinar funnel', phase: 'Demand Activation' },
  { id: 'tx-deals', label: 'Personally manage first 20 deals', phase: 'Transaction Kickstart' },
  { id: 'tx-concierge', label: 'Activate concierge investor support', phase: 'Transaction Kickstart' },
  { id: 'tx-urgency', label: 'Create urgency narrative campaigns', phase: 'Transaction Kickstart' },
  { id: 'proof-testimonials', label: 'Record vendor + investor testimonials', phase: 'Social Proof' },
  { id: 'proof-dashboard', label: 'Publish live marketplace liquidity metrics', phase: 'Social Proof' },
  { id: 'proof-case', label: 'Create deal success case studies', phase: 'Social Proof' },
  { id: 'scale-district', label: 'Open second district expansion', phase: 'Scale Trigger' },
  { id: 'scale-paid', label: 'Introduce vendor paid upgrades', phase: 'Scale Trigger' },
  { id: 'scale-pro', label: 'Launch investor pro subscription push', phase: 'Scale Trigger' },
];

interface PlaybookLink {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  accentClass: string;
}

const PLAYBOOK_LINKS: PlaybookLink[] = [
  { key: 'city-launch-playbook', label: 'City Launch Playbook', description: '6-step city activation blueprint', icon: Map, accentClass: 'text-primary' },
  { key: 'marketplace-launch-playbook', label: 'Marketplace Launch Playbook', description: '5-phase go-to-market sequence', icon: Rocket, accentClass: 'text-chart-2' },
  { key: 'vendor-acquisition-scripts', label: 'Vendor Acquisition Scripts', description: 'WhatsApp outreach templates', icon: Send, accentClass: 'text-chart-4' },
  { key: 'sprint-execution-roadmap', label: 'Sprint Execution Roadmap', description: '12-week build sprints', icon: Zap, accentClass: 'text-chart-5' },
  { key: 'vendor-monetization-pyramid', label: 'Vendor Monetization Pyramid', description: '5-level vendor revenue model', icon: Store, accentClass: 'text-chart-1' },
  { key: 'monetization-pricing-blueprint', label: 'Monetization Pricing', description: 'Full pricing structure', icon: DollarSign, accentClass: 'text-chart-3' },
  { key: 'revenue-projection-model', label: 'Revenue Projection Model', description: '12-month financial forecast', icon: BarChart3, accentClass: 'text-primary' },
  { key: 'revenue-scaling-blueprint', label: 'Revenue Scaling Blueprint', description: '$0 → $100M ARR pathway', icon: Target, accentClass: 'text-chart-2' },
  { key: 'institutional-saas-blueprint', label: 'Institutional SaaS Blueprint', description: 'Bloomberg-tier product modules', icon: Layers, accentClass: 'text-chart-4' },
  { key: 'investor-kpi-framework-page', label: 'Investor KPI Framework', description: 'Series-A readiness metrics', icon: PieChart, accentClass: 'text-chart-5' },
  { key: 'feature-impact-matrix', label: 'Feature Impact Matrix', description: 'Build priority framework', icon: Trophy, accentClass: 'text-chart-1' },
];

const PHASE_COLORS: Record<string, string> = {
  'Intelligence Prep': 'bg-primary/10 text-primary border-primary/20',
  'Supply Activation': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Demand Activation': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  'Transaction Kickstart': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  'Social Proof': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Scale Trigger': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
};

export default function LaunchExecutionKitPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('astra-launch-checklist');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem('astra-launch-checklist', JSON.stringify(next));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const phases = [...new Set(CHECKLIST_ITEMS.map(i => i.phase))];

  const navigateToSection = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('section', key);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.location.search = `section=${key}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Execution Kit</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Astra Launch Execution Kit</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Unified launch command center — checklist progress, playbook access, and milestone tracking in one view.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Progress Overview */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completed', value: `${completedCount}/${totalCount}`, icon: CheckCircle2, sub: `${progressPct}% done` },
            { label: 'Phases', value: `${phases.length}`, icon: Layers, sub: 'Execution stages' },
            { label: 'Playbooks', value: `${PLAYBOOK_LINKS.length}`, icon: FileText, sub: 'Linked modules' },
            { label: 'Status', value: progressPct === 100 ? 'Complete' : progressPct > 60 ? 'Advanced' : progressPct > 20 ? 'In Progress' : 'Starting', icon: Flame, sub: progressPct === 100 ? 'Ready to scale' : 'Keep pushing' },
          ].map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <m.icon className="h-3 w-3 text-primary" />{m.sub}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Global Progress Bar */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Launch Readiness</span>
                <span className="text-xs font-mono text-primary">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Two columns: Checklist + Playbooks */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Checklist — 3 cols */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="lg:col-span-3 space-y-4">
            <motion.h2 variants={fadeSlide} className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Launch Checklist
            </motion.h2>

            {phases.map((phase) => {
              const items = CHECKLIST_ITEMS.filter(i => i.phase === phase);
              const phaseCompleted = items.filter(i => checked[i.id]).length;
              const phaseTotal = items.length;
              return (
                <motion.div key={phase} variants={fadeSlide}>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-[9px] font-mono ${PHASE_COLORS[phase] || ''}`}>
                          {phase}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {phaseCompleted}/{phaseTotal}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 pb-4">
                      {items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={!!checked[item.id]}
                            onCheckedChange={() => toggle(item.id)}
                          />
                          <span className={`text-xs ${checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Playbook Links — 2 cols */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="lg:col-span-2 space-y-4">
            <motion.h2 variants={fadeSlide} className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Linked Playbooks
            </motion.h2>

            {PLAYBOOK_LINKS.map((pb) => (
              <motion.div key={pb.key} variants={fadeSlide}>
                <Card
                  className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => navigateToSection(pb.key)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <pb.icon className={`h-4 w-4 ${pb.accentClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{pb.label}</p>
                      <p className="text-[10px] text-muted-foreground">{pb.description}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Milestone Targets */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          <motion.h2 variants={fadeSlide} className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            Launch Milestones
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { month: 'Month 1', target: '80 listings · 120 investors · 40 vendors', metric: '4 deals closed', accent: 'border-l-primary' },
              { month: 'Month 3', target: '350 listings · 800 investors · 120 vendors', metric: '12 deals/mo', accent: 'border-l-chart-2' },
              { month: 'Month 6', target: '700 listings · 1.5K investors · 180 vendors', metric: 'Rp505M/mo revenue', accent: 'border-l-chart-4' },
              { month: 'Month 12', target: '1.2K listings · 4.5K investors · 420 vendors', metric: 'Rp1.54B/mo · Series-A ready', accent: 'border-l-chart-5' },
            ].map((m) => (
              <motion.div key={m.month} variants={fadeSlide}>
                <Card className={`border-border/50 border-l-4 ${m.accent}`}>
                  <CardContent className="p-4 space-y-2">
                    <Badge variant="outline" className="text-[9px] font-mono">{m.month}</Badge>
                    <p className="text-xs text-foreground">{m.target}</p>
                    <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />{m.metric}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
