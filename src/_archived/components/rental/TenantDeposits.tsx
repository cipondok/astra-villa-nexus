import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, Clock, CheckCircle, ShieldAlert, ArrowDownCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Price from "@/components/ui/Price";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Bayar", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  held: { label: "Ditahan (Escrow)", color: "bg-primary/10 text-primary border-primary/20", icon: Wallet },
  partially_released: { label: "Sebagian Dirilis", color: "bg-chart-5/10 text-chart-5 border-chart-5/20", icon: ArrowDownCircle },
  released: { label: "Dirilis", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  disputed: { label: "Sengketa", color: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  refunded: { label: "Dikembalikan", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: ArrowDownCircle },
};

const TenantDeposits = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [payDialog, setPayDialog] = useState<any>(null);
  const [disputeDialog, setDisputeDialog] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["deposit-escrows", "tenant", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deposit_escrows" as any)
        .select("*")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const handlePay = async () => {
    if (!payDialog || !paymentRef.trim()) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("deposit_escrows" as any)
        .update({
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentRef.trim(),
        })
        .eq("id", payDialog.id);
      if (error) throw error;
      showSuccess("Berhasil", "Pembayaran deposit berhasil dicatat");
      setPayDialog(null);
      setPaymentRef("");
      queryClient.invalidateQueries({ queryKey: ["deposit-escrows"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeDialog || !disputeReason.trim()) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("deposit_escrows" as any)
        .update({
          escrow_status: "disputed",
          dispute_reason: disputeReason.trim(),
        })
        .eq("id", disputeDialog.id);
      if (error) throw error;
      showSuccess("Berhasil", "Sengketa deposit berhasil diajukan");
      setDisputeDialog(null);
      setDisputeReason("");
      queryClient.invalidateQueries({ queryKey: ["deposit-escrows"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (deposits.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Deposit</h3>
          <p className="text-sm text-muted-foreground">Deposit Anda akan muncul di sini.</p>
        </div>
      </Card>
    );
  }

  const totalHeld = deposits.filter((d: any) => d.escrow_status === "held").reduce((s: number, d: any) => s + Number(d.deposit_amount), 0);
  const totalRefund = deposits.reduce((s: number, d: any) => s + Number(d.refund_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Ditahan Escrow</p>
          <p className="text-sm font-bold text-primary"><Price amount={totalHeld} /></p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Total Refund</p>
          <p className="text-sm font-bold text-chart-1"><Price amount={totalRefund} /></p>
        </Card>
      </div>

      {/* Deposit list */}
      <div className="space-y-3">
        {deposits.map((dep: any) => {
          const st = statusConfig[dep.escrow_status] || statusConfig.pending;
          const StatusIcon = st.icon;
          const canPay = dep.escrow_status === "pending" && !dep.paid_at;
          const canDispute = ["partially_released", "released"].includes(dep.escrow_status) && dep.deduction_amount > 0;

          return (
            <Card key={dep.id} className="p-4 border-border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground"><Price amount={dep.deposit_amount} /></p>
                  <p className="text-[10px] text-muted-foreground">Booking: {dep.booking_id.slice(0, 8)}...</p>
                </div>
                <Badge className={`${st.color} text-[10px] border`}>
                  <StatusIcon className="h-3 w-3 mr-0.5" /> {st.label}
                </Badge>
              </div>

              {dep.paid_at && (
                <p className="text-[10px] text-chart-1 mb-1">
                  ✓ Dibayar {new Date(dep.paid_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  {dep.payment_method && ` via ${dep.payment_method.replace("_", " ")}`}
                </p>
              )}

              {dep.deduction_amount > 0 && (
                <div className="bg-destructive/5 rounded-md p-2 text-xs mb-2">
                  <span className="font-medium text-destructive">Potongan: <Price amount={dep.deduction_amount} /></span>
                  {dep.deduction_reason && <p className="text-muted-foreground text-[10px] mt-0.5">{dep.deduction_reason}</p>}
                </div>
              )}

              {dep.refund_amount > 0 && (
                <div className="bg-chart-1/5 rounded-md p-2 text-xs mb-2">
                  <span className="font-medium text-chart-1">Refund: <Price amount={dep.refund_amount} /></span>
                </div>
              )}

              {dep.dispute_reason && (
                <div className="bg-destructive/5 rounded-md p-2 text-xs mb-2">
                  <AlertTriangle className="h-3 w-3 inline mr-1 text-destructive" />
                  <span className="text-destructive">Sengketa: {dep.dispute_reason}</span>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                {canPay && (
                  <Button size="sm" className="text-xs h-7" onClick={() => setPayDialog(dep)}>
                    Bayar Deposit
                  </Button>
                )}
                {canDispute && (
                  <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => setDisputeDialog(dep)}>
                    Ajukan Sengketa
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground mt-2">
                {new Date(dep.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Pay Dialog */}
      <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Bayar Deposit</DialogTitle></DialogHeader>
          {payDialog && (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Jumlah Deposit</p>
                <p className="text-lg font-bold text-foreground"><Price amount={payDialog.deposit_amount} /></p>
              </div>
              <div>
                <Label>Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="cash">Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nomor Referensi</Label>
                <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="No. transfer / referensi" required />
              </div>
              <Button className="w-full" onClick={handlePay} disabled={processing || !paymentRef.trim()}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Konfirmasi Pembayaran
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={!!disputeDialog} onOpenChange={() => setDisputeDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Ajukan Sengketa Deposit</DialogTitle></DialogHeader>
          {disputeDialog && (
            <div className="space-y-3">
              <div className="bg-destructive/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Potongan yang disengketakan</p>
                <p className="text-lg font-bold text-destructive"><Price amount={disputeDialog.deduction_amount} /></p>
                {disputeDialog.deduction_reason && <p className="text-xs text-muted-foreground mt-1">{disputeDialog.deduction_reason}</p>}
              </div>
              <div>
                <Label>Alasan Sengketa</Label>
                <Textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} placeholder="Jelaskan mengapa Anda tidak setuju..." rows={3} required />
              </div>
              <Button variant="destructive" className="w-full" onClick={handleDispute} disabled={processing || !disputeReason.trim()}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Kirim Sengketa
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantDeposits;
