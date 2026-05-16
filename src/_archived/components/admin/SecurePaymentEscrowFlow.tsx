import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, DollarSign, Clock, CheckCircle, FileText, Upload,
  ArrowRight, ArrowLeft, Lock, Phone, AlertTriangle, Eye
} from "lucide-react";

const steps = ["Payment Summary", "Document Upload", "Escrow Deposit", "Confirmation"];

const milestones = [
  { label: "Booking Deposit", amount: "Rp 200M", status: "paid", pct: 4.9 },
  { label: "Down Payment", amount: "Rp 800M", status: "pending", pct: 19.5 },
  { label: "Final Payment", amount: "Rp 3.1B", status: "upcoming", pct: 75.6 },
];

const documents = [
  { name: "Property Title Certificate", status: "verified" },
  { name: "Buyer KYC Documents", status: "verified" },
  { name: "Sale Agreement Draft", status: "pending" },
  { name: "Tax Clearance Certificate", status: "missing" },
];

const docStatus = (s: string) =>
  s === "verified" ? "bg-chart-1/15 text-chart-1" :
  s === "pending" ? "bg-chart-3/15 text-chart-3" :
  "bg-destructive/15 text-destructive";

const milestoneStatus = (s: string) =>
  s === "paid" ? "bg-chart-1/15 text-chart-1 border-chart-1/30" :
  s === "pending" ? "bg-chart-3/15 text-chart-3 border-chart-3/30" :
  "bg-muted text-muted-foreground border-border/30";

const SecurePaymentEscrowFlow: React.FC = () => {
  const [step, setStep] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Secure Payment & Escrow
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Protected transaction execution</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          <Lock className="h-3 w-3 mr-1" /> Escrow Protected
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Escrow Active", value: "5" },
          { label: "Total Held", value: "Rp 2.4B" },
          { label: "Completed", value: "42" },
          { label: "Avg Duration", value: "12 days" },
          { label: "Dispute Rate", value: "0.8%" },
          { label: "Protection", value: "100%" },
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
        <div className="md:col-span-2 space-y-3">
          {/* Step Indicator */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-2">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1 px-1.5 py-1 rounded-full text-[9px] font-medium ${
                      i <= step ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < step ? <CheckCircle className="h-2.5 w-2.5" /> : <span className="w-2.5 text-center">{i + 1}</span>}
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
                  </React.Fragment>
                ))}
              </div>
              <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-border/50 min-h-[260px]">
            <CardContent className="p-4">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="text-center mb-3">
                      <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                      <h3 className="text-base font-bold text-foreground">Payment Milestones</h3>
                      <p className="text-[10px] text-muted-foreground">Deal #D-447 — Villa Seminyak — Rp 4.1B</p>
                    </div>
                    <div className="space-y-2">
                      {milestones.map((m, i) => (
                        <Card key={m.label} className={`border ${milestoneStatus(m.status)}`}>
                          <CardContent className="p-2.5 flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              m.status === "paid" ? "bg-chart-1/20" : "bg-muted/30"
                            }`}>
                              {m.status === "paid" ? <CheckCircle className="h-3.5 w-3.5 text-chart-1" /> :
                               <span className="text-[9px] font-bold text-muted-foreground">{i + 1}</span>}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-foreground">{m.label}</div>
                              <div className="text-[9px] text-muted-foreground">{m.pct}% of total</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-foreground">{m.amount}</div>
                              <Badge className={`${milestoneStatus(m.status)} text-[7px]`}>{m.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="text-center mb-3">
                      <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                      <h3 className="text-base font-bold text-foreground">Document Verification</h3>
                    </div>
                    {documents.map((d, i) => (
                      <Card key={d.name} className="border-border/30">
                        <CardContent className="p-2.5 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-[11px] text-foreground flex-1">{d.name}</span>
                          <Badge className={`${docStatus(d.status)} text-[8px]`}>{d.status}</Badge>
                          {d.status === "missing" && (
                            <Button size="sm" variant="outline" className="h-6 text-[9px]">
                              <Upload className="h-3 w-3 mr-0.5" /> Upload
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="escrow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-w-sm mx-auto text-center">
                    <Lock className="h-10 w-10 mx-auto text-primary mb-2" />
                    <h3 className="text-base font-bold text-foreground">Escrow Deposit</h3>
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="text-[10px] text-muted-foreground">Amount to Deposit</div>
                        <div className="text-2xl font-bold text-primary mt-1">Rp 800,000,000</div>
                        <div className="text-[9px] text-muted-foreground mt-1">Down Payment — secured in escrow</div>
                        <Progress value={25} className="h-2 mt-3" />
                        <div className="text-[9px] text-muted-foreground mt-1">Rp 200M of Rp 800M deposited</div>
                      </CardContent>
                    </Card>
                    <Card className="border-chart-1/20 bg-chart-1/5">
                      <CardContent className="p-2.5 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-chart-1 flex-shrink-0" />
                        <p className="text-[10px] text-foreground text-left">Your funds are held in a protected escrow account until all conditions are met.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <CheckCircle className="h-16 w-16 mx-auto text-chart-1 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground">Payment Confirmed!</h3>
                    <p className="text-xs text-muted-foreground mt-1">Down payment secured in escrow</p>
                    <Card className="border-chart-1/20 bg-chart-1/5 max-w-xs mx-auto mt-4">
                      <CardContent className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div><div className="text-[9px] text-muted-foreground">Deposited</div><div className="text-sm font-bold text-chart-1">Rp 800M</div></div>
                          <div><div className="text-[9px] text-muted-foreground">Remaining</div><div className="text-sm font-bold text-foreground">Rp 3.1B</div></div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button size="sm" variant="outline" className="text-xs"><Eye className="h-3 w-3 mr-1" /> View Receipt</Button>
                      <Button size="sm" className="text-xs"><Phone className="h-3 w-3 mr-1" /> Contact Support</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {step < 3 && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={() => setStep(step + 1)}>
                {step === 2 ? "Confirm Payment" : "Continue"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Payment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {[
                { label: "Booking deposit paid", date: "Mar 19", done: true },
                { label: "Down payment due", date: "Mar 28", done: false },
                { label: "Final payment due", date: "Apr 5", done: false },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border border-border/20">
                  <div className={`w-3 h-3 rounded-full border-2 ${t.done ? "border-chart-1 bg-chart-1" : "border-border"}`} />
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-foreground">{t.label}</div>
                    <div className="text-[9px] text-muted-foreground">{t.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3">
              <Shield className="h-4 w-4 text-chart-1 mb-1" />
              <div className="text-xs font-bold text-foreground">Transaction Protection</div>
              <div className="space-y-1 mt-2 text-[9px] text-muted-foreground">
                <p>✓ Funds held in licensed escrow</p>
                <p>✓ Document verification required</p>
                <p>✓ Buyer protection guarantee</p>
                <p>✓ Dispute resolution support</p>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full text-xs h-9">
            <Phone className="h-3.5 w-3.5 mr-1" /> Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurePaymentEscrowFlow;
