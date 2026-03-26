import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Target, Zap, Brain, DollarSign, Rocket, CheckCircle2, Circle,
  Clock, ChevronDown, ChevronRight, ArrowRight, ExternalLink, Shield,
  TrendingUp, Users, Home, Search, Eye, Bell, Star, MessageCircle,
  Sparkles, BarChart3, MapPin, Wrench, FileText, Bot, Globe, Building2,
  Handshake, Package, Lock, Crown, AlertTriangle, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// ─── Types ───────────────────────────────────────────────────────────
type ModuleStatus = 'complete' | 'in-progress' | 'upcoming' | 'planned';
type PhaseKey = 1 | 2 | 3 | 4 | 5;

interface PriorityModule {
  id: string;
  name: string;
  description: string;
  route?: string;
  status: ModuleStatus;
  icon: typeof Home;
  revenueImpact: 'high' | 'medium' | 'low';
  userImpact: 'critical' | 'high' | 'medium' | 'low';
  effort: number; // 1-5
  dependencies?: string[];
}

interface Phase {
  phase: PhaseKey;
  name: string;
  subtitle: string;
  goal: string;
  icon: typeof Target;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  timeline: string;
  modules: PriorityModule[];
}

// ─── Status Config ───────────────────────────────────────────────────
const STATUS_CFG: Record<ModuleStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  complete: { label: 'Complete', icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  'in-progress': { label: 'In Progress', icon: Clock, className: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  upcoming: { label: 'Up Next', icon: Zap, className: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  planned: { label: 'Planned', icon: Circle, className: 'text-muted-foreground bg-muted/10 border-border/30' },
};

const IMPACT_CFG = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-muted-foreground',
  critical: 'text-rose-400',
};

// ─── Phase Data ──────────────────────────────────────────────────────
const PHASES: Phase[] = [
  {
    phase: 1,
    name: 'Core Marketplace Foundation',
    subtitle: 'Build First — Make it usable',
    goal: 'Platform becomes a functional real estate marketplace with listings, search, authentication, and basic agent workflow.',
    icon: Home,
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-400/30',
    bgClass: 'bg-emerald-400',
    timeline: 'Weeks 1–6',
    modules: [
      { id: 'p1-listing', name: 'Property Listing Management', description: 'Multi-step upload form, live preview, AI score preview, status management (Draft/Active/Reserved/Sold)', route: '/my-properties', status: 'complete', icon: Building2, revenueImpact: 'high', userImpact: 'critical', effort: 4 },
      { id: 'p1-search', name: 'Global Property Search & Filters', description: 'Advanced search with location, price, type, bedroom filters, map integration, and sort options', route: '/properties', status: 'complete', icon: Search, revenueImpact: 'high', userImpact: 'critical', effort: 4 },
      { id: 'p1-detail', name: 'Property Detail Page', description: 'Image gallery, specs, location map, basic analytics, agent contact, and share functionality', route: '/properties', status: 'complete', icon: Eye, revenueImpact: 'high', userImpact: 'critical', effort: 3 },
      { id: 'p1-auth', name: 'Authentication & Role System', description: '12 role types with granular permissions, RLS enforcement, and PermissionGate components', route: '/auth', status: 'complete', icon: Lock, revenueImpact: 'medium', userImpact: 'critical', effort: 4, dependencies: ['p1-listing'] },
      { id: 'p1-inquiry', name: 'Agent Lead Inquiry Workflow', description: 'Contact forms, inquiry tracking, agent notification, and basic lead pipeline', route: '/agent-dashboard', status: 'complete', icon: Users, revenueImpact: 'high', userImpact: 'high', effort: 3, dependencies: ['p1-auth', 'p1-detail'] },
    ],
  },
  {
    phase: 2,
    name: 'Transaction & Engagement Loop',
    subtitle: 'Users start interacting and returning',
    goal: 'Create sticky engagement patterns through watchlists, negotiations, notifications, and social proof via reviews.',
    icon: MessageCircle,
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-400/30',
    bgClass: 'bg-sky-400',
    timeline: 'Weeks 7–12',
    modules: [
      { id: 'p2-watchlist', name: 'Investor Watchlist System', description: 'Custom categories, real-time alerts for score increases, price drops, and demand surges', route: '/investor-watchlist', status: 'complete', icon: Eye, revenueImpact: 'medium', userImpact: 'high', effort: 3 },
      { id: 'p2-rental', name: 'Rental Booking & Inquiry Flow', description: 'Availability calendar, booking requests, owner approval workflow', route: '/properties?type=rent', status: 'complete', icon: Home, revenueImpact: 'high', userImpact: 'high', effort: 3 },
      { id: 'p2-negotiate', name: 'Offer Negotiation Workflow', description: 'Structured offer/counter-offer flow with AI negotiation assistance and timeline tracking', route: '/negotiation-assistant', status: 'complete', icon: Handshake, revenueImpact: 'high', userImpact: 'high', effort: 4 },
      { id: 'p2-notif', name: 'Notification & Messaging Center', description: 'Category-filtered alerts (Investor, Transaction, Property, System) with real-time toasts', route: '/notifications', status: 'complete', icon: Bell, revenueImpact: 'low', userImpact: 'high', effort: 3 },
      { id: 'p2-reviews', name: 'Property Review & Rating', description: 'Verified review system with star ratings, photo uploads, and social proof badges', status: 'complete', icon: Star, revenueImpact: 'medium', userImpact: 'medium', effort: 2 },
    ],
  },
  {
    phase: 3,
    name: 'AI Intelligence Differentiation',
    subtitle: 'Platform becomes an intelligent investment tool',
    goal: 'Deploy AI engines that transform browsing into investment decision-making with scoring, alerts, and recommendations.',
    icon: Brain,
    accentClass: 'text-violet-400',
    borderClass: 'border-violet-400/30',
    bgClass: 'bg-violet-400',
    timeline: 'Weeks 13–20',
    modules: [
      { id: 'p3-opp-score', name: 'Opportunity Scoring Integration', description: 'Weighted composite (ROI 30%, Demand 20%, Gap 20%, Velocity 15%, Yield 10%, Luxury 5%) displayed on every listing', route: '/ai-autopilot', status: 'complete', icon: Target, revenueImpact: 'high', userImpact: 'critical', effort: 5 },
      { id: 'p3-price-alert', name: 'AI Price Drop Alert System', description: 'Automated notifications when tracked properties drop >5% or hit trigger thresholds', route: '/notifications', status: 'complete', icon: AlertTriangle, revenueImpact: 'medium', userImpact: 'high', effort: 2, dependencies: ['p2-notif', 'p2-watchlist'] },
      { id: 'p3-valuation', name: 'Automated Property Valuation', description: 'Fair market value estimation, PPSQM benchmarking, confidence scoring, and action hints', route: '/price-prediction', status: 'complete', icon: DollarSign, revenueImpact: 'high', userImpact: 'high', effort: 4 },
      { id: 'p3-rec-feed', name: 'AI Recommendation Home Screen', description: 'Personalized themes (Hidden Gems, Early Growth), collaborative filtering, investment DNA matching', route: '/investor-recommendations', status: 'complete', icon: Sparkles, revenueImpact: 'high', userImpact: 'high', effort: 4, dependencies: ['p3-opp-score'] },
      { id: 'p3-compare', name: 'Property Comparison Tool', description: 'Side-by-side intelligent comparison across investment metrics, location, and specs', route: '/compare', status: 'complete', icon: BarChart3, revenueImpact: 'medium', userImpact: 'medium', effort: 2 },
    ],
  },
  {
    phase: 4,
    name: 'Revenue & Ecosystem Expansion',
    subtitle: 'Start monetization and ecosystem growth',
    goal: 'Activate revenue streams through developer tools, service marketplace, and financial product integrations.',
    icon: DollarSign,
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-400/30',
    bgClass: 'bg-amber-400',
    timeline: 'Weeks 21–30',
    modules: [
      { id: 'p4-dev-launch', name: 'Developer Project Launch System', description: 'Off-plan showcase, masterplan, unit inventory, launch phases, and demand forecasting', route: '/developer-dashboard', status: 'complete', icon: Rocket, revenueImpact: 'high', userImpact: 'high', effort: 5 },
      { id: 'p4-services', name: 'Service Marketplace System', description: '10-category vendor directory, quotation requests, admin approval workflow, and reviews', route: '/services', status: 'complete', icon: Wrench, revenueImpact: 'high', userImpact: 'medium', effort: 4 },
      { id: 'p4-legal', name: 'Legal Documentation Workflow', description: 'SHM/AJB tracking, notary matching, compliance checklists, renewal reminders', route: '/legal-services', status: 'complete', icon: FileText, revenueImpact: 'medium', userImpact: 'medium', effort: 3 },
      { id: 'p4-mortgage', name: 'Mortgage Financing Assistance', description: 'Bank partnership leads, eligibility calculator, loan comparison, commission tracking', route: '/mortgage-calculator', status: 'complete', icon: Building2, revenueImpact: 'high', userImpact: 'medium', effort: 3, dependencies: ['p1-detail'] },
      { id: 'p4-admin-rev', name: 'Admin Revenue Dashboard', description: 'Commission tracking, financial reporting, subscription management, and payout processing', route: '/admin-dashboard?section=analytics', status: 'complete', icon: BarChart3, revenueImpact: 'high', userImpact: 'low', effort: 3 },
    ],
  },
  {
    phase: 5,
    name: 'Advanced Growth & Premium Features',
    subtitle: 'Scale traffic and investor retention',
    goal: 'Deploy premium analytics, autonomous discovery bots, and growth marketing systems for scale.',
    icon: Rocket,
    accentClass: 'text-rose-400',
    borderClass: 'border-rose-400/30',
    bgClass: 'bg-rose-400',
    timeline: 'Weeks 31–42',
    modules: [
      { id: 'p5-portfolio', name: 'Portfolio ROI Analytics', description: 'Total value, unrealized gains, allocation intelligence, risk rebalancing, Score Rings', route: '/portfolio-command-center', status: 'complete', icon: TrendingUp, revenueImpact: 'high', userImpact: 'high', effort: 4 },
      { id: 'p5-deal-bot', name: 'AI Deal Hunter Bot', description: 'Autonomous below-market opportunity scanning with configurable strategy profiles', route: '/deal-hunter-bot', status: 'complete', icon: Bot, revenueImpact: 'high', userImpact: 'high', effort: 4 },
      { id: 'p5-heatmap', name: 'Market Heat Map Explorer', description: 'Spatial demand heatmaps, weighted scoring, location intelligence with drill-down', route: '/location-intelligence', status: 'complete', icon: MapPin, revenueImpact: 'medium', userImpact: 'high', effort: 4 },
      { id: 'p5-seo', name: 'SEO Landing Pages & Marketing', description: 'Nested /properti/ hierarchy, 10-section templates, JSON-LD schemas, city investment pages', route: '/properti', status: 'complete', icon: Globe, revenueImpact: 'high', userImpact: 'medium', effort: 4 },
      { id: 'p5-referral', name: 'Referral & Affiliate Growth', description: 'Multi-tier referral codes, commission tracking, payout management, and viral sharing', route: '/referral', status: 'complete', icon: Users, revenueImpact: 'high', userImpact: 'medium', effort: 3 },
    ],
  },
];

// ─── Computed ─────────────────────────────────────────────────────────
function useRoadmapStats() {
  return useMemo(() => {
    const all = PHASES.flatMap(p => p.modules);
    const total = all.length;
    const complete = all.filter(m => m.status === 'complete').length;
    const inProgress = all.filter(m => m.status === 'in-progress').length;
    const phaseStats = PHASES.map(p => ({
      phase: p.phase,
      total: p.modules.length,
      complete: p.modules.filter(m => m.status === 'complete').length,
    }));
    return { total, complete, inProgress, phaseStats, completionRate: Math.round((complete / total) * 100) };
  }, []);
}

// ─── Module Card ─────────────────────────────────────────────────────
function ModuleCard({ mod, index }: { mod: PriorityModule; index: number }) {
  const sCfg = STATUS_CFG[mod.status];
  const SIcon = sCfg.icon;
  const MIcon = mod.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <div className="flex gap-3 p-3 rounded-xl border border-border/20 bg-card/30 hover:bg-card/50 transition-all group">
        {/* Number */}
        <div className="w-7 h-7 rounded-lg bg-muted/20 border border-border/20 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <MIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-foreground">{mod.name}</span>
            {mod.route && (
              <a href={mod.route} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Go to module">
                <ExternalLink className="h-3 w-3 text-primary" />
              </a>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{mod.description}</p>
          {/* Meta tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 ${sCfg.className}`}>
              <SIcon className="h-2.5 w-2.5" /> {sCfg.label}
            </Badge>
            <span className={`text-[8px] font-medium ${IMPACT_CFG[mod.revenueImpact]}`}>
              💰 {mod.revenueImpact} revenue
            </span>
            <span className={`text-[8px] font-medium ${IMPACT_CFG[mod.userImpact]}`}>
              👤 {mod.userImpact} user impact
            </span>
            <span className="text-[8px] text-muted-foreground">
              ⚡ effort {mod.effort}/5
            </span>
            {mod.dependencies && (
              <span className="text-[8px] text-muted-foreground">
                🔗 depends: {mod.dependencies.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Phase Section ───────────────────────────────────────────────────
function PhaseSection({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(true);
  const PhaseIcon = phase.icon;
  const completedCount = phase.modules.filter(m => m.status === 'complete').length;
  const completion = Math.round((completedCount / phase.modules.length) * 100);

  return (
    <div className="relative">
      {/* Phase connector line */}
      {phase.phase < 5 && (
        <div className="absolute left-[22px] top-[72px] bottom-0 w-px bg-border/20 z-0" />
      )}

      <Card className={`bg-card/40 border-border/30 relative z-10 ${completion === 100 ? 'ring-1 ring-emerald-400/10' : ''}`}>
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-3">
              {/* Phase number circle */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${phase.borderClass} ${phase.bgClass}/10 shrink-0`}>
                <span className={`text-lg font-bold ${phase.accentClass}`}>{phase.phase}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm font-bold">{phase.name}</CardTitle>
                  <Badge variant="outline" className="text-[9px] h-5">{phase.timeline}</Badge>
                  {completion === 100 && <Badge className="text-[9px] h-5 bg-emerald-400/10 text-emerald-400 border-emerald-400/30" variant="outline">✓ Complete</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{phase.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <Progress value={completion} className="h-1.5 w-20" />
                    <span className="text-[10px] font-mono text-muted-foreground">{completedCount}/{phase.modules.length}</span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <CardContent className="px-4 pb-4 pt-0">
                {/* Goal */}
                <div className={`rounded-lg border ${phase.borderClass} ${phase.bgClass}/5 p-3 mb-3`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className={`h-3 w-3 ${phase.accentClass}`} />
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${phase.accentClass}`}>Phase Goal</span>
                  </div>
                  <p className="text-[11px] text-foreground leading-relaxed">{phase.goal}</p>
                </div>

                {/* Modules */}
                <div className="space-y-2">
                  {phase.modules.map((mod, i) => <ModuleCard key={mod.id} mod={mod} index={i} />)}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DevelopmentRoadmapPage() {
  const stats = useRoadmapStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Development Priority Roadmap</h1>
              <p className="text-xs text-muted-foreground">Structured execution order for fastest market traction & revenue</p>
            </div>
          </div>

          {/* Phase Progress Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-4">
            {/* Overall */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center sm:col-span-1">
              <span className="text-2xl font-bold text-foreground">{stats.completionRate}%</span>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5">Overall</p>
              <Progress value={stats.completionRate} className="h-1 mt-1.5" />
            </div>
            {/* Per phase */}
            {stats.phaseStats.map((ps) => {
              const phase = PHASES[ps.phase - 1];
              const pct = Math.round((ps.complete / ps.total) * 100);
              return (
                <div key={ps.phase} className={`rounded-xl border border-border/20 bg-card/30 p-3 text-center`}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className={`text-xs font-bold ${phase.accentClass}`}>P{ps.phase}</span>
                    <span className="text-lg font-bold text-foreground">{ps.complete}/{ps.total}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground uppercase truncate">{phase.name}</p>
                  <Progress value={pct} className="h-1 mt-1.5" />
                </div>
              );
            })}
          </div>

          {/* Execution Philosophy */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Execution Philosophy</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { phase: 1, label: 'Usability', desc: 'Can people list & find properties?', icon: Home },
                { phase: 2, label: 'Engagement', desc: 'Do users come back repeatedly?', icon: MessageCircle },
                { phase: 3, label: 'Intelligence', desc: 'Is AI making smarter decisions?', icon: Brain },
                { phase: 4, label: 'Monetization', desc: 'Are revenue streams activated?', icon: DollarSign },
                { phase: 5, label: 'Scale', desc: 'Can we grow traffic & retention?', icon: Rocket },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block shrink-0" />}
                  <div className="flex items-center gap-2 flex-1">
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-foreground">P{item.phase}: {item.label}</span>
                      <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        {PHASES.map((phase) => <PhaseSection key={phase.phase} phase={phase} />)}
      </div>
    </div>
  );
}
