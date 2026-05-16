import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Sliders, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

interface WeightSnapshot {
  id: string;
  weights: Record<string, number>;
  trigger_type: string;
  total_events_analyzed: number | null;
  data_quality: string | null;
  notes: string | null;
  created_at: string;
}

const FACTORS = ["location", "price", "feature", "investment", "popularity", "collaborative"];
const FACTOR_COLORS: Record<string, string> = {
  location: "hsl(var(--primary))",
  price: "hsl(var(--chart-1))",
  feature: "hsl(var(--chart-2))",
  investment: "hsl(var(--chart-3))",
  popularity: "hsl(var(--chart-4))",
  collaborative: "hsl(var(--chart-5, var(--accent)))",
};

export default function WeightTuningHistory() {
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["weight-tuning-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_weight_history")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data || []) as WeightSnapshot[];
    },
    staleTime: 60 * 1000,
  });

  const chartData = useMemo(
    () =>
      snapshots.map((s) => ({
        date: new Date(s.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
        ...s.weights,
      })),
    [snapshots]
  );

  // Compute diff between last two snapshots
  const latestDiff = useMemo(() => {
    if (snapshots.length < 2) return null;
    const prev = snapshots[snapshots.length - 2].weights;
    const curr = snapshots[snapshots.length - 1].weights;
    return FACTORS.map((f) => ({
      factor: f,
      prev: prev[f] ?? 0,
      curr: curr[f] ?? 0,
      diff: (curr[f] ?? 0) - (prev[f] ?? 0),
    }));
  }, [snapshots]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-8">
          <div className="h-[300px] bg-muted/30 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Weight Tuning History</h2>
          <p className="text-sm text-muted-foreground">
            Track AI model weight changes across {snapshots.length} auto-tune cycles
          </p>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Sliders className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No Tuning History Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Weight history will appear after the daily auto-tune cron job runs with sufficient data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Weight Evolution Chart */}
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weight Evolution Over Time
              </CardTitle>
              <CardDescription>How each scoring factor's weight has changed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="date" fontSize={11} className="fill-muted-foreground" />
                  <YAxis fontSize={11} className="fill-muted-foreground" domain={[0, "auto"]} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                  {FACTORS.map((f) => (
                    <Line
                      key={f}
                      type="monotone"
                      dataKey={f}
                      name={f.charAt(0).toUpperCase() + f.slice(1)}
                      stroke={FACTOR_COLORS[f]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Latest Diff */}
          {latestDiff && (
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Latest Weight Changes
                </CardTitle>
                <CardDescription>
                  Diff from {new Date(snapshots[snapshots.length - 2].created_at).toLocaleDateString()} →{" "}
                  {new Date(snapshots[snapshots.length - 1].created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {latestDiff.map((d) => (
                    <div key={d.factor} className="p-3 rounded-lg bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground capitalize mb-1">{d.factor}</p>
                      <p className="text-lg font-bold text-foreground">{d.curr}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {d.diff > 0 ? (
                          <TrendingUp className="h-3 w-3 text-chart-1" />
                        ) : d.diff < 0 ? (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        ) : (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            d.diff > 0 ? "text-chart-1" : d.diff < 0 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {d.diff > 0 ? "+" : ""}{d.diff}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tuning Log</CardTitle>
              <CardDescription>All recorded auto-tune snapshots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Data Quality</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      {FACTORS.map((f) => (
                        <TableHead key={f} className="text-right capitalize text-xs">
                          {f.slice(0, 3)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...snapshots].reverse().map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs">
                          {new Date(s.created_at).toLocaleString("en", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {s.trigger_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              s.data_quality === "sufficient"
                                ? "border-chart-1 text-chart-1 text-[10px]"
                                : s.data_quality === "moderate"
                                ? "border-chart-3 text-chart-3 text-[10px]"
                                : "border-muted-foreground text-muted-foreground text-[10px]"
                            }
                          >
                            {s.data_quality || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs">{s.total_events_analyzed ?? "—"}</TableCell>
                        {FACTORS.map((f) => (
                          <TableCell key={f} className="text-right font-mono text-xs">
                            {s.weights[f] ?? "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
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
