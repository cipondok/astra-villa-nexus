import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Crosshair, MessageSquareWarning, TrendingDown,
  Landmark, Swords, Gauge, ChevronRight, Quote, Target,
  BarChart3, Lock
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};

interface DefenseScenario {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  icon: React.ElementType;
  attackLabel: string;
  attackQuestion: string;
  responseModel: string;
  keyReframe: string;
  defensePrinciple: string;
}

const SCENARIOS: DefenseScenario[] = [
  {
    id: 'valuation-challenge',
    severity: 'critical',
    icon: Crosshair,
    attackLabel: 'Valuation Legitimacy',
    attackQuestion:
      'Your valuation implies you are a market infrastructure platform, but your revenue is still transaction-driven. Isn\'t this just a cyclical brokerage business with tech marketing?',
    responseModel:
      'Our revenue today reflects early monetization layers. However, the core platform value lies in liquidity intelligence data and capital routing infrastructure. As institutional capital penetration increases, transaction volatility becomes less correlated to earnings. We are structurally moving from marketplace revenue → capital intelligence subscription + embedded finance layers.',
    keyReframe: 'Transaction revenue is Phase 1 — intelligence monetization is the durable layer',
    defensePrinciple: 'Acknowledge present, redirect to structural trajectory',
  },
  {
    id: 'unit-economics',
    severity: 'high',
    icon: BarChart3,
    attackLabel: 'Unit Economics Attack',
    attackQuestion:
      'Customer acquisition cost appears to be rising. Are you buying growth?',
    responseModel:
      'We are intentionally front-loading strategic market capture investments. Cohort payback periods remain within our internal thresholds, and capital efficiency improves as liquidity density increases.',
    keyReframe: 'Strategic front-loading, not inefficient spending',
    defensePrinciple: 'Reframe cost as investment with visible payback curve',
  },
  {
    id: 'competitive-moat',
    severity: 'high',
    icon: Lock,
    attackLabel: 'Competitive Moat',
    attackQuestion:
      'What stops a global listing portal from undercutting your take rate?',
    responseModel:
      'Our moat is not listings. Our moat is predictive deal intelligence and institutional execution trust. Take-rate compression risk reduces as we become embedded in transaction workflow.',
    keyReframe: 'Moat is intelligence + trust, not inventory',
    defensePrinciple: 'Separate commodity layer from proprietary layer',
  },
  {
    id: 'downside-scenario',
    severity: 'medium',
    icon: TrendingDown,
    attackLabel: 'Downside Scenario',
    attackQuestion:
      'If property markets freeze, how do you survive?',
    responseModel:
      'In lower liquidity environments, price discovery becomes more valuable. Historically, volatility increases demand for capital intelligence platforms.',
    keyReframe: 'Volatility increases intelligence demand',
    defensePrinciple: 'Counter-cyclical value proposition',
  },
  {
    id: 'overvaluation',
    severity: 'critical',
    icon: Gauge,
    attackLabel: 'Stock Overvaluation',
    attackQuestion:
      'Why shouldn\'t investors expect multiple compression?',
    responseModel:
      'Valuation ultimately follows durable earnings power. Our focus is expanding long-term free cash flow capacity rather than managing short-term market perception.',
    keyReframe: 'Earnings power trajectory > current multiple',
    defensePrinciple: 'Redirect from multiple to FCF durability',
  },
];

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-destructive/10 border-destructive/25', text: 'text-destructive', badge: 'destructive' as const },
  high: { label: 'High', bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-500', badge: 'secondary' as const },
  medium: { label: 'Medium', bg: 'bg-muted/50 border-border/40', text: 'text-muted-foreground', badge: 'outline' as const },
};

function ScenarioCard({ scenario }: { scenario: DefenseScenario }) {
  const sev = SEVERITY_CONFIG[scenario.severity];
  const Icon = scenario.icon;

  return (
    <motion.div variants={fadeSlide}>
      <Card className={`border ${sev.bg} hover:shadow-lg transition-shadow duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-card border border-border/50`}>
                <Icon className={`h-5 w-5 ${sev.text}`} />
              </div>
              <div>
                <CardTitle className="text-base">{scenario.attackLabel}</CardTitle>
                <Badge variant={sev.badge} className="mt-1 text-[10px]">
                  {sev.label} Severity
                </Badge>
              </div>
            </div>
            <Swords className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Attack */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs uppercase tracking-wider text-destructive font-semibold">Analyst Attack</p>
            </div>
            <blockquote className="border-l-2 border-destructive/40 pl-3 py-1">
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                "{scenario.attackQuestion}"
              </p>
            </blockquote>
          </div>

          <Separator />

          {/* Response */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Founder Response</p>
            </div>
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
              <p className="text-sm leading-relaxed">
                "{scenario.responseModel}"
              </p>
            </div>
          </div>

          <Separator />

          {/* Reframe + Principle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Key Reframe</p>
              <div className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs font-medium">{scenario.keyReframe}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Defense Principle</p>
              <div className="flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs font-medium">{scenario.defensePrinciple}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HedgeFundDefensePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeSlide} className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Investor Relations Playbook</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hedge Fund Defense Protocol</h1>
            <p className="text-muted-foreground max-w-2xl">
              Prepared response models for aggressive analyst questioning. Each scenario includes the attack vector, calibrated response, key reframe, and underlying defense principle.
            </p>
          </motion.div>
        </motion.div>

        {/* Doctrine Card */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Quote className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Core Defense Doctrine</p>
                    <p className="text-sm font-medium leading-relaxed max-w-2xl">
                      Never defend from a position of weakness. Every response must reframe the question from the analyst's short-term lens to your structural long-term thesis. Acknowledge the data point, redirect to trajectory.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Acknowledge → Reframe', 'Data → Trajectory', 'Cyclical → Structural', 'Cost → Investment'].map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] font-mono">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Scenario Cards */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="space-y-5"
        >
          <motion.div variants={fadeSlide}>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              {SCENARIOS.length} Prepared Scenarios
            </p>
          </motion.div>
          {SCENARIOS.map(s => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </motion.div>

        {/* Behavioral Rules */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlide}>
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  Behavioral Rules for Hostile Q&A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { rule: 'Never become defensive', detail: 'Defensiveness signals vulnerability. Stay structurally calm.' },
                    { rule: 'Never concede the frame', detail: 'If you accept their lens, you lose the narrative. Always reframe.' },
                    { rule: 'Use silence strategically', detail: 'A brief pause before responding signals confidence, not hesitation.' },
                    { rule: 'End on your thesis', detail: 'Every answer must land on your long-term structural position.' },
                    { rule: 'Cite data, not emotion', detail: 'Numbers, cohorts, and trends are your shield. Never use adjectives without proof.' },
                    { rule: 'Welcome tough questions', detail: '"That\'s exactly the right question" disarms hostility and reclaims control.' },
                  ].map((item, i) => (
                    <motion.div key={i} variants={fadeSlide} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.rule}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
