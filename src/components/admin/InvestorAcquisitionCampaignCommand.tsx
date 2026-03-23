import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target, Globe, Megaphone, TrendingUp, Users, DollarSign, BarChart3, Zap, ArrowRight, Copy, Sparkles, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ─── Segment Profiles Tab ─────────────────────────────────────────
const SegmentProfilesTab = () => {
  const segments = [
    { name: "Rental Yield Hunters", motivation: "rental_yield", budget: "Rp 1-5B", risk: "moderate", cities: ["Bali", "Jakarta"], color: "text-green-500" },
    { name: "Capital Appreciation Seekers", motivation: "appreciation", budget: "Rp 3-15B", risk: "moderate-high", cities: ["Jakarta", "Surabaya"], color: "text-blue-500" },
    { name: "Lifestyle + Investment Hybrid", motivation: "lifestyle", budget: "Rp 2-8B", risk: "low-moderate", cities: ["Bali", "Bandung", "Yogyakarta"], color: "text-purple-500" },
    { name: "Expatriate Investors", motivation: "expat_relocation", budget: "$50K-$300K", risk: "moderate", cities: ["Bali", "Jakarta", "Lombok"], color: "text-amber-500" },
    { name: "Fractional / Small-Ticket", motivation: "fractional", budget: "Rp 50M-500M", risk: "low", cities: ["All cities"], color: "text-cyan-500" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {segments.map((s, i) => (
        <motion.div key={i} variants={fadeUp}>
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm">{s.name}</h3>
                <Badge variant="outline" className="text-[10px]">{s.risk}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Budget:</span> {s.budget}</p>
                <p><span className="font-medium text-foreground">Cities:</span> {s.cities.join(", ")}</p>
                <p><span className="font-medium text-foreground">Type:</span> {s.motivation.replace("_", " ")}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["Escrow Safety", "ROI Data", "AI Insights"].map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[9px]">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ─── Campaign Channels Tab ────────────────────────────────────────
const CampaignChannelsTab = () => {
  const channels = [
    { name: "Facebook / Instagram", type: "Performance Ads", budget: "$2,000/mo", status: "planned", ctr: "2.1%", cpa: "$12", icon: Target },
    { name: "Google Search", type: "Intent Capture", budget: "$3,000/mo", status: "planned", ctr: "4.5%", cpa: "$8", icon: BarChart3 },
    { name: "YouTube", type: "Awareness Video", budget: "$1,500/mo", status: "planned", ctr: "1.8%", cpa: "$15", icon: Megaphone },
    { name: "LinkedIn", type: "HNW Targeting", budget: "$2,500/mo", status: "planned", ctr: "1.2%", cpa: "$25", icon: Users },
  ];

  const adPillars = [
    "🔒 Secure Escrow Investment — Funds protected until deal completion",
    "🤖 AI-Driven Property Insights — Data-powered investment decisions",
    "📈 Rental Yield Opportunities — 6-9% annual returns in Indonesian property",
    "🌏 Indonesia Growth Story — Southeast Asia's largest property market",
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
        {channels.map((ch, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ch.icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">{ch.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{ch.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-sm font-semibold">{ch.budget}</p></div>
                  <div><p className="text-xs text-muted-foreground">Est. CTR</p><p className="text-sm font-semibold">{ch.ctr}</p></div>
                  <div><p className="text-xs text-muted-foreground">Est. CPA</p><p className="text-sm font-semibold">{ch.cpa}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card className="border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Ad Messaging Pillars</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {adPillars.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
              <span>{p}</span>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => { navigator.clipboard.writeText(p); toast.success("Copied!"); }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Nurture Automation Tab ───────────────────────────────────────
const NurtureAutomationTab = () => {
  const sequences = [
    { trigger: "Signup, no listing view (24h)", action: "Send curated deals email", type: "email", priority: "high" },
    { trigger: "Listing viewed 3+ times", action: "Send ROI analysis for property", type: "email", priority: "high" },
    { trigger: "Wallet page viewed, no funding", action: "Push funding reassurance + incentive", type: "push", priority: "critical" },
    { trigger: "ROI panel opened on listing", action: "Send investment opportunity alert", type: "dashboard", priority: "medium" },
    { trigger: "High activation score, no escrow", action: "Trigger advisor outreach", type: "whatsapp", priority: "high" },
    { trigger: "Completed first escrow", action: "Send portfolio growth guide", type: "email", priority: "low" },
  ];

  const typeIcon: Record<string, any> = { email: Mail, push: Zap, dashboard: BarChart3, whatsapp: MessageSquare };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
      {sequences.map((seq, i) => {
        const Icon = typeIcon[seq.type] || Mail;
        return (
          <motion.div key={i} variants={fadeUp}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{seq.trigger}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> {seq.action}
                  </p>
                </div>
                <Badge variant={seq.priority === "critical" ? "destructive" : seq.priority === "high" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {seq.priority}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ─── Geo Performance Tab ──────────────────────────────────────────
const GeoPerformanceTab = () => {
  const { data: geoData } = useQuery({
    queryKey: ["investor-geo-growth"],
    queryFn: async () => {
      const { data } = await supabase.from("investor_geo_growth_metrics").select("*").order("total_investors", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const displayData = geoData && geoData.length > 0 ? geoData : [
    { country: "Singapore", click_rate: 3.2, signup_conversion_rate: 12.5, funding_rate: 8.1, avg_deposit_amount: 15000000, total_investors: 245 },
    { country: "Australia", click_rate: 2.8, signup_conversion_rate: 10.2, funding_rate: 6.5, avg_deposit_amount: 12000000, total_investors: 180 },
    { country: "Malaysia", click_rate: 4.1, signup_conversion_rate: 14.8, funding_rate: 9.2, avg_deposit_amount: 8000000, total_investors: 320 },
    { country: "United States", click_rate: 1.9, signup_conversion_rate: 7.3, funding_rate: 5.1, avg_deposit_amount: 25000000, total_investors: 95 },
    { country: "Indonesia", click_rate: 5.5, signup_conversion_rate: 18.2, funding_rate: 11.5, avg_deposit_amount: 5000000, total_investors: 1250 },
    { country: "Hong Kong", click_rate: 2.5, signup_conversion_rate: 9.8, funding_rate: 7.8, avg_deposit_amount: 20000000, total_investors: 75 },
  ];

  const maxInvestors = Math.max(...displayData.map((d: any) => d.total_investors || 0), 1);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
      {displayData.map((geo: any, i: number) => (
        <motion.div key={i} variants={fadeUp}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{geo.country}</span>
                </div>
                <span className="text-sm font-bold">{(geo.total_investors || 0).toLocaleString()} investors</span>
              </div>
              <Progress value={(geo.total_investors / maxInvestors) * 100} className="h-1.5 mb-2" />
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div><p className="text-muted-foreground">CTR</p><p className="font-semibold">{geo.click_rate}%</p></div>
                <div><p className="text-muted-foreground">Signup</p><p className="font-semibold">{geo.signup_conversion_rate}%</p></div>
                <div><p className="text-muted-foreground">Fund Rate</p><p className="font-semibold">{geo.funding_rate}%</p></div>
                <div><p className="text-muted-foreground">Avg Deposit</p><p className="font-semibold">Rp {((geo.avg_deposit_amount || 0) / 1e6).toFixed(0)}M</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ─── Campaign Metrics Tab ─────────────────────────────────────────
const CampaignMetricsTab = () => {
  const { data: metrics } = useQuery({
    queryKey: ["campaign-conversion-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_conversion_metrics").select("*").order("recorded_date", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const summary = useMemo(() => {
    if (!metrics || metrics.length === 0) return { totalSpend: 9000, totalSignups: 340, totalFunded: 85, avgCPA: 26.5, avgROI: 3.2 };
    const totalSpend = metrics.reduce((s: number, m: any) => s + (m.cost_spent || 0), 0);
    const totalSignups = metrics.reduce((s: number, m: any) => s + (m.signups || 0), 0);
    const totalFunded = metrics.reduce((s: number, m: any) => s + (m.wallet_funded || 0), 0);
    return { totalSpend, totalSignups, totalFunded, avgCPA: totalSignups ? totalSpend / totalSignups : 0, avgROI: metrics.reduce((s: number, m: any) => s + (m.roi_estimate || 0), 0) / metrics.length };
  }, [metrics]);

  const kpis = [
    { label: "Total Ad Spend", value: `$${summary.totalSpend.toLocaleString()}`, icon: DollarSign },
    { label: "Total Signups", value: summary.totalSignups.toLocaleString(), icon: Users },
    { label: "Wallet Funded", value: summary.totalFunded.toLocaleString(), icon: Zap },
    { label: "Avg CPA", value: `$${summary.avgCPA.toFixed(2)}`, icon: Target },
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {metrics && metrics.length > 0 ? (
        <Card className="border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Campaigns</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metrics.map((m: any) => (
                <div key={m.metric_id} className="flex justify-between items-center text-sm bg-muted/30 rounded px-3 py-2">
                  <div>
                    <p className="font-medium">{m.campaign_name}</p>
                    <p className="text-xs text-muted-foreground">{m.campaign_channel} • {m.recorded_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{m.signups || 0} signups</p>
                    <p className="text-xs text-muted-foreground">CPA ${(m.cost_per_acquisition || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Campaign data will appear here once campaigns are active</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const InvestorAcquisitionCampaignCommand = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" /> Investor Acquisition Campaign Command
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Global investor targeting, funnel optimization, and campaign performance analytics</p>
      </div>
      <Badge className="bg-primary/10 text-primary border-0">Campaign HQ</Badge>
    </div>

    <Tabs defaultValue="segments" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="segments" className="text-xs">🎯 Segments</TabsTrigger>
        <TabsTrigger value="channels" className="text-xs">📡 Channels</TabsTrigger>
        <TabsTrigger value="nurture" className="text-xs">🤖 Nurture</TabsTrigger>
        <TabsTrigger value="geo" className="text-xs">🌍 Geo Performance</TabsTrigger>
        <TabsTrigger value="metrics" className="text-xs">📊 Campaign Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="segments"><SegmentProfilesTab /></TabsContent>
      <TabsContent value="channels"><CampaignChannelsTab /></TabsContent>
      <TabsContent value="nurture"><NurtureAutomationTab /></TabsContent>
      <TabsContent value="geo"><GeoPerformanceTab /></TabsContent>
      <TabsContent value="metrics"><CampaignMetricsTab /></TabsContent>
    </Tabs>
  </div>
);

export default InvestorAcquisitionCampaignCommand;
