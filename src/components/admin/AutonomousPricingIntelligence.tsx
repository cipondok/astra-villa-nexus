import React, { useState } from "react";
import { Cpu, Copy, Check, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Shield, Zap, BarChart3, AlertTriangle, Clock, Settings, Eye, Activity, DollarSign, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── data ───────── */

interface PricingModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  triggerSignals: { signal: string; threshold: string; weight: number }[];
  actions: { action: string; condition: string; magnitude: string }[];
  guardrails: string[];
}

const modules: PricingModule[] = [
  {
    id: "surge",
    title: "Surge Pricing Engine",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Detects high-demand conditions and dynamically increases pricing on listing boosts, premium placements, and deal unlock fees to capture maximum willingness-to-pay during demand spikes.",
    triggerSignals: [
      { signal: "Inquiry velocity exceeds 2.5σ above 14-day mean", threshold: ">2.5σ", weight: 25 },
      { signal: "District-level viewing requests surge >40% WoW", threshold: ">40% WoW", weight: 22 },
      { signal: "Watchlist additions spike >3x daily average", threshold: ">3x avg", weight: 18 },
      { signal: "Investor session frequency increases >50%", threshold: ">50%", weight: 20 },
      { signal: "Competitor platform listing removal detected", threshold: ">10 removals/day", weight: 15 },
    ],
    actions: [
      { action: "Increase listing boost price by 15-40%", condition: "Composite surge score >70/100", magnitude: "Rp 150K → Rp 210K base" },
      { action: "Activate premium placement bidding mode", condition: "District demand index >80", magnitude: "Dynamic auction, floor +20%" },
      { action: "Increase deal unlock fee by 10-25%", condition: "Property inquiry count >15 in 48hrs", magnitude: "Rp 99K → Rp 124K per unlock" },
      { action: "Launch time-limited 'Hot Market' boost tier", condition: "Surge sustained >72hrs", magnitude: "Premium tier at 2x standard" },
    ],
    guardrails: [
      "Maximum surge multiplier capped at 2.5x base price",
      "Surge pricing auto-expires after 7 days without renewal",
      "Vendor churn monitoring: freeze if churn >5% within surge period",
      "User sentiment score must remain >60/100 during active surge",
    ],
  },
  {
    id: "drought",
    title: "Liquidity Drought Discount Engine",
    icon: <TrendingDown className="h-5 w-5" />,
    description: "Detects low-demand or oversupply conditions and activates strategic discounts, free trials, and incentive bundles to stimulate marketplace activity and prevent vendor churn.",
    triggerSignals: [
      { signal: "Inquiry velocity drops >30% below 7-day average", threshold: "<-30%", weight: 25 },
      { signal: "Zero-engagement listings exceed 35% of inventory", threshold: ">35%", weight: 22 },
      { signal: "Vendor login frequency declining >40% WoW", threshold: "<-40%", weight: 20 },
      { signal: "Investor DAU declining 5+ consecutive weekdays", threshold: "5-day decline", weight: 18 },
      { signal: "Revenue conversion rate drops >25% WoW", threshold: "<-25%", weight: 15 },
    ],
    actions: [
      { action: "Activate 50% discount on listing boosts for 72hrs", condition: "Drought score >65/100", magnitude: "Rp 150K → Rp 75K" },
      { action: "Offer free 7-day premium trial to inactive vendors", condition: "Vendor inactivity >14 days", magnitude: "Zero cost, reactivation target" },
      { action: "Launch 'Guaranteed Inquiry' promotion", condition: "Zero-engagement listings >40%", magnitude: "Refund if <3 inquiries in 30 days" },
      { action: "Reduce investor subscription entry price 30%", condition: "New sign-up rate drops >40%", magnitude: "Rp 299K → Rp 209K for first month" },
    ],
    guardrails: [
      "Discount duration capped at 14 days per activation cycle",
      "Maximum revenue sacrifice threshold: 20% of projected monthly revenue",
      "Automatic escalation to human review if 2+ drought cycles in 30 days",
      "Price floor: never discount below marginal cost of service delivery",
    ],
  },
  {
    id: "vendor-upgrade",
    title: "Vendor Upgrade Probability Model",
    icon: <Gauge className="h-5 w-5" />,
    description: "Scores each vendor's likelihood of upgrading to premium tiers based on engagement signals, listing performance, and competitive positioning. Triggers personalized upgrade offers at optimal conversion moments.",
    triggerSignals: [
      { signal: "Vendor listing receives >10 inquiries in 7 days", threshold: ">10 inquiries/week", weight: 25 },
      { signal: "Vendor views competitor premium listings", threshold: ">3 views", weight: 20 },
      { signal: "Vendor dashboard engagement >5 sessions/week", threshold: ">5 sessions", weight: 18 },
      { signal: "Vendor listing rank drops below fold position", threshold: "Below position #10", weight: 20 },
      { signal: "Vendor has been active >30 days on free tier", threshold: ">30 days free", weight: 17 },
    ],
    actions: [
      { action: "Send personalized upgrade email with ROI projection", condition: "Upgrade probability >70%", magnitude: "Expected +3.2 inquiries/week" },
      { action: "Show in-app upgrade prompt with real-time competitor data", condition: "Vendor views premium features", magnitude: "Contextual nudge" },
      { action: "Offer time-limited upgrade discount (20% off first 3 months)", condition: "Probability >60% + free tier >45 days", magnitude: "Rp 199K → Rp 159K/mo" },
      { action: "Auto-boost one listing free as premium preview", condition: "High-potential vendor, probability >80%", magnitude: "48hr free boost trial" },
    ],
    guardrails: [
      "Maximum 2 upgrade prompts per vendor per week",
      "Suppress prompts for vendors with negative sentiment signals",
      "Track prompt-to-upgrade conversion: pause if <5% conversion after 100 impressions",
      "Never offer discounts to vendors already in upgrade consideration funnel",
    ],
  },
  {
    id: "investor-urgency",
    title: "Investor Urgency Monetization Timer",
    icon: <Clock className="h-5 w-5" />,
    description: "Identifies moments of peak investor urgency — when decision pressure and FOMO converge — to present premium access offers, deal unlock fees, and priority viewing slots at maximum willingness-to-pay.",
    triggerSignals: [
      { signal: "Investor views same listing >5 times in 48hrs", threshold: ">5 revisits", weight: 25 },
      { signal: "Investor opens deal unlock modal but doesn't pay", threshold: ">2 abandons", weight: 22 },
      { signal: "Watchlisted property receives competing offers", threshold: ">1 offer on watchlist item", weight: 20 },
      { signal: "Investor searches same district >10 times in 7 days", threshold: ">10 searches", weight: 18 },
      { signal: "Investor session duration exceeds 15 minutes on single listing", threshold: ">15 min", weight: 15 },
    ],
    actions: [
      { action: "Show limited-time deal unlock discount (15% off, 4hr window)", condition: "Urgency score >75 + abandon count >1", magnitude: "Rp 99K → Rp 84K for 4hrs" },
      { action: "Push 'X investors viewing this property' social proof notification", condition: "Urgency score >60 + competing activity detected", magnitude: "Real-time notification" },
      { action: "Offer priority viewing slot at premium price", condition: "Viewing requests >3 on same property", magnitude: "Rp 250K for guaranteed next-day viewing" },
      { action: "Bundle deal unlock + AI valuation report at 20% bundle discount", condition: "Urgency score >70 + repeat visitor", magnitude: "Rp 198K → Rp 158K bundle" },
    ],
    guardrails: [
      "Maximum 1 urgency offer per investor per 24hrs",
      "Suppress urgency tactics for investors who've complained about pressure",
      "All urgency messaging must include accurate, real-time data (no fake scarcity)",
      "Monitor conversion-to-complaint ratio: pause if complaints >2% of impressions",
    ],
  },
];

const dataFlowSteps = [
  { step: 1, title: "Signal Ingestion", desc: "Real-time events from user behavior, listing engagement, and market conditions flow into the pricing signal queue via database triggers." },
  { step: 2, title: "Composite Scoring", desc: "Weighted signal aggregation produces module-specific scores (Surge Score, Drought Score, Upgrade Probability, Urgency Score) every 5 minutes." },
  { step: 3, title: "Confidence Gating", desc: "Scores are validated against confidence thresholds. Actions below 85% confidence are queued for human review; above 90% auto-execute." },
  { step: 4, title: "Price Adjustment", desc: "Approved adjustments are applied to the pricing layer. Changes are logged with full audit trail and rollback capability." },
  { step: 5, title: "Impact Monitoring", desc: "Revenue, conversion, churn, and sentiment metrics are tracked in real-time against pre-adjustment baselines." },
  { step: 6, title: "Learning Loop", desc: "Outcome data feeds back to recalibrate signal weights every 6 hours via the learning-engine worker. Model drift triggers automatic retraining." },
];

const governanceConfig = [
  { level: "Auto-Execute", confidence: "≥90%", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30", desc: "Low-risk adjustments within ±15% of base price. Full audit logging.", examples: ["5% boost price increase during mild demand uptick", "Standard upgrade prompt to high-probability vendor"] },
  { level: "Queue for Review", confidence: "75-89%", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", desc: "Medium-risk adjustments. Queued in admin dashboard for approval within 4 hours.", examples: ["20%+ surge pricing activation", "Drought discount exceeding 30%", "New monetization trigger type"] },
  { level: "Human Required", confidence: "<75%", color: "bg-destructive/10 text-destructive border-destructive/30", desc: "High-risk or novel situations. Blocked until manual approval. Includes full context briefing.", examples: ["Pricing changes during competitive crisis", "Adjustments affecting >100 active users simultaneously", "Any pricing change >40% from baseline"] },
];

/* ───────── component ───────── */

const AutonomousPricingIntelligence: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>("surge");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoExecute, setAutoExecute] = useState<Record<string, boolean>>({
    surge: false, drought: true, "vendor-upgrade": true, "investor-urgency": false,
  });

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggle = (id: string) => setExpandedModule(prev => (prev === id ? null : id));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Autonomous Pricing Intelligence"
        description="Dynamic pricing system with surge, drought, upgrade & urgency modules — confidence gating, governance controls & learning loops"
        icon={Cpu}
        badge={{ text: "🤖 AI Pricing", variant: "outline" }}
      />

      {/* Module Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modules.map(m => (
          <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow border-border" onClick={() => toggle(m.id)}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {m.icon}
                <span className="text-xs font-semibold text-foreground truncate">{m.title.replace(" Engine", "").replace(" Model", "").replace(" Timer", "")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{m.triggerSignals.length} signals · {m.actions.length} actions</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Auto</span>
                  <Switch
                    checked={autoExecute[m.id] ?? false}
                    onCheckedChange={(v) => {
                      setAutoExecute(prev => ({ ...prev, [m.id]: v }));
                      toast.success(`${m.title} auto-execute ${v ? "enabled" : "disabled"}`);
                    }}
                    className="scale-75"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Detail Cards */}
      {modules.map(module => (
        <Card key={module.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => toggle(module.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{module.icon}</div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{module.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                </div>
              </div>
              {expandedModule === module.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expandedModule === module.id && (
            <CardContent className="space-y-5 pt-0">
              <Tabs defaultValue="signals" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="signals" className="text-xs">Trigger Signals</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">Pricing Actions</TabsTrigger>
                  <TabsTrigger value="guardrails" className="text-xs">Guardrails</TabsTrigger>
                </TabsList>

                <TabsContent value="signals" className="space-y-2 mt-3">
                  {module.triggerSignals.map((sig, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-3 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium">{sig.signal}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{sig.threshold}</Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground">W:</span>
                        <Progress value={sig.weight} className="h-1.5 w-12" />
                        <span className="text-[10px] text-muted-foreground">{sig.weight}%</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="actions" className="space-y-2 mt-3">
                  {module.actions.map((act, i) => {
                    const actId = `${module.id}-act-${i}`;
                    return (
                      <div key={i} className="rounded-[6px] border border-border p-3 space-y-1.5 group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{act.action}</p>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copyText(act.action, actId)}>
                            {copiedId === actId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary" className="text-[10px]">{act.condition}</Badge>
                          <Badge variant="outline" className="text-[10px]">{act.magnitude}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="guardrails" className="space-y-1.5 mt-3">
                  {module.guardrails.map((g, i) => (
                    <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2.5">
                      <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{g}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Governance Framework */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> Automation Governance Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {governanceConfig.map((tier, i) => (
            <div key={i} className={`rounded-[6px] border p-3 space-y-2 ${tier.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{tier.level}</span>
                <Badge variant="outline" className="text-xs">Confidence {tier.confidence}</Badge>
              </div>
              <p className="text-xs opacity-80">{tier.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tier.examples.map((ex, j) => (
                  <Badge key={j} variant="outline" className="text-[10px] font-normal">{ex}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Flow Architecture */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Data Flow & Learning Loop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {dataFlowSteps.map(step => (
              <div key={step.step} className="rounded-[6px] border border-border bg-card p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{step.step}</div>
                  <span className="text-sm font-semibold text-foreground">{step.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Impact Monitoring */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Revenue Impact Monitoring KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: "Revenue Metrics", items: ["ARPU change vs pre-adjustment baseline", "Total revenue impact per pricing action", "Revenue concentration risk (top 10% users)", "Pricing action ROI (revenue gained / opportunity cost)"] },
              { title: "Conversion Metrics", items: ["Boost purchase conversion rate by price tier", "Subscription upgrade rate post-adjustment", "Deal unlock abandonment rate change", "Free-to-paid conversion velocity"] },
              { title: "Health Metrics", items: ["Vendor churn rate within 7 days of price change", "Investor NPS score trend post-adjustment", "Support ticket volume spike detection", "Platform sentiment score (social + in-app)"] },
              { title: "Learning Metrics", items: ["Model prediction accuracy (actual vs projected impact)", "Signal weight drift detection frequency", "Experiment win rate (% of adjustments that improved revenue)", "Time-to-learning (hours to statistically significant result)"] },
            ].map((group, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                <h6 className="text-xs font-semibold text-foreground">{group.title}</h6>
                {group.items.map((item, j) => (
                  <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>{item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousPricingIntelligence;
