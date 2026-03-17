import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, BarChart3, ChevronDown, Search, ArrowRight,
  Target, Activity, Layers, Zap, CheckCircle2, Clock, Users,
  ToggleLeft, TrendingUp, AlertTriangle, Percent, GitBranch,
  Eye, Gauge, Play, Pause, Archive, Hash, Shuffle, PieChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

type ExperimentStatus = 'running' | 'completed' | 'draft' | 'paused';
type ExperimentType = 'ui' | 'algorithm' | 'funnel';
type Significance = 'significant' | 'trending' | 'inconclusive' | 'pending';

interface Variant {
  name: string;
  description: string;
  traffic: number;
  conversions?: number;
  conversionRate?: number;
  isControl?: boolean;
}

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  type: ExperimentType;
  status: ExperimentStatus;
  significance: Significance;
  metric: string;
  variants: Variant[];
  cohortSize: number;
  startDate: string;
  duration: string;
  minSampleSize: number;
  techImplementation: string;
}

interface ExperimentCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FlaskConical;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  experiments: Experiment[];
}

const STATUS_MAP: Record<ExperimentStatus, { cls: string; label: string; icon: typeof Play }> = {
  running: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Running', icon: Play },
  completed: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Completed', icon: CheckCircle2 },
  draft: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Draft', icon: Clock },
  paused: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'Paused', icon: Pause },
};

const SIG_MAP: Record<Significance, { cls: string; label: string }> = {
  significant: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'p < 0.05 ✓' },
  trending: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'p < 0.10' },
  inconclusive: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Inconclusive' },
  pending: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Collecting...' },
};

const TYPE_MAP: Record<ExperimentType, { cls: string; label: string }> = {
  ui: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'UI Test' },
  algorithm: { cls: 'text-violet-400 bg-violet-400/10 border-violet-400/30', label: 'Algorithm' },
  funnel: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'Funnel' },
};

const CATEGORIES: ExperimentCategory[] = [
  {
    id: 'ui', title: 'UI Optimization Tests', subtitle: 'Visual layout, CTA placement, and presentation variations',
    icon: Eye, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    experiments: [
      {
        id: 'exp-001', name: 'Property Card Layout',
        hypothesis: 'Showing opportunity score badge prominently on property cards increases detail page click-through rate by >15%.',
        type: 'ui', status: 'running', significance: 'trending', metric: 'Card → Detail CTR',
        cohortSize: 5000, startDate: '2026-03-01', duration: '14 days', minSampleSize: 3000,
        techImplementation: 'PropertyCard variant prop → cohort cookie → ai_behavior_tracking (property_card_viewed + variant field)',
        variants: [
          { name: 'Control', description: 'Current card layout — price, location, specs', traffic: 50, conversions: 420, conversionRate: 16.8, isControl: true },
          { name: 'Score Badge', description: 'Card with opportunity score badge + "Hot Deal" ribbon', traffic: 50, conversions: 498, conversionRate: 19.9 },
        ],
      },
      {
        id: 'exp-002', name: 'CTA Button Placement',
        hypothesis: 'Moving "Contact Agent" CTA above the fold on property detail pages increases inquiry rate by >10%.',
        type: 'ui', status: 'running', significance: 'pending', metric: 'Inquiry Initiation Rate',
        cohortSize: 4000, startDate: '2026-03-10', duration: '14 days', minSampleSize: 2500,
        techImplementation: 'PropertyDetail layout prop → useExperiment hook → tracks agent_contact_initiated event',
        variants: [
          { name: 'Control', description: 'CTA in sidebar (current position)', traffic: 50, conversions: 180, conversionRate: 9.0, isControl: true },
          { name: 'Above Fold', description: 'Sticky CTA bar at top of property detail', traffic: 50, conversions: 210, conversionRate: 10.5 },
        ],
      },
      {
        id: 'exp-003', name: 'Price Highlight Style',
        hypothesis: 'Showing price drop percentage (e.g., "↓12% from last month") drives more watchlist additions than absolute price alone.',
        type: 'ui', status: 'draft', significance: 'pending', metric: 'Watchlist Addition Rate',
        cohortSize: 6000, startDate: 'TBD', duration: '21 days', minSampleSize: 4000,
        techImplementation: 'PriceDropBadge variant → experiment cohort → tracks watchlist_added event with source',
        variants: [
          { name: 'Control', description: 'Price shown as absolute value only', traffic: 33, isControl: true },
          { name: 'Drop %', description: 'Price + "↓12% from last month" badge', traffic: 33 },
          { name: 'Drop + Timeline', description: 'Price + drop % + mini sparkline chart', traffic: 34 },
        ],
      },
    ],
  },
  {
    id: 'algo', title: 'AI Recommendation Tests', subtitle: 'Scoring weights, notification timing, and ranking algorithms',
    icon: GitBranch, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    experiments: [
      {
        id: 'exp-004', name: 'Opportunity Score Weights',
        hypothesis: 'Increasing demand heat weight from 20% to 30% (reducing luxury from 5% to 0%) improves recommendation engagement rate.',
        type: 'algorithm', status: 'running', significance: 'significant', metric: 'Recommendation CTR',
        cohortSize: 3000, startDate: '2026-02-15', duration: '30 days', minSampleSize: 2000,
        techImplementation: 'Shadow model in ai_model_registry → learning-engine compares engagement per cohort → ai_feedback_signals',
        variants: [
          { name: 'Control (v1)', description: 'ROI:30 Demand:20 Gap:20 Inq:15 Yield:10 Lux:5', traffic: 50, conversions: 312, conversionRate: 20.8, isControl: true },
          { name: 'Demand-Heavy (v2)', description: 'ROI:30 Demand:30 Gap:20 Inq:15 Yield:5 Lux:0', traffic: 50, conversions: 387, conversionRate: 25.8 },
        ],
      },
      {
        id: 'exp-005', name: 'Alert Notification Timing',
        hypothesis: 'Sending price drop alerts within 15 minutes (vs 1 hour batch) increases alert-to-action conversion by >20%.',
        type: 'algorithm', status: 'completed', significance: 'significant', metric: 'Alert → Action Rate',
        cohortSize: 2000, startDate: '2026-01-20', duration: '21 days', minSampleSize: 1500,
        techImplementation: 'notification-engine delay parameter → cohort-based timing → notification_clicked tracking',
        variants: [
          { name: 'Control (1h batch)', description: 'Alerts batched and sent every hour', traffic: 50, conversions: 145, conversionRate: 14.5, isControl: true },
          { name: 'Real-time (15min)', description: 'Alerts sent within 15 minutes of detection', traffic: 50, conversions: 234, conversionRate: 23.4 },
        ],
      },
      {
        id: 'exp-006', name: 'Feed Ranking Logic',
        hypothesis: 'Mixing personalized recommendations (70%) with serendipity picks (30%) increases session depth vs pure personalization.',
        type: 'algorithm', status: 'draft', significance: 'pending', metric: 'Avg Properties Viewed / Session',
        cohortSize: 4000, startDate: 'TBD', duration: '14 days', minSampleSize: 3000,
        techImplementation: 'Recommendation feed composition parameter → session tracking → ai_behavior_tracking page_count analysis',
        variants: [
          { name: 'Control (100% personal)', description: 'Feed fully personalized by investor DNA', traffic: 50, isControl: true },
          { name: '70/30 Mix', description: '70% personalized + 30% serendipity/trending picks', traffic: 50 },
        ],
      },
    ],
  },
  {
    id: 'funnel', title: 'Conversion Funnel Tests', subtitle: 'Booking flows, offer UX, and lead capture optimization',
    icon: TrendingUp, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    experiments: [
      {
        id: 'exp-007', name: 'Rental Booking Flow Steps',
        hypothesis: 'Reducing booking flow from 4 steps to 2 steps (inline form) increases booking completion rate by >25%.',
        type: 'funnel', status: 'running', significance: 'trending', metric: 'Booking Completion Rate',
        cohortSize: 2500, startDate: '2026-03-05', duration: '21 days', minSampleSize: 1800,
        techImplementation: 'BookingFlow step count prop → useExperiment → rental_booking_requested with step_count metadata',
        variants: [
          { name: 'Control (4 steps)', description: 'Current: Select dates → Guest info → Payment → Confirm', traffic: 50, conversions: 156, conversionRate: 12.5, isControl: true },
          { name: 'Compact (2 steps)', description: 'Inline form: Dates+Guests → Payment+Confirm', traffic: 50, conversions: 201, conversionRate: 16.1 },
        ],
      },
      {
        id: 'exp-008', name: 'Offer Submission UX',
        hypothesis: 'Pre-filling AI-suggested offer amount increases offer submission rate vs empty form.',
        type: 'funnel', status: 'draft', significance: 'pending', metric: 'Offer Submit Rate',
        cohortSize: 3000, startDate: 'TBD', duration: '14 days', minSampleSize: 2000,
        techImplementation: 'OfferForm prefill prop → negotiation_assist suggestion → offer_initiated with prefill_used flag',
        variants: [
          { name: 'Control (empty)', description: 'Blank offer amount field', traffic: 50, isControl: true },
          { name: 'AI Prefill', description: 'AI-suggested amount pre-filled (editable) with "Smart Offer" label', traffic: 50 },
        ],
      },
      {
        id: 'exp-009', name: 'Developer Lead Form Design',
        hypothesis: 'Progressive disclosure (show basic fields first, expand on interest) outperforms showing all fields upfront.',
        type: 'funnel', status: 'paused', significance: 'inconclusive', metric: 'Lead Form Completion Rate',
        cohortSize: 1500, startDate: '2026-02-20', duration: '14 days', minSampleSize: 1000,
        techImplementation: 'DeveloperLeadForm variant → progressive vs full → developer_project_interest with form_variant metadata',
        variants: [
          { name: 'Control (all fields)', description: 'All 8 fields visible immediately', traffic: 50, conversions: 89, conversionRate: 11.9, isControl: true },
          { name: 'Progressive', description: '3 fields visible → expand for rest on "I\'m interested"', traffic: 50, conversions: 95, conversionRate: 12.7 },
        ],
      },
    ],
  },
];

const SYSTEM_FEATURES = [
  { icon: Shuffle, title: 'Cohort Assignment', desc: 'Deterministic hash-based assignment using user_id + experiment_id. Consistent across sessions. No cookie dependency.' },
  { icon: BarChart3, title: 'Metrics Dashboard', desc: 'Real-time experiment performance tracked via ai_behavior_tracking. Conversion rates, confidence intervals, and sample size progress.' },
  { icon: Percent, title: 'Statistical Significance', desc: 'Chi-squared test for proportions. Minimum 95% confidence (p < 0.05) required before declaring winner. Minimum sample size enforced.' },
  { icon: ToggleLeft, title: 'Enable / Disable Toggle', desc: 'Instant experiment activation via admin dashboard. Paused experiments stop assignment but preserve data. Rollback to control in 1 click.' },
  { icon: Users, title: 'Exclusion Rules', desc: 'Users can only be in one experiment per category. Admin and test accounts automatically excluded from all experiments.' },
  { icon: Archive, title: 'Result Archival', desc: 'Completed experiments archived with full statistical report. Winning variants promoted to production via feature flag update.' },
];

function VariantBar({ variant, maxRate }: { variant: Variant; maxRate: number }) {
  const rate = variant.conversionRate ?? 0;
  const barWidth = maxRate > 0 ? (rate / maxRate) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 shrink-0">
        <span className="text-[9px] font-bold text-foreground">{variant.name}</span>
        {variant.isControl && <Badge variant="outline" className="text-[7px] h-3 ml-1 border-border/30">Control</Badge>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-4 rounded-full bg-muted/10 border border-border/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${variant.isControl ? 'bg-muted-foreground/30' : 'bg-primary/60'}`}
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
      <div className="w-16 text-right shrink-0">
        {variant.conversionRate != null ? (
          <span className={`text-[10px] font-bold ${variant.isControl ? 'text-muted-foreground' : 'text-foreground'}`}>{variant.conversionRate}%</span>
        ) : (
          <span className="text-[9px] text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function ExperimentRow({ experiment }: { experiment: Experiment }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[experiment.status];
  const sg = SIG_MAP[experiment.significance];
  const tp = TYPE_MAP[experiment.type];
  const StIcon = st.icon;
  const maxRate = Math.max(...experiment.variants.map(v => v.conversionRate ?? 0), 1);
  const sampleProgress = Math.min((experiment.cohortSize / experiment.minSampleSize) * 100, 100);

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{experiment.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${tp.cls}`}>{tp.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${st.cls}`}><StIcon className="h-2 w-2" /> {st.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 border ${sg.cls}`}>{sg.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{experiment.hypothesis}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-2">
              <Separator className="opacity-10" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Primary Metric</span>
                  <span className="block text-foreground font-bold mt-0.5">{experiment.metric}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Cohort Size</span>
                  <span className="block text-foreground font-bold mt-0.5">{experiment.cohortSize.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Start Date</span>
                  <span className="block text-foreground font-mono mt-0.5">{experiment.startDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Duration</span>
                  <span className="block text-foreground mt-0.5">{experiment.duration}</span>
                </div>
              </div>

              {/* Sample size progress */}
              <div>
                <div className="flex items-center justify-between text-[9px] mb-1">
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Sample Progress</span>
                  <span className="text-muted-foreground">{experiment.cohortSize.toLocaleString()} / {experiment.minSampleSize.toLocaleString()} min</span>
                </div>
                <Progress value={sampleProgress} className="h-1.5" />
              </div>

              {/* Variant performance */}
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Variant Performance</span>
                <div className="space-y-1 mt-1">
                  {experiment.variants.map(v => <VariantBar key={v.name} variant={v} maxRate={maxRate} />)}
                </div>
              </div>

              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Technical Implementation</span>
                <code className="block text-violet-400 font-mono mt-0.5 text-[8px] leading-relaxed">{experiment.techImplementation}</code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryCard({ category }: { category: ExperimentCategory }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;
  const running = category.experiments.filter(e => e.status === 'running').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${category.borderClass} ${category.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${category.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{category.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{category.experiments.length} experiments</Badge>
            {running > 0 && <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30">{running} running</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground">{category.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {category.experiments.map(e => <ExperimentRow key={e.id} experiment={e} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ABTestingFrameworkPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = CATEGORIES.flatMap(c => c.experiments);
    return {
      categories: CATEGORIES.length,
      experiments: all.length,
      running: all.filter(e => e.status === 'running').length,
      significant: all.filter(e => e.significance === 'significant').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.map(c => ({
      ...c,
      experiments: c.experiments.filter(e =>
        e.name.toLowerCase().includes(q) || e.hypothesis.toLowerCase().includes(q) ||
        e.metric.toLowerCase().includes(q) || e.techImplementation.toLowerCase().includes(q)
      ),
    })).filter(c => c.experiments.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">A/B Testing Framework</h1>
              <p className="text-xs text-muted-foreground">Product experimentation — UI optimization, algorithm testing, and conversion funnel experiments</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Test Categories', value: stats.categories, icon: Layers },
              { label: 'Experiments', value: stats.experiments, icon: FlaskConical },
              { label: 'Running', value: stats.running, icon: Play },
              { label: 'Significant', value: stats.significant, icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Experiment pipeline flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Experiment Lifecycle</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'Hypothesis', sub: 'Define & metric' },
                { label: 'Cohort Split', sub: 'Hash-based assign' },
                { label: 'Run', sub: 'Collect events' },
                { label: 'Analyze', sub: 'Statistical test' },
                { label: 'Decide', sub: 'p < 0.05 check' },
                { label: 'Ship / Kill', sub: 'Promote winner' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[80px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* System features */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">System Capabilities</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SYSTEM_FEATURES.map(f => (
                <div key={f.title} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <f.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-foreground">{f.title}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search experiments, metrics, hypotheses..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(c => <CategoryCard key={c.id} category={c} />)}
      </div>
    </div>
  );
}
