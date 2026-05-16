import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle, Shield, TrendingUp, Zap, Clock,
  Target, DollarSign, Users, BarChart3, ArrowRight,
  CheckCircle, Flame, RefreshCw, Megaphone, Crown,
  Activity, ChevronDown, ChevronUp, Sparkles, Eye
} from "lucide-react";
import { motion } from "framer-motion";

interface Action {
  id: string;
  text: string;
  impact: "critical" | "high" | "medium";
  cost: "zero" | "low" | "medium";
  metric: string;
}

interface Phase {
  id: string;
  label: string;
  timeline: string;
  objective: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  sections: { title: string; icon: React.ElementType; actions: Action[] }[];
  kpis: { label: string; target: string; baseline: string }[];
}

const phases: Phase[] = [
  {
    id: "P1", label: "PHASE 1 — Emergency Response", timeline: "0-48 Hours", objective: "Stop the bleeding. Stabilize inquiry flow, reactivate vendors, prevent investor churn.",
    icon: Flame, color: "text-destructive", badgeColor: "bg-destructive/15 text-destructive",
    sections: [
      {
        title: "Immediate Demand Injection", icon: Zap,
        actions: [
          { id: "1a", text: "Flash-activate all unused boost credits across live listings — instant visibility spike", impact: "critical", cost: "zero", metric: "Listing impressions +200% within 4h" },
          { id: "1b", text: "Push 'Hot Deal' alert to all investors who saved properties in the last 30 days", impact: "critical", cost: "zero", metric: "Re-engagement rate >15%" },
          { id: "1c", text: "Enable 'Price Drop' badges on any listing with recent price reduction", impact: "high", cost: "zero", metric: "CTR increase +25% on flagged listings" },
          { id: "1d", text: "Trigger geo-targeted push notifications: 'New deals in your area this week'", impact: "high", cost: "zero", metric: "App open rate >8%" },
        ],
      },
      {
        title: "Vendor Emergency Reactivation", icon: Users,
        actions: [
          { id: "1e", text: "Send personal WhatsApp to top 20 vendors: 'We have investor demand — update your listings today'", impact: "critical", cost: "zero", metric: "50% response rate within 24h" },
          { id: "1f", text: "Grant 48-hour free premium visibility to all vendors who update listings within 24h", impact: "critical", cost: "low", metric: "30+ listing refreshes in 24h" },
          { id: "1g", text: "Pause ranking penalties for recently inactive vendors (7-day grace)", impact: "medium", cost: "zero", metric: "Reduce vendor churn signal by 40%" },
          { id: "1h", text: "Call top 5 churning vendors directly — understand blockers, offer immediate support", impact: "high", cost: "zero", metric: "3/5 vendors reactivated" },
        ],
      },
      {
        title: "Revenue Emergency Measures", icon: DollarSign,
        actions: [
          { id: "1i", text: "Launch 24-hour flash sale: 50% off first deal unlock for investors", impact: "critical", cost: "low", metric: "Unlock volume +60% in 24h" },
          { id: "1j", text: "Enable 'Inquiry Guarantee' messaging: 'List today, get inquiries in 72h or free boost'", impact: "high", cost: "low", metric: "New listings +15 in 48h" },
          { id: "1k", text: "Reduce minimum boost package price by 30% for 48 hours", impact: "high", cost: "medium", metric: "Boost purchase rate +40%" },
        ],
      },
    ],
    kpis: [
      { label: "Inquiry Volume", target: "Restore to 80% of 30-day average", baseline: "Current: declining" },
      { label: "Active Vendor Rate", target: ">60% of registered vendors active", baseline: "Current: declining" },
      { label: "Daily Revenue", target: "Stabilize — stop decline trajectory", baseline: "Current: falling" },
    ],
  },
  {
    id: "P2", label: "PHASE 2 — Liquidity Rebuilding", timeline: "Day 3-14", objective: "Rebuild supply-demand equilibrium. Fix structural imbalances. Restore marketplace health metrics.",
    icon: RefreshCw, color: "text-amber-400", badgeColor: "bg-amber-500/15 text-amber-400",
    sections: [
      {
        title: "Supply Acquisition Acceleration", icon: Users,
        actions: [
          { id: "2a", text: "Launch 'Founding Vendor' campaign — 90-day free premium for agents who list 5+ properties this week", impact: "critical", cost: "medium", metric: "+50 new listings in 7 days" },
          { id: "2b", text: "Deploy geo-targeted cold outreach to agents in undersupplied districts (use Vendor Outreach Scripts)", impact: "high", cost: "low", metric: "+20 new vendor signups in 10 days" },
          { id: "2c", text: "Identify and manually seed 30 high-quality listings in gap districts", impact: "high", cost: "medium", metric: "Eliminate 0-listing districts" },
          { id: "2d", text: "Partner with 3 local agencies for bulk listing upload — offer co-marketing in exchange", impact: "high", cost: "low", metric: "+100 listings in 14 days" },
        ],
      },
      {
        title: "Demand Stimulation Campaigns", icon: Megaphone,
        actions: [
          { id: "2e", text: "Launch 7-day investor reactivation email drip (use Investor Nurturing Sequence)", impact: "critical", cost: "low", metric: "10% dormant investor reactivation" },
          { id: "2f", text: "Run hyper-local Instagram/Facebook ads (3km radius) around high-inventory areas", impact: "high", cost: "medium", metric: "CPA <Rp 50K, +150 new investor signups" },
          { id: "2g", text: "Create weekly 'Market Intelligence Report' content — distribute via email + social", impact: "medium", cost: "low", metric: "Email open rate >25%, social engagement +40%" },
          { id: "2h", text: "Activate AI-curated 'Deal of the Week' featuring highest-liquidity property", impact: "high", cost: "zero", metric: "Featured listing inquiry rate >20%" },
        ],
      },
      {
        title: "Pricing Psychology Reset", icon: Crown,
        actions: [
          { id: "2i", text: "Implement anchor pricing on all boost packages — show crossed-out 'original' price", impact: "high", cost: "zero", metric: "Boost purchase rate +25%" },
          { id: "2j", text: "Add 'X investors viewed this property' social proof to all listing pages", impact: "high", cost: "zero", metric: "Inquiry rate +15%" },
          { id: "2k", text: "Create 3-tier vendor subscription with decoy middle tier", impact: "medium", cost: "zero", metric: "Premium tier selection +30%" },
          { id: "2l", text: "Enable dynamic pricing hints: 'Similar properties sold 8% above asking in this area'", impact: "medium", cost: "zero", metric: "Perceived value increase" },
        ],
      },
    ],
    kpis: [
      { label: "Inquiry Velocity", target: "Return to 100% of 30-day average + 10% growth", baseline: "Phase 1 stabilized level" },
      { label: "Listings Growth", target: "+100 net new active listings", baseline: "Current active count" },
      { label: "Supply-Demand Ratio", target: "< 2.0 (listings per active buyer)", baseline: "Current: imbalanced" },
      { label: "Vendor Activation", target: ">70% vendors active in last 7 days", baseline: "Phase 1 level" },
    ],
  },
  {
    id: "P3", label: "PHASE 3 — Growth Momentum Restoration", timeline: "Day 15-30", objective: "Transition from recovery to sustainable growth. Rebuild flywheel velocity. Exceed pre-crisis metrics.",
    icon: TrendingUp, color: "text-emerald-500", badgeColor: "bg-emerald-500/15 text-emerald-500",
    sections: [
      {
        title: "Flywheel Acceleration", icon: Activity,
        actions: [
          { id: "3a", text: "Launch agent referral program — Rp 500K credit per referred agent who lists 3+ properties", impact: "high", cost: "medium", metric: "K-factor >0.3, +40 agents/month" },
          { id: "3b", text: "Activate investor referral loop — 1 free unlock per 3 referred signups", impact: "high", cost: "low", metric: "+120 organic investor signups/month" },
          { id: "3c", text: "Implement automated vendor performance gamification (leaderboards, badges, streaks)", impact: "medium", cost: "low", metric: "Vendor engagement time +25%" },
          { id: "3d", text: "Launch 'Verified Investor' badge program — build trust signal for vendors", impact: "medium", cost: "zero", metric: "Vendor satisfaction +15%" },
        ],
      },
      {
        title: "Monetization Expansion", icon: DollarSign,
        actions: [
          { id: "3e", text: "Introduce 'Investor Intelligence Report' premium subscription (monthly data access)", impact: "critical", cost: "low", metric: "New revenue stream: target Rp 20M/month" },
          { id: "3f", text: "Launch featured vendor spotlight — sponsored profile placement in investor feeds", impact: "high", cost: "zero", metric: "New revenue stream: target Rp 10M/month" },
          { id: "3g", text: "Enable AI-suggested upsells at point of inquiry — 'Unlock 3 deals, save 20%'", impact: "high", cost: "zero", metric: "Bundle purchase rate >15%" },
          { id: "3h", text: "Activate surge pricing on boosts during high-demand periods (auto-detected)", impact: "medium", cost: "zero", metric: "Revenue per boost +20%" },
        ],
      },
      {
        title: "Structural Resilience", icon: Shield,
        actions: [
          { id: "3i", text: "Set up automated crisis detection: alert when inquiry velocity drops >15% week-over-week", impact: "critical", cost: "low", metric: "Crisis response time <4 hours" },
          { id: "3j", text: "Build automated vendor health scoring with proactive nudge triggers", impact: "high", cost: "low", metric: "Vendor churn prediction accuracy >80%" },
          { id: "3k", text: "Create liquidity reserve playbook — pre-approved emergency campaigns ready to deploy", impact: "high", cost: "zero", metric: "Future recovery time <24h" },
          { id: "3l", text: "Implement weekly marketplace health dashboard review (Founder War Room)", impact: "medium", cost: "zero", metric: "Continuous visibility into risk signals" },
        ],
      },
    ],
    kpis: [
      { label: "Inquiry Velocity", target: "120% of pre-crisis level (net growth)", baseline: "Phase 2 restored level" },
      { label: "Monthly Revenue", target: "Exceed pre-crisis monthly revenue by 15%", baseline: "Phase 2 stabilized" },
      { label: "Vendor Retention", target: ">85% 90-day retention rate", baseline: "Phase 2 level" },
      { label: "Marketplace Health Score", target: ">80/100 composite score", baseline: "Phase 2 level" },
    ],
  },
];

const impactColors: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  high: "bg-amber-500/15 text-amber-400",
  medium: "bg-muted text-muted-foreground",
};
const costColors: Record<string, string> = {
  zero: "bg-emerald-500/15 text-emerald-500",
  low: "bg-cyan-500/15 text-cyan-400",
  medium: "bg-amber-500/15 text-amber-400",
};

const LiquidityCrisisRecovery = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedPhase, setExpandedPhase] = useState<string>("P1");

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const allActions = phases.flatMap(p => p.sections.flatMap(s => s.actions));
  const totalChecked = allActions.filter(a => checked[a.id]).length;
  const totalActions = allActions.length;

  const phaseProgress = (phase: Phase) => {
    const actions = phase.sections.flatMap(s => s.actions);
    const done = actions.filter(a => checked[a.id]).length;
    return actions.length > 0 ? Math.round((done / actions.length) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Liquidity Crisis Recovery Plan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          3-phase emergency framework — 48h stabilization → 14-day liquidity rebuild → 30-day growth restoration
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground">Overall Recovery Progress</p>
            <p className="text-xs text-muted-foreground">{totalChecked}/{totalActions} actions</p>
          </div>
          <Progress value={(totalChecked / totalActions) * 100} className="h-2 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {phases.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <p.icon className={`h-4 w-4 ${p.color}`} />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">{p.timeline}</p>
                  <Progress value={phaseProgress(p)} className="h-1 mt-0.5" />
                </div>
                <span className="text-[10px] font-bold text-foreground">{phaseProgress(p)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      {phases.map((phase, pi) => {
        const isOpen = expandedPhase === phase.id;
        return (
          <motion.div key={phase.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
            <Card className="border-border/40 bg-card/70">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedPhase(isOpen ? "" : phase.id)}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <phase.icon className={`h-5 w-5 ${phase.color}`} />
                    <CardTitle className="text-sm">{phase.label}</CardTitle>
                    <Badge className={`text-[10px] ${phase.badgeColor}`}>{phase.timeline}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{phaseProgress(phase)}% complete</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                {!isOpen && (
                  <p className="text-xs text-muted-foreground mt-1">{phase.objective}</p>
                )}
              </CardHeader>

              {isOpen && (
                <CardContent className="space-y-4 pt-0">
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" />Objective</p>
                    <p className="text-xs text-foreground">{phase.objective}</p>
                  </div>

                  {phase.sections.map((section, si) => (
                    <div key={si} className="space-y-2">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <section.icon className="h-4 w-4 text-primary" />{section.title}
                      </p>
                      {section.actions.map(action => (
                        <div key={action.id} className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${checked[action.id] ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/20"}`}>
                          <Checkbox checked={!!checked[action.id]} onCheckedChange={() => toggle(action.id)} className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${checked[action.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>{action.text}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge className={`text-[9px] ${impactColors[action.impact]}`}>{action.impact}</Badge>
                              <Badge className={`text-[9px] ${costColors[action.cost]}`}>{action.cost === "zero" ? "$0" : action.cost} cost</Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><BarChart3 className="h-3 w-3" />{action.metric}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* KPIs */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary uppercase mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3" />Recovery KPIs</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.kpis.map((kpi, ki) => (
                        <div key={ki} className="p-2 rounded-md bg-background/50 border border-border/20">
                          <p className="text-xs font-medium text-foreground">{kpi.label}</p>
                          <p className="text-[10px] text-primary flex items-center gap-1 mt-0.5"><ArrowRight className="h-3 w-3" />{kpi.target}</p>
                          <p className="text-[10px] text-muted-foreground">{kpi.baseline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        );
      })}

      {/* Prioritization Matrix */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-primary" />Prioritization Logic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Fastest Liquidity Restoration", items: ["Flash-activate boost credits (P1)", "Hot Deal alert to saved-property investors (P1)", "Vendor reactivation WhatsApp blitz (P1)", "AI-curated Deal of the Week (P2)"], icon: Zap, color: "text-destructive" },
              { title: "Lowest Cost Interventions", items: ["Price Drop badges on reduced listings ($0)", "Social proof viewer counts ($0)", "Anchor pricing on boost packages ($0)", "Automated crisis detection alerts ($0)"], icon: DollarSign, color: "text-emerald-500" },
              { title: "Highest Revenue Recovery", items: ["Flash sale on deal unlocks (P1)", "Investor reactivation drip sequence (P2)", "Intelligence Report subscription (P3)", "Surge pricing on boosts (P3)"], icon: Crown, color: "text-amber-400" },
            ].map((col, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/20">
                <p className={`text-xs font-bold flex items-center gap-1.5 mb-2 ${col.color}`}><col.icon className="h-4 w-4" />{col.title}</p>
                {col.items.map((item, ii) => (
                  <p key={ii} className="text-[11px] text-foreground mb-1 flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />{item}
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

export default LiquidityCrisisRecovery;
