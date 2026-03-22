import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  AlertTriangle, LifeBuoy, Phone, MessageSquare, DollarSign,
  Clock, TrendingDown, CheckCircle, ArrowRight, Shield
} from "lucide-react";

const atRiskDeals = [
  { id: "D-445", property: "Sanur Beachfront Villa", buyer: "James L.", value: 5200000000, stalledDays: 8, risk: "critical", reason: "Buyer financing delayed — bank review pending", buyerHesitation: 75, sellerRigidity: 82, negGap: 12, financing: "delayed" },
  { id: "D-432", property: "Ubud Retreat 3BR", buyer: "Maria C.", value: 2800000000, stalledDays: 6, risk: "high", reason: "Price gap too wide — seller won't budge", buyerHesitation: 45, sellerRigidity: 90, negGap: 18, financing: "confirmed" },
  { id: "D-458", property: "Canggu Modern Villa", buyer: "Robert K.", value: 3500000000, stalledDays: 5, risk: "high", reason: "Buyer comparing 3 other properties", buyerHesitation: 68, sellerRigidity: 40, negGap: 8, financing: "pending" },
  { id: "D-421", property: "BSD Premium Apt", buyer: "Linda W.", value: 1500000000, stalledDays: 4, risk: "medium", reason: "Legal document review taking too long", buyerHesitation: 30, sellerRigidity: 55, negGap: 5, financing: "confirmed" },
];

const mediationSteps = [
  "Schedule joint call between buyer and seller agents",
  "Present comparable market data to justify price position",
  "Propose meeting-in-the-middle price with added value (furnishing, warranty)",
  "Set 48-hour decision deadline with urgency framing",
  "Offer exclusive incentive for immediate commitment",
];

const urgencyTemplates = [
  { label: "Buyer Urgency", message: "Hi [Buyer], we wanted to update you — there's another serious inquiry on [Property]. Would you like to confirm your position today?" },
  { label: "Seller Flexibility", message: "Hi [Seller], market data shows properties at this price point take 40% longer to close. A 3-5% adjustment could accelerate your sale significantly." },
  { label: "Financing Follow-up", message: "Hi [Buyer], just checking on your financing status. We can help connect you with our partner bank for faster processing." },
];

const riskColor = (r: string) => r === "critical" ? "destructive" : r === "high" ? "default" : "secondary";

const UrgentDealRescuePanel: React.FC = () => {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const totalAtRisk = atRiskDeals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-destructive" />
            Urgent Deal Rescue Action Panel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Save high-value deals before they collapse</p>
        </div>
        <Card className="border-destructive/20 bg-destructive/5 px-4 py-2">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">Rp {(totalAtRisk / 1e9).toFixed(1)}B</div>
            <div className="text-[10px] text-muted-foreground">Pipeline at Risk</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Deals at Risk", value: atRiskDeals.length, icon: AlertTriangle, color: "text-destructive" },
          { label: "Avg Stalled Days", value: `${Math.round(atRiskDeals.reduce((s, d) => s + d.stalledDays, 0) / atRiskDeals.length)}d`, icon: Clock, color: "text-chart-3" },
          { label: "Avg Neg Gap", value: `${Math.round(atRiskDeals.reduce((s, d) => s + d.negGap, 0) / atRiskDeals.length)}%`, icon: TrendingDown, color: "text-chart-2" },
          { label: "Financing Issues", value: atRiskDeals.filter(d => d.financing !== "confirmed").length, icon: DollarSign, color: "text-primary" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* At-Risk Deals */}
      <div className="space-y-3">
        {atRiskDeals.map((deal, i) => (
          <motion.div key={deal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border-border/50 ${deal.risk === "critical" ? "border-destructive/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={riskColor(deal.risk)} className="text-[10px]">{deal.risk.toUpperCase()}</Badge>
                      <span className="text-sm font-bold text-foreground">{deal.id}</span>
                      <span className="text-xs text-muted-foreground">• Stalled {deal.stalledDays}d</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{deal.property}</p>
                    <p className="text-xs text-muted-foreground">Buyer: {deal.buyer} • Rp {(deal.value / 1e9).toFixed(1)}B</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <AlertTriangle className="h-3 w-3 text-chart-3" />
                      <span className="text-xs text-chart-3">{deal.reason}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Buyer Hesitation</div>
                        <Progress value={deal.buyerHesitation} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{deal.buyerHesitation}%</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Seller Rigidity</div>
                        <Progress value={deal.sellerRigidity} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{deal.sellerRigidity}%</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Neg Gap</div>
                        <Progress value={deal.negGap * 5} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{deal.negGap}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={`text-[10px] ${deal.financing === "confirmed" ? "border-chart-1/30 text-chart-1" : deal.financing === "delayed" ? "border-destructive/30 text-destructive" : "border-chart-3/30 text-chart-3"}`}>
                      💰 {deal.financing}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}>
                      <ArrowRight className="h-3 w-3 mr-1" />Rescue Plan
                    </Button>
                    <Button size="sm" className="h-7 text-[10px]"><Phone className="h-3 w-3 mr-1" />Call</Button>
                  </div>
                </div>
                {expandedDeal === deal.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-3 border-t border-border/30">
                    <p className="text-xs font-bold text-foreground mb-2">Mediation Steps:</p>
                    <div className="space-y-1.5">
                      {mediationSteps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Templates */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Urgency Escalation Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {urgencyTemplates.map((t, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/20">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-[10px]">{t.label}</Badge>
                <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => navigator.clipboard.writeText(t.message)}>Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground italic">{t.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UrgentDealRescuePanel;
