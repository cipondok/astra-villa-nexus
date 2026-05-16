import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Database, ChevronDown, Search, ArrowRight, Target,
  Activity, Layers, Zap, CheckCircle2, Clock, BarChart3,
  TrendingUp, AlertTriangle, RefreshCw, GitBranch, Eye,
  Gauge, Shield, Hash, FileText, Repeat, CircleDot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type SignalStatus = 'collecting' | 'active' | 'planned';
type SignalWeight = 'primary' | 'secondary' | 'supporting';

interface DataSignal {
  name: string;
  sourceTable: string;
  description: string;
  status: SignalStatus;
  weight: SignalWeight;
  fields: string[];
  learningUse: string[];
}

interface DataSource {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  signals: DataSignal[];
}

const STATUS_MAP: Record<SignalStatus, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  collecting: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Collecting', icon: CheckCircle2 },
  active: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Active', icon: Activity },
  planned: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Planned', icon: Clock },
};

const WEIGHT_MAP: Record<SignalWeight, { cls: string; label: string }> = {
  primary: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Primary' },
  secondary: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'Secondary' },
  supporting: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Supporting' },
};

const DATA_SOURCES: DataSource[] = [
  {
    id: 'market', title: 'Market Outcome Signals', subtitle: 'Ground-truth transaction and performance data from real marketplace activity',
    icon: TrendingUp, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    signals: [
      {
        name: 'Final Transaction Prices',
        sourceTable: 'property_offers (status = completed)',
        description: 'Actual closing prices from completed transactions. The definitive ground truth for price prediction accuracy — compares AI-estimated fair market value against realized sale price.',
        status: 'collecting', weight: 'primary',
        fields: ['property_id', 'final_price', 'original_listing_price', 'ai_estimated_value_at_listing', 'price_delta_pct', 'transaction_date', 'city', 'property_type'],
        learningUse: ['Price prediction model calibration', 'Valuation gap accuracy scoring', 'Regional pricing bias correction'],
      },
      {
        name: 'Days-to-Sell Metrics',
        sourceTable: 'properties (listed_at → sold_at)',
        description: 'Time between listing publication and offer acceptance. Validates demand heat scoring — high-heat properties should sell faster.',
        status: 'collecting', weight: 'primary',
        fields: ['property_id', 'days_on_market', 'demand_heat_at_listing', 'inquiry_count', 'view_count', 'city', 'price_bracket'],
        learningUse: ['Demand heat model validation', 'Listing optimizer feedback', 'Time-to-sell prediction training'],
      },
      {
        name: 'Rental Occupancy Performance',
        sourceTable: 'rental_bookings + property_performance',
        description: 'Actual rental occupancy rates and yield realized vs AI-predicted rental yield. Feeds rental yield optimizer accuracy.',
        status: 'collecting', weight: 'primary',
        fields: ['property_id', 'occupancy_rate_30d', 'occupancy_rate_90d', 'actual_monthly_yield', 'predicted_monthly_yield', 'yield_delta_pct'],
        learningUse: ['Rental yield prediction calibration', 'Portfolio ROI accuracy improvement', 'Location-based yield curve training'],
      },
      {
        name: 'Developer Project Absorption Rates',
        sourceTable: 'developer_units + developer_projects',
        description: 'Rate at which developer units are sold/reserved. Validates developer demand forecasting model accuracy.',
        status: 'active', weight: 'secondary',
        fields: ['project_id', 'total_units', 'sold_units', 'absorption_rate_monthly', 'predicted_absorption', 'location', 'unit_type_mix'],
        learningUse: ['Developer demand forecast validation', 'New launch pricing intelligence', 'Supply-demand ratio calibration'],
      },
      {
        name: 'Price History Trajectories',
        sourceTable: 'price_history',
        description: 'Historical price changes per property over time. Trains price trend models and validates appreciation/depreciation predictions.',
        status: 'collecting', weight: 'primary',
        fields: ['property_id', 'price', 'recorded_at', 'change_pct', 'change_reason', 'market_cycle_phase_at_time'],
        learningUse: ['Price trajectory modeling', 'Market cycle phase detection', 'Appreciation rate prediction by location'],
      },
    ],
  },
  {
    id: 'user', title: 'User Decision Signals', subtitle: 'Behavioral patterns revealing investment preferences and decision quality',
    icon: Eye, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    signals: [
      {
        name: 'Shortlisted But Not Purchased',
        sourceTable: 'watchlists + property_offers',
        description: 'Properties added to watchlists but never received an offer. Reveals gap between AI recommendation and actual purchase intent — indicates scoring over-confidence.',
        status: 'collecting', weight: 'secondary',
        fields: ['user_id', 'property_id', 'watchlist_added_at', 'days_in_watchlist', 'ai_score_at_time', 'reason_not_purchased'],
        learningUse: ['Recommendation false-positive reduction', 'Intent signal weight calibration', 'Investor hesitation pattern analysis'],
      },
      {
        name: 'Offer Acceptance vs Rejection Patterns',
        sourceTable: 'property_offers + offer_messages',
        description: 'Success and failure patterns in offer negotiations. Reveals which property attributes and pricing strategies lead to successful deals.',
        status: 'collecting', weight: 'primary',
        fields: ['offer_id', 'property_id', 'offered_price_vs_asking_pct', 'financing_method', 'negotiation_rounds', 'final_status', 'rejection_reason'],
        learningUse: ['Negotiation assistant training', 'Offer success probability model', 'Pricing strategy optimization'],
      },
      {
        name: 'Portfolio Reallocation Trends',
        sourceTable: 'portfolio_snapshots + watchlists',
        description: 'How investors shift their portfolio focus over time — changing city preferences, property type allocation, risk appetite evolution.',
        status: 'active', weight: 'secondary',
        fields: ['user_id', 'portfolio_composition_before', 'portfolio_composition_after', 'reallocation_trigger', 'market_conditions_at_time'],
        learningUse: ['Investor cluster evolution tracking', 'Risk appetite prediction', 'Proactive recommendation timing'],
      },
      {
        name: 'AI Recommendation Engagement Rate',
        sourceTable: 'ai_feedback_signals',
        description: 'Click-through and action rates on AI-generated recommendations. Direct measure of recommendation relevance and quality.',
        status: 'collecting', weight: 'primary',
        fields: ['user_id', 'property_id', 'recommendation_source', 'user_action', 'action_weight', 'ai_match_score', 'time_to_action_ms'],
        learningUse: ['Recommendation ranking optimization', 'Match score threshold calibration', 'Personalization accuracy scoring'],
      },
      {
        name: 'Search-to-View Conversion Funnel',
        sourceTable: 'ai_behavior_tracking',
        description: 'Conversion rates through search → view → shortlist → offer funnel. Identifies where users drop off and which property attributes drive progression.',
        status: 'collecting', weight: 'secondary',
        fields: ['session_id', 'search_query', 'results_viewed', 'details_opened', 'shortlisted', 'offer_initiated', 'funnel_drop_stage'],
        learningUse: ['Search relevance optimization', 'Listing quality scoring', 'Conversion probability model'],
      },
    ],
  },
  {
    id: 'accuracy', title: 'Prediction Accuracy Tracking', subtitle: 'Systematic comparison of AI predictions against actual outcomes',
    icon: Target, accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    signals: [
      {
        name: 'Price Prediction Accuracy Log',
        sourceTable: 'ai_model_performance + price_history',
        description: 'Every price prediction stored with actual outcome when available. Tracks MAPE (Mean Absolute Percentage Error) per model version, city, and property type.',
        status: 'collecting', weight: 'primary',
        fields: ['prediction_id', 'property_id', 'predicted_price', 'actual_price', 'error_pct', 'model_version', 'prediction_horizon', 'city', 'property_type'],
        learningUse: ['Model version comparison (A/B)', 'Regional bias correction', 'Confidence calibration per property type'],
      },
      {
        name: 'Opportunity Score Validation',
        sourceTable: 'property_scores + property_offers',
        description: 'Correlates opportunity scores at recommendation time with actual investment outcomes (ROI, time-to-sell, yield). The core learning signal for scoring weight adjustment.',
        status: 'collecting', weight: 'primary',
        fields: ['property_id', 'opportunity_score_at_recommendation', 'actual_roi_realized', 'actual_time_to_sell', 'actual_yield', 'score_accuracy_grade'],
        learningUse: ['Scoring weight auto-calibration (learning-engine)', 'Feature importance ranking', 'Score-to-outcome correlation analysis'],
      },
      {
        name: 'Demand Heat Accuracy',
        sourceTable: 'market_clusters + transaction_volume',
        description: 'Validates whether high demand heat scores actually correlate with higher transaction velocity and price appreciation in those zones.',
        status: 'active', weight: 'secondary',
        fields: ['cluster_id', 'city', 'area', 'heat_score_at_time', 'actual_transactions_30d', 'actual_price_change_pct', 'correlation_score'],
        learningUse: ['Heat score formula calibration', 'Zone-level demand accuracy', 'Geographic weighting adjustment'],
      },
      {
        name: 'Model Drift Detection',
        sourceTable: 'ai_model_registry + ai_feature_importance',
        description: 'Monitors prediction accuracy over time windows. Detects when model performance degrades (drift) due to market changes, triggering retraining.',
        status: 'active', weight: 'primary',
        fields: ['model_id', 'accuracy_7d', 'accuracy_30d', 'accuracy_90d', 'drift_score', 'drift_direction', 'last_retrained_at', 'features_shifted'],
        learningUse: ['Automatic retraining triggers', 'Feature importance evolution tracking', 'Market regime change detection'],
      },
      {
        name: 'Confidence Calibration Log',
        sourceTable: 'ai_price_confidence + outcomes',
        description: 'Tracks whether AI confidence levels are well-calibrated — 80% confidence predictions should be correct ~80% of the time.',
        status: 'active', weight: 'secondary',
        fields: ['confidence_bucket', 'prediction_count', 'correct_count', 'calibration_error', 'overconfidence_score', 'underconfidence_score'],
        learningUse: ['Confidence score recalibration', 'User trust optimization', 'Risk communication improvement'],
      },
    ],
  },
  {
    id: 'learning', title: 'Learning Execution Framework', subtitle: 'Automated model improvement, weight calibration, and shadow testing',
    icon: RefreshCw, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    signals: [
      {
        name: 'Scoring Weight Auto-Calibration',
        sourceTable: 'intelligence_worker_runs (learning-engine)',
        description: 'Every 6 hours, the learning-engine compares predicted scores against actual outcomes and adjusts component weights within ±5% safety bounds per cycle.',
        status: 'collecting', weight: 'primary',
        fields: ['run_id', 'weight_before', 'weight_after', 'adjustment_pct', 'trigger_signal', 'outcome_sample_size', 'safety_bound_hit'],
        learningUse: ['ROI weight: 30% ± drift', 'Demand weight: 20% ± drift', 'Valuation Gap weight: 20% ± drift', 'Inquiry Velocity: 15% ± drift'],
      },
      {
        name: 'Feature Importance Tracking',
        sourceTable: 'ai_feature_importance',
        description: 'Tracks which input features (location, price, size, amenities) have the most predictive power. Features losing correlation are flagged for review.',
        status: 'active', weight: 'secondary',
        fields: ['feature_name', 'importance_score', 'correlation_with_outcome', 'stability_score', 'trend', 'model_id'],
        learningUse: ['Feature selection optimization', 'Data collection priority guidance', 'Model simplification opportunities'],
      },
      {
        name: 'Shadow Model Testing',
        sourceTable: 'ai_model_registry',
        description: 'New model versions run in shadow mode — generating predictions without affecting users. Performance compared to production model before promotion.',
        status: 'active', weight: 'primary',
        fields: ['shadow_model_id', 'production_model_id', 'shadow_accuracy', 'production_accuracy', 'improvement_pct', 'sample_size', 'promotion_eligible'],
        learningUse: ['Safe model version promotion', 'A/B model comparison', 'Regression prevention'],
      },
      {
        name: 'Investor Cluster Re-clustering',
        sourceTable: 'ai_investor_clusters + ai_investor_cluster_membership',
        description: 'Periodically re-analyzes investor behavioral vectors to discover new investor personas and update cluster boundaries.',
        status: 'active', weight: 'secondary',
        fields: ['cluster_id', 'member_count', 'centroid_shift', 'new_clusters_discovered', 'members_migrated', 'reclustering_trigger'],
        learningUse: ['Recommendation personalization depth', 'New investor persona discovery', 'Marketing segment refinement'],
      },
      {
        name: 'Anomaly & Outlier Detection',
        sourceTable: 'ai_event_signals (anomaly type)',
        description: 'Flags unusual patterns — sudden score shifts, prediction outliers, unexpected market behavior — for human review or automatic model hold.',
        status: 'active', weight: 'supporting',
        fields: ['anomaly_type', 'entity_id', 'expected_value', 'actual_value', 'deviation_score', 'auto_action_taken', 'requires_review'],
        learningUse: ['Data quality assurance', 'Model safety guardrails', 'Market black swan detection'],
      },
    ],
  },
];

const LEARNING_LOOP = [
  { label: 'Collect', sub: 'Market + User signals' },
  { label: 'Compare', sub: 'Predicted vs Actual' },
  { label: 'Calibrate', sub: 'Weight adjustment ±5%' },
  { label: 'Shadow Test', sub: 'New model validation' },
  { label: 'Promote', sub: 'Deploy if improved' },
  { label: 'Monitor', sub: 'Drift detection' },
];

function SignalRow({ signal }: { signal: DataSignal }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[signal.status];
  const wt = WEIGHT_MAP[signal.weight];
  const StIcon = st.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <CircleDot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{signal.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${wt.cls}`}>{wt.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${st.cls}`}><StIcon className="h-2 w-2" /> {st.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{signal.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Source Table</span>
                <code className="block text-violet-400 font-mono mt-0.5">{signal.sourceTable}</code>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Data Fields</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {signal.fields.map(f => (
                    <code key={f} className="text-[8px] px-1.5 py-0.5 rounded bg-muted/10 border border-border/10 text-muted-foreground font-mono">{f}</code>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Learning Use</span>
                <div className="space-y-0.5 mt-0.5">
                  {signal.learningUse.map((u, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Brain className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SourceCard({ source }: { source: DataSource }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = source.icon;
  const primary = source.signals.filter(s => s.weight === 'primary').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${source.borderClass} ${source.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${source.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{source.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{source.signals.length} signals</Badge>
            {primary > 0 && <Badge variant="outline" className="text-[9px] h-5 text-rose-400 border-rose-400/30">{primary} primary</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground">{source.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {source.signals.map(s => <SignalRow key={s.name} signal={s} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AILearningFrameworkPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = DATA_SOURCES.flatMap(s => s.signals);
    return {
      sources: DATA_SOURCES.length,
      signals: all.length,
      primary: all.filter(s => s.weight === 'primary').length,
      collecting: all.filter(s => s.status === 'collecting').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return DATA_SOURCES;
    const q = searchQuery.toLowerCase();
    return DATA_SOURCES.map(s => ({
      ...s,
      signals: s.signals.filter(sig =>
        sig.name.toLowerCase().includes(q) || sig.sourceTable.toLowerCase().includes(q) ||
        sig.description.toLowerCase().includes(q) || sig.learningUse.some(u => u.toLowerCase().includes(q))
      ),
    })).filter(s => s.signals.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">AI Learning Framework Blueprint</h1>
              <p className="text-xs text-muted-foreground">Training dataset collection, accuracy tracking, and self-learning execution strategy</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Data Sources', value: stats.sources, icon: Layers },
              { label: 'Total Signals', value: stats.signals, icon: Activity },
              { label: 'Primary Signals', value: stats.primary, icon: Target },
              { label: 'Actively Collecting', value: stats.collecting, icon: Database },
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

          {/* Learning loop */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Continuous Learning Loop</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {LEARNING_LOOP.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[90px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < LEARNING_LOOP.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
              <ArrowRight className="h-3 w-3 text-primary/60 shrink-0 rotate-[135deg]" />
            </div>
          </div>

          {/* Scoring weights */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Current Scoring Weight Distribution (Auto-Calibrated)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: 'ROI Signal', weight: '30%', drift: '±5%/cycle' },
                { label: 'Demand Heat', weight: '20%', drift: '±5%/cycle' },
                { label: 'Valuation Gap', weight: '20%', drift: '±5%/cycle' },
                { label: 'Inquiry Velocity', weight: '15%', drift: '±5%/cycle' },
                { label: 'Rental Yield', weight: '10%', drift: '±5%/cycle' },
                { label: 'Luxury Index', weight: '5%', drift: '±5%/cycle' },
              ].map(w => (
                <div key={w.label} className="rounded-lg border border-border/10 bg-muted/5 p-2 text-center">
                  <span className="text-lg font-bold text-foreground">{w.weight}</span>
                  <span className="text-[9px] text-muted-foreground block">{w.label}</span>
                  <span className="text-[8px] text-muted-foreground/50 block">{w.drift}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search signals, tables, learning uses..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(s => <SourceCard key={s.id} source={s} />)}
      </div>
    </div>
  );
}
