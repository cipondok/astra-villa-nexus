import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Mail, Phone, Bell, Copy, Check, MapPin, DollarSign,
  Clock, Zap, Shield, TrendingUp, Heart, Target,
  ArrowRight, Sparkles, Users, Eye, Crown, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type AssetClass = "rental-yield" | "luxury" | "land" | "commercial";
type Urgency = "active" | "passive";

const assetLabels: Record<AssetClass, string> = {
  "rental-yield": "Rental Yield", luxury: "Luxury Lifestyle", land: "Land / Development", commercial: "Commercial",
};

interface Step {
  id: string;
  label: string;
  timing: string;
  objective: string;
  icon: React.ElementType;
  color: string;
  whatsapp: string;
  email: { subject: string; body: string };
  push: string;
}

function generateSteps(budget: string, asset: AssetClass, city: string, urgency: Urgency): Step[] {
  const assetName = assetLabels[asset].toLowerCase();
  const b = budget || "Rp 2-5B";
  const c = city || "Jakarta";
  const isActive = urgency === "active";

  return [
    {
      id: "S1", label: "Instant Inquiry Response", timing: "Within 2 minutes", objective: "Acknowledge, validate decision, set expectation",
      icon: Zap, color: "text-primary",
      whatsapp: `Hi {{NAME}} 👋\n\nThank you for your inquiry on the {{PROPERTY_NAME}} in ${c}.\n\nI'm {{AGENT_NAME}} from ASTRA's investment advisory team. I've pulled the full intelligence report on this property — including yield projections, area liquidity data, and comparable transaction history.\n\nWould you prefer I send the report here, or schedule a quick 10-minute call to walk you through the key numbers?\n\n— ASTRA Intelligence`,
      email: {
        subject: `Your ${c} Investment Inquiry — Intelligence Report Ready`,
        body: `Hi {{NAME}},\n\nThank you for your interest in {{PROPERTY_NAME}} — you've selected a property in one of ${c}'s highest-performing investment corridors.\n\nI've prepared a comprehensive intelligence brief covering:\n\n• Projected rental yield & capital appreciation analysis\n• Area liquidity score and transaction velocity data\n• Comparable sales from the past 6 months\n• Risk assessment and market timing signals\n\nI'd love to walk you through these insights. Would you have 10 minutes for a brief call this week?\n\nAlternatively, I can send the full report directly — just reply "Send Report" and I'll share it immediately.\n\nBest regards,\n{{AGENT_NAME}}\nInvestment Intelligence, ASTRA PropTech`,
      },
      push: `📊 Your intelligence report for {{PROPERTY_NAME}} is ready. Tap to view yield analysis & market data.`,
    },
    {
      id: "S2", label: "Credibility & Social Proof", timing: "24 hours after inquiry", objective: "Build trust through data authority and peer validation",
      icon: Shield, color: "text-emerald-500",
      whatsapp: `Hi {{NAME}} — quick update from ASTRA.\n\nSince your inquiry yesterday, here's what our intelligence system flagged:\n\n📈 ${c} ${assetName} demand is up 23% this quarter\n🏠 Properties in your ${b} range are averaging 11 days on market\n👥 ${Math.floor(Math.random() * 30) + 40} verified investors searched this district last week\n\nInvestors using ASTRA's intelligence data close deals 2.3x faster than the market average — because they're making decisions with data, not guesswork.\n\nWant me to show you how our scoring works for properties in your range?`,
      email: {
        subject: `${c} Market Intelligence Update — What ${Math.floor(Math.random() * 30) + 40} Investors Are Watching`,
        body: `Hi {{NAME}},\n\nI wanted to share something relevant to your search.\n\nOur AI intelligence engine processes over 12,000 behavioral signals daily across ${c}'s property market. Here's what it's showing for the ${assetName} segment in your ${b} range:\n\n▸ Demand Index: Up 23% quarter-over-quarter\n▸ Average Days on Market: 11 days (down from 18 last quarter)\n▸ Active Verified Investors in Segment: ${Math.floor(Math.random() * 30) + 40}+\n▸ Predicted Price Movement (90-day): +4.2%\n\nInvestors who access our full intelligence reports before making offers have a 67% higher success rate in competitive situations.\n\nWould you like me to generate a personalized market intelligence brief for your specific criteria?\n\nBest,\n{{AGENT_NAME}}`,
      },
      push: `📈 ${c} ${assetName} demand up 23% this quarter. ${Math.floor(Math.random() * 30) + 40} investors watching your segment. Tap for insights.`,
    },
    {
      id: "S3", label: "Curated Deal Suggestion", timing: "48 hours / Day 3", objective: "Deliver personalized value, demonstrate AI matching capability",
      icon: Target, color: "text-cyan-400",
      whatsapp: `Hi {{NAME}} — our AI just flagged 3 properties that match your investment criteria:\n\n🏢 1. {{DEAL_1_NAME}} — ${b} · Est. yield {{YIELD_1}}%\n   Liquidity Score: 89/100 · Match: 94%\n\n🏠 2. {{DEAL_2_NAME}} — ${b} · Est. yield {{YIELD_2}}%\n   Liquidity Score: 82/100 · Match: 91%\n\n🏗️ 3. {{DEAL_3_NAME}} — ${b} · Est. yield {{YIELD_3}}%\n   Liquidity Score: 78/100 · Match: 87%\n\nThese scored highest in our matching algorithm based on your ${assetName} preference and ${b} budget.\n\n${isActive ? "Want me to schedule viewings for your top picks this week?" : "Want me to send the full investment memos?"}\n\n🔒 Full analysis available with Deal Unlock`,
      email: {
        subject: `3 AI-Matched ${assetLabels[asset]} Opportunities in ${c} — Curated for You`,
        body: `Hi {{NAME}},\n\nOur investment matching engine has identified three properties that align closely with your criteria:\n\nBudget: ${b} | Asset Class: ${assetLabels[asset]} | City: ${c}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. {{DEAL_1_NAME}}\n   Price: {{DEAL_1_PRICE}} | Projected Yield: {{YIELD_1}}%\n   Liquidity Score: 89/100 | Match Confidence: 94%\n   Key Signal: High rental demand corridor, 96% occupancy\n\n2. {{DEAL_2_NAME}}\n   Price: {{DEAL_2_PRICE}} | Projected Yield: {{YIELD_2}}%\n   Liquidity Score: 82/100 | Match Confidence: 91%\n   Key Signal: Infrastructure catalyst (MRT Phase 2)\n\n3. {{DEAL_3_NAME}}\n   Price: {{DEAL_3_PRICE}} | Projected Yield: {{YIELD_3}}%\n   Liquidity Score: 78/100 | Match Confidence: 87%\n   Key Signal: Below-market entry, appreciation play\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUnlock the full investment memo for any property — including comparable analysis, risk assessment, and projected IRR — through your ASTRA dashboard.\n\nBest,\n{{AGENT_NAME}}`,
      },
      push: `🎯 3 new AI-matched deals in ${c} (up to {{YIELD_1}}% yield). Tap to explore.`,
    },
    {
      id: "S4", label: "Urgency Activation", timing: "Day 5-7", objective: "Create fear of missing opportunity, drive action",
      icon: Clock, color: "text-destructive",
      whatsapp: `Hi {{NAME}} — important update on the properties you viewed.\n\n⚡ {{DEAL_1_NAME}} just received ${Math.floor(Math.random() * 3) + 2} new investor inquiries in the last 48 hours.\n\nOur data shows:\n• Properties at this price point in ${c} are closing in avg 11 days\n• Investor competition for ${assetName} assets in this district is at a 6-month high\n• Once a property reaches 5+ active inquiries, prices typically firm by 3-5%\n\nI don't want you to miss this window. ${isActive ? "Can we schedule a viewing tomorrow?" : "Would you like me to reserve a priority viewing slot?"}\n\n🔓 Unlock full deal analysis: {{UNLOCK_LINK}}`,
      email: {
        subject: `⚡ Activity Alert: ${Math.floor(Math.random() * 3) + 2} New Investors on Your Shortlisted Property`,
        body: `Hi {{NAME}},\n\nI wanted to flag something time-sensitive.\n\n{{DEAL_1_NAME}} — the property you expressed interest in — has seen a notable spike in investor activity:\n\n▸ ${Math.floor(Math.random() * 3) + 2} new qualified inquiries in 48 hours\n▸ 2 viewing requests scheduled this week\n▸ ASTRA Urgency Score: HIGH (87/100)\n\nMarket context:\nProperties in this segment are averaging 11 days on market. Once investor interest crosses the 5-inquiry threshold, our data shows sellers typically reduce negotiation flexibility by 3-5%.\n\nI'd recommend acting within the next 48-72 hours if this property aligns with your criteria.\n\nNext steps:\n→ Unlock full investment analysis: {{UNLOCK_LINK}}\n→ Schedule priority viewing: {{BOOKING_LINK}}\n→ Reply to this email and I'll hold a slot for you\n\nBest,\n{{AGENT_NAME}}`,
      },
      push: `⚡ ${Math.floor(Math.random() * 3) + 2} investors just inquired on your shortlisted property in ${c}. Act now →`,
    },
    {
      id: "S5", label: "Monetization Conversion", timing: "Day 7-10", objective: "Convert to paid deal unlock or premium access",
      icon: Crown, color: "text-amber-400",
      whatsapp: `Hi {{NAME}} — I have something exclusive for you.\n\nBased on your investment profile, I've curated a private selection of ${c}'s highest-scoring opportunities — properties that haven't been released to the general marketplace yet.\n\n🔐 What's included in your Deal Unlock:\n• Full investment memo with projected IRR\n• Comparable transaction analysis\n• AI risk assessment score\n• Vendor performance & negotiation insights\n• Priority viewing scheduling\n\n💰 Special: First unlock at 50% off — {{DISCOUNT_PRICE}} instead of {{FULL_PRICE}}\n\nThis pricing is available for the next 48 hours.\n\n→ Unlock now: {{UNLOCK_LINK}}\n\nInvestors who use our intelligence reports close 2.3x faster and negotiate 4% better terms on average.`,
      email: {
        subject: `🔐 Exclusive: Private Deal Access + 50% Off Your First Intelligence Unlock`,
        body: `Hi {{NAME}},\n\nYou've been exploring ${c}'s ${assetName} market through ASTRA, and I'd like to offer you something we reserve for serious investors.\n\nPrivate Deal Intelligence Access\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nOur premium intelligence unlocks give you the analytical edge that institutional investors rely on:\n\n✓ Full Investment Memo — projected IRR, cash-on-cash return, exit scenarios\n✓ Comparable Analysis — verified transaction data within 1km radius\n✓ AI Risk Assessment — regulatory, market, and execution risk scoring\n✓ Vendor Intelligence — agent track record, response speed, negotiation patterns\n✓ Priority Scheduling — skip the queue for viewings and offers\n\nAs a first-time user, your first unlock is 50% off:\n{{DISCOUNT_PRICE}} instead of {{FULL_PRICE}}\n\nThis offer expires in 48 hours.\n\n→ Unlock Your First Deal: {{UNLOCK_LINK}}\n\nThe data speaks for itself: investors using ASTRA intelligence close 2.3x faster and achieve 4% better terms than the market average.\n\nBest,\n{{AGENT_NAME}}`,
      },
      push: `🔐 50% off your first Deal Unlock — full investment memo, risk score & comparable data. 48h only →`,
    },
    {
      id: "S6", label: "Long-Term Relationship Nurture", timing: "Weekly (Day 14+)", objective: "Maintain engagement, build habitual platform usage, drive repeat monetization",
      icon: Heart, color: "text-violet-400",
      whatsapp: `Hi {{NAME}} — your weekly ${c} market pulse from ASTRA 📊\n\nThis week:\n📈 ${assetLabels[asset]} demand: +{{DEMAND_CHANGE}}% vs last week\n🏠 New listings in your range: {{NEW_LISTINGS}}\n💰 Avg price movement: {{PRICE_CHANGE}}%\n🎯 Top match for you: {{TOP_MATCH_NAME}} ({{MATCH_SCORE}}% match)\n\n${isActive ? "Ready to make your move? I can set up viewings this week." : "Any of these catch your eye? I'm here when you're ready to go deeper."}\n\nStay sharp,\nASTRA Intelligence`,
      email: {
        subject: `Your Weekly ${c} ${assetLabels[asset]} Market Intelligence Brief`,
        body: `Hi {{NAME}},\n\nHere's your personalized market intelligence for the week of {{DATE}}.\n\n${c.toUpperCase()} ${assetLabels[asset].toUpperCase()} MARKET PULSE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n▸ Demand Index: {{DEMAND_INDEX}} ({{DEMAND_CHANGE}}% week-over-week)\n▸ New Listings in ${b} Range: {{NEW_LISTINGS}}\n▸ Average Price Movement: {{PRICE_CHANGE}}%\n▸ Investor Activity Level: {{ACTIVITY_LEVEL}}\n▸ Liquidity Score: {{LIQUIDITY_SCORE}}/100\n\nYOUR TOP MATCHES THIS WEEK\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. {{TOP_MATCH_NAME}} — Match: {{MATCH_SCORE}}%\n   {{TOP_MATCH_HEADLINE}}\n\n2. {{MATCH_2_NAME}} — Match: {{MATCH_2_SCORE}}%\n   {{MATCH_2_HEADLINE}}\n\nView all matches and unlock full analysis on your dashboard.\n\n→ Open Dashboard: {{DASHBOARD_LINK}}\n\nBest,\n{{AGENT_NAME}}\nASTRA PropTech Intelligence`,
      },
      push: `📊 Weekly ${c} pulse: ${assetLabels[asset]} demand {{DEMAND_CHANGE}}%, {{NEW_LISTINGS}} new listings in your range. Tap →`,
    },
  ];
}

const InvestorNurturingSequence = () => {
  const { toast } = useToast();
  const [city, setCity] = useState("Jakarta");
  const [budget, setBudget] = useState("Rp 2-5B");
  const [asset, setAsset] = useState<AssetClass>("rental-yield");
  const [urgency, setUrgency] = useState<Urgency>("active");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [channel, setChannel] = useState<"whatsapp" | "email" | "push">("whatsapp");

  const steps = generateSteps(budget, asset, city, urgency);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getText = (step: Step) => {
    if (channel === "whatsapp") return step.whatsapp;
    if (channel === "email") return `Subject: ${step.email.subject}\n\n${step.email.body}`;
    return step.push;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Investor Nurturing Sequence
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          6-step lifecycle flow — from instant response to weekly nurture across WhatsApp, Email & Push
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" />City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Jakarta", "Bandung", "Surabaya", "Bali", "Medan"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Rp 500M-1B", "Rp 1-2B", "Rp 2-5B", "Rp 5-10B", "Rp 10B+"].map(b => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><BarChart3 className="h-3 w-3" />Asset Class</label>
              <Select value={asset} onValueChange={v => setAsset(v as AssetClass)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(assetLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Zap className="h-3 w-3" />Urgency</label>
              <Select value={urgency} onValueChange={v => setUrgency(v as Urgency)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs">Active Buyer</SelectItem>
                  <SelectItem value="passive" className="text-xs">Passive Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase">Channel:</span>
        {([
          { key: "whatsapp" as const, label: "WhatsApp", icon: Phone },
          { key: "email" as const, label: "Email", icon: Mail },
          { key: "push" as const, label: "Push", icon: Bell },
        ]).map(ch => (
          <Button key={ch.key} size="sm" variant={channel === ch.key ? "default" : "outline"} className="h-7 text-xs gap-1.5" onClick={() => setChannel(ch.key)}>
            <ch.icon className="h-3 w-3" />{ch.label}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        <div className="absolute left-[18px] top-6 bottom-6 w-px bg-border/40 hidden md:block" />

        {steps.map((step, i) => (
          <motion.div key={`${step.id}-${channel}-${asset}-${urgency}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/70 md:ml-10 relative">
              {/* Timeline dot */}
              <div className="absolute -left-[46px] top-5 w-4 h-4 rounded-full bg-card border-2 border-primary hidden md:flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{step.id}</Badge>
                    <step.icon className={`h-4 w-4 ${step.color}`} />
                    <CardTitle className="text-sm">{step.label}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] gap-1"><Clock className="h-3 w-3" />{step.timing}</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleCopy(getText(step), step.id)}>
                      {copiedKey === step.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === step.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 rounded-md bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" />Objective</p>
                  <p className="text-xs text-foreground">{step.objective}</p>
                </div>

                {channel === "email" && (
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary uppercase mb-0.5">Subject Line</p>
                    <p className="text-xs font-medium text-foreground">{step.email.subject}</p>
                  </div>
                )}

                <pre className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed p-3 rounded-lg bg-muted/20 border border-border/20 font-sans">
                  {channel === "whatsapp" ? step.whatsapp : channel === "email" ? step.email.body : step.push}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Psychology Principles */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Investor Psychology Principles Applied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { title: "Authority Bias", desc: "AI intelligence data positions ASTRA as the expert — investors defer to data-backed recommendations over gut feeling." },
              { title: "Loss Aversion", desc: "Urgency messages emphasize what the investor stands to lose (competing buyers, price firming) rather than what they gain." },
              { title: "Social Proof", desc: "Active investor counts and inquiry volumes validate that smart money is already moving on these opportunities." },
              { title: "Commitment Escalation", desc: "Each step asks for a slightly larger commitment — view → save → unlock → schedule → offer." },
              { title: "Scarcity Framing", desc: "Limited-time pricing and exclusive access create perceived scarcity that accelerates decision-making." },
              { title: "Reciprocity", desc: "Free intelligence insights (market pulse, curated deals) create obligation — investors feel compelled to reciprocate with engagement." },
            ].map((p, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-background/50 border border-border/20">
                <p className="text-xs font-bold text-foreground mb-1">{p.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorNurturingSequence;
