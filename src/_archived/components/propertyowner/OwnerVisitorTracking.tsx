import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Users, Clock, Smartphone, Monitor, Globe, TrendingUp, Loader2, MapPin, ArrowRight, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-4))",
];

const parseUserAgent = (ua: string): { device: string; browser: string; os: string } => {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  let browser = "Other";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
};

const OwnerVisitorTracking = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "90">("30");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  // Fetch owner's properties
  const { data: properties = [] } = useQuery({
    queryKey: ["owner-properties-visitor", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch visitor interactions for owner's properties
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["owner-visitor-tracking", user?.id, timeRange],
    queryFn: async () => {
      if (!properties.length) return [];
      const propIds = properties.map(p => p.id);
      const since = subDays(new Date(), parseInt(timeRange)).toISOString();

      // Fetch view interactions for these properties
      const results: any[] = [];
      // Query in batches of property IDs to avoid URL length issues
      for (let i = 0; i < propIds.length; i += 10) {
        const batch = propIds.slice(i, i + 10);
        const { data, error } = await supabase
          .from("user_interactions")
          .select("id, user_id, interaction_type, interaction_data, created_at")
          .eq("interaction_type", "view")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(500);
        if (!error && data) results.push(...data);
      }

      // Filter to only interactions that reference owner's property IDs
      return results.filter((r: any) => {
        const data = r.interaction_data as Record<string, any>;
        const pageUrl = data?.page_url || "";
        return propIds.some(id => pageUrl.includes(`/property/${id}`) || data?.view_type === "property_detail");
      });
    },
    enabled: !!user && properties.length > 0,
  });

  // Process analytics
  const analytics = useMemo(() => {
    const propIds = properties.map(p => p.id);
    const propMap = Object.fromEntries(properties.map(p => [p.id, p.title || "Untitled"]));

    // Parse property_id from page_url
    const enriched = interactions.map((i: any) => {
      const data = i.interaction_data as Record<string, any>;
      const pageUrl = data?.page_url || "";
      const match = pageUrl.match(/\/property\/([a-f0-9-]+)/);
      const propertyId = match?.[1] || "";
      const ua = data?.user_agent || "";
      const parsed = parseUserAgent(ua);
      const referrer = data?.referrer || "";
      const duration = data?.view_duration || data?.time_spent || 0;

      let source = "Direct";
      if (referrer.includes("google")) source = "Google";
      else if (referrer.includes("facebook") || referrer.includes("fb.")) source = "Facebook";
      else if (referrer.includes("instagram")) source = "Instagram";
      else if (referrer.includes("twitter") || referrer.includes("x.com")) source = "X/Twitter";
      else if (referrer.includes("tiktok")) source = "TikTok";
      else if (referrer && !referrer.includes(window.location.hostname)) source = "Referral";

      return { ...i, propertyId, ...parsed, source, duration, referrer };
    }).filter((i: any) => propIds.includes(i.propertyId));

    // Apply property filter
    const filtered = selectedProperty === "all" ? enriched : enriched.filter((i: any) => i.propertyId === selectedProperty);

    // Unique visitors
    const uniqueVisitors = new Set(filtered.map((i: any) => i.user_id)).size;

    // Avg duration
    const durations = filtered.filter((i: any) => i.duration > 0).map((i: any) => i.duration);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length / 1000) : 0;

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    filtered.forEach((i: any) => { deviceCounts[i.device] = (deviceCounts[i.device] || 0) + 1; });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    filtered.forEach((i: any) => { sourceCounts[i.source] = (sourceCounts[i.source] || 0) + 1; });
    const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    filtered.forEach((i: any) => { browserCounts[i.browser] = (browserCounts[i.browser] || 0) + 1; });
    const browserData = Object.entries(browserCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Daily views trend
    const days = parseInt(timeRange);
    const dailyMap: Record<string, number> = {};
    for (let d = 0; d < days; d++) {
      const key = format(subDays(new Date(), d), "yyyy-MM-dd");
      dailyMap[key] = 0;
    }
    filtered.forEach((i: any) => {
      const key = format(new Date(i.created_at), "yyyy-MM-dd");
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    });
    const dailyData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({
        date: format(new Date(date), "d MMM", { locale: idLocale }),
        views,
      }));

    // Per-property views
    const propCounts: Record<string, number> = {};
    filtered.forEach((i: any) => { propCounts[i.propertyId] = (propCounts[i.propertyId] || 0) + 1; });
    const propData = Object.entries(propCounts)
      .map(([id, views]) => ({ name: (propMap[id] || "").slice(0, 20), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalViews: filtered.length,
      uniqueVisitors,
      avgDuration,
      deviceData,
      sourceData,
      browserData,
      dailyData,
      propData,
    };
  }, [interactions, properties, selectedProperty, timeRange]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Visitor Analytics</h3>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="h-7 text-[10px] w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari</SelectItem>
              <SelectItem value="14">14 Hari</SelectItem>
              <SelectItem value="30">30 Hari</SelectItem>
              <SelectItem value="90">90 Hari</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="h-7 text-[10px] w-[120px]">
              <SelectValue placeholder="Properti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Properti</SelectItem>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id}>{(p.title || "").slice(0, 25)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Views</p>
              <p className="text-lg font-bold text-foreground">{analytics.totalViews}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-chart-1/10">
              <Users className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Unique Visitors</p>
              <p className="text-lg font-bold text-foreground">{analytics.uniqueVisitors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-chart-3/10">
              <Clock className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg. Durasi</p>
              <p className="text-lg font-bold text-foreground">{analytics.avgDuration}s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Views Trend */}
      {analytics.dailyData.length > 0 && (
        <Card className="p-3 border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] font-semibold text-foreground">Tren Harian</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={analytics.dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 8 }} width={25} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Device & Source Charts */}
      <div className="grid grid-cols-2 gap-2">
        {/* Device Breakdown */}
        <Card className="p-3 border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Smartphone className="h-3.5 w-3.5 text-chart-5" />
            <p className="text-[10px] font-semibold text-foreground">Device</p>
          </div>
          {analytics.deviceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={analytics.deviceData} dataKey="value" cx="50%" cy="50%" outerRadius={40} innerRadius={20}>
                    {analytics.deviceData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {analytics.deviceData.map((d, idx) => (
                  <Badge key={d.name} variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {d.name} ({d.value})
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-4">Belum ada data</p>
          )}
        </Card>

        {/* Traffic Source */}
        <Card className="p-3 border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="h-3.5 w-3.5 text-chart-1" />
            <p className="text-[10px] font-semibold text-foreground">Sumber Traffic</p>
          </div>
          {analytics.sourceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={analytics.sourceData} dataKey="value" cx="50%" cy="50%" outerRadius={40} innerRadius={20}>
                    {analytics.sourceData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {analytics.sourceData.map((d, idx) => (
                  <Badge key={d.name} variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {d.name} ({d.value})
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-4">Belum ada data</p>
          )}
        </Card>
      </div>

      {/* Browser Breakdown */}
      {analytics.browserData.length > 0 && (
        <Card className="p-3 border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Monitor className="h-3.5 w-3.5 text-chart-3" />
            <p className="text-[10px] font-semibold text-foreground">Browser</p>
          </div>
          <div className="space-y-1">
            {analytics.browserData.map((b, idx) => {
              const pct = analytics.totalViews > 0 ? Math.round((b.value / analytics.totalViews) * 100) : 0;
              return (
                <div key={b.name} className="flex items-center gap-2">
                  <span className="text-[9px] w-12 text-muted-foreground">{b.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Per-property Views */}
      {analytics.propData.length > 0 && (
        <Card className="p-3 border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] font-semibold text-foreground">Views per Properti</p>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(100, analytics.propData.length * 28)}>
            <BarChart data={analytics.propData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 8 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={80} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {analytics.totalViews === 0 && (
        <Card className="p-8 border-border text-center">
          <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Belum Ada Data Visitor</p>
          <p className="text-xs text-muted-foreground">Data akan muncul saat pengunjung melihat properti Anda.</p>
        </Card>
      )}
    </div>
  );
};

export default OwnerVisitorTracking;
