import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Mail, Linkedin, Clock, Zap,
  Copy, Check, MapPin, Users, Gift, Target,
  AlertTriangle, Sparkles, ArrowRight, Phone
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type Segment = "luxury-agent" | "rental-agent" | "developer" | "broker";
type Angle = "liquidity" | "investor-demand" | "premium-visibility";
type Incentive = "free-boost" | "early-premium" | "exclusive-leads";

const segmentLabels: Record<Segment, string> = {
  "luxury-agent": "Luxury Agent",
  "rental-agent": "Rental Agent",
  developer: "Developer",
  broker: "Broker",
};

const angleLabels: Record<Angle, string> = {
  liquidity: "Liquidity Advantage",
  "investor-demand": "Investor Demand",
  "premium-visibility": "Premium Visibility",
};

const incentiveLabels: Record<Incentive, string> = {
  "free-boost": "Free Boost Credits",
  "early-premium": "Early Premium Access",
  "exclusive-leads": "Exclusive Lead Priority",
};

interface Script {
  channel: string;
  icon: React.ElementType;
  color: string;
  subject?: string;
  body: string;
  cta: string;
  note: string;
}

function generateScripts(city: string, segment: Segment, angle: Angle, incentive: Incentive): Script[] {
  const seg = segmentLabels[segment];
  const inc = incentiveLabels[incentive];

  const valueHook: Record<Angle, string> = {
    liquidity: `verified investors are actively searching ${city} — and most ${seg.toLowerCase()}s haven't connected with them yet`,
    "investor-demand": `investor demand for ${city} properties is surging 3x above last quarter — agents on the platform are capturing these leads first`,
    "premium-visibility": `top-performing ${seg.toLowerCase()}s in ${city} are getting 5x more qualified views through our AI-powered visibility engine`,
  };

  const incentiveHook: Record<Incentive, string> = {
    "free-boost": "complimentary listing boost credits for your first 5 properties",
    "early-premium": "free premium tier access for 90 days — no commitment",
    "exclusive-leads": "priority lead routing for your first 30 days on the platform",
  };

  return [
    {
      channel: "WhatsApp",
      icon: Phone,
      color: "text-emerald-500",
      body: `Hi {{NAME}} 👋

I noticed your portfolio in ${city} — impressive work in the {{DISTRICT}} area.

Quick question: ${valueHook[angle]}.

We're onboarding select ${seg.toLowerCase()}s this month and offering ${incentiveHook[incentive]}.

Only opening {{SLOTS_LEFT}} slots in ${city}. Interested in a 5-min walkthrough?

— {{YOUR_NAME}}, ASTRA PropTech`,
      cta: "Reply YES for a quick walkthrough →",
      note: "Keep under 400 chars for mobile readability. Send between 10-11am or 2-3pm local time.",
    },
    {
      channel: "Email",
      icon: Mail,
      color: "text-primary",
      subject: `[${city}] {{SLOTS_LEFT}} premium slots left for top ${seg.toLowerCase()}s`,
      body: `Hi {{NAME}},

I've been following your listings in {{DISTRICT}}, ${city} — your {{PROPERTY_TYPE}} portfolio stands out.

I'm reaching out because ${valueHook[angle]}.

ASTRA is a property intelligence marketplace that connects high-intent investors directly with verified agents. We're not another listing portal — we use AI to match investor demand signals with the right properties and the right agents.

What this means for you:
• Qualified investor inquiries routed directly to you
• AI-scored listing visibility based on real demand data
• Performance analytics that help you close faster

We're onboarding a limited group of ${seg.toLowerCase()}s in ${city} this month, and I'd like to offer you ${incentiveHook[incentive]}.

Would you have 10 minutes this week for a quick platform walkthrough?

Best,
{{YOUR_NAME}}
{{YOUR_TITLE}}, ASTRA PropTech
{{YOUR_PHONE}}`,
      cta: "Reply to this email or book a 10-min call: {{BOOKING_LINK}}",
      note: "Send Tue-Thu mornings. Personalize DISTRICT and PROPERTY_TYPE for 3x higher open rates.",
    },
    {
      channel: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-500",
      body: `Hi {{NAME}} — saw your work in ${city}'s {{DISTRICT}} market. Really strong portfolio.

Quick note: ${valueHook[angle]}.

We're selectively onboarding top ${seg.toLowerCase()}s and offering ${incentiveHook[incentive]}. Happy to share a 2-min demo if you're curious.

No pressure — just thought it'd be relevant given your market focus. 🏗️`,
      cta: "Open to a quick look? I can send a 2-min video walkthrough.",
      note: "Connect first, then message within 24 hours. Keep under 300 words.",
    },
    {
      channel: "Follow-Up",
      icon: Clock,
      color: "text-amber-400",
      body: `Hi {{NAME}} — following up on my note last week about ASTRA.

Since then, {{NEW_AGENTS_COUNT}} more ${seg.toLowerCase()}s in ${city} have joined, and we've routed {{LEADS_COUNT}} qualified investor inquiries this month alone.

Your ${incentiveHook[incentive]} offer is still reserved — but we're closing onboarding slots in {{DAYS_LEFT}} days.

Worth a quick 5-min look?

— {{YOUR_NAME}}`,
      cta: "Reply 'YES' and I'll send the setup link right now.",
      note: "Send 3-5 days after initial outreach. Add a real metric (agent count or lead volume) for credibility.",
    },
    {
      channel: "Urgency Close",
      icon: Zap,
      color: "text-destructive",
      body: `Hi {{NAME}} — final note on this.

We're closing ${city} onboarding this {{DAY}} at midnight. After that, new agents join the waitlist.

Current stats:
• {{ACTIVE_AGENTS}} active agents in ${city}
• {{MONTHLY_INQUIRIES}} investor inquiries this month
• {{AVG_RESPONSE}} avg response time to close

Your reserved ${incentiveHook[incentive]} expires with the deadline.

This isn't a hard sell — it's math. The agents already on the platform are capturing the demand. The question is whether you want to be one of them.

— {{YOUR_NAME}}`,
      cta: "Last chance — reply or click: {{SIGNUP_LINK}}",
      note: "Use ONLY after 2+ prior touches. Real scarcity works — don't fake slot numbers.",
    },
  ];
}

const VendorOutreachScripts = () => {
  const { toast } = useToast();
  const [city, setCity] = useState("Jakarta");
  const [segment, setSegment] = useState<Segment>("luxury-agent");
  const [angle, setAngle] = useState<Angle>("investor-demand");
  const [incentive, setIncentive] = useState<Incentive>("free-boost");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const scripts = generateScripts(city, segment, angle, incentive);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Vendor Outreach Scripts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ready-to-send cold outreach across WhatsApp, Email, LinkedIn — with follow-ups and urgency closers
        </p>
      </div>

      {/* Config Bar */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" />City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Jakarta", "Bandung", "Surabaya", "Bali", "Medan", "Yogyakarta"].map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Users className="h-3 w-3" />Segment</label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(segmentLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" />Angle</label>
              <Select value={angle} onValueChange={(v) => setAngle(v as Angle)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(angleLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Gift className="h-3 w-3" />Incentive</label>
              <Select value={incentive} onValueChange={(v) => setIncentive(v as Incentive)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(incentiveLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts */}
      <div className="space-y-4">
        {scripts.map((s, i) => (
          <motion.div key={`${s.channel}-${segment}-${angle}-${incentive}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/70">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    {s.channel}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => handleCopy(s.body, i)}
                  >
                    {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedIdx === i ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.subject && (
                  <div className="p-2 rounded-md bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Subject Line</p>
                    <p className="text-xs font-medium text-foreground">{s.subject}</p>
                  </div>
                )}
                <pre className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed p-3 rounded-lg bg-muted/20 border border-border/20 font-sans">
                  {s.body}
                </pre>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary uppercase mb-0.5 flex items-center gap-1"><ArrowRight className="h-3 w-3" />CTA</p>
                    <p className="text-xs text-foreground">{s.cta}</p>
                  </div>
                  <div className="p-2 rounded-md bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] text-amber-400 uppercase mb-0.5 flex items-center gap-1"><Sparkles className="h-3 w-3" />Pro Tip</p>
                    <p className="text-xs text-muted-foreground">{s.note}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Personalization Reference */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Personalization Placeholders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              ["{{NAME}}", "Agent's first name"],
              ["{{DISTRICT}}", "Their active area"],
              ["{{PROPERTY_TYPE}}", "Their listing type"],
              ["{{SLOTS_LEFT}}", "Remaining slots"],
              ["{{YOUR_NAME}}", "Your name"],
              ["{{YOUR_TITLE}}", "Your role"],
              ["{{YOUR_PHONE}}", "Your phone"],
              ["{{BOOKING_LINK}}", "Calendly / cal link"],
              ["{{SIGNUP_LINK}}", "Onboarding URL"],
              ["{{NEW_AGENTS_COUNT}}", "Recent signups"],
              ["{{LEADS_COUNT}}", "Monthly inquiries"],
              ["{{DAYS_LEFT}}", "Deadline days"],
            ].map(([placeholder, desc]) => (
              <div key={placeholder} className="p-2 rounded-md bg-background/50 border border-border/20">
                <code className="text-[10px] font-mono text-primary">{placeholder}</code>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOutreachScripts;
