import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSupplyExpansionTargets,
  useSupplyQualityStandards,
  useUpdateExpansionStatus,
  type SupplyExpansionTarget,
  type CityTier,
  type ExpansionStatus,
  type QualityStandard,
} from "@/hooks/useSupplyExpansion";
import { toast } from "sonner";
import {
  Loader2, Building, MapPin, Target, TrendingUp, BarChart3, Users, Zap,
  ChevronRight, CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight,
  Shield, Camera, FileText, DollarSign, Map, Package, Crown, Star, Layers,
  ChevronDown, AlertCircle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Config ──

const tierConfig: Record<CityTier, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  tier_1: { label: "Tier 1 — Metro", color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", emoji: "🏙️" },
  tier_2: { label: "Tier 2 — Secondary", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", emoji: "🌆" },
  tier_3: { label: "Tier 3 — Emerging", color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", emoji: "🌱" },
};

const statusConfig: Record<ExpansionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planned:  { label: "Planned",  color: "text-muted-foreground", bg: "bg-muted/20",      icon: Circle },
  seeding:  { label: "Seeding",  color: "text-chart-4",         bg: "bg-chart-4/10",    icon: Clock },
  active:   { label: "Active",   color: "text-chart-1",         bg: "bg-chart-1/10",    icon: CheckCircle2 },
  scaling:  { label: "Scaling",  color: "text-primary",         bg: "bg-primary/10",    icon: TrendingUp },
  mature:   { label: "Mature",   color: "text-chart-3",         bg: "bg-chart-3/10",    icon: Crown },
};

const nextStatus: Record<ExpansionStatus, ExpansionStatus | null> = {
  planned: "seeding", seeding: "active", active: "scaling", scaling: "mature", mature: null,
};

const channelIcons: Record<string, { label: string; icon: React.ElementType }> = {
  agent_onboarding:      { label: "Agent Onboarding",      icon: Users },
  developer_partnership: { label: "Developer Partnership", icon: Building },
  owner_self_listing:    { label: "Owner Self-Listing",    icon: Package },
  community_group:       { label: "Community Group",       icon: Users },
};

const severityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  blocker:    { color: "text-destructive",     bg: "bg-destructive/10", icon: AlertCircle },
  warning:    { color: "text-chart-3",         bg: "bg-chart-3/10",    icon: AlertTriangle },
  suggestion: { color: "text-muted-foreground", bg: "bg-muted/20",     icon: Info },
};

const categoryIcons: Record<string, React.ElementType> = {
  photos: Camera, description: FileText, pricing: DollarSign, location: Map, completeness: Layers,
};

// ── City Expansion Card ──

function CityCard({ target, onAdvance }: { target: SupplyExpansionTarget; onAdvance: (id: string, status: ExpansionStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tc = tierConfig[target.tier];
  const sc = statusConfig[target.status];
  const StatusIcon = sc.icon;
  const listingPct = target.target_listings > 0 ? Math.round((target.current_listings / target.target_listings) * 100) : 0;
  const agentPct = target.target_agents > 0 ? Math.round((target.current_agents / target.target_agents) * 100) : 0;
  const next = nextStatus[target.status];
  const channels: string[] = Array.isArray(target.sourcing_channels) ? target.sourcing_channels : [];

  return (
    <div className={cn("rounded-xl border transition-all", sc.bg, "border-border/30 hover:border-border/50")}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-bold text-foreground">#{target.priority_rank} {target.city}</span>
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", tc.color, tc.bg, tc.border)}>{tc.emoji} {tc.label}</Badge>
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", sc.color, sc.bg)}>
              <StatusIcon className="h-2 w-2 mr-0.5" />{sc.label}
            </Badge>
          </div>
          <span className="text-[9px] text-muted-foreground">{target.province}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[8px] text-muted-foreground block">Listings</span>
            <span className="text-[10px] font-bold text-foreground">{target.current_listings}/{target.target_listings}</span>
          </div>
          <div className="w-14 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className={cn("h-full rounded-full", listingPct >= 80 ? "bg-chart-1" : listingPct >= 40 ? "bg-primary" : "bg-muted-foreground")} style={{ width: `${Math.min(listingPct, 100)}%` }} />
          </div>
          <span className={cn("text-[9px] font-bold w-8 text-right", listingPct >= 80 ? "text-chart-1" : "text-foreground")}>{listingPct}%</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2.5 border-t border-border/20 mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            {[
              { label: "Demand Score", value: `${target.demand_score}/100`, color: target.demand_score >= 80 ? "text-chart-1" : "text-foreground" },
              { label: "Supply Gap", value: `${target.supply_gap_score}/100`, color: target.supply_gap_score >= 85 ? "text-destructive" : "text-chart-4" },
              { label: "Agents", value: `${target.current_agents}/${target.target_agents} (${agentPct}%)`, color: agentPct >= 50 ? "text-chart-1" : "text-foreground" },
              { label: "Listing Fill", value: `${listingPct}%`, color: listingPct >= 80 ? "text-chart-1" : "text-foreground" },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-2 rounded-lg bg-card/60 border border-border/20">
                <span className="text-[8px] text-muted-foreground block">{label}</span>
                <span className={cn("text-[10px] font-bold", color)}>{value}</span>
              </div>
            ))}
          </div>

          {channels.length > 0 && (
            <div>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Sourcing Channels</span>
              <div className="flex items-center gap-1 flex-wrap">
                {channels.map((ch) => {
                  const ci = channelIcons[ch] || { label: ch, icon: Package };
                  const ChIcon = ci.icon;
                  return (
                    <Badge key={ch} variant="outline" className="text-[8px] h-4 px-1.5 text-muted-foreground">
                      <ChIcon className="h-2.5 w-2.5 mr-0.5" />{ci.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {target.notes && (
            <p className="text-[9px] text-muted-foreground italic">{target.notes}</p>
          )}

          {next && (
            <Button variant="outline" size="sm" className="h-7 text-[9px] gap-1" onClick={() => onAdvance(target.id, next)}>
              <ArrowRight className="h-3 w-3" /> Advance to {statusConfig[next].label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Quality Standards Card ──

function QualityStandardsSection({ standards }: { standards: QualityStandard[] }) {
  const grouped = useMemo(() => {
    const map: Record<string, QualityStandard[]> = {};
    for (const s of standards) {
      if (!map[s.rule_category]) map[s.rule_category] = [];
      map[s.rule_category].push(s);
    }
    return map;
  }, [standards]);

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([category, rules]) => {
        const CatIcon = categoryIcons[category] || Layers;
        return (
          <Card key={category} className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
                <CatIcon className="h-3.5 w-3.5" /> {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {rules.map((rule) => {
                const sev = severityConfig[rule.severity] || severityConfig.suggestion;
                const SevIcon = sev.icon;
                return (
                  <div key={rule.id} className="flex items-start gap-2 p-2 rounded-lg border border-border/20 bg-muted/5">
                    <SevIcon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", sev.color)} />
                    <div className="flex-1">
                      <span className="text-[10px] font-medium text-foreground">{rule.rule_name}</span>
                      {rule.description && <p className="text-[9px] text-muted-foreground mt-0.5">{rule.description}</p>}
                    </div>
                    <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1 shrink-0", sev.color, sev.bg)}>{rule.severity}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Strategy Framework ──

function StrategyFramework() {
  const strategies = [
    {
      title: "📦 Listing Sourcing Channels",
      icon: Package,
      color: "text-primary",
      items: [
        { head: "Agent Onboarding", desc: "Recruit active agents with 15+ listings via WhatsApp/Instagram outreach — each agent brings 10-20 listings" },
        { head: "Developer Partnerships", desc: "Partner with property developers for exclusive new project listings — bulk inventory 50-200 units per deal" },
        { head: "Owner Self-Listing", desc: "Instagram/Google Ads targeting FSBO owners — simplified 3-step upload with AI-generated descriptions" },
        { head: "Data Partnerships", desc: "Aggregate from public listing sources, property portals — clean, deduplicate, enhance with AI SEO" },
      ],
    },
    {
      title: "🏙️ City Prioritization Framework",
      icon: MapPin,
      color: "text-chart-1",
      items: [
        { head: "Tier 1 — Metro (8 cities)", desc: "Jakarta areas, Surabaya, Bandung, Bali — highest demand, focus first 30 days, target 500+ listings each" },
        { head: "Tier 2 — Secondary (5 cities)", desc: "Semarang, Yogyakarta, Medan, Makassar, Malang — activate at Day 31-60 with 200+ target each" },
        { head: "Tier 3 — Emerging (2+ cities)", desc: "Balikpapan, Manado — long-term plays, seed at Day 61-90 with 100 listings as market-entry presence" },
        { head: "Scoring Model", desc: "Priority = (Demand Score × 0.4) + (Supply Gap × 0.35) + (Agent Availability × 0.25)" },
      ],
    },
    {
      title: "✅ Quality Control Approach",
      icon: Shield,
      color: "text-chart-3",
      items: [
        { head: "Blockers (Must Pass)", desc: "Min 5 photos, 150+ char description, valid price, GPS coordinates, property type — auto-rejected if missing" },
        { head: "Warnings (Nudge to Fix)", desc: "1200px photo resolution, SEO title optimization, price within ±40% of area median, complete address fields" },
        { head: "AI Enhancement", desc: "Auto-generate SEO title & description, suggest pricing based on comparables, flag duplicate listings" },
        { head: "Quality Score", desc: "0-100 composite score displayed to agents — incentivize improvement with visibility boost for 80+ scores" },
      ],
    },
    {
      title: "📈 Supply Growth Targets",
      icon: Target,
      color: "text-chart-4",
      items: [
        { head: "Week 1-4", desc: "500 seed listings → 50/week agent-contributed → target 700 total by Day 30" },
        { head: "Week 5-8", desc: "100/week organic growth → developer bulk uploads → target 1,500 total by Day 60" },
        { head: "Week 9-13", desc: "200/week blended growth → owner self-listings scaling → target 3,000 total by Day 90" },
        { head: "Geographic Balance", desc: "60% Tier 1, 30% Tier 2, 10% Tier 3 — ensure no single city exceeds 25% of total supply" },
      ],
    },
    {
      title: "🏰 Long-Term Supply Moat",
      icon: Crown,
      color: "text-primary",
      items: [
        { head: "Exclusive Partnerships", desc: "Lock developer exclusivity with 6-month contracts — first-to-market advantage on new projects" },
        { head: "Premium Visibility", desc: "Pro Agent listings get 3x visibility, featured placement, AI-enhanced descriptions — drives agent retention" },
        { head: "Data Network Effect", desc: "More listings → better AI valuations → more buyer traffic → more agent demand — self-reinforcing loop" },
        { head: "Agent Lock-In Tools", desc: "CRM, lead management, performance analytics — switching cost increases with usage depth" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {strategies.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.title} className="rounded-2xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-1.5">
                <Icon className={cn("h-4 w-4", s.color)} />{s.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {s.items.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-foreground">{item.head}</span>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Tier Summary Cards ──

function TierSummary({ stats }: { stats: any }) {
  const tiers: CityTier[] = ['tier_1', 'tier_2', 'tier_3'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiers.map((tier) => {
        const tc = tierConfig[tier];
        const d = stats.byTier[tier];
        const pct = d.target > 0 ? Math.round((d.listings / d.target) * 100) : 0;
        return (
          <Card key={tier} className={cn("rounded-xl border-border/30", tc.bg)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", tc.color, tc.border)}>{tc.emoji} {tc.label}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">{d.count} cities</span>
                  <span className={cn("font-bold", tc.color)}>{d.listings}/{d.target}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div className={cn("h-full rounded-full", pct >= 60 ? "bg-chart-1" : "bg-primary/50")} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground">{pct}% filled</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ──

const SupplyExpansionDashboard = React.memo(function SupplyExpansionDashboard() {
  const { data, isLoading, error } = useSupplyExpansionTargets();
  const { data: standards = [] } = useSupplyQualityStandards();
  const updateStatus = useUpdateExpansionStatus();
  const [tierFilter, setTierFilter] = useState<CityTier | "all">("all");

  const handleAdvance = useCallback((id: string, status: ExpansionStatus) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success(`City advanced to ${statusConfig[status].label}`),
      onError: (e) => toast.error(e.message),
    });
  }, [updateStatus]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (tierFilter === "all") return data.targets;
    return data.targets.filter((t) => t.tier === tierFilter);
  }, [data, tierFilter]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-6"><p className="text-sm text-destructive">{(error as Error).message}</p></Card>;

  const stats = data!.stats;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-primary/30 to-chart-4/20" />
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-5 w-5 text-chart-1" />
                Supply Expansion Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                National property supply growth — city prioritization, listing sourcing, quality control
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm h-7 px-3 font-bold", stats.overallSupplyPct >= 60 ? "text-chart-1 bg-chart-1/10 border-chart-1/30" : "text-primary bg-primary/10 border-primary/30")}>
              {stats.overallSupplyPct}% Supply Fill
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: "Cities", value: String(stats.totalCities), icon: MapPin, color: "text-foreground" },
              { label: "Active", value: String(stats.activeCities), icon: CheckCircle2, color: "text-chart-1" },
              { label: "Listings", value: `${stats.totalCurrentListings}/${stats.totalTargetListings}`, icon: Building, color: "text-primary" },
              { label: "Agents", value: `${stats.totalCurrentAgents}/${stats.totalTargetAgents}`, icon: Users, color: "text-chart-4" },
              { label: "Avg Demand", value: `${stats.avgDemandScore}/100`, icon: TrendingUp, color: stats.avgDemandScore >= 75 ? "text-chart-1" : "text-foreground" },
              { label: "Supply Gap", value: `${stats.avgSupplyGap}/100`, icon: AlertTriangle, color: stats.avgSupplyGap >= 85 ? "text-destructive" : "text-chart-3" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="rounded-xl border-border/30 bg-card/60">
                <CardContent className="p-2 flex items-center gap-1.5">
                  <Icon className={cn("h-3 w-3 shrink-0", color)} />
                  <div>
                    <span className="text-[7px] text-muted-foreground block">{label}</span>
                    <span className={cn("text-[10px] font-bold", color)}>{value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="cities" className="text-[10px] h-6 px-3">City Expansion</TabsTrigger>
          <TabsTrigger value="quality" className="text-[10px] h-6 px-3">Quality Standards</TabsTrigger>
          <TabsTrigger value="strategy" className="text-[10px] h-6 px-3">Strategy Framework</TabsTrigger>
        </TabsList>

        {/* City Expansion */}
        <TabsContent value="cities" className="mt-3 space-y-3">
          <TierSummary stats={stats} />

          <div className="flex items-center gap-2 flex-wrap">
            {[{ key: "all" as const, label: `All (${stats.totalCities})` }, ...(['tier_1', 'tier_2', 'tier_3'] as CityTier[]).map((t) => ({
              key: t, label: `${tierConfig[t].emoji} ${tierConfig[t].label} (${stats.byTier[t].count})`,
            }))].map(({ key, label }) => (
              <Badge
                key={key}
                variant="outline"
                className={cn("text-[9px] h-5 px-2 cursor-pointer transition-all",
                  tierFilter === key ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
                onClick={() => setTierFilter(key)}
              >
                {label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((target) => (
              <CityCard key={target.id} target={target} onAdvance={handleAdvance} />
            ))}
          </div>
        </TabsContent>

        {/* Quality */}
        <TabsContent value="quality" className="mt-3">
          <QualityStandardsSection standards={standards} />
        </TabsContent>

        {/* Strategy */}
        <TabsContent value="strategy" className="mt-3">
          <StrategyFramework />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default SupplyExpansionDashboard;
