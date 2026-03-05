import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import { useMemo } from "react";

interface SoldProperty {
  id: string;
  title: string;
  days_on_market: number | null;
  predicted_days_to_sell: number | null;
  sold_at: string | null;
  listed_at: string | null;
  city: string | null;
  property_type: string | null;
  price: number | null;
}

export default function DOMAccuracyReport() {
  const { data: soldProperties = [], isLoading } = useQuery({
    queryKey: ["dom-accuracy-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, days_on_market, predicted_days_to_sell, sold_at, listed_at, city, property_type, price")
        .eq("status", "sold")
        .not("days_on_market", "is", null)
        .order("sold_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as SoldProperty[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Properties with both actual and predicted values
  const paired = useMemo(
    () => soldProperties.filter((p) => p.days_on_market != null && p.predicted_days_to_sell != null),
    [soldProperties]
  );

  // Accuracy metrics
  const metrics = useMemo(() => {
    if (!paired.length) return null;
    const errors = paired.map((p) => p.predicted_days_to_sell! - p.days_on_market!);
    const absErrors = errors.map(Math.abs);
    const mae = absErrors.reduce((s, v) => s + v, 0) / absErrors.length;
    const mape =
      paired.reduce(
        (s, p) => s + (p.days_on_market! > 0 ? Math.abs(p.predicted_days_to_sell! - p.days_on_market!) / p.days_on_market! : 0),
        0
      ) /
      paired.length *
      100;
    const within10 = paired.filter((p) => Math.abs(p.predicted_days_to_sell! - p.days_on_market!) <= 10).length;
    const within30 = paired.filter((p) => Math.abs(p.predicted_days_to_sell! - p.days_on_market!) <= 30).length;
    const overPredicted = errors.filter((e) => e > 0).length;
    const underPredicted = errors.filter((e) => e < 0).length;
    const avgActual = paired.reduce((s, p) => s + p.days_on_market!, 0) / paired.length;
    const avgPredicted = paired.reduce((s, p) => s + p.predicted_days_to_sell!, 0) / paired.length;

    return {
      mae: mae.toFixed(1),
      mape: mape.toFixed(1),
      within10,
      within30,
      within10Pct: ((within10 / paired.length) * 100).toFixed(0),
      within30Pct: ((within30 / paired.length) * 100).toFixed(0),
      overPredicted,
      underPredicted,
      exact: paired.length - overPredicted - underPredicted,
      total: paired.length,
      avgActual: avgActual.toFixed(0),
      avgPredicted: avgPredicted.toFixed(0),
    };
  }, [paired]);

  // Error distribution buckets
  const errorDistribution = useMemo(() => {
    const buckets: Record<string, number> = {
      "< -30": 0,
      "-30 to -10": 0,
      "-10 to 0": 0,
      "0 to 10": 0,
      "10 to 30": 0,
      "> 30": 0,
    };
    paired.forEach((p) => {
      const err = p.predicted_days_to_sell! - p.days_on_market!;
      if (err < -30) buckets["< -30"]++;
      else if (err < -10) buckets["-30 to -10"]++;
      else if (err <= 0) buckets["-10 to 0"]++;
      else if (err <= 10) buckets["0 to 10"]++;
      else if (err <= 30) buckets["10 to 30"]++;
      else buckets["> 30"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [paired]);

  // Scatter data
  const scatterData = useMemo(
    () =>
      paired.map((p) => ({
        actual: p.days_on_market!,
        predicted: p.predicted_days_to_sell!,
        title: p.title,
      })),
    [paired]
  );

  // Accuracy by property type
  const byType = useMemo(() => {
    const groups: Record<string, { actual: number[]; predicted: number[] }> = {};
    paired.forEach((p) => {
      const type = p.property_type || "Unknown";
      if (!groups[type]) groups[type] = { actual: [], predicted: [] };
      groups[type].actual.push(p.days_on_market!);
      groups[type].predicted.push(p.predicted_days_to_sell!);
    });
    return Object.entries(groups).map(([type, g]) => ({
      type,
      count: g.actual.length,
      avgActual: +(g.actual.reduce((s, v) => s + v, 0) / g.actual.length).toFixed(0),
      avgPredicted: +(g.predicted.reduce((s, v) => s + v, 0) / g.predicted.length).toFixed(0),
      mae: +(g.actual.reduce((s, v, i) => s + Math.abs(g.predicted[i] - v), 0) / g.actual.length).toFixed(1),
    }));
  }, [paired]);

  const accuracyGrade =
    metrics && Number(metrics.mape) < 15
      ? { label: "Excellent", color: "border-chart-1 text-chart-1 bg-chart-1/10" }
      : metrics && Number(metrics.mape) < 30
      ? { label: "Good", color: "border-chart-3 text-chart-3 bg-chart-3/10" }
      : { label: "Needs Improvement", color: "border-destructive text-destructive bg-destructive/10" };

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">DOM Prediction Accuracy</h2>
            <p className="text-sm text-muted-foreground">
              Predicted vs actual days-on-market for sold properties
            </p>
          </div>
        </div>
        {metrics && (
          <Badge variant="outline" className={accuracyGrade.color}>
            <Activity className="h-3 w-3 mr-1" />
            {accuracyGrade.label} (MAPE: {metrics.mape}%)
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !metrics ? (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No Prediction Data</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              No sold properties with both actual and predicted DOM found. Predictions are stored when the core-engine's "days_to_sell_prediction" mode is used.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Mean Absolute Error"
              value={`${metrics.mae} days`}
              icon={<BarChart3 className="h-4 w-4" />}
              color="text-primary"
              sub={`${metrics.total} properties analyzed`}
            />
            <KpiCard
              label="Within ±10 Days"
              value={`${metrics.within10Pct}%`}
              icon={<CheckCircle className="h-4 w-4" />}
              color="text-chart-1"
              sub={`${metrics.within10} of ${metrics.total}`}
            />
            <KpiCard
              label="Over-predicted"
              value={`${metrics.overPredicted}`}
              icon={<TrendingUp className="h-4 w-4" />}
              color="text-chart-3"
              sub={`Predicted longer than actual`}
            />
            <KpiCard
              label="Under-predicted"
              value={`${metrics.underPredicted}`}
              icon={<TrendingDown className="h-4 w-4" />}
              color="text-destructive"
              sub={`Predicted shorter than actual`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scatter: Predicted vs Actual */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Predicted vs Actual
                </CardTitle>
                <CardDescription>Each dot is a sold property (closer to diagonal = more accurate)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis
                      dataKey="actual"
                      name="Actual DOM"
                      fontSize={11}
                      className="fill-muted-foreground"
                      label={{ value: "Actual (days)", position: "insideBottom", offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="predicted"
                      name="Predicted DOM"
                      fontSize={11}
                      className="fill-muted-foreground"
                      label={{ value: "Predicted (days)", angle: -90, position: "insideLeft", fontSize: 11 }}
                    />
                    <ZAxis range={[40, 40]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(val: number, name: string) => [`${val} days`, name]}
                    />
                    <ReferenceLine
                      segment={[{ x: 0, y: 0 }, { x: Math.max(...scatterData.map((d) => Math.max(d.actual, d.predicted)), 100), y: Math.max(...scatterData.map((d) => Math.max(d.actual, d.predicted)), 100) }]}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                    />
                    <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Distribution */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Prediction Error Distribution
                </CardTitle>
                <CardDescription>How many days off predictions are (negative = under, positive = over)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={errorDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="range" fontSize={11} className="fill-muted-foreground" />
                    <YAxis fontSize={11} className="fill-muted-foreground" />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="count" name="Properties" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Accuracy by Property Type */}
          {byType.length > 0 && (
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Accuracy by Property Type
                </CardTitle>
                <CardDescription>How predictions perform across different property categories</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Avg Actual</TableHead>
                      <TableHead className="text-right">Avg Predicted</TableHead>
                      <TableHead className="text-right">MAE</TableHead>
                      <TableHead className="text-right">Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byType
                      .sort((a, b) => b.count - a.count)
                      .map((row) => {
                        const accPct = row.avgActual > 0 ? Math.max(0, 100 - (row.mae / row.avgActual) * 100) : 0;
                        return (
                          <TableRow key={row.type}>
                            <TableCell className="font-medium capitalize">{row.type}</TableCell>
                            <TableCell className="text-right">{row.count}</TableCell>
                            <TableCell className="text-right">{row.avgActual} days</TableCell>
                            <TableCell className="text-right">{row.avgPredicted} days</TableCell>
                            <TableCell className="text-right">{row.mae} days</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className={
                                  accPct >= 85
                                    ? "border-chart-1 text-chart-1"
                                    : accPct >= 70
                                    ? "border-chart-3 text-chart-3"
                                    : "border-destructive text-destructive"
                                }
                              >
                                {accPct.toFixed(0)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Recent Predictions Table */}
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Sold Properties</CardTitle>
              <CardDescription>Latest sold properties with prediction comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actual DOM</TableHead>
                      <TableHead className="text-right">Predicted</TableHead>
                      <TableHead className="text-right">Error</TableHead>
                      <TableHead className="text-right">Sold Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paired.slice(0, 20).map((p) => {
                      const err = p.predicted_days_to_sell! - p.days_on_market!;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                          <TableCell>{p.city || "—"}</TableCell>
                          <TableCell className="text-right">{p.days_on_market} days</TableCell>
                          <TableCell className="text-right">{p.predicted_days_to_sell} days</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                Math.abs(err) <= 10
                                  ? "text-chart-1"
                                  : Math.abs(err) <= 30
                                  ? "text-chart-3"
                                  : "text-destructive"
                              }
                            >
                              {err > 0 ? "+" : ""}{err}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs">
                            {p.sold_at ? new Date(p.sold_at).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <Card className="border-border/40 hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className={color}>{icon}</div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
