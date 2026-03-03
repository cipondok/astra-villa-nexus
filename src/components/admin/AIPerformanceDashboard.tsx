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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Eye, MousePointerClick, Heart, Phone } from "lucide-react";

interface Bucket {
  score_range: string;
  property_count: number;
  impressions: number;
  clicks: number;
  saves: number;
  contacts: number;
  ctr_percent: number;
  save_rate_percent: number;
  contact_rate_percent: number;
}

export default function AIPerformanceDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-performance-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("core-engine", {
        body: { mode: "ai_performance_summary" },
      });
      if (error) throw error;
      return data;
    },
  });

  const buckets: Bucket[] = data?.buckets || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Performance Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Recommendation system effectiveness (last 30 days)
            </p>
          </div>
        </div>
        {data?.overall_health && (
          <Badge
            variant="outline"
            className={
              data.overall_health === "Excellent"
                ? "border-chart-1 text-chart-1 bg-chart-1/10"
                : data.overall_health === "Good"
                ? "border-chart-3 text-chart-3 bg-chart-3/10"
                : "border-destructive text-destructive bg-destructive/10"
            }
          >
            {data.overall_health}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total Impressions"
              value={(summary.total_impressions || 0).toLocaleString()}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Overall CTR"
              value={`${summary.overall_ctr || 0}%`}
              icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Save Rate"
              value={`${summary.overall_save_rate || 0}%`}
              icon={<Heart className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Contact Rate"
              value={`${summary.overall_contact_rate || 0}%`}
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="CTR by AI Score Range">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="score_range" fontSize={12} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="ctr_percent" name="CTR %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Save Rate by AI Score Range">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="score_range" fontSize={12} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="save_rate_percent" name="Save %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Contact Rate by AI Score Range">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="score_range" fontSize={12} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="contact_rate_percent" name="Contact %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Score Distribution */}
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                AI Score Distribution
              </CardTitle>
              <CardDescription>Properties grouped by AI recommendation score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="score_range" fontSize={12} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="property_count" name="Properties" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
