import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, DollarSign, Shield, Clock, CheckCircle, FileText,
  ArrowRight, ArrowLeft, MessageSquare, Home, MapPin, Target, TrendingUp
} from "lucide-react";

const steps = ["Offer Price", "Financing", "Message", "Review", "Submitted"];

const offerStats = {
  totalOffers: 186, acceptanceRate: 34, avgResponseTime: "18h",
  avgNegRounds: 2.4, conversionRate: 28, avgDiscount: "4.2%",
};

const recentOffers = [
  { buyer: "Ahmad R.", property: "Villa Seminyak", offer: "Rp 4.0B", asking: "Rp 4.2B", status: "counter" },
  { buyer: "Sarah L.", property: "Apt Canggu", offer: "Rp 6.5B", asking: "Rp 6.8B", status: "accepted" },
  { buyer: "David K.", property: "Beach House", offer: "Rp 8.0B", asking: "Rp 8.5B", status: "pending" },
  { buyer: "Lisa M.", property: "Studio Ubud", offer: "Rp 1.1B", asking: "Rp 1.2B", status: "rejected" },
];

const offerColor = (s: string) =>
  s === "accepted" ? "bg-chart-1/15 text-chart-1" :
  s === "counter" ? "bg-chart-3/15 text-chart-3" :
  s === "pending" ? "bg-primary/15 text-primary" :
  "bg-destructive/15 text-destructive";

const DealOfferSubmissionFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [offerPrice, setOfferPrice] = useState("4000000000");
  const [financeReady, setFinanceReady] = useState(true);
  const [message, setMessage] = useState("");

  const askingPrice = 4200000000;
  const discount = ((1 - Number(offerPrice) / askingPrice) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Deal Offer Submission
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Streamlined purchase offer flow</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          {offerStats.acceptanceRate}% Acceptance
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Total Offers", value: offerStats.totalOffers },
          { label: "Acceptance", value: `${offerStats.acceptanceRate}%` },
          { label: "Avg Response", value: offerStats.avgResponseTime },
          { label: "Neg. Rounds", value: offerStats.avgNegRounds },
          { label: "Conversion", value: `${offerStats.conversionRate}%` },
          { label: "Avg Discount", value: offerStats.avgDiscount },
        ].map(m => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Offer Flow */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-2">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1 px-1.5 py-1 rounded-full text-[9px] font-medium ${
                      i <= step ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < step ? <CheckCircle className="h-2.5 w-2.5" /> : <span className="w-2.5 text-center text-[9px]">{i + 1}</span>}
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
                  </React.Fragment>
                ))}
              </div>
              <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
            </CardContent>
          </Card>

          {/* Property Header */}
          <Card className="border-border/30 bg-muted/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-16 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">Modern 3BR Villa with Pool</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> Seminyak, Bali
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-muted-foreground">Asking Price</div>
                <div className="text-sm font-bold text-foreground">Rp 4,200,000,000</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 min-h-[220px]">
            <CardContent className="p-4">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="price" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="text-center mb-3">
                      <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                      <h3 className="text-base font-bold text-foreground">Your Offer Price</h3>
                    </div>
                    <div className="relative max-w-sm mx-auto">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                      <Input value={Number(offerPrice).toLocaleString("id-ID")}
                        onChange={e => setOfferPrice(e.target.value.replace(/\D/g, ""))}
                        className="pl-10 text-lg font-bold text-center" />
                    </div>
                    <div className="flex justify-center gap-3 text-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Discount</div>
                        <div className={`text-sm font-bold ${Number(discount) > 0 ? "text-chart-1" : "text-destructive"}`}>{discount}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Suggested Range</div>
                        <div className="text-sm font-bold text-foreground">Rp 3.9B – 4.1B</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="finance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-w-sm mx-auto text-center">
                    <Target className="h-8 w-8 mx-auto text-chart-1 mb-2" />
                    <h3 className="text-base font-bold text-foreground">Financing Readiness</h3>
                    <div className="flex gap-3 justify-center">
                      {["Cash Ready", "Pre-Approved", "Need Financing"].map(opt => (
                        <Card key={opt} onClick={() => setFinanceReady(opt !== "Need Financing")}
                          className={`cursor-pointer transition-all flex-1 ${financeReady && opt !== "Need Financing" ? "border-primary ring-1 ring-primary/20" : "border-border/50"}`}>
                          <CardContent className="p-3 text-center">
                            <div className="text-[10px] font-bold text-foreground">{opt}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Card className="border-chart-1/20 bg-chart-1/5">
                      <CardContent className="p-2.5 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-chart-1 flex-shrink-0" />
                        <p className="text-[10px] text-foreground text-left">Financing-ready buyers receive 2.3x faster seller responses</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="msg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 max-w-sm mx-auto">
                    <div className="text-center mb-3">
                      <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
                      <h3 className="text-base font-bold text-foreground">Message to Seller</h3>
                      <p className="text-[10px] text-muted-foreground">Optional — adds a personal touch</p>
                    </div>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="e.g., We love the villa and are ready to move quickly..."
                      className="w-full h-24 p-3 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <h3 className="text-base font-bold text-foreground text-center mb-3">Review Your Offer</h3>
                    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                      {[
                        { label: "Offer Price", value: `Rp ${Number(offerPrice).toLocaleString("id-ID")}` },
                        { label: "Discount", value: `${discount}%` },
                        { label: "Financing", value: financeReady ? "Ready" : "Pending" },
                        { label: "Message", value: message ? "Included" : "None" },
                      ].map(r => (
                        <div key={r.label} className="p-2 rounded-lg border border-border/30 text-center">
                          <div className="text-[9px] text-muted-foreground uppercase">{r.label}</div>
                          <div className="text-xs font-bold text-foreground mt-0.5">{r.value}</div>
                        </div>
                      ))}
                    </div>
                    <Card className="border-chart-1/20 bg-chart-1/5 max-w-sm mx-auto">
                      <CardContent className="p-2.5 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-chart-1 flex-shrink-0" />
                        <p className="text-[10px] text-foreground">Your offer is secure. Estimated seller response: 12–24 hours.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <CheckCircle className="h-16 w-16 mx-auto text-chart-1 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground">Offer Submitted!</h3>
                    <p className="text-xs text-muted-foreground mt-1">Rp {Number(offerPrice).toLocaleString("id-ID")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" /> Expected response within 12–24 hours
                    </p>
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="text-[10px] text-muted-foreground mb-2">Negotiation Stage</div>
                      <Progress value={20} className="h-2" />
                      <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                        <span>Submitted</span><span>Under Review</span><span>Response</span><span>Accepted</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {step < 4 && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={() => setStep(step + 1)}>
                {step === 3 ? "Submit Offer" : "Continue"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Recent Offers Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Recent Offers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {recentOffers.map((o, i) => (
                <div key={i} className="p-2 rounded border border-border/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-foreground">{o.buyer}</span>
                    <Badge className={`${offerColor(o.status)} text-[8px]`}>{o.status}</Badge>
                  </div>
                  <div className="text-[9px] text-muted-foreground">{o.property}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-foreground">Offer: {o.offer}</span>
                    <span className="text-[9px] text-muted-foreground">Ask: {o.asking}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <TrendingUp className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Offer Success Tips</div>
              <div className="space-y-1 mt-2">
                {[
                  "Offers within 5% of asking price have 3x acceptance rate",
                  "Including a personal message increases response speed by 40%",
                  "Financing-ready buyers close 2.3x faster",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-1 text-[9px] text-muted-foreground">
                    <CheckCircle className="h-2.5 w-2.5 text-chart-1 flex-shrink-0 mt-0.5" />{tip}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealOfferSubmissionFlow;
