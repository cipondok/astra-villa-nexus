import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Eye, Send, MessageSquare, CheckCircle, FileText, DollarSign,
  Home, Clock, AlertTriangle, User, ArrowRight, Target
} from "lucide-react";

const stages = [
  { label: "Viewing Completed", icon: Eye, done: true, date: "Mar 18", party: "Buyer + Agent" },
  { label: "Offer Submitted", icon: Send, done: true, date: "Mar 19", party: "Buyer" },
  { label: "Negotiation Ongoing", icon: MessageSquare, done: true, date: "Mar 20–22", party: "All Parties" },
  { label: "Offer Accepted", icon: CheckCircle, done: true, date: "Mar 22", party: "Seller" },
  { label: "Legal Verification", icon: FileText, done: false, date: "Est. Mar 25", party: "Legal Team", current: true },
  { label: "Payment / Escrow", icon: DollarSign, done: false, date: "Est. Mar 28", party: "Buyer" },
  { label: "Transaction Closing", icon: Home, done: false, date: "Est. Apr 1", party: "All Parties" },
];

const pendingActions = [
  { text: "Upload property title certificate", party: "Seller", urgency: "high" },
  { text: "Complete KYC verification", party: "Buyer", urgency: "medium" },
  { text: "Schedule notary appointment", party: "Agent", urgency: "low" },
];

const activeDeals = [
  { id: "D-447", property: "Villa Seminyak", stage: 4, of: 7, days: 8, value: "Rp 4.1B" },
  { id: "D-451", property: "Apt Canggu", stage: 2, of: 7, days: 3, value: "Rp 1.8B" },
  { id: "D-455", property: "Beach House", stage: 3, of: 7, days: 5, value: "Rp 8.2B" },
];

const urgencyColor = (u: string) =>
  u === "high" ? "bg-destructive/15 text-destructive border-destructive/30" :
  u === "medium" ? "bg-chart-3/15 text-chart-3 border-chart-3/30" :
  "bg-primary/15 text-primary border-primary/30";

const DealProgressTimeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Deal Progress Timeline
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Transaction journey visibility for all parties</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">3 Active Deals</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Active Deals", value: "3" },
          { label: "Avg Duration", value: "18 days" },
          { label: "On Schedule", value: "67%" },
          { label: "At Risk", value: "1" },
          { label: "Closing This Week", value: "1" },
          { label: "Pipeline Value", value: "Rp 14.1B" },
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
        {/* Timeline */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Deal #D-447 — Modern Villa Seminyak</CardTitle>
                <Badge variant="secondary" className="text-[9px]">Est. 10 days to close</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {stages.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 mb-1 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        s.done ? "border-chart-1 bg-chart-1/15" :
                        s.current ? "border-primary bg-primary/15 ring-2 ring-primary/20" :
                        "border-border bg-muted/30"
                      }`}>
                        <s.icon className={`h-4 w-4 ${s.done ? "text-chart-1" : s.current ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {i < stages.length - 1 && (
                        <div className={`w-0.5 h-8 ${s.done ? "bg-chart-1" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`flex-1 pb-3 ${s.current ? "bg-primary/5 -mx-1 px-2 py-1.5 rounded-lg border border-primary/20" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${s.done || s.current ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                        {s.current && <Badge className="bg-primary/15 text-primary text-[7px]">Current</Badge>}
                        {s.done && <CheckCircle className="h-3 w-3 text-chart-1" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{s.date}
                        </span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5" />{s.party}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Overall Progress</span><span>57%</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-3" /> Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {pendingActions.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border/30">
                    <CardContent className="p-2.5 flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[11px] text-foreground">{a.text}</p>
                        <span className="text-[9px] text-muted-foreground">Assigned: {a.party}</span>
                      </div>
                      <Badge className={`${urgencyColor(a.urgency)} text-[8px]`}>{a.urgency}</Badge>
                      <Button size="sm" variant="outline" className="h-6 text-[9px]">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs">All Active Deals</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {activeDeals.map((d, i) => (
                <Card key={d.id} className="border-border/30 cursor-pointer hover:bg-muted/10 transition-colors">
                  <CardContent className="p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-foreground">{d.id}</span>
                      <Badge variant="secondary" className="text-[8px]">Stage {d.stage}/{d.of}</Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{d.property}</div>
                    <div className="text-xs font-bold text-primary mt-0.5">{d.value}</div>
                    <Progress value={(d.stage / d.of) * 100} className="h-1 mt-1.5" />
                    <div className="text-[8px] text-muted-foreground mt-0.5">{d.days} days elapsed</div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <Clock className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Closing Estimate</div>
              <div className="text-2xl font-bold text-primary mt-1">10 days</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Based on current deal velocity</div>
              <Progress value={57} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealProgressTimeline;
