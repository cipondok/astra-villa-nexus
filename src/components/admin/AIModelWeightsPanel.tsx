import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sliders, RefreshCw, ShieldCheck, Activity, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface WeightsResponse {
  mode: string;
  old_weights: Record<string, number>;
  new_weights: Record<string, number>;
  adjustments: Record<string, number>;
  model_health: {
    total_events: number;
    data_sufficiency: string;
    confidence: string;
    correlations: Record<string, number>;
    last_tuned: string | null;
    weights_updated: boolean;
  };
}

const FACTOR_LABELS: Record<string, string> = {
  location: "Location Match",
  price: "Price Proximity",
  feature: "Feature Match",
  investment: "Investment Score",
  popularity: "Popularity",
  collaborative: "Collaborative",
};

const FACTOR_COLORS: Record<string, string> = {
  location: "hsl(var(--primary))",
  price: "hsl(var(--chart-1))",
  feature: "hsl(var(--chart-2))",
  investment: "hsl(var(--chart-3))",
  popularity: "hsl(var(--chart-4))",
  collaborative: "hsl(var(--chart-5))",
};

export default function AIModelWeightsPanel() {
  const queryClient = useQueryClient();
  const [lastTuneResult, setLastTuneResult] = useState<WeightsResponse | null>(null);

  // Fetch current weights
  const { data: weights, isLoading } = useQuery({
    queryKey: ["ai-model-weights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_model_weights" as any)
        .select("factor, weight, updated_at, updated_by")
        .order("factor");
      if (error) throw error;
      return data as unknown as { factor: string; weight: number; updated_at: string; updated_by: string }[];
    },
  });

  // Fetch recent event counts
  const { data: eventStats } = useQuery({
    queryKey: ["ai-rec-event-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data, error } = await supabase
        .from("ai_recommendation_events" as any)
        .select("event_type")
        .gte("created_at", thirtyDaysAgo);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of ((data || []) as unknown as { event_type: string }[])) {
        counts[row.event_type] = (counts[row.event_type] || 0) + 1;
      }
      return counts;
    },
  });

  // Tune mutation
  const tuneMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("core-engine", {
        body: { mode: "auto_tune_ai_weights" },
      });
      if (error) throw error;
      return data as WeightsResponse;
    },
    onSuccess: (data) => {
      setLastTuneResult(data);
      queryClient.invalidateQueries({ queryKey: ["ai-model-weights"] });
      if (data.model_health.weights_updated) {
        toast.success("AI weights updated successfully");
      } else {
        toast.info("Insufficient data — weights not changed");
      }
    },
    onError: (err) => {
      toast.error("Tuning failed: " + (err instanceof Error ? err.message : "Unknown error"));
    },
  });

  const radarData = (weights || []).map((w) => ({
    factor: FACTOR_LABELS[w.factor] || w.factor,
    weight: w.weight,
    fullMark: 35,
  }));

  const barData = (weights || []).map((w) => ({
    factor: FACTOR_LABELS[w.factor] || w.factor,
    weight: w.weight,
    fill: FACTOR_COLORS[w.factor] || "hsl(var(--primary))",
  }));

  const totalEvents = eventStats
    ? Object.values(eventStats).reduce((a, b) => a + b, 0)
    : 0;

  const lastUpdated = weights?.reduce((latest, w) => {
    if (!latest || w.updated_at > latest) return w.updated_at;
    return latest;
  }, "" as string);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Sliders className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Model Weights</h2>
            <p className="text-sm text-muted-foreground">
              Tuning configuration for the recommendation scoring engine
            </p>
          </div>
        </div>
        <Button
          onClick={() => tuneMutation.mutate()}
          disabled={tuneMutation.isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${tuneMutation.isPending ? "animate-spin" : ""}`} />
          {tuneMutation.isPending ? "Tuning…" : "Run Auto-Tune"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total Events (30d)"
              value={totalEvents.toLocaleString()}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Impressions"
              value={(eventStats?.impression || 0).toLocaleString()}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Conversions"
              value={((eventStats?.save || 0) + (eventStats?.inquiry || 0) + (eventStats?.contact || 0)).toLocaleString()}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Last Tuned"
              value={lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "Never"}
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Weight Distribution
                </CardTitle>
                <CardDescription>Current scoring factor weights (sum = 100)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 35]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Radar
                      name="Weight"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weight Breakdown</CardTitle>
                <CardDescription>Individual factor weights</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis type="number" domain={[0, 35]} fontSize={12} className="fill-muted-foreground" />
                    <YAxis dataKey="factor" type="category" fontSize={11} width={110} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="weight" name="Weight" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Factor Detail Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(weights || []).map((w) => (
              <Card key={w.factor} className="border-border/40">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {FACTOR_LABELS[w.factor] || w.factor}
                  </p>
                  <p className="text-3xl font-bold text-foreground">{w.weight}</p>
                  <Badge variant="outline" className="mt-1.5 text-[10px]">
                    {w.updated_by}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Last Tune Result */}
          {lastTuneResult && (
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Last Auto-Tune Result
                </CardTitle>
                <CardDescription>
                  {lastTuneResult.model_health.weights_updated
                    ? "Weights were adjusted based on conversion correlations"
                    : "Weights not changed — insufficient data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Data Sufficiency Banner */}
                {lastTuneResult.model_health.data_sufficiency === "insufficient" && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">
                      Only {lastTuneResult.model_health.total_events} events in the last 30 days. Need 100+ for adjustments.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(lastTuneResult.adjustments).map(([factor, adj]) => (
                    <div
                      key={factor}
                      className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <span className="text-[11px] text-muted-foreground font-medium mb-1">
                        {FACTOR_LABELS[factor] || factor}
                      </span>
                      <div className="flex items-center gap-1">
                        {adj > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
                        ) : adj < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={`text-lg font-bold ${
                            adj > 0
                              ? "text-chart-1"
                              : adj < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {adj > 0 ? `+${adj}` : adj}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {lastTuneResult.old_weights[factor]} → {lastTuneResult.new_weights[factor]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Model Health */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">
                    Events: {lastTuneResult.model_health.total_events}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      lastTuneResult.model_health.confidence === "high"
                        ? "border-chart-1 text-chart-1"
                        : lastTuneResult.model_health.confidence === "medium"
                        ? "border-chart-3 text-chart-3"
                        : "border-destructive text-destructive"
                    }
                  >
                    Confidence: {lastTuneResult.model_health.confidence}
                  </Badge>
                  <Badge variant="outline">
                    Data: {lastTuneResult.model_health.data_sufficiency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/40">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
