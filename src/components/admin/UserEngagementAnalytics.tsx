import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

const UserEngagementAnalytics = () => {
  const [period, setPeriod] = useState("30d");
  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const { data: sessionData } = useQuery({
    queryKey: ["engagement-sessions", period],
    queryFn: async () => {
      const startDate = subDays(new Date(), daysBack).toISOString();
      const { data, error } = await supabase
        .from("user_sessions")
        .select("id, user_id, created_at, last_activity_at, device_type")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: profileCount } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => {
      const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const sessions = sessionData || [];

  const dailyActiveUsers = (() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), daysBack), end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const uniqueUsers = new Set(
        sessions
          .filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === dayStr)
          .map((s) => s.user_id)
      );
      return { date: format(day, "MMM dd"), dau: uniqueUsers.size };
    });
  })();

  const mau = new Set(
    sessions
      .filter((s) => new Date(s.created_at) >= subDays(new Date(), 30))
      .map((s) => s.user_id)
  ).size;

  const todayDau = new Set(
    sessions
      .filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
      .map((s) => s.user_id)
  ).size;

  const avgSessionDuration = (() => {
    const durations = sessions
      .filter((s) => s.last_activity_at)
      .map((s) => (new Date(s.last_activity_at).getTime() - new Date(s.created_at).getTime()) / 1000)
      .filter((d) => d > 0 && d < 86400);
    return durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  })();

  const deviceBreakdown = (() => {
    const devices: Record<string, number> = {};
    sessions.forEach((s) => {
      const d = s.device_type || "unknown";
      devices[d] = (devices[d] || 0) + 1;
    });
    return Object.entries(devices)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  const hourlyDistribution = (() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, sessions: 0 }));
    sessions.forEach((s) => {
      const h = new Date(s.created_at).getHours();
      hours[h].sessions++;
    });
    return hours;
  })();

  const retention = (() => {
    const userFirstVisit: Record<string, string> = {};
    const userLastVisit: Record<string, string> = {};
    sessions.forEach((s) => {
      if (!s.user_id) return;
      const d = format(new Date(s.created_at), "yyyy-MM-dd");
      if (!userFirstVisit[s.user_id] || d < userFirstVisit[s.user_id]) userFirstVisit[s.user_id] = d;
      if (!userLastVisit[s.user_id] || d > userLastVisit[s.user_id]) userLastVisit[s.user_id] = d;
    });
    const totalUsers = Object.keys(userFirstVisit).length;
    const returningUsers = Object.keys(userFirstVisit).filter(
      (uid) => userFirstVisit[uid] !== userLastVisit[uid]
    ).length;
    return totalUsers > 0 ? Math.round((returningUsers / totalUsers) * 100) : 0;
  })();

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">User Engagement</h2>
        </div>
        <div className="flex gap-1">
          {["7d", "30d", "90d"].map((p) => (
            <Badge key={p} variant={period === p ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setPeriod(p)}>
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "DAU (Today)", value: todayDau.toLocaleString(), icon: Users },
          { label: "MAU (30d)", value: mau.toLocaleString(), icon: TrendingUp },
          { label: "Total Users", value: (profileCount || 0).toLocaleString(), icon: Users },
          { label: "Avg Session", value: formatDuration(avgSessionDuration), icon: Clock },
          { label: "Retention", value: `${retention}%`, icon: Activity },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dau" className="space-y-3">
        <TabsList className="h-8">
          <TabsTrigger value="dau" className="text-xs h-7">Daily Active Users</TabsTrigger>
          <TabsTrigger value="hourly" className="text-xs h-7">Peak Hours</TabsTrigger>
          <TabsTrigger value="devices" className="text-xs h-7">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="dau">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Daily Active Users</CardTitle></CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyActiveUsers}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="dau" stroke="hsl(var(--primary))" fill="url(#dauGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Session Distribution by Hour</CardTitle></CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Sessions by Device Type</CardTitle></CardHeader>
            <CardContent className="p-4">
              {deviceBreakdown.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No device data</p>
              ) : (
                <div className="space-y-3">
                  {deviceBreakdown.map((d) => {
                    const total = sessions.length || 1;
                    const pct = Math.round((d.value / total) * 100);
                    return (
                      <div key={d.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground capitalize">{d.name}</span>
                          <span className="text-xs text-muted-foreground">{d.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Sessions ({period})</p>
            <p className="text-2xl font-bold text-foreground">{sessions.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Unique Users ({period})</p>
            <p className="text-2xl font-bold text-foreground">{new Set(sessions.map((s) => s.user_id)).size.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserEngagementAnalytics;
