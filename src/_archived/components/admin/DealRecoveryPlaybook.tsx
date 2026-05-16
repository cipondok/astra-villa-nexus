import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Copy, MessageSquare, Phone, Clock, Shield, Flame, Users, TrendingUp, Heart, AlertTriangle, Zap, Target } from "lucide-react";
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

const REENGAGEMENT = [
  {
    tone: "Soft Reactivation",
    icon: Heart,
    psychology: "Low pressure — reopen without triggering resistance",
    chat: `Hi [Name], hope you're doing well 🙂

I was reviewing some market updates and your conversation about [Property] came back to mind.

No pressure at all — just wanted to share that the property is still available, and I noticed some interesting movement in that area recently.

If you're still exploring options, happy to share the latest data. If timing has changed, totally understand — I'll keep an eye out for opportunities that match your criteria.

Either way, wishing you well!`,
    call: `• "Hey [Name], just a quick check-in — no agenda."
• "I saw some interesting data on that area and thought of you."
• "Has anything changed in your timeline or priorities?"
• "Happy to just keep you informed passively if you prefer."`,
  },
  {
    tone: "Urgency Opportunity",
    icon: Flame,
    psychology: "Create time-bound opportunity perception without aggression",
    chat: `Hi [Name], quick heads up on [Property]:

I just got word that the owner is reviewing all current interest this Friday and may adjust their strategy next week.

What this means for you:
• Current asking price is still Rp [X]B
• After review, price could go UP if they see strong demand signals
• Or they may take it off-market temporarily

If you're still interested, this week is probably the best window to revisit the conversation — even just to explore terms.

Want me to check if there's any flexibility on their side before Friday?`,
    call: `• "The seller is doing a portfolio review this week."
• "I wanted to give you a heads up before any changes."
• "This isn't pressure — it's just timing information."
• "Would it make sense to at least explore terms while the window is open?"`,
  },
  {
    tone: "Competitive Buyer Framing",
    icon: Users,
    psychology: "Social proof + scarcity — activate fear of missing out",
    chat: `Hi [Name], transparency update on [Property]:

Since we last spoke, we've had [2-3] new investor inquiries on this listing. One has already scheduled a second viewing.

I'm not trying to create artificial pressure — I just want to make sure you have the information to make the right decision for yourself.

If this is still on your radar, I'd suggest we at least position your interest formally so you're in the conversation if offers start coming in.

No commitment required — just a signal of interest keeps your seat at the table.

What do you think?`,
    call: `• "I want to be upfront — there's new activity on this property."
• "I'm not using this to pressure you. I'd feel bad if you missed out because I didn't tell you."
• "Even a soft expression of interest protects your position."
• "Can I register your continued interest with the seller?"`,
  },
  {
    tone: "Market Movement Framing",
    icon: TrendingUp,
    psychology: "External data validates the opportunity — rational urgency",
    chat: `Hi [Name], I came across some data I thought you'd find interesting:

📊 Recent market signals for [Area]:
• Comparable property just closed at Rp [X]B (+[Y]% above [Property] asking)
• Investor inquiry volume up [Z]% month-over-month
• Average days-on-market dropping: [N] days → [M] days
• Rental yield in this zone: [A]% (above city average)

[Property] at Rp [B]B is currently sitting below the recent comp benchmark.

I'm not saying rush into anything — but the numbers suggest the value gap may not last long.

Worth a 10-minute call to reassess? I can walk you through the full comparative analysis.`,
    call: `• "I pulled the latest comparable data and wanted to share it."
• "A similar property just closed above the asking price of yours."
• "The market in that area is tightening — objectively, not as a pitch."
• "Would a quick data walkthrough be useful for your decision?"`,
  },
];

const HOOKS = [
  { hook: "Price Flexibility Signal", icon: Target, text: `"I had an off-the-record conversation with the seller's side. Without making promises — I believe there may be more flexibility than the listed price suggests. If you came in with a serious offer in the Rp [X-Y]B range, I think we'd get a real conversation going."` },
  { hook: "Recent Comparable Deal", icon: TrendingUp, text: `"Just so you know — a [similar type] in [nearby area] closed last week at Rp [X]B. That's [Y]% [above/below] the asking on [Property]. This gives you a strong reference point for your offer."` },
  { hook: "Limited Negotiation Window", icon: Clock, text: `"The seller mentioned they're evaluating whether to relist with a different strategy next month. If you want to negotiate at the current terms, the next [7-10] days are probably the window."` },
  { hook: "Hidden Upside Reminder", icon: Zap, text: `"One thing we didn't fully explore last time — the rental yield potential here is actually quite strong. Based on comparable rentals, you're looking at [X]% gross yield, which means the property essentially pays for itself within [Y] years while appreciating."` },
  { hook: "Exclusivity Positioning", icon: Shield, text: `"I haven't shared this with other investors yet, but the owner indicated they'd consider a quick-close discount of [X]% for a buyer who can commit within [2 weeks]. I thought of you first because of your earlier interest."` },
];

const SEQUENCE = [
  {
    step: "Message 1 — Warm Recovery",
    timing: "Day 1 (after 3-7 days of silence)",
    goal: "Reopen dialogue without pressure",
    text: `Hi [Name], been a few days — hope things are going well on your end.

I was looking at the latest activity around [Property/Area] and a couple of things caught my eye that I thought might be relevant to your search.

No rush — but if you have 5 minutes this week, I'd love to share a quick update. Even if the timing isn't right now, the information might be useful for future decisions.

When works best for a quick chat?`,
  },
  {
    step: "Message 2 — Urgency Escalation",
    timing: "Day 4-5 (if no response to Message 1)",
    goal: "Introduce time pressure + competitive signals",
    text: `Hi [Name], quick follow-up with a timing update:

Two things happened since my last message:
1. A new investor inquiry came in on [Property] — they're evaluating this week
2. I got a signal that the seller may be open to a [X]% adjustment for a quick commitment

I know your schedule is busy, but I'd hate for you to lose positioning on something you were genuinely interested in.

Even a 2-minute reply telling me "still interested" or "moved on" helps me serve you better.

Either way, I respect your decision 🙏`,
  },
  {
    step: "Message 3 — Final Decision Trigger",
    timing: "Day 8-10 (final attempt)",
    goal: "Create closing moment — respectful but definitive",
    text: `Hi [Name], last note on [Property] from my side:

The situation:
• Active competing interest is progressing toward offer stage
• Seller has indicated they'll likely accept the first strong offer this month
• After that, I won't be able to hold any informal positioning for you

I completely understand if priorities have shifted — that's totally normal in property investment.

But if there's even a small chance you want to explore this further, now is genuinely the moment. A 5-minute call could clarify everything.

If I don't hear back, I'll assume the timing isn't right and I'll quietly keep watching for other opportunities that match your criteria.

No hard feelings either way. Talk soon? 🤝`,
  },
];

const PSYCHOLOGY = [
  { trigger: "Loss Aversion", icon: AlertTriangle, desc: "Frame what they'll lose, not what they'll gain", examples: [
    `"If this closes at the current trajectory, the next comparable will likely be 8-12% higher."`,
    `"The negotiation flexibility that exists today won't exist once a formal offer is on the table."`,
    `"I'd rather you decide it's not for you than miss it because of timing."`,
  ]},
  { trigger: "Exclusivity Positioning", icon: Shield, desc: "Make them feel they have privileged access", examples: [
    `"I'm sharing this with you before our broader investor list because of your earlier engagement."`,
    `"The seller specifically asked if you were still interested — that's unusual and tells me there's room to negotiate."`,
    `"This pre-market window is only available to investors we've already been in conversation with."`,
  ]},
  { trigger: "Timing Without Aggression", icon: Clock, desc: "Create urgency through context, not pressure", examples: [
    `"I'm not creating a deadline — but the market is. Here's what I'm seeing..."`,
    `"Take whatever time you need. I just want to make sure you have the full picture while the window exists."`,
    `"The best deals I've seen close not because of pressure, but because the buyer recognized the timing."`,
  ]},
  { trigger: "Confidence Reinforcement", icon: Heart, desc: "Validate their judgment and reduce decision anxiety", examples: [
    `"Your instinct on this area was right — the data confirms it's one of the strongest zones right now."`,
    `"The questions you asked during our last conversation showed real investment intelligence. This is a well-considered move."`,
    `"Whether you proceed or not, your analysis of this opportunity was spot-on. That matters more than any single deal."`,
  ]},
];

const DealRecoveryPlaybook: React.FC = () => (
  <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
    <motion.div variants={anim}>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary" /> Deal Recovery Playbook
      </h2>
      <p className="text-muted-foreground text-sm mt-1">Re-activate stalled investor conversations with psychological precision</p>
    </motion.div>

    <Tabs defaultValue="tones" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="tones" className="text-xs">💬 Tones</TabsTrigger>
        <TabsTrigger value="hooks" className="text-xs">🪝 Hooks</TabsTrigger>
        <TabsTrigger value="sequence" className="text-xs">📅 Sequence</TabsTrigger>
        <TabsTrigger value="psychology" className="text-xs">🧠 Psychology</TabsTrigger>
      </TabsList>

      <TabsContent value="tones" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {REENGAGEMENT.map((r) => (
            <motion.div key={r.tone} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <r.icon className="w-4 h-4 text-primary" /> {r.tone}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Psychology: {r.psychology}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CopyBlock text={r.chat} label="Chat Message" />
                  <CopyBlock text={r.call} label="Call Talking Points" tone="Phone Script" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="hooks" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {HOOKS.map((h) => (
            <motion.div key={h.hook} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <h.icon className="w-4 h-4 text-primary" /> {h.hook}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyBlock text={h.text} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="sequence" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {SEQUENCE.map((s, i) => (
            <motion.div key={i} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{s.step}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{s.timing}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Goal: {s.goal}</p>
                </CardHeader>
                <CardContent>
                  <CopyBlock text={s.text} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="psychology" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {PSYCHOLOGY.map((p) => (
            <motion.div key={p.trigger} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <p.icon className="w-4 h-4 text-primary" /> {p.trigger}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.examples.map((ex, i) => (
                    <div key={i} className="relative">
                      <pre className="text-xs bg-muted p-2.5 rounded-lg whitespace-pre-wrap font-sans leading-relaxed italic">{ex}</pre>
                      <Button size="sm" variant="ghost" className="absolute top-0.5 right-0.5 h-5 w-5 p-0" onClick={() => cp(ex)}>
                        <Copy className="w-3 h-3" />
                      </Button>
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

export default DealRecoveryPlaybook;
