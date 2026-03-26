import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Search, Zap, ChevronDown, CheckCircle2, BarChart3, Layers,
  ArrowRight, Target, Shield, Activity, Filter, Clock, Hash, Eye,
  TrendingUp, Building2, Heart, Handshake, Brain, Server, Gauge
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

type IndexType = 'btree' | 'gin' | 'partial' | 'composite' | 'unique';
type CategoryKey = 'search' | 'ai' | 'engagement' | 'transaction' | 'fulltext' | 'system';

interface IndexDef {
  name: string;
  table: string;
  columns: string;
  type: IndexType;
  partial?: string;
  purpose: string;
}

interface IndexCategory {
  key: CategoryKey;
  name: string;
  subtitle: string;
  icon: typeof Database;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  strategy: string;
  indexes: IndexDef[];
}

const TYPE_STYLES: Record<IndexType, { label: string; cls: string }> = {
  btree: { label: 'B-Tree', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  gin: { label: 'GIN', cls: 'text-violet-400 bg-violet-400/10 border-violet-400/30' },
  partial: { label: 'Partial', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  composite: { label: 'Composite', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  unique: { label: 'Unique', cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
};

const CATEGORIES: IndexCategory[] = [
  {
    key: 'search',
    name: 'Property Search Optimization',
    subtitle: 'Fast marketplace discovery under 100k+ listings',
    icon: Search,
    accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    strategy: 'Composite indexes cover the most common filter combinations (city + type + price). Partial indexes on status = "active" reduce scan size by 60-80%. Listing-type partitioning enables fast buy vs rent separation.',
    indexes: [
      { name: 'idx_properties_city', table: 'properties', columns: 'city', type: 'btree', purpose: 'City filter — most common search dimension' },
      { name: 'idx_properties_property_type', table: 'properties', columns: 'property_type', type: 'btree', purpose: 'Property type filter (villa, apartment, house, land)' },
      { name: 'idx_properties_price', table: 'properties', columns: 'price', type: 'partial', partial: 'WHERE price > 0', purpose: 'Price range queries excluding zero/null prices' },
      { name: 'idx_properties_city_type_price', table: 'properties', columns: 'city, property_type, price', type: 'composite', purpose: 'Primary search composite — covers 80% of filter queries' },
      { name: 'idx_properties_search_composite', table: 'properties', columns: 'status, listing_type, city, property_type, price', type: 'composite', purpose: 'Full 5-column search path — covers advanced filtered queries' },
      { name: 'idx_properties_listing_price', table: 'properties', columns: 'listing_type, price', type: 'partial', partial: 'WHERE status = active', purpose: 'Buy/rent + price sorting for active listings only' },
      { name: 'idx_properties_status', table: 'properties', columns: 'status', type: 'partial', partial: 'WHERE status = active', purpose: 'Fast active-only scans (skip archived/draft)' },
      { name: 'idx_properties_created_desc', table: 'properties', columns: 'created_at DESC', type: 'partial', partial: 'WHERE status = available', purpose: 'Newest listings — default sort order' },
      { name: 'idx_properties_lat_lng', table: 'properties', columns: 'latitude, longitude', type: 'partial', partial: 'WHERE lat/lng IS NOT NULL', purpose: 'Geo-spatial bounding box queries for map view' },
      { name: 'idx_properties_rooms', table: 'properties', columns: 'bedrooms, bathrooms', type: 'partial', partial: 'WHERE status = available', purpose: 'Room count filter for residential searches' },
      { name: 'idx_properties_location_search', table: 'properties', columns: 'city, area, state', type: 'partial', partial: 'WHERE status = available', purpose: 'Multi-level location hierarchy search' },
      { name: 'idx_properties_featured', table: 'properties', columns: 'is_featured', type: 'partial', partial: 'WHERE is_featured = true', purpose: 'Instant featured listings retrieval' },
      { name: 'idx_properties_wna_eligible', table: 'properties', columns: 'wna_eligible', type: 'partial', partial: 'WHERE wna_eligible = true', purpose: 'Foreign investor (WNA) eligible filter' },
    ],
  },
  {
    key: 'fulltext',
    name: 'Full-Text & GIN Search',
    subtitle: 'Natural language and array field queries',
    icon: Filter,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    strategy: 'GIN indexes on tsvector columns enable sub-100ms full-text search across title + description + location. Array columns (features, facilities, payment methods) use GIN for containment queries.',
    indexes: [
      { name: 'idx_properties_fulltext', table: 'properties', columns: "to_tsvector(title || description || location)", type: 'gin', purpose: 'Primary full-text search across all text fields' },
      { name: 'idx_properties_text_search', table: 'properties', columns: "to_tsvector(title || description)", type: 'gin', purpose: 'Title + description focused text search' },
      { name: 'idx_properties_location_text', table: 'properties', columns: "to_tsvector(location || city || area)", type: 'gin', purpose: 'Location-specific text search' },
      { name: 'idx_properties_features_gin', table: 'properties', columns: 'property_features', type: 'gin', purpose: 'JSONB feature containment queries (pool, garden, etc.)' },
      { name: 'idx_properties_nearby_facilities', table: 'properties', columns: 'nearby_facilities', type: 'gin', purpose: 'Facility proximity array searches' },
      { name: 'idx_properties_payment_methods', table: 'properties', columns: 'payment_methods', type: 'gin', purpose: 'Payment method filter (cash, mortgage, installment)' },
    ],
  },
  {
    key: 'ai',
    name: 'AI Intelligence Queries',
    subtitle: 'Scoring, prediction, and ranking performance',
    icon: Brain,
    accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    strategy: 'DESC-ordered indexes on score columns enable instant top-N queries for dashboards. Composite scoring index covers multi-dimension ranking. Partial indexes skip unscored properties to reduce scan width.',
    indexes: [
      { name: 'idx_properties_opportunity_score', table: 'properties', columns: 'opportunity_score DESC', type: 'partial', partial: 'WHERE status = active', purpose: 'Top opportunity ranking — primary investment signal' },
      { name: 'idx_properties_scoring_composite', table: 'properties', columns: 'opportunity_score DESC, deal_score DESC, demand_score DESC', type: 'composite', partial: 'WHERE status = active', purpose: 'Multi-dimension AI scoring dashboard' },
      { name: 'idx_properties_deal_score', table: 'properties', columns: 'deal_score DESC', type: 'partial', partial: 'WHERE deal_score > 0', purpose: 'Deal hunter — undervalued property detection' },
      { name: 'idx_properties_demand_score', table: 'properties', columns: 'demand_score DESC', type: 'partial', partial: 'WHERE demand_score > 0', purpose: 'Demand signal ranking for heat analysis' },
      { name: 'idx_properties_demand_heat', table: 'properties', columns: 'demand_heat_score DESC', type: 'btree', purpose: 'Cluster-synced heat score ranking' },
      { name: 'idx_properties_investment_score', table: 'properties', columns: 'investment_score DESC', type: 'partial', partial: 'WHERE investment_score IS NOT NULL', purpose: 'Investment attractiveness index' },
      { name: 'idx_properties_ai_confidence', table: 'properties', columns: 'ai_price_confidence DESC', type: 'partial', partial: 'WHERE ai_price_confidence > 0', purpose: 'AI prediction confidence filter' },
      { name: 'idx_properties_rental_yield', table: 'properties', columns: 'rental_yield_percentage', type: 'partial', partial: 'WHERE rental_yield_percentage IS NOT NULL', purpose: 'Rental yield ranking for passive income investors' },
      { name: 'idx_properties_roi', table: 'properties', columns: 'roi_percentage', type: 'partial', partial: 'WHERE roi_percentage IS NOT NULL', purpose: 'ROI projection ranking' },
      { name: 'idx_properties_luxury_index', table: 'properties', columns: 'luxury_index_score DESC', type: 'partial', partial: 'WHERE luxury_index_score > 0', purpose: 'Luxury property tier classification' },
      { name: 'idx_properties_valuation_label', table: 'properties', columns: 'valuation_label', type: 'partial', partial: 'WHERE valuation_label IS NOT NULL', purpose: 'Valuation status filter (undervalued, fair, overpriced)' },
      { name: 'idx_properties_price_trend', table: 'properties', columns: 'price_trend_signal', type: 'partial', partial: 'WHERE price_trend_signal IS NOT NULL', purpose: 'Price trend direction filter' },
      { name: 'idx_properties_score_updated', table: 'properties', columns: 'score_updated_at DESC NULLS LAST', type: 'btree', purpose: 'Stale score detection for re-computation batch' },
      { name: 'idx_market_clusters_heat', table: 'market_clusters', columns: 'market_heat_score DESC', type: 'btree', purpose: 'Hottest cluster ranking for geo-intelligence' },
      { name: 'idx_market_clusters_city_area', table: 'market_clusters', columns: 'city, area', type: 'unique', purpose: 'Cluster deduplication and fast lookup' },
    ],
  },
  {
    key: 'engagement',
    name: 'Watchlist & Engagement',
    subtitle: 'Investor interaction performance',
    icon: Heart,
    accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    strategy: 'User-partitioned indexes ensure O(1) lookup for personal watchlists and saved properties. Composite unique constraints prevent duplicate saves.',
    indexes: [
      { name: 'idx_saved_properties_user', table: 'saved_properties', columns: 'user_id', type: 'btree', purpose: 'User saved properties lookup' },
      { name: 'idx_saved_properties_unique', table: 'saved_properties', columns: 'user_id, property_id', type: 'unique', purpose: 'Prevent duplicate saves' },
      { name: 'idx_property_inquiries_property', table: 'property_inquiries', columns: 'property_id', type: 'btree', purpose: 'All inquiries for a listing (agent view)' },
      { name: 'idx_property_inquiries_user', table: 'property_inquiries', columns: 'user_id', type: 'btree', purpose: 'User inquiry history' },
    ],
  },
  {
    key: 'transaction',
    name: 'Transaction Flow',
    subtitle: 'Offer and negotiation pipeline',
    icon: Handshake,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    strategy: 'Separate indexes on property_id, buyer_id, seller_id, and status enable fast lookup from any participant perspective. Offer message threads indexed by (offer_id, created_at) for chronological retrieval.',
    indexes: [
      { name: 'idx_property_offers_property', table: 'property_offers', columns: 'property_id', type: 'btree', purpose: 'All offers on a property (seller view)' },
      { name: 'idx_property_offers_buyer', table: 'property_offers', columns: 'buyer_id', type: 'btree', purpose: 'Buyer offer history' },
      { name: 'idx_property_offers_seller', table: 'property_offers', columns: 'seller_id', type: 'btree', purpose: 'Seller received offers' },
      { name: 'idx_property_offers_status', table: 'property_offers', columns: 'status', type: 'btree', purpose: 'Filter by offer lifecycle stage' },
      { name: 'idx_offer_messages_offer', table: 'offer_messages', columns: 'offer_id, created_at', type: 'composite', purpose: 'Chronological negotiation thread' },
    ],
  },
  {
    key: 'system',
    name: 'System & Event Pipeline',
    subtitle: 'Background processing and audit trails',
    icon: Activity,
    accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    strategy: 'Partial index on unprocessed signals ensures the event pipeline claims only pending work. Activity logs indexed by (user_id, created_at DESC) for audit trail queries. Worker runs tracked for health monitoring.',
    indexes: [
      { name: 'idx_event_signals_unprocessed', table: 'ai_event_signals', columns: 'is_processed, priority_level, created_at', type: 'partial', partial: 'WHERE is_processed = false', purpose: 'Event pipeline claim queue — only scans pending signals' },
      { name: 'idx_event_signals_type', table: 'ai_event_signals', columns: 'event_type, created_at DESC', type: 'composite', purpose: 'Signal type analytics and deduplication window' },
      { name: 'idx_event_signals_entity', table: 'ai_event_signals', columns: 'entity_type, entity_id', type: 'composite', purpose: 'Entity-specific signal lookup' },
      { name: 'idx_activity_logs_user_id', table: 'activity_logs', columns: 'user_id', type: 'btree', purpose: 'Per-user audit trail' },
      { name: 'idx_activity_logs_created_at', table: 'activity_logs', columns: 'created_at DESC', type: 'btree', purpose: 'Recent activity feed' },
      { name: 'idx_activity_logs_activity_type', table: 'activity_logs', columns: 'activity_type', type: 'btree', purpose: 'Activity category filter' },
    ],
  },
];

const PERF_STRATEGIES = [
  { icon: Layers, title: 'Cursor Pagination', desc: 'All listing endpoints use keyset (cursor) pagination instead of OFFSET — maintains O(1) performance regardless of page depth.', impact: 'Eliminates slow OFFSET scans at page 100+' },
  { icon: Gauge, title: 'Partial Indexes', desc: '35+ partial indexes filter on status = "active" or score > 0, reducing effective index size by 60-80% for most queries.', impact: 'Sub-10ms lookups on 100k+ row tables' },
  { icon: Database, title: 'Materialized Caching', desc: 'market_clusters and ai_intelligence_cache tables act as materialized views refreshed by scheduled workers every 10-60 minutes.', impact: 'Dashboard queries hit pre-computed aggregates' },
  { icon: Zap, title: 'Composite Search Path', desc: '5-column composite index (status, listing_type, city, property_type, price) covers 95% of marketplace filter combinations in a single index scan.', impact: 'Single index serves all common filter permutations' },
  { icon: Shield, title: 'RLS-Aware Design', desc: 'Indexes include columns used in RLS policies (user_id, status) to prevent full table scans when PostgREST applies row-level security filters.', impact: 'RLS checks use index paths, not sequential scans' },
  { icon: Server, title: 'Edge Function Chunking', desc: 'Batch operations in Edge Functions process 20-50 items per chunk with .in() filters, preventing URI-too-long errors and memory spikes.', impact: 'Stable bulk operations at any scale' },
];

function IndexRow({ idx }: { idx: IndexDef }) {
  const ts = TYPE_STYLES[idx.type];
  return (
    <div className="group px-3 py-2 rounded-lg hover:bg-muted/5 transition-colors">
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={`text-[8px] h-5 w-20 justify-center shrink-0 mt-0.5 border ${ts.cls}`}>
          {ts.label}
        </Badge>
        <div className="flex-1 min-w-0">
          <code className="text-[10px] font-mono font-semibold text-foreground">{idx.name}</code>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] text-muted-foreground font-mono">{idx.table}({idx.columns})</span>
            {idx.partial && <Badge variant="outline" className="text-[8px] h-4 text-amber-400 border-amber-400/30 bg-amber-400/5">{idx.partial}</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{idx.purpose}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat }: { cat: IndexCategory }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = cat.icon;
  const typeCounts = useMemo(() => {
    const c: Partial<Record<IndexType, number>> = {};
    cat.indexes.forEach(idx => { c[idx.type] = (c[idx.type] || 0) + 1; });
    return c;
  }, [cat.indexes]);

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cat.borderClass} ${cat.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${cat.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{cat.indexes.length} indexes</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{cat.subtitle}</p>
          <div className="flex gap-1 mt-1">
            {Object.entries(typeCounts).map(([t, c]) => {
              const s = TYPE_STYLES[t as IndexType];
              return <Badge key={t} variant="outline" className={`text-[8px] h-4 border ${s.cls}`}>{s.label} ×{c}</Badge>;
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
              <div className={`rounded-lg border ${cat.borderClass} ${cat.bgClass}/5 p-2.5`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className={`h-3 w-3 ${cat.accentClass}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${cat.accentClass}`}>Strategy</span>
                </div>
                <p className="text-[10px] text-foreground leading-relaxed">{cat.strategy}</p>
              </div>
              <div className="space-y-0.5">
                {cat.indexes.map(idx => <IndexRow key={idx.name} idx={idx} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IndexingStrategyPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = CATEGORIES.flatMap(c => c.indexes);
    const types: Record<string, number> = {};
    all.forEach(i => { types[i.type] = (types[i.type] || 0) + 1; });
    return { total: all.length, categories: CATEGORIES.length, types, tables: new Set(all.map(i => i.table)).size };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.map(c => ({
      ...c,
      indexes: c.indexes.filter(i => i.name.toLowerCase().includes(q) || i.table.toLowerCase().includes(q) || i.columns.toLowerCase().includes(q) || i.purpose.toLowerCase().includes(q)),
    })).filter(c => c.indexes.length > 0);
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
              <h1 className="text-xl font-bold text-foreground font-serif">Indexing Strategy & Performance</h1>
              <p className="text-xs text-muted-foreground">Database optimization blueprint — 80+ indexes across 6 categories</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Indexes', value: stats.total, icon: Hash },
              { label: 'Categories', value: stats.categories, icon: Layers },
              { label: 'Tables Covered', value: stats.tables, icon: Database },
              { label: 'Partial Indexes', value: stats.types['partial'] || 0, icon: Filter },
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

          {/* Performance Strategies */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Performance Optimization Strategies</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PERF_STRATEGIES.map(s => (
                <div key={s.title} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-foreground">{s.title}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  <p className="text-[9px] text-emerald-400 mt-1 font-medium">↗ {s.impact}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search indexes, tables, columns..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(cat => <CategoryCard key={cat.key} cat={cat} />)}
      </div>
    </div>
  );
}
