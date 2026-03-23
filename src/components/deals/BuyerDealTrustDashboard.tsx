import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, Clock, AlertTriangle, Upload, Headphones, FileText, TrendingUp } from "lucide-react";
import { useDealTransactions, DEAL_STATES, DEAL_STATE_LABELS, DEAL_STATE_COLORS, type DealState } from "@/hooks/useDealTransactions";
import { format } from "date-fns";

const STAGE_ORDER = DEAL_STATES.filter(s => !["cancelled", "dispute_open"].includes(s));

const getProgress = (status: string) => {
  const idx = STAGE_ORDER.indexOf(status as any);
  return idx >= 0 ? Math.round(((idx + 1) / STAGE_ORDER.length) * 100) : 0;
};

const BuyerDealTrustDashboard = () => {
  const { deals, isLoading, transitionDeal, raiseDispute } = useDealTransactions("buyer");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeType, setDisputeType] = useState("general");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your deals...</div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No Active Deals</p>
          <p className="text-sm text-muted-foreground">Your property deals will appear here once initiated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trust header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <Shield className="h-6 w-6 text-emerald-400" />
        <div>
          <p className="font-semibold text-foreground">ASTRA Secure Transaction Protection</p>
          <p className="text-xs text-muted-foreground">Your funds are protected by multi-stage escrow verification</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deals ({deals.filter((d: any) => !["completed", "cancelled"].includes(d.deal_status)).length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({deals.filter((d: any) => d.deal_status === "completed").length})</TabsTrigger>
          <TabsTrigger value="all">All ({deals.length})</TabsTrigger>
        </TabsList>

        {["active", "completed", "all"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {deals
              .filter((d: any) => {
                if (tab === "active") return !["completed", "cancelled"].includes(d.deal_status);
                if (tab === "completed") return d.deal_status === "completed";
                return true;
              })
              .map((deal: any) => (
                <Card key={deal.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Deal #{deal.id.slice(0, 8)}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {format(new Date(deal.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge className={DEAL_STATE_COLORS[deal.deal_status as DealState] || "bg-muted"}>
                        {DEAL_STATE_LABELS[deal.deal_status as DealState] || deal.deal_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Deal Progress</span>
                        <span>{getProgress(deal.deal_status)}%</span>
                      </div>
                      <Progress value={getProgress(deal.deal_status)} className="h-2" />
                      <div className="flex justify-between">
                        {STAGE_ORDER.map((stage, i) => {
                          const currentIdx = STAGE_ORDER.indexOf(deal.deal_status);
                          const isPast = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={stage} className="flex flex-col items-center gap-1" style={{ width: `${100 / STAGE_ORDER.length}%` }}>
                              <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "bg-primary ring-2 ring-primary/30" : isPast ? "bg-emerald-500" : "bg-muted"}`} />
                              <span className={`text-[9px] text-center leading-tight ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                {DEAL_STATE_LABELS[stage]?.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deal info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Agreed Price</p>
                        <p className="text-sm font-semibold">{deal.currency} {deal.agreed_price?.toLocaleString() || "—"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Deposit</p>
                        <p className="text-sm font-semibold">{deal.currency} {deal.deposit_amount?.toLocaleString() || "—"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Currency</p>
                        <p className="text-sm font-semibold">{deal.currency}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Origin</p>
                        <p className="text-sm font-semibold">{deal.country_origin || "ID"}</p>
                      </div>
                    </div>

                    {/* Escrow badge */}
                    {deal.deal_status === "deposit_secured_escrow" && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400 font-medium">Deposit secured in escrow</span>
                      </div>
                    )}

                    {/* Deposit deadline */}
                    {deal.deal_status === "reservation_pending_payment" && deal.deposit_deadline && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-amber-400">
                          Deposit deadline: {format(new Date(deal.deposit_deadline), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {deal.deal_status === "deposit_secured_escrow" && (
                        <Button size="sm" variant="outline" className="gap-1.5" disabled>
                          <Upload className="h-3.5 w-3.5" />
                          Upload Documents
                        </Button>
                      )}

                      {!["completed", "cancelled", "dispute_open"].includes(deal.deal_status) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Raise Dispute
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Raise a Dispute</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={disputeType} onValueChange={setDisputeType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fraud">Fraud</SelectItem>
                                  <SelectItem value="misrepresentation">Misrepresentation</SelectItem>
                                  <SelectItem value="non_delivery">Non-Delivery</SelectItem>
                                  <SelectItem value="payment">Payment Issue</SelectItem>
                                  <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea
                                placeholder="Describe the issue..."
                                value={disputeDesc}
                                onChange={(e) => setDisputeDesc(e.target.value)}
                              />
                              <Button
                                className="w-full"
                                variant="destructive"
                                onClick={() => {
                                  raiseDispute.mutate({
                                    deal_id: deal.id,
                                    dispute_type: disputeType,
                                    description: disputeDesc,
                                  });
                                }}
                                disabled={raiseDispute.isPending}
                              >
                                {raiseDispute.isPending ? "Submitting..." : "Submit Dispute"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button size="sm" variant="ghost" className="gap-1.5 ml-auto">
                        <Headphones className="h-3.5 w-3.5" />
                        Concierge Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BuyerDealTrustDashboard;
