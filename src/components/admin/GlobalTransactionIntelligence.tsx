import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Shield, AlertTriangle, Globe, TrendingUp, CheckCircle, Clock, Gavel, BarChart3, PieChart } from "lucide-react";
import { PieChart as RePie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DEAL_STATE_LABELS, DEAL_STATE_COLORS, type DealState } from "@/hooks/useDealTransactions";

const CHART_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6"];

const GlobalTransactionIntelligence = () => {
  const [stats, setStats] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveNotes, setResolveNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: statsData } = await supabase.functions.invoke("deal-transaction-engine", { body: { action: "deal_stats" } });
      setStats(statsData);

      const { data: dealsData } = await supabase.from("deal_transactions" as any).select("*").order("created_at", { ascending: false }).limit(50);
      setDeals((dealsData as any[]) || []);

      const { data: disputeData } = await supabase.from("deal_disputes" as any).select("*").order("created_at", { ascending: false }).limit(50);
      setDisputes((disputeData as any[]) || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resolveDispute = async (disputeId: string, resolution: string, refundAmount?: number) => {
    await supabase.functions.invoke("deal-engine", {
      body: { action: "resolve_dispute", dispute_id: disputeId, resolution, notes: resolveNotes, refund_amount: refundAmount },
    });
    setResolveNotes("");
    fetchData();
  };

  const statusPieData = stats?.by_status
    ? Object.entries(stats.by_status).map(([name, value]) => ({ name: DEAL_STATE_LABELS[name as DealState] || name, value }))
    : [];

  const countryBarData = stats?.by_country
    ? Object.entries(stats.by_country).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">Loading intelligence...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Deals", value: stats?.total_deals || 0, icon: BarChart3, color: "text-primary" },
          { label: "Active Deals", value: stats?.active_deals || 0, icon: Clock, color: "text-amber-400" },
          { label: "Completed", value: stats?.completed_deals || 0, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Escrow Volume", value: `IDR ${((stats?.total_escrow_volume || 0) / 1e9).toFixed(1)}B`, icon: DollarSign, color: "text-cyan-400" },
          { label: "Dispute Rate", value: `${stats?.dispute_ratio || 0}%`, icon: AlertTriangle, color: "text-rose-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">All Deals</TabsTrigger>
          <TabsTrigger value="disputes">Disputes ({disputes.filter((d: any) => ["open", "under_review"].includes(d.status)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><PieChart className="h-4 w-4" /> Deal Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RePie>
                      <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {statusPieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Country distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Cross-Border Investment Flow</CardTitle>
              </CardHeader>
              <CardContent>
                {countryBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={countryBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-3">
          {deals.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No deals found</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {deals.map((deal: any) => (
                <Card key={deal.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium">#{deal.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">Property: {deal.property_id?.slice(0, 8)}</p>
                      </div>
                      <Badge className={DEAL_STATE_COLORS[deal.deal_status as DealState] || "bg-muted"} variant="secondary">
                        {DEAL_STATE_LABELS[deal.deal_status as DealState] || deal.deal_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{deal.currency} {deal.agreed_price?.toLocaleString() || "—"}</span>
                      <Badge variant="outline">{deal.country_origin || "ID"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-3">
          {disputes.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No disputes</CardContent></Card>
          ) : (
            disputes.map((dispute: any) => (
              <Card key={dispute.id} className={dispute.status === "open" ? "border-rose-500/30" : ""}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-rose-400" />
                      <span className="text-sm font-medium">Dispute #{dispute.id.slice(0, 8)}</span>
                      <Badge variant={dispute.status === "open" ? "destructive" : "secondary"}>{dispute.status}</Badge>
                    </div>
                    <Badge variant="outline">{dispute.dispute_type}</Badge>
                  </div>
                  {dispute.description && <p className="text-sm text-muted-foreground">{dispute.description}</p>}
                  {dispute.escrow_frozen && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <Shield className="h-3 w-3" /> Escrow Frozen
                    </div>
                  )}

                  {["open", "under_review"].includes(dispute.status) && (
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">Resolve</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Resolve Dispute</DialogTitle></DialogHeader>
                          <div className="space-y-3">
                            <Textarea placeholder="Resolution notes..." value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => resolveDispute(dispute.id, "refund")} variant="destructive">Full Refund</Button>
                              <Button size="sm" onClick={() => resolveDispute(dispute.id, "release")}>Release Funds</Button>
                              <Button size="sm" onClick={() => resolveDispute(dispute.id, "partial")} variant="outline">Partial</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalTransactionIntelligence;
