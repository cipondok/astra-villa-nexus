import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy, Check, Rocket, TrendingUp, Shield, Zap, Globe,
  Target, DollarSign, Layers, Brain, Crown, ArrowRight,
  Users, BarChart3, Sparkles, Eye, Lock, Flame, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SlideContent {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  headline: string;
  bullets: string[];
  notes: string;
  fomoTechnique: string;
}

const slides: SlideContent[] = [
  {
    id: "vision", title: "Vision & Inevitability", icon: Rocket, color: "text-primary",
    headline: "The $120B Indonesian Property Market Has Zero Intelligence Infrastructure. We're Building It.",
    bullets: [
      "Indonesia's real estate market transacts $120B+ annually — entirely on gut feeling",
      "ASTRA is the AI-powered liquidity operating system that replaces intuition with intelligence",
      "Not a listing portal. Not a marketplace. A decision infrastructure layer.",
      "Every transaction that flows through ASTRA makes the system smarter — and the moat deeper",
    ],
    notes: "Open with the scale of the problem, not your solution. Investors need to feel the market gap is massive and obvious before you introduce yourself. The phrase 'zero intelligence infrastructure' creates cognitive dissonance — how can a $120B market have no data layer? That tension drives engagement. Pause after 'We're building it.' — let the room sit with the ambition.",
    fomoTechnique: "Inevitability Positioning — frame the market as inevitably moving toward intelligence; position ASTRA as the only credible builder",
  },
  {
    id: "problem", title: "Market Inefficiency", icon: Target, color: "text-destructive",
    headline: "Property Investors Lose 15-30% of Potential Returns Because They Can't See Demand",
    bullets: [
      "Agents list blindly — no data on which properties will actually move",
      "Investors search manually — missing 73% of matching opportunities",
      "Pricing is arbitrary — 40% of listings are mispriced by >15% vs fair market value",
      "Average time to close: 67 days. With intelligence: 28 days.",
      "The entire value chain operates on information asymmetry — we eliminate it",
    ],
    notes: "Quantify the pain. Generic 'the market is inefficient' won't create urgency. Specific numbers — '73% of matching opportunities missed', '40% mispriced' — make investors feel the problem viscerally. The time-to-close comparison (67→28 days) is your strongest proof that intelligence creates measurable value. Use it as a bridge to your solution.",
    fomoTechnique: "Pain Quantification — specific numbers make abstract problems feel urgent and solvable",
  },
  {
    id: "moat", title: "Intelligence Moat", icon: Brain, color: "text-violet-500",
    headline: "Every Transaction Makes Us Smarter. Every Competitor Starts at Zero.",
    bullets: [
      "28 proprietary scoring algorithms processing behavioral demand signals in real-time",
      "AI-powered deal routing: 6.4% conversion rate vs 2.1% industry average (3x)",
      "Liquidity prediction engine — we know which properties will transact 3 weeks before the market",
      "450+ data tables building compounding intelligence advantage",
      "This isn't a feature advantage. It's a data gravity well. The more we process, the harder we are to replicate.",
    ],
    notes: "The moat slide must make competitors feel irrelevant, not just behind. '450+ data tables' signals depth that can't be replicated by raising money and hiring engineers. The phrase 'data gravity well' reframes your advantage from 'we have more data' to 'data flows toward us naturally.' Mention the 3x conversion rate casually — let the number do the work. Don't oversell it.",
    fomoTechnique: "Compounding Advantage — frame moat as accelerating, making late entry exponentially harder",
  },
  {
    id: "traction", title: "Traction Momentum", icon: TrendingUp, color: "text-emerald-500",
    headline: "From Zero to Rp 980M Monthly Revenue in 14 Months. We're Just Getting Started.",
    bullets: [
      "Rp 85B Monthly GMV flowing through the platform",
      "48 deals closing per month — 41-day median days-on-market",
      "1.15% platform take-rate with clear expansion to 2.5%+",
      "Rp 11.7B ARR run-rate — growing 22% month-over-month",
      "67x Investor LTV:CAC ratio — unit economics that fund themselves",
      "Revenue diversified: transactions (45%), subscriptions (30%), data/premium (25%)",
    ],
    notes: "Lead with the revenue number — it's your credibility anchor. Then layer GMV, deals, and take-rate to show the revenue is real and scalable. The LTV:CAC ratio (67x) is your knockout punch — it means you can pour money into growth and it compounds. Don't rush through it. Say 'sixty-seven x' slowly. Let investors do the math in their heads. The take-rate expansion (1.15% → 2.5%) signals revenue can 2x without adding a single user.",
    fomoTechnique: "Momentum Amplification — show acceleration, not just growth; imply the curve is steepening",
  },
  {
    id: "revenue", title: "Revenue Engine", icon: DollarSign, color: "text-amber-400",
    headline: "Five Revenue Layers. Each One Compounds on the Others.",
    bullets: [
      "Layer 1: Marketplace Transactions (0.5-2% take-rate) — scales with volume",
      "Layer 2: Vendor Subscriptions (Rp 299K-7.5M/mo) — recurring, predictable",
      "Layer 3: Investor SaaS (Rp 299K-50M/mo) — high ARPU, low churn",
      "Layer 4: Institutional Data APIs — selling intelligence to funds and banks",
      "Layer 5: Capital Markets (syndication, tokenization) — future 10x multiplier",
      "Each layer creates demand for the next — this is a revenue flywheel, not a feature list",
    ],
    notes: "Don't present this as 'we have 5 revenue streams.' Frame it as a compounding system where Layer 1 creates the data that powers Layer 4, and Layer 3 users become Layer 5 participants. The word 'flywheel' is overused — use it once, then prove it. The institutional data layer is your sleeper — it signals that your data has value beyond your own marketplace. That's what separates a marketplace from an infrastructure company. Infrastructure companies get infrastructure multiples.",
    fomoTechnique: "Layered Inevitability — each revenue layer makes the next one inevitable, creating a sense of unstoppable momentum",
  },
  {
    id: "expansion", title: "Expansion Dominance", icon: Globe, color: "text-cyan-500",
    headline: "Jakarta Proved the Model. 12 Cities Will Prove the Category.",
    bullets: [
      "Repeatable city-launch playbook: 4-month ramp, 8-month break-even",
      "Each new city adds cross-market intelligence — predictions improve everywhere",
      "Phase 1 (now): Bali, Surabaya, Bandung — Rp 4B investment, Rp 540M monthly target",
      "Phase 2 (M6-M16): 4 Tier-2 cities — network effect acceleration",
      "Phase 3 (M14-M28): National coverage — 12 cities, market leadership locked",
      "40% lower CAC per subsequent city due to brand and data spillover",
    ],
    notes: "The '40% lower CAC per subsequent city' is the most important number on this slide. It proves non-linear scaling — the opposite of what most marketplaces experience. Emphasize that intelligence compounds across cities. When Surabaya data improves Bali predictions, you've created a network effect at the data layer that competitors can't replicate by launching in a single city. This is what turns a local marketplace into a national infrastructure monopoly.",
    fomoTechnique: "Cross-Market Network Effect — expansion doesn't dilute value, it compounds it",
  },
  {
    id: "valuation", title: "Valuation & Outcome", icon: Crown, color: "text-amber-400",
    headline: "The Question Isn't Whether This Becomes a $1B Platform. It's Whether You're Part of It.",
    bullets: [
      "Current raise: $3-5M Series A at $25-40M pre-money valuation",
      "Comparable exits: PropertyGuru ($1.78B IPO), 99.co ($500M+), Housing.com ($1.2B)",
      "ASTRA's intelligence layer commands 15-25x ARR multiple vs 8-12x for pure marketplaces",
      "At current trajectory: $30M ARR by Month 36 → $450-750M implied valuation",
      "This round's investors participate before the intelligence moat becomes public knowledge",
      "We're not raising because we need money. We're raising to accelerate inevitability.",
    ],
    notes: "The closing slide must create urgency without desperation. 'We're not raising because we need money' is the most powerful sentence in fundraising — it shifts power dynamics. The comparables section isn't about matching valuations; it's about establishing the category and showing a well-worn path to exit. The ARR multiple differential (15-25x vs 8-12x for pure marketplace) is your valuation thesis — you need investors to internalize that ASTRA is an intelligence company that happens to operate a marketplace, not the other way around. End with silence. Don't fill it.",
    fomoTechnique: "Scarcity + Inevitability — the opportunity is time-limited but the outcome is certain; missing it is the real risk",
  },
];

const sequenceFlow = [
  { step: 1, label: "The Gap", desc: "Open with market scale + zero intelligence infrastructure", time: "90 sec" },
  { step: 2, label: "The Pain", desc: "Quantify what investors and agents lose without data", time: "60 sec" },
  { step: 3, label: "The Moat", desc: "Show compounding intelligence advantage", time: "90 sec" },
  { step: 4, label: "The Proof", desc: "Traction numbers — let data speak", time: "120 sec" },
  { step: 5, label: "The Engine", desc: "Revenue flywheel — each layer compounds", time: "90 sec" },
  { step: 6, label: "The Scale", desc: "Expansion roadmap with declining CAC", time: "60 sec" },
  { step: 7, label: "The Close", desc: "Valuation, comparables, and the inevitability frame", time: "90 sec" },
];

const persuasionTechniques = [
  { label: "Inevitability Language", icon: Lock, examples: ["'The question isn't if — it's when, and who's positioned'", "'This market will have an intelligence layer. We're 14 months ahead.'", "'The data gravity is already pulling transactions toward us.'"] },
  { label: "Momentum Amplification", icon: Flame, examples: ["'22% MoM growth — and the curve is steepening, not flattening'", "'Each month adds more intelligence than the previous 3 combined'", "'We've compressed 3 years of marketplace evolution into 14 months'"] },
  { label: "Scarcity Framing", icon: Eye, examples: ["'This round closes in 6 weeks. We're already 40% committed.'", "'After this raise, the valuation will reflect the traction. Today it reflects the vision.'", "'The moat is forming now. Late entrants — including late investors — face a steeper climb.'"] },
  { label: "Confidence Signaling", icon: Shield, examples: ["'We're not raising because we need to survive. We're raising to dominate faster.'", "'Our unit economics fund growth. Capital accelerates the timeline.'", "'We turned down 2 offers at lower valuations because the fit wasn't right.'"] },
];

const InvestorFOMOPitchContent = () => {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copySlide = (slide: SlideContent) => {
    const text = `# ${slide.headline}\n\n${slide.bullets.map(b => `• ${b}`).join("\n")}\n\n---\nSpeaker Notes:\n${slide.notes}\n\nFOMO Technique: ${slide.fomoTechnique}`;
    copy(text, slide.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Investor FOMO Pitch Content
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Psychologically compelling slide content with speaker notes, persuasion techniques & storytelling sequence
        </p>
      </div>

      {/* Sequence Flow */}
      <Card className="border-border/40 bg-card/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Storytelling Sequence (10-12 minutes total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {sequenceFlow.map((s, i) => (
              <div key={i} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 border border-border/20 min-w-[100px]">
                  <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary">{s.time}</Badge>
                  <span className="text-[10px] font-bold text-foreground">{s.step}. {s.label}</span>
                  <span className="text-[8px] text-muted-foreground text-center leading-tight">{s.desc}</span>
                </div>
                {i < sequenceFlow.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mx-0.5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="slides" className="text-xs gap-1.5"><BarChart3 className="h-3 w-3" />Slide Content</TabsTrigger>
          <TabsTrigger value="techniques" className="text-xs gap-1.5"><Brain className="h-3 w-3" />Persuasion Playbook</TabsTrigger>
        </TabsList>

        {/* Slides */}
        <TabsContent value="slides" className="space-y-4">
          {slides.map((slide, si) => (
            <motion.div key={slide.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.04 }}>
              <Card className="border-border/40 bg-card/70">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted/50">
                        <slide.icon className={cn("h-4 w-4", slide.color)} />
                      </div>
                      <span>Slide {si + 1}: {slide.title}</span>
                    </CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => copySlide(slide)}>
                      {copiedKey === slide.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === slide.id ? "Copied" : "Copy Slide"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Headline */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[10px] text-primary uppercase font-medium mb-1">Slide Headline</p>
                    <p className="text-base font-bold text-foreground leading-snug">{slide.headline}</p>
                  </div>

                  {/* Bullets */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2">Key Points</p>
                    <ul className="space-y-1.5">
                      {slide.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-xs text-foreground group">
                          <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          <span className="flex-1">{b}</span>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(b, `${slide.id}-${bi}`)}>
                            {copiedKey === `${slide.id}-${bi}` ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Speaker Notes */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1.5 flex items-center gap-1">
                      <Users className="h-3 w-3" />Speaker Notes & Delivery Guidance
                    </p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">{slide.notes}</p>
                  </div>

                  {/* FOMO Technique */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Flame className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-amber-400 uppercase font-medium">Persuasion Technique</p>
                      <p className="text-[11px] text-foreground">{slide.fomoTechnique}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Techniques */}
        <TabsContent value="techniques" className="space-y-4">
          {persuasionTechniques.map((tech, ti) => (
            <motion.div key={ti} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ti * 0.06 }}>
              <Card className="border-border/40 bg-card/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <tech.icon className="h-5 w-5 text-primary" />
                    {tech.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tech.examples.map((ex, ei) => (
                    <div key={ei} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20 group">
                      <p className="text-xs text-foreground italic flex-1">{ex}</p>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => copy(ex.replace(/'/g, ""), `tech-${ti}-${ei}`)}>
                        {copiedKey === `tech-${ti}-${ei}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Words to Avoid */}
          <Card className="border-border/40 bg-card/70 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <Lock className="h-4 w-4" />
                Language to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { avoid: "'We hope to...'", use: "'We will...' / 'We're building...'" },
                  { avoid: "'We think the market...'", use: "'The data shows...'" },
                  { avoid: "'If everything goes well...'", use: "'At our current trajectory...'" },
                  { avoid: "'We need this funding to survive'", use: "'This capital accelerates dominance'" },
                  { avoid: "'Our competition is...'", use: "'The market currently lacks...'" },
                  { avoid: "'We're trying to...'", use: "'We're executing on...'" },
                ].map((w, wi) => (
                  <div key={wi} className="p-2 rounded-lg bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-destructive line-through mb-0.5">{w.avoid}</p>
                    <p className="text-[10px] text-emerald-500 font-medium">{w.use}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorFOMOPitchContent;
