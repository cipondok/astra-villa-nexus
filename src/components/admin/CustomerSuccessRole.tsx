import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeartHandshake, CheckCircle2, ChevronRight, ChevronDown, Target,
  Users, DollarSign, Timer, Star, Crown, Shield,
  BarChart3, ArrowRight, Gauge, Layers,
  Phone, MapPin, TrendingUp, MessageCircle,
  Package, UserPlus, Clock, RefreshCw, Zap,
  BookOpen, AlertTriangle, ThumbsUp, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Role Overview ──

const roleOverview = {
  title: "Customer Success & Agent Support Specialist",
  department: "Marketplace Operations",
  reportsTo: "Founder / CEO (→ Head of Agent Success when hired)",
  location: "Jakarta (hybrid) — with occasional field visits for agent training",
  salary: "Rp 8-16M/month + performance bonus (up to 25% of base tied to retention & satisfaction KPIs)",
  equity: "0.05-0.2% ESOP (4-year vest, 1-year cliff)",
  startDate: "Immediate — agent retention is critical as supply scales",
  missionStatement:
    "Ensure every agent and developer on the platform succeeds — by guiding them through onboarding, resolving support issues fast, proactively re-engaging inactive users, and maintaining the listing quality and marketplace activity health that drives buyer trust and platform growth.",
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
    area: "Agent Onboarding & Listing Guidance",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    weight: "30%",
    tasks: [
      { task: "Conduct live onboarding walkthrough sessions (1-on-1 or small group) for every new agent within 48 hours of registration", impact: "Agents who complete guided onboarding are 3x more likely to upload their first listing within 7 days" },
      { task: "Guide agents through correct listing upload: photo standards (8+ photos), description templates, pricing accuracy, location tagging", impact: "Proper first-listing experience sets quality expectations — agents who start right maintain quality long-term" },
      { task: "Create and maintain self-serve onboarding resources: video tutorials, FAQ docs, WhatsApp quick-reference guides in Bahasa Indonesia", impact: "Self-serve resources reduce repeated support questions by 40% and enable 24/7 onboarding support" },
      { task: "Monitor new agent activation funnel: registered → first login → first listing → 5th listing — intervene at each drop-off point", impact: "Proactive intervention at drop-off points recovers 30% of agents who would otherwise churn silently" },
    ],
  },
  {
    area: "Support Request Response & Resolution",
    icon: MessageCircle,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    weight: "25%",
    tasks: [
      { task: "Respond to all agent support requests via WhatsApp, in-app chat, and email within 2-hour SLA (business hours)", impact: "Fast response time is the #1 driver of agent satisfaction — 2-hour SLA beats industry average of 24 hours" },
      { task: "Resolve listing upload issues: photo upload failures, pricing errors, location mapping problems, category mismatches", impact: "Unresolved upload issues cause 25% of new agents to abandon the platform permanently" },
      { task: "Escalate technical bugs to engineering with clear reproduction steps, screenshots, and agent context", impact: "Quality bug reports reduce engineering resolution time by 50% — faster fixes mean happier agents" },
      { task: "Track support ticket categories, volume trends, and resolution times — identify systemic issues for product improvement", impact: "Support data is the best product feedback loop — recurring issues point to UX problems that engineering should fix" },
      { task: "Build and update FAQ knowledge base from common support patterns — reduce repeat ticket volume month-over-month", impact: "Every FAQ article that deflects 10 tickets/month saves 5+ hours of support time" },
    ],
  },
  {
    area: "Proactive Agent Re-engagement",
    icon: RefreshCw,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    weight: "20%",
    tasks: [
      { task: "Monitor agent activity dashboard daily: identify agents inactive for 7+ days, declining listing uploads, or zero buyer inquiries", impact: "Early detection of disengagement prevents churn — agents who go 14+ days inactive have 70% churn probability" },
      { task: "Execute proactive follow-up workflow: WhatsApp check-in → phone call → personalized re-engagement offer within 48 hours of inactivity detection", impact: "Proactive outreach recovers 35% of at-risk agents vs 5% recovery rate without intervention" },
      { task: "Share performance insights with agents: their listing views, inquiry count, how they compare to top agents in their area", impact: "Agents who see their performance data are 2x more likely to increase listing activity" },
      { task: "Organize monthly 'Agent Success' webinars: platform feature updates, listing optimization tips, top agent spotlights", impact: "Community engagement events reduce monthly churn by 15% and increase feature adoption" },
    ],
  },
  {
    area: "Listing Activity & Quality Monitoring",
    icon: Activity,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    weight: "15%",
    tasks: [
      { task: "Monitor marketplace listing health: active vs stale listings, quality score distribution, photo compliance rate", impact: "Listing health directly correlates with buyer engagement — quality drops cause inquiry volume decline within 2 weeks" },
      { task: "Flag and follow up on low-quality listings: missing photos, incomplete descriptions, outdated pricing, duplicate entries", impact: "Quality enforcement maintains buyer trust — one bad listing experience can lose a buyer permanently" },
      { task: "Track listing freshness: contact agents with listings >45 days old to update, mark as sold, or refresh content", impact: "Fresh listings get 3x more views — stale listing cleanup improves overall marketplace conversion rate" },
      { task: "Report weekly on listing quality trends: compliance rate, common quality issues, top/bottom performing agents by quality", impact: "Quality trend visibility enables targeted training and identifies agents who need extra support" },
    ],
  },
  {
    area: "Marketplace Education & Feature Adoption",
    icon: Zap,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    weight: "10%",
    tasks: [
      { task: "Educate agents on platform features: lead management, analytics dashboard, premium listing options, referral program", impact: "Feature-aware agents generate 40% more activity — most agents only use 20% of available features" },
      { task: "Create short WhatsApp-friendly tip videos (30-60 sec) on platform features, listing best practices, and success strategies", impact: "Bite-sized content in WhatsApp has 80% open rate vs 15% for email — most effective education channel" },
      { task: "Collect and relay agent feedback to product team: feature requests, pain points, competitor comparisons", impact: "Agent feedback shapes product roadmap — features agents actually want drive retention better than assumed features" },
    ],
  },
];

// ── Engagement Workflows ──

const engagementWorkflows = [
  {
    name: "New Agent Onboarding Flow",
    icon: UserPlus,
    color: "text-primary",
    trigger: "Agent registers on platform",
    steps: [
      { step: "Welcome WhatsApp within 1 hour — introduce yourself, share quick-start guide", timing: "Hour 0-1" },
      { step: "Schedule live onboarding session (video call or WhatsApp call) within 48 hours", timing: "Hour 1-48" },
      { step: "Guide first listing upload — hands-on support until listing is live and quality-approved", timing: "Day 2-3" },
      { step: "Follow-up check-in after first listing — share views/inquiry data, encourage 2nd listing", timing: "Day 5-7" },
      { step: "Add to city WhatsApp agent community — introduce to peers and ongoing support channel", timing: "Day 7" },
      { step: "Week 2 progress call — review listing count, answer questions, share optimization tips", timing: "Day 14" },
      { step: "Month 1 success review — share performance summary, discuss goals, identify any blockers", timing: "Day 30" },
    ],
  },
  {
    name: "Inactive Agent Re-engagement",
    icon: RefreshCw,
    color: "text-chart-3",
    trigger: "Agent inactive for 7+ days (no listing updates, no logins)",
    steps: [
      { step: "Day 7: Friendly WhatsApp check-in — 'Noticed you haven't been active, anything I can help with?'", timing: "Day 7" },
      { step: "Day 10: Phone call if no WhatsApp response — personal touch, identify specific blockers", timing: "Day 10" },
      { step: "Day 14: Share performance comparison — 'Agents in your area are getting X inquiries/week'", timing: "Day 14" },
      { step: "Day 21: Offer personalized support session — re-training, listing refresh assistance", timing: "Day 21" },
      { step: "Day 30: Final outreach with incentive — featured listing slot or priority lead access for 1 week", timing: "Day 30" },
      { step: "Day 45+: Mark as churned if no response — add to quarterly re-activation campaign list", timing: "Day 45+" },
    ],
  },
  {
    name: "Listing Quality Improvement",
    icon: Star,
    color: "text-chart-1",
    trigger: "Listing quality score drops below 60/100",
    steps: [
      { step: "Auto-flag listing and notify agent via WhatsApp with specific quality issues", timing: "Immediate" },
      { step: "Provide actionable improvement checklist: 'Add 3 more photos, extend description by 50 words'", timing: "Same day" },
      { step: "Offer photo improvement tips or connect with photography support service", timing: "Day 1-2" },
      { step: "Follow up on improvements — re-score and share updated quality rating", timing: "Day 3-5" },
      { step: "If no improvement after 7 days — schedule call to discuss and assist directly", timing: "Day 7" },
    ],
  },
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
    category: "Agent Activation & Retention",
    icon: Users,
    color: "text-primary",
    metrics: [
      { metric: "Agent Activation Rate (first listing in 7 days)", month3: "60%", month6: "75%", month12: "85%", weight: "20%" },
      { metric: "Monthly Agent Retention Rate", month3: "70%", month6: "80%", month12: "88%", weight: "15%" },
      { metric: "At-Risk Agent Recovery Rate", month3: "25%", month6: "35%", month12: "45%", weight: "10%" },
    ],
  },
  {
    category: "Support Quality",
    icon: MessageCircle,
    color: "text-chart-1",
    metrics: [
      { metric: "Avg First Response Time", month3: "<2 hours", month6: "<1 hour", month12: "<30 min", weight: "15%" },
      { metric: "Support Satisfaction Score (CSAT)", month3: "4.0/5", month6: "4.3/5", month12: "4.6/5", weight: "10%" },
      { metric: "First-Contact Resolution Rate", month3: "65%", month6: "75%", month12: "85%", weight: "5%" },
    ],
  },
  {
    category: "Listing Quality Compliance",
    icon: Star,
    color: "text-chart-3",
    metrics: [
      { metric: "Avg Listing Quality Score", month3: "70/100", month6: "78/100", month12: "85/100", weight: "10%" },
      { metric: "Listings with 8+ Photos", month3: "50%", month6: "70%", month12: "85%", weight: "5%" },
      { metric: "Stale Listing Rate (<45 days)", month3: "<30%", month6: "<20%", month12: "<12%", weight: "5%" },
    ],
  },
  {
    category: "Marketplace Activity Impact",
    icon: Activity,
    color: "text-chart-4",
    metrics: [
      { metric: "Active Agents (5+ listings, monthly login)", month3: "40", month6: "120", month12: "300", weight: "5%" },
      { metric: "Monthly Support Tickets Resolved", month3: "200", month6: "500", month12: "800", weight: "3%" },
      { metric: "FAQ Deflection Rate", month3: "20%", month6: "35%", month12: "50%", weight: "2%" },
    ],
  },
];

// ── Candidate Profile ──

const candidateProfile = {
  mustHave: [
    { skill: "1-3 years in customer success, customer support, or account management — ideally at a tech platform or marketplace", reason: "Needs proven ability to support users at scale with empathy and efficiency — not just answer tickets" },
    { skill: "Excellent communication skills in Bahasa Indonesia (written + verbal) — WhatsApp-native communicator", reason: "90% of agent interaction happens via WhatsApp — must write clearly, warmly, and concisely in Bahasa" },
    { skill: "Tech-comfortable: able to learn new platforms quickly, troubleshoot basic user issues, create screen recordings", reason: "Agents need hands-on tech guidance — support specialist must be more tech-savvy than the agents they help" },
    { skill: "Customer empathy mindset: genuine desire to help people succeed, patience with non-technical users", reason: "Agents are busy professionals, not tech users — empathy-driven support builds trust and loyalty" },
    { skill: "Organized and process-oriented: able to manage 50+ active relationships, track follow-ups, and maintain CRM data", reason: "Without systematic tracking, agent relationships fall through the cracks — organization prevents churn" },
  ],
  niceToHave: [
    "Real estate industry familiarity — understanding of agent workflows, listing processes, and market dynamics",
    "Experience with support tools: Intercom, Zendesk, Freshdesk, or similar ticketing systems",
    "Content creation ability: can create simple tutorial videos, WhatsApp guides, and FAQ documents",
    "Community management experience: WhatsApp group moderation, online forum facilitation",
    "Bilingual (Bahasa + English) for supporting international agents or developers",
  ],
  redFlags: [
    "Reactive-only mindset — this role requires proactive outreach, not just waiting for tickets",
    "Cannot demonstrate empathy or patience in interview — agents need someone who genuinely cares",
    "No experience with digital tools or platforms — too steep a learning curve for fast-paced startup",
    "Uncomfortable with phone/video calls — 40% of support happens via voice, not just text",
  ],
  interviewProcess: [
    { stage: "Resume + Communication Screen", duration: "1 day", evaluator: "Founder", focus: "Written communication quality, customer-facing experience, tech comfort level" },
    { stage: "30-min Empathy & Culture Fit Call", duration: "30 min", evaluator: "Founder", focus: "Communication warmth, problem-solving approach, startup mindset" },
    { stage: "Support Scenario Role-Play", duration: "Take-home (24 hrs)", evaluator: "Founder", focus: "Write WhatsApp responses to 5 real agent scenarios (onboarding, complaint, re-engagement, bug report, quality issue)" },
    { stage: "45-min Live Role-Play + Deep Dive", duration: "45 min", evaluator: "Founder + Ops", focus: "Live phone call simulation with angry agent, discuss support strategy, review scenario responses" },
    { stage: "Half-Day Trial (paid)", duration: "4 hours", evaluator: "Founder", focus: "Respond to real (anonymized) support tickets, create one tutorial resource, conduct mock onboarding call" },
    { stage: "Reference Check + Offer", duration: "2-3 days", evaluator: "Founder", focus: "Verify customer satisfaction scores and relationship-building ability from previous roles" },
  ],
};

// ── 90-Day Plan ──

const ninetyDayPlan = [
  {
    period: "Day 1-30",
    title: "Learn & Activate",
    color: "text-primary",
    bg: "bg-primary/10",
    objectives: [
      { objective: "Complete full platform deep-dive: master every feature from agent's perspective — listing upload, dashboard, leads, settings", measurable: "Can independently demo all platform features and troubleshoot common issues by Day 7" },
      { objective: "Onboard first 30 agents with guided walkthrough sessions — achieve 60% first-listing activation rate", measurable: "30 agents onboarded, 18+ with first listing live within 7 days of registration" },
      { objective: "Set up support infrastructure: WhatsApp Business, ticket tracking system, FAQ v1 with top 20 questions", measurable: "Support channels live, FAQ published, response time tracking active" },
      { objective: "Establish <2 hour first-response SLA and achieve 4.0/5 CSAT on first 50 support interactions", measurable: "Response time and CSAT tracked and reported weekly" },
      { objective: "Create 5 WhatsApp-friendly onboarding resources: listing upload guide, photo tips, pricing guide, FAQ, platform tour video", measurable: "5 resources created, shared with all new agents, positive feedback collected" },
    ],
    deliverables: ["30 agents onboarded", "60% activation rate", "Support system live", "FAQ v1", "5 onboarding resources"],
  },
  {
    period: "Day 31-60",
    title: "Scale & Systematize",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    objectives: [
      { objective: "Scale to supporting 80+ agents with consistent quality — maintain <2hr response time as volume grows", measurable: "80+ agents actively supported, response SLA maintained, CSAT ≥4.0" },
      { objective: "Launch proactive re-engagement workflow — contact all agents inactive 7+ days, achieve 30% recovery rate", measurable: "Re-engagement workflow documented and executing, recovery rate tracked weekly" },
      { objective: "Improve listing quality compliance to 70+ average score through targeted agent coaching", measurable: "Average quality score tracked, agents below 60 receiving personalized improvement plans" },
      { objective: "Reduce repeat support tickets by 20% through FAQ expansion and proactive education", measurable: "Ticket category analysis showing decline in repeat issues, FAQ expanded to 40+ entries" },
    ],
    deliverables: ["80+ agents supported", "Re-engagement workflow live", "Quality score 70+", "FAQ v2 (40+ entries)", "Weekly retention report"],
  },
  {
    period: "Day 61-90",
    title: "Prove & Optimize",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    objectives: [
      { objective: "Demonstrate 70% monthly agent retention rate with clear upward trend", measurable: "Retention rate tracked by cohort, showing improvement month-over-month" },
      { objective: "Achieve 4.3/5 CSAT score and <1hr average first response time", measurable: "CSAT and response time dashboards showing consistent performance" },
      { objective: "Prove re-engagement impact: 35% recovery rate on at-risk agents, with measurable listing activity resumption", measurable: "Recovery data showing agents returning to active status and uploading new listings" },
      { objective: "Document all support & success playbooks for scaling: onboarding SOP, re-engagement workflow, quality coaching process, escalation procedures", measurable: "Playbooks complete, ready for second support hire to execute from Day 1" },
    ],
    deliverables: ["70% retention", "4.3/5 CSAT", "<1hr response", "35% recovery rate", "Complete playbooks"],
  },
];

// ── Career Path ──

const careerPath = [
  { level: "Customer Success & Agent Support Specialist", timeline: "Month 0-12", description: "Hands-on agent champion — onboard, support, re-engage, and coach agents to succeed on the platform", color: "text-primary" },
  { level: "Senior Agent Success Manager", timeline: "Month 12-18", description: "Expanded scope — manage 1-2 junior support specialists, own agent retention metrics, build agent training program", color: "text-chart-1" },
  { level: "Head of Agent Success", timeline: "Month 18-30", description: "Leadership — own entire agent experience lifecycle, build success team of 4-6, design agent loyalty program", color: "text-chart-3" },
  { level: "VP Customer Experience", timeline: "Year 3+", description: "Executive — own all user experience (agents + buyers), NPS strategy, support operations, and community ecosystem", color: "text-chart-4" },
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

const CustomerSuccessRole = React.memo(function CustomerSuccessRole() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-4/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                Customer Success & Agent Support — Role Blueprint
              </CardTitle>
              <CardDescription className="text-[11px]">
                Full role definition: responsibilities, engagement workflows, KPIs, candidate profile, 90-day plan, and career path
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              💚 Success Hire
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
              { label: "Location", value: "Jakarta (Hybrid)", icon: MapPin },
              { label: "Salary", value: "Rp 8-16M/mo", icon: DollarSign },
              { label: "Equity", value: "0.05-0.2% ESOP", icon: Star },
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
          <TabsTrigger value="workflows" className="text-[10px] h-6 px-2">Engagement Flows</TabsTrigger>
          <TabsTrigger value="kpis" className="text-[10px] h-6 px-2">KPIs</TabsTrigger>
          <TabsTrigger value="profile" className="text-[10px] h-6 px-2">Candidate</TabsTrigger>
          <TabsTrigger value="90day" className="text-[10px] h-6 px-2">90-Day Plan</TabsTrigger>
          <TabsTrigger value="career" className="text-[10px] h-6 px-2">Career Path</TabsTrigger>
        </TabsList>

        <TabsContent value="responsibilities" className="mt-3 space-y-2">
          {responsibilities.map((area) => (
            <ResponsibilityCard key={area.area} area={area} />
          ))}
        </TabsContent>

        <TabsContent value="workflows" className="mt-3 space-y-3">
          {engagementWorkflows.map((wf) => {
            const Icon = wf.icon;
            return (
              <Card key={wf.name} className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", wf.color)} /> {wf.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-muted-foreground">
                      <AlertTriangle className="h-2 w-2 mr-0.5" /> Trigger: {wf.trigger}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {wf.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={cn("w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-bold bg-primary/10", wf.color)}>
                          {i + 1}
                        </div>
                        <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">
                          <Clock className="h-1.5 w-1.5 mr-0.5" />{s.timing}
                        </Badge>
                      </div>
                      <span className="text-[8px] text-foreground">{s.step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
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
            <CardHeader className="p-3 pb-2"><CardTitle className="text-[11px] font-bold flex items-center gap-2 text-chart-3"><Layers className="h-4 w-4" /> Interview Process (7-10 days)</CardTitle></CardHeader>
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

export default CustomerSuccessRole;
