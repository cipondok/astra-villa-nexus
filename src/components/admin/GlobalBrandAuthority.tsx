import React, { useState } from "react";
import { Globe2, Copy, Check, ChevronDown, ChevronUp, Mic, Newspaper, Monitor, Users, Crown, Sparkles, Quote, Target, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── data ───────── */

interface NarrativeElement {
  id: string;
  title: string;
  icon: React.ReactNode;
  keynote: string[];
  mediaLines: string[];
  headlines: string[];
  investorMessaging: string[];
}

const elements: NarrativeElement[] = [
  {
    id: "mission",
    title: "Global Mission Positioning",
    icon: <Globe2 className="h-5 w-5" />,
    keynote: [
      "We started with a simple observation: the world's largest asset class operates with the least intelligence. Real estate — $380 trillion in global value — is bought and sold with less data transparency than a $50 stock trade.",
      "Our mission is to build the intelligence infrastructure that makes every property transaction in every emerging market as data-rich, transparent, and efficient as trading on a modern exchange.",
      "This isn't about building another listing portal. This is about creating the foundational layer that every property decision — from a first-time buyer to a sovereign wealth fund — will eventually flow through.",
      "We believe that when you give investors real intelligence instead of marketing brochures, and give vendors performance data instead of hope, you don't just build a better marketplace. You build a better market.",
    ],
    mediaLines: [
      "We're building the Bloomberg Terminal for real estate — starting with the fastest-growing markets where the need is greatest.",
      "Our platform doesn't show listings. It shows which properties will perform, why, and when to act.",
      "We believe every property transaction deserves the same data quality as a stock trade. That's the standard we're setting.",
    ],
    headlines: [
      "Intelligence Infrastructure for the World's Largest Asset Class",
      "Where Data Meets Real Estate. Where Instinct Becomes Intelligence.",
      "The Future of Property Isn't Listed. It's Analyzed.",
      "Making $380 Trillion Smarter, One Transaction at a Time",
    ],
    investorMessaging: [
      "Category-defining platform building the intelligence layer for a $380T asset class with zero incumbent competition",
      "Mission-driven team solving a structural market failure — not iterating on an existing model but creating a new paradigm",
      "Global vision with disciplined local execution — proving the model in one market before deploying everywhere",
    ],
  },
  {
    id: "transformation",
    title: "Industry Transformation Narrative",
    icon: <Sparkles className="h-5 w-5" />,
    keynote: [
      "Every major asset class has undergone a data transformation. Equities went from floor trading to algorithmic intelligence. Fixed income went from phone calls to electronic platforms. Commodities went from handshake deals to transparent exchanges.",
      "Real estate is the last frontier. And emerging markets — where $1.2 trillion in annual transactions happen with virtually zero standardized data — are where the transformation begins.",
      "The incumbents aren't asleep. They're structurally incapable of making this shift. Listing portals are advertising businesses. They monetize attention, not intelligence. Their entire business model depends on information asymmetry. We're eliminating it.",
      "What we're witnessing isn't disruption. It's evolution. The market is ready for intelligence-driven transactions. The only question is who builds the infrastructure.",
    ],
    mediaLines: [
      "Traditional listing portals are the classified ads of real estate. We're building the trading terminal.",
      "The property industry is where fintech was 15 years ago — massive, inefficient, and ripe for an intelligence revolution.",
      "We're not competing with listing sites. We're making them obsolete by solving a different problem entirely.",
    ],
    headlines: [
      "The Last $380 Trillion Market Without an Intelligence Layer",
      "From Listing Portals to Liquidity Intelligence — The Property Paradigm Shift",
      "Real Estate's Bloomberg Moment Has Arrived",
      "Beyond Listings: The Intelligence Era of Property Investment",
    ],
    investorMessaging: [
      "Structural market transformation play — not competing in existing category but creating the next one",
      "Incumbent portals are advertising businesses; we're an intelligence business — fundamentally different economics and moat",
      "Timing is optimal: mobile penetration, data availability, and investor sophistication have converged to enable this shift now",
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence Leadership Messaging",
    icon: <Crown className="h-5 w-5" />,
    keynote: [
      "Our platform processes 50+ data signals per property to generate opportunity scores that are 3.2x more predictive than traditional broker assessments. This isn't a feature. It's our foundation.",
      "Every transaction on our platform generates intelligence that makes the next transaction better. Every inquiry refines our demand models. Every price movement sharpens our predictions. This is a compounding data advantage that widens every day.",
      "We've built intelligence across four domains that no competitor has even attempted: liquidity prediction that tells you when a market will move, capital flow mapping that shows you where money is going before it arrives, yield optimization that calculates true risk-adjusted returns, and vendor performance scoring that separates signal from noise.",
      "The result is a platform where investors don't browse — they discover. Where vendors don't hope — they optimize. Where the market doesn't just exist — it's understood.",
    ],
    mediaLines: [
      "Our AI doesn't just list properties — it tells investors which ones will make money, why, and when to move.",
      "We process more data signals per property listing than most platforms process across their entire marketplace.",
      "Intelligence compounds. Every day our platform operates, our predictions get better and our competitors fall further behind.",
    ],
    headlines: [
      "50+ Signals. One Score. Every Property Decision, Intelligent.",
      "Property Intelligence That Compounds — Every Day, Every Transaction",
      "The Platform Where Investors Discover, Not Browse",
      "AI-Driven Property Intelligence for the Data-Native Investor",
    ],
    investorMessaging: [
      "Compounding data moat: 2.4M+ proprietary data points with 84% prediction accuracy, improving monthly",
      "Four-domain intelligence architecture (liquidity, capital flow, yield, vendor) — each independently defensible",
      "18+ month replication barrier that widens with every transaction processed — classic data flywheel economics",
    ],
  },
  {
    id: "innovation",
    title: "Innovation Credibility Storytelling",
    icon: <Lightbulb className="h-5 w-5" />,
    keynote: [
      "We didn't start by building technology. We started by understanding the market. We spent six months mapping every pain point in the Indonesian property transaction chain — from discovery to closing — before writing a single line of code.",
      "That research revealed something fundamental: the problem isn't bad listings or slow search. The problem is bad decisions. Investors make $500,000 commitments based on a WhatsApp photo and a broker's enthusiasm. We're solving the decision, not the display.",
      "Our approach is different because our question is different. We don't ask 'how do we show more properties?' We ask 'how do we make every property decision intelligent?' That question leads to fundamentally different architecture, different data models, and different value creation.",
      "The result is a platform that gets smarter with every user interaction — not because we programmed it to, but because intelligence is the product, not a feature layered on top.",
    ],
    mediaLines: [
      "We spent six months studying the market before building anything. That patience is why our platform solves the real problem.",
      "Most PropTech startups try to display properties better. We try to make property decisions better. That's a fundamentally different business.",
      "Intelligence isn't a feature we added — it's the core architecture. Everything else is built on top of data.",
    ],
    headlines: [
      "Built on Research, Not Assumptions — Intelligence-First Architecture",
      "We Don't Show Properties. We Show Decisions.",
      "From Market Research to Market Intelligence — The ASTRA Approach",
      "Technology Built to Think, Not Just Display",
    ],
    investorMessaging: [
      "Research-first founding team — 6 months of market immersion before product development, resulting in higher product-market fit velocity",
      "Intelligence-first architecture means every new feature compounds existing advantages, unlike bolt-on AI approaches",
      "Solving the decision layer, not the display layer — higher willingness-to-pay and stronger retention economics",
    ],
  },
  {
    id: "impact",
    title: "Long-Term Impact Vision",
    icon: <Target className="h-5 w-5" />,
    keynote: [
      "In five years, we envision a world where no serious property investment in Southeast Asia happens without intelligence-verified data. Where every district has a real-time liquidity score. Where every property has a validated opportunity assessment. Where the market is transparent, efficient, and fair.",
      "This isn't just a business outcome — it's a market infrastructure outcome. When property markets become intelligent, capital flows more efficiently, prices reflect reality, and investors — from institutions to first-time buyers — make better decisions.",
      "We're building for a future where ASTRA isn't a platform you choose to use — it's the infrastructure you can't operate without. Like Bloomberg for finance. Like AWS for cloud. The default layer that every transaction touches.",
      "The scale of this opportunity is generational. $380 trillion in global real estate. Zero standardized intelligence layer. First-mover advantage in the fastest-growing region. This is infrastructure that will exist for decades. We're building it now.",
    ],
    mediaLines: [
      "We're building the infrastructure that property markets will run on for the next 30 years. That's the scale of this opportunity.",
      "Our vision is a world where every property transaction — from Jakarta to Johannesburg — has intelligence-verified data behind it.",
      "We want to be the Bloomberg of real estate. Not because it sounds impressive, but because the market desperately needs it.",
    ],
    headlines: [
      "Building the Intelligence Infrastructure for the Next 30 Years of Real Estate",
      "From Platform to Protocol — The Future Default of Property Intelligence",
      "A Transparent Market Is a Better Market. We're Building Both.",
      "The Generational Opportunity: Intelligence for $380 Trillion",
    ],
    investorMessaging: [
      "Generational infrastructure opportunity — building the default intelligence layer for the world's largest asset class",
      "Platform-to-protocol trajectory: from marketplace to indispensable infrastructure with 30-year relevance horizon",
      "This is not a feature race — it's an infrastructure race. First to establish becomes permanent. We're 18 months ahead.",
    ],
  },
];

const persuasionPlaybooks = [
  {
    technique: "Inevitability & Future-Mapping",
    principles: [
      "Use 'when' not 'if' — 'When every property market has an intelligence layer...' not 'If our platform succeeds...'",
      "Reference completed transformations as proof — 'Equities did it. Fixed income did it. Real estate is next.'",
      "Position timing as structural, not lucky — 'Mobile penetration, data availability, and investor sophistication converged to make this possible now.'",
      "Frame competition as validation — 'The fact that others are attempting this proves the category exists. We're simply further ahead.'",
    ],
  },
  {
    technique: "Institutional Trust Tone",
    principles: [
      "Speak in precise numbers — 'We process 50+ signals per listing' not 'We use a lot of data'",
      "Reference governance and compliance proactively — 'Our data governance framework ensures full regulatory compliance'",
      "Use institutional vocabulary — 'deploy', 'operationalize', 'infrastructure' instead of 'launch', 'build', 'app'",
      "Acknowledge complexity without showing uncertainty — 'This is hard. That's exactly why it's defensible.'",
    ],
  },
  {
    technique: "Visionary Yet Data-Grounded",
    principles: [
      "Lead with vision, follow with numbers — 'We're building intelligence infrastructure for $380T in real estate. Today, we have 2.4M data points and 84% prediction accuracy.'",
      "Every bold claim gets a proof point — 'Our moat compounds daily' → '50+ signals per listing, 18-month replication barrier'",
      "Use analogies that land — 'Bloomberg for property' is universally understood and instantly communicates scale and defensibility",
      "Ground the future in present traction — 'The path from here to $10M ARR isn't speculative. It's operational.'",
    ],
  },
  {
    technique: "Calm Confidence Communication",
    principles: [
      "Slow delivery pace — let numbers and statements breathe. Silence after a key metric signals certainty.",
      "Never apologize for stage — 'We're early. And that's exactly why this is the right time to invest.'",
      "Redirect challenges gracefully — 'That's the right question. Here's how we think about it...'",
      "End with downward inflection — statements, not questions. Authority lives in declarative sentences.",
      "Body language: open posture, steady eye contact, minimal gestures. Stillness communicates power.",
    ],
  },
];

/* ───────── component ───────── */

const GlobalBrandAuthority: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("mission");
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

  const tabConfig = [
    { value: "keynote", label: "Keynote", icon: <Mic className="h-3 w-3" /> },
    { value: "media", label: "Media Lines", icon: <Newspaper className="h-3 w-3" /> },
    { value: "headlines", label: "Headlines", icon: <Monitor className="h-3 w-3" /> },
    { value: "investor", label: "Investor", icon: <Users className="h-3 w-3" /> },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Global Brand Authority"
        description="Storytelling framework for global market leadership — keynote narratives, media positioning, website headlines & investor brand perception"
        icon={Globe2}
        badge={{ text: "🌐 Authority", variant: "outline" }}
      />

      {/* Narrative Elements */}
      {elements.map(el => (
        <Card key={el.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === el.id ? null : el.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{el.icon}</div>
                <CardTitle className="text-base font-semibold text-foreground">{el.title}</CardTitle>
              </div>
              {expanded === el.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expanded === el.id && (
            <CardContent className="pt-0 space-y-4">
              <Tabs defaultValue="keynote" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  {tabConfig.map(t => (
                    <TabsTrigger key={t.value} value={t.value} className="text-[11px] gap-1">{t.icon} {t.label}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="keynote" className="space-y-2 mt-3">
                  {el.keynote.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-[6px] p-3 group">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-foreground leading-relaxed flex-1">{p}</p>
                      <CopyBtn text={p} id={`${el.id}-key-${i}`} />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="media" className="space-y-2 mt-3">
                  {el.mediaLines.map((line, i) => (
                    <div key={i} className="rounded-[6px] border border-primary/20 bg-primary/5 p-3 group">
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-foreground italic flex-1">"{line}"</p>
                        <CopyBtn text={line} id={`${el.id}-media-${i}`} />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="headlines" className="space-y-2 mt-3">
                  {el.headlines.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-3 group">
                      <Monitor className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-lg font-bold text-foreground flex-1">{h}</p>
                      <CopyBtn text={h} id={`${el.id}-head-${i}`} />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="investor" className="space-y-1.5 mt-3">
                  {el.investorMessaging.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2.5 group">
                      <Users className="h-3.5 w-3.5 text-chart-3 mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground flex-1">{msg}</p>
                      <CopyBtn text={msg} id={`${el.id}-inv-${i}`} />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Persuasion Playbooks */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" /> Persuasion Technique Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {persuasionPlaybooks.map((pb, i) => (
            <div key={i} className="rounded-[6px] border border-border p-4 space-y-2">
              <span className="text-sm font-semibold text-foreground">{pb.technique}</span>
              <div className="space-y-1">
                {pb.principles.map((p, j) => (
                  <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>{p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalBrandAuthority;
