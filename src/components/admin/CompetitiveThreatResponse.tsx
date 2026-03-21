import React, { useState } from "react";
import { Shield, AlertTriangle, Target, Zap, Clock, ChevronDown, ChevronUp, Copy, Check, TrendingUp, Users, DollarSign, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── data ───────── */

interface DefenseAction {
  action: string;
  timeline: string;
  priority: "critical" | "high" | "medium";
  impact: string;
  cost: "low" | "medium" | "high";
}

interface CompetitorScenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  severity: number;
  description: string;
  signals: string[];
  defenses: {
    liquidity: DefenseAction[];
    vendor: DefenseAction[];
    investor: DefenseAction[];
    pricing: DefenseAction[];
    brand: DefenseAction[];
  };
  phases: { label: string; duration: string; actions: string[] }[];
}

const scenarios: CompetitorScenario[] = [
  {
    id: "early",
    title: "Early Emerging Competitor",
    icon: <Target className="h-5 w-5" />,
    severity: 35,
    description: "New entrant with limited traction testing the market. Low funding, small team, no vendor lock-in yet.",
    signals: [
      "New listing portal appearing in Google Ads for target city keywords",
      "Small number of vendors cross-listing on new platform",
      "Social media ads targeting same property segments",
      "Job postings for sales reps in your launch city",
    ],
    defenses: {
      liquidity: [
        { action: "Accelerate listing acquisition in competitor's target zones", timeline: "Week 1-2", priority: "high", impact: "Starve competitor of initial supply", cost: "medium" },
        { action: "Launch exclusive listing incentive for top 50 vendors", timeline: "Week 1", priority: "critical", impact: "Lock premium inventory before competitor reaches it", cost: "medium" },
        { action: "Activate demand-side campaigns to increase inquiry velocity on existing listings", timeline: "Week 2-3", priority: "high", impact: "Demonstrate superior marketplace value to vendors", cost: "medium" },
      ],
      vendor: [
        { action: "Personally call top 20 vendors to reinforce relationship", timeline: "48 hours", priority: "critical", impact: "Prevent early defection of key supply partners", cost: "low" },
        { action: "Offer 90-day free premium visibility to loyal vendors", timeline: "Week 1", priority: "high", impact: "Increase switching cost through premium feature exposure", cost: "medium" },
        { action: "Launch vendor success stories campaign highlighting earnings on ASTRA", timeline: "Week 2", priority: "medium", impact: "Social proof reinforcement", cost: "low" },
      ],
      investor: [
        { action: "Send curated deal digest to top investors emphasizing platform intelligence advantage", timeline: "Week 1", priority: "high", impact: "Reinforce unique value proposition", cost: "low" },
        { action: "Host exclusive investor webinar on market insights only available on ASTRA", timeline: "Week 2-3", priority: "medium", impact: "Deepen engagement and demonstrate data moat", cost: "low" },
      ],
      pricing: [
        { action: "Maintain current pricing — do not react with discounts", timeline: "Ongoing", priority: "high", impact: "Preserve revenue integrity and perceived premium positioning", cost: "low" },
        { action: "Introduce annual commitment discount for vendor subscriptions", timeline: "Week 3-4", priority: "medium", impact: "Lock vendors into longer contracts reducing churn risk", cost: "medium" },
      ],
      brand: [
        { action: "Publish market intelligence report positioning ASTRA as data leader", timeline: "Week 2", priority: "high", impact: "Establish authority gap competitor cannot easily close", cost: "low" },
        { action: "Secure 2-3 media mentions highlighting ASTRA traction milestones", timeline: "Week 3-4", priority: "medium", impact: "Brand authority reinforcement in public narrative", cost: "low" },
      ],
    },
    phases: [
      { label: "Monitor & Fortify", duration: "Week 1-2", actions: ["Identify competitor's exact positioning angle", "Lock top vendors with incentives", "Accelerate listing growth in overlap zones"] },
      { label: "Widen the Gap", duration: "Week 3-4", actions: ["Launch intelligence content campaign", "Deepen vendor integration features", "Publish traction social proof"] },
      { label: "Consolidate", duration: "Month 2-3", actions: ["Monitor competitor growth stall signals", "Convert any cross-listed vendors to exclusive", "Expand into adjacent zones competitor hasn't reached"] },
    ],
  },
  {
    id: "funded",
    title: "Aggressive Funded Competitor",
    icon: <DollarSign className="h-5 w-5" />,
    severity: 75,
    description: "Well-funded competitor ($5M+) entering with aggressive marketing spend, talent acquisition, and vendor incentives.",
    signals: [
      "Major PR coverage announcing large funding round",
      "Aggressive vendor sign-up bonuses (free listings, cash incentives)",
      "Heavy digital ad spend outbidding your keywords",
      "Poaching attempts on your team members",
      "Rapid listing volume growth in your core market",
    ],
    defenses: {
      liquidity: [
        { action: "Activate emergency listing blitz — double acquisition team output for 30 days", timeline: "Immediate", priority: "critical", impact: "Prevent supply gap that erodes marketplace value", cost: "high" },
        { action: "Launch 'Verified Exclusive' program — premium badge for ASTRA-only listings", timeline: "Week 1-2", priority: "critical", impact: "Create differentiated inventory competitor cannot replicate", cost: "medium" },
        { action: "Deploy demand surge campaigns in competitor's weakest zones", timeline: "Week 2-4", priority: "high", impact: "Force competitor to spread resources thin", cost: "high" },
      ],
      vendor: [
        { action: "Match competitor incentives for top 10% revenue-generating vendors ONLY", timeline: "48 hours", priority: "critical", impact: "Protect most valuable supply relationships without blanket discounting", cost: "high" },
        { action: "Launch vendor loyalty rewards program with tiered benefits", timeline: "Week 2", priority: "high", impact: "Create long-term switching cost structure", cost: "medium" },
        { action: "Accelerate vendor dashboard feature rollout (analytics, lead quality scoring)", timeline: "Week 3-6", priority: "high", impact: "Product-based retention that money alone cannot buy", cost: "medium" },
      ],
      investor: [
        { action: "Launch investor exclusivity window — 48hr early access to new listings", timeline: "Week 1", priority: "critical", impact: "Create unique demand-side value competitor cannot offer without supply", cost: "low" },
        { action: "Deploy AI-powered deal matching notifications with confidence scores", timeline: "Week 2-3", priority: "high", impact: "Demonstrate intelligence superiority", cost: "medium" },
        { action: "Create investor community group for market intelligence sharing", timeline: "Week 3-4", priority: "medium", impact: "Network effect-based retention", cost: "low" },
      ],
      pricing: [
        { action: "Introduce 'Founder Rate' — locked-in pricing for early adopters", timeline: "Week 1", priority: "high", impact: "Reward loyalty while creating FOMO for new sign-ups", cost: "medium" },
        { action: "Launch performance-based pricing: pay only when you get inquiries", timeline: "Week 3-4", priority: "high", impact: "Reduce perceived risk vs competitor's flat-fee model", cost: "medium" },
        { action: "Bundle premium features into mid-tier plans to increase perceived value", timeline: "Week 2", priority: "medium", impact: "Improve value proposition without reducing price", cost: "low" },
      ],
      brand: [
        { action: "Commission independent market report comparing platform intelligence capabilities", timeline: "Week 2-3", priority: "high", impact: "Third-party validation of technology moat", cost: "medium" },
        { action: "Launch founder thought leadership campaign — LinkedIn, podcasts, media", timeline: "Week 1-4", priority: "high", impact: "Personal brand as proxy for platform credibility", cost: "low" },
        { action: "Host city-level property market event positioning ASTRA as knowledge leader", timeline: "Month 2", priority: "medium", impact: "Physical presence reinforcing digital authority", cost: "high" },
      ],
    },
    phases: [
      { label: "Emergency Shield", duration: "Week 1-2", actions: ["Protect top vendors with targeted incentives", "Activate investor exclusivity features", "Double content & PR output"] },
      { label: "Counter-Offensive", duration: "Week 3-6", actions: ["Launch product features competitor lacks", "Deploy performance-based pricing", "Expand into zones competitor is weak"] },
      { label: "Moat Deepening", duration: "Month 2-4", actions: ["Accelerate AI intelligence features", "Build vendor lock-in through analytics", "Establish institutional partnerships competitor cannot replicate"] },
    ],
  },
  {
    id: "price-war",
    title: "Price-War Competitor",
    icon: <TrendingUp className="h-5 w-5" />,
    severity: 55,
    description: "Competitor undercutting on listing fees, subscription prices, or offering free premium features to capture market share.",
    signals: [
      "Competitor advertising 'free forever' or heavily discounted plans",
      "Vendors asking for price matching or threatening to leave",
      "Social media discussion comparing pricing negatively",
      "Conversion rate dropping on paid plans",
    ],
    defenses: {
      liquidity: [
        { action: "Emphasize inquiry quality over quantity in vendor communications", timeline: "Week 1", priority: "high", impact: "Reframe value proposition away from price", cost: "low" },
        { action: "Publish vendor ROI case studies showing revenue generated on ASTRA", timeline: "Week 2", priority: "high", impact: "Data-driven proof that price ≠ value", cost: "low" },
      ],
      vendor: [
        { action: "Launch 'Guarantee Program' — refund if vendor doesn't get X inquiries in 30 days", timeline: "Week 1-2", priority: "critical", impact: "Eliminate risk perception without lowering price", cost: "medium" },
        { action: "Create exclusive vendor intelligence dashboard unavailable on competitor", timeline: "Week 3-4", priority: "high", impact: "Feature-based differentiation that justifies premium", cost: "medium" },
        { action: "Offer performance bonuses for vendors hitting activity thresholds", timeline: "Week 2", priority: "medium", impact: "Reward engagement, not just presence", cost: "medium" },
      ],
      investor: [
        { action: "Position investor experience as premium — 'you get what you pay for' narrative", timeline: "Week 1", priority: "high", impact: "Attract quality-conscious investors", cost: "low" },
        { action: "Highlight verified listing quality and fraud prevention as safety premium", timeline: "Week 2", priority: "medium", impact: "Trust-based retention for high-value investors", cost: "low" },
      ],
      pricing: [
        { action: "DO NOT match competitor pricing — compete on value, not price", timeline: "Ongoing", priority: "critical", impact: "Preserve unit economics and brand positioning", cost: "low" },
        { action: "Introduce value-add bundles (analytics + boost + featured) at same price point", timeline: "Week 2-3", priority: "high", impact: "Increase perceived value without reducing revenue", cost: "low" },
        { action: "Launch limited-time 'intelligence upgrade' — free trial of premium analytics", timeline: "Week 3", priority: "medium", impact: "Let product quality speak for itself", cost: "medium" },
      ],
      brand: [
        { action: "Publish thought piece: 'Why free platforms cost you more' — data-backed analysis", timeline: "Week 1-2", priority: "high", impact: "Shape market narrative around quality vs price", cost: "low" },
        { action: "Amplify vendor success stories showing concrete revenue results", timeline: "Week 2-4", priority: "medium", impact: "Social proof countering price narrative", cost: "low" },
      ],
    },
    phases: [
      { label: "Hold the Line", duration: "Week 1-2", actions: ["Refuse to discount — communicate value instead", "Launch guarantee program", "Publish ROI case studies"] },
      { label: "Value Amplification", duration: "Week 3-6", actions: ["Roll out intelligence features competitors can't offer for free", "Bundle premium features creatively", "Build vendor success program"] },
      { label: "Outlast", duration: "Month 2-4", actions: ["Monitor competitor burn rate signals", "Prepare to capture vendors when competitor raises prices", "Deepen product moat"] },
    ],
  },
  {
    id: "tech",
    title: "Technology Differentiation Competitor",
    icon: <Zap className="h-5 w-5" />,
    severity: 60,
    description: "Competitor with superior technology (AI, 3D tours, blockchain) threatening to capture innovation-minded users.",
    signals: [
      "Competitor launching AI-powered features getting media coverage",
      "Tech-savvy vendors and investors expressing interest in competitor's tools",
      "Industry blogs positioning competitor as 'innovation leader'",
      "Competitor filing patents or publishing technical content",
    ],
    defenses: {
      liquidity: [
        { action: "Fast-track deployment of AI deal matching and predictive pricing features", timeline: "Week 1-4", priority: "critical", impact: "Close perceived technology gap", cost: "high" },
        { action: "Launch 'ASTRA Intelligence' branded feature set with visible AI indicators", timeline: "Week 2-3", priority: "high", impact: "Create perception of technological parity or superiority", cost: "medium" },
      ],
      vendor: [
        { action: "Offer early access to new AI features for top vendors as beta testers", timeline: "Week 1", priority: "high", impact: "Engage vendors in product development, increasing loyalty", cost: "low" },
        { action: "Create vendor technology education program — how to leverage ASTRA AI tools", timeline: "Week 3-4", priority: "medium", impact: "Increase feature adoption and perceived value", cost: "low" },
      ],
      investor: [
        { action: "Deploy AI-powered market insights newsletter exclusive to ASTRA investors", timeline: "Week 2", priority: "high", impact: "Demonstrate intelligence advantage in investor-relevant context", cost: "low" },
        { action: "Launch predictive price alerts and opportunity scoring for investor dashboards", timeline: "Week 3-6", priority: "high", impact: "Product feature that directly impacts investment decisions", cost: "medium" },
      ],
      pricing: [
        { action: "Position AI features as premium tier differentiator", timeline: "Week 2", priority: "medium", impact: "Monetize technology advantage rather than giving away free", cost: "low" },
        { action: "Create 'Intelligence Access' subscription add-on", timeline: "Week 4-6", priority: "medium", impact: "New revenue stream from technology investment", cost: "medium" },
      ],
      brand: [
        { action: "Publish technical blog series on ASTRA's data architecture and AI capabilities", timeline: "Week 1-3", priority: "critical", impact: "Establish technical credibility in public narrative", cost: "low" },
        { action: "Apply for PropTech innovation awards and industry recognition", timeline: "Month 2", priority: "medium", impact: "Third-party validation of technology leadership", cost: "low" },
        { action: "Partner with university research programs for AI in real estate", timeline: "Month 2-3", priority: "medium", impact: "Long-term credibility and talent pipeline", cost: "medium" },
      ],
    },
    phases: [
      { label: "Rapid Response", duration: "Week 1-2", actions: ["Audit technology gap honestly", "Fast-track highest-impact AI features", "Launch technical content campaign"] },
      { label: "Innovation Sprint", duration: "Week 3-8", actions: ["Deploy AI features with visible branding", "Create vendor & investor beta programs", "Secure innovation awards submissions"] },
      { label: "Leadership Position", duration: "Month 3-6", actions: ["Build proprietary data advantage competitor cannot replicate", "Establish research partnerships", "File provisional patents on unique algorithms"] },
    ],
  },
];

const priorityColor = (p: string) => {
  if (p === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
  if (p === "high") return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
  return "bg-muted text-muted-foreground border-border";
};

const costBadge = (c: string) => {
  if (c === "high") return "destructive" as const;
  if (c === "medium") return "secondary" as const;
  return "outline" as const;
};

/* ───────── component ───────── */

const CompetitiveThreatResponse: React.FC = () => {
  const [expandedScenario, setExpandedScenario] = useState<string | null>("funded");
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedAction(null), 2000);
  };

  const toggle = (id: string) => setExpandedScenario(prev => prev === id ? null : id);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Competitive Threat Response"
        description="Scenario-based defense playbooks for marketplace liquidity, vendor loyalty, investor retention & brand authority"
        icon={Shield}
        badge={{ text: "⚔️ Defense", variant: "outline" }}
      />

      {/* Severity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map(s => (
          <Card
            key={s.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-border"
            onClick={() => toggle(s.id)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {s.icon}
                <span className="text-sm font-semibold text-foreground truncate">{s.title}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Risk Severity</span>
                  <span>{s.severity}%</span>
                </div>
                <Progress value={s.severity} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scenario Details */}
      {scenarios.map(scenario => (
        <Card key={scenario.id} className="border-border overflow-hidden">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => toggle(scenario.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">
                  {scenario.icon}
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{scenario.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
                </div>
              </div>
              {expandedScenario === scenario.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expandedScenario === scenario.id && (
            <CardContent className="space-y-6 pt-0">
              {/* Warning Signals */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> Detection Signals
                </h4>
                <ul className="grid md:grid-cols-2 gap-1.5">
                  {scenario.signals.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 bg-muted/50 rounded-[6px] p-2">
                      <span className="text-orange-500 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Defense Strategies by Category */}
              <Tabs defaultValue="liquidity" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="liquidity" className="text-xs">Liquidity</TabsTrigger>
                  <TabsTrigger value="vendor" className="text-xs">Vendor</TabsTrigger>
                  <TabsTrigger value="investor" className="text-xs">Investor</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
                  <TabsTrigger value="brand" className="text-xs">Brand</TabsTrigger>
                </TabsList>

                {(Object.entries(scenario.defenses) as [string, DefenseAction[]][]).map(([cat, actions]) => (
                  <TabsContent key={cat} value={cat} className="space-y-2 mt-3">
                    {actions.map((a, i) => {
                      const actionId = `${scenario.id}-${cat}-${i}`;
                      return (
                        <div key={i} className={`rounded-[6px] border p-3 space-y-2 ${priorityColor(a.priority)}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug flex-1">{a.action}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 shrink-0"
                              onClick={() => copyText(a.action, actionId)}
                            >
                              {copiedAction === actionId ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{a.timeline}</Badge>
                            <Badge variant={costBadge(a.cost)}>Cost: {a.cost}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic">Impact: {a.impact}</p>
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>

              {/* Phased Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Response Phases
                </h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {scenario.phases.map((phase, i) => (
                    <div key={i} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">{phase.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{phase.duration}</span>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {phase.actions.map((a, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">→</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Long-Term Moat Strengthening */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" /> Long-Term Moat Strengthening Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: "Data Intelligence Moat", items: ["Accumulate proprietary transaction data competitors cannot access", "Build predictive models that improve with every interaction", "Create intelligence products (reports, indices) that become industry standard"] },
              { title: "Network Effect Lock-In", items: ["Increase vendor-to-investor connection density", "Build community features that create social switching costs", "Establish institutional partnerships with exclusivity clauses"] },
              { title: "Brand Authority Fortress", items: ["Become the default source for market data citations", "Maintain consistent thought leadership presence", "Build founder personal brand as industry voice"] },
              { title: "Product Depth Advantage", items: ["Continuously ship features that increase daily usage", "Integrate deeply into vendor workflows (CRM, analytics)", "Create investor tools that become indispensable for decisions"] },
            ].map((moat, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-4 space-y-2">
                <h5 className="text-sm font-semibold text-foreground">{moat.title}</h5>
                <ul className="space-y-1">
                  {moat.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveThreatResponse;
