import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign, Shield, AlertTriangle, Clock, CheckCircle, Ban,
  ArrowUpDown, Wallet, TrendingUp, RefreshCw, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const EscrowFinancialDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ledgerRes, payoutRes, webhookRes, eventRes, dealRes, commRes] = await Promise.all([
        supabase.from("escrow_ledger_entries" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("escrow_payout_queue" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("payment_webhook_logs" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("escrow_system_events" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("deal_transactions" as any).select("id, escrow_status, deal_status, agreed_price, deposit_amount, currency, funds_received_at, funds_released_at"),
        supabase.from("transaction_commissions" as any).select("settlement_status, platform_amount, agent_amount, total_commission, currency"),
      ]);

      setLedger((ledgerRes.data as any[]) || []);
      setPayouts((payoutRes.data as any[]) || []);
      setWebhooks((webhookRes.data as any[]) || []);
      setEvents((eventRes.data as any[]) || []);

      const deals = (dealRes.data as any[]) || [];
      const comms = (commRes.data as any[]) || [];

      const escrowFunded = deals.filter(d => ["funded", "ready_for_release"].includes(d.escrow_status));
      const totalHeld = escrowFunded.reduce((s, d) => s + Number(d.deposit_amount || 0), 0);
      const pendingPayouts = (payoutRes.data as any[] || []).filter(p => p.status === "pending");
      const frozenDeals = deals.filter(d => d.escrow_status === "frozen");
      const lockedComms = comms.filter(c => c.settlement_status === "locked_in_escrow");
      const settledComms = comms.filter(c => c.settlement_status === "settled");
      const totalPlatformRev = settledComms.reduce((s, c) => s + Number(c.platform_amount || 0), 0);
      const expiredDeals = deals.filter(d => d.deal_status === "cancelled");

      setMetrics({
        totalEscrowHeld: totalHeld,
        pendingPayouts: pendingPayouts.length,
        pendingPayoutAmount: pendingPayouts.reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
        frozenEscrows: frozenDeals.length,
        lockedCommissions: lockedComms.reduce((s: number, c: any) => s + Number(c.total_commission || 0), 0),
        dailyPlatformRevenue: totalPlatformRev,
        expiredDeposits: expiredDeals.length,
        webhookCount: (webhookRes.data as any[] || []).length,
        ledgerEntries: (ledgerRes.data as any[] || []).length,
        escrowStatusDist: Object.entries(
          deals.reduce((acc: Record<string, number>, d: any) => {
            acc[d.escrow_status || "none"] = (acc[d.escrow_status || "none"] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, value]) => ({ name, value })),
        commissionDist: [
          { name: "Locked", value: lockedComms.length },
          { name: "Settled", value: settledComms.length },
          { name: "Pending", value: comms.filter(c => c.settlement_status === "pending").length },
        ].filter(d => (d.value as number) > 0),
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const fmt = (n: number) => `IDR ${(n / 1e6).toFixed(1)}M`;

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">Loading financial data...</div></div>;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Escrow Held", value: fmt(metrics?.totalEscrowHeld || 0), icon: Wallet, cls: "text-emerald-400" },
          { label: "Pending Payouts", value: metrics?.pendingPayouts || 0, icon: Clock, cls: "text-amber-400" },
          { label: "Payout Amount", value: fmt(metrics?.pendingPayoutAmount || 0), icon: ArrowUpDown, cls: "text-cyan-400" },
          { label: "Frozen Escrows", value: metrics?.frozenEscrows || 0, icon: Ban, cls: "text-rose-400" },
          { label: "Locked Commission", value: fmt(metrics?.lockedCommissions || 0), icon: Shield, cls: "text-purple-400" },
          { label: "Platform Revenue", value: fmt(metrics?.dailyPlatformRevenue || 0), icon: TrendingUp, cls: "text-primary" },
          { label: "Expired Deposits", value: metrics?.expiredDeposits || 0, icon: AlertTriangle, cls: "text-orange-400" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3.5 w-3.5 ${cls}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
              <p className="text-sm font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ledger">Ledger ({ledger.length})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Escrow Status Distribution</CardTitle></CardHeader>
              <CardContent>
                {(metrics?.escrowStatusDist?.length || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={metrics.escrowStatusDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" /> Commission Settlement</CardTitle></CardHeader>
              <CardContent>
                {(metrics?.commissionDist?.length || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={metrics.commissionDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }: any) => `${name}: ${value}`}>
                        {metrics.commissionDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data</div>}
              </CardContent>
            </Card>
          </div>

          {/* Reconciliation alerts */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Reconciliation Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(metrics?.frozenEscrows || 0) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded bg-rose-500/10 text-rose-400 text-sm">
                    <AlertTriangle className="h-4 w-4" /> {metrics.frozenEscrows} escrow(s) frozen due to disputes
                  </div>
                )}
                {(metrics?.pendingPayouts || 0) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-amber-400 text-sm">
                    <Clock className="h-4 w-4" /> {metrics.pendingPayouts} payout(s) awaiting processing
                  </div>
                )}
                {(metrics?.frozenEscrows || 0) === 0 && (metrics?.pendingPayouts || 0) === 0 && (
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 text-emerald-400 text-sm">
                    <CheckCircle className="h-4 w-4" /> All systems reconciled — no alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-2">
          {ledger.map((entry: any) => (
            <Card key={entry.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{entry.account_type}</Badge>
                  <span className="text-sm">{entry.entry_reason}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {Number(entry.debit_amount) > 0 && <span className="text-rose-400">-{fmt(Number(entry.debit_amount))}</span>}
                  {Number(entry.credit_amount) > 0 && <span className="text-emerald-400">+{fmt(Number(entry.credit_amount))}</span>}
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM dd HH:mm")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {ledger.length === 0 && <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No ledger entries</CardContent></Card>}
        </TabsContent>

        <TabsContent value="payouts" className="space-y-2">
          {payouts.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-[10px]">{p.status}</Badge>
                  <span className="text-sm">{p.recipient_type} — {p.payout_type}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium">{fmt(Number(p.amount || 0))}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM dd HH:mm")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {payouts.length === 0 && <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No payouts</CardContent></Card>}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-2">
          {webhooks.map((w: any) => (
            <Card key={w.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={w.processing_status === "processed" ? "default" : w.processing_status === "duplicate" ? "secondary" : "destructive"} className="text-[10px]">{w.processing_status || "received"}</Badge>
                  <span className="text-sm">{w.gateway || "—"} • {w.event_type}</span>
                  {w.signature_valid && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(w.created_at), "MMM dd HH:mm")}</span>
              </CardContent>
            </Card>
          ))}
          {webhooks.length === 0 && <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No webhook logs</CardContent></Card>}
        </TabsContent>

        <TabsContent value="events" className="space-y-2">
          {events.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{e.event_type}</Badge>
                  <span className="text-xs text-muted-foreground">by {e.triggered_by}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), "MMM dd HH:mm")}</span>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No events</CardContent></Card>}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={fetchAll} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>
    </div>
  );
};

export default EscrowFinancialDashboard;
