import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building, CheckCircle2, ChevronRight, ChevronDown, Target,
  Users, DollarSign, Timer, Star, Crown, Shield,
  BarChart3, Rocket, ArrowRight, Gauge, Layers,
  Phone, MapPin, ClipboardCheck, TrendingUp, Handshake,
  Package, Eye, FileCheck, UserPlus, CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Role Overview ──

const roleOverview = {
  title: "Property Supply Manager",
  department: "Supply & Marketplace Operations",
  reportsTo: "Founder / CEO (→ Head of Supply when hired)",
  location: "Jakarta-based — field execution across Phase 1 cities",
  salary: "Rp 12-22M/month + performance bonus (up to 30% of base tied to supply KPIs)",
  equity: "0.15-0.4% ESOP (4-year vest, 1-year cliff)",
  startDate: "Immediate — supply is the #1 constraint on marketplace growth",
  missionStatement:
    "Build and grow the platform's property listing inventory city by city — onboarding real estate agents, sourcing developer project listings, and ensuring listing quality standards that drive buyer engagement and marketplace liquidity.",
};

// ── Core Responsibilities ──

interface ResponsibilityArea {
  area: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  weight: string;
  tasks: { task: string; impact: string }[];
}

const responsibilities: ResponsibilityArea[] = [
  {
    area: "Agent Onboarding & Network Expansion",
    icon: UserPlus,
    color: "text-primary",
    bg: "bg-primary/10",
    weight: "35%",
    tasks: [
      {
        task: "Identify, outreach, and onboard independent agents and small agency offices in Phase 1 cities — target 20+ new agents/month",
        impact: "Each active agent contributes 8-15 listings — agent volume directly determines listing supply velocity",
      },
      {
        task: "Build field outreach process: attend property expos, visit agency offices, run agent WhatsApp groups per city",
        impact: "Face-to-face trust-building converts 3x more agents than cold outreach alone in Indonesian market",
      },
      {
        task: "Deliver agent onboarding: platform training, listing upload walkthrough, feature demo, and first-listing support",
        impact: "Smooth onboarding reduces agent drop-off from 60% to under 20% — activation is where most supply strategies fail",
      },
      {
        task: "Maintain agent relationship through weekly check-ins, performance sharing, and lead delivery visibility",
        impact: "Retained agents list 5x more properties over 6 months than one-time uploaders",
      },
      {
        task: "Track agent activation funnel: registered → first listing → active (5+ listings) → power agent (20+ listings)",
        impact: "Funnel visibility identifies bottlenecks — fixing activation stage doubles effective supply",
      },
    ],
  },
  {
    area: "Developer Project Sourcing",
    icon: Building,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    weight: "25%",
    tasks: [
      {
        task: "Source and onboard developer primary listings: new apartment projects, housing clusters, commercial developments",
        impact: "Developer projects provide 50-500 units per deal — highest volume supply source per relationship",
      },
      {
        task: "Build developer outreach pipeline: identify active projects per city, contact marketing teams, pitch platform value",
        impact: "Systematic pipeline prevents feast-or-famine supply — ensures steady flow of new project listings",
      },
      {
        task: "Negotiate listing terms: exclusive vs non-exclusive, featured placement, data sharing, co-marketing opportunities",
        impact: "Exclusive listings drive 3x more buyer engagement and differentiate platform from competitors",
      },
      {
        task: "Coordinate developer content: project descriptions, unit layouts, pricing, amenities, progress updates",
        impact: "Complete, accurate developer content increases listing inquiry rate by 40%",
      },
    ],
  },
  {
    area: "Listing Quality & Standards",
    icon: ClipboardCheck,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    weight: "20%",
    tasks: [
      {
        task: "Define and enforce listing quality standards: minimum photo count (8+), complete descriptions, accurate pricing, verified location data",
        impact: "High-quality listings get 4x more views and 6x more inquiries than incomplete listings",
      },
      {
        task: "Review incoming listings for accuracy, completeness, and policy compliance — flag and fix issues within 24 hours",
        impact: "Quality gate prevents spam/fake listings that destroy marketplace trust",
      },
      {
        task: "Build listing quality scoring system: completeness %, photo quality, description length, price accuracy, freshness",
        impact: "Quality scores enable data-driven improvement — agents with scores >80 get 3x more leads",
      },
      {
        task: "Coordinate listing photography support: connect agents with photo/video services, provide DIY guidelines",
        impact: "Professional photos increase listing views by 60% — photography support removes the #1 quality barrier",
      },
    ],
  },
  {
    area: "Marketplace Liquidity Monitoring",
    icon: BarChart3,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    weight: "12%",
    tasks: [
      {
        task: "Monitor supply-demand balance per city: listings per property type, price range coverage, geographic distribution",
        impact: "Supply gaps cause buyer drop-off — if buyers can't find what they want, they leave permanently",
      },
      {
        task: "Track listing freshness: percentage of active vs stale (>60 days) vs sold listings — maintain <20% stale rate",
        impact: "Stale listings erode trust — buyers who see outdated listings assume the platform is abandoned",
      },
      {
        task: "Identify supply gaps and prioritize sourcing: which property types, price ranges, and locations have demand but no supply",
        impact: "Filling verified demand gaps produces immediate inquiry volume — most efficient supply investment",
      },
    ],
  },
  {
    area: "Operational Process & Reporting",
    icon: FileCheck,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    weight: "8%",
    tasks: [
      {
        task: "Build and document SOPs for agent outreach, developer sourcing, listing QA, and agent success workflows",
        impact: "Documented processes enable team scaling — next supply hire can execute from Day 1",
      },
      {
        task: "Produce weekly supply reports: new listings, agent activations, quality metrics, city coverage, and pipeline status",
        impact: "Weekly reporting keeps supply growth visible and accountable to leadership",
      },
      {
        task: "Coordinate with growth team on supply-side content: agent testimonials, success stories, platform benefits for agents",
        impact: "Agent-facing content accelerates outreach — warm leads convert 5x faster than cold contacts",
      },
    ],
  },
];

// ── Supply Growth Targets ──

interface SupplyTarget {
  metric: string;
  icon: React.ElementType;
  weekly: string;
  monthly: string;
  quarterly: string;
  color: string;
}

const supplyTargets: SupplyTarget[] = [
  { metric: "New Listings Onboarded", icon: Package, weekly: "50-75", monthly: "250-350", quarterly: "800-1,000", color: "text-primary" },
  { metric: "New Agents Activated", icon: UserPlus, weekly: "5-8", monthly: "20-30", quarterly: "70-100", color: "text-chart-1" },
  { metric: "Developer Projects Secured", icon: Building, weekly: "1-2 meetings", monthly: "2-3 signed", quarterly: "8-10 active", color: "text-chart-3" },
  { metric: "Agent Retention Rate", icon: Users, weekly: "Check-ins", monthly: ">70%", quarterly: ">75%", color: "text-chart-4" },
  { metric: "Listing Quality Score (avg)", icon: Star, weekly: "Review cycle", monthly: ">75/100", quarterly: ">80/100", color: "text-primary" },
  { metric: "Stale Listing Rate", icon: Timer, weekly: "Audit", monthly: "<25%", quarterly: "<15%", color: "text-chart-1" },
];

// ── KPIs ──

interface KPICategory {
  category: string;
  icon: React.ElementType;
  color: string;
  metrics: { metric: string; month3: string; month6: string; month12: string; weight: string }[];
}

const kpiCategories: KPICategory[] = [
  {
    category: "Listing Volume",
    icon: Package,
    color: "text-primary",
    metrics: [
      { metric: "Total Active Listings", month3: "1,000", month6: "3,500", month12: "10,000", weight: "25%" },
      { metric: "New Listings / Month", month3: "300", month6: "600", month12: "1,200", weight: "10%" },
      { metric: "Cities with 100+ Listings", month3: "3", month6: "8", month12: "15", weight: "5%" },
    ],
  },
  {
    category: "Agent Network",
    icon: Users,
    color: "text-chart-1",
    metrics: [
      { metric: "Total Registered Agents", month3: "80", month6: "200", month12: "500", weight: "10%" },
      { metric: "Active Agents (5+ listings)", month3: "40", month6: "120", month12: "300", weight: "15%" },
      { metric: "Power Agents (20+ listings)", month3: "8", month6: "30", month12: "80", weight: "5%" },
    ],
  },
  {
    category: "Quality & Trust",
    icon: Star,
    color: "text-chart-3",
    metrics: [
      { metric: "Avg Listing Quality Score", month3: "70/100", month6: "78/100", month12: "85/100", weight: "10%" },
      { metric: "Listings with 8+ Photos", month3: "50%", month6: "70%", month12: "85%", weight: "5%" },
      { metric: "Stale Listing Rate", month3: "<30%", month6: "<20%", month12: "<12%", weight: "5%" },
    ],
  },
  {
    category: "Marketplace Impact",
    icon: TrendingUp,
    color: "text-chart-4",
    metrics: [
      { metric: "Inquiry Rate per Listing", month3: "3/mo", month6: "5/mo", month12: "8/mo", weight: "5%" },
      { metric: "Supply Coverage (demand match)", month3: "40%", month6: "65%", month12: "85%", weight: "5%" },
      { metric: "Developer Project Listings", month3: "500", month6: "1,500", month12: "4,000", weight: "5%" },
    ],
  },
];

// ── Candidate Profile ──

const candidateProfile = {
  mustHave: [
    { skill: "2-5 years in real estate operations, property marketplace, or agent-facing B2B role in Indonesia", reason: "Understanding Indonesian real estate market dynamics, agent psychology, and developer ecosystem is non-negotiable" },
    { skill: "Strong existing network or ability to quickly build relationships with agents and property developers", reason: "Supply acquisition is a relationship business — cold starts without network credibility take 3x longer" },
    { skill: "Field execution capability: comfortable with daily travel, agent office visits, property expos, and face-to-face meetings", reason: "Indonesian property market is built on trust and tatap muka — remote-only outreach fails for supply acquisition" },
    { skill: "Operational rigor: ability to track pipelines, manage CRM data, follow up systematically, and report accurately", reason: "Supply without systems creates chaos — scaling requires process discipline from Day 1" },
    { skill: "Fluent Bahasa Indonesia (native) — English proficiency is a plus but not required", reason: "All agent and developer communication is in Bahasa — language fluency directly determines relationship quality" },
  ],
  niceToHave: [
    "Experience at a property portal or marketplace (Rumah123, OLX Property, 99.co, Lamudi)",
    "Background as a property agent or developer sales — understands listing workflow from the other side",
    "Familiarity with CRM tools (HubSpot, Salesforce, or similar pipeline management)",
    "Experience managing a team of 2-4 field reps or BDRs",
    "Motorcycle/car license and willingness to travel across cities for field operations",
  ],
  redFlags: [
    "Purely desk-based background — this role requires 40-60% field time in the first 6 months",
    "No real estate market understanding — learning curve is too expensive for a critical supply hire",
    "Cannot provide specific numbers from previous roles (agents onboarded, listings managed, deals closed)",
    "Uncomfortable with rejection and cold outreach — agent sourcing requires high-volume relationship building",
  ],
  interviewProcess: [
    { stage: "Resume + Market Knowledge Screen", duration: "1 day", evaluator: "Founder", focus: "Real estate experience, agent network depth, field execution track record" },
    { stage: "30-min Culture & Hustle Fit Call", duration: "30 min", evaluator: "Founder", focus: "Startup mindset, field willingness, relationship-building approach" },
    { stage: "Supply Strategy Case Study", duration: "Take-home (48 hrs)", evaluator: "Founder", focus: "Design 90-day supply plan for launching in a new city with zero listings" },
    { stage: "60-min Deep Dive + Role Play", duration: "60 min", evaluator: "Founder + Ops Lead", focus: "Walk through case study, role-play agent pitch, discuss objection handling" },
    { stage: "Field Day (paid)", duration: "1 day", evaluator: "Founder", focus: "Accompany on 3 agent visits — observe relationship skills, pitch quality, and energy" },
    { stage: "Reference Check + Offer", duration: "2-3 days", evaluator: "Founder", focus: "Verify agent network claims and operational discipline from previous roles" },
  ],
};

// ── 90-Day Plan ──

const ninetyDayPlan = [
  {
    period: "Day 1-30",
    title: "Learn, Map & First Supply",
    color: "text-primary",
    bg: "bg-primary/10",
    objectives: [
      { objective: "Complete market mapping: identify top 50 agents and 10 developer projects in Phase 1 city", measurable: "Agent database with 50+ contacts, developer pipeline with 10+ projects by Day 10" },
      { objective: "Onboard first 20 agents with 100+ listings live on platform", measurable: "100 listings live, first agent referrals happening organically" },
      { objective: "Define and implement listing quality standards: photo requirements, description templates, pricing guidelines", measurable: "Quality checklist documented and enforced on all new listings" },
      { objective: "Establish agent outreach workflow: CRM setup, follow-up cadences, WhatsApp group per city launched", measurable: "CRM active with pipeline tracking, city WhatsApp group with 30+ agents" },
      { objective: "Close first developer partnership: 1 project with 50+ unit listings", measurable: "Developer project live with complete unit data, photos, and pricing" },
    ],
    deliverables: ["50-agent database", "100 listings live", "Quality standards doc", "CRM + WhatsApp groups", "1 developer project"],
  },
  {
    period: "Day 31-60",
    title: "Scale & Systematize",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    objectives: [
      { objective: "Scale to 50 active agents and 500+ listings across Phase 1 city coverage", measurable: "500 listings live, geographic coverage of 60%+ in target city zones" },
      { objective: "Secure 2 additional developer project partnerships with exclusive or featured listing terms", measurable: "2 developer deals signed, 150+ units listed from projects" },
      { objective: "Achieve 70+ average listing quality score across all listings", measurable: "Quality dashboard showing avg score, percentage of listings meeting 8+ photo standard" },
      { objective: "Launch agent activation program: training sessions, listing competition, referral incentive", measurable: "Agent activation rate >50%, at least 5 agents reaching 'power agent' status (20+ listings)" },
    ],
    deliverables: ["500+ listings", "3 developer projects", "Quality score 70+", "Agent activation program live", "Field ops SOP v1"],
  },
  {
    period: "Day 61-90",
    title: "Prove & Expand",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    objectives: [
      { objective: "Reach 1,000 active listings with <25% stale rate", measurable: "1,000 listings live and fresh, stale listings identified and refreshed weekly" },
      { objective: "Build agent network of 80+ registered, 40+ active agents across 3 city zones", measurable: "Agent funnel metrics: registered → active → power agent conversion rates tracked" },
      { objective: "Demonstrate supply impact on platform: listing views, inquiry volume, and buyer engagement growth correlated with supply additions", measurable: "Weekly report showing supply-demand correlation metrics" },
      { objective: "Document all supply ops playbooks for second city expansion: outreach scripts, agent training materials, QA process, developer pitch deck", measurable: "Playbook complete, ready for City 2 launch with new supply hire" },
    ],
    deliverables: ["1,000 listings", "80+ agents", "Supply impact report", "Expansion playbook", "90-day performance review"],
  },
];

// ── Career Path ──

const careerPath = [
  { level: "Property Supply Manager", timeline: "Month 0-12", description: "Hands-on builder — source agents, close developer deals, build supply engine from scratch across Phase 1 cities", color: "text-primary" },
  { level: "Senior Supply Manager", timeline: "Month 12-18", description: "Expanded scope — manage 2-3 city supply reps, own national listing targets, build agent success program", color: "text-chart-1" },
  { level: "Head of Supply & Marketplace Ops", timeline: "Month 18-30", description: "Leadership — own all supply acquisition, agent relations, listing quality, and marketplace liquidity. Team of 6-10", color: "text-chart-3" },
  { level: "VP Marketplace / COO", timeline: "Year 3+", description: "Executive — own full marketplace operations, supply-demand balance, agent ecosystem, and operational excellence. Board-level reporting", color: "text-chart-4" },
];

// ── Operational Workflows ──

const workflows = [
  {
    name: "Agent Outreach Process",
    icon: Phone,
    color: "text-primary",
    steps: [
      "Identify target agents via property portals, expos, referrals, and social media",
      "Initial WhatsApp/phone intro — share platform value proposition and agent success data",
      "Schedule in-person meeting or video demo — show platform features and listing process",
      "Guide first listing upload — hands-on support until agent is confident",
      "Add to city WhatsApp group — ongoing community support and updates",
      "Weekly check-in for first month — track activation, resolve issues, share lead data",
    ],
  },
  {
    name: "Listing Upload Support",
    icon: Package,
    color: "text-chart-1",
    steps: [
      "Agent submits listing (self-serve or assisted via WhatsApp)",
      "QA review within 24 hours — check photos, description, pricing, location accuracy",
      "Quality feedback sent to agent with specific improvement suggestions",
      "Listing approved and published — or returned for fixes with clear guidance",
      "Monthly quality report shared with each agent — scores, improvement tips, top listing examples",
    ],
  },
  {
    name: "Marketplace Liquidity Monitor",
    icon: BarChart3,
    color: "text-chart-3",
    steps: [
      "Weekly dashboard review: listings per city, property type, price range, zone coverage",
      "Identify demand-supply gaps: high-search locations or types with insufficient listings",
      "Prioritize supply sourcing to fill verified demand gaps — highest ROI supply investment",
      "Track listing freshness: flag listings >45 days without update for agent follow-up",
      "Monthly supply health report to founder: coverage, gaps, agent pipeline, quality trends",
    ],
  },
];

// ── Components ──

function ResponsibilityCard({ area }: { area: ResponsibilityArea }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = area.icon;
  return (
    <Card className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", area.bg.replace("/10", "/30"))} />
      <CardHeader className="p-2.5 pb-1.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <Icon className={cn("h-4 w-4", area.color)} /> {area.area}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1 font-bold", area.color, area.bg)}>{area.weight}</Badge>
            {expanded ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-2.5 pt-0 space-y-1.5">
          {area.tasks.map((t, i) => (
            <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", area.color)} />
                <div>
                  <span className="text-[9px] font-bold text-foreground">{t.task}</span>
                  <p className="text-[7px] text-muted-foreground mt-0.5 italic">Impact: {t.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Dashboard ──

const PropertySupplyManagerRole = React.memo(function PropertySupplyManagerRole() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Property Supply Manager — Role Blueprint
              </CardTitle>
              <CardDescription className="text-[11px]">
                Full role definition: responsibilities, supply targets, KPIs, workflows, candidate profile, 90-day plan, and career path
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              🏗️ Supply Hire
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-3">
            <p className="text-[9px] text-muted-foreground italic">{roleOverview.missionStatement}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Reports To", value: "Founder / CEO", icon: Crown },
              { label: "Location", value: "Jakarta + Field", icon: MapPin },
              { label: "Salary", value: "Rp 12-22M/mo", icon: DollarSign },
              { label: "Equity", value: "0.15-0.4% ESOP", icon: Star },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-2 rounded-xl border border-border/20 bg-muted/5 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <span className="text-[7px] text-muted-foreground block">{m.label}</span>
                    <span className="text-[10px] font-bold text-foreground">{m.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="responsibilities" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="responsibilities" className="text-[10px] h-6 px-2">Responsibilities</TabsTrigger>
          <TabsTrigger value="targets" className="text-[10px] h-6 px-2">Supply Targets</TabsTrigger>
          <TabsTrigger value="kpis" className="text-[10px] h-6 px-2">KPIs</TabsTrigger>
          <TabsTrigger value="workflows" className="text-[10px] h-6 px-2">Workflows</TabsTrigger>
          <TabsTrigger value="profile" className="text-[10px] h-6 px-2">Candidate</TabsTrigger>
          <TabsTrigger value="90day" className="text-[10px] h-6 px-2">90-Day Plan</TabsTrigger>
          <TabsTrigger value="career" className="text-[10px] h-6 px-2">Career Path</TabsTrigger>
        </TabsList>

        <TabsContent value="responsibilities" className="mt-3 space-y-2">
          {responsibilities.map((area) => (
            <ResponsibilityCard key={area.area} area={area} />
          ))}
        </TabsContent>

        <TabsContent value="targets" className="mt-3">
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Weekly → Monthly → Quarterly Supply Growth Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {supplyTargets.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.metric} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={cn("h-3 w-3", t.color)} />
                      <span className="text-[9px] font-bold text-foreground">{t.metric}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: "Weekly", value: t.weekly },
                        { label: "Monthly", value: t.monthly },
                        { label: "Quarterly", value: t.quarterly },
                      ].map((p) => (
                        <div key={p.label} className="p-1 rounded text-center border border-border/10 bg-muted/5">
                          <span className="text-[6px] text-muted-foreground block">{p.label}</span>
                          <span className={cn("text-[8px] font-bold", t.color)}>{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="mt-3 space-y-2">
          {kpiCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card key={cat.category} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", cat.color)} /> {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {cat.metrics.map((m) => (
                    <div key={m.metric} className="p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-foreground">{m.metric}</span>
                        <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{m.weight}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[{ label: "Month 3", value: m.month3 }, { label: "Month 6", value: m.month6 }, { label: "Month 12", value: m.month12 }].map((t) => (
                          <div key={t.label} className="p-0.5 rounded text-center border border-border/10 bg-muted/5">
                            <span className="text-[6px] text-muted-foreground block">{t.label}</span>
                            <span className={cn("text-[8px] font-bold", cat.color)}>{t.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="workflows" className="mt-3 space-y-2">
          {workflows.map((wf) => {
            const Icon = wf.icon;
            return (
              <Card key={wf.name} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", wf.color)} /> {wf.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {wf.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <div className={cn("w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-bold shrink-0", `bg-${wf.color.replace("text-", "")}/10`, wf.color)}>
                        {i + 1}
                      </div>
                      <span className="text-[8px] text-foreground">{step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="profile" className="mt-3 space-y-3">
          <Card className="rounded-xl border-chart-1/20 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-chart-1"><CheckCircle2 className="h-4 w-4" /> Must-Have Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {candidateProfile.mustHave.map((mh, i) => (
                <div key={i} className="p-2 rounded-lg border border-chart-1/10 bg-chart-1/5">
                  <span className="text-[9px] font-bold text-foreground">{mh.skill}</span>
                  <p className="text-[7px] text-muted-foreground mt-0.5 italic">Why: {mh.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2"><CardTitle className="text-[11px] font-bold flex items-center gap-2 text-primary"><Star className="h-4 w-4" /> Nice-to-Have</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.niceToHave.map((nh, i) => (
                <div key={i} className="flex items-start gap-1.5"><Star className="h-2 w-2 text-primary shrink-0 mt-0.5" /><span className="text-[8px] text-muted-foreground">{nh}</span></div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-destructive/20 bg-card/80">
            <CardHeader className="p-3 pb-2"><CardTitle className="text-[11px] font-bold flex items-center gap-2 text-destructive"><Shield className="h-4 w-4" /> Red Flags</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.redFlags.map((rf, i) => (
                <div key={i} className="flex items-start gap-1.5"><Shield className="h-2 w-2 text-destructive shrink-0 mt-0.5" /><span className="text-[8px] text-muted-foreground">{rf}</span></div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2"><CardTitle className="text-[11px] font-bold flex items-center gap-2 text-chart-3"><Layers className="h-4 w-4" /> Interview Process (10-14 days)</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.interviewProcess.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg border border-border/10 bg-muted/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold bg-chart-3/10 text-chart-3">{i + 1}</div>
                    <div>
                      <span className="text-[9px] font-bold text-foreground">{step.stage}</span>
                      <span className="text-[7px] text-muted-foreground block">{step.focus}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground"><Timer className="h-2 w-2 mr-0.5" />{step.duration}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="90day" className="mt-3 space-y-3">
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {ninetyDayPlan.map((p, i) => (
              <React.Fragment key={p.period}>
                <div className={cn("p-1.5 rounded-lg border text-center min-w-[90px]", p.bg)}>
                  <span className={cn("text-[8px] font-bold block", p.color)}>{p.period}</span>
                  <span className="text-[6px] text-muted-foreground">{p.title}</span>
                </div>
                {i < ninetyDayPlan.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          {ninetyDayPlan.map((period) => (
            <Card key={period.period} className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
              <div className={cn("h-1", period.bg.replace("/10", "/30"))} />
              <CardHeader className="p-3 pb-2">
                <CardTitle className={cn("text-[11px] font-bold", period.color)}>{period.period}: {period.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {period.objectives.map((obj, i) => (
                  <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                    <div className="flex items-start gap-1.5">
                      <Target className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", period.color)} />
                      <div>
                        <span className="text-[9px] font-bold text-foreground">{obj.objective}</span>
                        <p className="text-[7px] text-muted-foreground mt-0.5">📏 {obj.measurable}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1">
                  {period.deliverables.map((d) => (
                    <Badge key={d} variant="outline" className={cn("text-[7px] h-4 px-1.5", period.color)}>{d}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="career" className="mt-3">
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Career Growth Trajectory</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {careerPath.map((level, i) => (
                <div key={level.level} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2", level.color)}>{i + 1}</div>
                    {i < careerPath.length - 1 && <div className="w-0.5 h-8 bg-border/30" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold", level.color)}>{level.level}</span>
                      <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{level.timeline}</Badge>
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{level.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default PropertySupplyManagerRole;
