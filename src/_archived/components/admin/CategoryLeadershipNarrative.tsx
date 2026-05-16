import React, { useState } from "react";
import { Crown, Copy, Check, Quote, Mic, Presentation, FileText, Sparkles, TrendingUp, Globe, Shield, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── data ───────── */

const categoryDefinition = {
  statement: "ASTRA doesn't compete in the property listing market. ASTRA created the Property Liquidity Intelligence category — a fundamentally new operating system for how real estate capital discovers, evaluates, and executes transactions at the speed of modern markets.",
  oldParadigm: [
    { problem: "Listing portals are digital billboards", reality: "They display properties but don't understand demand, predict outcomes, or facilitate intelligent matching." },
    { problem: "Fragmented information creates paralysis", reality: "Investors waste 40+ hours per deal navigating disconnected data sources, agents, and regulatory systems." },
    { problem: "Transaction infrastructure is stuck in 1995", reality: "Offers, negotiations, and closings still depend on manual coordination, paper documents, and phone calls." },
    { problem: "No compounding intelligence exists", reality: "Every transaction on traditional platforms teaches the platform nothing. Data is discarded, not weaponized." },
  ],
  newParadigm: [
    { shift: "From listing display → liquidity orchestration", desc: "ASTRA doesn't just show properties — it actively matches capital to opportunity using behavioral, market, and financial intelligence signals." },
    { shift: "From passive search → predictive discovery", desc: "AI surfaces deals investors didn't know they needed, with confidence scores, yield projections, and timing recommendations." },
    { shift: "From fragmented tools → unified transaction OS", desc: "Discovery, evaluation, offer, negotiation, financing, and closing happen in a single intelligent environment." },
    { shift: "From static data → compounding intelligence moat", desc: "Every interaction trains the platform. Every transaction deepens the data advantage. Every user makes the system smarter for every other user." },
  ],
};

const narrativeVersions = {
  manifesto: {
    title: "The Manifesto",
    icon: <FileText className="h-4 w-4" />,
    paragraphs: [
      "The $300 trillion global real estate market still runs on information asymmetry, manual processes, and fragmented tools built for a pre-internet era. Listing portals digitized the billboard — but they never reinvented the transaction.",
      "We believe real estate deserves an intelligence layer. A system that doesn't just display inventory, but understands demand patterns, predicts price movements, matches capital to opportunity, and orchestrates transactions with the precision of modern financial markets.",
      "ASTRA is building the liquidity operating system for global real estate. We are not improving the listing portal. We are replacing the category entirely.",
      "In 5 years, no serious investor will make a property decision without an intelligence platform. The only question is who builds it first. We already have.",
      "The listing portal era is over. The Property Liquidity Intelligence era has begun. And ASTRA is the defining platform of this shift.",
    ],
  },
  investor: {
    title: "Investor Presentation",
    icon: <Presentation className="h-4 w-4" />,
    paragraphs: [
      "ASTRA occupies a category of one. We are not a listing portal competing for vendor fees. We are building the intelligence infrastructure that every real estate transaction in Southeast Asia will eventually flow through.",
      "Our thesis: the platform that accumulates the most transaction intelligence wins the entire market — because every data point improves matching accuracy, every match increases conversion velocity, and every conversion attracts more supply and demand. This is a compounding advantage that cannot be replicated by spending more on marketing.",
      "Today we have [X] listings, [Y] active investors, and a [Z]% month-over-month inquiry growth rate in our launch city. This is not a listing count story. This is a liquidity density story — and liquidity density is the metric that determines whether a marketplace becomes indispensable or disposable.",
      "We are raising to accelerate the flywheel: deepen intelligence capabilities, expand to 3 cities, and build the transaction layer that captures 0.5-1.5% of every deal we facilitate. At $30M ARR, this is a $300M+ platform on conservative multiples.",
      "The window to build this is now — before incumbents realize listings are a commodity and intelligence is the moat. Every month we operate is a month of irreplaceable data advantage.",
    ],
  },
  soundbites: {
    title: "Media Soundbites",
    icon: <Mic className="h-4 w-4" />,
    paragraphs: [
      "\"We don't compete with listing portals. That's like saying Google competed with the Yellow Pages. We're building something categorically different — a liquidity intelligence system for real estate.\"",
      "\"The question isn't whether real estate will get its Bloomberg Terminal. The question is who builds it. We're already live, already learning, and already compounding data that competitors cannot buy.\"",
      "\"Every property platform shows you what's available. We're the only one that tells you what's about to happen — which markets are heating, which deals are underpriced, which opportunities will disappear tomorrow.\"",
      "\"In 3 years, investing in property without AI intelligence will feel like trading stocks without a Bloomberg. We're building that inevitability.\"",
      "\"Traditional real estate is a $300 trillion market running on phone calls and gut feeling. We're replacing gut feeling with machine intelligence. That's not an incremental improvement — it's a category shift.\"",
      "\"Our moat isn't our code. It's our data. Every transaction we process makes our predictions more accurate. Every prediction that's accurate attracts more transactions. This flywheel is already spinning.\"",
    ],
  },
};

const persuasionTechniques = [
  {
    technique: "Inevitability Framing",
    icon: <TrendingUp className="h-4 w-4 text-primary" />,
    principle: "Position the outcome as certain — the only variable is timing and who leads it.",
    examples: [
      "\"This shift is happening with or without us. But we're 18 months ahead.\"",
      "\"Every industry gets its intelligence layer. Real estate is next. We're building it.\"",
      "\"The data advantage compounds daily. The longer we run, the more insurmountable the gap becomes.\"",
    ],
  },
  {
    technique: "Ecosystem Shift Logic",
    icon: <Globe className="h-4 w-4 text-primary" />,
    principle: "Show that the entire market structure is changing — not just your product.",
    examples: [
      "\"Investors are already migrating from passive search to AI-assisted discovery. We serve the destination.\"",
      "\"Vendors no longer want eyeballs — they want qualified, scored, ready-to-transact demand. Only we deliver that.\"",
      "\"The shift from listing portals to intelligence platforms mirrors the shift from classified ads to Google. Same pattern, same outcome.\"",
    ],
  },
  {
    technique: "Intelligence Moat Emphasis",
    icon: <Shield className="h-4 w-4 text-primary" />,
    principle: "Make it clear that your advantage grows with time and cannot be replicated by spending.",
    examples: [
      "\"You can copy our UI in 6 months. You cannot copy 2 years of proprietary transaction data.\"",
      "\"Our pricing model has processed [X] data points. A new entrant starts at zero. That gap only widens.\"",
      "\"Intelligence moats are the only moats that get stronger over time. Ours is already compounding.\"",
    ],
  },
  {
    technique: "Future Market Map",
    icon: <Lightbulb className="h-4 w-4 text-primary" />,
    principle: "Paint a vivid picture of the future where your platform is the default infrastructure.",
    examples: [
      "\"In 2030, every real estate transaction in Southeast Asia will touch an intelligence layer. We intend to be that layer.\"",
      "\"Imagine a world where property investment is as data-driven as public equity trading. That's what we're building.\"",
      "\"The future has one property intelligence platform per region, the way each financial market has one dominant terminal. We're building Southeast Asia's.\"",
    ],
  },
];

/* ───────── component ───────── */

const CategoryLeadershipNarrative: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyText(text, id)}>
      {copiedId === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Category Leadership Narrative"
        description="Strategic positioning framework to define and dominate a new PropTech category — manifesto, investor pitch & media soundbites"
        icon={Crown}
        badge={{ text: "👑 Category", variant: "outline" }}
      />

      {/* Category Definition */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Category Definition Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-[6px] border border-primary/20 bg-primary/5 p-4 group relative">
            <p className="text-sm text-foreground leading-relaxed font-medium">{categoryDefinition.statement}</p>
            <div className="absolute top-2 right-2">
              <CopyBtn text={categoryDefinition.statement} id="cat-def" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Old vs New Paradigm */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-destructive">Why the Old Market is Broken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryDefinition.oldParadigm.map((item, i) => (
              <div key={i} className="rounded-[6px] border border-destructive/20 bg-destructive/5 p-3 space-y-1 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">{item.problem}</p>
                  <CopyBtn text={`${item.problem}: ${item.reality}`} id={`old-${i}`} />
                </div>
                <p className="text-xs text-muted-foreground">{item.reality}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-primary">The New Value Paradigm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryDefinition.newParadigm.map((item, i) => (
              <div key={i} className="rounded-[6px] border border-primary/20 bg-primary/5 p-3 space-y-1 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">{item.shift}</p>
                  <CopyBtn text={`${item.shift}: ${item.desc}`} id={`new-${i}`} />
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Narrative Versions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Narrative Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manifesto" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              {Object.entries(narrativeVersions).map(([key, v]) => (
                <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
                  {v.icon}{v.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(narrativeVersions).map(([key, version]) => (
              <TabsContent key={key} value={key} className="space-y-2 mt-3">
                {version.paragraphs.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-3 group">
                    <Quote className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p}</p>
                    <CopyBtn text={p} id={`${key}-${i}`} />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mt-2"
                  onClick={() => {
                    const full = version.paragraphs.join("\n\n");
                    copyText(full, `${key}-all`);
                  }}
                >
                  <Copy className="h-3 w-3 mr-1.5" /> Copy Full {version.title}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Persuasion Techniques */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Persuasion Techniques & Ready-to-Use Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {persuasionTechniques.map((tech, ti) => (
            <div key={ti} className="space-y-2">
              <div className="flex items-center gap-2">
                {tech.icon}
                <h5 className="text-sm font-semibold text-foreground">{tech.technique}</h5>
              </div>
              <p className="text-xs text-muted-foreground italic ml-6">{tech.principle}</p>
              <div className="space-y-1.5 ml-6">
                {tech.examples.map((ex, ei) => (
                  <div key={ei} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2.5 group">
                    <p className="text-xs text-foreground flex-1 font-medium">{ex}</p>
                    <CopyBtn text={ex.replace(/"/g, "")} id={`tech-${ti}-${ei}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Storytelling Sequence */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Recommended Storytelling Sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { step: 1, title: "Name the Broken System", duration: "60s", note: "Describe the listing portal world — fragmented, dumb, static. Make the audience feel the pain." },
              { step: 2, title: "Declare the Category Shift", duration: "45s", note: "Announce: 'We created a new category — Property Liquidity Intelligence.' Let it land." },
              { step: 3, title: "Explain Why Now", duration: "60s", note: "AI maturity + mobile-first investors + data availability = perfect timing for this category." },
              { step: 4, title: "Show the Compounding Moat", duration: "90s", note: "Demonstrate how every transaction makes the platform smarter. Draw the flywheel." },
              { step: 5, title: "Prove with Traction", duration: "60s", note: "Show growth curves, inquiry velocity, vendor adoption. Let numbers validate the narrative." },
              { step: 6, title: "Paint the Inevitable Future", duration: "45s", note: "Describe the world in 5 years where ASTRA is default infrastructure. Make it feel certain." },
            ].map((item) => (
              <div key={item.step} className="rounded-[6px] border border-border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{item.step}</div>
                  <span className="text-sm font-semibold text-foreground">{item.title}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{item.duration}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryLeadershipNarrative;
