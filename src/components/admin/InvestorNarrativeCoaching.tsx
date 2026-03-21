import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic, Target, Shield, TrendingUp, Globe, Zap,
  MessageSquare, AlertTriangle, CheckCircle, Clock,
  Brain, Star, Eye, Volume2, Hand, ArrowRight,
  Lightbulb, Ban, Sparkles, Layers
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────
interface NarrativePhase {
  id: string;
  phase: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  objective: string;
  toneGuide: string;
  scripts: string[];
  doNots: string[];
  proTip: string;
}

const phases: NarrativePhase[] = [
  {
    id: "opening", phase: "1. Power Opening", duration: "60-90 seconds", icon: Zap, color: "text-primary",
    objective: "Establish authority and frame the conversation on your terms — you are not pitching, you are sharing a strategic opportunity.",
    toneGuide: "Calm conviction. Speak slower than natural. No rushing. Let silence work after your opening line.",
    scripts: [
      "\"We've built something that doesn't exist yet in Southeast Asian real estate — a liquidity operating system that turns fragmented property markets into predictable, investable ecosystems.\"",
      "\"Most platforms list properties. We measure, predict, and manufacture liquidity. That's a fundamentally different business.\"",
      "\"I'm not here to sell you on a listing portal. I'm here because we've discovered that real estate transaction intelligence is a $40B infrastructure gap — and we're the first team building the operating system to fill it.\"",
    ],
    doNots: ["Don't start with 'Thanks for your time' — it signals subordination", "Don't open with team bios — earn the right to introduce your team through traction first"],
    proTip: "Pause for 2 full seconds after your opening statement. Let it land. Investors process conviction through silence, not speed.",
  },
  {
    id: "problem", phase: "2. Problem Reframe", duration: "2-3 minutes", icon: Target, color: "text-amber-400",
    objective: "Redefine the problem beyond what investors think they know. You're not solving 'property search' — you're solving capital allocation blindness.",
    toneGuide: "Authoritative educator. You know something the market hasn't articulated yet. Lean into data, not emotion.",
    scripts: [
      "\"In Indonesia alone, $180B in residential real estate transacts annually with essentially zero intelligence infrastructure. Buyers guess. Sellers hope. Agents operate on instinct. Capital flows are invisible.\"",
      "\"The real problem isn't discovery — it's decision confidence. 73% of property investors in our research cite 'fear of overpaying' as their #1 barrier. We eliminate that fear with data.\"",
      "\"Traditional portals monetize attention. We monetize certainty. That's why our unit economics look more like a financial terminal than a classified site.\"",
    ],
    doNots: ["Don't trash competitors by name — it signals insecurity", "Don't say 'the market is broken' without specific data points"],
    proTip: "Use the phrase 'What we've discovered is...' — it positions you as a researcher who found something, not a founder who built something. Discovery > invention in investor psychology.",
  },
  {
    id: "moat", phase: "3. Intelligence Moat", duration: "3-4 minutes", icon: Shield, color: "text-cyan-400",
    objective: "Demonstrate compounding defensibility. Your moat isn't technology — it's the data flywheel that makes your intelligence impossible to replicate.",
    toneGuide: "Technical confidence without jargon. Explain like a strategist, not an engineer. Focus on 'why this gets stronger over time.'",
    scripts: [
      "\"Every transaction on our platform generates 47 behavioral signals — from browsing depth to inquiry timing to price sensitivity patterns. After 10,000 transactions, our demand prediction accuracy hits 94%. A new entrant starts at zero.\"",
      "\"We don't just match buyers to listings. Our AI scores every property on liquidity probability, predicts time-to-close within 15% accuracy, and routes deals to agents with the highest conversion probability for that specific property type and price band.\"",
      "\"Our vendor ecosystem creates a switching cost that compounds — the more transactions they process through us, the better their performance scores, the more leads they receive. Leaving means resetting to zero.\"",
      "\"Think of it as the Bloomberg Terminal effect for real estate — once institutional investors integrate our intelligence into their workflow, our data becomes their decision infrastructure.\"",
    ],
    doNots: ["Don't claim 'AI-powered' without explaining what the AI actually does", "Don't overstate accuracy — say '94% on validated test set' not '94% accurate'"],
    proTip: "Draw the flywheel on a whiteboard or napkin mid-conversation. Physical drawing creates 3x more retention than slides. Data → Intelligence → Trust → Transactions → More Data.",
  },
  {
    id: "traction", phase: "4. Traction Storytelling", duration: "3-4 minutes", icon: TrendingUp, color: "text-emerald-500",
    objective: "Let numbers build narrative momentum. Each metric should answer: 'Is this working?' and 'Is this accelerating?'",
    toneGuide: "Measured pride. Not boastful. Present metrics like a scientist reporting results — confident but precise.",
    scripts: [
      "\"We launched Jakarta 14 weeks ago. We're at 1,247 active listings, 89 daily inquiries, and a 5.2% view-to-deal conversion rate — which is 2.4x the industry benchmark for a marketplace at this stage.\"",
      "\"Our vendor retention is 87% after 90 days. In marketplace businesses, that's the metric that predicts whether you have product-market fit or just marketing spend. We have fit.\"",
      "\"Revenue is at $25K monthly run rate across four streams — no single stream exceeds 40% of total. That diversification at this stage is unusual and intentional.\"",
      "\"Our CAC is Rp 95K blended — that's $6. Our investor LTV is tracking at Rp 6.4M — that's $400. A 67x LTV/CAC ratio. We're not burning to grow — we're compounding.\"",
    ],
    doNots: ["Don't present vanity metrics (downloads, page views) without conversion context", "Don't say 'we're growing fast' — give the specific growth rate and time period"],
    proTip: "Always pair a metric with a comparison: industry average, competitor benchmark, or your own prior month. Isolated numbers have no psychological weight.",
  },
  {
    id: "expansion", phase: "5. Expansion Vision", duration: "2-3 minutes", icon: Globe, color: "text-violet-400",
    objective: "Show that the current city is a proof-of-concept for a repeatable expansion model, not a one-city business.",
    toneGuide: "Strategic foresight. Paint the picture of inevitability — this expansion is engineered, not aspirational.",
    scripts: [
      "\"Jakarta is our proof engine. We've already documented a 14-week city launch playbook that we'll replicate across 10 Indonesian metros in 18 months — each with progressively lower launch costs because our intelligence compounds across cities.\"",
      "\"Our expansion model shows 40% lower CAC in city #2 versus city #1, because investor demand spills over and vendor networks overlap. By city #5, we project 60% lower launch costs.\"",
      "\"Indonesia is a $180B annual residential market. Southeast Asia is $600B. We're building the intelligence layer for all of it — and the data moat from Indonesia makes every subsequent market entry defensible.\"",
      "\"We're not building a Jakarta company. We're building the transaction intelligence infrastructure for emerging-market real estate — starting where the gap is widest and the data advantage compounds fastest.\"",
    ],
    doNots: ["Don't claim 'global expansion' without a specific sequenced plan", "Don't mention more than 3 expansion markets — focus creates confidence"],
    proTip: "Use the phrase 'Our playbook shows...' — it implies systematic documentation and repeatability, not optimistic projection.",
  },
  {
    id: "closing", phase: "6. Confident Close", duration: "60-90 seconds", icon: Star, color: "text-amber-400",
    objective: "End with quiet power. You're not asking for money — you're inviting a strategic partner to participate in an inevitability.",
    toneGuide: "Composed certainty. Slower pace. Direct eye contact. No hedging language.",
    scripts: [
      "\"We're raising $2M to execute our 10-city expansion over 18 months. The capital efficiency of our model means this round gets us to $1M ARR and Series A position with clear unit economics.\"",
      "\"We're selective about who joins this round because our investors become part of our expansion network. We're looking for partners who understand marketplace dynamics and can add strategic value beyond capital.\"",
      "\"The question isn't whether real estate transaction intelligence will be built. It's whether you want to be part of the team that builds it first in the fastest-growing property market in Southeast Asia.\"",
    ],
    doNots: ["Never say 'We need your money' — say 'We're allocating capacity in this round'", "Don't end with 'Any questions?' — end with a forward statement and let them respond naturally"],
    proTip: "After your closing statement, stop talking completely. Count to 5 in your head. The first person to speak after a close has less power. Let them come to you.",
  },
];

const wordsToAvoid = [
  { word: "Honestly", why: "Implies everything else might not be honest" },
  { word: "Just", why: "Minimizes what you're saying — 'We just built...' weakens impact" },
  { word: "Hopefully", why: "Signals uncertainty — replace with 'Our projection shows'" },
  { word: "Try / Trying", why: "Founders execute, they don't try — say 'We're executing'" },
  { word: "I think", why: "Replace with 'Our data shows' or 'We've validated that'" },
  { word: "Basically", why: "Suggests you're simplifying for a less capable audience" },
  { word: "Sorry", why: "Never apologize in a pitch unless you've genuinely erred" },
  { word: "Pivot", why: "Investors hear 'failed' — say 'We refined our approach based on market signals'" },
];

const bodyLanguageTips = [
  { tip: "Open palm gestures when presenting data", effect: "Signals transparency and confidence" },
  { tip: "Lean forward 10° when stating traction metrics", effect: "Creates engagement gravity — draws listener in" },
  { tip: "Steeple fingers during moat explanation", effect: "Classic authority gesture — signals deep expertise" },
  { tip: "Controlled head nod when they ask about competition", effect: "Shows you expected and welcome the question" },
  { tip: "Stand during whiteboard moments, sit during Q&A", effect: "Standing = authority. Sitting = partnership. Switch intentionally" },
  { tip: "Eye contact triangle: left eye → right eye → forehead", effect: "Creates engaged listening perception without staring" },
];

const pacingStrategy = [
  { moment: "Opening statement", speed: "70% of natural speed", pause: "2s after final word" },
  { moment: "Key metric delivery", speed: "Slow, deliberate", pause: "1.5s between each metric" },
  { moment: "Moat explanation", speed: "Normal conversational", pause: "Brief pauses for emphasis" },
  { moment: "Traction numbers", speed: "Measured, precise", pause: "Let each number breathe" },
  { moment: "Vision statement", speed: "Slightly elevated energy", pause: "Build to crescendo, then stop" },
  { moment: "Closing line", speed: "Slowest pace of entire meeting", pause: "5s silence after — do not break it" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const InvestorNarrativeCoaching = () => {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mic className="h-6 w-6 text-primary" />
          Investor Narrative Coaching
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          6-phase meeting flow — power opening, problem reframe, moat articulation, traction storytelling, expansion vision & confident close
        </p>
      </div>

      <Tabs defaultValue="flow" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="flow" className="text-xs">Narrative Flow</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs">Delivery Technique</TabsTrigger>
          <TabsTrigger value="language" className="text-xs">Language Control</TabsTrigger>
        </TabsList>

        {/* ─── Narrative Flow ─── */}
        <TabsContent value="flow" className="space-y-4">
          {/* Timeline overview */}
          <div className="flex flex-wrap gap-2">
            {phases.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <p.icon className={`h-3 w-3 ${p.color}`} />
                  {p.phase.split(". ")[1]}
                  <span className="text-muted-foreground ml-1">{p.duration}</span>
                </Badge>
                {i < phases.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40" />}
              </div>
            ))}
          </div>

          {/* Phase Cards */}
          {phases.map((phase, i) => (
            <motion.div key={phase.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/40 bg-card/70 backdrop-blur">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <phase.icon className={`h-5 w-5 ${phase.color}`} />
                      {phase.phase}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />{phase.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Objective & Tone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Objective
                      </p>
                      <p className="text-xs text-foreground">{phase.objective}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Volume2 className="h-3 w-3" /> Tone Guide
                      </p>
                      <p className="text-xs text-foreground">{phase.toneGuide}</p>
                    </div>
                  </div>

                  {/* Scripts */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase mb-1.5 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Example Scripts
                    </p>
                    <div className="space-y-2">
                      {phase.scripts.map((script, si) => (
                        <div key={si} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-foreground italic leading-relaxed">{script}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Don'ts + Pro Tip */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-[10px] text-destructive uppercase mb-1.5 flex items-center gap-1">
                        <Ban className="h-3 w-3" /> Avoid
                      </p>
                      {phase.doNots.map((d, di) => (
                        <p key={di} className="text-xs text-muted-foreground mb-1 flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                          {d}
                        </p>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[10px] text-amber-400 uppercase mb-1 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> Pro Tip
                      </p>
                      <p className="text-xs text-foreground">{phase.proTip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ─── Delivery Technique ─── */}
        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pacing */}
            <Card className="border-border/40 bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Pacing & Pause Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pacingStrategy.map((p, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                    <p className="text-xs font-medium text-foreground">{p.moment}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />{p.speed}
                      </span>
                      <span className="text-[10px] text-primary flex items-center gap-1">
                        <Hand className="h-3 w-3" />{p.pause}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Body Language */}
            <Card className="border-border/40 bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Confidence Body Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bodyLanguageTips.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                    <p className="text-xs font-medium text-foreground">{b.tip}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />{b.effect}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Rehearsal Structure */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Rehearsal Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { step: "1. Mirror Rehearsal", desc: "Practice opening + close 5x in front of a mirror. Watch your own hands and posture. Eliminate fidgeting.", time: "15 min" },
                  { step: "2. Timer Drill", desc: "Run full narrative with phone timer visible. Each phase must hit its time target ±15 seconds. Total meeting: 15-18 minutes.", time: "20 min" },
                  { step: "3. Hostile Q&A Sim", desc: "Have someone interrupt with hard questions at random points. Practice returning to your narrative thread within 10 seconds.", time: "20 min" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-foreground">{s.step}</p>
                      <Badge variant="outline" className="text-[10px]">{s.time}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Language Control ─── */}
        <TabsContent value="language" className="space-y-4">
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" /> Words That Reduce Perceived Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {wordsToAvoid.map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                      <Badge className="bg-destructive/15 text-destructive text-[10px] shrink-0 mt-0.5">{w.word}</Badge>
                      <p className="text-xs text-muted-foreground">{w.why}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Power Replacement Phrases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { weak: "I think we can...", strong: "Our data validates that..." },
                  { weak: "We're trying to...", strong: "We're executing on..." },
                  { weak: "Hopefully we'll...", strong: "Our model projects..." },
                  { weak: "We're a startup that...", strong: "We're the team that built..." },
                  { weak: "Our competition is...", strong: "The current market approach is..." },
                  { weak: "We need funding to...", strong: "This capital accelerates our path to..." },
                  { weak: "It's kind of like...", strong: "The closest analogy is..." },
                  { weak: "We're disrupting...", strong: "We're building infrastructure that..." },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/20">
                    <span className="text-xs text-muted-foreground line-through shrink-0">{p.weak}</span>
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{p.strong}</span>
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

export default InvestorNarrativeCoaching;
