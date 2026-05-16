import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Brain, TrendingUp, Users, Wrench, Rocket, MessageCircle,
  Globe, Sparkles, Shield, ChevronRight, ChevronDown, Layers, Target,
  BarChart3, MapPin, Home, DollarSign, Search, Zap, Eye, Star,
  Package, FileText, Bell, Handshake, GraduationCap, Megaphone,
  Bot, Cpu, Crown, Lock, ArrowUpRight, ExternalLink, CheckCircle2,
  Circle, Clock, AlertTriangle, Gem
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// ─── Types ───────────────────────────────────────────────────────────
type ModuleStatus = 'live' | 'beta' | 'development' | 'planned';
type LayerKey = 'marketplace' | 'intelligence' | 'investor' | 'services' | 'developer' | 'transaction' | 'growth' | 'innovation' | 'admin';

interface Module {
  id: string;
  name: string;
  description: string;
  route?: string;
  status: ModuleStatus;
  dependencies?: string[];
  icon: typeof Building2;
}

interface ProductLayer {
  key: LayerKey;
  name: string;
  description: string;
  icon: typeof Building2;
  color: string;
  modules: Module[];
}

// ─── Status Config ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<ModuleStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  live: { label: 'Live', icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  beta: { label: 'Beta', icon: Zap, className: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  development: { label: 'In Dev', icon: Clock, className: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  planned: { label: 'Planned', icon: Circle, className: 'text-muted-foreground bg-muted/10 border-border/30' },
};

// ─── Product Layers ──────────────────────────────────────────────────
const PRODUCT_LAYERS: ProductLayer[] = [
  {
    key: 'marketplace',
    name: 'Property Marketplace',
    description: 'Core listing, discovery, and transaction engine',
    icon: Building2,
    color: 'hsl(var(--primary))',
    modules: [
      { id: 'mp-buy-sell', name: 'Property Buy & Sale Listings', description: 'Full-featured listing management with advanced search, filters, and map integration', route: '/properties', status: 'live', icon: Home },
      { id: 'mp-rental', name: 'Rental Marketplace', description: 'Short and long-term rental listings with availability calendar', route: '/properties?type=rent', status: 'live', icon: Building2 },
      { id: 'mp-dev-launch', name: 'Developer Project Launch', description: 'Off-plan project showcase with masterplan, unit inventory, and launch phases', route: '/developer-dashboard', status: 'live', icon: Rocket },
      { id: 'mp-auction', name: 'Property Auction & Flash Deals', description: 'Time-limited deal discovery with countdown timers and bidding mechanics', route: '/deal-finder', status: 'beta', icon: Zap },
      { id: 'mp-compare', name: 'AI Property Comparison', description: 'Side-by-side intelligent comparison across investment metrics', route: '/compare', status: 'live', icon: BarChart3 },
    ],
  },
  {
    key: 'intelligence',
    name: 'Investment Intelligence',
    description: 'AI-powered market analysis and scoring engines',
    icon: Brain,
    color: 'hsl(var(--chart-2))',
    modules: [
      { id: 'ai-opp-score', name: 'Opportunity Scoring Engine', description: 'Weighted composite model: ROI (30%), Demand (20%), Valuation Gap (20%), Velocity (15%), Yield (10%), Luxury (5%)', route: '/ai-autopilot', status: 'live', icon: Target },
      { id: 'ai-deal-hunter', name: 'AI Deal Hunter Bot', description: 'Autonomous deal discovery scanning below-market opportunities', route: '/deal-hunter-bot', status: 'live', icon: Bot },
      { id: 'ai-valuation', name: 'Automated Property Valuation', description: 'Fair market value estimation with comparable analysis and confidence scoring', route: '/price-prediction', status: 'live', icon: DollarSign },
      { id: 'ai-price-pred', name: 'Price Prediction Analytics', description: '3/6/12-month forecasts with valuation gap detection and action hints', route: '/price-prediction', status: 'live', icon: TrendingUp },
      { id: 'ai-heat-geo', name: 'Market Heat Geo Intelligence', description: 'Spatial demand heatmaps with weighted scoring (Demand 40%, Growth 35%, Price 25%)', route: '/location-intelligence', status: 'live', icon: MapPin },
      { id: 'ai-macro', name: 'Macro Market Prediction Terminal', description: 'Market cycle detection (Expansion/Peak/Correction/Recovery) with national price index forecasts', route: '/macro-prediction', status: 'live', icon: Globe },
    ],
  },
  {
    key: 'investor',
    name: 'Investor Experience',
    description: 'Personalized tools for portfolio management and strategy',
    icon: Crown,
    color: 'hsl(var(--chart-4))',
    modules: [
      { id: 'inv-rec-feed', name: 'Personalized AI Recommendation Feed', description: 'Collaborative filtering with investment DNA matching and themed discovery', route: '/investor-recommendations', status: 'live', icon: Sparkles },
      { id: 'inv-watchlist', name: 'Investor Watchlist Intelligence', description: 'Custom category monitoring with real-time opportunity alerts and AI tags', route: '/investor-watchlist', status: 'live', icon: Eye },
      { id: 'inv-simulator', name: 'Investment Strategy Simulator', description: 'Multi-year projections (1-20yr) under Bull/Base/Bear/HyperGrowth scenarios', route: '/wealth-simulator', status: 'live', icon: BarChart3 },
      { id: 'inv-portfolio', name: 'Portfolio ROI Analytics Dashboard', description: 'Total value tracking, unrealized gains, allocation intelligence, and risk rebalancing', route: '/portfolio-command-center', status: 'live', icon: TrendingUp },
      { id: 'inv-crossborder', name: 'Cross-Border Investment Discovery', description: 'Global macro intelligence with capital flow prediction and wealth migration tracking', route: '/global-macro-intelligence', status: 'live', icon: Globe },
    ],
  },
  {
    key: 'services',
    name: 'Service Ecosystem',
    description: 'Property lifecycle services and vendor marketplace',
    icon: Wrench,
    color: 'hsl(var(--chart-1))',
    modules: [
      { id: 'svc-repair', name: 'Repair & Maintenance Marketplace', description: 'Verified vendor directory with quotation requests and review system', route: '/services', status: 'live', icon: Wrench },
      { id: 'svc-reno', name: 'Construction & Renovation Services', description: 'Renovation ROI calculator with contractor matching and project tracking', route: '/services?category=renovation', status: 'live', icon: Package },
      { id: 'svc-furnish', name: 'Furniture & Electronics Marketplace', description: 'Curated home furnishing catalog with property-matched recommendations', status: 'planned', icon: Home },
      { id: 'svc-legal', name: 'Legal Documentation Workflow', description: 'SHM/AJB tracking, notary services, and compliance checklist automation', route: '/legal-services', status: 'live', icon: FileText },
      { id: 'svc-lifecycle', name: 'Property Ownership Lifecycle', description: 'Value appreciation tracking, maintenance reminders, tax notifications, and AI sell/refinance advisory', route: '/ownership-lifecycle', status: 'live', icon: Layers },
    ],
  },
  {
    key: 'developer',
    name: 'Developer Growth Infrastructure',
    description: 'Tools for property developers to launch and market projects',
    icon: Rocket,
    color: 'hsl(var(--chart-3))',
    modules: [
      { id: 'dev-forecast', name: 'Demand Forecast Analytics', description: 'Predicted absorption speed, optimal pricing bands, and area readiness signals', route: '/developer-demand-forecast', status: 'live', icon: BarChart3 },
      { id: 'dev-campaign', name: 'Marketing Campaign Generator', description: 'AI-generated promotional content, headlines, and campaign timing recommendations', route: '/developer-campaign', status: 'live', icon: Megaphone },
      { id: 'dev-launch', name: 'Project Launch Promotion Tools', description: 'Featured banners, countdown widgets, and investor interest capture templates', route: '/developer-campaign', status: 'live', icon: Rocket, dependencies: ['dev-campaign'] },
      { id: 'dev-leads', name: 'Buyer Lead Intelligence Tracking', description: 'Lead pipeline analytics with conversion funnels and engagement scoring', route: '/developer-dashboard', status: 'live', icon: Users },
    ],
  },
  {
    key: 'transaction',
    name: 'Transaction & Communication',
    description: 'Deal workflow, CRM, and communication infrastructure',
    icon: Handshake,
    color: 'hsl(var(--chart-5))',
    modules: [
      { id: 'tx-negotiate', name: 'Offer Negotiation Workflow', description: 'Structured offer/counter-offer flow with AI negotiation assistance', route: '/negotiation-assistant', status: 'live', icon: Handshake },
      { id: 'tx-crm', name: 'Agent CRM & Lead Pipeline', description: 'Kanban-style pipeline (New→Contacted→Negotiation→Closed/Lost) with conversion analytics', route: '/agent-crm', status: 'live', icon: Users },
      { id: 'tx-notif', name: 'Notification & Messaging Center', description: 'Category-filtered alerts (Investor, Transaction, Property, System) with real-time toasts', route: '/notifications', status: 'live', icon: Bell },
      { id: 'tx-docs', name: 'Document Storage & E-Signature', description: 'Secure document vault with version tracking and digital signature workflow', status: 'development', icon: FileText },
      { id: 'tx-mortgage', name: 'Mortgage Financing Assistance', description: 'Bank partnership integration with eligibility assessment and lead handoff', route: '/mortgage-calculator', status: 'live', icon: DollarSign },
    ],
  },
  {
    key: 'growth',
    name: 'Growth & Content Engine',
    description: 'SEO, marketing, referrals, and content generation',
    icon: Globe,
    color: 'hsl(var(--primary))',
    modules: [
      { id: 'gr-marketing', name: 'Public Marketing Website', description: 'SEO-optimized landing pages with JSON-LD schemas and conversion funnels', route: '/', status: 'live', icon: Globe },
      { id: 'gr-seo', name: 'SEO City Investment Pages', description: 'Nested URL hierarchy (/properti/{province}/{city}/...) with 10-section standardized templates', route: '/properti', status: 'live', icon: Search },
      { id: 'gr-ai-content', name: 'AI Listing Content Generator', description: 'Property match narratives, investment storytelling, and listing descriptions in Indonesian', status: 'live', icon: Sparkles },
      { id: 'gr-referral', name: 'Referral & Affiliate Growth System', description: 'Multi-tier referral codes, commission tracking, and payout management', route: '/referral', status: 'live', icon: Users },
      { id: 'gr-news', name: 'Market Intelligence News Feed', description: 'AI-generated market articles with reading lists and property cross-references', route: '/market-intelligence', status: 'live', icon: FileText },
    ],
  },
  {
    key: 'innovation',
    name: 'Advanced Innovation',
    description: 'Next-generation features and experimental modules',
    icon: Sparkles,
    color: 'hsl(var(--chart-4))',
    modules: [
      { id: 'inn-chat', name: 'Smart AI Chat Investment Assistant', description: 'Conversational AI for property discovery, market queries, and investment guidance', route: '/ai-assistant', status: 'live', icon: Bot },
      { id: 'inn-3d-map', name: '3D Map Investment Explorer', description: 'Interactive 3D geospatial visualization with investment layer overlays', route: '/virtual-explorer', status: 'live', icon: MapPin },
      { id: 'inn-fractional', name: 'Fractional Property Investment', description: 'Tokenized ownership enabling micro-investments in premium properties', status: 'planned', icon: Gem },
      { id: 'inn-social', name: 'Investor Social Intelligence Network', description: 'Deal sharing feed, investor leaderboard, trending zones, and collaborative watchlists', route: '/investor-social', status: 'live', icon: Users },
      { id: 'inn-vr', name: 'Luxury Virtual Tour Experience', description: 'Immersive 3D property walkthrough with investment overlay and developer showcase', route: '/virtual-explorer', status: 'live', icon: Eye },
    ],
  },
  {
    key: 'admin',
    name: 'Admin Control & Analytics',
    description: 'Platform governance, monitoring, and role management',
    icon: Shield,
    color: 'hsl(var(--destructive))',
    modules: [
      { id: 'adm-revenue', name: 'Revenue & Commission Dashboard', description: 'Real-time revenue tracking, commission calculations, and financial reporting', route: '/admin-dashboard?section=analytics', status: 'live', icon: DollarSign },
      { id: 'adm-control', name: 'Platform Intelligence Control Panel', description: 'AI engine health monitoring, batch processing controls, and coverage analytics', route: '/admin-dashboard', status: 'live', icon: Cpu },
      { id: 'adm-ai-monitor', name: 'AI Engine Monitoring System', description: 'Module-level health checks, prediction accuracy tracking, and self-learning feedback loops', route: '/admin-dashboard?section=ai', status: 'live', icon: Brain },
      { id: 'adm-roles', name: 'User Role & Permission Management', description: '12 participant types with granular permissions via role_permissions table and PermissionGate', route: '/admin-dashboard?section=roles', status: 'live', icon: Lock },
    ],
  },
];

// ─── Computed Stats ──────────────────────────────────────────────────
function useStats() {
  return useMemo(() => {
    const all = PRODUCT_LAYERS.flatMap(l => l.modules);
    const total = all.length;
    const byStatus = {
      live: all.filter(m => m.status === 'live').length,
      beta: all.filter(m => m.status === 'beta').length,
      development: all.filter(m => m.status === 'development').length,
      planned: all.filter(m => m.status === 'planned').length,
    };
    return { total, byStatus, completionRate: Math.round(((byStatus.live + byStatus.beta) / total) * 100) };
  }, []);
}

// ─── Module Row ──────────────────────────────────────────────────────
function ModuleRow({ mod }: { mod: Module }) {
  const statusCfg = STATUS_CONFIG[mod.status];
  const StatusIcon = statusCfg.icon;
  const ModIcon = mod.icon;
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/5 transition-colors group">
      <ModIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{mod.name}</span>
          {mod.route && (
            <a href={mod.route} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3 w-3 text-primary" />
            </a>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed truncate">{mod.description}</p>
      </div>
      <Badge variant="outline" className={`text-[8px] h-5 gap-0.5 shrink-0 ${statusCfg.className}`}>
        <StatusIcon className="h-2.5 w-2.5" /> {statusCfg.label}
      </Badge>
    </div>
  );
}

// ─── Layer Card ──────────────────────────────────────────────────────
function LayerCard({ layer, isExpanded, onToggle, searchQuery }: { layer: ProductLayer; isExpanded: boolean; onToggle: () => void; searchQuery: string }) {
  const LayerIcon = layer.icon;
  const filteredModules = useMemo(() => {
    if (!searchQuery) return layer.modules;
    const q = searchQuery.toLowerCase();
    return layer.modules.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [layer.modules, searchQuery]);

  const liveCount = layer.modules.filter(m => m.status === 'live' || m.status === 'beta').length;
  const completion = Math.round((liveCount / layer.modules.length) * 100);

  if (searchQuery && filteredModules.length === 0) return null;

  return (
    <Card className="bg-card/40 border-border/30 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border" style={{ borderColor: `${layer.color}30`, backgroundColor: `${layer.color}08` }}>
              <LayerIcon className="h-5 w-5" style={{ color: layer.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold">{layer.name}</CardTitle>
                <Badge variant="secondary" className="text-[9px] h-5">{layer.modules.length} modules</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{layer.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <Progress value={completion} className="h-1 w-16" />
                  <span className="text-[10px] font-mono text-muted-foreground">{completion}%</span>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <CardContent className="px-4 pb-4 pt-0">
              <Separator className="opacity-20 mb-2" />
              <div className="space-y-0.5">
                {filteredModules.map((mod) => <ModuleRow key={mod.id} mod={mod} />)}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function ProductArchitecturePage() {
  const [expandedLayers, setExpandedLayers] = useState<Set<LayerKey>>(new Set(PRODUCT_LAYERS.map(l => l.key)));
  const [searchQuery, setSearchQuery] = useState('');
  const stats = useStats();

  const toggleLayer = (key: LayerKey) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpandedLayers(new Set(PRODUCT_LAYERS.map(l => l.key)));
  const collapseAll = () => setExpandedLayers(new Set());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-serif">Product Architecture</h1>
                <p className="text-xs text-muted-foreground">ASTRA Villa · Master Module Hierarchy & System Blueprint</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={expandAll}>Expand All</Button>
              <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={collapseAll}>Collapse All</Button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
              <span className="text-2xl font-bold text-foreground">{stats.total}</span>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5">Total Modules</p>
            </div>
            {(Object.entries(stats.byStatus) as [ModuleStatus, number][]).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <div key={status} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon className={`h-4 w-4 ${cfg.className.split(' ')[0]}`} />
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Completion Bar */}
          <div className="mt-4 flex items-center gap-3">
            <Progress value={stats.completionRate} className="h-2 flex-1" />
            <span className="text-xs font-mono font-bold text-foreground">{stats.completionRate}% Operational</span>
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search modules, features, capabilities..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Layers */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        {PRODUCT_LAYERS.map((layer) => (
          <LayerCard
            key={layer.key}
            layer={layer}
            isExpanded={expandedLayers.has(layer.key)}
            onToggle={() => toggleLayer(layer.key)}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
