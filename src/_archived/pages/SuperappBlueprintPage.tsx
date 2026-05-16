import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SEOHead } from '@/components/SEOHead';
import {
  Layers, Building2, Brain, Wrench, Users, Globe, Zap, Target,
  ArrowRight, ArrowDown, Activity, Shield, ChevronRight, ChevronDown,
  Cpu, Home, DollarSign, MapPin, TrendingUp, BarChart3, Bot,
  Eye, Sparkles, FileText, Handshake, Bell, Crown, Rocket,
  Package, Lock, Search, MessageCircle, Radio, GitBranch,
  Database, Server, Wifi, RefreshCw, Flame, Signal, Heart,
  CheckCircle2, Circle, Clock,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ARCHITECTURE DATA MODEL
   ═══════════════════════════════════════════════════════════ */

type LayerID = 'marketplace' | 'intelligence' | 'services' | 'community' | 'infrastructure';

interface SystemLayer {
  id: LayerID;
  name: string;
  subtitle: string;
  icon: typeof Building2;
  colorVar: string; // semantic CSS var
  modules: SystemModule[];
}

interface SystemModule {
  id: string;
  name: string;
  route?: string;
  desc: string;
  icon: typeof Building2;
  status: 'live' | 'beta' | 'planned';
  outputs?: string[];   // data signals emitted
  consumes?: string[];  // data signals consumed
}

interface DataFlow {
  from: LayerID;
  to: LayerID;
  signal: string;
  description: string;
  bidirectional?: boolean;
}

interface IntelligenceLink {
  engine: string;
  icon: typeof Brain;
  feeds: { target: string; signal: string }[];
}

const STATUS_STYLE = {
  live: { label: 'Live', color: 'text-chart-1 bg-chart-1/10 border-chart-1/30', icon: CheckCircle2 },
  beta: { label: 'Beta', color: 'text-chart-3 bg-chart-3/10 border-chart-3/30', icon: Zap },
  planned: { label: 'Planned', color: 'text-muted-foreground bg-muted/10 border-border', icon: Circle },
};

/* ─── System Layers ─────────────────────────────────────── */
const LAYERS: SystemLayer[] = [
  {
    id: 'marketplace',
    name: 'Marketplace Engine',
    subtitle: 'Listing discovery, deal execution, and transaction workflows',
    icon: Building2,
    colorVar: '--primary',
    modules: [
      { id: 'listing-discovery', name: 'Listing Discovery', route: '/properties', desc: 'Advanced search, map, filters, AI recommendations', icon: Search, status: 'live', outputs: ['search_signals', 'view_events', 'save_events'], consumes: ['opportunity_scores', 'heat_data'] },
      { id: 'property-detail', name: 'Property Detail Intelligence', route: '/property/:id', desc: 'Full property profile with AI investment overlays', icon: Home, status: 'live', outputs: ['view_events', 'inquiry_events'], consumes: ['price_predictions', 'valuation_data', 'similar_properties'] },
      { id: 'deal-execution', name: 'Deal Execution Workflow', route: '/negotiation-assistant', desc: 'Offer negotiation, counter-offer flow, and AI pricing', icon: Handshake, status: 'live', outputs: ['deal_signals', 'conversion_events'], consumes: ['fair_market_value', 'negotiation_intelligence'] },
      { id: 'agent-crm', name: 'Agent CRM Pipeline', route: '/agent-crm', desc: 'Lead tracking, pipeline management, and conversion analytics', icon: Users, status: 'live', outputs: ['lead_signals', 'agent_performance'], consumes: ['lead_distribution', 'inquiry_events'] },
      { id: 'deal-finder', name: 'Deal Finder & Auctions', route: '/deal-finder', desc: 'Below-market opportunity discovery and time-limited deals', icon: Target, status: 'live', outputs: ['deal_alerts'], consumes: ['opportunity_scores', 'price_predictions'] },
      { id: 'developer-launch', name: 'Developer Project Launch', route: '/developer-dashboard', desc: 'Off-plan projects, unit inventory, and demand forecasting', icon: Rocket, status: 'live', outputs: ['launch_signals', 'demand_data'], consumes: ['heat_data', 'absorption_forecasts'] },
    ],
  },
  {
    id: 'intelligence',
    name: 'Investment Intelligence Layer',
    subtitle: 'AI scoring, predictive analytics, and autonomous market intelligence',
    icon: Brain,
    colorVar: '--chart-2',
    modules: [
      { id: 'opportunity-scoring', name: 'Opportunity Scoring Engine', route: '/ai-autopilot', desc: 'Weighted composite: ROI 30%, Demand 20%, Gap 20%, Velocity 15%, Yield 10%, Luxury 5%', icon: Target, status: 'live', outputs: ['opportunity_scores'], consumes: ['view_events', 'inquiry_events', 'price_data', 'heat_data'] },
      { id: 'price-prediction', name: 'Price Prediction Engine', route: '/price-prediction', desc: '3/6/12-month forecasts with confidence intervals and action signals', icon: TrendingUp, status: 'live', outputs: ['price_predictions', 'fair_market_value'], consumes: ['transaction_history', 'comparable_data'] },
      { id: 'market-heat', name: 'Market Heat Cluster Engine', route: '/location-intelligence', desc: 'Geo-spatial demand hotspot detection with absorption speed analysis', icon: Flame, status: 'live', outputs: ['heat_data', 'cluster_intelligence'], consumes: ['search_signals', 'view_events', 'transaction_data'] },
      { id: 'deal-hunter', name: 'Autonomous Deal Hunter', route: '/deal-hunter-bot', desc: 'Continuous scanning for below-market anomalies and price drops', icon: Bot, status: 'live', outputs: ['deal_alerts', 'anomaly_signals'], consumes: ['price_predictions', 'opportunity_scores'] },
      { id: 'investor-dna', name: 'Investor DNA Profiler', desc: 'Behavioral clustering into personas (Conservative/Balanced/Aggressive/Luxury/Flipper)', icon: Cpu, status: 'live', outputs: ['investor_profiles', 'match_scores'], consumes: ['view_events', 'save_events', 'portfolio_data'] },
      { id: 'macro-terminal', name: 'Macro Prediction Terminal', route: '/macro-prediction', desc: 'Market cycle detection and national price index forecasting', icon: Globe, status: 'live', outputs: ['cycle_signals', 'macro_forecasts'], consumes: ['market_data', 'economic_indicators'] },
      { id: 'learning-engine', name: 'Self-Learning Loop', desc: '6-hour calibration cycle adjusting scoring weights based on outcomes', icon: RefreshCw, status: 'live', outputs: ['calibrated_weights'], consumes: ['conversion_events', 'deal_signals', 'feedback_signals'] },
    ],
  },
  {
    id: 'services',
    name: 'Service Ecosystem',
    subtitle: 'Financing integration, legal assistance, and property lifecycle services',
    icon: Wrench,
    colorVar: '--chart-1',
    modules: [
      { id: 'mortgage-calc', name: 'Mortgage & Financing', route: '/mortgage-calculator', desc: 'Bank partnership integration, eligibility assessment, and lead handoff', icon: DollarSign, status: 'live', outputs: ['financing_leads'], consumes: ['property_data', 'user_profile'] },
      { id: 'legal-services', name: 'Legal Documentation', route: '/legal-services', desc: 'SHM/AJB tracking, certificate verification, and notary workflows', icon: FileText, status: 'live', outputs: ['legal_status'], consumes: ['property_data'] },
      { id: 'vendor-marketplace', name: 'Vendor Service Marketplace', route: '/services', desc: 'Verified renovation, smart home, and maintenance vendors', icon: Wrench, status: 'live', outputs: ['service_orders'], consumes: ['property_data'] },
      { id: 'ownership-lifecycle', name: 'Ownership Lifecycle Manager', route: '/ownership-lifecycle', desc: 'Appreciation tracking, tax reminders, maintenance scheduling', icon: Package, status: 'live', outputs: ['lifecycle_events'], consumes: ['valuation_data', 'property_data'] },
      { id: 'investment-report', name: 'AI Investment Reports', route: '/investment-report', desc: 'Comprehensive buy vs rent, ROI projection, and opportunity breakdown', icon: BarChart3, status: 'live', outputs: ['report_events'], consumes: ['opportunity_scores', 'price_predictions', 'heat_data'] },
    ],
  },
  {
    id: 'community',
    name: 'Community & Growth Layer',
    subtitle: 'Referral systems, investor networking, and content distribution',
    icon: Users,
    colorVar: '--chart-4',
    modules: [
      { id: 'referral-system', name: 'Referral & Affiliate Engine', route: '/referral', desc: 'Multi-tier referral codes, commission tracking, and payout management', icon: Heart, status: 'live', outputs: ['referral_signals'], consumes: ['user_profile'] },
      { id: 'investor-social', name: 'Investor Social Network', route: '/investor-social', desc: 'Deal sharing feed, leaderboard, trending zones, collaborative watchlists', icon: Users, status: 'live', outputs: ['social_signals', 'trending_data'], consumes: ['deal_alerts', 'heat_data'] },
      { id: 'ai-assistant', name: 'AI Chat Assistant', route: '/ai-assistant', desc: 'Conversational property discovery, market queries, and investment guidance', icon: Bot, status: 'live', outputs: ['chat_intents'], consumes: ['opportunity_scores', 'price_predictions', 'property_data'] },
      { id: 'notifications', name: 'Notification Center', route: '/notifications', desc: 'Multi-channel alerts: push, email, in-app feed, and weekly digests', icon: Bell, status: 'live', outputs: [], consumes: ['deal_alerts', 'lifecycle_events', 'referral_signals'] },
      { id: 'seo-content', name: 'SEO & Content Engine', route: '/properti', desc: 'AI-generated city pages, market articles, and listing descriptions', icon: Globe, status: 'live', outputs: ['content_signals'], consumes: ['heat_data', 'market_data'] },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Platform Infrastructure',
    subtitle: 'Database, edge functions, cron orchestration, and security',
    icon: Server,
    colorVar: '--chart-5',
    modules: [
      { id: 'supabase-db', name: 'PostgreSQL (450+ Tables)', desc: 'Prefix-based schema, RLS enforcement, security_invoker views', icon: Database, status: 'live', outputs: ['data_events'], consumes: [] },
      { id: 'edge-functions', name: 'Edge Function Routers (18)', desc: 'core-engine, ai-engine, deal-engine, payment-engine, notification-engine', icon: Cpu, status: 'live', outputs: ['api_responses'], consumes: ['data_events'] },
      { id: 'cron-scheduler', name: 'pg_cron Orchestrator', desc: 'Deal Hunter 5m, Scoring 10m, Heat 30m, Prediction 60m, Learning 6h', icon: Clock, status: 'live', outputs: ['scheduled_signals'], consumes: [] },
      { id: 'realtime-bus', name: 'Realtime Event Bus', desc: 'ai_event_signals with 2min dedup, trigger-based emission, SSE streaming', icon: Radio, status: 'live', outputs: ['realtime_events'], consumes: ['data_events'] },
      { id: 'auth-rbac', name: 'Auth & RBAC', desc: '12 participant types, PermissionGate, admin_users with role hierarchy', icon: Lock, status: 'live', outputs: ['auth_context'], consumes: [] },
      { id: 'ai-cache', name: 'Intelligence Cache (4-tier)', desc: 'Hot (5m) → Warm (30m) → Cool (6h) → Frozen (24h) TTL tiers', icon: Zap, status: 'live', outputs: ['cached_intelligence'], consumes: ['opportunity_scores', 'price_predictions', 'heat_data'] },
    ],
  },
];

/* ─── Cross-Module Data Flows ──────────────────────────── */
const DATA_FLOWS: DataFlow[] = [
  { from: 'marketplace', to: 'intelligence', signal: 'Behavioral Signals', description: 'Search patterns, views, saves, inquiries → scoring & heat engines' },
  { from: 'intelligence', to: 'marketplace', signal: 'Enrichment Data', description: 'Opportunity scores, predictions, heat → listing overlays & ranking' },
  { from: 'intelligence', to: 'services', signal: 'Valuation Intelligence', description: 'Fair market values, ROI projections → reports & lifecycle' },
  { from: 'intelligence', to: 'community', signal: 'Deal Alerts', description: 'Anomaly detection, DNA matches → notifications & social feed' },
  { from: 'marketplace', to: 'services', signal: 'Property Context', description: 'Listing data, transaction events → financing, legal, vendor services' },
  { from: 'marketplace', to: 'community', signal: 'Engagement Events', description: 'Inquiries, deal closings → referral triggers, social signals' },
  { from: 'community', to: 'intelligence', signal: 'Feedback Loop', description: 'Click-throughs, dismissals, saves → learning engine weight calibration' },
  { from: 'community', to: 'marketplace', signal: 'Demand Signals', description: 'Trending zones, social interest → search ranking boost' },
  { from: 'services', to: 'intelligence', signal: 'Lifecycle Data', description: 'Ownership events, valuations → prediction refinement' },
  { from: 'infrastructure', to: 'intelligence', signal: 'Scheduled Triggers', description: 'Cron-initiated batch processing for scoring, heat, predictions' },
  { from: 'intelligence', to: 'infrastructure', signal: 'Cache Writes', description: 'Computed intelligence → 4-tier cache for fast retrieval' },
  { from: 'infrastructure', to: 'marketplace', signal: 'Auth & Data', description: 'User context, RLS-filtered data, realtime subscriptions' },
];

/* ─── Intelligence Sharing Map ─────────────────────────── */
const INTELLIGENCE_LINKS: IntelligenceLink[] = [
  {
    engine: 'Opportunity Scoring',
    icon: Target,
    feeds: [
      { target: 'Listing Discovery', signal: 'Score overlays & ranking' },
      { target: 'Deal Finder', signal: 'Elite opportunity filtering' },
      { target: 'AI Chat Assistant', signal: 'Investment recommendations' },
      { target: 'Notifications', signal: 'Score threshold alerts' },
      { target: 'Investor Social', signal: 'Top deals feed' },
    ],
  },
  {
    engine: 'Price Prediction',
    icon: TrendingUp,
    feeds: [
      { target: 'Property Detail', signal: 'Fair value & forecast overlay' },
      { target: 'Deal Execution', signal: 'Negotiation pricing intelligence' },
      { target: 'Investment Reports', signal: 'ROI projection inputs' },
      { target: 'Ownership Lifecycle', signal: 'Appreciation tracking' },
    ],
  },
  {
    engine: 'Market Heat',
    icon: Flame,
    feeds: [
      { target: 'Listing Discovery', signal: 'Heatmap layer on map' },
      { target: 'Developer Launch', signal: 'Demand zone targeting' },
      { target: 'SEO Content', signal: 'City page generation triggers' },
      { target: 'Cross-Border Discovery', signal: 'Regional intensity data' },
    ],
  },
  {
    engine: 'Investor DNA',
    icon: Cpu,
    feeds: [
      { target: 'Listing Discovery', signal: 'Personalized ranking' },
      { target: 'Notifications', signal: 'DNA-matched deal alerts' },
      { target: 'AI Chat', signal: 'Persona-aware responses' },
      { target: 'Portfolio Builder', signal: 'Risk-aligned suggestions' },
    ],
  },
  {
    engine: 'Self-Learning Loop',
    icon: RefreshCw,
    feeds: [
      { target: 'Opportunity Scoring', signal: 'Recalibrated weights' },
      { target: 'Deal Hunter', signal: 'Adjusted detection thresholds' },
      { target: 'Price Prediction', signal: 'Model accuracy tuning' },
      { target: 'Market Heat', signal: 'Absorption rate refinement' },
    ],
  },
];

const LAYER_COLORS: Record<LayerID, string> = {
  marketplace: 'hsl(var(--primary))',
  intelligence: 'hsl(var(--chart-2))',
  services: 'hsl(var(--chart-1))',
  community: 'hsl(var(--chart-4))',
  infrastructure: 'hsl(var(--chart-5))',
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* Layer Overview Tab */
const LayerOverviewTab: React.FC = () => {
  const [expanded, setExpanded] = useState<Set<LayerID>>(new Set(['marketplace', 'intelligence']));

  const toggle = (id: LayerID) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Layer stack visualization */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {LAYERS.map(l => {
          const Icon = l.icon;
          const liveCount = l.modules.filter(m => m.status === 'live').length;
          return (
            <motion.div
              key={l.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggle(l.id)}
              className="cursor-pointer rounded-xl border border-border/30 p-3 text-center hover:border-primary/30 transition-colors"
              style={{ borderLeftWidth: 3, borderLeftColor: LAYER_COLORS[l.id] }}
            >
              <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: LAYER_COLORS[l.id] }} />
              <p className="text-[10px] font-bold text-foreground leading-tight">{l.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{liveCount}/{l.modules.length} live</p>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded layer details */}
      {LAYERS.map(layer => {
        const isOpen = expanded.has(layer.id);
        const Icon = layer.icon;
        const liveCount = layer.modules.filter(m => m.status === 'live').length;
        const completion = Math.round((liveCount / layer.modules.length) * 100);

        return (
          <Card key={layer.id} className="border-border/30 overflow-hidden">
            <button onClick={() => toggle(layer.id)} className="w-full text-left">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border" style={{ borderColor: `${LAYER_COLORS[layer.id]}30`, backgroundColor: `${LAYER_COLORS[layer.id]}08` }}>
                    <Icon className="h-5 w-5" style={{ color: LAYER_COLORS[layer.id] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">{layer.name}</CardTitle>
                      <Badge variant="secondary" className="text-[9px] h-5">{layer.modules.length} modules</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{layer.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Progress value={completion} className="h-1.5 w-16" />
                      <span className="text-[10px] font-mono text-muted-foreground">{completion}%</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="px-4 pb-4 pt-0">
                    <Separator className="opacity-20 mb-3" />
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {layer.modules.map(mod => {
                        const ModIcon = mod.icon;
                        const st = STATUS_STYLE[mod.status];
                        const StIcon = st.icon;
                        return (
                          <div key={mod.id} className="p-3 rounded-lg border border-border/20 bg-card/30 hover:bg-muted/10 transition-colors space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <ModIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-xs font-semibold text-foreground">{mod.name}</span>
                              </div>
                              <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 ${st.color}`}>
                                <StIcon className="h-2.5 w-2.5" /> {st.label}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{mod.desc}</p>
                            {(mod.outputs?.length || mod.consumes?.length) ? (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {mod.outputs?.map(o => (
                                  <Badge key={o} variant="outline" className="text-[7px] h-3.5 text-chart-1 border-chart-1/20 gap-0.5">
                                    <ArrowRight className="h-2 w-2" /> {o.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                                {mod.consumes?.map(c => (
                                  <Badge key={c} variant="outline" className="text-[7px] h-3.5 text-chart-4 border-chart-4/20 gap-0.5">
                                    <ArrowDown className="h-2 w-2" /> {c.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
};

/* Data Flow Tab */
const DataFlowTab: React.FC = () => {
  const [highlight, setHighlight] = useState<LayerID | null>(null);

  const filtered = highlight
    ? DATA_FLOWS.filter(f => f.from === highlight || f.to === highlight)
    : DATA_FLOWS;

  return (
    <div className="space-y-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground mr-1">Filter by layer:</span>
        <Badge
          variant={highlight === null ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setHighlight(null)}
        >
          All
        </Badge>
        {LAYERS.map(l => (
          <Badge
            key={l.id}
            variant={highlight === l.id ? 'default' : 'outline'}
            className="cursor-pointer text-xs gap-1"
            onClick={() => setHighlight(l.id)}
          >
            <l.icon className="h-3 w-3" /> {l.name.split(' ')[0]}
          </Badge>
        ))}
      </div>

      {/* Flow cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((flow, i) => {
          const fromLayer = LAYERS.find(l => l.id === flow.from)!;
          const toLayer = LAYERS.find(l => l.id === flow.to)!;
          const FromIcon = fromLayer.icon;
          const ToIcon = toLayer.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="border-border/30 h-full">
                <CardContent className="p-4 space-y-3">
                  {/* Flow header */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded border" style={{ borderColor: `${LAYER_COLORS[flow.from]}30`, backgroundColor: `${LAYER_COLORS[flow.from]}08` }}>
                      <FromIcon className="h-3.5 w-3.5" style={{ color: LAYER_COLORS[flow.from] }} />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="p-1.5 rounded border" style={{ borderColor: `${LAYER_COLORS[flow.to]}30`, backgroundColor: `${LAYER_COLORS[flow.to]}08` }}>
                      <ToIcon className="h-3.5 w-3.5" style={{ color: LAYER_COLORS[flow.to] }} />
                    </div>
                    {flow.bidirectional && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground">{flow.signal}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{flow.description}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <span style={{ color: LAYER_COLORS[flow.from] }}>{fromLayer.name.split(' ')[0]}</span>
                    <ChevronRight className="h-2.5 w-2.5" />
                    <span style={{ color: LAYER_COLORS[flow.to] }}>{toLayer.name.split(' ')[0]}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Architecture summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GitBranch className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">Event-Driven Architecture</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                All cross-module communication flows through the <code className="text-primary text-[10px]">ai_event_signals</code> table with a 2-minute deduplication window.
                Database triggers on the <code className="text-primary text-[10px]">properties</code> table emit signals on price drops {'>'} 5%, status changes, or demand spikes.
                The <code className="text-primary text-[10px]">process-ai-events</code> Edge Function claims and dispatches targeted intelligence recalculations,
                broadcasting updates via Supabase Realtime for zero-reload UI refresh.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* Intelligence Sharing Tab */
const IntelligenceSharingTab: React.FC = () => (
  <div className="space-y-6">
    <p className="text-xs text-muted-foreground max-w-2xl">
      Each AI engine produces intelligence consumed by multiple downstream modules. This creates a closed-loop ecosystem where behavioral signals continuously recalibrate scoring models.
    </p>

    <div className="space-y-4">
      {INTELLIGENCE_LINKS.map((link, i) => {
        const EngineIcon = link.icon;
        return (
          <motion.div key={link.engine} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Engine */}
                  <div className="shrink-0 text-center">
                    <div className="p-3 rounded-xl border border-chart-2/30 bg-chart-2/5 mb-1">
                      <EngineIcon className="h-5 w-5 text-chart-2" />
                    </div>
                    <p className="text-[9px] font-bold text-foreground max-w-[80px] leading-tight">{link.engine}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center pt-4 shrink-0">
                    <div className="w-8 h-px bg-border" />
                    <ArrowRight className="h-3.5 w-3.5 text-chart-2 -ml-1" />
                  </div>

                  {/* Targets */}
                  <div className="flex-1 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {link.feeds.map(feed => (
                      <div key={feed.target} className="flex items-start gap-2 p-2 rounded-lg border border-border/15 bg-card/30">
                        <Signal className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-foreground">{feed.target}</p>
                          <p className="text-[9px] text-muted-foreground">{feed.signal}</p>
                        </div>
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

    {/* Learning loop callout */}
    <Card className="border-chart-2/20 bg-chart-2/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Closed-Loop Intelligence</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              The Self-Learning Loop runs every 6 hours, consuming actual conversion outcomes and investor engagement data from <code className="text-chart-2 text-[10px]">ai_feedback_signals</code>.
              It recalibrates the Opportunity Scoring weights (ROI, Demand, Gap, Velocity, Yield, Luxury) and adjusts Deal Hunter detection thresholds based on false positive rates.
              This creates an autonomous improvement cycle where platform intelligence becomes more accurate with each iteration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

/* Lifecycle Flow Tab */
const LifecycleFlowTab: React.FC = () => {
  const phases = [
    { phase: 'Discovery', icon: Search, color: 'hsl(var(--primary))', modules: ['Listing Discovery', 'AI Recommendations', 'Deal Finder', 'AI Chat Assistant'], signals: ['search_signals → Heat Engine', 'view_events → Scoring Engine'] },
    { phase: 'Evaluation', icon: Brain, color: 'hsl(var(--chart-2))', modules: ['Property Detail', 'Price Prediction', 'Investment Report', 'Market Heat'], signals: ['opportunity_scores → Listing overlays', 'fair_market_value → Negotiation'] },
    { phase: 'Transaction', icon: Handshake, color: 'hsl(var(--chart-3))', modules: ['Deal Execution', 'Mortgage Financing', 'Legal Documentation', 'Agent CRM'], signals: ['deal_signals → Learning Engine', 'financing_leads → Bank partners'] },
    { phase: 'Ownership', icon: Crown, color: 'hsl(var(--chart-4))', modules: ['Ownership Lifecycle', 'Vendor Services', 'Appreciation Tracking', 'Tax Reminders'], signals: ['lifecycle_events → Prediction refinement', 'valuation_data → Portfolio analytics'] },
    { phase: 'Growth', icon: TrendingUp, color: 'hsl(var(--chart-1))', modules: ['Portfolio Analytics', 'Referral System', 'Investor Social', 'Cross-Border Discovery'], signals: ['portfolio_data → DNA Profiler', 'referral_signals → Growth tracking'] },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground max-w-2xl">
        The investment lifecycle flows through 5 phases, with intelligence sharing at every transition point creating a seamless experience from first search to portfolio growth.
      </p>

      {/* Timeline */}
      <div className="relative">
        {phases.map((p, i) => {
          const PhaseIcon = p.icon;
          return (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-4 mb-6 last:mb-0"
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="p-2.5 rounded-xl border-2 z-10 bg-background" style={{ borderColor: p.color }}>
                  <PhaseIcon className="h-5 w-5" style={{ color: p.color }} />
                </div>
                {i < phases.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: `${p.color}30` }} />
                )}
              </div>

              {/* Phase content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-foreground">{p.phase}</h3>
                  <Badge variant="outline" className="text-[9px] h-4" style={{ color: p.color, borderColor: `${p.color}30` }}>Phase {i + 1}</Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {/* Modules */}
                  <div className="p-3 rounded-lg border border-border/20 bg-card/30 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Active Modules</p>
                    {p.modules.map(m => (
                      <div key={m} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-2.5 w-2.5 text-chart-1" />
                        <span className="text-[10px] text-foreground">{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Signals */}
                  <div className="p-3 rounded-lg border border-border/20 bg-card/30 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Intelligence Signals</p>
                    {p.signals.map(s => (
                      <div key={s} className="flex items-center gap-1.5">
                        <Signal className="h-2.5 w-2.5 text-chart-2" />
                        <span className="text-[10px] text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
const SuperappBlueprintPage: React.FC = () => {
  const totalModules = LAYERS.reduce((s, l) => s + l.modules.length, 0);
  const liveModules = LAYERS.reduce((s, l) => s + l.modules.filter(m => m.status === 'live').length, 0);
  const totalFlows = DATA_FLOWS.length;
  const totalIntelLinks = INTELLIGENCE_LINKS.reduce((s, l) => s + l.feeds.length, 0);

  return (
    <>
      <SEOHead
        title="Superapp Architecture Blueprint | ASTRA Villa"
        description="Integrated architectural blueprint showing how all ASTRA Villa platform modules connect into a unified intelligent real estate superapp ecosystem."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
          <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30">
                <Layers className="h-3.5 w-3.5 text-primary" /> System Blueprint
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Superapp <span className="text-primary">Architecture</span> Blueprint
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                How all platform modules connect into a unified intelligent real estate ecosystem — from listing discovery through investment lifecycle to autonomous intelligence.
              </p>

              <div className="flex items-center justify-center gap-8 pt-3">
                {[
                  { label: 'Layers', value: LAYERS.length, icon: Layers, color: 'text-primary' },
                  { label: 'Modules', value: `${liveModules}/${totalModules}`, icon: Package, color: 'text-chart-1' },
                  { label: 'Data Flows', value: totalFlows, icon: GitBranch, color: 'text-chart-2' },
                  { label: 'Intel Links', value: totalIntelLinks, icon: Signal, color: 'text-chart-4' },
                ].map(kpi => (
                  <div key={kpi.label} className="text-center">
                    <kpi.icon className={`h-4 w-4 ${kpi.color} mx-auto mb-0.5`} />
                    <p className="text-lg font-black text-foreground">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <Tabs defaultValue="layers" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-10">
              <TabsTrigger value="layers" className="text-xs gap-1"><Layers className="h-3.5 w-3.5" /> Layers</TabsTrigger>
              <TabsTrigger value="flows" className="text-xs gap-1"><GitBranch className="h-3.5 w-3.5" /> Data Flow</TabsTrigger>
              <TabsTrigger value="intelligence" className="text-xs gap-1"><Brain className="h-3.5 w-3.5" /> Intel Sharing</TabsTrigger>
              <TabsTrigger value="lifecycle" className="text-xs gap-1"><Activity className="h-3.5 w-3.5" /> Lifecycle</TabsTrigger>
            </TabsList>

            <TabsContent value="layers"><LayerOverviewTab /></TabsContent>
            <TabsContent value="flows"><DataFlowTab /></TabsContent>
            <TabsContent value="intelligence"><IntelligenceSharingTab /></TabsContent>
            <TabsContent value="lifecycle"><LifecycleFlowTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SuperappBlueprintPage;
