import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  useNegotiationIntelligence,
  useNegotiationScoring,
  useNegotiationMessage,
} from "@/hooks/useNegotiationIntelligence";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Handshake,
  RefreshCw,
  AlertTriangle,
  Flame,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Copy,
  Phone,
  Brain,
} from "lucide-react";

const momentumColor = (m: number) => {
  if (m >= 80) return "text-emerald-400";
  if (m >= 60) return "text-blue-400";
  if (m >= 40) return "text-amber-400";
  return "text-red-400";
};

const momentumLabel = (m: number) => {
  if (m >= 80) return "Hot";
  if (m >= 60) return "Active";
  if (m >= 40) return "Fragile";
  return "At Risk";
};

const stageBadge: Record<string, { label: string; color: string }> = {
  initial: { label: "Initial", color: "bg-muted text-muted-foreground" },
  active: { label: "Active", color: "bg-blue-600" },
  offer: { label: "Offer", color: "bg-amber-600" },
  counter: { label: "Counter", color: "bg-purple-600" },
  escrow_ready: { label: "Escrow Ready", color: "bg-emerald-600" },
};

const NegotiationAIDashboard: React.FC = () => {
  const { data: deals, isLoading, refetch } = useNegotiationIntelligence();
  const scoring = useNegotiationScoring();
  const messageMutation = useNegotiationMessage();

  // Message generator state
  const [msgStage, setMsgStage] = useState("active");
  const [msgBuyerType, setMsgBuyerType] = useState("investor");
  const [msgPriceGap, setMsgPriceGap] = useState([10]);
  const [msgUrgency, setMsgUrgency] = useState("medium");
  const [generatedMsg, setGeneratedMsg] = useState<{ whatsapp: string; call_points: string[]; psychology: string } | null>(null);

  const hotDeals = deals?.filter((d) => d.negotiation_momentum_score >= 80) ?? [];
  const atRisk = deals?.filter((d) => d.risk_of_drop_probability >= 60) ?? [];
  const avgMomentum = deals?.length
    ? Math.round(deals.reduce((a, b) => a + b.negotiation_momentum_score, 0) / deals.length)
    : 0;
  const avgGap = deals?.length
    ? (deals.reduce((a, b) => a + b.price_gap_percentage, 0) / deals.length).toFixed(1)
    : "0";

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const generateMessage = async () => {
    const result = await messageMutation.mutateAsync({
      stage: msgStage,
      buyer_type: msgBuyerType,
      price_gap: msgPriceGap[0],
      urgency: msgUrgency,
      language: "id",
    });
    setGeneratedMsg(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" />
            Negotiation AI Assistant
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time momentum scoring, drop risk prediction & message generation
          </p>
        </div>
        <Button
          onClick={() => scoring.mutate()}
          disabled={scoring.isPending}
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${scoring.isPending ? "animate-spin" : ""}`} />
          {scoring.isPending ? "Scoring…" : "Recompute Scores"}
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Momentum", value: `${avgMomentum}%`, icon: TrendingUp, color: momentumColor(avgMomentum) },
          { label: "Hot Negotiations", value: hotDeals.length, icon: Flame, color: "text-emerald-400" },
          { label: "At Risk", value: atRisk.length, icon: AlertTriangle, color: "text-red-400" },
          { label: "Avg Price Gap", value: `${avgGap}%`, icon: Target, color: "text-amber-400" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-3 flex items-center gap-3">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="deals">📊 Active Deals ({deals?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="risk">⚠️ At Risk ({atRisk.length})</TabsTrigger>
          <TabsTrigger value="message">💬 Message Generator</TabsTrigger>
          <TabsTrigger value="formula">📐 Formula</TabsTrigger>
        </TabsList>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : !deals?.length ? (
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>No active negotiations scored yet. Click "Recompute Scores" to analyze deals.</p>
              </CardContent>
            </Card>
          ) : (
            deals.map((d, i) => {
              const sb = stageBadge[d.negotiation_stage] || stageBadge.initial;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="bg-card/50 border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={sb.color}>{sb.label}</Badge>
                          <Badge variant="outline">{momentumLabel(d.negotiation_momentum_score)}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Risk: <span className="text-red-400 font-bold">{d.risk_of_drop_probability}%</span></span>
                          <span className={`text-xl font-bold ${momentumColor(d.negotiation_momentum_score)}`}>
                            {d.negotiation_momentum_score}%
                          </span>
                        </div>
                      </div>
                      <Progress value={d.negotiation_momentum_score} className="h-2 mb-3" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                        <div>💰 Offer: <span className="text-foreground">Rp {Number(d.buyer_offer_price || 0).toLocaleString("id-ID")}</span></div>
                        <div>🏷️ Counter: <span className="text-foreground">Rp {Number(d.seller_counter_price || 0).toLocaleString("id-ID")}</span></div>
                        <div>📏 Gap: <span className="text-foreground">{d.price_gap_percentage}%</span></div>
                        <div>🎯 Intent: <span className="text-foreground">{d.buyer_intent_strength}</span></div>
                      </div>

                      {d.recommended_next_action && (
                        <div className="bg-muted/30 rounded p-2 flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-foreground">{d.recommended_next_action}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyText(d.recommended_next_action)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        {/* At Risk Tab */}
        <TabsContent value="risk" className="space-y-3">
          {atRisk.length === 0 ? (
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                <p>No negotiations at high risk currently. 🎉</p>
              </CardContent>
            </Card>
          ) : (
            atRisk.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">⚠️ Risk: {d.risk_of_drop_probability}%</Badge>
                      <span className="text-xs text-muted-foreground">Momentum: {d.negotiation_momentum_score}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Gap: {d.price_gap_percentage}% · Stage: {d.negotiation_stage}</p>
                    {d.recommended_next_action && (
                      <div className="bg-muted/30 rounded p-2 mt-2 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground flex-1">{d.recommended_next_action}</p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyText(d.recommended_next_action)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        {/* Message Generator Tab */}
        <TabsContent value="message" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-5 w-5" /> AI Message Generator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stage</label>
                  <Select value={msgStage} onValueChange={setMsgStage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">Initial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="counter">Counter</SelectItem>
                      <SelectItem value="escrow_ready">Escrow Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Buyer Type</label>
                  <Select value={msgBuyerType} onValueChange={setMsgBuyerType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Urgency</label>
                  <Select value={msgUrgency} onValueChange={setMsgUrgency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Price Gap: {msgPriceGap[0]}%</label>
                  <Slider value={msgPriceGap} onValueChange={setMsgPriceGap} min={0} max={30} step={1} className="mt-2" />
                </div>
              </div>
              <Button onClick={generateMessage} disabled={messageMutation.isPending} className="gap-2">
                <Brain className="h-4 w-4" />
                {messageMutation.isPending ? "Generating…" : "Generate Message"}
              </Button>

              {generatedMsg && (
                <div className="space-y-3 mt-4">
                  {/* WhatsApp Message */}
                  <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-emerald-400">📱 WhatsApp Message</span>
                        <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => copyText(generatedMsg.whatsapp)}>
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{generatedMsg.whatsapp}</p>
                    </CardContent>
                  </Card>

                  {/* Call Talking Points */}
                  <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-3">
                      <span className="text-xs font-medium text-blue-400 flex items-center gap-1 mb-2">
                        <Phone className="h-3 w-3" /> Call Talking Points
                      </span>
                      <ul className="space-y-1">
                        {generatedMsg.call_points.map((p, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-muted-foreground">{i + 1}.</span> {p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Psychology */}
                  <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-3">
                      <span className="text-xs font-medium text-purple-400 flex items-center gap-1 mb-1">
                        <Brain className="h-3 w-3" /> Psychology Trigger
                      </span>
                      <p className="text-xs text-foreground">{generatedMsg.psychology}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formula Tab */}
        <TabsContent value="formula">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-base">Momentum & Risk Formula</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <pre className="bg-muted/30 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">{`negotiation_momentum_score =
  (0.25 × buyer_intent_strength)
+ (0.20 × interaction_frequency_score)
+ (0.20 × price_alignment_progress)
+ (0.15 × liquidity_zone_factor)
+ (0.20 × concession_signal)

risk_of_drop_probability =
  100 - momentum + inactivity_penalty
  
inactivity_penalty = min(days_since_update × 5, 40)

Classification:
  80–100 → Hot 🔥
  60–79  → Active 📊
  40–59  → Fragile ⚠️
  {'<'}40    → At Risk 🚨`}</pre>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <p className="font-medium text-emerald-400 text-xs">Hot: Move to escrow</p>
                  <p className="text-xs text-muted-foreground mt-1">Strong buyer intent + active communication + narrowing price gap</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                  <p className="font-medium text-red-400 text-xs">At Risk: Re-engage immediately</p>
                  <p className="text-xs text-muted-foreground mt-1">Inactive {'>'}7 days, widening gap, or declining behavioral signals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NegotiationAIDashboard;
