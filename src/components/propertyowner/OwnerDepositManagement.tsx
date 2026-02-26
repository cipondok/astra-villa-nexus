import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, Clock, CheckCircle, ShieldAlert, ArrowDownCircle, Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatIDR } from "@/utils/currency";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Bayar", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  held: { label: "Ditahan (Escrow)", color: "bg-primary/10 text-primary border-primary/20", icon: Wallet },
  partially_released: { label: "Sebagian Dirilis", color: "bg-chart-5/10 text-chart-5 border-chart-5/20", icon: ArrowDownCircle },
  released: { label: "Dirilis", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  disputed: { label: "Sengketa", color: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  refunded: { label: "Dikembalikan", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: ArrowDownCircle },
};

const OwnerDepositManagement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [releaseDialog, setReleaseDialog] = useState<any>(null);
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionReason, setDeductionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["deposit-escrows", "owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deposit_escrows" as any)
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Get bookings without deposits for creation
  const { data: bookingsWithoutDeposit = [] } = useQuery({
    queryKey: ["bookings-no-deposit", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const propIds = properties.map(p => p.id);
      const { data: bookings } = await supabase
        .from("rental_bookings" as any)
        .select("id, property_id, customer_id, deposit_amount, booking_status")
        .in("property_id", propIds)
        .in("booking_status", ["confirmed", "active"]);
      if (!bookings?.length) return [];
      const existingBookingIds = deposits.map((d: any) => d.booking_id);
      return (bookings as any[]).filter(b => !existingBookingIds.includes(b.id) && b.deposit_amount > 0);
    },
    enabled: !!user && deposits !== undefined,
  });

  const handleCreateDeposit = async () => {
    if (!selectedBooking || !depositAmount) return;
    setProcessing(true);
    try {
      const booking = bookingsWithoutDeposit.find((b: any) => b.id === selectedBooking);
      if (!booking) throw new Error("Booking tidak ditemukan");
      const { error } = await supabase.from("deposit_escrows" as any).insert([{
        booking_id: booking.id,
        property_id: booking.property_id,
        tenant_id: booking.customer_id,
        owner_id: user!.id,
        deposit_amount: Number(depositAmount),
        escrow_status: "pending",
      }]);
      if (error) throw error;
      showSuccess("Berhasil", "Deposit escrow berhasil dibuat");
      setCreateDialog(false);
      setSelectedBooking("");
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["deposit-escrows"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkHeld = async (id: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("deposit_escrows" as any)
        .update({ escrow_status: "held", held_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      showSuccess("Berhasil", "Deposit ditandai sebagai ditahan (escrow)");
      queryClient.invalidateQueries({ queryKey: ["deposit-escrows"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRelease = async () => {
    if (!releaseDialog) return;
    setProcessing(true);
    try {
      const deduct = Number(deductionAmount) || 0;
      const refund = releaseDialog.deposit_amount - deduct;
      const { error } = await supabase
        .from("deposit_escrows" as any)
        .update({
          escrow_status: deduct > 0 ? "partially_released" : "released",
          released_at: new Date().toISOString(),
          released_amount: releaseDialog.deposit_amount,
          deduction_amount: deduct,
          deduction_reason: deductionReason || null,
          refund_amount: refund,
          release_requested_at: new Date().toISOString(),
        })
        .eq("id", releaseDialog.id);
      if (error) throw error;
      showSuccess("Berhasil", `Deposit dirilis. Refund: ${formatIDR(refund)}`);
      setReleaseDialog(null);
      setDeductionAmount("");
      setDeductionReason("");
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

  const heldTotal = deposits.filter((d: any) => d.escrow_status === "held").reduce((sum: number, d: any) => sum + Number(d.deposit_amount), 0);
  const pendingCount = deposits.filter((d: any) => d.escrow_status === "pending").length;
  const disputeCount = deposits.filter((d: any) => d.escrow_status === "disputed").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Ditahan</p>
          <p className="text-sm font-bold text-primary">{formatIDR(heldTotal)}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="text-xl font-bold text-chart-3">{pendingCount}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Sengketa</p>
          <p className="text-xl font-bold text-destructive">{disputeCount}</p>
        </Card>
      </div>

      {/* Create button */}
      {bookingsWithoutDeposit.length > 0 && (
        <Button size="sm" className="w-full" onClick={() => setCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Buat Deposit Escrow
        </Button>
      )}

      {/* Deposit list */}
      {deposits.length === 0 ? (
        <Card className="p-8 border-border">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Deposit</h3>
            <p className="text-sm text-muted-foreground">Deposit escrow akan muncul saat ada booking dengan deposit.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {deposits.map((dep: any) => {
            const st = statusConfig[dep.escrow_status] || statusConfig.pending;
            const StatusIcon = st.icon;
            const canHold = dep.escrow_status === "pending" && dep.paid_at;
            const canRelease = dep.escrow_status === "held";

            return (
              <Card key={dep.id} className="p-4 border-border">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{formatIDR(dep.deposit_amount)}</p>
                    <p className="text-[10px] text-muted-foreground">Booking: {dep.booking_id.slice(0, 8)}...</p>
                  </div>
                  <Badge className={`${st.color} text-[10px] border`}>
                    <StatusIcon className="h-3 w-3 mr-0.5" /> {st.label}
                  </Badge>
                </div>

                {dep.deduction_amount > 0 && (
                  <div className="bg-destructive/5 rounded-md p-2 text-xs mb-2">
                    <span className="font-medium text-destructive">Potongan: {formatIDR(dep.deduction_amount)}</span>
                    {dep.deduction_reason && <p className="text-muted-foreground text-[10px] mt-0.5">{dep.deduction_reason}</p>}
                  </div>
                )}

                {dep.refund_amount > 0 && (
                  <div className="bg-chart-1/5 rounded-md p-2 text-xs mb-2">
                    <span className="font-medium text-chart-1">Refund: {formatIDR(dep.refund_amount)}</span>
                  </div>
                )}

                {dep.dispute_reason && (
                  <div className="bg-destructive/5 rounded-md p-2 text-xs mb-2">
                    <AlertTriangle className="h-3 w-3 inline mr-1 text-destructive" />
                    <span className="text-destructive">{dep.dispute_reason}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  {canHold && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleMarkHeld(dep.id)} disabled={processing}>
                      Tandai Ditahan
                    </Button>
                  )}
                  {canRelease && (
                    <Button size="sm" className="text-xs h-7" onClick={() => setReleaseDialog(dep)} disabled={processing}>
                      Rilis Deposit
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
      )}

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Buat Deposit Escrow</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Booking</Label>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                <SelectContent>
                  {bookingsWithoutDeposit.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.id.slice(0, 8)}... — {formatIDR(b.deposit_amount)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah Deposit</Label>
              <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0" />
            </div>
            <Button className="w-full" onClick={handleCreateDeposit} disabled={processing || !selectedBooking || !depositAmount}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Buat Escrow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={!!releaseDialog} onOpenChange={() => setReleaseDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Rilis Deposit</DialogTitle></DialogHeader>
          {releaseDialog && (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Deposit</p>
                <p className="text-lg font-bold text-foreground">{formatIDR(releaseDialog.deposit_amount)}</p>
              </div>
              <div>
                <Label>Potongan (kerusakan, dll)</Label>
                <Input type="number" value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} placeholder="0" max={releaseDialog.deposit_amount} />
              </div>
              {Number(deductionAmount) > 0 && (
                <div>
                  <Label>Alasan Potongan</Label>
                  <Textarea value={deductionReason} onChange={e => setDeductionReason(e.target.value)} placeholder="Jelaskan kerusakan..." rows={2} />
                </div>
              )}
              <div className="bg-chart-1/5 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Refund ke Tenant</p>
                <p className="text-lg font-bold text-chart-1">{formatIDR(releaseDialog.deposit_amount - (Number(deductionAmount) || 0))}</p>
              </div>
              <Button className="w-full" onClick={handleRelease} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Konfirmasi Rilis
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDepositManagement;
