import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target, TrendingUp, Users, Eye, Megaphone, FileText, Youtube, Linkedin,
  Search, Bell, BarChart3, Shield, Heart, Trophy, ArrowRight, ChevronRight,
  Zap, Crown, Star, Gift, Mail, Layers, Globe, LineChart, Lock, Sparkles,
  BookOpen, Download, CheckCircle2, Circle, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Live Metrics Hook ──

function useInvestorFunnelMetrics() {
  return useQuery({
    queryKey: ['investor-funnel-metrics'],
    queryFn: async () => {
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
      const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();

      const [
        signupsRes,
        prevSignupsRes,
        activeSubsRes,
        offersRes,
        referralsRes,
        analyticsRes,
        churnedRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('property_offers').select('id, status', { count: 'exact' }).gte('created_at', d30),
        supabase.from('acquisition_referrals').select('id, status', { count: 'exact' }).gte('created_at', d30),
        supabase.from('acquisition_analytics').select('channel, impressions, clicks, signups, conversions, spend, revenue').gte('date', d30.split('T')[0]),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled').gte('updated_at', d30),
      ]);

      const signups30 = signupsRes.count ?? 0;
      const signupsPrev = prevSignupsRes.count ?? 0;
      const activeSubs = activeSubsRes.count ?? 0;
      const offers = offersRes.data ?? [];
      const totalOffers = offersRes.count ?? 0;
      const acceptedOffers = offers.filter(o => o.status === 'accepted' || o.status === 'completed').length;
      const referrals = referralsRes.count ?? 0;
      const churned = churnedRes.count ?? 0;

      // Channel analytics
      const analytics = analyticsRes.data ?? [];
      const totalImpressions = analytics.reduce((s, a) => s + (a.impressions ?? 0), 0);
      const totalClicks = analytics.reduce((s, a) => s + (a.clicks ?? 0), 0);
      const totalSpend = analytics.reduce((s, a) => s + (a.spend ?? 0), 0);
      const totalConversions = analytics.reduce((s, a) => s + (a.conversions ?? 0), 0);
      const totalRevenue = analytics.reduce((s, a) => s + (a.revenue ?? 0), 0);

      // Channel breakdown
      const channelMap = new Map<string, { impressions: number; clicks: number; signups: number; spend: number; conversions: number }>();
      for (const a of analytics) {
        const ch = a.channel || 'direct';
        const existing = channelMap.get(ch) ?? { impressions: 0, clicks: 0, signups: 0, spend: 0, conversions: 0 };
        channelMap.set(ch, {
          impressions: existing.impressions + (a.impressions ?? 0),
          clicks: existing.clicks + (a.clicks ?? 0),
          signups: existing.signups + (a.signups ?? 0),
          spend: existing.spend + (a.spend ?? 0),
          conversions: existing.conversions + (a.conversions ?? 0),
        });
      }
      const channels = Array.from(channelMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
        cpa: data.conversions > 0 ? Math.round(data.spend / data.conversions) : 0,
      })).sort((a, b) => b.conversions - a.conversions);

      const cpa = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;
      const signupGrowth = signupsPrev > 0 ? Math.round(((signups30 - signupsPrev) / signupsPrev) * 100) : signups30 > 0 ? 100 : 0;
      const dealParticipationRate = signups30 > 0 ? Math.round((totalOffers / signups30) * 100) : 0;
      const subConversionRate = signups30 > 0 ? Math.round((activeSubs / Math.max(signups30, activeSubs)) * 100) : 0;
      const churnRate = activeSubs > 0 ? Math.round((churned / (activeSubs + churned)) * 100) : 0;

      // Estimated LTV (avg sub price × avg retention months)
      const avgSubPrice = 500_000;
      const avgRetentionMonths = churnRate > 0 ? Math.min(24, Math.round(100 / churnRate)) : 16;
      const ltv = avgSubPrice * avgRetentionMonths;
      const ltvCacRatio = cpa > 0 ? Math.round((ltv / cpa) * 10) / 10 : 0;

      return {
        signups30, signupsPrev, signupGrowth,
        activeSubs, churned, churnRate,
        totalOffers, acceptedOffers, dealParticipationRate,
        referrals,
        totalImpressions, totalClicks, totalSpend, totalConversions, totalRevenue,
        cpa, subConversionRate, ltv, ltvCacRatio, avgRetentionMonths,
        channels,
      };
    },
    staleTime: 60_000,
  });
}

// ── Funnel Stage Config ──

interface FunnelStage {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  targetMetric: string;
  targetValue: string;
  channels: { name: string; icon: React.ElementType; tactic: string; kpi: string }[];
}

const funnelStages: FunnelStage[] = [
  {
    key: "awareness", label: "1 — Awareness", icon: Eye,
    color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    targetMetric: "Monthly Impressions", targetValue: "500K+",
    channels: [
      { name: "SEO Investment Articles", icon: Search, tactic: "Publish 20+ Indonesian property investment trend articles targeting long-tail keywords", kpi: "50K organic visits/mo by Day 90" },
      { name: "YouTube Educational Series", icon: Youtube, tactic: "Weekly 8-12 min videos: AI Property Analysis, Hidden Gems, Investment Mistakes", kpi: "10K subscribers, 100K views/mo" },
      { name: "LinkedIn Thought Leadership", icon: Linkedin, tactic: "Daily posts on property market data, AI insights, investment case studies", kpi: "5K followers, 2% engagement" },
      { name: "Google Ads — Search Intent", icon: Globe, tactic: "Bid on 'beli properti investasi', 'properti ROI tinggi' — AI valuation preview landing", kpi: "CPC < Rp 3K, CTR > 4%" },
    ],
  },
  {
    key: "lead_capture", label: "2 — Lead Capture", icon: Target,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    targetMetric: "Monthly Leads", targetValue: "2,000+",
    channels: [
      { name: "Investment Market Report", icon: Download, tactic: "Quarterly downloadable PDF gated behind email + phone capture form", kpi: "15% landing page CVR" },
      { name: "AI Opportunity Alerts", icon: Bell, tactic: "Free alert signup with 5-email drip sequence nurturing", kpi: "25% open rate, 8% click rate" },
      { name: "ROI Calculator Tool", icon: LineChart, tactic: "Interactive tool: input budget → AI projects 5-year returns", kpi: "40% completion → 20% capture" },
      { name: "WhatsApp Community", icon: Users, tactic: "Exclusive investor group with weekly market updates and deal alerts", kpi: "500 active members by Day 60" },
    ],
  },
  {
    key: "conversion", label: "3 — Conversion", icon: Zap,
    color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    targetMetric: "Monthly Conversions", targetValue: "200+",
    channels: [
      { name: "Freemium Dashboard", icon: BarChart3, tactic: "Show 3 AI-scored properties with blurred premium insights — upgrade CTA", kpi: "30% free-to-trial" },
      { name: "Premium Insights Teaser", icon: Lock, tactic: "Partial AI analysis with 'Unlock Full Report' gate", kpi: "15% teaser-to-premium" },
      { name: "1-on-1 Consultation", icon: Users, tactic: "Free 15-min AI-powered portfolio review for high-score leads", kpi: "40% booking rate" },
      { name: "Early Investor Offer", icon: Gift, tactic: "First 100 subscribers: 3 months at 50% off + exclusive pre-launch deals", kpi: "60% offer acceptance" },
    ],
  },
  {
    key: "trust_building", label: "4 — Trust Building", icon: Shield,
    color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    targetMetric: "Trust Score", targetValue: "85/100",
    channels: [
      { name: "Market Pulse Reports", icon: BarChart3, tactic: "Weekly reports with real transaction data, price trends, AI predictions", kpi: "30% report share rate" },
      { name: "Success Case Studies", icon: Trophy, tactic: "Monthly investor success stories in video + blog format", kpi: "5 published cases by Day 60" },
      { name: "AI Methodology Page", icon: BookOpen, tactic: "Published scoring methodology with accuracy metrics", kpi: "2 min avg time on page" },
      { name: "Social Proof Feed", icon: Star, tactic: "Real-time investor activity, aggregate portfolio performance", kpi: "500+ verified reviews" },
    ],
  },
  {
    key: "retention", label: "5 — Retention Loop", icon: Heart,
    color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30",
    targetMetric: "Monthly Retention", targetValue: "75%+",
    channels: [
      { name: "Smart Notifications", icon: Bell, tactic: "AI-triggered alerts when properties match investor criteria", kpi: "35% notification open rate" },
      { name: "Portfolio Tracking", icon: LineChart, tactic: "Monthly value updates, yield tracking, market comparison", kpi: "60% monthly active users" },
      { name: "Loyalty Tiers", icon: Crown, tactic: "Silver → Gold → Platinum → Diamond: AI credits, early access, priority support", kpi: "40% tier upgrade in 6 months" },
      { name: "Quarterly Review", icon: FileText, tactic: "AI-generated performance report with next-quarter recommendations", kpi: "80% report open rate" },
    ],
  },
];

// ── Weekly Execution Plan ──

interface WeekPlan {
  week: number;
  phase: string;
  phaseColor: string;
  focus: string;
  tasks: { task: string; owner: string; priority: "critical" | "high" | "medium" }[];
  kpis: string[];
}

const weeklyPlan: WeekPlan[] = [
  {
    week: 1, phase: "Phase 1", phaseColor: "text-chart-4", focus: "Foundation Setup",
    tasks: [
      { task: "Set up investor landing page with ROI calculator", owner: "Product", priority: "critical" },
      { task: "Create first 5 SEO investment articles", owner: "Content", priority: "critical" },
      { task: "Design downloadable market report template", owner: "Design", priority: "high" },
      { task: "Configure email drip sequence (5 emails)", owner: "Marketing", priority: "high" },
    ],
    kpis: ["Landing page live", "Email automation active"],
  },
  {
    week: 2, phase: "Phase 1", phaseColor: "text-chart-4", focus: "Content Engine Launch",
    tasks: [
      { task: "Publish first YouTube video + channel setup", owner: "Content", priority: "critical" },
      { task: "Start LinkedIn daily posting cadence", owner: "Marketing", priority: "high" },
      { task: "Launch Google Ads campaigns (3 ad groups)", owner: "Performance", priority: "critical" },
      { task: "Set up WhatsApp investor community group", owner: "Community", priority: "medium" },
    ],
    kpis: ["First 100 leads captured", "5K website visits"],
  },
  {
    week: 3, phase: "Phase 1", phaseColor: "text-chart-4", focus: "Lead Magnet Activation",
    tasks: [
      { task: "Publish Q2 2026 Investment Market Report", owner: "Research", priority: "critical" },
      { task: "Launch AI Opportunity Alerts signup flow", owner: "Product", priority: "critical" },
      { task: "Publish 5 more SEO articles (10 total)", owner: "Content", priority: "high" },
      { task: "First investor case study video production", owner: "Content", priority: "medium" },
    ],
    kpis: ["500 report downloads", "300 alert subscribers"],
  },
  {
    week: 4, phase: "Phase 1", phaseColor: "text-chart-4", focus: "Conversion Testing",
    tasks: [
      { task: "Launch freemium investor dashboard", owner: "Product", priority: "critical" },
      { task: "Deploy premium insights teaser on property pages", owner: "Product", priority: "high" },
      { task: "A/B test landing page variants (3 versions)", owner: "Growth", priority: "high" },
      { task: "Publish AI methodology transparency page", owner: "Product", priority: "medium" },
    ],
    kpis: ["50 premium trial signups", "15% landing page CVR"],
  },
  {
    week: 5, phase: "Phase 2", phaseColor: "text-primary", focus: "Scale Awareness",
    tasks: [
      { task: "Double Google Ads budget on winning campaigns", owner: "Performance", priority: "critical" },
      { task: "Launch Instagram Reels strategy (3/week)", owner: "Content", priority: "high" },
      { task: "Partner with 2 property investment influencers", owner: "Partnerships", priority: "high" },
      { task: "Publish articles 11-15 targeting new keywords", owner: "Content", priority: "medium" },
    ],
    kpis: ["2,000 total leads", "50K monthly visits"],
  },
  {
    week: 6, phase: "Phase 2", phaseColor: "text-primary", focus: "Conversion Optimization",
    tasks: [
      { task: "Launch 1-on-1 consultation for high-score leads", owner: "Sales", priority: "critical" },
      { task: "Deploy early investor offer (100 slots at 50% off)", owner: "Growth", priority: "critical" },
      { task: "Publish 2nd investor success case study", owner: "Content", priority: "high" },
      { task: "Optimize email drip based on open/click data", owner: "Marketing", priority: "medium" },
    ],
    kpis: ["100 premium subscribers", "40% consultation booking rate"],
  },
  {
    week: 7, phase: "Phase 2", phaseColor: "text-primary", focus: "Trust Acceleration",
    tasks: [
      { task: "Launch weekly Market Pulse report series", owner: "Research", priority: "critical" },
      { task: "Deploy social proof elements (activity feed, stats)", owner: "Product", priority: "high" },
      { task: "3rd YouTube video + community engagement push", owner: "Content", priority: "high" },
      { task: "Collect and publish first 50 investor reviews", owner: "Community", priority: "medium" },
    ],
    kpis: ["Trust score 70/100", "30% report share rate"],
  },
  {
    week: 8, phase: "Phase 2", phaseColor: "text-primary", focus: "Retention Foundation",
    tasks: [
      { task: "Launch smart notification system for investors", owner: "Product", priority: "critical" },
      { task: "Deploy portfolio performance tracking MVP", owner: "Product", priority: "critical" },
      { task: "Design loyalty tier structure and benefits", owner: "Growth", priority: "high" },
      { task: "First quarterly investment review for early users", owner: "Research", priority: "medium" },
    ],
    kpis: ["60% DAU/MAU ratio", "35% notification open rate"],
  },
  {
    week: 9, phase: "Phase 3", phaseColor: "text-chart-1", focus: "Full Funnel Optimization",
    tasks: [
      { task: "Analyze full funnel — identify biggest drop-off", owner: "Growth", priority: "critical" },
      { task: "Launch retargeting campaigns for abandoned signups", owner: "Performance", priority: "high" },
      { task: "Articles 16-20 (complete initial SEO library)", owner: "Content", priority: "high" },
      { task: "Launch investor loyalty tier system", owner: "Product", priority: "high" },
    ],
    kpis: ["200 premium subscribers", "75% retention rate"],
  },
  {
    week: 10, phase: "Phase 3", phaseColor: "text-chart-1", focus: "Scale Premium",
    tasks: [
      { task: "Launch Enterprise tier for institutional investors", owner: "Product", priority: "critical" },
      { task: "Deploy automated portfolio rebalancing suggestions", owner: "AI", priority: "high" },
      { task: "Partner with 2 banks for co-branded content", owner: "Partnerships", priority: "high" },
      { task: "5th investor case study + video testimonial", owner: "Content", priority: "medium" },
    ],
    kpis: ["20 Enterprise signups", "Rp 500M tracked portfolio value"],
  },
  {
    week: 11, phase: "Phase 3", phaseColor: "text-chart-1", focus: "Referral Loop",
    tasks: [
      { task: "Launch referral program (refer → 1 month free)", owner: "Growth", priority: "critical" },
      { task: "Deploy viral sharing for AI property scores", owner: "Product", priority: "high" },
      { task: "Host first virtual investor meetup event", owner: "Community", priority: "high" },
      { task: "Publish State of Indonesia Property Investment report", owner: "Research", priority: "medium" },
    ],
    kpis: ["50 referral signups", "500 event registrations"],
  },
  {
    week: 12, phase: "Phase 3", phaseColor: "text-chart-1", focus: "Monetization Validation",
    tasks: [
      { task: "Analyze premium revenue vs CAC — validate unit economics", owner: "Finance", priority: "critical" },
      { task: "Test premium pricing tiers (+20% vs +40%)", owner: "Growth", priority: "critical" },
      { task: "Launch AI-powered investment newsletter", owner: "Content", priority: "high" },
      { task: "Plan Q3 expansion based on Q2 learnings", owner: "Strategy", priority: "high" },
    ],
    kpis: ["Positive unit economics", "LTV:CAC > 3:1"],
  },
  {
    week: 13, phase: "Phase 3", phaseColor: "text-chart-1", focus: "90-Day Review & Scale Plan",
    tasks: [
      { task: "Full funnel audit — document conversion rates", owner: "Growth", priority: "critical" },
      { task: "Compile investor growth report for stakeholders", owner: "Strategy", priority: "critical" },
      { task: "Set Q3 targets: 1,000 premium, Rp 2T tracked", owner: "Strategy", priority: "high" },
      { task: "Identify top 3 scaling levers for next quarter", owner: "Growth", priority: "high" },
    ],
    kpis: ["300+ premium investors", "75% retention", "LTV:CAC > 3:1"],
  },
];

// ── Funnel Stage Card ──

function FunnelStageCard({ stage }: { stage: FunnelStage }) {
  const Icon = stage.icon;
  return (
    <Card className={cn("rounded-2xl border-border/30 bg-card/80 overflow-hidden")}>
      <div className={cn("h-1", stage.bg.replace("/10", "/30"))} />
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stage.bg)}>
              <Icon className={cn("h-3.5 w-3.5", stage.color)} />
            </div>
            {stage.label}
          </CardTitle>
          <Badge variant="outline" className={cn("text-[9px] h-5 px-2 font-bold", stage.color, stage.bg, stage.border)}>
            {stage.targetMetric}: {stage.targetValue}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {stage.channels.map((ch, i) => {
          const ChIcon = ch.icon;
          return (
            <div key={i} className="p-2.5 rounded-xl border border-border/20 bg-muted/5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ChIcon className={cn("h-3 w-3 shrink-0", stage.color)} />
                <span className="text-[10px] font-semibold text-foreground">{ch.name}</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{ch.tactic}</p>
              <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-muted-foreground">
                KPI: {ch.kpi}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Weekly Plan Section ──

const priorityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  high: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30" },
  medium: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" },
};

function WeeklyPlanSection() {
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedPhase === "all") return weeklyPlan;
    return weeklyPlan.filter((w) => w.phase === selectedPhase);
  }, [selectedPhase]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "all", label: "All Weeks (13)" },
          { key: "Phase 1", label: "Phase 1 — Foundation (W1-4)" },
          { key: "Phase 2", label: "Phase 2 — Scale (W5-8)" },
          { key: "Phase 3", label: "Phase 3 — Optimize (W9-13)" },
        ].map(({ key, label }) => (
          <Badge
            key={key}
            variant="outline"
            className={cn("text-[9px] h-5 px-2 cursor-pointer transition-all",
              selectedPhase === key ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
            onClick={() => setSelectedPhase(key)}
          >
            {label}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((week) => (
          <Card key={week.week} className="rounded-xl border-border/30 bg-card/80">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] h-5 px-2 font-bold text-foreground bg-muted/20">
                    Week {week.week}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", week.phaseColor,
                    week.phaseColor === "text-chart-4" ? "bg-chart-4/10 border-chart-4/30" :
                    week.phaseColor === "text-primary" ? "bg-primary/10 border-primary/30" :
                    "bg-chart-1/10 border-chart-1/30")}>
                    {week.phase}
                  </Badge>
                  <span className="text-[10px] font-semibold text-foreground">{week.focus}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2">
                {week.tasks.map((task, i) => {
                  const pc = priorityConfig[task.priority];
                  return (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-border/20 bg-muted/5">
                      <Circle className={cn("h-2.5 w-2.5 shrink-0 mt-1", pc.color)} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-foreground">{task.task}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{task.owner}</Badge>
                          <Badge variant="outline" className={cn("text-[6px] h-3 px-1", pc.color, pc.bg, pc.border)}>{task.priority}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[8px] text-muted-foreground uppercase tracking-wide">KPIs:</span>
                {week.kpis.map((kpi, i) => (
                  <Badge key={i} variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-1 bg-chart-1/5 border-chart-1/20">
                    {kpi}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Funnel Visualization ──

function FunnelVisualization() {
  const stages = [
    { label: "Awareness", value: "500K impressions", width: "100%", color: "bg-chart-4/30" },
    { label: "Lead Capture", value: "2,000 leads", width: "60%", color: "bg-primary/30" },
    { label: "Conversion", value: "200 premium", width: "30%", color: "bg-chart-1/30" },
    { label: "Trust", value: "85/100 score", width: "50%", color: "bg-chart-3/30" },
    { label: "Retention", value: "75% retained", width: "40%", color: "bg-destructive/20" },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Funnel Overview — 90-Day Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-2">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground w-20 text-right shrink-0">{s.label}</span>
            <div className="flex-1 h-6 rounded-lg overflow-hidden bg-muted/10 relative" style={{ width: s.width }}>
              <div className={cn("h-full rounded-lg flex items-center px-2", s.color)}>
                <span className="text-[9px] font-bold text-foreground">{s.value}</span>
              </div>
            </div>
            {i < stages.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Unit Economics ──

function UnitEconomicsCard() {
  const metrics = [
    { label: "Target CAC", value: "Rp 150K", sub: "Cost per premium investor acquisition" },
    { label: "Target LTV", value: "Rp 1.8M", sub: "24-month lifetime value per investor" },
    { label: "LTV:CAC Ratio", value: "12:1", sub: "Target ratio for sustainable growth" },
    { label: "Payback Period", value: "< 45 days", sub: "Time to recoup acquisition cost" },
    { label: "Monthly Churn", value: "< 5%", sub: "Premium subscriber monthly churn target" },
    { label: "Referral Rate", value: "15%", sub: "% of investors who refer at least 1 user" },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-chart-1" />
          Unit Economics — Target Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="p-2.5 rounded-xl border border-border/20 bg-muted/5">
              <span className="text-[8px] text-muted-foreground block">{m.label}</span>
              <span className="text-sm font-bold text-foreground">{m.value}</span>
              <span className="text-[8px] text-muted-foreground block mt-0.5">{m.sub}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Live Performance Tab ──

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '11px',
  },
  labelStyle: { color: 'hsl(var(--popover-foreground))' },
};

const fmtIDR = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(0)}K`;
  return `Rp ${v}`;
};

const CHANNEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-1))',
];

function LivePerformanceTab() {
  const { data: m, isLoading } = useInvestorFunnelMetrics();

  if (isLoading || !m) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Signups (30d)", value: m.signups30.toLocaleString(),
      sub: `vs ${m.signupsPrev} prev`,
      trend: m.signupGrowth, icon: Users,
    },
    {
      label: "Active Subscribers", value: m.activeSubs.toLocaleString(),
      sub: `${m.subConversionRate}% conversion`,
      trend: m.subConversionRate, icon: Crown,
    },
    {
      label: "Deal Participation", value: `${m.totalOffers}`,
      sub: `${m.acceptedOffers} accepted · ${m.dealParticipationRate}% rate`,
      trend: m.dealParticipationRate, icon: Target,
    },
    {
      label: "Referrals", value: m.referrals.toLocaleString(),
      sub: "30-day referral signups",
      trend: m.referrals > 0 ? 100 : 0, icon: Gift,
    },
    {
      label: "CPA", value: fmtIDR(m.cpa),
      sub: `From ${m.totalConversions} conversions`,
      trend: m.cpa > 0 ? -1 : 0, icon: DollarSign,
    },
    {
      label: "LTV", value: fmtIDR(m.ltv),
      sub: `${m.avgRetentionMonths}mo avg retention`,
      trend: m.ltv > 0 ? 1 : 0, icon: TrendingUp,
    },
    {
      label: "LTV:CAC", value: m.ltvCacRatio > 0 ? `${m.ltvCacRatio}x` : '—',
      sub: m.ltvCacRatio >= 3 ? 'Healthy' : 'Below target',
      trend: m.ltvCacRatio >= 3 ? 1 : -1, icon: BarChart3,
    },
    {
      label: "Churn Rate", value: `${m.churnRate}%`,
      sub: `${m.churned} cancelled / 30d`,
      trend: m.churnRate <= 5 ? 1 : -1, icon: AlertTriangle,
    },
  ];

  // Channel pie data
  const channelPie = m.channels.slice(0, 6).map((ch, i) => ({
    name: ch.name,
    value: ch.conversions,
    color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
  }));

  // Channel bar data
  const channelBar = m.channels.slice(0, 6).map(ch => ({
    name: ch.name.length > 10 ? ch.name.substring(0, 10) + '…' : ch.name,
    CPA: ch.cpa,
    Conversions: ch.conversions,
  }));

  return (
    <div className="space-y-3">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="rounded-xl border-border/30 bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {kpi.trend > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-chart-1" />
                  ) : kpi.trend < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  ) : null}
                </div>
                <p className="text-lg font-black tabular-nums text-foreground">{kpi.value}</p>
                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                <p className="text-[8px] text-muted-foreground/70 mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Funnel Flow */}
      <Card className="rounded-2xl border-border/30 bg-card/80">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live Conversion Funnel — 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-2">
          {[
            { label: "Impressions", value: m.totalImpressions, pct: 100, color: "bg-chart-4/30" },
            { label: "Clicks", value: m.totalClicks, pct: m.totalImpressions > 0 ? (m.totalClicks / m.totalImpressions * 100) : 0, color: "bg-primary/30" },
            { label: "Signups", value: m.signups30, pct: m.totalClicks > 0 ? (m.signups30 / m.totalClicks * 100) : 0, color: "bg-chart-2/30" },
            { label: "Subscribers", value: m.activeSubs, pct: m.signups30 > 0 ? (m.activeSubs / m.signups30 * 100) : 0, color: "bg-chart-1/30" },
            { label: "Deal Offers", value: m.totalOffers, pct: m.activeSubs > 0 ? (m.totalOffers / m.activeSubs * 100) : 0, color: "bg-chart-3/30" },
          ].map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[9px] text-muted-foreground w-20 text-right shrink-0">{stage.label}</span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden bg-muted/10 relative">
                <div className={cn("h-full rounded-lg flex items-center justify-between px-2", stage.color)}
                  style={{ width: `${Math.max(8, Math.min(100, i === 0 ? 100 : stage.pct * 3))}%` }}>
                  <span className="text-[9px] font-bold text-foreground tabular-nums">{stage.value.toLocaleString()}</span>
                  {i > 0 && <span className="text-[8px] text-muted-foreground">{stage.pct.toFixed(1)}%</span>}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border/30 bg-card/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold">Channel Conversion Mix</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {channelPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={channelPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {channelPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {channelPie.map(ch => (
                    <div key={ch.name} className="flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ background: ch.color }} />
                        <span className="text-muted-foreground">{ch.name}</span>
                      </div>
                      <span className="font-bold tabular-nums text-foreground">{ch.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No channel data yet — launch campaigns to see performance</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/30 bg-card/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold">Channel CPA vs Conversions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {channelBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={channelBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar yAxisId="left" dataKey="Conversions" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="CPA" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No channel data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spend Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total Spend", value: fmtIDR(m.totalSpend) },
          { label: "Total Revenue", value: fmtIDR(m.totalRevenue) },
          { label: "ROAS", value: m.totalSpend > 0 ? `${(m.totalRevenue / m.totalSpend).toFixed(1)}x` : '—' },
          { label: "Impressions", value: m.totalImpressions.toLocaleString() },
        ].map(item => (
          <Card key={item.label} className="rounded-xl border-border/30 bg-card/80">
            <CardContent className="p-3 text-center">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-base font-black tabular-nums text-foreground mt-0.5">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




// ── Main Dashboard ──

const InvestorFunnelDashboard = React.memo(function InvestorFunnelDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-primary/30 to-chart-4/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-1" />
                Investor Acquisition & Conversion War Funnel
              </CardTitle>
              <CardDescription className="text-[11px]">
                Full-stack investor acquisition — awareness through retention with live performance tracking
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              90-Day Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {funnelStages.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className={cn("p-2 rounded-xl border", s.bg, s.border)}>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3 w-3", s.color)} />
                    <span className="text-[8px] font-bold text-foreground">{s.label.split(" — ")[1]}</span>
                  </div>
                  <span className={cn("text-[10px] font-bold block mt-0.5", s.color)}>{s.targetValue}</span>
                  <span className="text-[7px] text-muted-foreground">{s.targetMetric}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="performance" className="text-[10px] h-6 px-3">Live Performance</TabsTrigger>
          <TabsTrigger value="funnel" className="text-[10px] h-6 px-3">Funnel Strategy</TabsTrigger>
          <TabsTrigger value="execution" className="text-[10px] h-6 px-3">Weekly Execution</TabsTrigger>
          <TabsTrigger value="economics" className="text-[10px] h-6 px-3">Unit Economics</TabsTrigger>
        </TabsList>

        {/* Live Performance */}
        <TabsContent value="performance" className="mt-3">
          <LivePerformanceTab />
        </TabsContent>

        {/* Funnel Strategy */}
        <TabsContent value="funnel" className="mt-3 space-y-3">
          <FunnelVisualization />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {funnelStages.map((stage) => (
              <FunnelStageCard key={stage.key} stage={stage} />
            ))}
          </div>
        </TabsContent>

        {/* Weekly Execution */}
        <TabsContent value="execution" className="mt-3">
          <WeeklyPlanSection />
        </TabsContent>

        {/* Unit Economics */}
        <TabsContent value="economics" className="mt-3 space-y-3">
          <UnitEconomicsCard />
          <FunnelVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default InvestorFunnelDashboard;
