import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Handshake, CheckCircle2, ChevronRight, ChevronDown, Target,
  TrendingUp, Users, Briefcase, Building, DollarSign, Timer,
  Star, Zap, Crown, Shield, Award, BarChart3, Rocket, Flag,
  Calendar, ArrowRight, Gauge, Heart, Layers, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Role Overview ──

const roleOverview = {
  title: "Partnership Manager",
  department: "Revenue & Business Development",
  reportsTo: "Founder / CEO (→ Head of Sales & Partnerships when hired)",
  location: "Jakarta (hybrid) — travel 30-40% across target cities",
  salary: "Rp 18-30M/month + performance bonus (up to 30% of base)",
  equity: "0.3-0.8% ESOP (4-year vest, 1-year cliff)",
  startDate: "Immediate — high urgency hire",
  missionStatement: "Build and scale the partnership ecosystem that fuels platform supply, credibility, and revenue — turning developer relationships, agency networks, and banking integrations into a self-reinforcing growth flywheel.",
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
    area: "Developer Partnerships", icon: Building, color: "text-chart-1", bg: "bg-chart-1/10", weight: "40%",
    tasks: [
      { task: "Identify and approach top property developers in Phase 1-2 cities (Jakarta, Surabaya, Bandung, Bali, Semarang, Medan)", impact: "Each developer partnership brings 50-200 listings — the fastest supply growth channel" },
      { task: "Negotiate bulk listing agreements with favorable terms (featured placement, data sharing, co-marketing)", impact: "Reduces listing CAC by 80% vs individual agent acquisition" },
      { task: "Structure developer marketing packages (Project Spotlight, Virtual Launch Events, AI-powered buyer matching)", impact: "Revenue generation: Rp 5-20M per developer per month" },
      { task: "Manage ongoing developer relationships and quarterly business reviews", impact: "Developer retention drives sustained supply and reduces churn risk" },
      { task: "Coordinate with product team on developer-facing tools (bulk upload, analytics dashboard, lead distribution)", impact: "Better tools = stickier partnerships = higher switching costs for competitors" },
    ],
  },
  {
    area: "Agency Network Growth", icon: Users, color: "text-primary", bg: "bg-primary/10", weight: "30%",
    tasks: [
      { task: "Build relationships with AREBI chapters and major agency networks across target cities", impact: "Association endorsement accelerates agent trust and onboarding velocity" },
      { task: "Design and execute agency-level partnership programs (bulk onboarding, team pricing, training)", impact: "Agency deals onboard 10-50 agents per agreement vs 1-by-1 individual outreach" },
      { task: "Create agent referral incentive structures for cross-network growth", impact: "Agent-to-agent referrals reduce CAC to near-zero for subsequent hires" },
      { task: "Coordinate with Agent Success Manager on partnership agent retention and activation", impact: "Partnership agents have higher expectations — proactive support prevents churn" },
    ],
  },
  {
    area: "Banking & Institutional Partnerships", icon: Shield, color: "text-chart-3", bg: "bg-chart-3/10", weight: "20%",
    tasks: [
      { task: "Initiate mortgage referral partnerships with top 5 national banks (BCA, Mandiri, BNI, BTN, CIMB Niaga)", impact: "Mortgage referrals: Rp 500K-2M commission per successful lead — high-margin revenue" },
      { task: "Explore data licensing partnerships with research institutions and media outlets", impact: "ASTRA Price Index licensing generates B2B revenue and builds brand authority" },
      { task: "Build relationships with government housing agencies (Kementerian PUPR, BP Tapera)", impact: "Government alignment enables subsidized housing program listings and policy credibility" },
      { task: "Negotiate insurance and property services integration partnerships", impact: "Ecosystem services increase platform stickiness and revenue per transaction" },
    ],
  },
  {
    area: "Co-Marketing & Strategic Initiatives", icon: Rocket, color: "text-chart-4", bg: "bg-chart-4/10", weight: "10%",
    tasks: [
      { task: "Design co-marketing campaigns with developer partners (social media, events, property launches)", impact: "Shared marketing spend reduces CAC and increases reach for both parties" },
      { task: "Organize quarterly partner events (networking, market briefings, product previews)", impact: "Events strengthen relationships and create partnership expansion opportunities" },
      { task: "Manage partnership content pipeline (case studies, testimonials, success stories)", impact: "Social proof from named partners builds trust with prospective partners" },
    ],
  },
];

// ── KPIs ──

interface KPICategory {
  category: string;
  icon: React.ElementType;
  color: string;
  metrics: { metric: string; target: string; frequency: string; weight: string }[];
}

const kpiCategories: KPICategory[] = [
  {
    category: "Partnership Volume", icon: Handshake, color: "text-chart-1",
    metrics: [
      { metric: "New Developer Partnerships Signed", target: "3/month (Month 3+)", frequency: "Monthly", weight: "25%" },
      { metric: "New Agency Network Agreements", target: "2/month", frequency: "Monthly", weight: "15%" },
      { metric: "Banking/Institutional Partnerships", target: "1/quarter", frequency: "Quarterly", weight: "10%" },
      { metric: "Active Partner Retention Rate", target: "90%+", frequency: "Monthly", weight: "10%" },
    ],
  },
  {
    category: "Supply Impact", icon: Building, color: "text-primary",
    metrics: [
      { metric: "Listings Added via Partnerships", target: "500+/month by Month 3", frequency: "Monthly", weight: "15%" },
      { metric: "Agents Onboarded via Agency Deals", target: "30+/month", frequency: "Monthly", weight: "10%" },
      { metric: "Partner Listing Activation Rate", target: "80%+ within 7 days of onboarding", frequency: "Weekly", weight: "5%" },
    ],
  },
  {
    category: "Revenue Contribution", icon: DollarSign, color: "text-chart-3",
    metrics: [
      { metric: "Partnership Revenue (direct)", target: "Rp 150M/month by Month 6", frequency: "Monthly", weight: "15%" },
      { metric: "Mortgage Referral Revenue", target: "Rp 30M/month by Month 6", frequency: "Monthly", weight: "5%" },
      { metric: "Co-Marketing Cost Savings", target: "Rp 50M/quarter in shared spend", frequency: "Quarterly", weight: "5%" },
    ],
  },
  {
    category: "Pipeline Health", icon: Gauge, color: "text-chart-4",
    metrics: [
      { metric: "Pipeline Value (prospective partners)", target: "Rp 500M+ in quarterly value", frequency: "Weekly", weight: "5%" },
      { metric: "Outreach-to-Meeting Conversion", target: "25%+", frequency: "Monthly", weight: "5%" },
      { metric: "Meeting-to-Partnership Conversion", target: "40%+", frequency: "Monthly", weight: "5%" },
    ],
  },
];

// ── Candidate Profile ──

const candidateProfile = {
  mustHave: [
    { skill: "3-5 years in B2B sales / partnerships in property, fintech, or marketplace", reason: "Industry relationships and deal-closing experience cannot be taught quickly" },
    { skill: "Existing network in Indonesian property developer ecosystem", reason: "Warm introductions accelerate first 90 days by 3-6 months vs cold outreach" },
    { skill: "Proven track record of closing 6-figure+ partnership deals", reason: "Developer deals are Rp 50-200M in annual value — needs comfort at this level" },
    { skill: "Startup execution mindset: comfortable with ambiguity, speed, and wearing multiple hats", reason: "Early-stage = no playbook. Candidate must create systems from scratch" },
    { skill: "Strong presentation and negotiation skills in Bahasa Indonesia and English", reason: "Developer C-suites expect polished pitches; international partners need English fluency" },
  ],
  niceToHave: [
    "Experience at PropTech, property portal, or real estate company (Rumah123, 99.co, PropertyGuru, developer marketing)",
    "Understanding of AI/ML concepts sufficient to articulate platform intelligence value proposition",
    "Experience building partner portals, CRM pipelines, or partnership operations systems",
    "MBA or business degree from top Indonesian or international university",
    "Multi-city network (not just Jakarta) — Surabaya, Bali, Bandung connections especially valuable",
  ],
  redFlags: [
    "Pure corporate background with no startup/scale-up experience — won't survive the pace",
    "Relationship-focused without data/metrics orientation — we need measurable outcomes",
    "Expects large team from Day 1 — this is a builder role, not a manager role initially",
    "Cannot articulate how technology creates partnership value — tech literacy is essential",
  ],
  interviewProcess: [
    { stage: "Resume Screen + LinkedIn Review", duration: "1 day", evaluator: "Founder" },
    { stage: "30-min Phone Screen: Culture & Motivation", duration: "30 min", evaluator: "Founder" },
    { stage: "Case Study: Design a developer partnership pitch deck", duration: "Take-home (48 hrs)", evaluator: "Founder" },
    { stage: "60-min Deep Dive: Past deals, network, strategy thinking", duration: "60 min", evaluator: "Founder + Advisor" },
    { stage: "Reference Check: 2 former partners/clients", duration: "2-3 days", evaluator: "Founder" },
    { stage: "Offer & Negotiation", duration: "1-2 days", evaluator: "Founder" },
  ],
};

// ── 90-Day Plan ──

interface MilestonePeriod {
  period: string;
  title: string;
  color: string;
  bg: string;
  objectives: { objective: string; measurable: string }[];
  deliverables: string[];
}

const ninetyDayPlan: MilestonePeriod[] = [
  {
    period: "Day 1-30", title: "Learn & Map", color: "text-primary", bg: "bg-primary/10",
    objectives: [
      { objective: "Complete platform deep-dive and AI intelligence value proposition training", measurable: "Can deliver 15-min platform pitch independently by Day 14" },
      { objective: "Map top 50 potential developer partners across Phase 1 cities", measurable: "CRM populated with 50 qualified prospects, contact info, and approach strategy" },
      { objective: "Attend 15+ discovery meetings with developers, agencies, and institutional contacts", measurable: "15 meetings completed with notes and follow-up actions logged" },
      { objective: "Build partnership pitch deck and pricing framework", measurable: "Deck approved by founder, 3 pricing tiers defined" },
    ],
    deliverables: ["Partnership prospect database (50+ contacts)", "Partnership pitch deck v1", "Pricing framework document", "First 30-day report with market learnings"],
  },
  {
    period: "Day 31-60", title: "Execute & Close", color: "text-chart-1", bg: "bg-chart-1/10",
    objectives: [
      { objective: "Close first 3 developer partnerships with signed agreements", measurable: "3 MOUs/contracts signed, onboarding initiated" },
      { objective: "Onboard first agency network partnership (10+ agents per deal)", measurable: "1 agency agreement signed, agents onboarded to platform" },
      { objective: "Initiate conversations with 2 banking partners", measurable: "Meetings with bank BD teams scheduled or completed" },
      { objective: "Generate first 200 listings from partnership channel", measurable: "200 partner-sourced listings live on platform" },
    ],
    deliverables: ["3 signed developer partnerships", "1 agency network agreement", "200+ partner listings live", "Partnership operations playbook v1"],
  },
  {
    period: "Day 61-90", title: "Scale & Systematize", color: "text-chart-3", bg: "bg-chart-3/10",
    objectives: [
      { objective: "Scale to 5+ total developer partnerships with 500+ listings from partners", measurable: "5 active partnerships, 500 listings, partner satisfaction survey >8/10" },
      { objective: "Design scalable partnership operations (templates, onboarding flow, reporting)", measurable: "Partnership playbook documented, onboarding time <3 days per partner" },
      { objective: "Launch first co-marketing campaign with a developer partner", measurable: "Campaign live, shared content published, leads generated" },
      { objective: "Close first banking/institutional partnership LOI", measurable: "LOI signed with at least 1 bank for mortgage referral program" },
    ],
    deliverables: ["5+ active partnerships", "500+ partner listings", "Partnership playbook v2", "First co-marketing campaign results", "90-day performance review"],
  },
];

// ── Career Growth Path ──

const careerPath = [
  { level: "Partnership Manager", timeline: "Month 0-12", description: "Individual contributor — build partnerships from scratch, close deals, prove the model", color: "text-primary" },
  { level: "Senior Partnership Manager", timeline: "Month 12-18", description: "Expanded scope — own all partnership revenue, manage 1-2 partnership associates, national coverage", color: "text-chart-1" },
  { level: "Head of Partnerships", timeline: "Month 18-24", description: "Leadership role — own partnership strategy, team of 3-5, board-level reporting, P&L ownership", color: "text-chart-3" },
  { level: "VP Business Development", timeline: "Year 3+", description: "Executive team — own all B2B revenue, strategic alliances, M&A exploration, international partnership expansion", color: "text-chart-4" },
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
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1 font-bold", area.color, area.bg)}>{area.weight} of role</Badge>
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

const PartnershipManagerRole = React.memo(function PartnershipManagerRole() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-primary/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Partnership Manager — Role Blueprint
              </CardTitle>
              <CardDescription className="text-[11px]">
                Complete hiring blueprint: responsibilities, KPIs, candidate profile, 90-day plan, and career path
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-1 bg-chart-1/10 border-chart-1/30">
              🤝 Hiring
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          {/* Role Summary */}
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-3">
            <p className="text-[9px] text-muted-foreground italic">{roleOverview.missionStatement}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Reports To", value: "Founder / CEO", icon: Crown },
              { label: "Location", value: "Jakarta (Hybrid)", icon: Building },
              { label: "Salary", value: "Rp 18-30M/mo", icon: DollarSign },
              { label: "Equity", value: "0.3-0.8% ESOP", icon: Star },
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
          <TabsTrigger value="responsibilities" className="text-[10px] h-6 px-3">Responsibilities</TabsTrigger>
          <TabsTrigger value="kpis" className="text-[10px] h-6 px-3">KPIs</TabsTrigger>
          <TabsTrigger value="profile" className="text-[10px] h-6 px-3">Candidate Profile</TabsTrigger>
          <TabsTrigger value="90day" className="text-[10px] h-6 px-3">90-Day Plan</TabsTrigger>
          <TabsTrigger value="career" className="text-[10px] h-6 px-3">Career Path</TabsTrigger>
        </TabsList>

        {/* Responsibilities */}
        <TabsContent value="responsibilities" className="mt-3 space-y-2">
          {responsibilities.map((area) => <ResponsibilityCard key={area.area} area={area} />)}
        </TabsContent>

        {/* KPIs */}
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
                    <div key={m.metric} className="flex items-center justify-between p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <div className="flex-1">
                        <span className="text-[9px] font-bold text-foreground">{m.metric}</span>
                        <span className="text-[7px] text-muted-foreground ml-1.5">({m.frequency})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1 font-bold", cat.color)}>{m.target}</Badge>
                        <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{m.weight}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Candidate Profile */}
        <TabsContent value="profile" className="mt-3 space-y-3">
          {/* Must Have */}
          <Card className="rounded-xl border-chart-1/20 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-chart-1">
                <CheckCircle2 className="h-4 w-4" /> Must-Have Requirements
              </CardTitle>
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

          {/* Nice to Have */}
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-primary">
                <Star className="h-4 w-4" /> Nice-to-Have
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.niceToHave.map((nh, i) => (
                <div key={i} className="flex items-start gap-1.5"><Star className="h-2 w-2 text-primary shrink-0 mt-0.5" /><span className="text-[8px] text-muted-foreground">{nh}</span></div>
              ))}
            </CardContent>
          </Card>

          {/* Red Flags */}
          <Card className="rounded-xl border-destructive/20 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-destructive">
                <Shield className="h-4 w-4" /> Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.redFlags.map((rf, i) => (
                <div key={i} className="flex items-start gap-1.5"><Shield className="h-2 w-2 text-destructive shrink-0 mt-0.5" /><span className="text-[8px] text-muted-foreground">{rf}</span></div>
              ))}
            </CardContent>
          </Card>

          {/* Interview Process */}
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2 text-chart-3">
                <Layers className="h-4 w-4" /> Interview Process (10-14 days total)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1">
              {candidateProfile.interviewProcess.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg border border-border/10 bg-muted/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold bg-chart-3/10 text-chart-3">{i + 1}</div>
                    <span className="text-[9px] font-bold text-foreground">{step.stage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground"><Timer className="h-2 w-2 mr-0.5" />{step.duration}</Badge>
                    <Badge variant="outline" className="text-[6px] h-3 px-1 text-chart-3">{step.evaluator}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 90-Day Plan */}
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
                <CardTitle className={cn("text-[11px] font-bold", period.color)}>
                  {period.period}: {period.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="space-y-1.5">
                  {period.objectives.map((obj, i) => (
                    <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                      <div className="flex items-start gap-1.5">
                        <Target className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", period.color)} />
                        <div>
                          <span className="text-[9px] font-bold text-foreground">{obj.objective}</span>
                          <p className="text-[7px] text-muted-foreground mt-0.5">📏 Measurable: {obj.measurable}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-[8px] font-bold text-foreground block mb-1">📦 Deliverables</span>
                  <div className="flex flex-wrap gap-1">
                    {period.deliverables.map((d) => (
                      <Badge key={d} variant="outline" className={cn("text-[7px] h-4 px-1.5", period.color)}>{d}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Career Path */}
        <TabsContent value="career" className="mt-3">
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Career Growth Trajectory
              </CardTitle>
              <CardDescription className="text-[9px]">Clear path from individual contributor to executive leadership within 3 years</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {careerPath.map((level, i) => (
                <div key={level.level} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2", `border-${level.color.replace('text-', '')}`, level.color, `bg-${level.color.replace('text-', '')}/10`)}>{i + 1}</div>
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

export default PartnershipManagerRole;
