import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Copy, Crown, Shield, Gem, TrendingUp, Lock, Eye, Handshake, Star, Building, Globe, Key, Briefcase, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const anim = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };
function cp(t: string) { navigator.clipboard.writeText(t); toast.success("Copied"); }

const CopyBlock = ({ text, label, tone }: { text: string; label?: string; tone?: string }) => (
  <div className="relative">
    {(label || tone) && (
      <div className="flex items-center gap-2 mb-2">
        {label && <Badge variant="secondary" className="text-[10px]">{label}</Badge>}
        {tone && <Badge variant="outline" className="text-[10px]">{tone}</Badge>}
      </div>
    )}
    <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => cp(text)}>
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

const POSITIONING = [
  {
    angle: "Asset Scarcity Narrative",
    icon: Gem,
    psychology: "Irreplaceable supply creates urgency through logic, not pressure",
    chat: `[Name], I want to share a perspective on [Property] that goes beyond the standard listing data.

What makes this asset genuinely rare:

🏝️ Location constraint — [specific geographic limitation, e.g., "only 12 beachfront parcels remain in this corridor"]. This isn't marketing — it's a physical supply ceiling that can never be expanded.

📐 Build specification — [specific quality indicator, e.g., "Italian marble, German engineering, architect-designed layout"]. Replacement cost today would exceed the asking price by approximately [X]%.

📊 Comparable scarcity — In the last 18 months, only [N] properties of similar caliber have transacted in this micro-market. The next comparable listing may not appear for [X] months.

This is the kind of asset where the question isn't "will it appreciate" — it's "will I have access to something like this again?"

I'd be happy to walk you through the full asset thesis if it aligns with your portfolio strategy.`,
    call: `• "This isn't a property that exists in volume — there are physical constraints on supply."
• "The replacement cost already exceeds asking. That's your built-in margin of safety."
• "In institutional terms, this is a trophy asset in a supply-constrained corridor."
• "The question isn't whether it's a good asset — it's whether you'll see another one like it."`,
  },
  {
    angle: "Strategic Location Thesis",
    icon: Globe,
    psychology: "Frame location as an investment thesis, not just geography",
    chat: `[Name], let me share the location thesis behind [Property] — because this is where the real value creation story lives.

📍 Infrastructure catalysts:
• [Specific project, e.g., "New international airport terminal — completion 2027"]
• [Road/transit development, e.g., "Elevated toll road reducing Jakarta access to 45 min"]
• [Commercial development, e.g., "Rp 2T mixed-use development breaking ground Q3"]

📈 Capital flow trajectory:
• Institutional investors have deployed Rp [X]B into this corridor in the last 12 months
• Land values in adjacent zones have appreciated [Y]% since infrastructure announcements
• Hotel and hospitality RevPAR trending upward — signaling tourism capital confidence

🌏 Macro positioning:
• [Area] is positioning as [strategic narrative, e.g., "Southeast Asia's next luxury wellness destination"]
• Government development priority zone with [tax incentives / zoning advantages]

This isn't speculation — it's pattern recognition. The capital is already moving. The question is whether you position before or after the price adjustment.

Would a detailed location intelligence briefing be useful?`,
    call: `• "I look at property through an infrastructure-led investment lens."
• "The capital flow into this corridor tells you what institutional money already believes."
• "We're in the window between infrastructure commitment and price adjustment."
• "Smart money is positioning now. Retail follows 12-18 months later."`,
  },
  {
    angle: "Capital Appreciation Logic",
    icon: TrendingUp,
    psychology: "Present appreciation as inevitable math, not hopeful projection",
    chat: `[Name], here's the capital appreciation framework for [Property]:

Current entry point: Rp [X]B
AI-estimated fair market value: Rp [Y]B ([Z]% above asking)

📊 Appreciation drivers (ranked by probability):

1. Replacement cost floor — Construction costs in [Area] have increased [A]% YoY. This property cannot be rebuilt at current asking price. Your downside is structurally limited.

2. Supply absorption — Active inventory in this segment: [N] units. Average monthly absorption: [M] units. At current velocity, segment supply exhausts in [T] months.

3. Rental yield support — Projected gross yield: [R]%. This provides holding income while capital appreciation compounds. Your effective cost of ownership is significantly reduced.

4. Infrastructure premium — Based on comparable corridors post-infrastructure completion, we model a [P]% location premium within [years] of project delivery.

Conservative 3-year projection: Rp [Conservative]B
Base case 3-year projection: Rp [Base]B
Optimistic 3-year projection: Rp [Optimistic]B

This is not guaranteed — but the structural drivers are measurable and the downside is well-defined.

Shall I prepare a formal investment memorandum?`,
    call: `• "I don't sell hope — I present structural drivers you can verify independently."
• "The replacement cost alone creates a price floor below your entry point."
• "Rental yield reduces your effective holding cost while appreciation compounds."
• "I can prepare a formal investment memo if you'd like to review the numbers with your advisor."`,
  },
  {
    angle: "Portfolio Diversification Benefit",
    icon: Briefcase,
    psychology: "Position property as strategic allocation, not emotional purchase",
    chat: `[Name], I wanted to frame [Property] within a portfolio context — because I think that's where the real strategic value becomes clear.

🏗️ Asset class positioning:
• Southeast Asian premium real estate has historically shown low correlation with global equity markets
• Physical assets provide inflation hedge that financial instruments cannot replicate
• Rental income creates a yield floor independent of capital market conditions

📊 Diversification metrics:
• If your current portfolio is [equity/crypto/business-heavy], real asset allocation reduces overall portfolio volatility
• Indonesian property market growing at [X]% CAGR — among the strongest in APAC
• Currency play: IDR-denominated asset with USD/SGD rental income potential in tourism zones

💡 Strategic fit:
• This isn't about adding another property — it's about adding a non-correlated, yield-generating, appreciating physical asset to your wealth structure
• Institutional investors typically allocate 15-25% to real assets. Where does your current allocation stand?

I'm happy to discuss how this fits within your broader wealth strategy — not just as a property transaction.`,
    call: `• "I think of this as an allocation decision, not a property purchase."
• "The diversification benefit is actually more valuable than the appreciation alone."
• "Where does real asset exposure sit in your current portfolio?"
• "Institutional allocators target 15-25% in real assets. Most individual investors are underweight."`,
  },
];

const TRUST = [
  {
    element: "Structured Deal Summary",
    icon: Building,
    text: `📋 INVESTMENT OPPORTUNITY BRIEF — CONFIDENTIAL

Asset: [Property Name / Code]
Location: [Precise location with micro-market context]
Asset class: [Villa / Apartment / Land / Commercial]
Configuration: [Bedrooms / Size / Land area]

Financial Summary:
• Asking price: Rp [X]B
• AI fair market value: Rp [Y]B
• Price per sqm: Rp [Z]M (market average: Rp [A]M)
• Projected gross yield: [R]%
• Estimated 3-year appreciation: [P]%

Transaction Structure:
• Escrow-protected deposit: [1-2]% (fully refundable during due diligence)
• Due diligence period: [14-30] days
• Document verification: AI-assisted + legal review
• Closing timeline: [X] days from deposit

Risk Factors:
• [Honest risk 1 — e.g., "Regulatory changes in foreign ownership structure"]
• [Honest risk 2 — e.g., "Construction timeline dependency for neighboring development"]
• Mitigation: [How each risk is addressed]

This summary is provided for evaluation purposes. All figures are estimates based on current market data and AI analysis. Independent verification recommended.`,
  },
  {
    element: "Downside Protection Reassurance",
    icon: Shield,
    text: `[Name], I understand that protecting capital is as important as growing it. Here's how this transaction is structured to limit your downside:

🔐 Escrow protection:
Your deposit sits in a secure escrow account — not with the seller. It's fully refundable during the due diligence window if any red flags emerge.

📄 AI-verified documentation:
Before you commit, our system verifies ownership certificates, tax records, building permits, and encumbrance status. You see the verification report before proceeding.

📊 Price validation:
The AI fair market value assessment uses [X]+ comparable data points. You're entering at [Y]% [below/at] verified fair value — that's your built-in margin of safety.

🏦 Exit liquidity:
Properties in this segment have an average days-on-market of [Z] days. This isn't an illiquid position — it's a premium asset in an active market.

💡 Worst-case scenario:
Even in a market correction, replacement cost floors support approximately Rp [Floor]B valuation. Your maximum theoretical downside from entry is approximately [X]%.

I never minimize risk — I help you understand and price it accurately.`,
  },
  {
    element: "Liquidity Exit Narrative",
    icon: Key,
    text: `[Name], one concern I hear from sophisticated investors is liquidity — and it's a smart question. Here's the exit framework:

Exit Channel 1 — Direct resale
• Average days-on-market for this segment: [X] days
• Buyer demand index: [Y]/100 (strong)
• We provide AI-optimized pricing and investor matching to accelerate exit

Exit Channel 2 — Rental yield hold
• If market timing isn't ideal for exit, the property generates [R]% gross yield
• This means you're earning while waiting for optimal exit conditions
• Effective holding cost approaches zero with rental income

Exit Channel 3 — Platform liquidity (future)
• ASTRA is building fractional secondary trading capability
• This will enable partial position exits without full property sale
• Early investors will have priority access to this liquidity layer

Exit Channel 4 — Portfolio acquisition
• Premium properties in verified corridors attract institutional portfolio buyers
• These buyers acquire at portfolio premium (typically 5-15% above individual sale)

Bottom line: This is a liquid asset in an active market with multiple exit routes. You're not locked in — you're positioned.`,
  },
  {
    element: "Institutional-Grade Language",
    icon: Crown,
    text: `[Name], a few observations from our platform intelligence that I think are relevant to your evaluation:

Market microstructure:
"Bid-side depth in [Area] premium segment has increased 34% quarter-over-quarter, indicating sustained institutional demand formation."

Supply dynamics:
"Absorption rate of [X] units/month against [Y] active listings suggests supply exhaustion within [Z] months at current velocity."

Capital flow:
"Cross-border capital deployment into Indonesian premium real estate has accelerated, with Singapore and Hong Kong-based allocators increasing exposure by [A]% YTD."

Risk-adjusted return:
"On a Sharpe ratio basis, [Area] premium real estate delivers approximately [S] — competitive with Southeast Asian private equity and significantly above regional fixed income."

This is the language our data speaks. I want to make sure you're seeing the same signals the institutional market sees.`,
  },
];

const CLOSING_FLOW = [
  {
    stage: "Discovery — Confirm Motivation",
    icon: Eye,
    questions: [
      `"What's driving your interest in property investment right now — yield, appreciation, diversification, or lifestyle?"`,
      `"Is this primarily a financial allocation or does personal use factor in?"`,
      `"What's your typical decision timeline for an investment of this scale?"`,
      `"Have you invested in Southeast Asian real estate before, or would this be a new allocation?"`,
      `"Who else is involved in your investment decisions — partner, advisor, family office?"`,
    ],
    note: "Listen more than you speak. Their answers tell you exactly how to frame the close.",
  },
  {
    stage: "Value Stacking — Build the Case",
    icon: TrendingUp,
    sequence: [
      { layer: "Foundation", script: `"Let me start with the fundamentals. This asset sits at Rp [X]B against a verified fair value of Rp [Y]B. That [Z]% gap is your entry advantage."` },
      { layer: "Yield", script: `"On top of that entry discount, you're looking at [R]% projected gross yield. That means the asset is working for you from day one."` },
      { layer: "Appreciation", script: `"The infrastructure pipeline — [specific projects] — suggests a [P]% location premium within [timeframe]. This is where the real wealth creation happens."` },
      { layer: "Scarcity", script: `"And here's what makes this genuinely rare: [supply constraint]. You can't create more of this. The inventory is finite and depleting."` },
      { layer: "Protection", script: `"Your downside is structurally limited by replacement cost at Rp [Floor]B. And the entire transaction is escrow-protected with full due diligence transparency."` },
    ],
    note: "Each layer builds on the previous. By the time you reach protection, the value case is overwhelming.",
  },
  {
    stage: "Commitment Invitation",
    icon: Handshake,
    scripts: [
      { context: "Warm close — ready buyer", text: `"Based on everything we've discussed, I believe this aligns well with your objectives. The next step is simply a refundable escrow deposit of Rp [X]M — which secures your position while we complete due diligence. There's no commitment until you've reviewed everything. Shall I prepare the deposit terms?"` },
      { context: "Soft close — considering buyer", text: `"I don't want you to feel any pressure. But I do want to be transparent — there is active interest from other qualified investors. If you'd like to maintain priority positioning, a refundable reservation deposit secures that. You can still walk away after due diligence with full refund. Would that feel comfortable as a next step?"` },
      { context: "Advisory close — analytical buyer", text: `"I'd suggest taking 48 hours to review the investment memorandum I'll prepare for you. If the numbers work for your portfolio, the escrow deposit process is straightforward and fully protected. No rush — but I'd recommend moving before the end of this week given the current interest level. Shall I send the memo?"` },
    ],
    note: "Match your close to their personality. Never use the same approach for every investor.",
  },
  {
    stage: "Escrow Confidence Framing",
    icon: Lock,
    scripts: [
      { context: "First-time escrow", text: `"I understand this may be your first escrow-protected transaction. Let me walk you through exactly how it works:\n\n1. Your deposit goes into a secure holding account — not to the seller\n2. During the due diligence window ([X] days), you review all documentation\n3. Our AI verification system checks ownership, permits, and encumbrances\n4. If anything doesn't check out — full refund, no questions asked\n5. Only after your explicit approval does the transaction proceed\n\nYou're in complete control at every stage. The escrow exists to protect you."` },
      { context: "Experienced investor", text: `"The escrow structure here is institutional-grade: segregated holding account, [X]-day DD window, AI-verified documentation, and explicit buyer approval gate before any funds release. Standard for transactions of this caliber. I'll have the escrow terms ready for your review within 24 hours."` },
    ],
    note: "Escrow framing removes the #1 barrier to commitment — fear of losing money.",
  },
];

const PRESTIGE = [
  { trigger: "Early Investor Positioning", icon: Star, scripts: [
    `"I'm sharing this with a very small group of investors before it goes to our broader network. Your early engagement gives you first-position advantage — both on pricing and terms."`,
    `"Early investors in our platform have historically secured 8-15% better entry points than those who come through public channels. That's the value of being in the conversation early."`,
    `"I see you as a long-term strategic partner, not a one-time buyer. That's why I'm bringing this to you before the general market."`,
  ]},
  { trigger: "Off-Market Pipeline Access", icon: Eye, scripts: [
    `"Beyond this specific opportunity, I want to mention that ASTRA maintains an off-market pipeline of premium assets that never reach public listing. As a qualified investor in our network, you'd have priority access to these opportunities."`,
    `"Some of our best transactions happen before a property is ever publicly listed. The seller prefers discretion, the buyer gets better terms. It's a win-win that only works through trusted networks."`,
    `"I'd like to add you to our Priority Investor Circle — a curated group that receives first-look access to off-market opportunities in your preferred segments and locations."`,
  ]},
  { trigger: "Long-Term Relationship Value", icon: Crown, scripts: [
    `"My goal isn't to close one transaction with you. It's to become your trusted intelligence source for Southeast Asian real estate — someone you call when you're evaluating any opportunity in this market."`,
    `"The investors who do best on our platform aren't the ones who buy the most properties. They're the ones who build a relationship with our intelligence layer and make fewer, better-timed decisions."`,
    `"Whether or not this specific asset is right for you, I'd value maintaining our dialogue. The market is evolving rapidly, and having a trusted perspective is worth more than any single deal."`,
  ]},
];

const HNWClosingStrategist: React.FC = () => (
  <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
    <motion.div variants={anim}>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Crown className="w-6 h-6 text-primary" /> HNW Investor Closing Strategist
      </h2>
      <p className="text-muted-foreground text-sm mt-1">Premium positioning, trust architecture, and sophisticated closing frameworks for high-net-worth investors</p>
    </motion.div>

    <Tabs defaultValue="positioning" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="positioning" className="text-xs">💎 Positioning</TabsTrigger>
        <TabsTrigger value="trust" className="text-xs">🛡️ Trust</TabsTrigger>
        <TabsTrigger value="closing" className="text-xs">🤝 Closing</TabsTrigger>
        <TabsTrigger value="prestige" className="text-xs">👑 Prestige</TabsTrigger>
      </TabsList>

      <TabsContent value="positioning" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {POSITIONING.map((p) => (
            <motion.div key={p.angle} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <p.icon className="w-4 h-4 text-primary" /> {p.angle}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Psychology: {p.psychology}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CopyBlock text={p.chat} label="Chat / Email Script" />
                  <CopyBlock text={p.call} label="Voice Call Points" tone="Phone" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="trust" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {TRUST.map((t) => (
            <motion.div key={t.element} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <t.icon className="w-4 h-4 text-primary" /> {t.element}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyBlock text={t.text} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="closing" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {CLOSING_FLOW.map((c) => (
            <motion.div key={c.stage} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <c.icon className="w-4 h-4 text-primary" /> {c.stage}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {"questions" in c && (
                    <div className="space-y-1.5">
                      {c.questions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                          <div className="flex-1 relative">
                            <p className="text-xs pr-6">{q}</p>
                            <Button size="sm" variant="ghost" className="absolute top-0 right-0 h-5 w-5 p-0" onClick={() => cp(q)}><Copy className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {"sequence" in c && c.sequence.map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg border bg-card">
                      <Badge variant="secondary" className="text-[10px] mb-1.5">Layer {i + 1}: {s.layer}</Badge>
                      <CopyBlock text={s.script} />
                    </div>
                  ))}
                  {"scripts" in c && c.scripts.map((s, i) => (
                    <div key={i}>
                      <Badge variant="outline" className="text-[10px] mb-1.5">{s.context}</Badge>
                      <CopyBlock text={s.text} />
                    </div>
                  ))}
                  {c.note && (
                    <div className="p-2 rounded bg-primary/5 border border-primary/20">
                      <p className="text-[10px] text-primary">💡 {c.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="prestige" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {PRESTIGE.map((p) => (
            <motion.div key={p.trigger} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <p.icon className="w-4 h-4 text-primary" /> {p.trigger}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.scripts.map((s, i) => (
                    <div key={i} className="relative">
                      <pre className="text-xs bg-muted p-2.5 rounded-lg whitespace-pre-wrap font-sans leading-relaxed italic">{s}</pre>
                      <Button size="sm" variant="ghost" className="absolute top-0.5 right-0.5 h-5 w-5 p-0" onClick={() => cp(s)}><Copy className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>
    </Tabs>
  </motion.div>
);

export default HNWClosingStrategist;
