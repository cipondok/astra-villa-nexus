import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map, TrendingUp, AlertTriangle, Zap, Target, DollarSign,
  BarChart3, Building2, Users, Layers, Sparkles, ChevronRight,
  Shield, Clock, Flame, ArrowRight, Globe, MapPin, Rocket,
  Crown, Activity, Copy, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Strategy = "aggressive" | "sequential" | "capital-efficient";
type Budget = "1b" | "2b" | "4b" | "8b";

interface CityData {
  name: string;
  tier: 1 | 2 | 3;
  population: string;
  propertyTAM: string;
  liquidityReadiness: number;
  revenuePotential: number;
  opComplexity: number;
  competitiveIntensity: number;
  vendorDifficulty: number;
  marketingIntensity: number;
  rampMonths: number;
  monthlyRevTarget: string;
  phase: 1 | 2 | 3;
  launchCost: string;
  breakEvenMonths: number;
}

const cities: CityData[] = [
  { name: "Surabaya", tier: 1, population: "2.9M", propertyTAM: "Rp 48T", liquidityReadiness: 78, revenuePotential: 85, opComplexity: 35, competitiveIntensity: 55, vendorDifficulty: 40, marketingIntensity: 50, rampMonths: 4, monthlyRevTarget: "Rp 180M", phase: 1, launchCost: "Rp 1.2B", breakEvenMonths: 8 },
  { name: "Bandung", tier: 1, population: "2.5M", propertyTAM: "Rp 35T", liquidityReadiness: 72, revenuePotential: 75, opComplexity: 30, competitiveIntensity: 45, vendorDifficulty: 35, marketingIntensity: 45, rampMonths: 4, monthlyRevTarget: "Rp 140M", phase: 1, launchCost: "Rp 950M", breakEvenMonths: 7 },
  { name: "Medan", tier: 1, population: "2.2M", propertyTAM: "Rp 28T", liquidityReadiness: 65, revenuePotential: 70, opComplexity: 50, competitiveIntensity: 35, vendorDifficulty: 55, marketingIntensity: 60, rampMonths: 5, monthlyRevTarget: "Rp 120M", phase: 1, launchCost: "Rp 1.1B", breakEvenMonths: 10 },
  { name: "Semarang", tier: 2, population: "1.8M", propertyTAM: "Rp 22T", liquidityReadiness: 60, revenuePotential: 62, opComplexity: 28, competitiveIntensity: 30, vendorDifficulty: 38, marketingIntensity: 48, rampMonths: 5, monthlyRevTarget: "Rp 95M", phase: 2, launchCost: "Rp 780M", breakEvenMonths: 9 },
  { name: "Makassar", tier: 2, population: "1.5M", propertyTAM: "Rp 18T", liquidityReadiness: 55, revenuePotential: 60, opComplexity: 55, competitiveIntensity: 25, vendorDifficulty: 60, marketingIntensity: 65, rampMonths: 6, monthlyRevTarget: "Rp 80M", phase: 2, launchCost: "Rp 850M", breakEvenMonths: 11 },
  { name: "Yogyakarta", tier: 2, population: "0.4M", propertyTAM: "Rp 15T", liquidityReadiness: 68, revenuePotential: 58, opComplexity: 25, competitiveIntensity: 40, vendorDifficulty: 30, marketingIntensity: 40, rampMonths: 4, monthlyRevTarget: "Rp 70M", phase: 2, launchCost: "Rp 650M", breakEvenMonths: 8 },
  { name: "Denpasar/Bali", tier: 1, population: "0.9M", propertyTAM: "Rp 42T", liquidityReadiness: 82, revenuePotential: 90, opComplexity: 40, competitiveIntensity: 70, vendorDifficulty: 45, marketingIntensity: 55, rampMonths: 3, monthlyRevTarget: "Rp 220M", phase: 1, launchCost: "Rp 1.4B", breakEvenMonths: 7 },
  { name: "Balikpapan", tier: 3, population: "0.7M", propertyTAM: "Rp 10T", liquidityReadiness: 45, revenuePotential: 50, opComplexity: 60, competitiveIntensity: 20, vendorDifficulty: 65, marketingIntensity: 70, rampMonths: 7, monthlyRevTarget: "Rp 45M", phase: 3, launchCost: "Rp 600M", breakEvenMonths: 13 },
  { name: "Palembang", tier: 2, population: "1.6M", propertyTAM: "Rp 14T", liquidityReadiness: 48, revenuePotential: 52, opComplexity: 50, competitiveIntensity: 22, vendorDifficulty: 58, marketingIntensity: 62, rampMonths: 6, monthlyRevTarget: "Rp 55M", phase: 3, launchCost: "Rp 720M", breakEvenMonths: 12 },
  { name: "Manado", tier: 3, population: "0.4M", propertyTAM: "Rp 7T", liquidityReadiness: 38, revenuePotential: 42, opComplexity: 65, competitiveIntensity: 15, vendorDifficulty: 70, marketingIntensity: 75, rampMonths: 8, monthlyRevTarget: "Rp 30M", phase: 3, launchCost: "Rp 550M", breakEvenMonths: 15 },
  { name: "Batam", tier: 2, population: "1.2M", propertyTAM: "Rp 16T", liquidityReadiness: 58, revenuePotential: 64, opComplexity: 45, competitiveIntensity: 38, vendorDifficulty: 42, marketingIntensity: 50, rampMonths: 5, monthlyRevTarget: "Rp 85M", phase: 2, launchCost: "Rp 800M", breakEvenMonths: 9 },
  { name: "Malang", tier: 3, population: "0.9M", propertyTAM: "Rp 12T", liquidityReadiness: 52, revenuePotential: 48, opComplexity: 30, competitiveIntensity: 28, vendorDifficulty: 35, marketingIntensity: 42, rampMonths: 5, monthlyRevTarget: "Rp 40M", phase: 3, launchCost: "Rp 520M", breakEvenMonths: 10 },
];

const strategyMeta: Record<Strategy, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  aggressive: { label: "Aggressive Multi-City", desc: "Launch 3-4 cities simultaneously per phase — maximize speed, higher burn", icon: Rocket, color: "text-destructive" },
  sequential: { label: "Sequential Domination", desc: "One city at a time — achieve dominance before expanding", icon: Crown, color: "text-amber-400" },
  "capital-efficient": { label: "Capital Efficient", desc: "Prioritize highest ROI cities with lowest launch costs", icon: Shield, color: "text-emerald-500" },
};

const riskSignals = [
  { label: "Operational Overstretch", icon: AlertTriangle, color: "text-destructive", triggers: ["Managing >3 active launches simultaneously", "Team-to-city ratio drops below 4 per city", "Response SLA breaches exceed 15%", "Vendor onboarding velocity drops 30% from baseline"], mitigation: "Cap concurrent launches at 3. Hire city leads 4 weeks pre-launch. Automate vendor onboarding flow." },
  { label: "Liquidity Dilution", icon: Activity, color: "text-amber-400", triggers: ["Listing-to-inquiry ratio exceeds 50:1 in new cities", "Inquiry velocity flatlines after week 4", "Cross-city investor demand cannibalization >20%", "Supply quality drops as quantity scales"], mitigation: "Maintain minimum 200 verified listings before launch marketing. Gate investor traffic to cities meeting liquidity threshold. Use AI scoring to auto-deprioritize low-quality listings." },
  { label: "Brand Authority Fragmentation", icon: Globe, color: "text-primary", triggers: ["Brand recall drops below 30% in expansion cities", "Local competitor PR outpaces ASTRA mentions 3:1", "Vendor trust score in new markets trails origin city by >40%", "Inconsistent pricing perception across markets"], mitigation: "Deploy local PR plan 2 weeks pre-launch. Mandate consistent platform UX across cities. Establish local credibility partnerships before marketing spend." },
];

function getScenarioTimeline(strategy: Strategy, budgetLevel: Budget): { phase: number; cities: string[]; months: string; investment: string }[] {
  const budgetNum = { "1b": 1, "2b": 2, "4b": 4, "8b": 8 }[budgetLevel];

  if (strategy === "aggressive") return [
    { phase: 1, cities: ["Denpasar/Bali", "Surabaya", "Bandung", "Medan"], months: "M1-M6", investment: `Rp ${Math.min(budgetNum * 0.55, 4.6).toFixed(1)}B` },
    { phase: 2, cities: ["Semarang", "Yogyakarta", "Makassar", "Batam"], months: "M4-M12", investment: `Rp ${Math.min(budgetNum * 0.3, 3.1).toFixed(1)}B` },
    { phase: 3, cities: ["Balikpapan", "Palembang", "Manado", "Malang"], months: "M10-M18", investment: `Rp ${Math.min(budgetNum * 0.15, 2.4).toFixed(1)}B` },
  ];
  if (strategy === "sequential") return [
    { phase: 1, cities: ["Denpasar/Bali", "Surabaya"], months: "M1-M8", investment: `Rp ${Math.min(budgetNum * 0.4, 2.6).toFixed(1)}B` },
    { phase: 2, cities: ["Bandung", "Medan", "Yogyakarta"], months: "M6-M16", investment: `Rp ${Math.min(budgetNum * 0.35, 3.0).toFixed(1)}B` },
    { phase: 3, cities: ["Semarang", "Makassar", "Batam", "Malang", "Palembang"], months: "M14-M28", investment: `Rp ${Math.min(budgetNum * 0.25, 3.5).toFixed(1)}B` },
  ];
  return [
    { phase: 1, cities: ["Denpasar/Bali", "Bandung", "Yogyakarta"], months: "M1-M8", investment: `Rp ${Math.min(budgetNum * 0.45, 3.0).toFixed(1)}B` },
    { phase: 2, cities: ["Surabaya", "Batam", "Semarang"], months: "M6-M14", investment: `Rp ${Math.min(budgetNum * 0.35, 2.4).toFixed(1)}B` },
    { phase: 3, cities: ["Medan", "Makassar", "Malang"], months: "M12-M22", investment: `Rp ${Math.min(budgetNum * 0.2, 2.5).toFixed(1)}B` },
  ];
}

const tierColors: Record<number, string> = { 1: "bg-primary/10 text-primary border-primary/30", 2: "bg-amber-500/10 text-amber-500 border-amber-500/30", 3: "bg-muted text-muted-foreground border-border/30" };
const phaseLabels = ["", "Regional Dominance", "National Intelligence Network", "Market Leadership Consolidation"];
const phaseIcons = [null, Target, Layers, Crown];

const NationalExpansionSimulator = () => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState<Strategy>("sequential");
  const [budget, setBudget] = useState<Budget>("4b");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sorted = useMemo(() => [...cities].sort((a, b) => {
    const scoreA = a.revenuePotential * 0.35 + a.liquidityReadiness * 0.3 - a.opComplexity * 0.2 - a.competitiveIntensity * 0.15;
    const scoreB = b.revenuePotential * 0.35 + b.liquidityReadiness * 0.3 - b.opComplexity * 0.2 - b.competitiveIntensity * 0.15;
    return scoreB - scoreA;
  }), []);

  const timeline = getScenarioTimeline(strategy, budget);
  const sm = strategyMeta[strategy];

  const copyCity = (c: CityData) => {
    const text = `${c.name} (Tier ${c.tier})\nTAM: ${c.propertyTAM} | Liquidity: ${c.liquidityReadiness}% | Revenue Potential: ${c.revenuePotential}/100\nLaunch Cost: ${c.launchCost} | Break-even: ${c.breakEvenMonths}mo | Ramp: ${c.rampMonths}mo\nTarget Revenue: ${c.monthlyRevTarget}/mo`;
    navigator.clipboard.writeText(text);
    setCopiedKey(c.name);
    toast({ title: "Copied" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          National Expansion Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">City-level analysis, scenario simulation & phased rollout blueprint</p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Sparkles className="h-3 w-3" />Expansion Strategy</label>
              <Select value={strategy} onValueChange={v => setStrategy(v as Strategy)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(strategyMeta).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">{sm.desc}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><DollarSign className="h-3 w-3" />Available Budget</label>
              <Select value={budget} onValueChange={v => setBudget(v as Budget)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1b" className="text-xs">Rp 1B (Lean)</SelectItem>
                  <SelectItem value="2b" className="text-xs">Rp 2B (Moderate)</SelectItem>
                  <SelectItem value="4b" className="text-xs">Rp 4B (Standard)</SelectItem>
                  <SelectItem value="8b" className="text-xs">Rp 8B (Aggressive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="roadmap" className="text-xs gap-1.5"><Layers className="h-3 w-3" />Phased Roadmap</TabsTrigger>
          <TabsTrigger value="cities" className="text-xs gap-1.5"><Building2 className="h-3 w-3" />City Analysis</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs gap-1.5"><AlertTriangle className="h-3 w-3" />Risk Matrix</TabsTrigger>
        </TabsList>

        {/* Roadmap */}
        <TabsContent value="roadmap" className="space-y-4">
          {timeline.map((phase, pi) => {
            const PhIcon = phaseIcons[phase.phase]!;
            const phaseCities = cities.filter(c => phase.cities.includes(c.name));
            return (
              <motion.div key={pi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                <Card className="border-border/40 bg-card/70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PhIcon className="h-5 w-5 text-primary" />
                        Phase {phase.phase} — {phaseLabels[phase.phase]}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]"><Clock className="h-3 w-3 mr-1" />{phase.months}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary"><DollarSign className="h-3 w-3 mr-1" />{phase.investment}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phaseCities.map(c => (
                        <div key={c.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 group cursor-pointer" onClick={() => copyCity(c)}>
                          <div className="shrink-0">
                            <Badge variant="outline" className={cn("text-[9px]", tierColors[c.tier])}>T{c.tier}</Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-foreground">{c.name}</span>
                              <span className="text-[9px] text-muted-foreground">{c.population}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div><p className="text-[8px] text-muted-foreground uppercase">Liquidity</p><Progress value={c.liquidityReadiness} className="h-1.5 mt-0.5" /><p className="text-[9px] font-medium text-foreground">{c.liquidityReadiness}%</p></div>
                              <div><p className="text-[8px] text-muted-foreground uppercase">Rev Potential</p><Progress value={c.revenuePotential} className="h-1.5 mt-0.5" /><p className="text-[9px] font-medium text-foreground">{c.revenuePotential}/100</p></div>
                              <div><p className="text-[8px] text-muted-foreground uppercase">Complexity</p><Progress value={c.opComplexity} className="h-1.5 mt-0.5" /><p className="text-[9px] font-medium text-foreground">{c.opComplexity}/100</p></div>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                              <span>Ramp: {c.rampMonths}mo</span>
                              <span>BE: {c.breakEvenMonths}mo</span>
                              <span>Target: {c.monthlyRevTarget}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0">
                            {copiedKey === c.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Revenue Projection */}
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" />Projected Revenue Emergence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { month: "Month 6", rev: strategy === "aggressive" ? "Rp 280M" : strategy === "sequential" ? "Rp 150M" : "Rp 180M", note: "Phase 1 cities reaching monetization" },
                  { month: "Month 12", rev: strategy === "aggressive" ? "Rp 720M" : strategy === "sequential" ? "Rp 380M" : "Rp 450M", note: "Phase 1 mature + Phase 2 ramping" },
                  { month: "Month 18", rev: strategy === "aggressive" ? "Rp 1.4B" : strategy === "sequential" ? "Rp 650M" : "Rp 820M", note: "National network effect acceleration" },
                  { month: "Month 24", rev: strategy === "aggressive" ? "Rp 2.2B" : strategy === "sequential" ? "Rp 1.1B" : "Rp 1.3B", note: "Market leadership consolidation" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                    <Badge variant="outline" className="text-[10px] shrink-0 w-20 justify-center">{r.month}</Badge>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-foreground">{r.rev}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{r.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* City Analysis */}
        <TabsContent value="cities" className="space-y-3">
          {sorted.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/40 bg-card/70">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-lg font-bold text-primary">#{i + 1}</span>
                      <Badge variant="outline" className={cn("text-[9px]", tierColors[c.tier])}>Tier {c.tier}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-foreground">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">Pop: {c.population} | TAM: {c.propertyTAM}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto">Phase {c.phase}</Badge>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                          { label: "Liquidity Ready", value: c.liquidityReadiness },
                          { label: "Revenue Potential", value: c.revenuePotential },
                          { label: "Op Complexity", value: c.opComplexity },
                          { label: "Competition", value: c.competitiveIntensity },
                          { label: "Vendor Difficulty", value: c.vendorDifficulty },
                          { label: "Marketing Need", value: c.marketingIntensity },
                        ].map((m, mi) => (
                          <div key={mi}>
                            <p className="text-[8px] text-muted-foreground uppercase mb-0.5">{m.label}</p>
                            <Progress value={m.value} className="h-1.5" />
                            <p className="text-[10px] font-semibold text-foreground">{m.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                        <span>Launch: {c.launchCost}</span>
                        <span>Ramp: {c.rampMonths}mo</span>
                        <span>Break-even: {c.breakEvenMonths}mo</span>
                        <span>Target: {c.monthlyRevTarget}/mo</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Risks */}
        <TabsContent value="risks" className="space-y-4">
          {riskSignals.map((risk, ri) => (
            <motion.div key={ri} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.06 }}>
              <Card className="border-border/40 bg-card/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <risk.icon className={cn("h-5 w-5", risk.color)} />
                    {risk.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1.5">Warning Triggers</p>
                    <ul className="space-y-1">
                      {risk.triggers.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-2 text-xs text-foreground">
                          <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-500 uppercase font-medium mb-1">Mitigation Strategy</p>
                    <p className="text-xs text-foreground leading-relaxed">{risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Strategy Comparison */}
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Strategy Risk Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(strategyMeta) as [Strategy, typeof strategyMeta[Strategy]][]).map(([k, v]) => {
                  const riskLevel = k === "aggressive" ? { overstretch: 85, dilution: 70, fragmentation: 60 } : k === "sequential" ? { overstretch: 20, dilution: 25, fragmentation: 15 } : { overstretch: 35, dilution: 40, fragmentation: 30 };
                  return (
                    <div key={k} className={cn("p-3 rounded-lg border", k === strategy ? "border-primary/40 bg-primary/5" : "border-border/20 bg-muted/10")}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <v.icon className={cn("h-4 w-4", v.color)} />
                        <span className="text-xs font-semibold text-foreground">{v.label}</span>
                      </div>
                      {Object.entries(riskLevel).map(([rk, rv]) => (
                        <div key={rk} className="mb-1">
                          <div className="flex items-center justify-between"><p className="text-[9px] text-muted-foreground capitalize">{rk}</p><p className="text-[9px] font-medium text-foreground">{rv}%</p></div>
                          <Progress value={rv} className="h-1" />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NationalExpansionSimulator;
