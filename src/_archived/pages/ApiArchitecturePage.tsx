import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Shield, Building2, Heart, Handshake, Brain, Rocket, Wrench, FileText,
  DollarSign, Zap, ChevronDown, Search, ArrowRight, Server, Database,
  Lock, Eye, RefreshCw, Plus, Trash2, Edit, Send, Bell, BarChart3,
  Code2, Layers, Activity, CheckCircle2, Circle, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'RPC' | 'EDGE';
type EndpointStatus = 'live' | 'beta' | 'planned';

interface Endpoint {
  method: HttpMethod;
  path: string;
  description: string;
  status: EndpointStatus;
  auth: 'public' | 'authenticated' | 'admin' | 'service_role';
  implementation: string;
  notes?: string;
}

interface ApiLayer {
  name: string;
  subtitle: string;
  purpose: string;
  icon: typeof Globe;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  endpoints: Endpoint[];
}

const METHOD_STYLES: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: 'bg-emerald-400/10 border-emerald-400/30', text: 'text-emerald-400' },
  POST: { bg: 'bg-sky-400/10 border-sky-400/30', text: 'text-sky-400' },
  PATCH: { bg: 'bg-amber-400/10 border-amber-400/30', text: 'text-amber-400' },
  DELETE: { bg: 'bg-rose-400/10 border-rose-400/30', text: 'text-rose-400' },
  RPC: { bg: 'bg-violet-400/10 border-violet-400/30', text: 'text-violet-400' },
  EDGE: { bg: 'bg-primary/10 border-primary/30', text: 'text-primary' },
};

const STATUS_CFG: Record<EndpointStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  live: { label: 'Live', icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  beta: { label: 'Beta', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  planned: { label: 'Planned', icon: Circle, cls: 'text-muted-foreground bg-muted/10 border-border/30' },
};

const AUTH_LABELS: Record<string, { label: string; cls: string }> = {
  public: { label: 'Public', cls: 'text-emerald-400' },
  authenticated: { label: 'Auth Required', cls: 'text-sky-400' },
  admin: { label: 'Admin Only', cls: 'text-amber-400' },
  service_role: { label: 'Service Role', cls: 'text-rose-400' },
};

const API_LAYERS: ApiLayer[] = [
  {
    name: 'Authentication & User',
    subtitle: 'Identity, sessions, and role management',
    purpose: 'Manage platform participant access, session security (30m timeout + fingerprinting), and role-based personalization via separate user_roles table.',
    icon: Shield,
    accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    endpoints: [
      { method: 'POST', path: '/auth/register', description: 'Register new user with email/password — triggers profile auto-creation', status: 'live', auth: 'public', implementation: 'supabase.auth.signUp() + DB trigger' },
      { method: 'POST', path: '/auth/login', description: 'Authenticate user and issue JWT session token', status: 'live', auth: 'public', implementation: 'supabase.auth.signInWithPassword()' },
      { method: 'GET', path: '/users/profile', description: 'Fetch authenticated user profile with preferences', status: 'live', auth: 'authenticated', implementation: 'supabase.from("profiles").select()' },
      { method: 'PATCH', path: '/users/profile', description: 'Update user profile (name, avatar, preferred city)', status: 'live', auth: 'authenticated', implementation: 'supabase.from("profiles").update()' },
      { method: 'RPC', path: 'get_user_permissions()', description: 'Fetch granular permissions via role_permissions table', status: 'live', auth: 'authenticated', implementation: 'supabase.rpc("get_user_permissions")', notes: 'Uses has_role() SECURITY DEFINER' },
      { method: 'EDGE', path: 'auth-engine', description: 'Centralized auth operations: 2FA, session heartbeat, lockout', status: 'live', auth: 'authenticated', implementation: 'Edge Function with getClaims()' },
      { method: 'EDGE', path: 'session-heartbeat', description: '5-minute heartbeat to extend session with fingerprint validation', status: 'live', auth: 'authenticated', implementation: 'Edge Function → user_sessions table' },
    ],
  },
  {
    name: 'Property Marketplace',
    subtitle: 'Listing CRUD, search, and discovery',
    purpose: 'Handle property listing lifecycle with Indonesian RE specifics (LT/LB/KT/KM, SHM/SHGB certificates) and advanced search with geo-filtering.',
    icon: Building2,
    accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    endpoints: [
      { method: 'GET', path: '/properties', description: 'List active properties with pagination, sorting, and filters', status: 'live', auth: 'public', implementation: 'supabase.from("properties").select() + RLS' },
      { method: 'GET', path: '/properties/{id}', description: 'Fetch single property with images, scores, and agent info', status: 'live', auth: 'public', implementation: 'supabase.from("properties").select("*, property_images(*)")' },
      { method: 'POST', path: '/properties/create', description: 'Create new listing (owner/agent) with image upload', status: 'live', auth: 'authenticated', implementation: 'supabase.from("properties").insert() + Storage' },
      { method: 'PATCH', path: '/properties/{id}', description: 'Update listing details — triggers price_history tracking', status: 'live', auth: 'authenticated', implementation: 'supabase.from("properties").update() + DB trigger', notes: 'Price change >5% emits ai_event_signal' },
      { method: 'DELETE', path: '/properties/{id}', description: 'Soft-delete listing (status → archived)', status: 'live', auth: 'authenticated', implementation: 'supabase.from("properties").update({ status: "archived" })' },
      { method: 'GET', path: '/properties/search', description: 'Full-text + geo search with AI-powered suggestions', status: 'live', auth: 'public', implementation: 'supabase.rpc("search_properties") + ai-search-suggestions EF' },
      { method: 'GET', path: '/properties/featured', description: 'Curated featured listings by opportunity score', status: 'live', auth: 'public', implementation: 'supabase.from("properties").order("opportunity_score")' },
      { method: 'EDGE', path: 'property-listing-assistant', description: 'AI-powered listing creation with auto-descriptions', status: 'live', auth: 'authenticated', implementation: 'Edge Function + DeepSeek AI' },
    ],
  },
  {
    name: 'Inquiry & Watchlist',
    subtitle: 'Investor engagement and monitoring',
    purpose: 'Support investor interaction loop with inquiry tracking, intelligent watchlists with price-drop alerts, and saved property collections.',
    icon: Heart,
    accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    endpoints: [
      { method: 'POST', path: '/inquiries/create', description: 'Submit property inquiry to agent with auto-notification', status: 'live', auth: 'authenticated', implementation: 'supabase.from("property_inquiries").insert()' },
      { method: 'GET', path: '/inquiries/user', description: 'List user inquiries with status tracking', status: 'live', auth: 'authenticated', implementation: 'supabase.from("property_inquiries").select()' },
      { method: 'POST', path: '/watchlist/add', description: 'Add property to investor watchlist with alert preferences', status: 'live', auth: 'authenticated', implementation: 'supabase.from("watchlist_items").insert()' },
      { method: 'DELETE', path: '/watchlist/{id}', description: 'Remove property from watchlist', status: 'live', auth: 'authenticated', implementation: 'supabase.from("watchlist_items").delete()' },
      { method: 'GET', path: '/watchlist/list', description: 'Fetch watchlist with live scores and alert status', status: 'live', auth: 'authenticated', implementation: 'supabase.from("watchlist_items").select("*, properties(*)")' },
      { method: 'POST', path: '/saved/toggle', description: 'Toggle property save/bookmark', status: 'live', auth: 'authenticated', implementation: 'supabase.from("saved_properties").upsert()' },
    ],
  },
  {
    name: 'Offer & Negotiation',
    subtitle: 'Transaction workflow management',
    purpose: 'Enable structured offer lifecycle (Submitted → Counter → Accepted → Completed) with chat-style negotiation threads and agent CRM integration.',
    icon: Handshake,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    endpoints: [
      { method: 'POST', path: '/offers/create', description: 'Submit purchase/rental offer with financing method', status: 'live', auth: 'authenticated', implementation: 'supabase.from("property_offers").insert()' },
      { method: 'PATCH', path: '/offers/{id}/status', description: 'Update offer status (accept, counter, reject, withdraw)', status: 'live', auth: 'authenticated', implementation: 'supabase.from("property_offers").update()' },
      { method: 'POST', path: '/offers/{id}/message', description: 'Send negotiation message in offer thread', status: 'live', auth: 'authenticated', implementation: 'supabase.from("offer_messages").insert()' },
      { method: 'GET', path: '/offers/property/{id}', description: 'List all offers for a property (seller/agent view)', status: 'live', auth: 'authenticated', implementation: 'supabase.from("property_offers").select()' },
      { method: 'EDGE', path: 'rental-negotiator', description: 'AI-assisted rental negotiation with market comparables', status: 'live', auth: 'authenticated', implementation: 'Edge Function + price intelligence' },
    ],
  },
  {
    name: 'AI Intelligence RPCs',
    subtitle: 'Server-side heavy computation',
    purpose: 'Run weighted scoring algorithms, price prediction models, and market clustering server-side via PostgreSQL RPCs for maximum performance.',
    icon: Brain,
    accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    endpoints: [
      { method: 'RPC', path: 'recalc_opportunity_scores()', description: 'Batch recalculate weighted opportunity scores (0-100)', status: 'live', auth: 'service_role', implementation: 'SQL RPC → ai_property_scores table', notes: 'Cron: every 10 minutes' },
      { method: 'RPC', path: 'scan_deal_alerts()', description: 'Detect undervalued properties and generate deal signals', status: 'live', auth: 'service_role', implementation: 'SQL RPC → deal_alerts table', notes: 'Threshold: score >= 75' },
      { method: 'RPC', path: 'aggregate_market_clusters()', description: 'Geo-aggregate micro-location heat clusters', status: 'live', auth: 'service_role', implementation: 'SQL RPC → market_clusters table', notes: 'Cron: every 30 minutes' },
      { method: 'RPC', path: 'compute_price_predictions()', description: 'Forecast 3m/6m/12m property price trends', status: 'live', auth: 'service_role', implementation: 'SQL RPC → properties AI columns', notes: 'Cron: every 60 minutes' },
      { method: 'RPC', path: 'compute_portfolio_snapshots()', description: 'Refresh investor portfolio ROI analytics', status: 'live', auth: 'service_role', implementation: 'SQL RPC → portfolio tables', notes: 'Cron: every 2 hours' },
      { method: 'RPC', path: 'sync_demand_heat_scores()', description: 'Sync cluster heat scores to individual properties', status: 'live', auth: 'service_role', implementation: 'SQL RPC → properties.demand_score' },
      { method: 'EDGE', path: 'intelligence-cron', description: 'Orchestrator: runs all workers in sequence with logging', status: 'live', auth: 'service_role', implementation: 'Edge Function → intelligence_worker_runs' },
      { method: 'EDGE', path: 'learning-engine', description: 'Self-calibrating scoring weights from outcome data', status: 'live', auth: 'service_role', implementation: 'Edge Function — every 6 hours' },
    ],
  },
  {
    name: 'Developer Projects',
    subtitle: 'New project launch ecosystem',
    purpose: 'Support developer project lifecycle from pre-launch interest collection to buyer lead tracking and marketing campaign generation.',
    icon: Rocket,
    accentClass: 'text-pink-400', borderClass: 'border-pink-400/30', bgClass: 'bg-pink-400',
    endpoints: [
      { method: 'POST', path: '/projects/create', description: 'Create new developer project with unit types and pricing', status: 'live', auth: 'authenticated', implementation: 'supabase.from("developer_projects").insert()', notes: 'Requires developer role' },
      { method: 'GET', path: '/projects/list', description: 'List active developer projects with filters', status: 'live', auth: 'public', implementation: 'supabase.from("developer_projects").select()' },
      { method: 'GET', path: '/projects/{id}', description: 'Fetch project details with unit availability', status: 'live', auth: 'public', implementation: 'supabase.from("developer_projects").select("*, units(*)")' },
      { method: 'POST', path: '/projects/{id}/interest', description: 'Register buyer interest in project', status: 'live', auth: 'authenticated', implementation: 'supabase.from("project_interests").insert()' },
      { method: 'EDGE', path: 'developer-demand-forecast', description: 'AI demand forecasting for project planning', status: 'live', auth: 'authenticated', implementation: 'Edge Function → demand analytics' },
      { method: 'EDGE', path: 'launch-radar', description: 'Pre-launch monitoring and price arbitrage detection', status: 'live', auth: 'authenticated', implementation: 'Edge Function → launch intelligence' },
    ],
  },
  {
    name: 'Service Marketplace',
    subtitle: 'Vendor services and bookings',
    purpose: 'Connect property owners with verified service providers across 10 categories (renovation, plumbing, smart home, etc.) with admin approval workflow.',
    icon: Wrench,
    accentClass: 'text-teal-400', borderClass: 'border-teal-400/30', bgClass: 'bg-teal-400',
    endpoints: [
      { method: 'GET', path: '/services/providers', description: 'List verified service providers with ratings', status: 'live', auth: 'public', implementation: 'supabase.from("vendor_services").select()' },
      { method: 'POST', path: '/services/request', description: 'Create quotation request with budget and urgency', status: 'live', auth: 'authenticated', implementation: 'supabase.from("service_requests").insert()' },
      { method: 'PATCH', path: '/services/{id}/status', description: 'Update service request status (accepted, completed)', status: 'live', auth: 'authenticated', implementation: 'supabase.from("service_requests").update()' },
      { method: 'EDGE', path: 'vendor-engine', description: 'Vendor operations: matching, reviews, and analytics', status: 'live', auth: 'authenticated', implementation: 'Edge Function → vendor tables' },
    ],
  },
  {
    name: 'Legal Workflow',
    subtitle: 'Documentation and compliance services',
    purpose: 'Handle Indonesian property legal documentation lifecycle (SHM, SHGB, IMB, PBB, AJB) with renewal tracking and notary coordination.',
    icon: FileText,
    accentClass: 'text-orange-400', borderClass: 'border-orange-400/30', bgClass: 'bg-orange-400',
    endpoints: [
      { method: 'POST', path: '/legal/request', description: 'Submit legal document request with type and property', status: 'live', auth: 'authenticated', implementation: 'supabase.from("legal_documents").insert()' },
      { method: 'GET', path: '/legal/user-requests', description: 'List user legal requests with status tracking', status: 'live', auth: 'authenticated', implementation: 'supabase.from("legal_documents").select()' },
      { method: 'PATCH', path: '/legal/{id}/status', description: 'Update legal request progress', status: 'live', auth: 'authenticated', implementation: 'supabase.from("legal_documents").update()' },
    ],
  },
  {
    name: 'Revenue & Subscriptions',
    subtitle: 'Monetization and premium plans',
    purpose: 'Track multi-stream revenue (commissions, subscriptions, developer packages) via Midtrans-integrated payment engine with tiered SaaS plans.',
    icon: DollarSign,
    accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    endpoints: [
      { method: 'GET', path: '/admin/revenue-summary', description: 'Aggregate revenue dashboard with commission breakdown', status: 'live', auth: 'admin', implementation: 'supabase.rpc("get_revenue_summary")' },
      { method: 'POST', path: '/subscriptions/activate', description: 'Activate premium subscription via Midtrans payment', status: 'live', auth: 'authenticated', implementation: 'payment-engine Edge Function' },
      { method: 'GET', path: '/subscriptions/status', description: 'Check current subscription tier and expiry', status: 'live', auth: 'authenticated', implementation: 'supabase.from("subscriptions").select()' },
      { method: 'EDGE', path: 'payment-engine', description: 'Centralized Midtrans payment processing', status: 'live', auth: 'public', implementation: 'Edge Function → midtrans API', notes: 'Handles webhooks too' },
      { method: 'EDGE', path: 'subscription-handler', description: 'Subscription lifecycle and tier enforcement', status: 'live', auth: 'authenticated', implementation: 'Edge Function → subscriptions table' },
    ],
  },
  {
    name: 'Real-Time Intelligence',
    subtitle: 'Event-driven autonomous behavior',
    purpose: 'React to market changes in real-time via event signals pipeline. DB triggers emit signals → Edge Functions dispatch targeted recalculations → Realtime broadcasts UI updates.',
    icon: Zap,
    accentClass: 'text-yellow-400', borderClass: 'border-yellow-400/30', bgClass: 'bg-yellow-400',
    endpoints: [
      { method: 'EDGE', path: 'process-ai-events', description: 'Claim unprocessed signals and dispatch worker recalculations', status: 'live', auth: 'service_role', implementation: 'Edge Function → EVENT_WORKER_MAP dispatch', notes: '2-min deduplication window' },
      { method: 'EDGE', path: 'notification-engine', description: 'Send investor alerts: price drops, elite opportunities', status: 'live', auth: 'service_role', implementation: 'Edge Function → notifications table + Realtime' },
      { method: 'EDGE', path: 'compute-opportunity-scores', description: 'Targeted re-scoring triggered by event pipeline', status: 'live', auth: 'service_role', implementation: 'Edge Function → recalc_opportunity_scores RPC' },
      { method: 'EDGE', path: 'aggregate-market-heat', description: 'Targeted heat cluster refresh from demand signals', status: 'live', auth: 'service_role', implementation: 'Edge Function → aggregate_market_clusters RPC' },
      { method: 'EDGE', path: 'predict-property-prices', description: 'Targeted price re-prediction from price change events', status: 'live', auth: 'service_role', implementation: 'Edge Function → compute_price_predictions RPC' },
      { method: 'EDGE', path: 'health-monitor', description: 'System health checks and worker status reporting', status: 'live', auth: 'service_role', implementation: 'Edge Function → intelligence_worker_runs' },
    ],
  },
];

function EndpointRow({ ep }: { ep: Endpoint }) {
  const ms = METHOD_STYLES[ep.method];
  const sc = STATUS_CFG[ep.status];
  const SIcon = sc.icon;
  const ac = AUTH_LABELS[ep.auth];

  return (
    <div className="group px-3 py-2.5 rounded-lg hover:bg-muted/5 transition-colors border border-transparent hover:border-border/10">
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={`text-[9px] font-bold font-mono h-5 w-14 justify-center shrink-0 mt-0.5 ${ms.bg} ${ms.text} border`}>
          {ep.method}
        </Badge>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[11px] font-mono font-semibold text-foreground">{ep.path}</code>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 ${sc.cls}`}>
              <SIcon className="h-2 w-2" /> {sc.label}
            </Badge>
            <span className={`text-[8px] font-medium ${ac.cls}`}>
              <Lock className="h-2 w-2 inline mr-0.5" />{ac.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{ep.description}</p>
          <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-muted-foreground/70">
              <Code2 className="h-2.5 w-2.5 inline mr-0.5" />
              {ep.implementation}
            </span>
            {ep.notes && (
              <span className="text-[9px] text-amber-400/70">
                <Activity className="h-2.5 w-2.5 inline mr-0.5" />
                {ep.notes}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerCard({ layer }: { layer: ApiLayer }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = layer.icon;

  const methodCounts = useMemo(() => {
    const counts: Partial<Record<HttpMethod, number>> = {};
    layer.endpoints.forEach(ep => { counts[ep.method] = (counts[ep.method] || 0) + 1; });
    return counts;
  }, [layer.endpoints]);

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${layer.borderClass} ${layer.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${layer.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{layer.name}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{layer.endpoints.length} endpoints</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{layer.subtitle}</p>
          <div className="flex gap-1 mt-1">
            {Object.entries(methodCounts).map(([m, c]) => {
              const s = METHOD_STYLES[m as HttpMethod];
              return (
                <Badge key={m} variant="outline" className={`text-[8px] h-4 ${s.bg} ${s.text} border`}>
                  {m} ×{c}
                </Badge>
              );
            })}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-2">
              <Separator className="opacity-15" />
              <div className={`rounded-lg border ${layer.borderClass} ${layer.bgClass}/5 p-2.5`}>
                <p className="text-[10px] text-foreground leading-relaxed">{layer.purpose}</p>
              </div>
              <div className="space-y-0.5">
                {layer.endpoints.map((ep, i) => <EndpointRow key={i} ep={ep} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiArchitecturePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = API_LAYERS.flatMap(l => l.endpoints);
    const methods: Record<string, number> = {};
    all.forEach(ep => { methods[ep.method] = (methods[ep.method] || 0) + 1; });
    return { total: all.length, layers: API_LAYERS.length, methods, live: all.filter(e => e.status === 'live').length };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return API_LAYERS;
    const q = searchQuery.toLowerCase();
    return API_LAYERS.map(l => ({
      ...l,
      endpoints: l.endpoints.filter(ep =>
        ep.path.toLowerCase().includes(q) || ep.description.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q) || ep.implementation.toLowerCase().includes(q)
      ),
    })).filter(l => l.endpoints.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">API & Edge Function Architecture</h1>
              <p className="text-xs text-muted-foreground">Backend service layer blueprint — endpoints, RPCs, and Edge Functions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Total Endpoints', value: stats.total, icon: Globe },
              { label: 'API Layers', value: stats.layers, icon: Layers },
              { label: 'Live', value: stats.live, icon: CheckCircle2 },
              { label: 'Edge Functions', value: stats.methods['EDGE'] || 0, icon: Zap },
              { label: 'RPCs', value: stats.methods['RPC'] || 0, icon: Database },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Architecture flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Request Flow Architecture</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {['Client (React)', 'Supabase Client SDK', 'PostgREST / Edge Functions', 'PostgreSQL + RPC', 'AI Intelligence Layer'].map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                  <div className="px-2.5 py-1 rounded-lg border border-border/20 bg-muted/5">
                    <span className="text-muted-foreground font-medium">{step}</span>
                  </div>
                  {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Method legend */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Methods:</span>
            {Object.entries(METHOD_STYLES).map(([method, style]) => (
              <Badge key={method} variant="outline" className={`text-[9px] h-5 ${style.bg} ${style.text} border`}>
                {method}
              </Badge>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search endpoints, paths, implementations..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Layers */}
      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map((layer) => <LayerCard key={layer.name} layer={layer} />)}
      </div>
    </div>
  );
}
