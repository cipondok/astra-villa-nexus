import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, CheckCircle2, ChevronRight, ChevronDown, Target,
  Users, Building, DollarSign, Timer, Star, Zap, Crown, Shield,
  BarChart3, Rocket, Flag, ArrowRight, Gauge, Layers, Search,
  Video, PenTool, Globe, Megaphone, MousePointer, LineChart,
  Share2, Mail, Smartphone, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Role Overview ──

const roleOverview = {
  title: "Digital Growth Specialist",
  department: "Growth & Marketing",
  reportsTo: "Founder / CEO (→ Digital Growth Lead when hired)",
  location: "Jakarta (hybrid) — remote-friendly with weekly sync",
  salary: "Rp 10-20M/month + performance bonus (up to 35% of base tied to growth KPIs)",
  equity: "0.1-0.3% ESOP (4-year vest, 1-year cliff)",
  startDate: "Immediate — critical growth hire",
  missionStatement: "Execute and scale the platform's digital acquisition engine — coordinating SEO location page rollouts across national administrative levels, driving viral short-form property video content on TikTok/Instagram/YouTube, running performance marketing experiments, and tracking traffic analytics to efficiently acquire buyers, sellers, agents, and investors.",
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
    area: "SEO Location Page Rollout & Google Organic", icon: Search, color: "text-primary", bg: "bg-primary/10", weight: "35%",
    tasks: [
      { task: "Coordinate programmatic SEO rollout across national administrative levels: province → city → kecamatan → kelurahan — targeting 'beli rumah [lokasi]' and 'rumah dijual [lokasi]' intent", impact: "SEO drives 60% of long-term traffic at near-zero marginal cost — the primary acquisition moat for buyers and investors" },
      { task: "Optimize on-page SEO (meta titles, descriptions, JSON-LD structured data, internal linking) for all property and location pages", impact: "10% CTR improvement on 500K impressions = 50K incremental monthly visits" },
      { task: "Build content clusters around high-intent keywords: investment guides, city market reports, property type explainers, area comparison pages", impact: "Topical authority drives domain rating up → all pages rank higher" },
      { task: "Monitor Google Search Console daily — track keyword ranking improvements, indexing coverage, and execute technical SEO fixes (Core Web Vitals, crawl budget)", impact: "Technical SEO issues can silently kill 30-50% of organic traffic — constant monitoring prevents this" },
      { task: "Coordinate with engineering on SEO infrastructure: sitemap generation, canonical tags, page speed optimization, hreflang for bilingual content", impact: "Technical foundation enables content scaling without diminishing returns" },
      { task: "Track SEO indexing milestones: pages indexed, impressions, average position, CTR progression per location tier", impact: "Indexing velocity directly determines time-to-traffic for new location pages" },
    ],
  },
  {
    area: "Short-Form Video & Social Growth (TikTok / IG / YouTube)", icon: Video, color: "text-chart-1", bg: "bg-chart-1/10", weight: "25%",
    tasks: [
      { task: "Execute 13+ videos/week across TikTok, Instagram Reels, and YouTube Shorts — property tours, price reveals, market insights, investment explainers", impact: "Short-form video is the fastest channel for brand awareness and buyer/investor acquisition — 10M views/month target" },
      { task: "Optimize content for each platform's algorithm: TikTok (hooks, trends, sounds), IG Reels (hashtag strategy, carousel crossover), YouTube Shorts (discovery, SEO tags)", impact: "Platform-specific optimization drives 2-3x more views vs cross-posting identical content" },
      { task: "Build creator/influencer collaboration pipeline for property content amplification — agent co-creation, local property influencers", impact: "Influencer co-creation extends reach 5-10x beyond owned channels at lower CPM" },
      { task: "Drive social-to-platform conversion: link-in-bio optimization, CTA testing, landing page alignment with social traffic", impact: "Social traffic without conversion is vanity — every video should have a measurable acquisition path" },
      { task: "Analyze content performance: views, engagement, saves, shares, profile visits, link clicks — identify viral patterns and scale winning formats", impact: "Data-driven content optimization doubles engagement rate within 60 days" },
    ],
  },
  {
    area: "Performance Marketing Experiments", icon: MousePointer, color: "text-chart-3", bg: "bg-chart-3/10", weight: "15%",
    tasks: [
      { task: "Run paid search testing on Google Ads targeting high-intent property keywords — validate CAC before scaling", impact: "Paid search experiments identify which keywords and cities convert profitably before committing budget" },
      { task: "Experiment with Meta Ads (Facebook/Instagram) retargeting for property viewers and agent signup abandoners", impact: "Retargeting converts warm audiences at 3-5x the rate of cold traffic" },
      { task: "Design and A/B test landing pages optimized for buyer inquiries, agent signups, and investor registrations", impact: "10% landing page improvement = 10% more conversions at same spend" },
      { task: "Track ROAS/CAC by channel and experiment type — kill underperformers fast, scale winners quickly", impact: "Experiment velocity matters more than budget size at early stage" },
    ],
  },
  {
    area: "Traffic Analytics & Lead Tracking", icon: BarChart3, color: "text-chart-4", bg: "bg-chart-4/10", weight: "15%",
    tasks: [
      { task: "Build and maintain growth dashboards: traffic sources, conversion funnels, user cohorts, lead attribution by channel", impact: "Visibility into metrics enables data-driven decisions and proves ROI to stakeholders" },
      { task: "Track inbound lead generation metrics: inquiry volume, agent signup rate, investor registration, lead-to-qualified conversion", impact: "Lead quality measurement prevents vanity metric traps — focus on leads that convert" },
      { task: "Monitor user acquisition across all four segments: buyers, sellers, agents, investors — identify highest-ROI channels per segment", impact: "Each segment acquires differently — channel-segment fit analysis prevents wasted effort" },
      { task: "Produce weekly growth reports with key metrics, insights, experiment results, and recommended next actions", impact: "Structured reporting ensures growth stays aligned with company strategy" },
    ],
  },
  {
    area: "Community & Lead Nurture", icon: Users, color: "text-chart-1", bg: "bg-chart-1/10", weight: "10%",
    tasks: [
      { task: "Build WhatsApp communities for agents and investors by city — drive referral loops and inbound leads", impact: "WhatsApp groups drive 40% of agent referrals and create defensible community moats" },
      { task: "Manage email automation: onboarding sequences, deal alerts, weekly market digests, re-engagement campaigns", impact: "Email nurture converts 20% of dormant users back to active within 30 days" },
      { task: "Design referral incentive mechanics for agent-to-agent and buyer-to-buyer acquisition loops", impact: "Referral-acquired users have 2x retention and 3x LTV vs paid users" },
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
    category: "Traffic & SEO Indexing", icon: Globe, color: "text-primary",
    metrics: [
      { metric: "Monthly Organic Traffic", month3: "50K", month6: "200K", month12: "500K", weight: "20%" },
      { metric: "SEO Pages Indexed", month3: "2,000", month6: "5,000", month12: "10,000+", weight: "10%" },
      { metric: "Keywords in Google Top 20", month3: "200", month6: "1,000", month12: "3,000+", weight: "10%" },
    ],
  },
  {
    category: "Social Reach & Video", icon: Video, color: "text-chart-1",
    metrics: [
      { metric: "Social Media Monthly Views", month3: "3M", month6: "10M", month12: "30M", weight: "10%" },
      { metric: "Social Followers (TikTok + IG + YT)", month3: "30K", month6: "100K", month12: "300K", weight: "5%" },
      { metric: "Video-to-Platform Click Rate", month3: "2%", month6: "3.5%", month12: "5%", weight: "5%" },
    ],
  },
  {
    category: "Inbound Lead Generation", icon: Target, color: "text-chart-3",
    metrics: [
      { metric: "Monthly Inbound Leads (all segments)", month3: "500", month6: "2,500", month12: "8,000", weight: "15%" },
      { metric: "Agent Signups from Digital Channels", month3: "30/mo", month6: "80/mo", month12: "150/mo", weight: "5%" },
      { metric: "Investor Registration Rate", month3: "3%", month6: "5%", month12: "8%", weight: "5%" },
    ],
  },
  {
    category: "Efficiency & ROI", icon: Gauge, color: "text-chart-4",
    metrics: [
      { metric: "Blended CAC", month3: "Rp 120K", month6: "Rp 85K", month12: "Rp 60K", weight: "5%" },
      { metric: "Organic vs Paid Traffic Ratio", month3: "40:60", month6: "60:40", month12: "75:25", weight: "5%" },
      { metric: "Paid Experiment Win Rate", month3: "15%", month6: "25%", month12: "30%", weight: "5%" },
    ],
  },
];

// ── Candidate Profile ──

const candidateProfile = {
  mustHave: [
    { skill: "3-5 years in digital marketing / growth role at a startup or marketplace", reason: "Startup pace + marketplace dynamics require proven hands-on growth execution experience" },
    { skill: "Demonstrated SEO expertise: keyword strategy, technical SEO, content scaling", reason: "SEO is the #1 long-term growth lever — needs someone who can execute, not just strategize" },
    { skill: "Proficiency in Google Ads, Meta Ads, and analytics tools (GA4, Search Console, SEMrush/Ahrefs)", reason: "Paid acquisition requires tactical expertise — no time for learning curve on tools" },
    { skill: "Content creation or management experience — especially short-form video (TikTok/Reels)", reason: "Social content is the primary brand awareness channel — must understand viral mechanics" },
    { skill: "Data-driven mindset with ability to build dashboards, analyze funnels, and run A/B tests", reason: "Growth without measurement is just marketing spend — every action needs a number" },
  ],
  niceToHave: [
    "Property/PropTech industry experience — understanding of buyer journey and agent behavior",
    "Experience scaling a marketplace from 0→1 (supply + demand acquisition simultaneously)",
    "Community building experience (WhatsApp groups, Discord, or forum management)",
    "Basic HTML/CSS/JavaScript for landing page optimization and SEO technical fixes",
    "Experience with marketing automation tools (Brevo, Mailchimp, Customer.io)",
  ],
  redFlags: [
    "Brand marketing background only — this role needs performance marketing and measurable ROI focus",
    "Agency-only experience — needs ownership mindset, not deliverable-oriented execution",
    "Cannot articulate specific growth metrics from previous roles (exact CAC, conversion rates, traffic numbers)",
    "No hands-on content creation ability — this is a builder role, not a delegator role in Phase 1",
  ],
  interviewProcess: [
    { stage: "Resume + Portfolio Screen", duration: "1 day", evaluator: "Founder", focus: "Track record of measurable growth outcomes" },
    { stage: "30-min Culture Fit Call", duration: "30 min", evaluator: "Founder", focus: "Startup mindset, speed of execution, data orientation" },
    { stage: "Growth Strategy Case Study", duration: "Take-home (48 hrs)", evaluator: "Founder", focus: "Design 90-day growth plan for platform with Rp 100M budget" },
    { stage: "60-min Deep Dive: Strategy + Execution", duration: "60 min", evaluator: "Founder + Advisor", focus: "Walk through case study, discuss past campaigns, pressure-test thinking" },
    { stage: "Paid Trial Day (optional)", duration: "1 day", evaluator: "Founder", focus: "Real task: audit current SEO + create 3 social content concepts" },
    { stage: "Reference Check + Offer", duration: "2-3 days", evaluator: "Founder", focus: "Verify growth metrics from previous roles" },
  ],
};

// ── 90-Day Plan ──

const ninetyDayPlan = [
  {
    period: "Day 1-30", title: "Audit & Foundation", color: "text-primary", bg: "bg-primary/10",
    objectives: [
      { objective: "Complete full digital audit: SEO health, social presence, analytics setup, competitor analysis", measurable: "Audit report delivered with prioritized action items by Day 10" },
      { objective: "Set up growth analytics stack: GA4 enhanced events, UTM framework, conversion tracking, weekly dashboard", measurable: "Dashboard live with real-time traffic, signup, and conversion data by Day 14" },
      { objective: "Launch first 500 programmatic SEO location pages with optimized meta data", measurable: "500 pages indexed in Google, first organic impressions appearing" },
      { objective: "Produce first 20 social media videos and establish content calendar", measurable: "20 videos published, baseline engagement metrics established" },
      { objective: "Set up Google Ads campaigns for top 10 high-intent keywords per Phase 1 city", measurable: "Ads live, first 1,000 clicks generated, initial CPC and conversion data collected" },
    ],
    deliverables: ["Digital audit report", "Growth dashboard v1", "500 SEO pages live", "20 social videos", "Paid ads launched"],
  },
  {
    period: "Day 31-60", title: "Scale & Optimize", color: "text-chart-1", bg: "bg-chart-1/10",
    objectives: [
      { objective: "Scale SEO pages to 2,000+ and begin ranking for target keywords in Phase 1 cities", measurable: "100+ keywords in Google top 50, 20K organic visits in Month 2" },
      { objective: "Increase social content to 13 videos/week cadence with tested content formats", measurable: "3M+ social views in Month 2, top-performing format identified" },
      { objective: "Optimize paid campaigns: reduce CPC by 20%, improve conversion rate by 15%", measurable: "CPC and conversion improvements measured against Month 1 baseline" },
      { objective: "Launch referral program and email automation sequences", measurable: "Referral program live, 100+ referral signups, email onboarding sequence active" },
    ],
    deliverables: ["2,000 SEO pages", "13 videos/week cadence", "Optimized ad campaigns", "Referral program live", "Email automation active"],
  },
  {
    period: "Day 61-90", title: "Systemize & Prove", color: "text-chart-3", bg: "bg-chart-3/10",
    objectives: [
      { objective: "Achieve 50K monthly organic traffic with clear growth trajectory", measurable: "50K organic visits, 30% month-over-month growth rate sustained" },
      { objective: "Reach 30K social followers and 3M monthly views across platforms", measurable: "Follower and view counts verified, engagement rate >5%" },
      { objective: "Deliver blended CAC of Rp 120K or lower with 2,000 monthly signups", measurable: "CAC calculated across all channels, signup volume confirmed" },
      { objective: "Document all growth playbooks: SEO, social, paid, email, referral — for team scaling", measurable: "Playbook docs completed, ready for new team member onboarding" },
    ],
    deliverables: ["50K organic traffic", "30K followers", "CAC < Rp 120K", "Growth playbooks documented", "90-day performance review"],
  },
];

// ── Career Path ──

const careerPath = [
  { level: "Digital Growth Lead", timeline: "Month 0-12", description: "Hands-on IC — build all growth channels from scratch, prove the playbook, achieve product-market-channel fit", color: "text-primary" },
  { level: "Senior Growth Manager", timeline: "Month 12-18", description: "Expanded scope — manage 1-2 growth specialists, own full acquisition P&L, scale to 500K+ monthly traffic", color: "text-chart-1" },
  { level: "Head of Growth", timeline: "Month 18-24", description: "Leadership — own all user acquisition, brand marketing, community, and growth engineering. Team of 4-6", color: "text-chart-3" },
  { level: "VP Marketing / CMO", timeline: "Year 3+", description: "Executive — own full marketing P&L, brand strategy, growth, and market positioning. Board-level reporting", color: "text-chart-4" },
];

// ── Tools & Stack ──

const toolStack = [
  { category: "SEO", tools: ["Google Search Console", "Ahrefs / SEMrush", "Screaming Frog", "Surfer SEO"] },
  { category: "Analytics", tools: ["Google Analytics 4", "Mixpanel / PostHog", "Looker Studio", "Hotjar"] },
  { category: "Paid Ads", tools: ["Google Ads", "Meta Ads Manager", "TikTok Ads", "Google Optimize"] },
  { category: "Social", tools: ["CapCut / Canva", "Later / Buffer", "TikTok Creator Tools", "Instagram Insights"] },
  { category: "Email & CRM", tools: ["Brevo / Customer.io", "WhatsApp Business API", "Supabase (in-app notifications)", "Mailchimp"] },
  { category: "Collaboration", tools: ["Notion", "Slack", "Figma (for creative briefs)", "Google Sheets (reporting)"] },
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

const DigitalGrowthRole = React.memo(function DigitalGrowthRole() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Digital Growth Lead — Role Blueprint
              </CardTitle>
              <CardDescription className="text-[11px]">
                Full role definition: responsibilities, KPIs, candidate profile, 90-day plan, tools, and career path
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              📈 Growth Hire
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
              { label: "Location", value: "Jakarta (Hybrid)", icon: Building },
              { label: "Salary", value: "Rp 15-28M/mo", icon: DollarSign },
              { label: "Equity", value: "0.2-0.6% ESOP", icon: Star },
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
          <TabsTrigger value="kpis" className="text-[10px] h-6 px-2">KPIs</TabsTrigger>
          <TabsTrigger value="profile" className="text-[10px] h-6 px-2">Candidate</TabsTrigger>
          <TabsTrigger value="90day" className="text-[10px] h-6 px-2">90-Day Plan</TabsTrigger>
          <TabsTrigger value="tools" className="text-[10px] h-6 px-2">Tools</TabsTrigger>
          <TabsTrigger value="career" className="text-[10px] h-6 px-2">Career Path</TabsTrigger>
        </TabsList>

        <TabsContent value="responsibilities" className="mt-3 space-y-2">
          {responsibilities.map((area) => <ResponsibilityCard key={area.area} area={area} />)}
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

        <TabsContent value="tools" className="mt-3">
          <Card className="rounded-xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Growth Tool Stack</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {toolStack.map((cat) => (
                  <div key={cat.category} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                    <span className="text-[9px] font-bold text-primary block mb-1">{cat.category}</span>
                    {cat.tools.map((t) => (
                      <div key={t} className="flex items-start gap-1"><CheckCircle2 className="h-2 w-2 text-muted-foreground shrink-0 mt-0.5" /><span className="text-[7px] text-muted-foreground">{t}</span></div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

export default DigitalGrowthRole;
