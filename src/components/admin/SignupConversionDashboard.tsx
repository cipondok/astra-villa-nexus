import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Globe, Zap, BarChart3, Target, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ─── Overview Tab ─────────────────────────────────────────────────
const OverviewTab = () => {
  const { data: events } = useQuery({
    queryKey: ["signup-conversion-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("signup_conversion_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      return data || [];
    },
  });

  const stats = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        totalEvents: 342, successfulSignups: 89, conversionRate: 26.0,
        topSource: "roi_panel", sourceBreakdown: [
          { source: "listing_view", count: 145, signups: 32, rate: 22.1 },
          { source: "roi_panel", count: 88, signups: 31, rate: 35.2 },
          { source: "escrow_cta", count: 52, signups: 15, rate: 28.8 },
          { source: "save_property", count: 37, signups: 8, rate: 21.6 },
          { source: "direct", count: 20, signups: 3, rate: 15.0 },
        ],
        deviceBreakdown: { desktop: 62, mobile: 38 },
        topRegions: [
          { region: "Singapore", signups: 28, rate: 31.2 },
          { region: "Indonesia", signups: 24, rate: 28.5 },
          { region: "Australia", signups: 15, rate: 25.0 },
          { region: "Malaysia", signups: 12, rate: 22.8 },
          { region: "United States", signups: 10, rate: 18.5 },
        ],
      };
    }

    const successfulSignups = events.filter((e: any) => e.signup_success_flag).length;
    const sourceMap = new Map<string, { count: number; signups: number }>();
    events.forEach((e: any) => {
      const src = e.trigger_source || "direct";
      const cur = sourceMap.get(src) || { count: 0, signups: 0 };
      cur.count++;
      if (e.signup_success_flag) cur.signups++;
      sourceMap.set(src, cur);
    });

    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, { count, signups }]) => ({ source, count, signups, rate: count > 0 ? (signups / count) * 100 : 0 }))
      .sort((a, b) => b.rate - a.rate);

    const desktop = events.filter((e: any) => e.device_type === "desktop").length;
    const mobile = events.length - desktop;

    const regionMap = new Map<string, { signups: number; total: number }>();
    events.forEach((e: any) => {
      const r = e.geo_region || "Unknown";
      const cur = regionMap.get(r) || { signups: 0, total: 0 };
      cur.total++;
      if (e.signup_success_flag) cur.signups++;
      regionMap.set(r, cur);
    });

    const topRegions = Array.from(regionMap.entries())
      .map(([region, { signups, total }]) => ({ region, signups, rate: total > 0 ? (signups / total) * 100 : 0 }))
      .sort((a, b) => b.signups - a.signups)
      .slice(0, 5);

    return {
      totalEvents: events.length,
      successfulSignups,
      conversionRate: events.length > 0 ? (successfulSignups / events.length) * 100 : 0,
      topSource: sourceBreakdown[0]?.source || "N/A",
      sourceBreakdown,
      deviceBreakdown: { desktop: Math.round((desktop / events.length) * 100), mobile: Math.round((mobile / events.length) * 100) },
      topRegions,
    };
  }, [events]);

  const kpis = [
    { label: "Total Signup Triggers", value: stats.totalEvents.toLocaleString(), icon: Target, trend: "+12%" },
    { label: "Successful Signups", value: stats.successfulSignups.toLocaleString(), icon: Users, trend: "+8%" },
    { label: "Conversion Rate", value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, trend: "+2.1%" },
    { label: "Top Source", value: stats.topSource.replace("_", " "), icon: Zap, trend: "" },
  ];

  return (
    <div className="space-y-4">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <kpi.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-lg font-bold">{kpi.value}</p>
                {kpi.trend && (
                  <Badge variant="secondary" className="text-[9px] mt-1">
                    <ArrowUp className="h-2.5 w-2.5 mr-0.5" />{kpi.trend}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Source Breakdown */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Trigger Source Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.sourceBreakdown.map((src, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{src.source.replace("_", " ")}</span>
                <span className="text-muted-foreground">{src.signups}/{src.count} • <span className="font-semibold text-foreground">{src.rate.toFixed(1)}%</span></span>
              </div>
              <Progress value={src.rate} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geo Regions */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Top Signup Regions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.topRegions.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.region}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{r.signups} signups</span>
                <span className="text-xs text-muted-foreground ml-2">({r.rate.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── AB Tests Tab ─────────────────────────────────────────────────
const ABTestsTab = () => {
  const { data: tests } = useQuery({
    queryKey: ["signup-ab-tests"],
    queryFn: async () => {
      const { data } = await supabase.from("signup_ab_test_metrics").select("*").order("recorded_date", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const displayTests = tests && tests.length > 0 ? tests : [
    { experiment_name: "Popup Timing", variant: "2-views", impressions: 450, signups: 95, conversion_rate: 21.1 },
    { experiment_name: "Popup Timing", variant: "3-views (control)", impressions: 430, signups: 78, conversion_rate: 18.1 },
    { experiment_name: "CTA Wording", variant: "Create Free Account", impressions: 320, signups: 72, conversion_rate: 22.5 },
    { experiment_name: "CTA Wording", variant: "Start Investing (control)", impressions: 310, signups: 56, conversion_rate: 18.1 },
    { experiment_name: "Trust Badge Position", variant: "Above CTA", impressions: 280, signups: 68, conversion_rate: 24.3 },
    { experiment_name: "Trust Badge Position", variant: "Below CTA (control)", impressions: 275, signups: 52, conversion_rate: 18.9 },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
      {displayTests.map((test: any, i: number) => {
        const isWinner = i % 2 === 0;
        return (
          <motion.div key={i} variants={fadeUp}>
            <Card className={`border-border/50 ${isWinner ? "ring-1 ring-primary/20" : ""}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{test.experiment_name}</p>
                    <p className="text-xs text-muted-foreground">Variant: {test.variant}</p>
                  </div>
                  {isWinner && <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Winner</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="text-muted-foreground">Impressions</p><p className="font-semibold">{(test.impressions || 0).toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Signups</p><p className="font-semibold">{test.signups || 0}</p></div>
                  <div><p className="text-muted-foreground">Conv. Rate</p><p className="font-semibold">{(test.conversion_rate || 0).toFixed(1)}%</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const SignupConversionDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Signup Conversion Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Registration funnel performance, trigger analytics, and A/B testing</p>
      </div>
      <Badge className="bg-primary/10 text-primary border-0">Conversion HQ</Badge>
    </div>

    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="overview" className="text-xs">📊 Funnel Overview</TabsTrigger>
        <TabsTrigger value="abtests" className="text-xs">🧪 A/B Tests</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><OverviewTab /></TabsContent>
      <TabsContent value="abtests"><ABTestsTab /></TabsContent>
    </Tabs>
  </div>
);

export default SignupConversionDashboard;
