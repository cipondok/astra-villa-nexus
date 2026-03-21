import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Newspaper, Copy, Check, MapPin, Crown, Target,
  Clock, Zap, Sparkles, ArrowRight, Quote, Share2,
  Mail, Mic, BarChart3, Users, CalendarDays, Eye,
  TrendingUp, Megaphone, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type Positioning = "luxury" | "investment" | "mass";
type Angle = "liquidity" | "ai-discovery" | "investor-demand";

const posLabels: Record<Positioning, string> = { luxury: "Luxury", investment: "Investment", mass: "Mass Residential" };
const angleLabels: Record<Angle, string> = { liquidity: "Liquidity Intelligence", "ai-discovery": "AI Deal Discovery", "investor-demand": "Investor Demand Access" };

interface ContentBlock { label: string; icon: React.ElementType; color: string; items: string[] }

function gen(city: string, pos: Positioning, angle: Angle, launchDate: string) {
  const c = city || "Surabaya";
  const seg = posLabels[pos].toLowerCase();
  const diff = angleLabels[angle].toLowerCase();
  const d = launchDate || "Q2 2026";

  const headlines: ContentBlock = {
    label: "Press Release Headlines", icon: Newspaper, color: "text-primary",
    items: [
      `ASTRA PropTech Launches ${c}'s First AI-Powered Property Intelligence Marketplace`,
      `${c} Property Market Gets Liquidity Intelligence Upgrade as ASTRA Expands Operations`,
      `ASTRA Brings ${diff} Technology to ${c} — Targeting ${posLabels[pos]} Segment`,
      `Data-Driven Property Platform ASTRA Opens ${c} Market with ${Math.floor(Math.random() * 300) + 500}+ Verified Listings`,
    ],
  };

  const founderQuotes: ContentBlock = {
    label: "Founder Quote Positioning", icon: Quote, color: "text-amber-400",
    items: [
      `"${c} represents one of Indonesia's most dynamic property markets, yet investors and agents still operate with almost zero intelligence infrastructure. We're changing that — ASTRA brings the same data-driven decision-making that transformed financial markets to real estate."`,
      `"We don't build listing portals. We build liquidity operating systems. ${c}'s ${seg} market has significant untapped potential, and our AI can see demand patterns that traditional platforms simply can't detect."`,
      `"Our Jakarta performance — ${Math.floor(Math.random() * 5) + 8}% inquiry-to-deal conversion, 2.3x faster closings — proves this model works. ${c} is the next step in building Indonesia's definitive property intelligence layer."`,
      `"Every transaction on ASTRA generates intelligence that makes the next transaction better. By the time competitors consider ${c}, our data advantage will be years ahead."`,
    ],
  };

  const socialPosts: ContentBlock = {
    label: "Social Media Launch Posts", icon: Share2, color: "text-cyan-400",
    items: [
      `🚀 We're live in ${c}.\n\nASTRA's AI-powered property intelligence marketplace is now open for ${c}'s ${seg} market.\n\n${Math.floor(Math.random() * 300) + 500}+ verified listings. Real-time demand data. Smarter deals.\n\nThe future of property in ${c} starts today.\n\n→ Explore now: {{LINK}}\n\n#ASTRA #PropTech #${c} #RealEstateIntelligence`,

      `📊 ${c} property market, meet data.\n\nNo more guessing. No more gut feeling.\n\nASTRA's ${diff} engine shows you:\n✓ Which properties will move fastest\n✓ Where investor demand is concentrated\n✓ What the real market price should be\n\nNow live in ${c}. →  {{LINK}}`,

      `To every agent in ${c} still relying on intuition:\n\nYour competitors just got access to AI-powered lead routing, investor matching, and liquidity scoring.\n\nThe early movers are already listing.\n\nJoin ASTRA — founding vendors get 90 days premium free.\n\n→ {{VENDOR_LINK}}`,
    ],
  };

  const investorMsg: ContentBlock = {
    label: "Investor Credibility Messaging", icon: TrendingUp, color: "text-emerald-500",
    items: [
      `${c} expansion validates our repeatable city-launch playbook. Jakarta delivered ${Math.floor(Math.random() * 3) + 5}x lower CAC by month 3. We expect ${c} to follow the same trajectory with 40% lower launch costs due to cross-market intelligence spillover.`,
      `Each new city adds to our data moat. ${c}'s ${seg} transaction patterns will compound with our existing Jakarta intelligence to improve prediction accuracy across both markets — this is the network effect at the data layer.`,
      `${c} TAM: Rp ${Math.floor(Math.random() * 30) + 40}T annual residential transactions. Our target: 2% transaction influence within 12 months, scaling to 8% by month 24. At current unit economics, this represents Rp ${Math.floor(Math.random() * 5) + 3}B annual revenue from ${c} alone.`,
    ],
  };

  const vendorNarrative: ContentBlock = {
    label: "Vendor Acquisition Authority Narrative", icon: Users, color: "text-violet-400",
    items: [
      `"ASTRA isn't another portal competing for your listings. We're the intelligence layer that makes your listings perform better — smarter lead routing, AI-matched investors, and performance analytics that help you close faster."`,
      `"Founding vendors in Jakarta saw 3x more qualified inquiries in their first month compared to traditional channels. ${c} founding vendors get the same advantage — plus 90 days of premium visibility, free."`,
      `"Our platform doesn't just show your listing. It scores it for liquidity, matches it with verified high-intent investors, and routes the most qualified leads directly to you. That's the difference between a listing portal and an intelligence marketplace."`,
    ],
  };

  const prPitch = `Subject: ${c}'s Property Market Just Got Its Intelligence Upgrade — ASTRA Launch Story\n\nHi {{JOURNALIST_NAME}},\n\nQuick pitch — relevant to your ${c} / proptech / startup beat.\n\nASTRA PropTech is launching ${c}'s first AI-powered property intelligence marketplace on {{LAUNCH_DATE}}. Unlike traditional listing portals, ASTRA uses behavioral demand signals and machine learning to predict which properties will transact fastest, match investors with high-confidence deals, and give agents real-time performance intelligence.\n\nThe story angle:\n• First mover: No comparable intelligence platform exists in ${c}'s ${seg} market\n• Traction proof: Jakarta launch delivered ${Math.floor(Math.random() * 3) + 7}% inquiry-to-deal conversion (2.4x industry average)\n• Market timing: ${c}'s ${seg} segment is experiencing ${Math.floor(Math.random() * 10) + 15}% YoY demand growth with zero intelligence infrastructure\n\nAvailable for interview: Founder / CEO (can discuss AI real estate intelligence, ${c} market dynamics, proptech investment landscape)\n\nWant me to send the full press release + data pack?\n\nBest,\n{{YOUR_NAME}}\n{{YOUR_TITLE}}, ASTRA PropTech\n{{YOUR_PHONE}}`;

  const eventCopy = `🎤 ASTRA ${c} Launch Event\n\n"The Intelligence Advantage: How Data is Reshaping ${c}'s Property Market"\n\n📅 {{EVENT_DATE}} | ⏰ {{EVENT_TIME}} | 📍 {{VENUE}}\n\nJoin ASTRA's founder for an exclusive look at:\n\n• How AI is predicting property liquidity in real-time\n• ${c}'s hidden demand patterns — what the data reveals\n• Why the smartest agents and investors are switching to intelligence-first platforms\n• Live demo: ASTRA's ${diff} engine in action\n\nWho should attend:\n→ Property agents seeking competitive advantage\n→ Investors looking for data-backed deal discovery\n→ Developers interested in demand intelligence\n→ Media covering proptech innovation\n\n🎁 All attendees receive:\n• 90-day premium vendor access (agents)\n• 3 free deal intelligence unlocks (investors)\n• Exclusive ${c} market intelligence report\n\nLimited to 50 seats. Reserve now: {{RSVP_LINK}}`;

  const reportTeaser = `📊 ASTRA ${c} Market Intelligence Report — ${d}\n\n"${c} Property Liquidity Index: Where Smart Capital is Moving"\n\nKey findings preview:\n\n▸ ${c}'s top 5 districts by investment liquidity score\n▸ Demand-supply gap analysis by property type and price band\n▸ Investor behavioral trends: what ${c}'s buyers actually search for\n▸ Pricing intelligence: over/undervalued corridors identified by AI\n▸ 12-month ${seg} market trajectory forecast\n\nThis is the kind of intelligence that institutional investors pay consultants $50K to produce. ASTRA generates it automatically.\n\nDownload the full report: {{REPORT_LINK}}\n\n(Available exclusively to ASTRA platform members)`;

  return { headlines, founderQuotes, socialPosts, investorMsg, vendorNarrative, prPitch, eventCopy, reportTeaser };
}

const CityLaunchPRPlan = () => {
  const { toast } = useToast();
  const [city, setCity] = useState("Surabaya");
  const [pos, setPos] = useState<Positioning>("investment");
  const [angle, setAngle] = useState<Angle>("liquidity");
  const [launchDate, setLaunchDate] = useState("Q2 2026");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const data = gen(city, pos, angle, launchDate);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contentBlocks = [data.headlines, data.founderQuotes, data.socialPosts, data.investorMsg, data.vendorNarrative];
  const longFormBlocks = [
    { label: "PR Pitch Email for Journalists", icon: Mail, color: "text-primary", text: data.prPitch },
    { label: "Event / Webinar Announcement", icon: Mic, color: "text-amber-400", text: data.eventCopy },
    { label: "Market Intelligence Report Teaser", icon: BarChart3, color: "text-cyan-400", text: data.reportTeaser },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          City Launch PR Plan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Full PR kit — press headlines, founder quotes, social posts, journalist pitch, event copy & report teasers
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" />Launch City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Jakarta", "Bandung", "Surabaya", "Bali", "Medan", "Yogyakarta", "Makassar"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Crown className="h-3 w-3" />Positioning</label>
              <Select value={pos} onValueChange={v => setPos(v as Positioning)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(posLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" />Differentiation</label>
              <Select value={angle} onValueChange={v => setAngle(v as Angle)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(angleLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><CalendarDays className="h-3 w-3" />Launch</label>
              <Input value={launchDate} onChange={e => setLaunchDate(e.target.value)} className="h-8 text-xs" placeholder="Q2 2026" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Cadence */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { phase: "Pre-Launch Buzz", timeline: "2 weeks before", actions: "Media outreach, teaser social posts, vendor founding campaign, event invitations", icon: Megaphone, color: "text-amber-400" },
          { phase: "Launch Day Blast", timeline: "Day 0", actions: "Press release, founder interview availability, social media blitz, event/webinar, report release", icon: Zap, color: "text-destructive" },
          { phase: "Post-Launch Credibility", timeline: "Week 1-4 after", actions: "Traction updates, vendor success stories, investor testimonials, weekly market insights", icon: TrendingUp, color: "text-emerald-500" },
        ].map((p, i) => (
          <Card key={i} className="border-border/40 bg-card/70">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <p.icon className={`h-4 w-4 ${p.color}`} />
                <p className="text-xs font-bold text-foreground">{p.phase}</p>
              </div>
              <Badge variant="outline" className="text-[9px] mb-1.5">{p.timeline}</Badge>
              <p className="text-[11px] text-muted-foreground">{p.actions}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Blocks */}
      {contentBlocks.map((block, bi) => (
        <motion.div key={`${block.label}-${city}-${pos}-${angle}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.04 }}>
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <block.icon className={`h-5 w-5 ${block.color}`} />
                {block.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {block.items.map((item, ii) => (
                <div key={ii} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20 group">
                  <div className="flex-1">
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{item}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copy(item, `${bi}-${ii}`)}>
                    {copiedKey === `${bi}-${ii}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Long-form blocks */}
      {longFormBlocks.map((block, bi) => (
        <motion.div key={`long-${bi}-${city}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (contentBlocks.length + bi) * 0.04 }}>
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <block.icon className={`h-5 w-5 ${block.color}`} />
                  {block.label}
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => copy(block.text, `long-${bi}`)}>
                  {copiedKey === `long-${bi}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === `long-${bi}` ? "Copied" : "Copy All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed p-3 rounded-lg bg-muted/20 border border-border/20 font-sans">{block.text}</pre>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CityLaunchPRPlan;
