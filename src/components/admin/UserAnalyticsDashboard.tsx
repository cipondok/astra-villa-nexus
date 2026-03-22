import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserCheck, UserX, TrendingUp, Clock, Activity,
  ShieldCheck, BarChart3, AlertTriangle, Globe
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))"
];

const UserAnalyticsDashboard = () => {
  // Fetch comprehensive stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-analytics-stats"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const twentyFourHoursAgo = new Date(now.getTime() - 86400000).toISOString();

      const [
        { count: totalUsers },
        { count: verifiedUsers },
        { count: suspendedUsers },
        { count: newUsers30d },
        { count: newUsers7d },
        { count: newUsers24h },
        { data: roleData },
        { data: recentUsers },
        { data: verificationData },
        { count: loginActivity24h },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_suspended", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", twentyFourHoursAgo),
        supabase.from("user_roles").select("role, is_active").eq("is_active", true),
        supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("verification_status"),
        supabase.from("login_activity_log").select("*", { count: "exact", head: true }).gte("created_at", twentyFourHoursAgo),
      ]);

      // Registration trend (last 30 days)
      const dailyCounts: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        dailyCounts[d.toISOString().split("T")[0]] = 0;
      }
      (recentUsers || []).forEach((u) => {
        const day = new Date(u.created_at).toISOString().split("T")[0];
        if (dailyCounts[day] !== undefined) dailyCounts[day]++;
      });
      const registrationTrend = Object.entries(dailyCounts).map(([date, count]) => ({
        date: date.slice(5), // MM-DD
        users: count,
      }));

      // Role distribution
      const roleCounts: Record<string, number> = {};
      (roleData || []).forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      const roleDistribution = Object.entries(roleCounts)
        .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
        .sort((a, b) => b.value - a.value);

      // Verification breakdown
      const verifCounts: Record<string, number> = {};
      (verificationData || []).forEach((v: any) => {
        const status = v.verification_status || "pending";
        verifCounts[status] = (verifCounts[status] || 0) + 1;
      });
      const verificationBreakdown = Object.entries(verifCounts).map(([name, value]) => ({
        name,
        value,
      }));

      return {
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        newUsers30d: newUsers30d || 0,
        newUsers7d: newUsers7d || 0,
        newUsers24h: newUsers24h || 0,
        loginActivity24h: loginActivity24h || 0,
        totalRoles: roleData?.length || 0,
        registrationTrend,
        roleDistribution,
        verificationBreakdown,
        verificationRate: totalUsers ? Math.round(((verifiedUsers || 0) / totalUsers) * 100) : 0,
        growthRate: newUsers30d && totalUsers
          ? ((newUsers30d || 0) / ((totalUsers || 1) - (newUsers30d || 0)) * 100).toFixed(1)
          : "0",
      };
    },
    staleTime: 60000,
  });

  const kpiCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Verified", value: stats?.verifiedUsers ?? 0, icon: UserCheck, color: "text-chart-1", bg: "bg-chart-1/10", sub: `${stats?.verificationRate ?? 0}%` },
    { label: "Suspended", value: stats?.suspendedUsers ?? 0, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "New (24h)", value: stats?.newUsers24h ?? 0, icon: Activity, color: "text-chart-2", bg: "bg-chart-2/10" },
    { label: "New (7d)", value: stats?.newUsers7d ?? 0, icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "New (30d)", value: stats?.newUsers30d ?? 0, icon: TrendingUp, color: "text-chart-4", bg: "bg-chart-4/10", sub: `+${stats?.growthRate ?? 0}%` },
    { label: "Logins (24h)", value: stats?.loginActivity24h ?? 0, icon: Globe, color: "text-accent-foreground", bg: "bg-accent/10" },
    { label: "Role Assignments", value: stats?.totalRoles ?? 0, icon: ShieldCheck, color: "text-chart-5", bg: "bg-chart-5/10" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold">User Analytics & Insights</h2>
          <p className="text-[10px] text-muted-foreground">Registration trends, activity metrics, and verification analytics</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="border">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`p-1 rounded ${kpi.bg}`}>
                  <kpi.icon className={`h-3 w-3 ${kpi.color}`} />
                </div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold">{isLoading ? "—" : kpi.value.toLocaleString()}</p>
                {kpi.sub && (
                  <span className="text-[9px] text-chart-1 font-medium">{kpi.sub}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration Trend */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Registration Trend (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.registrationTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Role Distribution Pie */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Loading...</div>
            ) : (stats?.roleDistribution?.length || 0) > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats?.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats?.roleDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {stats?.roleDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-[10px] capitalize">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                No role data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Breakdown */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            Verification Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {(stats?.verificationBreakdown || []).map((item) => {
                const colorMap: Record<string, { bg: string; text: string; icon: typeof UserCheck }> = {
                  verified: { bg: "bg-chart-1/10", text: "text-chart-1", icon: UserCheck },
                  approved: { bg: "bg-chart-1/10", text: "text-chart-1", icon: UserCheck },
                  pending: { bg: "bg-chart-3/10", text: "text-chart-3", icon: Clock },
                  rejected: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
                  suspended: { bg: "bg-destructive/10", text: "text-destructive", icon: UserX },
                  unverified: { bg: "bg-muted", text: "text-muted-foreground", icon: AlertTriangle },
                };
                const cfg = colorMap[item.name] || colorMap.pending;
                const Icon = cfg.icon;
                return (
                  <div key={item.name} className={`${cfg.bg} rounded-lg p-3 text-center`}>
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.text}`} />
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className={`text-[9px] font-medium uppercase tracking-wider ${cfg.text}`}>
                      {item.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-semibold">Growth Insight</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stats?.newUsers7d && stats.newUsers7d > 0
                  ? `${stats.newUsers7d} new users joined in the last 7 days. Verification rate stands at ${stats.verificationRate}%. ${
                      stats.verificationRate < 50
                        ? "Consider sending verification reminders to improve trust metrics."
                        : "Healthy verification rate — keep monitoring for quality."
                    }`
                  : "No new registrations in the last 7 days. Consider increasing acquisition efforts."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalyticsDashboard;
