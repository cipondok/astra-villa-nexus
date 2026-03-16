import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, CheckCircle2, ArrowRight, ChevronRight, ChevronDown, Target,
  TrendingUp, Rocket, Layers, Timer, Star, Zap, Crown, Shield,
  DollarSign, Flag, Trophy, Briefcase, Code, Megaphone, Palette,
  BarChart3, Heart, Brain, Gauge, UserPlus, Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Role Data ──

interface HiringRole {
  title: string;
  department: string;
  icon: React.ElementType;
  color: string;
  priority: "Critical" | "High" | "Medium";
  timing: string;
  salaryRange: string;
  roiRationale: string;
  responsibilities: string[];
  idealProfile: string;
  kpis: string[];
}

const phase1Roles: HiringRole[] = [
  {
    title: "Head of Growth", department: "Growth", icon: TrendingUp, color: "text-chart-1",
    priority: "Critical", timing: "Month 1", salaryRange: "Rp 25-40M/mo",
    roiRationale: "Directly drives user acquisition, agent onboarding, and revenue — single highest-leverage hire for marketplace traction",
    responsibilities: ["Own SEO, social media, paid acquisition, and referral programs", "Build and manage agent onboarding pipeline across cities", "Design and execute viral content strategy (13 videos/week target)", "Manage marketing budget allocation and ROI optimization"],
    idealProfile: "Ex-Gojek/Tokopedia/Traveloka growth lead with marketplace experience, data-driven, hands-on executor",
    kpis: ["500K organic traffic/mo by Month 6", "100 agents onboarded/month", "Rp 125M MRR by Month 3"],
  },
  {
    title: "Full-Stack Engineer", department: "Engineering", icon: Code, color: "text-primary",
    priority: "Critical", timing: "Month 1", salaryRange: "Rp 20-35M/mo",
    roiRationale: "Accelerates feature delivery 2x — enables founder to focus on strategy instead of coding",
    responsibilities: ["Build and ship marketplace features (listing, search, agent tools)", "Maintain and optimize AI intelligence pipeline integration", "Implement SEO technical infrastructure (programmatic pages, structured data)", "Handle DevOps, performance optimization, and monitoring"],
    idealProfile: "React + Supabase/PostgreSQL expert, 3-5 years experience, startup mindset, can ship independently",
    kpis: ["2-week sprint cycles", "99.5% uptime", "<2s page load time", "10+ features shipped/month"],
  },
  {
    title: "Content & Social Media Lead", department: "Marketing", icon: Megaphone, color: "text-chart-4",
    priority: "Critical", timing: "Month 1-2", salaryRange: "Rp 12-20M/mo",
    roiRationale: "Content is the primary organic growth engine — SEO pages and social videos drive 80% of early traffic at near-zero marginal cost",
    responsibilities: ["Produce 13 property videos/week (TikTok, Reels, Shorts)", "Write SEO location content for programmatic pages", "Manage social media accounts and community engagement", "Create agent marketing materials and listing content templates"],
    idealProfile: "Property content creator with video skills, understands SEO writing, active on TikTok/Instagram, Indonesian market native",
    kpis: ["10M social views/month by Month 3", "100K followers across platforms", "500+ SEO pages published/month"],
  },
  {
    title: "Agent Success Manager", department: "Operations", icon: Users, color: "text-chart-3",
    priority: "High", timing: "Month 2", salaryRange: "Rp 10-18M/mo",
    roiRationale: "Agent retention directly determines listing supply — one manager preventing 20% churn saves equivalent of 50 new agent acquisitions",
    responsibilities: ["Onboard and train new agents on platform tools", "Manage agent relationships and resolve issues", "Track agent performance metrics and identify at-risk agents", "Run WhatsApp groups and community engagement for agents"],
    idealProfile: "Ex-property agency operations person, strong relationship skills, comfortable with WhatsApp-heavy communication",
    kpis: ["90% agent 30-day retention", "80% agent response rate within 2 hours", "20 listings/agent average"],
  },
  {
    title: "Data & Analytics Analyst", department: "Intelligence", icon: BarChart3, color: "text-primary",
    priority: "High", timing: "Month 2-3", salaryRange: "Rp 15-25M/mo",
    roiRationale: "Transforms raw platform data into actionable intelligence — powers market reports, investor content, and AI model improvement",
    responsibilities: ["Build analytics dashboards for growth, agent, and investor metrics", "Produce monthly market intelligence reports (ASTRA Price Index)", "Analyze user behavior and funnel conversion data", "Support AI model accuracy tracking and improvement"],
    idealProfile: "SQL + Python + data visualization expert, comfortable with property data, can translate data into business insights",
    kpis: ["Weekly growth dashboard updates", "Monthly market report published", "Data-driven decision support for all teams"],
  },
];

const phase2Roles: HiringRole[] = [
  {
    title: "Head of Sales & Partnerships", department: "Revenue", icon: Briefcase, color: "text-chart-1",
    priority: "Critical", timing: "Month 4", salaryRange: "Rp 25-40M/mo",
    roiRationale: "Unlocks B2B revenue streams — developer partnerships, bank integrations, and enterprise deals are highest-margin revenue channels",
    responsibilities: ["Close developer partnerships for bulk listing inventory (50-200 units/deal)", "Negotiate bank mortgage referral agreements", "Sell Agent Pro and Enterprise subscription packages", "Build and manage partnership pipeline across 15 cities"],
    idealProfile: "Ex-property developer sales director or PropTech BD lead, strong network in Indonesian property industry, deal closer",
    kpis: ["10 developer partnerships by Month 6", "3 bank partnerships signed", "Rp 600M MRR contribution by Month 6"],
  },
  {
    title: "Performance Marketing Specialist", department: "Growth", icon: Target, color: "text-primary",
    priority: "High", timing: "Month 4-5", salaryRange: "Rp 12-20M/mo",
    roiRationale: "Paid acquisition becomes critical once organic channels plateau — optimized ad spend delivers 5-10x ROAS on property intent keywords",
    responsibilities: ["Manage Google Ads, Meta Ads, and TikTok Ads campaigns", "Optimize landing pages and conversion funnels", "Track and reduce CAC across all paid channels", "A/B test ad creatives and targeting strategies"],
    idealProfile: "Google Ads + Meta certified, marketplace/property experience preferred, data-obsessed optimizer",
    kpis: ["ROAS > 5x across channels", "CAC < Rp 85K blended", "Paid traffic: 100K visits/month"],
  },
  {
    title: "City Expansion Lead", department: "Operations", icon: Building, color: "text-chart-3",
    priority: "High", timing: "Month 4-5", salaryRange: "Rp 15-25M/mo",
    roiRationale: "Enables simultaneous multi-city launch without founder bottleneck — each city lead manages local agent network and supply",
    responsibilities: ["Execute city launch playbook for Phase 2/3 cities", "Recruit and manage city-level agent onboarding teams", "Build local developer and partnership relationships", "Track city-level activation milestones (L0→L4)"],
    idealProfile: "Operations manager with multi-city experience, willing to travel, strong local network building skills",
    kpis: ["3 cities launched per quarter", "L1 achieved within 30 days of city launch", "30+ agents per city by Month 2"],
  },
  {
    title: "Community & Investor Relations Manager", department: "Community", icon: Heart, color: "text-chart-4",
    priority: "Medium", timing: "Month 5-6", salaryRange: "Rp 12-18M/mo",
    roiRationale: "Investor community drives premium subscription revenue and creates organic advocacy — 15% premium conversion target",
    responsibilities: ["Manage investor community programs (webinars, forums, reports)", "Coordinate monthly market intelligence webinars", "Build and nurture premium investor relationships", "Run ambassador program and referral incentives"],
    idealProfile: "Community manager with finance/investment background, excellent communication, event management experience",
    kpis: ["500+ webinar attendees monthly", "25% DAU/MAU in community forums", "15% free-to-premium conversion"],
  },
];

const phase3Roles: HiringRole[] = [
  {
    title: "Head of AI / ML Engineer", department: "Engineering", icon: Brain, color: "text-chart-4",
    priority: "Critical", timing: "Month 6-7", salaryRange: "Rp 35-60M/mo",
    roiRationale: "Deepens AI moat — improves prediction accuracy from ±5% to ±3%, which directly translates to investor trust and premium conversion",
    responsibilities: ["Own and improve AI valuation, scoring, and prediction models", "Build next-gen features: computer vision for property photos, NLP for listings", "Design ML pipeline for real-time market signal processing", "Research and prototype advanced intelligence features"],
    idealProfile: "ML engineer from Gojek/Tokopedia/Grab AI teams, Python + TensorFlow/PyTorch, passion for property/finance data",
    kpis: ["AI prediction accuracy ±3%", "Model inference <500ms", "3 new AI features shipped/quarter"],
  },
  {
    title: "Senior Frontend Engineer", department: "Engineering", icon: Code, color: "text-primary",
    priority: "High", timing: "Month 7-8", salaryRange: "Rp 22-35M/mo",
    roiRationale: "UX quality directly impacts conversion — 10% improvement in search-to-inquiry flow = 10% revenue increase",
    responsibilities: ["Lead frontend architecture and component system", "Build mobile-responsive experiences and PWA features", "Implement advanced search, map, and visualization features", "Mentor junior engineers and establish coding standards"],
    idealProfile: "React/TypeScript expert, 4+ years experience, eye for design, performance optimization skills",
    kpis: ["Core Web Vitals all green", "Search-to-inquiry conversion +15%", "Mobile bounce rate <40%"],
  },
  {
    title: "Product Designer (UI/UX)", department: "Design", icon: Palette, color: "text-chart-3",
    priority: "High", timing: "Month 7-8", salaryRange: "Rp 15-25M/mo",
    roiRationale: "Design differentiation is a competitive moat — premium UX justifies premium pricing and increases time-on-site 2x",
    responsibilities: ["Own end-to-end product design for all platform features", "Conduct user research and usability testing", "Build and maintain design system and component library", "Design marketing materials, social templates, and brand assets"],
    idealProfile: "Product designer with marketplace/fintech experience, Figma expert, user research skills, data-informed design approach",
    kpis: ["NPS > 8.0 for new features", "Time-on-site increase +30%", "Design system coverage 90%+"],
  },
  {
    title: "Backend / Infrastructure Engineer", department: "Engineering", icon: Layers, color: "text-chart-1",
    priority: "Medium", timing: "Month 8-9", salaryRange: "Rp 22-35M/mo",
    roiRationale: "Scaling infrastructure prevents platform outages during growth surges — one hour of downtime costs Rp 50M+ in lost revenue at scale",
    responsibilities: ["Scale Supabase/PostgreSQL infrastructure for 100K+ concurrent users", "Build API layer for partner integrations (banks, developers)", "Implement caching, CDN, and performance optimization", "Design disaster recovery and data backup systems"],
    idealProfile: "Backend engineer with high-scale experience, PostgreSQL expert, API design skills, DevOps/infrastructure background",
    kpis: ["99.99% uptime", "API response <200ms p95", "Support 100K concurrent users"],
  },
];

// ── Priority Matrix ──

const priorityMatrix = [
  { stage: "Pre-Seed (Now)", headcount: "1 (Founder)", focus: "Product + Vision", keyHire: "—", rationale: "Founder builds MVP, validates market, secures initial traction" },
  { stage: "Seed (Month 1-3)", headcount: "6", focus: "Supply + Traffic", keyHire: "Head of Growth", rationale: "Growth unlocks everything: agents → listings → traffic → revenue → fundraising metrics" },
  { stage: "Post-Seed (Month 4-6)", headcount: "10", focus: "Revenue + Scale", keyHire: "Head of Sales", rationale: "Revenue validates business model — B2B partnerships are highest-margin, fastest to close" },
  { stage: "Pre-Series A (Month 7-9)", headcount: "14", focus: "AI Moat + UX", keyHire: "Head of AI/ML", rationale: "Deepening AI advantage creates defensibility that investors value in Series A diligence" },
  { stage: "Series A (Month 10-12)", headcount: "18-20", focus: "National Scale", keyHire: "VP Engineering", rationale: "Engineering leadership enables scaling to 15+ cities and 100K+ users without technical debt collapse" },
];

// ── Culture Principles ──

const culturePrinciples = [
  {
    principle: "Ship Fast, Learn Faster", icon: Rocket, color: "text-chart-1",
    description: "We ship features in days, not months. Every release is an experiment. We measure impact within 48 hours and iterate or kill.",
    practices: ["2-week sprint cycles with mandatory demo day", "Feature flags for gradual rollouts — ship to 10% first", "Post-mortem culture: no blame, only learning", "Founder reviews every major feature within 24 hours of ship"],
  },
  {
    principle: "Data Decides, Not Opinions", icon: BarChart3, color: "text-primary",
    description: "Every decision has a number behind it. We don't debate opinions — we run experiments and let data win.",
    practices: ["Every feature proposal includes success metrics before approval", "Weekly metrics review: growth, engagement, revenue, AI accuracy", "A/B test everything: headlines, CTAs, pricing, onboarding flows", "Dashboard-first culture: if it's not measured, it doesn't exist"],
  },
  {
    principle: "Own the Marketplace", icon: Crown, color: "text-chart-4",
    description: "Everyone owns a piece of the marketplace. Engineers talk to agents. Marketers analyze data. No silos, no handoffs.",
    practices: ["Engineers join agent onboarding calls monthly", "Marketing team reviews engineering metrics weekly", "Cross-functional war rooms for city launches", "Everyone does customer support rotation (4 hours/month)"],
  },
  {
    principle: "Think National, Execute Local", icon: Building, color: "text-chart-3",
    description: "We build for 15 cities but execute one city at a time. National vision with local market depth.",
    practices: ["City launch playbooks standardized but locally adapted", "Team members assigned city ownership even if remote", "Local market intelligence required for every strategic decision", "Celebrate city-level wins publicly — each city is a startup within the startup"],
  },
];

// ── Org Chart Phases ──

const orgPhases = [
  { phase: "Month 1-3 (6 people)", color: "text-primary", bg: "bg-primary/10", departments: [
    { dept: "Founder/CEO", roles: ["Product Vision", "Strategy", "Fundraising"] },
    { dept: "Growth (2)", roles: ["Head of Growth", "Content & Social Lead"] },
    { dept: "Engineering (1)", roles: ["Full-Stack Engineer"] },
    { dept: "Operations (1)", roles: ["Agent Success Manager"] },
    { dept: "Intelligence (1)", roles: ["Data & Analytics Analyst"] },
  ]},
  { phase: "Month 4-6 (10 people)", color: "text-chart-1", bg: "bg-chart-1/10", departments: [
    { dept: "Founder/CEO", roles: ["Strategy", "Fundraising", "Key Partnerships"] },
    { dept: "Growth (3)", roles: ["Head of Growth", "Content Lead", "Performance Marketing"] },
    { dept: "Revenue (1)", roles: ["Head of Sales & Partnerships"] },
    { dept: "Engineering (2)", roles: ["Full-Stack Engineer", "Full-Stack #2"] },
    { dept: "Operations (2)", roles: ["Agent Success Manager", "City Expansion Lead"] },
    { dept: "Community (1)", roles: ["Community & Investor Relations"] },
  ]},
  { phase: "Month 7-12 (15-18 people)", color: "text-chart-3", bg: "bg-chart-3/10", departments: [
    { dept: "Founder/CEO", roles: ["Vision", "Board", "National Partnerships"] },
    { dept: "Growth (4)", roles: ["Head of Growth", "Content Lead", "Performance Marketing", "SEO Specialist"] },
    { dept: "Revenue (2)", roles: ["Head of Sales", "Partnership Manager"] },
    { dept: "Engineering (5)", roles: ["Head of AI/ML", "Senior Frontend", "Backend/Infra", "Full-Stack #1", "Full-Stack #2"] },
    { dept: "Design (1)", roles: ["Product Designer"] },
    { dept: "Operations (2)", roles: ["Agent Success", "City Expansion Lead"] },
    { dept: "Community (1)", roles: ["Community Manager"] },
  ]},
];

// ── Components ──

function RoleCard({ role }: { role: HiringRole }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = role.icon;
  const priorityColors = { Critical: "text-destructive bg-destructive/10", High: "text-chart-1 bg-chart-1/10", Medium: "text-chart-4 bg-chart-4/10" };

  return (
    <Card className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
      <CardHeader className="p-2.5 pb-1.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", role.color)} />
            <div>
              <span className="text-[10px] font-bold text-foreground">{role.title}</span>
              <span className="text-[8px] text-muted-foreground ml-1.5">{role.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={cn("text-[6px] h-3 px-1", priorityColors[role.priority])}>{role.priority}</Badge>
            <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground"><Timer className="h-2 w-2 mr-0.5" />{role.timing}</Badge>
            <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground"><DollarSign className="h-2 w-2 mr-0.5" />{role.salaryRange}</Badge>
            {expanded ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-2.5 pt-0 space-y-2 border-t border-border/10">
          <div className="p-2 rounded-lg bg-chart-1/5 border border-chart-1/20">
            <span className="text-[7px] text-chart-1 font-bold block mb-0.5">💰 ROI Rationale</span>
            <p className="text-[8px] text-muted-foreground">{role.roiRationale}</p>
          </div>
          <div>
            <span className="text-[8px] font-bold text-foreground block mb-1">Responsibilities</span>
            {role.responsibilities.map((r, i) => (
              <div key={i} className="flex items-start gap-1 mb-0.5"><CheckCircle2 className={cn("h-2 w-2 shrink-0 mt-0.5", role.color)} /><span className="text-[7px] text-muted-foreground">{r}</span></div>
            ))}
          </div>
          <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-[7px] text-primary font-bold block mb-0.5">👤 Ideal Profile</span>
            <p className="text-[8px] text-muted-foreground">{role.idealProfile}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {role.kpis.map((kpi) => (
              <Badge key={kpi} variant="outline" className="text-[6px] h-3.5 px-1 text-chart-3"><Target className="h-2 w-2 mr-0.5" />{kpi}</Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Dashboard ──

const HiringRoadmapDashboard = React.memo(function HiringRoadmapDashboard() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-3/40 via-primary/30 to-chart-1/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Hiring & Team Scaling Roadmap
              </CardTitle>
              <CardDescription className="text-[11px]">
                From founder solo → 18-person team across 3 phases — every hire justified by ROI and marketplace traction impact
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-3 bg-chart-3/10 border-chart-3/30">
              👥 Team Building
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: "Total Roles", value: "13", icon: Briefcase, color: "text-primary" },
              { label: "Phase 1", value: "5 hires", icon: Zap, color: "text-chart-1" },
              { label: "Phase 2", value: "4 hires", icon: TrendingUp, color: "text-chart-3" },
              { label: "Phase 3", value: "4 hires", icon: Brain, color: "text-chart-4" },
              { label: "Month 12 Team", value: "15-18", icon: Users, color: "text-primary" },
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

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="roles" className="text-[10px] h-6 px-3">Hiring Phases</TabsTrigger>
          <TabsTrigger value="priority" className="text-[10px] h-6 px-3">Priority Matrix</TabsTrigger>
          <TabsTrigger value="org" className="text-[10px] h-6 px-3">Org Structure</TabsTrigger>
          <TabsTrigger value="culture" className="text-[10px] h-6 px-3">Culture</TabsTrigger>
        </TabsList>

        {/* Roles by Phase */}
        <TabsContent value="roles" className="mt-3 space-y-4">
          {[
            { title: "Phase 1 — Core Execution Team", subtitle: "Month 1-3 · Supply + Traffic Foundation", roles: phase1Roles, color: "text-primary", bg: "bg-primary/10" },
            { title: "Phase 2 — Growth Acceleration Team", subtitle: "Month 4-6 · Revenue + Scale", roles: phase2Roles, color: "text-chart-1", bg: "bg-chart-1/10" },
            { title: "Phase 3 — Product & Intelligence Expansion", subtitle: "Month 7-12 · AI Moat + UX Excellence", roles: phase3Roles, color: "text-chart-3", bg: "bg-chart-3/10" },
          ].map((phase) => (
            <div key={phase.title}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-[9px] font-bold h-5 px-2", phase.color, phase.bg)}>{phase.title}</Badge>
                <span className="text-[8px] text-muted-foreground">{phase.subtitle}</span>
              </div>
              <div className="space-y-1.5">
                {phase.roles.map((role) => <RoleCard key={role.title} role={role} />)}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Priority Matrix */}
        <TabsContent value="priority" className="mt-3">
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> Hiring Priority by Stage
              </CardTitle>
              <CardDescription className="text-[9px]">Each stage's key hire delivers the highest ROI for that growth phase</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {priorityMatrix.map((stage, i) => (
                <div key={stage.stage} className="p-2.5 rounded-lg border border-border/10 bg-muted/5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold bg-primary/10 text-primary">{i + 1}</div>
                      <span className="text-[10px] font-bold text-foreground">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground"><Users className="h-2 w-2 mr-0.5" />{stage.headcount}</Badge>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-1">{stage.keyHire}</Badge>
                    </div>
                  </div>
                  <div className="ml-8">
                    <span className="text-[8px] text-primary font-bold">Focus: {stage.focus}</span>
                    <p className="text-[7px] text-muted-foreground mt-0.5">{stage.rationale}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Salary Budget */}
          <Card className="rounded-xl border-border/30 bg-card/80 mt-3">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-chart-1" /> Annual Salary Budget Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { phase: "Phase 1 (5 hires)", monthly: "Rp 82-138M", annual: "Rp 984M-1.66B", color: "text-primary" },
                  { phase: "Phase 2 (+4 hires)", monthly: "Rp 146-241M", annual: "Rp 1.75B-2.89B", color: "text-chart-1" },
                  { phase: "Phase 3 (+4 hires)", monthly: "Rp 240-396M", annual: "Rp 2.88B-4.75B", color: "text-chart-3" },
                ].map((b) => (
                  <div key={b.phase} className="p-2 rounded-lg border border-border/10 bg-muted/5 text-center">
                    <span className="text-[7px] text-muted-foreground block">{b.phase}</span>
                    <span className={cn("text-[10px] font-bold block", b.color)}>{b.monthly}/mo</span>
                    <span className="text-[7px] text-muted-foreground">{b.annual}/year</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Org Structure */}
        <TabsContent value="org" className="mt-3 space-y-3">
          {orgPhases.map((phase) => (
            <Card key={phase.phase} className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
              <div className={cn("h-1", phase.bg.replace("/10", "/30"))} />
              <CardHeader className="p-3 pb-2">
                <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {phase.departments.map((dept) => (
                    <div key={dept.dept} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                      <span className={cn("text-[9px] font-bold block mb-1", phase.color)}>{dept.dept}</span>
                      {dept.roles.map((r) => (
                        <div key={r} className="flex items-start gap-1"><CheckCircle2 className="h-2 w-2 text-muted-foreground shrink-0 mt-0.5" /><span className="text-[7px] text-muted-foreground">{r}</span></div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Culture */}
        <TabsContent value="culture" className="mt-3 space-y-2">
          {culturePrinciples.map((cp) => {
            const Icon = cp.icon;
            return (
              <Card key={cp.principle} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", cp.color)} /> {cp.principle}
                  </CardTitle>
                  <CardDescription className="text-[9px] ml-6">{cp.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {cp.practices.map((p, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", cp.color)} />
                      <span className="text-[8px] text-muted-foreground">{p}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default HiringRoadmapDashboard;
