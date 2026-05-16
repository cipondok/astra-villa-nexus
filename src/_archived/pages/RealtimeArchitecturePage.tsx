import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Zap, ChevronDown, Search, ArrowRight, Shield, Activity,
  TrendingUp, Building2, Handshake, Bell, Eye, Users, Server,
  Wifi, WifiOff, Hash, Layers, Target, MessageSquare, DollarSign,
  Brain, AlertTriangle, CheckCircle2, Circle, Clock, Send, ArrowDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type ChannelType = 'broadcast' | 'postgres_changes' | 'presence';
type EventPriority = 'critical' | 'high' | 'normal' | 'low';
type SubRole = 'investor' | 'agent' | 'admin' | 'owner' | 'all';

interface RealtimeEvent {
  name: string;
  description: string;
  priority: EventPriority;
  payload: string;
  trigger: string;
  uiAction: string;
}

interface RealtimeChannel {
  channelName: string;
  type: ChannelType;
  description: string;
  subscribers: SubRole[];
  table?: string;
  filter?: string;
  events: RealtimeEvent[];
}

interface ChannelGroup {
  name: string;
  subtitle: string;
  purpose: string;
  icon: typeof Radio;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  channels: RealtimeChannel[];
}

const PRIORITY_STYLES: Record<EventPriority, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
  high: { label: 'High', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  normal: { label: 'Normal', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  low: { label: 'Low', cls: 'text-muted-foreground bg-muted/10 border-border/30' },
};

const CHANNEL_TYPE_STYLES: Record<ChannelType, { label: string; cls: string }> = {
  broadcast: { label: 'Broadcast', cls: 'text-violet-400 bg-violet-400/10 border-violet-400/30' },
  postgres_changes: { label: 'DB Changes', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  presence: { label: 'Presence', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
};

const ROLE_STYLES: Record<SubRole, { label: string; cls: string }> = {
  investor: { label: 'Investor', cls: 'text-amber-400 border-amber-400/30' },
  agent: { label: 'Agent', cls: 'text-sky-400 border-sky-400/30' },
  admin: { label: 'Admin', cls: 'text-rose-400 border-rose-400/30' },
  owner: { label: 'Owner', cls: 'text-emerald-400 border-emerald-400/30' },
  all: { label: 'All Users', cls: 'text-muted-foreground border-border/30' },
};

const CHANNEL_GROUPS: ChannelGroup[] = [
  {
    name: 'Investor Intelligence',
    subtitle: 'Live AI signals and investment opportunities',
    purpose: 'Push real-time intelligence signals to investor dashboards — elite deals, price drops, market heat surges, and recommendation updates. Subscribers filtered by user watchlist and preference matching.',
    icon: Brain,
    accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    channels: [
      {
        channelName: 'intelligence:signals',
        type: 'broadcast',
        description: 'Global intelligence broadcast — AI engines push scored signals',
        subscribers: ['investor'],
        events: [
          { name: 'elite_deal_detected', description: 'Property scores ≥85 opportunity — immediate investor alert', priority: 'critical', payload: '{ property_id, score, city, price, reason }', trigger: 'compute-opportunity-scores EF when score ≥ 85', uiAction: 'Toast notification + badge pulse on Autopilot dashboard' },
          { name: 'price_drop_alert', description: 'Watched property price decreased >5% — triggers re-scoring', priority: 'high', payload: '{ property_id, old_price, new_price, drop_pct }', trigger: 'DB trigger on properties.price UPDATE > 5% change', uiAction: 'Toast + watchlist item highlight animation' },
          { name: 'market_heat_surge', description: 'Cluster heat score jumped >15 points in single computation', priority: 'high', payload: '{ cluster_id, city, area, old_score, new_score }', trigger: 'aggregate-market-heat EF detects >15pt delta', uiAction: 'Heat map pulse animation + notification badge' },
          { name: 'recommendation_update', description: 'New AI investment recommendation generated for user profile match', priority: 'normal', payload: '{ property_id, tier, confidence, reasoning }', trigger: 'generate-recommendations EF on fresh scoring data', uiAction: 'Recommendation feed auto-refresh' },
        ],
      },
      {
        channelName: 'intelligence:predictions',
        type: 'broadcast',
        description: 'Price prediction and forecast updates',
        subscribers: ['investor'],
        events: [
          { name: 'forecast_updated', description: 'Property 3m/6m/12m price forecast recalculated', priority: 'normal', payload: '{ property_id, forecast_3m, forecast_6m, forecast_12m, confidence }', trigger: 'predict-property-prices EF batch completion', uiAction: 'Price chart auto-refresh on property detail page' },
          { name: 'valuation_gap_alert', description: 'Property detected as significantly undervalued (>15% gap)', priority: 'high', payload: '{ property_id, listed_price, estimated_value, gap_pct }', trigger: 'Price prediction detects valuation_gap_pct > 15', uiAction: 'Deal finder badge + opportunity card highlight' },
        ],
      },
      {
        channelName: `watchlist:${'{user_id}'}`,
        type: 'postgres_changes',
        description: 'Per-user watchlist property changes — filtered by user_id',
        subscribers: ['investor'],
        table: 'properties',
        filter: 'id=in.(user watchlist property_ids)',
        events: [
          { name: 'watched_property_updated', description: 'Any field change on a watched property', priority: 'normal', payload: '{ property_id, changed_fields, old_values, new_values }', trigger: 'Postgres INSERT/UPDATE on properties where id in watchlist', uiAction: 'Watchlist item indicator + field diff tooltip' },
          { name: 'watched_property_sold', description: 'Watched property status changed to sold/reserved', priority: 'high', payload: '{ property_id, new_status }', trigger: 'Postgres UPDATE properties.status to sold/reserved', uiAction: 'Watchlist removal prompt + similar suggestions' },
        ],
      },
    ],
  },
  {
    name: 'Transaction & Negotiation',
    subtitle: 'Offer lifecycle and deal communication',
    purpose: 'Real-time offer status changes, negotiation messages, and booking updates. Both buyer and seller receive instant notifications on their respective channels.',
    icon: Handshake,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    channels: [
      {
        channelName: `offers:${'{property_id}'}`,
        type: 'postgres_changes',
        description: 'Live offer tracking for a specific property',
        subscribers: ['investor', 'owner', 'agent'],
        table: 'property_offers',
        filter: 'property_id=eq.{property_id}',
        events: [
          { name: 'new_offer_received', description: 'New purchase/rental offer submitted on property', priority: 'critical', payload: '{ offer_id, buyer_id, offer_price, financing_method }', trigger: 'Postgres INSERT on property_offers', uiAction: 'Seller toast + offer counter badge + notification bell' },
          { name: 'offer_status_changed', description: 'Offer accepted, countered, rejected, or withdrawn', priority: 'high', payload: '{ offer_id, old_status, new_status, counter_price? }', trigger: 'Postgres UPDATE on property_offers.status', uiAction: 'Status badge animation + action prompt modal' },
          { name: 'offer_expired', description: 'Offer passed expiry deadline without response', priority: 'normal', payload: '{ offer_id, expired_at }', trigger: 'Postgres UPDATE via scheduled expiry check', uiAction: 'Offer card greyed out + renewal prompt' },
        ],
      },
      {
        channelName: `negotiation:${'{offer_id}'}`,
        type: 'postgres_changes',
        description: 'Chat-style negotiation thread for a specific offer',
        subscribers: ['investor', 'owner', 'agent'],
        table: 'offer_messages',
        filter: 'offer_id=eq.{offer_id}',
        events: [
          { name: 'negotiation_message', description: 'New message in offer negotiation thread', priority: 'high', payload: '{ message_id, sender_id, message, message_type }', trigger: 'Postgres INSERT on offer_messages', uiAction: 'Chat bubble animation + unread counter' },
          { name: 'counter_offer_sent', description: 'Counter-offer message with new price proposal', priority: 'critical', payload: '{ message_id, counter_price, sender_role }', trigger: 'Postgres INSERT where message_type = counter', uiAction: 'Price comparison widget + accept/reject buttons' },
        ],
      },
      {
        channelName: 'inquiries:agent:{agent_id}',
        type: 'postgres_changes',
        description: 'Agent-specific inquiry feed for managed listings',
        subscribers: ['agent'],
        table: 'property_inquiries',
        filter: 'agent_id=eq.{agent_id}',
        events: [
          { name: 'new_inquiry', description: 'New buyer inquiry on agent-managed listing', priority: 'high', payload: '{ inquiry_id, property_id, user_id, message }', trigger: 'Postgres INSERT on property_inquiries', uiAction: 'Agent CRM badge + lead pipeline update' },
          { name: 'inquiry_followup', description: 'Buyer sent follow-up message on existing inquiry', priority: 'normal', payload: '{ inquiry_id, message }', trigger: 'Postgres UPDATE on property_inquiries', uiAction: 'Inquiry thread refresh' },
        ],
      },
    ],
  },
  {
    name: 'Notification Hub',
    subtitle: 'Unified multi-role notification delivery',
    purpose: 'Central notification channel that delivers categorized alerts (investor, transaction, property, system) to the correct user in real-time via Supabase Realtime subscription on the notifications table.',
    icon: Bell,
    accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    channels: [
      {
        channelName: `notifications:${'{user_id}'}`,
        type: 'postgres_changes',
        description: 'Per-user notification stream — all categories',
        subscribers: ['all'],
        table: 'notifications',
        filter: 'user_id=eq.{user_id}',
        events: [
          { name: 'investor_notification', description: 'Investment-specific alerts (opportunities, portfolio risk)', priority: 'high', payload: '{ type: "investor", title, message, metadata }', trigger: 'notification-engine EF or sendNotification() utility', uiAction: 'Bell badge counter + toast with action link' },
          { name: 'transaction_notification', description: 'Deal-related updates (offers, payments, contracts)', priority: 'high', payload: '{ type: "transaction", title, message, reference_id }', trigger: 'DB trigger on transaction state changes', uiAction: 'Bell badge + transaction timeline refresh' },
          { name: 'property_notification', description: 'Listing updates (new match, status change, review)', priority: 'normal', payload: '{ type: "property", title, message, property_id }', trigger: 'Property lifecycle events', uiAction: 'Bell badge + feed card insertion' },
          { name: 'system_notification', description: 'Platform announcements, maintenance, feature releases', priority: 'low', payload: '{ type: "system", title, message }', trigger: 'Admin broadcast via notification-engine EF', uiAction: 'Banner notification + dismissable toast' },
        ],
      },
    ],
  },
  {
    name: 'Admin Intelligence',
    subtitle: 'System health and platform monitoring',
    purpose: 'Admin-only channels for AI engine status, listing volume spikes, revenue milestones, and worker health monitoring. Powers the Admin Control Panel with live operational awareness.',
    icon: Shield,
    accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    channels: [
      {
        channelName: 'admin:intelligence',
        type: 'broadcast',
        description: 'AI engine operational status and health signals',
        subscribers: ['admin'],
        events: [
          { name: 'ai_engine_status_change', description: 'Intelligence worker status transition (running → success/error)', priority: 'high', payload: '{ worker_name, old_status, new_status, duration_ms, error? }', trigger: 'intelligence_worker_runs table INSERT/UPDATE', uiAction: 'Worker health panel status dot + error alert' },
          { name: 'scoring_batch_complete', description: 'Opportunity scoring batch finished with row count', priority: 'normal', payload: '{ worker: "opportunity_scoring", rows_affected, duration_ms }', trigger: 'intelligence-cron EF completion callback', uiAction: 'Worker dashboard stats refresh' },
          { name: 'event_pipeline_backlog', description: 'Unprocessed signal count exceeds threshold (>50)', priority: 'critical', payload: '{ pending_count, oldest_signal_age_ms }', trigger: 'health-monitor EF periodic check', uiAction: 'Red alert banner + auto-trigger processing' },
        ],
      },
      {
        channelName: 'admin:marketplace',
        type: 'broadcast',
        description: 'Marketplace volume and revenue signals',
        subscribers: ['admin'],
        events: [
          { name: 'listing_volume_spike', description: 'New listings in last hour exceed 2x daily average', priority: 'high', payload: '{ count_last_hour, daily_avg, spike_ratio }', trigger: 'Scheduled health check detects volume anomaly', uiAction: 'Admin alert + marketplace metrics refresh' },
          { name: 'revenue_milestone_alert', description: 'Daily/monthly revenue crossed configured threshold', priority: 'critical', payload: '{ metric, threshold, actual_value, period }', trigger: 'check_revenue_alerts() pg_cron function', uiAction: 'Revenue dashboard highlight + celebration toast' },
          { name: 'inquiry_surge', description: 'Inquiry volume on a single listing exceeds threshold', priority: 'normal', payload: '{ property_id, inquiry_count, time_window }', trigger: 'Aggregate inquiry monitoring', uiAction: 'Hot listing badge + demand signal emission' },
        ],
      },
      {
        channelName: 'admin:alerts',
        type: 'postgres_changes',
        description: 'Live admin alert feed from admin_alerts table',
        subscribers: ['admin'],
        table: 'admin_alerts',
        events: [
          { name: 'new_admin_alert', description: 'New high-priority admin alert inserted', priority: 'high', payload: '{ id, title, message, priority, type, action_required }', trigger: 'Postgres INSERT on admin_alerts', uiAction: 'Admin bell badge + alert panel auto-refresh' },
        ],
      },
    ],
  },
  {
    name: 'Presence & Activity',
    subtitle: 'Online status and collaborative awareness',
    purpose: 'Track active users on property pages for social proof, agent online status for inquiry routing, and admin active session monitoring.',
    icon: Users,
    accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    channels: [
      {
        channelName: `property:viewers:${'{property_id}'}`,
        type: 'presence',
        description: 'Live viewer count on property detail pages',
        subscribers: ['all'],
        events: [
          { name: 'viewer_joined', description: 'User opened property detail page', priority: 'low', payload: '{ user_id?, anonymous: bool }', trigger: 'Presence track() on page mount', uiAction: '"X people viewing" badge on property card' },
          { name: 'viewer_left', description: 'User navigated away from property page', priority: 'low', payload: '{ user_id? }', trigger: 'Presence untrack() on page unmount', uiAction: 'Viewer count decrement' },
        ],
      },
      {
        channelName: 'agents:online',
        type: 'presence',
        description: 'Agent online status for inquiry routing priority',
        subscribers: ['agent'],
        events: [
          { name: 'agent_online', description: 'Agent app is active with valid session', priority: 'low', payload: '{ agent_id, last_active }', trigger: 'Presence sync on agent dashboard mount', uiAction: 'Green dot on agent profile + inquiry routing boost' },
          { name: 'agent_offline', description: 'Agent session ended or timed out', priority: 'low', payload: '{ agent_id }', trigger: 'Presence leave on disconnect/timeout', uiAction: 'Grey dot + route inquiries to next available' },
        ],
      },
    ],
  },
];

function EventRow({ event }: { event: RealtimeEvent }) {
  const ps = PRIORITY_STYLES[event.priority];
  return (
    <div className="group px-3 py-2.5 rounded-lg hover:bg-muted/5 transition-colors">
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={`text-[8px] h-5 w-16 justify-center shrink-0 mt-0.5 border ${ps.cls}`}>{ps.label}</Badge>
        <div className="flex-1 min-w-0">
          <code className="text-[10px] font-mono font-semibold text-foreground">{event.name}</code>
          <p className="text-[10px] text-muted-foreground mt-0.5">{event.description}</p>
          <div className="mt-1.5 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-start gap-1.5">
              <Send className="h-2.5 w-2.5 text-muted-foreground/50 mt-0.5 shrink-0" />
              <span className="text-[9px] text-muted-foreground/70 font-mono">{event.payload}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Zap className="h-2.5 w-2.5 text-amber-400/50 mt-0.5 shrink-0" />
              <span className="text-[9px] text-amber-400/70">{event.trigger}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Eye className="h-2.5 w-2.5 text-emerald-400/50 mt-0.5 shrink-0" />
              <span className="text-[9px] text-emerald-400/70">{event.uiAction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ channel }: { channel: RealtimeChannel }) {
  const [expanded, setExpanded] = useState(false);
  const cts = CHANNEL_TYPE_STYLES[channel.type];

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Radio className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[10px] font-mono font-bold text-foreground">{channel.channelName}</code>
            <Badge variant="outline" className={`text-[8px] h-4 border ${cts.cls}`}>{cts.label}</Badge>
            {channel.table && <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground border-border/30">→ {channel.table}</Badge>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-muted-foreground">{channel.description}</span>
            <span className="text-muted-foreground/30">·</span>
            {channel.subscribers.map(r => {
              const rs = ROLE_STYLES[r];
              return <Badge key={r} variant="outline" className={`text-[7px] h-3.5 ${rs.cls}`}>{rs.label}</Badge>;
            })}
          </div>
        </div>
        <Badge variant="outline" className="text-[8px] h-4 shrink-0">{channel.events.length} events</Badge>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-0.5">
              <Separator className="opacity-10 mb-1" />
              {channel.filter && (
                <div className="text-[9px] font-mono text-muted-foreground/60 px-3 py-1">filter: {channel.filter}</div>
              )}
              {channel.events.map(ev => <EventRow key={ev.name} event={ev} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GroupCard({ group }: { group: ChannelGroup }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = group.icon;
  const totalEvents = group.channels.reduce((s, c) => s + c.events.length, 0);

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${group.borderClass} ${group.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${group.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{group.channels.length} channels</Badge>
            <Badge variant="outline" className="text-[9px] h-5">{totalEvents} events</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{group.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-2">
              <Separator className="opacity-15" />
              <div className={`rounded-lg border ${group.borderClass} ${group.bgClass}/5 p-2.5`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className={`h-3 w-3 ${group.accentClass}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${group.accentClass}`}>Purpose</span>
                </div>
                <p className="text-[10px] text-foreground leading-relaxed">{group.purpose}</p>
              </div>
              <div className="space-y-1.5">
                {group.channels.map(ch => <ChannelCard key={ch.channelName} channel={ch} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RealtimeArchitecturePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const allChannels = CHANNEL_GROUPS.flatMap(g => g.channels);
    const allEvents = allChannels.flatMap(c => c.events);
    const types: Record<string, number> = {};
    allChannels.forEach(c => { types[c.type] = (types[c.type] || 0) + 1; });
    return { channels: allChannels.length, events: allEvents.length, groups: CHANNEL_GROUPS.length, types };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return CHANNEL_GROUPS;
    const q = searchQuery.toLowerCase();
    return CHANNEL_GROUPS.map(g => ({
      ...g,
      channels: g.channels.map(c => ({
        ...c,
        events: c.events.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
      })).filter(c => c.events.length > 0 || c.channelName.toLowerCase().includes(q)),
    })).filter(g => g.channels.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Wifi className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Realtime Event Architecture</h1>
              <p className="text-xs text-muted-foreground">Supabase Realtime channel structure — broadcast, DB changes, and presence</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Channels', value: stats.channels, icon: Radio },
              { label: 'Event Types', value: stats.events, icon: Zap },
              { label: 'Channel Groups', value: stats.groups, icon: Layers },
              { label: 'DB Change Channels', value: stats.types['postgres_changes'] || 0, icon: Activity },
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

          {/* Subscription flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Realtime Event Flow</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'DB Trigger / Edge Function', sub: 'Event Source' },
                { label: 'ai_event_signals / notifications', sub: 'Signal Table' },
                { label: 'Supabase Realtime', sub: 'Broadcast Layer' },
                { label: 'Client Subscription', sub: 'Role-Filtered' },
                { label: 'UI Update', sub: 'Toast / Badge / Refresh' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center">
                    <span className="text-muted-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Channel type legend */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Channel Types:</span>
            {Object.entries(CHANNEL_TYPE_STYLES).map(([type, style]) => (
              <Badge key={type} variant="outline" className={`text-[9px] h-5 border ${style.cls}`}>{style.label}</Badge>
            ))}
            <span className="text-muted-foreground/30 mx-1">|</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Subscribers:</span>
            {Object.entries(ROLE_STYLES).map(([role, style]) => (
              <Badge key={role} variant="outline" className={`text-[8px] h-4 ${style.cls}`}>{style.label}</Badge>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search channels, events, descriptions..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(g => <GroupCard key={g.name} group={g} />)}
      </div>
    </div>
  );
}
