import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy, Check, MessageSquare, Phone, Mic, User, ShieldCheck,
  HelpCircle, Gem, AlertTriangle, Target, Zap, Brain,
  TrendingUp, Heart, Search, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type BuyerType = "investor" | "lifestyle" | "hesitant";
type Budget = "under-1b" | "1b-3b" | "3b-10b" | "above-10b";
type Urgency = "high" | "medium" | "low";
type PropType = "villa" | "apartment" | "land" | "commercial";

const buyerLabels: Record<BuyerType, { label: string; icon: React.ElementType; color: string }> = {
  investor: { label: "Logical Investor", icon: TrendingUp, color: "text-emerald-500" },
  lifestyle: { label: "Emotional Lifestyle Buyer", icon: Heart, color: "text-pink-500" },
  hesitant: { label: "Hesitant Comparison Shopper", icon: Search, color: "text-amber-400" },
};

interface DialogueLine { speaker: "agent" | "buyer"; text: string; note?: string }

function genDialogue(buyer: BuyerType, budget: Budget, urgency: Urgency, propType: PropType): DialogueLine[] {
  const budgetLabel = { "under-1b": "under IDR 1B", "1b-3b": "IDR 1–3B", "3b-10b": "IDR 3–10B", "above-10b": "above IDR 10B" }[budget];
  const prop = propType === "villa" ? "villa" : propType === "apartment" ? "apartment" : propType === "land" ? "land parcel" : "commercial unit";

  if (buyer === "investor") return [
    { speaker: "agent", text: `Hi {{NAME}}, thank you for your inquiry. I see you've been looking at our ${prop} listings in the ${budgetLabel} range — great eye for value. Can I ask what's driving your interest right now?`, note: "Open with validation + qualify intent" },
    { speaker: "buyer", text: `I'm looking at yield potential. I want something that can generate strong rental income, ideally 8%+ net yield.` },
    { speaker: "agent", text: `That's exactly the kind of analytical approach our top-performing investors take. Let me share something — we track liquidity scores and projected yields across every listing on our platform. The ${prop} you viewed actually ranks in the top 12% for rental demand density in that area.`, note: "Data-driven credibility" },
    { speaker: "buyer", text: `Interesting. What's the actual occupancy data like?` },
    { speaker: "agent", text: `For that corridor, comparable properties are averaging 78% occupancy with ADR around IDR 2.8M. At that rate, the projected net yield is 9.2% — above your target. I can send you our full intelligence report on that micro-market.`, note: "Specificity builds trust" },
    { speaker: "buyer", text: `The price feels high compared to similar listings I've seen.` },
    { speaker: "agent", text: `I hear you. Let me reframe that — the listings you're comparing likely don't have the same demand density score. This ${prop} sits in a zone where investor demand has grown 34% in 6 months. Properties here don't stay available long. The question isn't whether this is the cheapest option — it's whether it's the highest-returning option. And the data says yes.`, note: "Redirect price → ROI framing" },
    { speaker: "agent", text: `Here's what I'd suggest: let's schedule a 30-minute private viewing this week. I'll walk you through the actual revenue model on-site and show you the comparable transaction data. What works better — Thursday or Saturday morning?`, note: "Binary close — don't ask IF, ask WHEN" },
    { speaker: "buyer", text: `Saturday could work.` },
    { speaker: "agent", text: `Perfect. I'll block 10AM Saturday and send you the location pin plus the market intelligence brief beforehand so you can review the numbers. This is the kind of opportunity that rewards decisive investors — and I think you'll see that on-site. See you Saturday.`, note: "Confirm + reinforce urgency subtly" },
  ];

  if (buyer === "lifestyle") return [
    { speaker: "agent", text: `Hi {{NAME}}, lovely to connect! I noticed you saved our ${prop} listing — it's honestly one of my personal favourites. What caught your eye about it?`, note: "Warm opening — invite emotional sharing" },
    { speaker: "buyer", text: `The photos are beautiful. I love the outdoor space and the pool area. We've been dreaming about a place like this for our family.` },
    { speaker: "agent", text: `I completely understand that feeling. A lot of our buyers describe the same thing — they're not just buying property, they're buying a lifestyle shift. Can I ask — is this for weekends and holidays, or are you thinking of a full relocation?`, note: "Validate emotion + qualify deeper" },
    { speaker: "buyer", text: `Mostly holidays for now, but eventually we'd love to live there full-time with the kids.` },
    { speaker: "agent", text: `That's the dream scenario. And the beautiful thing about this ${prop} is the community around it — there's an international school 12 minutes away, great cafes, and the beach is a 5-minute walk. Your kids would grow up in paradise.`, note: "Paint the lifestyle vision" },
    { speaker: "buyer", text: `It's a big decision though. My partner hasn't seen it yet.` },
    { speaker: "agent", text: `Absolutely — this should be a decision you both feel amazing about. That's exactly why I'd love to arrange a private viewing for both of you. We can do a relaxed morning visit — I'll arrange coffee on the terrace so you can both feel the space. It's one thing to see photos, but standing in that garden with the breeze… it changes everything.`, note: "Include partner, make viewing experiential" },
    { speaker: "agent", text: `I should mention — we've had 6 inquiries on this property this month and one viewing already scheduled for next week. I'd love to make sure you both experience it before things progress. Would this weekend work?`, note: "Gentle scarcity — factual not pushy" },
    { speaker: "buyer", text: `Let me check with my partner and get back to you.` },
    { speaker: "agent", text: `Of course! I'll send you a short video walkthrough right now so you can share it with them tonight. And I'll tentatively hold Sunday morning for you — just let me know by tomorrow evening. I genuinely think this could be your family's next chapter. 💛`, note: "Give them a tool to sell internally" },
  ];

  // hesitant
  return [
    { speaker: "agent", text: `Hi {{NAME}}, thanks for reaching out about the ${prop} listings. I know there's a lot to compare out there — happy to help you navigate. What's most important to you in this decision?`, note: "Acknowledge overwhelm — position as guide" },
    { speaker: "buyer", text: `I've been looking at a few platforms and properties. Honestly not sure what's a fair price or which area is best.` },
    { speaker: "agent", text: `That's totally normal — and actually smart. Most people rush in without doing proper research. The fact that you're comparing shows good instinct. Can I share something that might help cut through the noise?`, note: "Validate caution as intelligence" },
    { speaker: "buyer", text: `Sure, go ahead.` },
    { speaker: "agent", text: `We built an AI-powered market intelligence system that scores every listing on liquidity, demand density, and fair-value pricing. So instead of guessing, you can see actual data on which properties are priced right and which are inflated. For the ${budgetLabel} range you're looking at, I can pull up the top 5 highest-scoring options right now.`, note: "Position platform as their decision tool" },
    { speaker: "buyer", text: `That sounds useful. But I'm not ready to commit to anything yet.` },
    { speaker: "agent", text: `No pressure at all. Think of this as a research session, not a sales pitch. Here's what I'd suggest — let's do a quick 20-minute call where I walk you through the market data for your target area. No obligation, no hard sell. If the data makes sense, we can arrange a casual viewing. If not, you'll at least walk away with real market intelligence. Fair?`, note: "Remove commitment pressure — offer value" },
    { speaker: "buyer", text: `Okay, a call could work.` },
    { speaker: "agent", text: `Great. I'll send you a calendar link — pick whatever time works. And before the call, I'll prepare a custom market comparison so we're not wasting your time with generic info. You'll have more clarity in 20 minutes than most buyers get in 2 months of searching. Talk soon!`, note: "Promise specific value — make next step effortless" },
  ];
}

function genCallScript(buyer: BuyerType, propType: PropType): string[] {
  const prop = propType;
  if (buyer === "investor") return [
    `[OPENING — 15 sec] "Hi {{NAME}}, this is {{AGENT}} from ASTRA. Thanks for your inquiry on the ${prop} listing. I've pulled up the market intelligence for that property — mind if I share a couple of data points that I think will interest you?"`,
    `[QUALIFY — 30 sec] "Before I dive in — are you primarily looking for rental yield, capital appreciation, or a combination? And is this for your personal portfolio or are you deploying on behalf of a fund?"`,
    `[VALUE — 45 sec] "So this property scores in the top [X]% for liquidity in its corridor. Comparable transactions show [X]% yield with [X]% occupancy. What makes this interesting is the demand growth — investor inquiries in this area are up [X]% quarter-over-quarter."`,
    `[OBJECTION HANDLING] If price concern: "I understand. Let me reframe — the per-sqm cost is actually [X]% below the corridor average when you factor in the build quality and rental infrastructure. The ROI math is what matters here."`,
    `[CLOSE — 15 sec] "I'd love to walk you through the full revenue model on-site. I have Thursday 2PM or Saturday 10AM open. Which works better for you?"`,
  ];
  if (buyer === "lifestyle") return [
    `[OPENING — warm] "Hi {{NAME}}! This is {{AGENT}} from ASTRA. I saw you loved the ${prop} listing — I have to say, it's one of the most beautiful properties we have. Have you had a chance to show the photos to your family?"`,
    `[EMOTIONAL QUALIFY] "Tell me — when you imagine your ideal property, what does a perfect morning look like there? I want to make sure we're looking at places that truly match your vision."`,
    `[PAINT THE PICTURE] "What I love about this ${prop} is [specific lifestyle detail]. Imagine your weekends here — [vivid scenario]. That's the kind of life this place was designed for."`,
    `[HANDLE HESITATION] If "need to think": "Absolutely. Big decisions deserve reflection. But here's what I've learned — sometimes you need to feel the space to know. A 30-minute visit often answers questions that weeks of thinking can't."`,
    `[CLOSE] "Let's arrange a private morning viewing — I'll have coffee ready, and you can just experience the space with no pressure. How about this Saturday?"`,
  ];
  return [
    `[OPENING — consultative] "Hi {{NAME}}, this is {{AGENT}} from ASTRA. I noticed you've been researching ${prop} properties — I work with a lot of buyers in the comparison phase and I'd love to help you make sense of the market."`,
    `[BUILD TRUST] "I'm not going to pitch you anything. What I can offer is market data that most platforms don't show — actual liquidity scores, fair-value estimates, and demand trends. Would that be helpful?"`,
    `[ADD VALUE] "Based on your criteria, I've identified [X] properties that score highest for value-for-money in your range. Want me to walk you through the top 3 and explain why the data favours them?"`,
    `[HANDLE DELAY] If "not ready": "Totally fine. Here's what I'll do — I'll send you a custom market brief for your target area. Review it at your own pace. When you're ready, I'm here. No expiry, no pressure."`,
    `[SOFT CLOSE] "If any of those properties catch your eye, I can arrange a no-obligation viewing anytime. Just text me. Deal?"`,
  ];
}

function genVoiceNote(buyer: BuyerType): string {
  if (buyer === "investor") return `"Hey {{NAME}}, quick voice note — I just pulled the latest yield data on that property you inquired about and honestly, the numbers are stronger than I expected. Net yield projection is coming in at 9.2% with occupancy trending up. I've only got two viewing slots left this week — Saturday 10AM is still open. Want me to lock it in? Just reply 'yes' and I'll send the details. Talk soon."`;
  if (buyer === "lifestyle") return `"Hi {{NAME}}! Just wanted to send you a quick note because I drove past that property today and it looks even more beautiful in person than the photos. The garden is incredible right now. I'd love for you and your family to experience it — I can set up a private morning visit, super relaxed, coffee included. Let me know if this weekend works. I think you'll fall in love. 😊"`;
  return `"Hey {{NAME}}, this is {{AGENT}} from ASTRA. I put together a custom market comparison for the areas you've been looking at — it shows which properties are fairly priced and which ones are overvalued. No sales pitch, just data. I'll send it over now, and if anything stands out, we can hop on a quick call. No pressure at all. Talk soon!"`;
}

const psychTips = [
  { label: "Tone Pacing", icon: Mic, items: ["Start slow and warm — match the buyer's energy before leading", "Pause 2 seconds after key value statements to let them land", "Lower your voice slightly when stating numbers — it signals confidence", "Speed up slightly when describing vision/lifestyle — builds excitement"] },
  { label: "Confidence Language", icon: ShieldCheck, items: ["Replace 'I think' with 'The data shows'", "Use 'When you visit' not 'If you visit' — presupposes action", "Say 'investors like you' — identity reinforcement", "Avoid hedging words: 'maybe', 'sort of', 'kind of'"] },
  { label: "Price Objection Redirects", icon: AlertTriangle, items: ["'The question isn't whether it's cheap — it's whether it returns more than alternatives.'", "'Compared to what? Let me show you the per-sqm value analysis.'", "'Price is what you pay. Value is what you get. Let me show you the value equation.'", "'I understand. But the market data shows this corridor appreciates 12% annually — in 3 years, today's price looks like a bargain.'"] },
  { label: "Commitment Triggers", icon: Brain, items: ["Scarcity: 'We've had X inquiries this week' (only if factual)", "Social proof: 'Our top investor clients are focused on this area'", "Loss aversion: 'Properties in this score range typically sell within 3 weeks'", "Reciprocity: Share valuable data first — they feel obligated to engage", "Binary close: 'Thursday or Saturday?' — never 'Would you like to schedule?'"] },
];

const ClosingConversationSimulator = () => {
  const { toast } = useToast();
  const [buyer, setBuyer] = useState<BuyerType>("investor");
  const [budget, setBudget] = useState<Budget>("3b-10b");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [propType, setPropType] = useState<PropType>("villa");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dialogue = genDialogue(buyer, budget, urgency, propType);
  const callScript = genCallScript(buyer, propType);
  const voiceNote = genVoiceNote(buyer);
  const bInfo = buyerLabels[buyer];

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text.replace(/\{\{NAME\}\}/g, "[Name]").replace(/\{\{AGENT\}\}/g, "[Agent]"));
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Closing Conversation Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Dialogue scripts, call frameworks & voice-note templates for converting inquiries into viewings
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><User className="h-3 w-3" />Buyer Persona</label>
              <Select value={buyer} onValueChange={v => setBuyer(v as BuyerType)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(buyerLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Gem className="h-3 w-3" />Budget</label>
              <Select value={budget} onValueChange={v => setBudget(v as Budget)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-1b" className="text-xs">Under IDR 1B</SelectItem>
                  <SelectItem value="1b-3b" className="text-xs">IDR 1–3B</SelectItem>
                  <SelectItem value="3b-10b" className="text-xs">IDR 3–10B</SelectItem>
                  <SelectItem value="above-10b" className="text-xs">Above IDR 10B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Zap className="h-3 w-3" />Urgency</label>
              <Select value={urgency} onValueChange={v => setUrgency(v as Urgency)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-xs">High — Active Buyer</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium — Exploring</SelectItem>
                  <SelectItem value="low" className="text-xs">Low — Passive Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" />Property Type</label>
              <Select value={propType} onValueChange={v => setPropType(v as PropType)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa" className="text-xs">Villa</SelectItem>
                  <SelectItem value="apartment" className="text-xs">Apartment</SelectItem>
                  <SelectItem value="land" className="text-xs">Land</SelectItem>
                  <SelectItem value="commercial" className="text-xs">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Badge */}
      <div className="flex items-center gap-2">
        <bInfo.icon className={`h-5 w-5 ${bInfo.color}`} />
        <span className="font-semibold text-foreground">{bInfo.label}</span>
        <Badge variant="outline" className="text-[10px]">Scenario Active</Badge>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="whatsapp" className="text-xs gap-1.5"><MessageSquare className="h-3 w-3" />WhatsApp Flow</TabsTrigger>
          <TabsTrigger value="call" className="text-xs gap-1.5"><Phone className="h-3 w-3" />Call Script</TabsTrigger>
          <TabsTrigger value="voice" className="text-xs gap-1.5"><Mic className="h-3 w-3" />Voice Note</TabsTrigger>
        </TabsList>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                WhatsApp Conversational Flow — {bInfo.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {dialogue.map((line, i) => (
                <motion.div key={`${buyer}-${i}`} initial={{ opacity: 0, x: line.speaker === "agent" ? -8 : 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex ${line.speaker === "buyer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 group relative ${line.speaker === "agent" ? "bg-primary/10 border border-primary/20 rounded-bl-md" : "bg-muted/40 border border-border/30 rounded-br-md"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0">{line.speaker === "agent" ? "AGENT" : "BUYER"}</Badge>
                      {line.note && <span className="text-[9px] text-muted-foreground italic">— {line.note}</span>}
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{line.text}</p>
                    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copy(line.text, `wa-${i}`)}>
                      {copiedKey === `wa-${i}` ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Call Script */}
        <TabsContent value="call">
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Professional Call Script — {bInfo.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {callScript.map((step, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/20 group">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-xs text-foreground leading-relaxed flex-1">{step}</p>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copy(step, `call-${i}`)}>
                    {copiedKey === `call-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Note */}
        <TabsContent value="voice">
          <Card className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-400" />
                  Voice Note Script — {bInfo.label}
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => copy(voiceNote, "voice")}>
                  {copiedKey === "voice" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === "voice" ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                <p className="text-xs text-foreground leading-relaxed italic">{voiceNote}</p>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 font-medium mb-1">🎙️ Delivery Tips</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  <li>• Keep under 45 seconds — respect their time</li>
                  <li>• Smile while recording — it changes your vocal tone</li>
                  <li>• Pause briefly before the call-to-action</li>
                  <li>• End with energy — your last sentence is what they remember</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Psychology Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {psychTips.map((section, si) => (
          <Card key={si} className="border-border/40 bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <section.icon className="h-4 w-4 text-primary" />
                {section.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClosingConversationSimulator;
