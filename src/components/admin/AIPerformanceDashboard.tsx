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
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Heart,
  Phone,
  RefreshCcw,
  Activity,
  Zap,
  Target,
  BarChart3,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";

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

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function AIPerformanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ai-performance-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("core-engine", {
        body: { mode: "ai_performance_summary" },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
  });

  // Fetch recent AI events for the activity feed
  const { data: recentEvents } = useQuery({
    queryKey: ["ai-recent-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_recommendation_events")
        .select("id, event_type, ai_score, created_at, property_id")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30 * 1000, // refresh every 30s
  });

  // Fetch daily trend data (last 14 days)
  const { data: trendData } = useQuery({
    queryKey: ["ai-daily-trends"],
    queryFn: async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const { data, error } = await supabase
        .from("ai_recommendation_events")
        .select("event_type, created_at")
        .gte("created_at", fourteenDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const buckets: Bucket[] = data?.buckets || [];
  const summary = data?.summary || {};

  // Process trend data into daily buckets
  const dailyTrends = useMemo(() => {
    if (!trendData?.length) return [];
    const days: Record<string, { date: string; impressions: number; clicks: number; saves: number; contacts: number }> = {};
    trendData.forEach((e: any) => {
      const day = new Date(e.created_at).toISOString().slice(0, 10);
      if (!days[day]) days[day] = { date: day, impressions: 0, clicks: 0, saves: 0, contacts: 0 };
      if (e.event_type === "impression") days[day].impressions++;
      else if (e.event_type === "click") days[day].clicks++;
      else if (e.event_type === "save") days[day].saves++;
      else if (e.event_type === "contact") days[day].contacts++;
    });
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  }, [trendData]);

  // Engagement funnel data
  const funnelData = useMemo(() => {
    if (!summary.total_impressions) return [];
    const totalClicks = buckets.reduce((s, b) => s + b.clicks, 0);
    const totalSaves = buckets.reduce((s, b) => s + b.saves, 0);
    const totalContacts = buckets.reduce((s, b) => s + b.contacts, 0);
    return [
      { name: "Impressions", value: summary.total_impressions },
      { name: "Clicks", value: totalClicks },
      { name: "Saves", value: totalSaves },
      { name: "Contacts", value: totalContacts },
    ];
  }, [summary, buckets]);

  // Score distribution for pie
  const pieData = useMemo(() => {
    return buckets.map((b) => ({
      name: b.score_range,
      value: b.property_count,
    }));
  }, [buckets]);

  const healthColor =
    data?.overall_health === "Excellent"
      ? "border-chart-1 text-chart-1 bg-chart-1/10"
      : data?.overall_health === "Good"
      ? "border-chart-3 text-chart-3 bg-chart-3/10"
      : "border-destructive text-destructive bg-destructive/10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Performance Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Recommendation system effectiveness — auto-refreshes every 5 min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data?.overall_health && (
            <Badge variant="outline" className={healthColor}>
              <Activity className="h-3 w-3 mr-1" />
              {data.overall_health}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Impressions"
              value={(summary.total_impressions || 0).toLocaleString()}
              icon={<Eye className="h-4 w-4" />}
              color="text-primary"
              trend={dailyTrends.length >= 2 ? getTrend(dailyTrends, "impressions") : undefined}
            />
            <KpiCard
              label="Overall CTR"
              value={`${summary.overall_ctr || 0}%`}
              icon={<MousePointerClick className="h-4 w-4" />}
              color="text-chart-2"
              trend={undefined}
            />
            <KpiCard
              label="Save Rate"
              value={`${summary.overall_save_rate || 0}%`}
              icon={<Heart className="h-4 w-4" />}
              color="text-chart-1"
              trend={undefined}
            />
            <KpiCard
              label="Contact Rate"
              value={`${summary.overall_contact_rate || 0}%`}
              icon={<Phone className="h-4 w-4" />}
              color="text-chart-3"
              trend={undefined}
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="funnel" className="gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Funnel
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Live Feed
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ChartCard title="CTR by AI Score Range" description="Click-through rate across score buckets">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={buckets}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="score_range" fontSize={11} className="fill-muted-foreground" />
                      <YAxis fontSize={11} className="fill-muted-foreground" unit="%" />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="ctr_percent" name="CTR %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Save Rate by Score Range" description="Save conversion across buckets">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={buckets}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="score_range" fontSize={11} className="fill-muted-foreground" />
                      <YAxis fontSize={11} className="fill-muted-foreground" unit="%" />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="save_rate_percent" name="Save %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Contact Rate by Score Range" description="Inquiry conversion across buckets">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={buckets}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="score_range" fontSize={11} className="fill-muted-foreground" />
                      <YAxis fontSize={11} className="fill-muted-foreground" unit="%" />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="contact_rate_percent" name="Contact %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Score Distribution + Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      AI Score Distribution
                    </CardTitle>
                    <CardDescription>Properties grouped by recommendation score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={buckets}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="score_range" fontSize={11} className="fill-muted-foreground" />
                        <YAxis fontSize={11} className="fill-muted-foreground" />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="property_count" name="Properties" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Score Breakdown
                    </CardTitle>
                    <CardDescription>Distribution of properties by AI score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={40}
                          strokeWidth={2}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4 mt-4">
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    14-Day Engagement Trends
                  </CardTitle>
                  <CardDescription>Daily impressions, clicks, saves & contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="date"
                          fontSize={11}
                          className="fill-muted-foreground"
                          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        />
                        <YAxis fontSize={11} className="fill-muted-foreground" />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                        <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                        <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="saves" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="contacts" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} strokeWidth={2} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No trend data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversion rates over time */}
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Daily Conversion Rates
                  </CardTitle>
                  <CardDescription>CTR and save rate computed daily</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={dailyTrends.map((d) => ({
                          ...d,
                          ctr: d.impressions > 0 ? +((d.clicks / d.impressions) * 100).toFixed(1) : 0,
                          saveRate: d.impressions > 0 ? +((d.saves / d.impressions) * 100).toFixed(1) : 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="date"
                          fontSize={11}
                          className="fill-muted-foreground"
                          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        />
                        <YAxis fontSize={11} className="fill-muted-foreground" unit="%" />
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                        <Line type="monotone" dataKey="ctr" name="CTR %" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="saveRate" name="Save %" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No trend data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funnel Tab */}
            <TabsContent value="funnel" className="mt-4">
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Engagement Funnel
                  </CardTitle>
                  <CardDescription>Drop-off from impressions to contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelData.length > 0 ? (
                    <div className="space-y-3 py-4">
                      {funnelData.map((step, i) => {
                        const maxVal = funnelData[0].value || 1;
                        const pct = ((step.value / maxVal) * 100).toFixed(1);
                        const dropPct =
                          i > 0 && funnelData[i - 1].value > 0
                            ? (((funnelData[i - 1].value - step.value) / funnelData[i - 1].value) * 100).toFixed(1)
                            : null;
                        return (
                          <div key={step.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">{step.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-foreground font-semibold">{step.value.toLocaleString()}</span>
                                {dropPct && (
                                  <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                                    -{dropPct}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="h-8 bg-muted/30 rounded-md overflow-hidden">
                              <div
                                className="h-full rounded-md transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                  opacity: 0.85,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No funnel data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Feed Tab */}
            <TabsContent value="activity" className="mt-4">
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Recent AI Events
                  </CardTitle>
                  <CardDescription>Latest recommendation interactions (auto-refreshes)</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentEvents && recentEvents.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {recentEvents.map((evt: any) => (
                        <div key={evt.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <EventIcon type={evt.event_type} />
                            <div>
                              <p className="text-sm font-medium text-foreground capitalize">{evt.event_type}</p>
                              <p className="text-xs text-muted-foreground">
                                Score: {evt.ai_score ?? "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(evt.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No recent events
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

/* ─── Helpers ─── */

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

function KpiCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: { direction: "up" | "down"; pct: string };
}) {
  return (
    <Card className="border-border/40 hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className={color}>{icon}</div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <span
              className={`flex items-center text-xs font-medium mb-1 ${
                trend.direction === "up" ? "text-chart-1" : "text-destructive"
              }`}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
              {trend.pct}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EventIcon({ type }: { type: string }) {
  const base = "h-7 w-7 rounded-full flex items-center justify-center";
  switch (type) {
    case "impression":
      return <div className={`${base} bg-primary/10`}><Eye className="h-3.5 w-3.5 text-primary" /></div>;
    case "click":
      return <div className={`${base} bg-chart-2/10`}><MousePointerClick className="h-3.5 w-3.5 text-chart-2" /></div>;
    case "save":
      return <div className={`${base} bg-chart-1/10`}><Heart className="h-3.5 w-3.5 text-chart-1" /></div>;
    case "contact":
      return <div className={`${base} bg-chart-3/10`}><Phone className="h-3.5 w-3.5 text-chart-3" /></div>;
    default:
      return <div className={`${base} bg-muted`}><Activity className="h-3.5 w-3.5 text-muted-foreground" /></div>;
  }
}

function getTrend(
  trends: { impressions: number }[],
  key: "impressions"
): { direction: "up" | "down"; pct: string } | undefined {
  if (trends.length < 2) return undefined;
  const recent = trends.slice(-3).reduce((s, d) => s + d[key], 0);
  const earlier = trends.slice(-6, -3).reduce((s, d) => s + d[key], 0);
  if (earlier === 0) return undefined;
  const change = ((recent - earlier) / earlier) * 100;
  return { direction: change >= 0 ? "up" : "down", pct: Math.abs(change).toFixed(0) };
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
