import React, { useState } from "react";
import { Globe, Copy, Check, ChevronDown, ChevronUp, Mic, MessageSquare, Newspaper, Shield, Zap, Target, TrendingUp, Crown, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── data ───────── */

interface NarrativeSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  stagePoints: string[];
  conversational: string;
  soundbite: string;
}

const sections: NarrativeSection[] = [
  {
    id: "opening",
    title: "Opening Positioning Statement",
    icon: <Crown className="h-5 w-5" />,
    stagePoints: [
      "We're not building another listing portal. We're building the intelligence infrastructure that will power every property transaction in Southeast Asia.",
      "Today, $300 billion in Indonesian real estate trades on gut feeling. We're replacing instinct with intelligence.",
      "In 18 months, we've built what incumbents haven't in 15 years — a platform where every listing has a liquidity score, every district has a capital flow map, and every investor gets AI-driven deal discovery.",
    ],
    conversational: "The simplest way to understand what we do: imagine Bloomberg Terminal meets Zillow, purpose-built for emerging market real estate investors. Every property on our platform has an AI-generated opportunity score. Every district has real-time capital flow visibility. We don't just show listings — we show which ones will make money and why. That's a category that doesn't exist yet, and we're defining it.",
    soundbite: "We're building the Bloomberg Terminal for property investment in emerging markets — turning a $300B gut-feeling industry into an intelligence-driven ecosystem.",
  },
  {
    id: "market",
    title: "Global Market Inefficiency Framing",
    icon: <Globe className="h-5 w-5" />,
    stagePoints: [
      "The global real estate market is $380 trillion — the largest asset class on earth — yet it operates with less data transparency than a $50 stock trade.",
      "In Southeast Asia alone, $1.2 trillion in property transactions happen annually with zero standardized intelligence layer.",
      "Existing portals are photo galleries with contact forms. They capture attention but destroy decision quality. The entire value chain — from discovery to transaction — is broken.",
      "This isn't a technology gap. It's a structural market failure. And structural failures create category-defining opportunities.",
    ],
    conversational: "Let me frame the opportunity size. Real estate is the world's largest asset class at $380 trillion, but it's traded with less intelligence than a penny stock. In Indonesia alone, we're talking about $120 billion in annual transactions where investors make decisions based on broker relationships and WhatsApp groups. There's no standardized scoring, no liquidity visibility, no predictive analytics. Every other asset class has been transformed by data intelligence — equities, fixed income, commodities. Real estate is the last frontier, and emerging markets are where the transformation starts because there's no legacy infrastructure to displace.",
    soundbite: "Real estate is a $380 trillion asset class traded with less data than a penny stock. We're fixing that, starting with the fastest-growing markets in Southeast Asia.",
  },
  {
    id: "moat",
    title: "Platform Intelligence Moat",
    icon: <Shield className="h-5 w-5" />,
    stagePoints: [
      "Our moat isn't code — it's compounding data. Every transaction, every inquiry, every price signal feeds our AI models. The platform gets smarter with every interaction.",
      "We process 50+ data signals per listing to generate opportunity scores that are 3.2x more predictive than traditional broker assessments.",
      "Our intelligence layer spans four domains: liquidity prediction, capital flow mapping, yield optimization, and vendor performance scoring.",
      "Replicating our data advantage would require 18+ months of market presence and thousands of validated transactions. By then, we'll be three cities ahead.",
    ],
    conversational: "The question every smart investor asks is 'what stops someone from copying this?' The answer is time and data. We've built proprietary intelligence across four domains — liquidity prediction, capital flow mapping, yield optimization, and vendor scoring. Each domain compounds independently. Our opportunity scoring model processes 50+ signals per listing and improves with every transaction. A competitor starting today would need 18 months of market presence just to reach our current accuracy. And in those 18 months, we'll have expanded to three more cities, each generating new data that widens the gap. This is a classic data flywheel — the more we grow, the harder we are to catch.",
    soundbite: "Our AI processes 50+ signals per listing with accuracy that compounds daily. A competitor starting today is 18 months and three cities behind — and falling further back every day.",
  },
  {
    id: "traction",
    title: "Traction Momentum Storytelling",
    icon: <TrendingUp className="h-5 w-5" />,
    stagePoints: [
      "We launched our Bali market 14 months ago. Within 6 months, we had 400+ verified listings and 2,800+ registered investors.",
      "Our inquiry velocity is growing 22% month-over-month — not from paid acquisition, but from organic intelligence-driven discovery.",
      "Vendor retention at 87% after 90 days. That tells you our platform delivers measurable business value, not just visibility.",
      "We've generated Rp 180M in revenue with zero paid marketing spend. Our unit economics are already contribution-positive.",
    ],
    conversational: "Let me walk you through our traction because the numbers tell a compelling story. We launched in Bali 14 months ago with a hypothesis: if you give property vendors AI-powered visibility and give investors intelligence-driven discovery, both sides will pay for the value. The results validated that hypothesis faster than we projected. We hit 400+ listings in 6 months — all organic. Our inquiry velocity grows 22% month-over-month. Vendor retention is 87% after 90 days, which means vendors aren't just listing — they're getting real business results. Most importantly, we've generated Rp 180M in revenue with zero paid marketing. When your product drives revenue without advertising, you know you've found product-market fit.",
    soundbite: "400+ listings, 2,800+ investors, 87% vendor retention, and Rp 180M in revenue — all organic, zero paid marketing. That's product-market fit speaking for itself.",
  },
  {
    id: "expansion",
    title: "Expansion Replication Model",
    icon: <Target className="h-5 w-5" />,
    stagePoints: [
      "Our expansion model is designed for replication, not reinvention. Each new city launch follows a 90-day playbook that's been validated and refined.",
      "City launch capital requirement: Rp 400M. Expected break-even: month 9. Expected contribution margin by month 14: 35%.",
      "We've identified 14 Indonesian metro areas with combined annual transaction volume exceeding $80 billion.",
      "Beyond Indonesia, our intelligence architecture is market-agnostic. Vietnam, Thailand, and Philippines are sequenced for 2027-2028.",
    ],
    conversational: "The beauty of our model is that city expansion is operational, not experimental. We've codified our Bali launch into a 90-day playbook — supply activation, demand generation, transaction kickstart, and social proof explosion. Each city requires approximately Rp 400M in launch capital and reaches break-even by month 9. We've mapped 14 Indonesian metros with $80 billion in combined annual transactions. That's our domestic runway. But here's where the story gets really interesting for global investors: our intelligence architecture is market-agnostic. The AI models, the scoring systems, the vendor tools — they work anywhere there's property data. We've already sequenced Vietnam, Thailand, and Philippines for 2027-2028. This isn't a single-market bet. This is infrastructure that scales across the fastest-growing property markets in the world.",
    soundbite: "Each city launch follows a proven 90-day playbook — Rp 400M in, break-even by month 9. We've mapped 14 cities domestically and three countries for international expansion.",
  },
  {
    id: "valuation",
    title: "Long-Term Valuation Articulation",
    icon: <BarChart3 className="h-5 w-5" />,
    stagePoints: [
      "At current trajectory, we project $10M ARR within 30 months. At a conservative 15x revenue multiple for vertical SaaS with network effects, that's a $150M valuation path.",
      "The addressable market in Indonesia alone is $2.4 billion in annual platform fees. Southeast Asia expands that to $8 billion.",
      "We're raising $3-5M at a $25-40M pre-money valuation — pricing in proven unit economics and a clear path to category leadership.",
      "This round funds expansion to 5 cities, which generates the data density and revenue trajectory required for a $100M+ Series B.",
    ],
    conversational: "Let me be direct about valuation. We're raising $3-5M at a $25-40M pre-money. That prices in our proven unit economics, our 87% vendor retention, our organic growth trajectory, and a clear playbook for 5-city expansion. At current growth rates, we project $10M ARR within 30 months. For vertical SaaS platforms with network effects and data moats, market comps support 15-25x revenue multiples. That puts the Series B conversation in the $150-250M range. The addressable market in Indonesia alone is $2.4 billion in annual platform fees — we're capturing less than 0.01% today. Southeast Asia expands the TAM to $8 billion. The math isn't speculative. It's inevitable if we execute, and our track record shows we execute.",
    soundbite: "We're raising at $25-40M pre-money with a clear path to $10M ARR in 30 months. At market-rate multiples, that's a $150M+ Series B trajectory.",
  },
];

const persuasionTechniques = [
  {
    technique: "Inevitability Framing",
    icon: <Zap className="h-4 w-4" />,
    principles: [
      "Frame the platform as the natural, unavoidable evolution of the market — not a startup experiment",
      "Use language: 'when this happens' not 'if this works'",
      "Reference historical parallels: 'Bloomberg did this for equities. We're doing it for property.'",
      "Present expansion as 'deployment' not 'launch' — implying the system already works, it just needs to be turned on",
    ],
    examplePhrases: [
      "The question isn't whether property intelligence becomes standard — it's who builds it first.",
      "Every asset class has been transformed by data. Real estate is next. We're already there.",
      "This market will have an intelligence layer in 5 years. The only question is whether it's ours.",
    ],
  },
  {
    technique: "FOMO Signaling",
    icon: <Users className="h-4 w-4" />,
    principles: [
      "Create scarcity around the investment opportunity, not the product",
      "Reference other investor interest without name-dropping (unless permitted)",
      "Emphasize that the round is structured for strategic partners, not just capital",
      "Use timing pressure: 'We're closing this round in 6 weeks because we have a city launch sequenced'",
    ],
    examplePhrases: [
      "We're being selective about this round because the partners we bring in now will shape the next 5 years.",
      "We've had inbound interest from three regional funds, but we're prioritizing investors who understand infrastructure plays.",
      "This round closes in 6 weeks — we have Jakarta and Surabaya launches sequenced for Q3.",
    ],
  },
  {
    technique: "Institutional Confidence Language",
    icon: <Shield className="h-4 w-4" />,
    principles: [
      "Speak like a CEO running a $500M company, not a founder pitching a seed round",
      "Use precise numbers — avoid 'about', 'roughly', 'approximately' unless genuinely uncertain",
      "Replace startup jargon ('pivot', 'iterate', 'lean') with institutional language ('deploy', 'execute', 'operationalize')",
      "Reference governance, compliance, and risk management proactively",
    ],
    examplePhrases: [
      "Our unit economics are contribution-positive at the city level with 35% margins by month 14.",
      "We've operationalized our expansion playbook — each city is a deployment, not an experiment.",
      "Our data governance framework ensures full regulatory compliance across every jurisdiction we enter.",
    ],
  },
  {
    technique: "Calm Authority Tone",
    icon: <Crown className="h-4 w-4" />,
    principles: [
      "Speak slowly and deliberately — urgency comes from content, not speed",
      "Pause after key numbers to let them land. Silence signals confidence.",
      "Never apologize for your stage or size. State facts and let them speak.",
      "If challenged, acknowledge the question's intelligence before answering: 'That's exactly the right question.'",
      "End statements with downward vocal inflection — statements, not questions",
    ],
    examplePhrases: [
      "We're early. And that's exactly why this is the right time to invest.",
      "I understand the skepticism about emerging market PropTech. Let me show you why this time is different.",
      "That's a sharp question. Here's how we think about it...",
    ],
  },
];

const rehearsalFlow = [
  { phase: "Opening (2 min)", desc: "Authority positioning + market framing. Establish that you're building infrastructure, not an app.", color: "bg-primary/10 text-primary border-primary/30" },
  { phase: "Problem (3 min)", desc: "Global inefficiency framing. Make the audience feel the absurdity of how property trades today.", color: "bg-chart-1/10 text-chart-1 border-chart-1/30" },
  { phase: "Solution (4 min)", desc: "Intelligence moat explanation. Show the data flywheel and compounding advantage.", color: "bg-chart-3/10 text-chart-3 border-chart-3/30" },
  { phase: "Traction (3 min)", desc: "Momentum storytelling. Let the numbers build sequentially to create a sense of acceleration.", color: "bg-chart-4/10 text-chart-4 border-chart-4/30" },
  { phase: "Expansion (3 min)", desc: "Replication model. Show that growth is operational, not speculative.", color: "bg-accent/50 text-accent-foreground border-accent/30" },
  { phase: "Ask & Vision (2 min)", desc: "Valuation, round terms, and long-term outcome. End with inevitability.", color: "bg-primary/10 text-primary border-primary/30" },
];

/* ───────── component ───────── */

const GlobalInvestorRoadshow: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("opening");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copy(text, id)}>
      {copiedId === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Global Investor Roadshow"
        description="Structured narrative framework for international investor meetings — stage points, conversational scripts, media soundbites & persuasion techniques"
        icon={Globe}
        badge={{ text: "🌍 Roadshow", variant: "outline" }}
      />

      {/* Rehearsal Timeline */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" /> Presentation Flow — 17 Minutes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {rehearsalFlow.map((phase, i) => (
              <div key={i} className={`rounded-[6px] border p-3 space-y-1 ${phase.color}`}>
                <span className="text-xs font-bold">{phase.phase}</span>
                <p className="text-[11px] opacity-80">{phase.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Narrative Sections */}
      {sections.map(section => (
        <Card key={section.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === section.id ? null : section.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{section.icon}</div>
                <CardTitle className="text-base font-semibold text-foreground">{section.title}</CardTitle>
              </div>
              {expanded === section.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expanded === section.id && (
            <CardContent className="pt-0 space-y-4">
              <Tabs defaultValue="stage" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="stage" className="text-xs gap-1"><Mic className="h-3 w-3" /> Stage Points</TabsTrigger>
                  <TabsTrigger value="conversation" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Conversational</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs gap-1"><Newspaper className="h-3 w-3" /> Soundbite</TabsTrigger>
                </TabsList>

                <TabsContent value="stage" className="space-y-2 mt-3">
                  {section.stagePoints.map((point, i) => {
                    const pid = `${section.id}-stage-${i}`;
                    return (
                      <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-[6px] p-3 group">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm text-foreground flex-1">{point}</p>
                        <CopyBtn text={point} id={pid} />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="conversation" className="mt-3">
                  <div className="bg-muted/30 rounded-[6px] p-4 group">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{section.conversational}</p>
                    <div className="flex justify-end mt-2">
                      <CopyBtn text={section.conversational} id={`${section.id}-conv`} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="mt-3">
                  <div className="rounded-[6px] border border-primary/20 bg-primary/5 p-4 group">
                    <p className="text-sm font-medium text-foreground italic">"{section.soundbite}"</p>
                    <div className="flex justify-end mt-2">
                      <CopyBtn text={section.soundbite} id={`${section.id}-sound`} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Persuasion Techniques */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Persuasion Technique Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {persuasionTechniques.map((tech, i) => (
            <div key={i} className="rounded-[6px] border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[6px] bg-primary/10 flex items-center justify-center">{tech.icon}</div>
                <span className="text-sm font-semibold text-foreground">{tech.technique}</span>
              </div>
              <div className="space-y-1">
                {tech.principles.map((p, j) => (
                  <p key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>{p}
                  </p>
                ))}
              </div>
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Example Phrases</span>
                {tech.examplePhrases.map((phrase, j) => {
                  const phId = `tech-${i}-${j}`;
                  return (
                    <div key={j} className="flex items-start gap-2 bg-muted/30 rounded p-2 group">
                      <p className="text-xs text-foreground italic flex-1">"{phrase}"</p>
                      <CopyBtn text={phrase} id={phId} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalInvestorRoadshow;
