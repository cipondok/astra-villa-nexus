import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Send, Copy, MessageSquare, Target, Users, TrendingUp,
  Zap, Building, Globe, Smartphone, Flame, Shield, Brain,
  ChevronRight, AlertTriangle, DollarSign, MapPin, Clock,
  Star, Rocket, Phone
} from "lucide-react";
import { toast } from "sonner";

const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

function cp(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

const CopyBlock = ({ text, label }: { text: string; label?: string }) => (
  <div className="relative">
    {label && <Badge variant="secondary" className="text-[10px] mb-2">{label}</Badge>}
    <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    <Button size="sm" variant="ghost" className="absolute top-1 right-1" onClick={() => cp(text)}>
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

// ═══════════════════════════════════════════════
// DAILY BROADCAST TEMPLATES (Multi-Channel)
// ═══════════════════════════════════════════════
const BROADCASTS = {
  whatsapp: [
    {
      angle: "Under-Market Opportunity",
      text: `🔥 *INVESTOR ALERT — Below Market Value*

Premium villa in Canggu, Bali — listed at Rp 4.2B
Our AI valuation: Rp 5.1B (17% below market)

📊 Key numbers:
• Rental yield: 11.4% projected
• Occupancy benchmark: 78%
• Appreciation forecast: +14% (12mo)
• Liquidity score: 82/100

Only 3 verified investors have access to this listing.

⏰ This window closes when the seller adjusts pricing.

Reply "INFO" for the full investment brief.
Or schedule a private walkthrough → [link]`,
    },
    {
      angle: "Yield Opportunity",
      text: `💰 *HIGH YIELD ALERT — Verified by AI*

Rental villa portfolio in Seminyak
Current annual yield: 12.8% net
3-year track record with audited financials

Why now:
• Owner relocating — motivated seller
• Below replacement cost
• Fully booked through Q3 2026

🏦 Escrow-secured transaction via ASTRA.

Reply "YIELD" to receive the full package.`,
    },
    {
      angle: "Scarcity + Social Proof",
      text: `📊 *WEEKLY MARKET SIGNAL*

This week on ASTRA:
• 47 investors viewed Bali luxury listings
• 12 submitted inquiries
• 3 deals entered escrow
• Average time to close: 18 days

The fastest investors are already moving.

🔐 New exclusive listing dropping tomorrow.
Reply "EARLY" for priority access.`,
    },
  ],
  telegram: [
    {
      angle: "Market Intelligence Post",
      text: `📡 ASTRA Market Intelligence — Daily Signal

🏝 BALI LUXURY SEGMENT
• Demand velocity: ↑ 23% vs last week
• Active investor inquiries: 34
• Median asking price: Rp 6.8B
• AI confidence: 87/100

🔥 HOT ZONE: Canggu North
• 4 new listings under Rp 5B
• 2 already in negotiation
• Projected appreciation: +16% (12mo)

⚡ Fastest investors get first access.
DM us or visit astra-villa.com

#PropertyInvestment #BaliRealEstate #AIInvesting`,
    },
    {
      angle: "Deal Alert",
      text: `🚨 DEAL DROP — Limited Window

🏠 Type: Ocean-view luxury villa
📍 Location: Uluwatu, Bali
💰 Price: Rp 8.5B (12% below comparable)
📈 Projected yield: 9.7% net
🔒 Escrow-secured via ASTRA platform

Why it matters:
• Seller needs fast close (30-day window)
• Fully furnished + operational
• 4.8★ guest rating (200+ reviews)

First 5 verified investors get the investment brief.
→ Reply or visit astra-villa.com/invest`,
    },
  ],
  linkedin: [
    {
      angle: "Thought Leadership + CTA",
      text: `The biggest mistake property investors make in Southeast Asia:

Buying based on feeling instead of data.

At ASTRA Villa, we built an AI that analyzes 47 data points per property:
→ Demand velocity
→ Price anomaly detection
→ Rental yield benchmarking
→ Liquidity scoring

Result? Our investors see opportunities 3 weeks before the market.

This week's signal: Bali luxury villas showing 23% demand increase with prices still 12% below peak.

The data is telling a clear story. Are you listening?

🔗 Explore AI-verified opportunities → astra-villa.com

#PropTech #RealEstateInvesting #AIInvestment #Bali`,
    },
    {
      angle: "Case Study / Results",
      text: `How one investor found a 17% undervalued villa using AI:

Traditional search: 3 months, 40 viewings, 0 offers
ASTRA AI search: 1 week, 3 shortlisted, 1 deal in escrow

The difference? Data-driven price discovery.

Our AI flagged a Canggu villa listed at Rp 4.2B when comparables were trading at Rp 5.1B.

The investor moved fast. Escrow secured in 48 hours.

This is the future of property investment.

Are you still searching manually?

#PropertyInvestment #PropTech #SmartInvesting`,
    },
  ],
  instagram: [
    {
      angle: "Carousel Hook",
      text: `🏡 5 Signs You're Looking at a Good Property Investment:

1️⃣ Rental yield above 8% net
2️⃣ Below AI-estimated market value
3️⃣ High liquidity score (can exit fast)
4️⃣ Rising demand in the zone
5️⃣ Verified financials, not just promises

We just found 3 properties that tick ALL 5 boxes.

Want access? Comment "INVEST" or DM us.

🔗 Link in bio → astra-villa.com

#PropertyInvestment #BaliVilla #RealEstateIndonesia #InvestSmart #AIRealEstate`,
    },
    {
      angle: "Urgency Reel Caption",
      text: `This villa sold in 72 hours. Here's why 👇

📊 AI score: 91/100
💰 Price: 14% below market
📈 Yield: 11.2% projected
🏖 Location: Canggu, Bali

Smart investors don't wait. They use data.

ASTRA gives you AI-powered property intelligence.
Stop scrolling. Start investing.

DM "ACCESS" for exclusive listings 🔐

#PropertyInvestor #BaliProperty #InvestmentOpportunity #PropTech`,
    },
  ],
};

// ═══════════════════════════════════════════════
// INVESTOR SEGMENT SCRIPTS
// ═══════════════════════════════════════════════
const SEGMENT_SCRIPTS: { segment: string; icon: React.ElementType; scripts: { channel: string; text: string }[] }[] = [
  {
    segment: "Property Investors",
    icon: Building,
    scripts: [
      {
        channel: "WhatsApp",
        text: `Hi [Name], I noticed you're active in the Indonesian property market.

We've built ASTRA — an AI-powered marketplace that identifies undervalued properties before the market catches on.

Right now we're seeing some interesting signals in Bali:
• 3 properties flagged as 12-17% below fair value
• Rental yields averaging 10.8%
• Liquidity score above 80 (easy exit)

Would a 10-min call to walk through the data be useful?

I can share a private investment brief on the top opportunity.`,
      },
      {
        channel: "LinkedIn DM",
        text: `Hi [Name], I saw your background in property investment — impressive portfolio.

Quick question: are you using any data-driven tools to identify undervalued opportunities?

We built an AI that scores every listing on yield, liquidity, and price anomaly. Found some interesting arbitrage in the Bali luxury segment right now.

Happy to share the analysis — no pitch, just data. Worth a look?`,
      },
    ],
  },
  {
    segment: "Crypto Investors",
    icon: Zap,
    scripts: [
      {
        channel: "Telegram DM",
        text: `Hey [Name] 👋

If you believe in asset diversification beyond crypto, real estate in Indonesia might be interesting.

ASTRA uses AI to score properties like you'd evaluate tokens:
• Yield = staking APY (we're seeing 9-12% net)
• Liquidity score = how fast you can exit
• Price anomaly = like finding an undervalued altcoin

We even have fractional investment for smaller positions.

Want me to send the top 3 AI-scored opportunities this week?`,
      },
    ],
  },
  {
    segment: "Entrepreneurs",
    icon: Rocket,
    scripts: [
      {
        channel: "WhatsApp",
        text: `Hey [Name], founder to founder —

I built ASTRA to solve a problem I had: finding quality property investments without spending months on research.

Our AI now does the analysis in seconds — price validation, yield projection, liquidity scoring.

If you're looking to park capital somewhere productive, I'd love to show you what our system is flagging right now in Bali and Jakarta.

15-min walkthrough? I'll share real data, not a pitch deck.`,
      },
    ],
  },
  {
    segment: "Overseas Buyers",
    icon: Globe,
    scripts: [
      {
        channel: "LinkedIn",
        text: `Hi [Name], are you exploring property investment opportunities in Southeast Asia?

Indonesia's property market is growing rapidly — and Bali in particular is seeing strong yield numbers for foreign investors.

ASTRA solves the biggest challenge for overseas buyers:
✅ AI-verified pricing (no overpaying)
✅ Escrow-secured transactions
✅ Full regulatory guidance for foreign ownership
✅ Remote investment capability

We have 3 exclusive listings specifically structured for international investors.

Interested in a brief? I can send it over.`,
      },
    ],
  },
  {
    segment: "Rental Yield Focused",
    icon: DollarSign,
    scripts: [
      {
        channel: "WhatsApp",
        text: `[Name], if passive rental income is your priority, you should see what we're tracking.

ASTRA's AI just flagged 5 properties with verified rental yield above 10% net:

📊 Top signal:
• Location: Seminyak, Bali
• Current yield: 12.4% (audited)
• Occupancy: 81% trailing 12-month
• Price: Below replacement cost

Our escrow system secures your capital. Our AI validates the numbers.

Want the full yield analysis? Reply "YIELD" and I'll send it over.`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════
// FEATURED OPPORTUNITY ANGLES
// ═══════════════════════════════════════════════
const OPPORTUNITY_ANGLES = [
  {
    angle: "Under Market Value",
    icon: TrendingUp,
    desc: "Properties where AI-estimated value exceeds listing price by >10%",
    hook: "\"Our AI found a villa listed 17% below fair market value — the seller hasn't updated pricing to match recent comparable sales.\"",
    urgency: "Price correction expected within 2-3 weeks as market data updates.",
  },
  {
    angle: "High Rental Yield Zone",
    icon: DollarSign,
    desc: "Areas with verified rental yields above 9% net annually",
    hook: "\"This Seminyak villa generates 12.4% net yield with 81% occupancy. That's 3x what a Jakarta apartment delivers.\"",
    urgency: "Tourism season approaching — rental demand spike incoming.",
  },
  {
    angle: "Fast Liquidity District",
    icon: Zap,
    desc: "Locations where average time-to-sale is under 30 days",
    hook: "\"Properties in this Canggu micro-zone sell in 18 days on average. Your capital isn't locked — it's deployed with an exit plan.\"",
    urgency: "Liquidity window strongest during Q1-Q2.",
  },
  {
    angle: "Developer Distress",
    icon: AlertTriangle,
    desc: "Developer projects offering below-cost pricing to accelerate cash flow",
    hook: "\"This developer needs to close 5 units by end of quarter. They're offering 15% below launch price for fast movers.\"",
    urgency: "Limited to remaining inventory — once sold, price resets to market.",
  },
  {
    angle: "Appreciation Corridor",
    icon: MapPin,
    desc: "Emerging areas with infrastructure development driving value growth",
    hook: "\"New bypass road completion in Q3 will cut Canggu-airport time to 25 min. Properties here appreciated 22% after the last infrastructure upgrade.\"",
    urgency: "Pre-completion pricing available — post-completion premiums expected.",
  },
];

// ═══════════════════════════════════════════════
// FOLLOW-UP CONVERSATION FLOWS
// ═══════════════════════════════════════════════
const FOLLOWUP_FLOWS = [
  {
    stage: "First Reply Script",
    icon: MessageSquare,
    context: "When an investor responds with interest",
    script: `Thanks for your interest, [Name]! 🙌

Here's what I'll send you:
1. Investment brief with AI analysis
2. Comparable market data
3. Yield projection (12-month)
4. Escrow process overview

Quick question to personalize: are you looking primarily for rental yield, capital appreciation, or both?

Also — what's your typical investment range? This helps me flag the right opportunities for you.`,
  },
  {
    stage: "Objection: Too Expensive",
    icon: DollarSign,
    context: "Investor says price is too high",
    script: `I hear you on price sensitivity. Let me share some context:

Our AI compared this to 47 similar properties in the area:
• Average comparable: Rp [X]B
• This listing: Rp [Y]B ([Z]% below average)

The price actually represents a discount vs the current market.

That said, we also have opportunities at lower entry points:
• Fractional positions from Rp 100M
• Emerging areas with 30-40% lower pricing
• Developer pre-launch units

Would any of these be a better fit for your budget?`,
  },
  {
    stage: "Objection: Trust / Scam Concern",
    icon: Shield,
    context: "Investor expresses trust hesitation",
    script: `Completely understand — trust is everything in property investment. Here's how ASTRA protects you:

🔒 Escrow Protection: Your funds are locked in a regulated escrow account until ALL conditions are met. No direct transfers to sellers.

✅ AI Verification: Every listing goes through automated + manual quality checks. We flag price anomalies, verify ownership documents, and validate rental claims.

📊 Transparent Data: All our pricing and yield numbers are algorithmically generated — no sales agent inflating numbers.

🏢 Platform Backed: ASTRA is a registered company with [details]. Happy to share our company credentials.

Would a video call to walk through the platform help build confidence?`,
  },
  {
    stage: "Objection: Not the Right Time",
    icon: Clock,
    context: "Investor says timing isn't right",
    script: `I respect that. Timing matters in investment.

But consider this data point: properties in this area appreciated [X]% over the last 6 months. Waiting could mean paying more.

Here's what I'd suggest:
1. Let me add you to our weekly AI market signal — no commitment
2. You'll see real-time data on pricing trends and opportunities
3. When the timing feels right, you'll have the data to move fast

No pressure. Smart investors stay informed even when they're not actively buying.

Can I add you to the signal list?`,
  },
  {
    stage: "Negotiation Positioning",
    icon: Target,
    context: "Moving from interest to deal discussion",
    script: `Great — let's talk specifics on [Property].

Here's the current situation:
• Listed at: Rp [X]B
• AI fair value: Rp [Y]B
• Other interest: [Z] investors have viewed, [N] inquired
• Seller motivation: [context]

My recommendation for your negotiation position:
• Offer range: Rp [A]B — [B]B
• Justification: comparable data + AI analysis
• Leverage: [specific advantage]

If you'd like to proceed, our escrow process works like this:
1. Submit intent → 2. Escrow funded → 3. Due diligence → 4. Close

Shall I prepare a formal investment package?`,
  },
];

const InvestorCampaignEngine: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<keyof typeof BROADCASTS>("whatsapp");

  const channelConfig = [
    { key: "whatsapp" as const, label: "WhatsApp", icon: Phone },
    { key: "telegram" as const, label: "Telegram", icon: Send },
    { key: "linkedin" as const, label: "LinkedIn", icon: Globe },
    { key: "instagram" as const, label: "Instagram", icon: Star },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={anim}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" /> Investor Campaign Engine
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Daily multi-channel outreach campaigns to activate property investor demand
        </p>
      </motion.div>

      <Tabs defaultValue="broadcasts" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="broadcasts">📢 Broadcasts</TabsTrigger>
          <TabsTrigger value="segments">🎯 Segments</TabsTrigger>
          <TabsTrigger value="angles">🔥 Angles</TabsTrigger>
          <TabsTrigger value="followup">🤝 Follow-Up</TabsTrigger>
        </TabsList>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <motion.div variants={anim}>
            <div className="flex gap-2 mb-4">
              {channelConfig.map((ch) => (
                <Button
                  key={ch.key}
                  size="sm"
                  variant={activeChannel === ch.key ? "default" : "outline"}
                  onClick={() => setActiveChannel(ch.key)}
                  className="gap-1.5"
                >
                  <ch.icon className="w-3.5 h-3.5" />
                  {ch.label}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {BROADCASTS[activeChannel].map((b, i) => (
              <motion.div key={`${activeChannel}-${i}`} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        {b.angle}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{activeChannel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CopyBlock text={b.text} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {SEGMENT_SCRIPTS.map((seg) => (
              <motion.div key={seg.segment} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <seg.icon className="w-4 h-4 text-primary" />
                      {seg.segment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {seg.scripts.map((s, i) => (
                      <div key={i}>
                        <CopyBlock text={s.text} label={s.channel} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Angles Tab */}
        <TabsContent value="angles" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {OPPORTUNITY_ANGLES.map((opp) => (
              <motion.div key={opp.angle} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <opp.icon className="w-4 h-4 text-primary" />
                      {opp.angle}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{opp.desc}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-[10px] text-primary font-medium mb-1">Hook Line</p>
                      <p className="text-xs italic">{opp.hook}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-[10px] text-destructive font-medium mb-1">⏰ Urgency Trigger</p>
                      <p className="text-xs">{opp.urgency}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Follow-Up Tab */}
        <TabsContent value="followup" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {FOLLOWUP_FLOWS.map((f) => (
              <motion.div key={f.stage} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <f.icon className="w-4 h-4 text-primary" />
                        {f.stage}
                      </CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.context}</p>
                  </CardHeader>
                  <CardContent>
                    <CopyBlock text={f.script} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default InvestorCampaignEngine;
