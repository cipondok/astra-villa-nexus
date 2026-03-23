import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Upload, MessageSquare, Shield, FileText, Clock } from "lucide-react";
import { useDealTransactions, DEAL_STATE_LABELS, DEAL_STATE_COLORS, type DealState } from "@/hooks/useDealTransactions";
import { format } from "date-fns";

const SellerDealManagementPanel = () => {
  const { deals, isLoading, transitionDeal } = useDealTransactions("seller");

  const activeDealCount = deals.filter((d: any) => !["completed", "cancelled"].includes(d.deal_status)).length;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">Loading deals...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: deals.length, icon: FileText },
          { label: "Active", value: activeDealCount, icon: Clock },
          { label: "Completed", value: deals.filter((d: any) => d.deal_status === "completed").length, icon: CheckCircle },
          { label: "Total Value", value: `IDR ${(deals.reduce((s: number, d: any) => s + (Number(d.agreed_price) || 0), 0) / 1e9).toFixed(1)}B`, icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incoming">Incoming ({deals.filter((d: any) => d.deal_status === "inquiry_submitted").length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({deals.filter((d: any) => !["inquiry_submitted", "completed", "cancelled"].includes(d.deal_status)).length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({deals.filter((d: any) => ["completed", "cancelled"].includes(d.deal_status)).length})</TabsTrigger>
        </TabsList>

        {["incoming", "in-progress", "closed"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {deals
              .filter((d: any) => {
                if (tab === "incoming") return d.deal_status === "inquiry_submitted";
                if (tab === "in-progress") return !["inquiry_submitted", "completed", "cancelled"].includes(d.deal_status);
                return ["completed", "cancelled"].includes(d.deal_status);
              })
              .map((deal: any) => (
                <Card key={deal.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Deal #{deal.id.slice(0, 8)}</CardTitle>
                      <Badge className={DEAL_STATE_COLORS[deal.deal_status as DealState] || "bg-muted"}>
                        {DEAL_STATE_LABELS[deal.deal_status as DealState] || deal.deal_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-semibold">{deal.currency} {deal.agreed_price?.toLocaleString() || "TBD"}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Deposit</p>
                        <p className="text-sm font-semibold">{deal.currency} {deal.deposit_amount?.toLocaleString() || "—"}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm font-semibold">{format(new Date(deal.created_at), "dd MMM yy")}</p>
                      </div>
                    </div>

                    {/* Escrow status */}
                    {deal.escrow_id && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Shield className="h-3.5 w-3.5" />
                        Escrow Active — Ref: {deal.escrow_account_reference || deal.escrow_id.slice(0, 8)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {deal.deal_status === "inquiry_submitted" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => transitionDeal.mutate({ deal_id: deal.id, target_state: "negotiation_active", reason: "Seller accepted inquiry" })}
                            disabled={transitionDeal.isPending}
                            className="gap-1.5"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accept & Negotiate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => transitionDeal.mutate({ deal_id: deal.id, target_state: "cancelled", reason: "Seller rejected" })}
                            disabled={transitionDeal.isPending}
                            className="gap-1.5"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}

                      {deal.deal_status === "legal_due_diligence" && (
                        <Button size="sm" variant="outline" className="gap-1.5" disabled>
                          <Upload className="h-3.5 w-3.5" />
                          Upload Legal Docs
                        </Button>
                      )}

                      <Button size="sm" variant="ghost" className="gap-1.5 ml-auto">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message Buyer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {deals.filter((d: any) => {
              if (tab === "incoming") return d.deal_status === "inquiry_submitted";
              if (tab === "in-progress") return !["inquiry_submitted", "completed", "cancelled"].includes(d.deal_status);
              return ["completed", "cancelled"].includes(d.deal_status);
            }).length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No deals in this category
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SellerDealManagementPanel;
