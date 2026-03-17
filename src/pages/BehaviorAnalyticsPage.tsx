import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, MousePointer, Eye, Search, ChevronDown, ArrowRight,
  Target, Heart, ShoppingCart, Clock, Activity, Layers, Zap,
  CheckCircle2, Database, Hash, User, FileText, Map, Star,
  TrendingUp, Bell, Calculator, Home, Bookmark, Send, Play,
  Filter, Repeat, MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type EventPriority = 'critical' | 'high' | 'medium';
type TrackingMethod = 'auto' | 'explicit' | 'passive';

interface TrackingEvent {
  name: string;
  eventType: string;
  description: string;
  priority: EventPriority;
  method: TrackingMethod;
  entityType: string;
  metadataFields: string[];
  feedsInto: string[];
}

interface EventCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BarChart3;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  events: TrackingEvent[];
}

const PRIORITY_MAP: Record<EventPriority, { cls: string; label: string }> = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Critical' },
  high: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'High' },
  medium: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Medium' },
};

const METHOD_MAP: Record<TrackingMethod, { cls: string; label: string }> = {
  auto: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Auto' },
  explicit: { cls: 'text-violet-400 bg-violet-400/10 border-violet-400/30', label: 'Explicit' },
  passive: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Passive' },
};

const CATEGORIES: EventCategory[] = [
  {
    id: 'discovery', title: 'Property Discovery', subtitle: 'Search, browse, and exploration tracking',
    icon: Eye, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    events: [
      {
        name: 'Property Card Viewed', eventType: 'property_card_viewed',
        description: 'Fires when a property card enters the viewport for >1 second. Tracks which listings capture attention in search results and feeds.',
        priority: 'critical', method: 'auto', entityType: 'property',
        metadataFields: ['property_id', 'position_in_list', 'source_page', 'viewport_duration_ms', 'card_variant'],
        feedsInto: ['AI recommendation scoring', 'Demand heat calculation', 'Listing performance analytics'],
      },
      {
        name: 'Property Detail Opened', eventType: 'property_detail_opened',
        description: 'User navigated to full property detail page. Strong interest signal weighted 3x in recommendation engine.',
        priority: 'critical', method: 'auto', entityType: 'property',
        metadataFields: ['property_id', 'referrer_page', 'referrer_search_query', 'time_on_page_ms', 'scroll_depth_pct'],
        feedsInto: ['ai_feedback_signals (action_weight: 3)', 'Recently viewed strip', 'Inquiry velocity tracking'],
      },
      {
        name: 'Search Filter Applied', eventType: 'search_filter_applied',
        description: 'Captures every filter change in property search — city, price range, type, bedrooms. Builds demand preference profiles.',
        priority: 'high', method: 'explicit', entityType: 'search',
        metadataFields: ['filter_type', 'filter_value', 'result_count', 'previous_filter_state', 'session_filter_sequence'],
        feedsInto: ['Investor DNA profiling', 'Market demand signals', 'Search optimization'],
      },
      {
        name: 'Map Zone Clicked', eventType: 'map_zone_clicked',
        description: 'User interacted with the map — clicked a zone, area, or pin cluster. Reveals geographic demand patterns.',
        priority: 'high', method: 'explicit', entityType: 'location',
        metadataFields: ['zone_id', 'city', 'area', 'zoom_level', 'visible_property_count', 'click_coordinates'],
        feedsInto: ['Location intelligence', 'Demand heat clusters', 'Developer demand forecast'],
      },
      {
        name: 'Comparison Tool Opened', eventType: 'comparison_tool_opened',
        description: 'User opened side-by-side property comparison. High-intent signal indicating active evaluation phase.',
        priority: 'high', method: 'explicit', entityType: 'comparison',
        metadataFields: ['property_ids', 'comparison_criteria', 'source_page', 'comparison_duration_ms'],
        feedsInto: ['Investor cluster membership', 'Deal probability scoring', 'Similar property recommendations'],
      },
    ],
  },
  {
    id: 'intent', title: 'Investor Intent Signals', subtitle: 'High-value actions indicating purchase or investment intent',
    icon: Target, accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    events: [
      {
        name: 'Watchlist Added', eventType: 'watchlist_added',
        description: 'User saved a property to their watchlist. Core intent signal (weight: 5x) — triggers price drop alerts and recommendation refinement.',
        priority: 'critical', method: 'explicit', entityType: 'property',
        metadataFields: ['property_id', 'watchlist_name', 'source_page', 'time_since_first_view'],
        feedsInto: ['ai_feedback_signals (action_weight: 5)', 'Price drop alert subscription', 'Portfolio builder suggestions'],
      },
      {
        name: 'Offer Initiated', eventType: 'offer_initiated',
        description: 'User started creating an offer on a property. Highest intent signal (weight: 10x). Conversion funnel milestone.',
        priority: 'critical', method: 'explicit', entityType: 'offer',
        metadataFields: ['property_id', 'offer_amount', 'financing_method', 'time_to_offer_from_first_view'],
        feedsInto: ['ai_feedback_signals (action_weight: 10)', 'Agent CRM lead creation', 'Conversion funnel analytics'],
      },
      {
        name: 'Investment Report Generated', eventType: 'investment_report_generated',
        description: 'User generated an AI investment analysis report for a property. Serious evaluation signal.',
        priority: 'high', method: 'explicit', entityType: 'property',
        metadataFields: ['property_id', 'report_type', 'ai_score_at_generation', 'user_portfolio_size'],
        feedsInto: ['Investor DNA refinement', 'Premium feature usage tracking', 'Report conversion correlation'],
      },
      {
        name: 'Financing Calculator Used', eventType: 'financing_calculator_used',
        description: 'User interacted with mortgage/financing calculator. Reveals budget range and financing preferences.',
        priority: 'high', method: 'explicit', entityType: 'calculator',
        metadataFields: ['property_id', 'loan_amount', 'down_payment_pct', 'term_years', 'monthly_income_range'],
        feedsInto: ['Bank lead qualification', 'Mortgage readiness scoring', 'Investor cluster membership'],
      },
      {
        name: 'ROI Simulation Run', eventType: 'roi_simulation_run',
        description: 'User ran ROI simulation on a property. Indicates active investment evaluation with specific return expectations.',
        priority: 'high', method: 'explicit', entityType: 'property',
        metadataFields: ['property_id', 'holding_period_years', 'expected_appreciation', 'rental_income_assumption'],
        feedsInto: ['Investment advisor recommendations', 'Exit strategy advisory', 'Investor risk profiling'],
      },
    ],
  },
  {
    id: 'marketplace', title: 'Marketplace Interaction', subtitle: 'Booking, services, and developer project engagement',
    icon: ShoppingCart, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    events: [
      {
        name: 'Rental Booking Requested', eventType: 'rental_booking_requested',
        description: 'User submitted a rental booking request. Revenue-generating event tracked for marketplace GMV.',
        priority: 'critical', method: 'explicit', entityType: 'booking',
        metadataFields: ['property_id', 'check_in_date', 'check_out_date', 'guest_count', 'total_amount'],
        feedsInto: ['Revenue analytics', 'Property performance scoring', 'Owner dashboard metrics'],
      },
      {
        name: 'Service Booking Requested', eventType: 'service_booking_requested',
        description: 'User booked a vendor service (cleaning, maintenance, legal, etc.). Marketplace cross-sell tracking.',
        priority: 'high', method: 'explicit', entityType: 'service',
        metadataFields: ['service_id', 'vendor_id', 'service_type', 'booking_amount', 'property_id'],
        feedsInto: ['Vendor performance analytics', 'Service marketplace GMV', 'Cross-sell recommendation engine'],
      },
      {
        name: 'Developer Project Interest', eventType: 'developer_project_interest',
        description: 'User expressed interest in a developer project or new launch. Feeds developer demand forecasting.',
        priority: 'high', method: 'explicit', entityType: 'developer_project',
        metadataFields: ['project_id', 'developer_id', 'unit_type_interest', 'budget_range', 'timeline_preference'],
        feedsInto: ['Developer demand forecast', 'Project launch optimization', 'Investor-developer matching'],
      },
      {
        name: 'Agent Contact Initiated', eventType: 'agent_contact_initiated',
        description: 'User initiated contact with a property agent via inquiry, chat, or call request.',
        priority: 'critical', method: 'explicit', entityType: 'agent',
        metadataFields: ['agent_id', 'property_id', 'contact_method', 'inquiry_message_length', 'source_page'],
        feedsInto: ['Agent CRM leads', 'Agent leaderboard scoring', 'Inquiry velocity for demand heat'],
      },
      {
        name: 'Share / Referral Triggered', eventType: 'share_referral_triggered',
        description: 'User shared a property or triggered a referral link. Viral growth signal tracked for referral program.',
        priority: 'medium', method: 'explicit', entityType: 'share',
        metadataFields: ['property_id', 'share_channel', 'referral_code', 'recipient_count'],
        feedsInto: ['Viral campaign analytics', 'Referral conversion tracking', 'Social reach estimation'],
      },
    ],
  },
  {
    id: 'engagement', title: 'Engagement & Retention Signals', subtitle: 'Session behavior, retention patterns, and notification response',
    icon: Activity, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    events: [
      {
        name: 'Session Duration Tracked', eventType: 'session_duration_tracked',
        description: 'Passive tracking of session length, page count, and interaction depth. Fires on session end or tab close.',
        priority: 'high', method: 'passive', entityType: 'session',
        metadataFields: ['session_id', 'duration_ms', 'page_count', 'interaction_count', 'deepest_page', 'exit_page'],
        feedsInto: ['User engagement scoring', 'Retention cohort analysis', 'Churn prediction signals'],
      },
      {
        name: 'Repeat Login Frequency', eventType: 'repeat_login_detected',
        description: 'Tracks login cadence per user — daily, weekly, sporadic. Powers the check-in streak (fire emoji) and retention metrics.',
        priority: 'high', method: 'auto', entityType: 'user',
        metadataFields: ['user_id', 'login_count_7d', 'login_count_30d', 'streak_days', 'last_login_gap_hours'],
        feedsInto: ['WelcomeBackStrip streak display', 'Retention cohort classification', 'Re-engagement trigger rules'],
      },
      {
        name: 'Notification Clicked', eventType: 'notification_clicked',
        description: 'User clicked on a notification (price drop, new listing, offer update). Measures notification effectiveness.',
        priority: 'medium', method: 'explicit', entityType: 'notification',
        metadataFields: ['notification_id', 'notification_type', 'time_to_click_ms', 'source_channel', 'action_taken'],
        feedsInto: ['Notification optimization', 'Channel effectiveness scoring', 'User preference learning'],
      },
      {
        name: 'Feature Discovery Event', eventType: 'feature_discovery',
        description: 'First-time use of a platform feature (AI tools, portfolio builder, map search, etc.). Tracks feature adoption funnel.',
        priority: 'medium', method: 'auto', entityType: 'feature',
        metadataFields: ['feature_name', 'discovery_source', 'onboarding_step', 'time_since_signup_hours'],
        feedsInto: ['Feature adoption analytics', 'Onboarding optimization', 'Product-led growth metrics'],
      },
      {
        name: 'Scroll & Dwell Heatmap', eventType: 'scroll_dwell_tracked',
        description: 'Passive viewport tracking — which sections users scroll to and dwell on. Aggregated into page-level heatmaps.',
        priority: 'medium', method: 'passive', entityType: 'page',
        metadataFields: ['page_url', 'section_id', 'dwell_ms', 'scroll_depth_pct', 'viewport_width'],
        feedsInto: ['UI optimization insights', 'Content effectiveness scoring', 'A/B test signal data'],
      },
    ],
  },
];

const DATA_FLOW = [
  { label: 'User Action', sub: 'Browser event' },
  { label: 'Event Capture', sub: 'trackEvent()' },
  { label: 'ai_behavior_tracking', sub: 'PostgreSQL' },
  { label: 'ai_feedback_signals', sub: 'Weighted scores' },
  { label: 'AI Engine', sub: 'Recommendations' },
];

const SCHEMA_FIELDS = [
  { field: 'id', type: 'UUID', desc: 'Primary key (gen_random_uuid)' },
  { field: 'user_id', type: 'UUID', desc: 'FK → profiles.id (nullable for anonymous)' },
  { field: 'event_type', type: 'TEXT', desc: 'Event name (e.g., property_card_viewed)' },
  { field: 'property_id', type: 'UUID', desc: 'FK → properties.id (nullable)' },
  { field: 'session_id', type: 'UUID', desc: 'FK → user_sessions.id' },
  { field: 'event_data', type: 'JSONB', desc: 'Flexible metadata payload' },
  { field: 'duration_ms', type: 'INTEGER', desc: 'Time-based events (dwell, session)' },
  { field: 'page_url', type: 'TEXT', desc: 'Source page URL' },
  { field: 'created_at', type: 'TIMESTAMPTZ', desc: 'Event timestamp (server clock)' },
];

function EventRow({ event }: { event: TrackingEvent }) {
  const [expanded, setExpanded] = useState(false);
  const pr = PRIORITY_MAP[event.priority];
  const mt = METHOD_MAP[event.method];

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <MousePointer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{event.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${pr.cls}`}>{pr.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 border ${mt.cls}`}>{mt.label}</Badge>
            <code className="text-[8px] text-muted-foreground font-mono">{event.eventType}</code>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Entity Type</span>
                  <code className="block text-foreground font-mono mt-0.5">{event.entityType}</code>
                </div>
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Tracking Method</span>
                  <span className="block text-foreground mt-0.5 capitalize">{event.method} capture</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Metadata Fields</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {event.metadataFields.map(f => (
                    <code key={f} className="text-[8px] px-1.5 py-0.5 rounded bg-muted/10 border border-border/10 text-muted-foreground font-mono">{f}</code>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Feeds Into</span>
                <div className="space-y-0.5 mt-0.5">
                  {event.feedsInto.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{f}</span>
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

function CategoryCard({ category }: { category: EventCategory }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;
  const critical = category.events.filter(e => e.priority === 'critical').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${category.borderClass} ${category.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${category.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{category.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{category.events.length} events</Badge>
            {critical > 0 && <Badge variant="outline" className="text-[9px] h-5 text-rose-400 border-rose-400/30">{critical} critical</Badge>}
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
              {category.events.map(e => <EventRow key={e.eventType} event={e} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BehaviorAnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = CATEGORIES.flatMap(c => c.events);
    return {
      categories: CATEGORIES.length,
      events: all.length,
      critical: all.filter(e => e.priority === 'critical').length,
      auto: all.filter(e => e.method === 'auto' || e.method === 'passive').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.map(c => ({
      ...c,
      events: c.events.filter(e =>
        e.name.toLowerCase().includes(q) || e.eventType.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) || e.feedsInto.some(f => f.toLowerCase().includes(q))
      ),
    })).filter(c => c.events.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Behavior Analytics Blueprint</h1>
              <p className="text-xs text-muted-foreground">Event tracking taxonomy — property discovery, intent signals, and engagement patterns</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Event Categories', value: stats.categories, icon: Layers },
              { label: 'Total Events', value: stats.events, icon: MousePointer },
              { label: 'Critical Events', value: stats.critical, icon: Target },
              { label: 'Auto / Passive', value: stats.auto, icon: Zap },
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

          {/* Data flow pipeline */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Event Data Pipeline</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {DATA_FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[100px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < DATA_FLOW.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Storage schema */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground">Storage Table: ai_behavior_tracking</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SCHEMA_FIELDS.map(f => (
                <div key={f.field} className="rounded-lg border border-border/10 bg-muted/5 px-2.5 py-1.5 flex items-start gap-2">
                  <code className="text-[9px] font-mono text-foreground font-bold whitespace-nowrap">{f.field}</code>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[7px] h-3.5 font-mono">{f.type}</Badge>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search events, types, downstream systems..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(c => <CategoryCard key={c.id} category={c} />)}
      </div>
    </div>
  );
}
