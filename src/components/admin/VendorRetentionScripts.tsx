import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Phone, Mail, Bell, Copy, Check, Clock,
  TrendingUp, AlertTriangle, Crown, Zap, Heart,
  Target, ArrowRight, Sparkles, Shield, BarChart3,
  ThumbsUp, RefreshCw, Star
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type PerfLevel = "high" | "medium" | "low";
type Channel = "whatsapp" | "email" | "notification";

const perfLabels: Record<PerfLevel, string> = { high: "High Performer", medium: "Mid Performer", low: "Low / At-Risk" };

interface Script {
  id: string;
  label: string;
  timing: string;
  trigger: string;
  objective: string;
  icon: React.ElementType;
  color: string;
  whatsapp: string;
  email: { subject: string; body: string };
  notification: string;
}

function gen(perf: PerfLevel, city: string): Script[] {
  const c = city || "Jakarta";
  const isHigh = perf === "high";
  const isLow = perf === "low";

  return [
    {
      id: "V1", label: "Onboarding Encouragement", timing: "Day 1-3 after signup", trigger: "New vendor completes registration",
      objective: "Activate first listing, set performance expectations, build early momentum",
      icon: ThumbsUp, color: "text-emerald-500",
      whatsapp: `Hi {{VENDOR_NAME}} 👋 Welcome to ASTRA!\n\nYou've joined ${c}'s fastest-growing property marketplace — great decision.\n\nQuick tip: vendors who list their first property within 48 hours get 3x more inquiries in their first month.\n\n🎁 Your welcome bonus: 1 FREE listing boost credit (expires in 72 hours)\n\nReady to list? Tap here: {{LISTING_LINK}}\n\nQuestions? I'm here to help.\n— ASTRA Vendor Success`,
      email: {
        subject: `Welcome to ASTRA — Your Free Boost Credit is Waiting (72h)`,
        body: `Hi {{VENDOR_NAME}},\n\nWelcome to ASTRA PropTech — ${c}'s leading property intelligence marketplace.\n\nYou've made a smart move. Here's what vendors like you are experiencing:\n\n▸ Average 12 qualified inquiries per active listing per month\n▸ 2.3x faster deal velocity compared to traditional channels\n▸ AI-powered lead routing that matches your listings with high-intent investors\n\nYour First Step\n━━━━━━━━━━━━━━━━━━━━\nList your first property to activate your vendor profile. Vendors who list within 48 hours receive 3x more inquiries in their first month.\n\n🎁 Welcome Bonus: 1 FREE listing boost credit\nExpires in 72 hours — use it on your first listing for maximum visibility.\n\n→ List Your First Property: {{LISTING_LINK}}\n\nI'll be checking in to make sure you're getting the results you deserve.\n\nBest,\n{{SUCCESS_MANAGER}}\nVendor Success, ASTRA PropTech`,
      },
      notification: `🎁 Welcome! List your first property in 48h to unlock your free boost credit. Start now →`,
    },
    {
      id: "V2", label: "Performance Improvement Nudge", timing: "Week 2-3 or on trigger", trigger: isLow ? "Response time >4h or inquiry conversion <5%" : "Response time >2h or conversion below segment average",
      objective: "Improve vendor response behavior with data-backed suggestions",
      icon: BarChart3, color: "text-cyan-400",
      whatsapp: isLow
        ? `Hi {{VENDOR_NAME}} — quick data insight from your ASTRA dashboard.\n\nYour current stats:\n⏱ Avg response time: {{RESPONSE_TIME}} (top vendors: <30 min)\n📊 Inquiry conversion: {{CONVERSION}}% (platform avg: 12%)\n👁 Listing views: {{VIEWS}} this week\n\nSmall changes make a big difference:\n✅ Responding within 30 min increases conversion by 40%\n✅ Adding 5+ photos boosts views by 65%\n✅ Updating pricing weekly keeps listings in "Fresh" ranking\n\nWant me to review your listings and suggest quick improvements?\n\n— ASTRA Vendor Success`
        : `Hi {{VENDOR_NAME}} — your weekly performance snapshot 📊\n\nThis week:\n⏱ Avg response: {{RESPONSE_TIME}} ${isHigh ? "✅ Excellent" : "— room to improve"}\n📊 Conversion: {{CONVERSION}}% ${isHigh ? "(top 10%!)" : `(avg: 12%)`}\n📈 Inquiries: {{INQUIRIES}} ${isHigh ? "🔥" : ""}\n🏆 Vendor rank: #{{RANK}} in ${c}\n\n${isHigh ? "You're in the top tier — premium visibility could amplify these results even further." : "Tip: Vendors who respond in <30 min see 40% higher conversion."}\n\n— ASTRA Vendor Success`,
      email: {
        subject: isLow ? `Your ${c} Listing Performance — 3 Quick Wins Inside` : `Your Weekly Vendor Performance Report — ${c}`,
        body: isLow
          ? `Hi {{VENDOR_NAME}},\n\nI've reviewed your ASTRA performance data and wanted to share some actionable insights.\n\nYour Current Metrics\n━━━━━━━━━━━━━━━━━━━━\n▸ Average Response Time: {{RESPONSE_TIME}}\n▸ Inquiry-to-Viewing Conversion: {{CONVERSION}}%\n▸ Listing Views This Week: {{VIEWS}}\n▸ Vendor Performance Score: {{SCORE}}/100\n\nPlatform Benchmarks (Top 20% Vendors)\n━━━━━━━━━━━━━━━━━━━━\n▸ Response Time: <30 minutes\n▸ Conversion Rate: 15%+\n▸ Photos per Listing: 8+\n▸ Price Update Frequency: Weekly\n\n3 Quick Wins to Boost Your Results:\n\n1. Speed up responses — vendors who reply within 30 min convert 40% more inquiries\n2. Add more photos — listings with 8+ images get 65% more views\n3. Update pricing weekly — "Fresh" listings rank higher in our AI algorithm\n\nI'm happy to do a free listing audit if you'd like personalized suggestions.\n\nBest,\n{{SUCCESS_MANAGER}}`
          : `Hi {{VENDOR_NAME}},\n\nHere's your weekly performance summary.\n\nPerformance Metrics\n━━━━━━━━━━━━━━━━━━━━\n▸ Response Time: {{RESPONSE_TIME}} ${isHigh ? "✅ Top-tier" : ""}\n▸ Conversion Rate: {{CONVERSION}}%\n▸ Weekly Inquiries: {{INQUIRIES}}\n▸ Vendor Rank: #{{RANK}} in ${c}\n▸ Performance Score: {{SCORE}}/100\n\n${isHigh ? "You're performing in the top 10% of all vendors. Premium visibility would amplify your already strong conversion rates — see upgrade options below." : "Tip: Your response time is solid. Improving listing photo quality could push your conversion above the 15% threshold."}\n\nBest,\n{{SUCCESS_MANAGER}}`,
      },
      notification: isLow
        ? `⚠️ Your response time is {{RESPONSE_TIME}} — vendors under 30 min convert 40% more. Improve now →`
        : `📊 Weekly report: {{CONVERSION}}% conversion, #{{RANK}} in ${c}. ${isHigh ? "Upgrade to amplify →" : "See improvement tips →"}`,
    },
    {
      id: "V3", label: "Premium Visibility Upsell", timing: "Week 3-4 or on trigger", trigger: isHigh ? "Performance score >75 and no premium subscription" : "Listing views >50/week with <10% conversion (visibility bottleneck)",
      objective: "Convert to paid premium visibility with ROI-framed pitch",
      icon: Crown, color: "text-amber-400",
      whatsapp: isHigh
        ? `Hi {{VENDOR_NAME}} — you're one of ${c}'s top-performing vendors on ASTRA 🏆\n\nYour numbers:\n📊 Conversion: {{CONVERSION}}% (top 10%)\n📈 Inquiries: {{INQUIRIES}}/week\n⭐ Score: {{SCORE}}/100\n\nImagine those numbers with 5x more visibility.\n\nPremium vendors in your segment see:\n• +340% more listing impressions\n• +180% more qualified inquiries\n• Priority placement in investor deal alerts\n\n💰 ROI math: At your conversion rate, premium visibility would generate ~{{EXTRA_INQUIRIES}} additional inquiries/month → est. {{EXTRA_REVENUE}} additional revenue.\n\nTry Premium free for 14 days: {{UPGRADE_LINK}}\n\n— ASTRA Vendor Success`
        : `Hi {{VENDOR_NAME}} — your listings are getting solid views ({{VIEWS}}/week) but your inquiry rate could be higher.\n\nThe gap? Visibility positioning.\n\nPremium vendors get:\n• Top placement in search results\n• Featured in investor deal alerts\n• Priority lead routing\n• Branded vendor profile badge\n\nVendors who upgrade see +180% more inquiries on average.\n\n🎁 Special: 14-day free trial — no commitment.\n\n→ {{UPGRADE_LINK}}\n\n— ASTRA Vendor Success`,
      email: {
        subject: isHigh ? `You're in the Top 10% — Here's How to Maximize It` : `Your Listings Are Getting Views — Here's How to Convert More`,
        body: isHigh
          ? `Hi {{VENDOR_NAME}},\n\nCongratulations — your performance on ASTRA puts you in the top 10% of all ${c} vendors.\n\nYour Current Performance\n━━━━━━━━━━━━━━━━━━━━\n▸ Conversion Rate: {{CONVERSION}}%\n▸ Weekly Inquiries: {{INQUIRIES}}\n▸ Performance Score: {{SCORE}}/100\n▸ Vendor Rank: #{{RANK}} in ${c}\n\nNow imagine amplifying those results.\n\nWhat Premium Visibility Delivers\n━━━━━━━━━━━━━━━━━━━━\n▸ +340% listing impressions\n▸ +180% qualified inquiries\n▸ Priority placement in investor deal alerts\n▸ AI-boosted ranking weight\n▸ Branded vendor profile badge\n\nROI Projection (Based on Your Data)\n━━━━━━━━━━━━━━━━━━━━\nAt your {{CONVERSION}}% conversion rate, premium visibility would generate approximately {{EXTRA_INQUIRIES}} additional monthly inquiries — translating to an estimated {{EXTRA_REVENUE}} in additional deal revenue.\n\n→ Start 14-Day Free Trial: {{UPGRADE_LINK}}\n\nNo commitment. Cancel anytime. Your performance data speaks for itself.\n\nBest,\n{{SUCCESS_MANAGER}}`
          : `Hi {{VENDOR_NAME}},\n\nYour listings are attracting {{VIEWS}} views per week — that's solid traffic. But your inquiry conversion ({{CONVERSION}}%) suggests a visibility positioning opportunity.\n\nPremium Visibility Benefits\n━━━━━━━━━━━━━━━━━━━━\n▸ Top-of-search placement\n▸ Featured in investor deal alert emails\n▸ Priority lead routing from AI matching\n▸ Branded vendor profile badge\n▸ Performance analytics dashboard\n\nVendors who upgrade see an average +180% increase in qualified inquiries.\n\n→ Try Premium Free for 14 Days: {{UPGRADE_LINK}}\n\nBest,\n{{SUCCESS_MANAGER}}`,
      },
      notification: isHigh
        ? `🏆 Top 10% vendor! Premium could add ~{{EXTRA_INQUIRIES}} inquiries/month. Try 14 days free →`
        : `📈 {{VIEWS}} views/week but only {{CONVERSION}}% converting. Premium boosts inquiries +180%. Try free →`,
    },
    {
      id: "V4", label: "Scarcity Upgrade Urgency", timing: "Day 5-7 after upsell", trigger: "Viewed upgrade page but didn't convert, or trial expiring in 48h",
      objective: "Create time-pressure to convert on premium upgrade",
      icon: Clock, color: "text-destructive",
      whatsapp: `Hi {{VENDOR_NAME}} — heads up.\n\nWe're allocating premium visibility slots in ${c} for next month, and {{SLOTS_LEFT}} slots remain in your district.\n\nWhy it matters:\n• ${Math.floor(Math.random() * 5) + 8} vendors in {{DISTRICT}} are already on Premium\n• They're capturing {{PREMIUM_SHARE}}% of all investor inquiries\n• Non-premium listings are getting pushed lower in rankings\n\n⏰ Your 14-day free trial offer expires in {{HOURS_LEFT}} hours.\n\nAfter that, standard pricing applies and slot availability isn't guaranteed.\n\n→ Lock in your slot: {{UPGRADE_LINK}}\n\n— ASTRA Vendor Success`,
      email: {
        subject: `⏰ {{SLOTS_LEFT}} Premium Slots Left in {{DISTRICT}} — Your Trial Expires Soon`,
        body: `Hi {{VENDOR_NAME}},\n\nI wanted to let you know that premium visibility slots in {{DISTRICT}}, ${c} are filling up.\n\nCurrent Status\n━━━━━━━━━━━━━━━━━━━━\n▸ Premium slots remaining: {{SLOTS_LEFT}} of {{TOTAL_SLOTS}}\n▸ Active premium vendors in district: ${Math.floor(Math.random() * 5) + 8}\n▸ Premium vendor inquiry share: {{PREMIUM_SHARE}}%\n▸ Your free trial expires in: {{HOURS_LEFT}} hours\n\nThe competitive reality: premium vendors in your district are capturing a disproportionate share of investor inquiries. As more vendors upgrade, non-premium listings receive progressively fewer impressions.\n\nYour trial offer ({{TRIAL_PRICE}}) expires in {{HOURS_LEFT}} hours. After that, standard pricing ({{STANDARD_PRICE}}/month) applies.\n\n→ Secure Your Premium Slot: {{UPGRADE_LINK}}\n\nBest,\n{{SUCCESS_MANAGER}}`,
      },
      notification: `⏰ Only {{SLOTS_LEFT}} premium slots left in {{DISTRICT}}. Your free trial expires in {{HOURS_LEFT}}h. Upgrade now →`,
    },
    {
      id: "V5", label: "Churn Prevention Reactivation", timing: "After 7+ days of inactivity", trigger: "No login for 7 days, or no new listings for 14 days, or declining inquiry responses",
      objective: "Re-engage at-risk vendor before they churn",
      icon: RefreshCw, color: "text-violet-400",
      whatsapp: `Hi {{VENDOR_NAME}} — we've missed you on ASTRA.\n\nWhile you've been away, here's what happened in your ${c} market:\n\n📈 ${Math.floor(Math.random() * 30) + 20} new investor searches in {{DISTRICT}} this week\n🏠 ${Math.floor(Math.random() * 10) + 5} properties similar to yours received inquiries\n💰 Avg deal value in your segment: {{AVG_DEAL}}\n\nYour listings are still live, but they've dropped in ranking due to inactivity. A quick update (new photos, refreshed pricing) would restore your visibility immediately.\n\n🎁 Welcome-back bonus: 1 FREE boost credit if you update a listing today.\n\n→ Update now: {{DASHBOARD_LINK}}\n\nWe'd love to see you back.\n— ASTRA Vendor Success`,
      email: {
        subject: `You're Missing ${Math.floor(Math.random() * 30) + 20} Investor Searches in {{DISTRICT}} This Week`,
        body: `Hi {{VENDOR_NAME}},\n\nI noticed you haven't been active on ASTRA recently, and I wanted to share what's happening in your market — because the opportunity is real.\n\nYour ${c} Market This Week\n━━━━━━━━━━━━━━━━━━━━\n▸ New investor searches in {{DISTRICT}}: ${Math.floor(Math.random() * 30) + 20}\n▸ Similar properties that received inquiries: ${Math.floor(Math.random() * 10) + 5}\n▸ Average deal value in segment: {{AVG_DEAL}}\n▸ Investor demand trend: ↑ Rising\n\nYour Listing Status\n━━━━━━━━━━━━━━━━━━━━\n▸ Active listings: {{ACTIVE_LISTINGS}}\n▸ Current ranking position: Declining (inactivity penalty)\n▸ Missed potential inquiries: ~{{MISSED_INQUIRIES}}\n\nThe good news: a simple listing refresh (updated photos, refreshed pricing, new description) immediately restores your ranking position.\n\n🎁 Welcome-Back Bonus: 1 FREE boost credit when you update any listing today.\n\n→ Update Your Listings: {{DASHBOARD_LINK}}\n\nI'm here if you need any support.\n\nBest,\n{{SUCCESS_MANAGER}}`,
      },
      notification: `📉 Your listings dropped in ranking. ${Math.floor(Math.random() * 30) + 20} investors searched {{DISTRICT}} this week. Update now + free boost →`,
    },
  ];
}

const VendorRetentionScripts = () => {
  const { toast } = useToast();
  const [city, setCity] = useState("Jakarta");
  const [perf, setPerf] = useState<PerfLevel>("medium");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const steps = gen(perf, city);

  const handleCopy = (step: Script, key: string) => {
    const text = channel === "whatsapp" ? step.whatsapp : channel === "email" ? `Subject: ${step.email.subject}\n\n${step.email.body}` : step.notification;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Vendor Retention & Upsell Scripts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          5-step lifecycle — onboarding, performance nudge, premium upsell, urgency close & churn prevention
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" />City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Jakarta", "Bandung", "Surabaya", "Bali", "Medan"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><BarChart3 className="h-3 w-3" />Performance</label>
              <Select value={perf} onValueChange={v => setPerf(v as PerfLevel)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(perfLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Zap className="h-3 w-3" />Channel</label>
              <div className="flex gap-1.5 pt-0.5">
                {([{ key: "whatsapp" as const, icon: Phone }, { key: "email" as const, icon: Mail }, { key: "notification" as const, icon: Bell }] as const).map(ch => (
                  <Button key={ch.key} size="sm" variant={channel === ch.key ? "default" : "outline"} className="h-7 text-xs gap-1 flex-1" onClick={() => setChannel(ch.key)}>
                    <ch.icon className="h-3 w-3" />{ch.key === "notification" ? "Notif" : ch.key.charAt(0).toUpperCase() + ch.key.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts */}
      <div className="relative space-y-4">
        <div className="absolute left-[18px] top-6 bottom-6 w-px bg-border/40 hidden md:block" />

        {steps.map((step, i) => (
          <motion.div key={`${step.id}-${channel}-${perf}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 bg-card/70 md:ml-10 relative">
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
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleCopy(step, step.id)}>
                      {copiedKey === step.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === step.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" />Objective</p>
                    <p className="text-xs text-foreground">{step.objective}</p>
                  </div>
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary uppercase mb-0.5 flex items-center gap-1"><Zap className="h-3 w-3" />Automation Trigger</p>
                    <p className="text-xs text-foreground">{step.trigger}</p>
                  </div>
                </div>

                {channel === "email" && (
                  <div className="p-2 rounded-md bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Subject Line</p>
                    <p className="text-xs font-medium text-foreground">{step.email.subject}</p>
                  </div>
                )}

                <pre className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed p-3 rounded-lg bg-muted/20 border border-border/20 font-sans">
                  {channel === "whatsapp" ? step.whatsapp : channel === "email" ? step.email.body : step.notification}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Automation Triggers Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Automation Trigger Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { trigger: "Low Inquiry Threshold", condition: "<3 inquiries/week for 2 consecutive weeks", action: "Send performance nudge (V2) + listing improvement tips" },
              { trigger: "Declining Activity", condition: "No login for 7+ days or no listing updates for 14+ days", action: "Send churn prevention (V5) + welcome-back bonus" },
              { trigger: "High-Performer Upgrade", condition: "Performance score >75, no premium subscription", action: "Send premium upsell (V3) with ROI projection" },
              { trigger: "Response Time Degradation", condition: "Avg response time >4h for 3+ days", action: "Send performance nudge (V2) with response time focus" },
              { trigger: "Trial Expiring", condition: "Free trial ends in <48 hours, not converted", action: "Send urgency close (V4) with slot scarcity" },
              { trigger: "Listing View Spike", condition: "Listing views up >50% week-over-week", action: "Send upgrade pitch (V3) — 'capitalize on momentum'" },
            ].map((t, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-background/50 border border-border/20">
                <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1"><Zap className="h-3 w-3 text-primary" />{t.trigger}</p>
                <p className="text-[10px] text-muted-foreground mb-1">When: {t.condition}</p>
                <p className="text-[10px] text-foreground flex items-start gap-1"><ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />{t.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorRetentionScripts;
