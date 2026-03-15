import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListingPerformanceOptimizer,
  type ListingOptimizationRec,
} from "@/hooks/useListingPerformanceOptimizer";
import {
  Sparkles,
  DollarSign,
  Search,
  Megaphone,
  PauseCircle,
  Zap,
  Target,
  Eye,
  CheckCircle2,
  Loader2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Config ──

const typeConfig = {
  PRICE_OPTIMIZATION: { icon: DollarSign, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Price Optimization", actionLabel: "Suggest Price Adjustment", impact: "+15-25% deal probability" },
  SEO_VISIBILITY:     { icon: Search, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "SEO Visibility", actionLabel: "Trigger SEO Improvement", impact: "+20-40% organic visibility" },
  MARKETING_BOOST:    { icon: Megaphone, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Marketing Boost", actionLabel: "Tag for Marketing", impact: "3-5x inquiry conversion" },
  LISTING_PAUSE:      { icon: PauseCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Listing Pause", actionLabel: "Recommend Pause", impact: "Reduce stale inventory drag" },
} as const;

const priorityConfig = {
  "Immediate Action":      { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: Zap, tabLabel: "Immediate" },
  "Strategic Improvement":  { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", icon: Target, tabLabel: "Strategic" },
  "Monitor Performance":    { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", icon: Eye, tabLabel: "Stable" },
} as const;

// ── Listing Row ──

function ListingRow({
  rec,
  selected,
  onToggle,
}: {
  rec: ListingOptimizationRec;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const tCfg = typeConfig[rec.optimization_type];
  const pCfg = priorityConfig[rec.priority_level];
  const TypeIcon = tCfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all",
        selected ? "border-primary/40 bg-primary/5" : "border-border/30 bg-card/50 hover:border-border/50"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(rec.listing_id)}
        className="mt-1 shrink-0"
      />

      <div className={cn("p-1.5 rounded-lg shrink-0", tCfg.bg)}>
        <TypeIcon className={cn("h-4 w-4", tCfg.color)} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold truncate">{rec.title}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={cn("text-[9px] h-5 px-2", tCfg.color, tCfg.bg, tCfg.border)}>
              {tCfg.label}
            </Badge>
            <Badge variant="outline" className={cn("text-[9px] h-5 px-2", pCfg.color, pCfg.bg, pCfg.border)}>
              {rec.priority_level}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{rec.city}</p>
        <p className="text-xs text-foreground/80 leading-relaxed">{rec.recommended_action}</p>

        {/* Metrics chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {Object.entries(rec.metrics).map(([k, v]) => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {k.replace(/_/g, " ")}: <span className="font-semibold text-foreground">{v}</span>
            </span>
          ))}
        </div>

        {/* Impact preview */}
        <div className="flex items-center gap-1.5 pt-1">
          <TrendingUp className="h-3 w-3 text-chart-1" />
          <span className="text-[10px] text-chart-1 font-medium">{rec.expected_impact}</span>
        </div>
      </div>
    </div>
  );
}

// ── Impact Summary ──

function ImpactSummary({
  selectedRecs,
}: {
  selectedRecs: ListingOptimizationRec[];
}) {
  if (selectedRecs.length === 0) return null;

  const byType = selectedRecs.reduce((acc, r) => {
    acc[r.optimization_type] = (acc[r.optimization_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-primary/30 bg-primary/5 rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
            Optimization Impact Preview
          </h4>
          <Badge className="bg-primary text-primary-foreground text-xs">
            {selectedRecs.length} listing{selectedRecs.length > 1 ? "s" : ""} selected
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(byType).map(([type, count]) => {
            const cfg = typeConfig[type as keyof typeof typeConfig];
            const Icon = cfg.icon;
            return (
              <div key={type} className={cn("p-2 rounded-lg border", cfg.bg, cfg.border)}>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                  <span className="text-xs font-semibold">{count}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{cfg.label}</p>
                <p className="text-[9px] font-medium text-foreground mt-0.5">{cfg.impact}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-chart-1/10 border border-chart-1/30">
          <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
          <p className="text-[10px] text-chart-1 font-medium">
            Estimated marketplace closing probability improvement: +{Math.min(selectedRecs.length * 8, 45)}% across selected listings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Bulk Action Bar ──

function BulkActionBar({
  selectedCount,
  selectedRecs,
  onClearSelection,
}: {
  selectedCount: number;
  selectedRecs: ListingOptimizationRec[];
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  const handleBulkAction = (action: string) => {
    toast.success(`${action} queued for ${selectedCount} listing${selectedCount > 1 ? "s" : ""}`);
    onClearSelection();
  };

  const types = new Set(selectedRecs.map((r) => r.optimization_type));

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2">
        <Badge className="bg-primary text-primary-foreground">{selectedCount}</Badge>
        <span className="text-sm text-muted-foreground">selected</span>
        <button onClick={onClearSelection} className="text-xs text-muted-foreground hover:text-foreground underline">
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {types.has("PRICE_OPTIMIZATION") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-chart-4 border-chart-4/30 hover:bg-chart-4/10" onClick={() => handleBulkAction("Price adjustment suggestions")}>
            <DollarSign className="h-3 w-3" /> Suggest Prices
          </Button>
        )}
        {types.has("SEO_VISIBILITY") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10" onClick={() => handleBulkAction("SEO optimization jobs")}>
            <Search className="h-3 w-3" /> Trigger SEO
          </Button>
        )}
        {types.has("MARKETING_BOOST") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-chart-1 border-chart-1/30 hover:bg-chart-1/10" onClick={() => handleBulkAction("Marketing boost tags")}>
            <Megaphone className="h-3 w-3" /> Boost Marketing
          </Button>
        )}
        {types.has("LISTING_PAUSE") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleBulkAction("Listing pause recommendations")}>
            <PauseCircle className="h-3 w-3" /> Recommend Pause
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──

const ListingOptimizationCenter = React.memo(function ListingOptimizationCenter() {
  const { data, isLoading, refetch } = useListingPerformanceOptimizer(50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const groupedRecs = useMemo(() => {
    if (!data) return { immediate: [], strategic: [], monitor: [], all: [] };
    const immediate = data.recommendations.filter((r) => r.priority_level === "Immediate Action");
    const strategic = data.recommendations.filter((r) => r.priority_level === "Strategic Improvement");
    const monitor = data.recommendations.filter((r) => r.priority_level === "Monitor Performance");
    return { immediate, strategic, monitor, all: data.recommendations };
  }, [data]);

  const activeRecs = useMemo(() => {
    switch (activeTab) {
      case "immediate": return groupedRecs.immediate;
      case "strategic": return groupedRecs.strategic;
      case "monitor": return groupedRecs.monitor;
      default: return groupedRecs.all;
    }
  }, [activeTab, groupedRecs]);

  const selectedRecs = useMemo(
    () => (data?.recommendations || []).filter((r) => selectedIds.has(r.listing_id)),
    [data, selectedIds]
  );

  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(activeRecs.map((r) => r.listing_id)));
  }, [activeRecs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Listing Optimization Center
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered listing performance analysis with bulk optimization actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" /> Rescan
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/30 rounded-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Zap className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold">{data?.immediate_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Immediate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 rounded-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Target className="h-4 w-4 text-chart-4" />
            </div>
            <div>
              <p className="text-lg font-bold">{data?.strategic_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Strategic</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 rounded-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/30">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold">{data?.monitor_count || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Monitor</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 rounded-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <BarChart3 className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-lg font-bold">{data?.total_recommendations || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Recs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Preview */}
      <ImpactSummary selectedRecs={selectedRecs} />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        selectedRecs={selectedRecs}
        onClearSelection={clearSelection}
      />

      {/* Tabs + Listing List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-3">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              All ({data?.total_recommendations || 0})
            </TabsTrigger>
            <TabsTrigger value="immediate" className="text-xs h-7 px-3 gap-1">
              <Zap className="h-3 w-3" />
              Immediate ({groupedRecs.immediate.length})
            </TabsTrigger>
            <TabsTrigger value="strategic" className="text-xs h-7 px-3 gap-1">
              <Target className="h-3 w-3" />
              Strategic ({groupedRecs.strategic.length})
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs h-7 px-3 gap-1">
              <Eye className="h-3 w-3" />
              Stable ({groupedRecs.monitor.length})
            </TabsTrigger>
          </TabsList>

          {activeRecs.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllVisible}>
              Select All ({activeRecs.length})
            </Button>
          )}
        </div>

        {["all", "immediate", "strategic", "monitor"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-3 space-y-2">
            {activeRecs.length > 0 ? (
              activeRecs.map((rec, i) => (
                <ListingRow
                  key={`${rec.listing_id}-${rec.optimization_type}-${i}`}
                  rec={rec}
                  selected={selectedIds.has(rec.listing_id)}
                  onToggle={toggleSelection}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-8 w-8 text-chart-1 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {tab === "all"
                    ? "All listings performing within healthy thresholds"
                    : `No listings require ${tab === "immediate" ? "immediate" : tab === "strategic" ? "strategic" : "monitoring"} attention`}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
});

export default ListingOptimizationCenter;
