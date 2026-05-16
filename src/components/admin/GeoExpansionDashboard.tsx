import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, CheckCircle2, ArrowRight, ChevronRight, ChevronDown, Target,
  TrendingUp, Users, BarChart3, Globe, Rocket, Building, Layers, Timer,
  Star, Zap, Crown, Shield, DollarSign, Flag, Gauge, Signal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── City Data ──

interface CityData {
  name: string;
  tier: 1 | 2 | 3;
  province: string;
  population: string;
  propertyDemand: "Very High" | "High" | "Medium" | "Emerging";
  digitalAdoption: "Very High" | "High" | "Medium";
  priorityScore: number;
  phase: string;
  agentTarget: number;
  listingTarget: number;
  monthlyTrafficTarget: string;
  keyDrivers: string[];
}

const cities: CityData[] = [
  { name: "Jakarta (Jabodetabek)", tier: 1, province: "DKI/Jabar/Banten", population: "34M", propertyDemand: "Very High", digitalAdoption: "Very High", priorityScore: 98, phase: "Phase 1", agentTarget: 200, listingTarget: 5000, monthlyTrafficTarget: "200K", keyDrivers: ["National capital", "Highest transaction volume", "Most agents per capita", "Premium & investment market"] },
  { name: "Surabaya", tier: 1, province: "Jawa Timur", population: "3.1M", propertyDemand: "Very High", digitalAdoption: "High", priorityScore: 92, phase: "Phase 1", agentTarget: 80, listingTarget: 2000, monthlyTrafficTarget: "80K", keyDrivers: ["2nd largest city", "Industrial corridor", "Growing middle class", "East Java hub"] },
  { name: "Bandung", tier: 1, province: "Jawa Barat", population: "2.5M", propertyDemand: "High", digitalAdoption: "Very High", priorityScore: 90, phase: "Phase 1", agentTarget: 60, listingTarget: 1500, monthlyTrafficTarget: "60K", keyDrivers: ["Tech-savvy population", "Jakarta spillover demand", "University city", "Tourism + residential"] },
  { name: "Bali (Denpasar)", tier: 1, province: "Bali", population: "4.3M", propertyDemand: "Very High", digitalAdoption: "High", priorityScore: 94, phase: "Phase 1", agentTarget: 50, listingTarget: 1200, monthlyTrafficTarget: "100K", keyDrivers: ["International investor magnet", "Villa & hospitality market", "Digital nomad hub", "Premium pricing"] },
  { name: "Medan", tier: 2, province: "Sumatera Utara", population: "2.4M", propertyDemand: "High", digitalAdoption: "Medium", priorityScore: 78, phase: "Phase 2", agentTarget: 40, listingTarget: 800, monthlyTrafficTarget: "30K", keyDrivers: ["Largest Sumatera city", "Plantation wealth corridor", "Growing infrastructure", "Untapped digital market"] },
  { name: "Semarang", tier: 2, province: "Jawa Tengah", population: "1.8M", propertyDemand: "High", digitalAdoption: "High", priorityScore: 82, phase: "Phase 2", agentTarget: 35, listingTarget: 700, monthlyTrafficTarget: "25K", keyDrivers: ["Central Java capital", "Logistics hub", "Affordable market", "Industrial growth"] },
  { name: "Makassar", tier: 2, province: "Sulawesi Selatan", population: "1.5M", propertyDemand: "High", digitalAdoption: "Medium", priorityScore: 76, phase: "Phase 2", agentTarget: 30, listingTarget: 600, monthlyTrafficTarget: "20K", keyDrivers: ["Eastern Indonesia gateway", "Rapid urbanization", "Government infrastructure spend", "Maritime economy"] },
  { name: "Yogyakarta", tier: 2, province: "DIY", population: "0.4M", propertyDemand: "Medium", digitalAdoption: "Very High", priorityScore: 80, phase: "Phase 2", agentTarget: 25, listingTarget: 500, monthlyTrafficTarget: "25K", keyDrivers: ["Student city (100K+ students)", "Cultural tourism", "Affordable investment entry", "High digital literacy"] },
  { name: "Palembang", tier: 2, province: "Sumatera Selatan", population: "1.7M", propertyDemand: "Medium", digitalAdoption: "Medium", priorityScore: 68, phase: "Phase 2", agentTarget: 25, listingTarget: 500, monthlyTrafficTarget: "15K", keyDrivers: ["South Sumatera capital", "Oil & gas wealth", "Infrastructure development", "Emerging middle class"] },
  { name: "Balikpapan", tier: 3, province: "Kalimantan Timur", population: "0.7M", propertyDemand: "High", digitalAdoption: "Medium", priorityScore: 74, phase: "Phase 3", agentTarget: 20, listingTarget: 400, monthlyTrafficTarget: "15K", keyDrivers: ["IKN Nusantara proximity", "Oil & gas hub", "Infrastructure boom", "Speculative investment wave"] },
  { name: "Manado", tier: 3, province: "Sulawesi Utara", population: "0.5M", propertyDemand: "Medium", digitalAdoption: "Medium", priorityScore: 58, phase: "Phase 3", agentTarget: 15, listingTarget: 300, monthlyTrafficTarget: "8K", keyDrivers: ["Tourism potential", "SEZ development", "Growing hospitality sector", "North Sulawesi gateway"] },
  { name: "Batam", tier: 3, province: "Kepulauan Riau", population: "1.2M", propertyDemand: "High", digitalAdoption: "High", priorityScore: 72, phase: "Phase 3", agentTarget: 20, listingTarget: 400, monthlyTrafficTarget: "12K", keyDrivers: ["Singapore spillover", "Free trade zone", "Industrial investment", "Cross-border demand"] },
  { name: "Malang", tier: 3, province: "Jawa Timur", population: "0.9M", propertyDemand: "Medium", digitalAdoption: "High", priorityScore: 70, phase: "Phase 3", agentTarget: 20, listingTarget: 400, monthlyTrafficTarget: "12K", keyDrivers: ["University city", "Surabaya satellite", "Tourism growth", "Affordable residential"] },
  { name: "Lombok", tier: 3, province: "NTB", population: "3.4M", propertyDemand: "Emerging", digitalAdoption: "Medium", priorityScore: 66, phase: "Phase 3", agentTarget: 15, listingTarget: 300, monthlyTrafficTarget: "10K", keyDrivers: ["MotoGP circuit", "Mandalika SEZ", "Bali alternative", "Tourism infrastructure"] },
  { name: "IKN Nusantara", tier: 3, province: "Kalimantan Timur", population: "N/A", propertyDemand: "Emerging", digitalAdoption: "Medium", priorityScore: 85, phase: "Phase 2", agentTarget: 15, listingTarget: 200, monthlyTrafficTarget: "50K", keyDrivers: ["New national capital", "Massive government investment", "Speculative land market", "Long-term growth play"] },
];

// ── Activation Milestones ──

interface ActivationMilestone {
  level: string;
  label: string;
  color: string;
  bg: string;
  criteria: { metric: string; threshold: string }[];
  significance: string;
}

const activationMilestones: ActivationMilestone[] = [
  {
    level: "L0", label: "SEO Seeded", color: "text-muted-foreground", bg: "bg-muted/10",
    criteria: [
      { metric: "SEO Pages Published", threshold: "50+ location pages live" },
      { metric: "Organic Impressions", threshold: "1,000+ monthly search impressions" },
    ],
    significance: "Content foundation laid — organic discovery begins",
  },
  {
    level: "L1", label: "Supply Seeded", color: "text-primary", bg: "bg-primary/10",
    criteria: [
      { metric: "Active Agents", threshold: "10+ agents onboarded and listing" },
      { metric: "Live Listings", threshold: "100+ verified property listings" },
      { metric: "Listing Diversity", threshold: "3+ property types represented" },
    ],
    significance: "Minimum viable supply — platform has browseable inventory",
  },
  {
    level: "L2", label: "Demand Activated", color: "text-chart-4", bg: "bg-chart-4/10",
    criteria: [
      { metric: "Monthly Unique Visitors", threshold: "5,000+ from city" },
      { metric: "Search-to-View Rate", threshold: "15%+ of searchers view a listing" },
      { metric: "Inquiry Rate", threshold: "50+ inquiries/month" },
    ],
    significance: "Demand side engaged — buyers are discovering and engaging with listings",
  },
  {
    level: "L3", label: "Market Active", color: "text-chart-1", bg: "bg-chart-1/10",
    criteria: [
      { metric: "Active Agents", threshold: "30+ active monthly" },
      { metric: "Live Listings", threshold: "500+ listings" },
      { metric: "Monthly Traffic", threshold: "20,000+ visitors" },
      { metric: "Agent Response Rate", threshold: "80%+ within 2 hours" },
    ],
    significance: "Healthy two-sided marketplace — supply and demand are self-reinforcing",
  },
  {
    level: "L4", label: "Market Dominant", color: "text-chart-3", bg: "bg-chart-3/10",
    criteria: [
      { metric: "Market Share", threshold: "Top 3 platform in city by traffic" },
      { metric: "Premium Subscribers", threshold: "50+ paying agents/investors" },
      { metric: "Revenue", threshold: "Rp 50M+/month from city" },
      { metric: "Brand Recognition", threshold: "Unaided recall in agent surveys" },
    ],
    significance: "Dominant position — city is a profit center with defensible market position",
  },
];

// ── Phase Execution Plans ──

interface PhaseExecution {
  phase: string;
  timeline: string;
  cities: string[];
  color: string;
  bg: string;
  budget: string;
  teamFocus: string;
  steps: { week: string; actions: string[] }[];
  kpis: { metric: string; target: string }[];
  partnershipFocus: string[];
}

const phaseExecutions: PhaseExecution[] = [
  {
    phase: "Phase 1: Capital Cities", timeline: "Month 1-3", cities: ["Jakarta", "Surabaya", "Bandung", "Bali"],
    color: "text-primary", bg: "bg-primary/10", budget: "Rp 800M (60% of total)", teamFocus: "80% of team bandwidth",
    steps: [
      { week: "Week 1-2", actions: ["Deploy 200+ SEO location pages per city", "Launch WhatsApp agent outreach campaigns", "Set up city-specific social media content calendars", "Activate Google Ads for high-intent property keywords"] },
      { week: "Week 3-4", actions: ["Onboard first 50 agents per city via personal outreach", "Launch featured listing promotion for early adopters (free trial)", "Publish first city market intelligence report", "Host online agent onboarding webinar"] },
      { week: "Week 5-8", actions: ["Scale to 100+ agents, 1000+ listings per city", "Activate local developer partnerships (bulk listings)", "Launch city-specific Instagram/TikTok content series", "Begin local media outreach with market data PR"] },
      { week: "Week 9-12", actions: ["Achieve L2 (Demand Activated) in all 4 cities", "Launch Agent Pro subscription in Jakarta first", "Activate investor community for Bali market", "Evaluate and optimize: double down on highest-performing channels"] },
    ],
    kpis: [
      { metric: "Total Agents", target: "390 across 4 cities" },
      { metric: "Total Listings", target: "9,700+" },
      { metric: "Monthly Traffic", target: "440K combined" },
      { metric: "Revenue", target: "Rp 125M MRR by Month 3" },
    ],
    partnershipFocus: ["Top 10 developers per city", "Major bank mortgage desks", "AREBI local chapters", "Property media outlets"],
  },
  {
    phase: "Phase 2: Strategic Expansion", timeline: "Month 4-6", cities: ["Medan", "Semarang", "Yogyakarta", "Makassar", "Palembang", "IKN Nusantara"],
    color: "text-chart-1", bg: "bg-chart-1/10", budget: "Rp 350M (25% of total)", teamFocus: "50% of team bandwidth (Phase 1 cities on autopilot)",
    steps: [
      { week: "Month 4", actions: ["Deploy SEO pages for all Phase 2 cities (100+ each)", "Recruit city leads (remote) for agent onboarding", "Launch social content with city-specific property market angles", "Activate referral program: Phase 1 agents refer Phase 2 agents"] },
      { week: "Month 5", actions: ["Onboard 20+ agents per city via city leads", "Launch local developer partnerships", "Publish IKN Nusantara special report (high SEO value)", "Host first multi-city webinar covering Phase 2 markets"] },
      { week: "Month 6", actions: ["Scale to L1 (Supply Seeded) in all Phase 2 cities", "Activate premium features rollout in Phase 2", "Begin local university partnerships in Yogyakarta", "Evaluate Phase 2 performance and plan Phase 3 timing"] },
    ],
    kpis: [
      { metric: "Total Agents (Phase 2)", target: "170 across 6 cities" },
      { metric: "Total Listings (Phase 2)", target: "2,700+" },
      { metric: "Monthly Traffic (Phase 2)", target: "145K combined" },
      { metric: "Phase 1 Revenue", target: "Rp 600M MRR (growing)" },
    ],
    partnershipFocus: ["Regional developers", "Local bank branches", "University housing offices", "Government housing agencies"],
  },
  {
    phase: "Phase 3: National Coverage", timeline: "Month 7-12", cities: ["Balikpapan", "Batam", "Malang", "Manado", "Lombok", "+ 5 more"],
    color: "text-chart-3", bg: "bg-chart-3/10", budget: "Rp 200M (15% of total)", teamFocus: "30% of team bandwidth (playbook-driven, city leads execute)",
    steps: [
      { week: "Month 7-8", actions: ["Deploy SEO pages for all remaining target cities", "Hire city leads as independent contractors", "Replicate Phase 1-2 playbook with templated execution", "Focus on Batam (Singapore spillover) and Balikpapan (IKN proximity)"] },
      { week: "Month 9-10", actions: ["Achieve L1 in all Phase 3 cities", "Launch national market intelligence covering all 15+ cities", "Activate cross-city investment matching (Bali investors → Lombok)", "Scale ambassador program to Phase 3 cities"] },
      { week: "Month 11-12", actions: ["All Phase 1 cities at L3 or L4 (Market Active/Dominant)", "All Phase 2 cities at L2+ (Demand Activated)", "All Phase 3 cities at L1+ (Supply Seeded)", "Total platform: 15+ cities, 600+ agents, 15,000+ listings"] },
    ],
    kpis: [
      { metric: "National Agents", target: "600+ across 15 cities" },
      { metric: "National Listings", target: "15,000+" },
      { metric: "National Traffic", target: "800K+ monthly" },
      { metric: "Total MRR", target: "Rp 2.3B by Month 12" },
    ],
    partnershipFocus: ["National developer groups", "National banking partnerships", "Tourism boards (Lombok, Manado)", "SEZ management authorities"],
  },
];

// ── Resource Allocation ──

const resourceAllocation = [
  { category: "Marketing Budget", phase1: "60%", phase2: "25%", phase3: "15%", total: "Rp 1.35B/year", notes: "Heavy front-loading for Phase 1 dominance — decreasing as organic channels kick in" },
  { category: "Team Allocation", phase1: "80%", phase2: "50%", phase3: "30%", total: "15 FTE", notes: "Phase 1 requires hands-on execution; Phase 2-3 leverage playbooks and city leads" },
  { category: "Agent Acquisition", phase1: "Rp 200K/agent", phase2: "Rp 150K/agent", phase3: "Rp 100K/agent", total: "Rp 85M", notes: "CAC decreases as referral program scales and brand recognition grows" },
  { category: "Content Production", phase1: "13 videos/week", phase2: "8 videos/week", phase3: "5 videos/week", total: "~1,000 videos/year", notes: "City-specific content reduces per Phase as templates and formats are established" },
  { category: "Partnership Outreach", phase1: "20 partners", phase2: "15 partners", phase3: "10 partners", total: "45 partnerships", notes: "Developers, banks, universities, media — each partnership multiplies supply and credibility" },
];

// ── Components ──

function CityCard({ city }: { city: CityData }) {
  const [expanded, setExpanded] = useState(false);
  const demandColors = { "Very High": "text-chart-1", "High": "text-chart-3", "Medium": "text-chart-4", "Emerging": "text-primary" };
  const tierColors = { 1: "text-chart-1 bg-chart-1/10", 2: "text-primary bg-primary/10", 3: "text-chart-3 bg-chart-3/10" };

  return (
    <Card className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
      <CardHeader className="p-2.5 pb-1.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold", tierColors[city.tier])}>
              T{city.tier}
            </div>
            <div>
              <span className="text-[10px] font-bold text-foreground">{city.name}</span>
              <span className="text-[8px] text-muted-foreground ml-1.5">{city.province} · {city.population}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={cn("text-[6px] h-3 px-1", demandColors[city.propertyDemand])}>{city.propertyDemand}</Badge>
            <div className="w-8 h-2 rounded-full bg-muted/20 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${city.priorityScore}%` }} />
            </div>
            <span className="text-[8px] font-bold text-foreground w-5">{city.priorityScore}</span>
            {expanded ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-2.5 pt-0 border-t border-border/10">
          <div className="grid grid-cols-4 gap-1.5 mb-2 mt-1.5">
            {[
              { label: "Agents", value: city.agentTarget.toString() },
              { label: "Listings", value: city.listingTarget.toLocaleString() },
              { label: "Traffic/mo", value: city.monthlyTrafficTarget },
              { label: "Digital", value: city.digitalAdoption },
            ].map((m) => (
              <div key={m.label} className="p-1 rounded-md border border-border/10 bg-muted/5 text-center">
                <span className="text-[6px] text-muted-foreground block">{m.label}</span>
                <span className="text-[9px] font-bold text-foreground">{m.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            {city.keyDrivers.map((d, i) => (
              <div key={i} className="flex items-start gap-1">
                <CheckCircle2 className="h-2 w-2 text-primary shrink-0 mt-0.5" />
                <span className="text-[7px] text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function MilestoneCard({ milestone }: { milestone: ActivationMilestone }) {
  return (
    <Card className={cn("rounded-xl border-border/30 bg-card/80")}>
      <CardHeader className="p-2.5 pb-1.5">
        <CardTitle className="text-[10px] font-bold flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold", milestone.bg, milestone.color)}>{milestone.level}</div>
          {milestone.label}
        </CardTitle>
        <CardDescription className="text-[8px] ml-8">{milestone.significance}</CardDescription>
      </CardHeader>
      <CardContent className="p-2.5 pt-0 space-y-1">
        {milestone.criteria.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-1 rounded-md border border-border/10 bg-muted/5">
            <span className="text-[8px] text-foreground">{c.metric}</span>
            <Badge variant="outline" className={cn("text-[6px] h-3 px-1", milestone.color)}>{c.threshold}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

const GeoExpansionDashboard = React.memo(function GeoExpansionDashboard() {
  const tierGroups = [1, 2, 3] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-primary/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Geographic Expansion Roadmap
              </CardTitle>
              <CardDescription className="text-[11px]">
                City-by-city national expansion — 15 cities across 3 phases, targeting 600+ agents and 15,000+ listings by Month 12
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-1 bg-chart-1/10 border-chart-1/30">
              🗺️ National
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: "Target Cities", value: "15", icon: MapPin, color: "text-primary" },
              { label: "Total Agents", value: "600+", icon: Users, color: "text-chart-4" },
              { label: "Total Listings", value: "15K+", icon: Building, color: "text-chart-3" },
              { label: "Monthly Traffic", value: "800K+", icon: Globe, color: "text-chart-1" },
              { label: "MRR Target", value: "Rp 2.3B", icon: DollarSign, color: "text-primary" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-2 rounded-xl border border-border/20 bg-muted/5 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", m.color)} />
                  <div>
                    <span className="text-[7px] text-muted-foreground block">{m.label}</span>
                    <span className={cn("text-sm font-bold", m.color)}>{m.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cities" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="cities" className="text-[10px] h-6 px-3">City Rankings</TabsTrigger>
          <TabsTrigger value="milestones" className="text-[10px] h-6 px-3">Activation Milestones</TabsTrigger>
          <TabsTrigger value="execution" className="text-[10px] h-6 px-3">Phase Execution</TabsTrigger>
          <TabsTrigger value="resources" className="text-[10px] h-6 px-3">Resource Allocation</TabsTrigger>
        </TabsList>

        {/* City Rankings */}
        <TabsContent value="cities" className="mt-3 space-y-3">
          {tierGroups.map((tier) => {
            const tierCities = cities.filter((c) => c.tier === tier).sort((a, b) => b.priorityScore - a.priorityScore);
            const tierLabels = { 1: "Tier 1 — Capital Cities (Phase 1)", 2: "Tier 2 — Strategic Cities (Phase 2)", 3: "Tier 3 — Emerging Markets (Phase 3)" };
            const tierColor = { 1: "text-chart-1", 2: "text-primary", 3: "text-chart-3" };
            return (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className={cn("text-[8px] font-bold", tierColor[tier])}>{tierLabels[tier]}</Badge>
                  <span className="text-[8px] text-muted-foreground">{tierCities.length} cities</span>
                </div>
                <div className="space-y-1">
                  {tierCities.map((city) => <CityCard key={city.name} city={city} />)}
                </div>
              </div>
            );
          })}

          {/* Prioritization Framework */}
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> City Prioritization Scoring Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {[
                { factor: "Property Transaction Volume", weight: "25%", description: "Annual property transactions as proxy for market depth and monetization potential" },
                { factor: "Population & Urbanization Rate", weight: "20%", description: "Total population and urban growth rate — larger cities have more natural demand" },
                { factor: "Digital Adoption Score", weight: "20%", description: "Internet penetration, e-commerce usage, digital payment adoption — proxy for platform readiness" },
                { factor: "Agent Density & Accessibility", weight: "15%", description: "Number of registered property agents and willingness to adopt digital tools" },
                { factor: "Investment Demand Signals", weight: "10%", description: "Search volume for investment keywords, rental yield trends, investor community activity" },
                { factor: "Infrastructure Development Pipeline", weight: "10%", description: "Upcoming toll roads, MRT/LRT, airports, SEZs — catalysts for property value appreciation" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-foreground">{f.factor}</span>
                      <Badge variant="outline" className="text-[6px] h-3 px-1 text-primary">{f.weight}</Badge>
                    </div>
                    <p className="text-[7px] text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activation Milestones */}
        <TabsContent value="milestones" className="mt-3 space-y-2">
          <div className="flex items-center gap-1 flex-wrap mb-3">
            {activationMilestones.map((m, i) => (
              <React.Fragment key={m.level}>
                <div className={cn("p-1.5 rounded-lg border text-center min-w-[80px]", m.bg)}>
                  <span className={cn("text-[8px] font-bold block", m.color)}>{m.level}: {m.label}</span>
                </div>
                {i < activationMilestones.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          {activationMilestones.map((m) => <MilestoneCard key={m.level} milestone={m} />)}
        </TabsContent>

        {/* Phase Execution */}
        <TabsContent value="execution" className="mt-3 space-y-3">
          {phaseExecutions.map((phase) => (
            <Card key={phase.phase} className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
              <div className={cn("h-1", phase.bg.replace("/10", "/30"))} />
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1"><Timer className="h-2 w-2 mr-0.5" />{phase.timeline}</Badge>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1"><DollarSign className="h-2 w-2 mr-0.5" />{phase.budget}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {phase.cities.map((c) => (
                    <Badge key={c} variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{c}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {phase.steps.map((step) => (
                  <div key={step.week} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                    <span className={cn("text-[8px] font-bold block mb-1", phase.color)}>{step.week}</span>
                    <div className="space-y-0.5">
                      {step.actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <CheckCircle2 className={cn("h-2 w-2 shrink-0 mt-0.5", phase.color)} />
                          <span className="text-[7px] text-muted-foreground">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-1">
                  {phase.kpis.map((kpi) => (
                    <div key={kpi.metric} className="p-1.5 rounded-lg border border-border/10 bg-muted/5 text-center">
                      <span className="text-[6px] text-muted-foreground block">{kpi.metric}</span>
                      <span className={cn("text-[9px] font-bold", phase.color)}>{kpi.target}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resource Allocation */}
        <TabsContent value="resources" className="mt-3 space-y-2">
          {resourceAllocation.map((r) => (
            <Card key={r.category} className="rounded-xl border-border/30 bg-card/80">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-bold text-foreground">{r.category}</CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[
                    { label: "Phase 1", value: r.phase1, color: "text-primary" },
                    { label: "Phase 2", value: r.phase2, color: "text-chart-1" },
                    { label: "Phase 3", value: r.phase3, color: "text-chart-3" },
                    { label: "Total", value: r.total, color: "text-foreground" },
                  ].map((col) => (
                    <div key={col.label} className="p-1 rounded-md border border-border/10 bg-muted/5 text-center">
                      <span className="text-[6px] text-muted-foreground block">{col.label}</span>
                      <span className={cn("text-[9px] font-bold", col.color)}>{col.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[7px] text-muted-foreground">{r.notes}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default GeoExpansionDashboard;
