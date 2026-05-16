import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDealProbabilityScores } from "@/hooks/useDealProbabilityScores";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Zap,
  RefreshCw,
  BarChart3,
  Flame,
} from "lucide-react";

const probabilityColor = (p: number) => {
  if (p >= 70) return "text-emerald-400";
  if (p >= 45) return "text-amber-400";
  return "text-red-400";
};

const probabilityBadge = (p: number) => {
  if (p >= 70) return { label: "Hot Deal", variant: "default" as const, className: "bg-emerald-600" };
  if (p >= 45) return { label: "Warming", variant: "secondary" as const, className: "bg-amber-600" };
  return { label: "Cold", variant: "destructive" as const, className: "bg-red-600" };
};

const DealProbabilityDashboard: React.FC = () => {
  const { data: scores, isLoading, refetch } = useDealProbabilityScores(50);
  const [computing, setComputing] = useState(false);

  const runCompute = async () => {
    setComputing(true);
    try {
      const { error } = await supabase.functions.invoke("compute-deal-probability");
      if (error) throw error;
      toast.success("Deal probability scores recomputed");
      refetch();
    } catch {
      toast.error("Failed to compute scores");
    } finally {
      setComputing(false);
    }
  };

  const topDeals = scores?.filter((s) => s.overall_close_probability >= 70) ?? [];
  const warmDeals = scores?.filter((s) => s.overall_close_probability >= 45 && s.overall_close_probability < 70) ?? [];
  const coldDeals = scores?.filter((s) => s.overall_close_probability < 45) ?? [];
  const avgProb = scores?.length
    ? Math.round(scores.reduce((a, b) => a + b.overall_close_probability, 0) / scores.length)
    : 0;
  const urgentPricing = scores?.filter((s) => s.overall_close_probability < 30 && s.demand_signal_score > 50).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Deal Probability Engine
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-predicted close probability for active listings
          </p>
        </div>
        <Button onClick={runCompute} disabled={computing} size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${computing ? "animate-spin" : ""}`} />
          {computing ? "Computing…" : "Recompute"}
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Avg Probability", value: `${avgProb}%`, icon: BarChart3, color: probabilityColor(avgProb) },
          { label: "Hot Deals", value: topDeals.length, icon: Flame, color: "text-emerald-400" },
          { label: "Warming", value: warmDeals.length, icon: TrendingUp, color: "text-amber-400" },
          { label: "Cold", value: coldDeals.length, icon: Clock, color: "text-red-400" },
          { label: "Need Pricing Fix", value: urgentPricing, icon: AlertTriangle, color: "text-orange-400" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-3 flex items-center gap-3">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hot" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="hot">🔥 Hot ({topDeals.length})</TabsTrigger>
          <TabsTrigger value="warm">⏳ Warming ({warmDeals.length})</TabsTrigger>
          <TabsTrigger value="cold">❄️ Cold ({coldDeals.length})</TabsTrigger>
          <TabsTrigger value="formula">📐 Formula</TabsTrigger>
        </TabsList>

        {["hot", "warm", "cold"].map((tab) => {
          const list = tab === "hot" ? topDeals : tab === "warm" ? warmDeals : coldDeals;
          return (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading scores…</p>
              ) : list.length === 0 ? (
                <p className="text-muted-foreground text-sm">No listings in this tier yet.</p>
              ) : (
                list.map((s, i) => {
                  const badge = probabilityBadge(s.overall_close_probability);
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="bg-card/50 border-border/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={badge.className}>{badge.label}</Badge>
                              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                {s.city || "Unknown"}
                              </span>
                            </div>
                            <span className={`text-2xl font-bold ${probabilityColor(s.overall_close_probability)}`}>
                              {s.overall_close_probability}%
                            </span>
                          </div>
                          <Progress value={s.overall_close_probability} className="h-2 mb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div>📊 Demand: <span className="text-foreground font-medium">{s.demand_signal_score}</span></div>
                            <div>🎯 Intent: <span className="text-foreground font-medium">{s.investor_intent_density}</span></div>
                            <div>💬 Inquiry: <span className="text-foreground font-medium">{s.inquiry_velocity}</span></div>
                            <div>🤝 Negotiation: <span className="text-foreground font-medium">{s.negotiation_activity_level}</span></div>
                            <div>💰 Pricing: <span className="text-foreground font-medium">{s.pricing_alignment_score}</span></div>
                            <div>🌊 Liquidity: <span className="text-foreground font-medium">{s.liquidity_zone_score}</span></div>
                            <div>🔄 Seller Flex: <span className="text-foreground font-medium">{s.seller_flexibility_index}</span></div>
                            <div>⏱ Days to Close: <span className="text-foreground font-medium">{s.predicted_days_to_close}d</span></div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            Confidence: {s.confidence_level}% · Price: Rp {Number(s.listing_price || 0).toLocaleString("id-ID")}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          );
        })}

        <TabsContent value="formula" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-base">Scoring Formula</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <pre className="bg-muted/30 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">{`overall_close_probability =
  (0.20 × demand_signal_score)
+ (0.20 × investor_intent_density)
+ (0.15 × inquiry_velocity)
+ (0.15 × negotiation_activity_level)
+ (0.10 × pricing_alignment_score)
+ (0.10 × liquidity_zone_score)
+ (0.10 × seller_flexibility_index)

predicted_days_to_close = 90 × (1 − probability / 100)

confidence = data_points_available × 20 (max 100)`}</pre>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <p className="font-medium text-emerald-400">🔥 Hot Deal ≥ 70%</p>
                  <p className="text-xs mt-1">Strong behavioral signals + high liquidity zone. Prioritize for closing acceleration.</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                  <p className="font-medium text-amber-400">⏳ Warming 45–69%</p>
                  <p className="text-xs mt-1">Growing interest but needs nudge — pricing optimization or investor outreach recommended.</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                  <p className="font-medium text-red-400">❄️ Cold &lt; 45%</p>
                  <p className="text-xs mt-1">Low engagement signals. Consider repricing, boosting, or repositioning the listing.</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                  <p className="font-medium text-blue-400">🧠 ML Training Ready</p>
                  <p className="text-xs mt-1">All scores feed into <code>deal_closure_training_dataset</code> for future ML model training.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealProbabilityDashboard;
