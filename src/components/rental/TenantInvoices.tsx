import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, CheckCircle, Clock, XCircle, Loader2, CreditCard, DollarSign, Download, FileText } from "lucide-react";
import { formatIDR } from "@/utils/currency";
import { generateInvoicePdf } from "@/utils/invoicePdfGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  unpaid: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock },
  paid: { label: "Lunas", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  overdue: { label: "Terlambat", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const typeLabels: Record<string, string> = {
  rent: "Sewa", deposit: "Deposit", utility: "Utilitas",
  maintenance: "Perbaikan", penalty: "Denda", other: "Lainnya",
};

const paymentMethods = [
  { value: "bank_transfer", label: "Transfer Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "cash", label: "Tunai" },
  { value: "qris", label: "QRIS" },
];

const TenantInvoices = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [payDialog, setPayDialog] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentRef, setPaymentRef] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["tenant-invoices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_invoices" as any)
        .select("*")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const confirmPayment = useMutation({
    mutationFn: async () => {
      if (!payDialog) throw new Error("No invoice");
      const { error } = await supabase
        .from("rental_invoices" as any)
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentRef.trim() || null,
        })
        .eq("id", payDialog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Pembayaran dikonfirmasi");
      queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      setPayDialog(null);
      setPaymentRef("");
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const unpaidInvoices = invoices.filter((i: any) => i.status === "unpaid");
  const paidInvoices = invoices.filter((i: any) => i.status === "paid");
  const unpaidTotal = unpaidInvoices.reduce((s: number, i: any) => s + (i.total_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Total Invoice</p>
          <p className="text-xl font-bold text-primary">{invoices.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Belum Bayar</p>
          <p className="text-sm font-bold text-destructive">{formatIDR(unpaidTotal)}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Lunas</p>
          <p className="text-xl font-bold text-chart-1">{paidInvoices.length}</p>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8 border-border text-center">
          <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Tidak Ada Invoice</h3>
          <p className="text-xs text-muted-foreground">Invoice dari pemilik properti akan muncul di sini.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Unpaid first */}
          {unpaidInvoices.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Perlu Dibayar ({unpaidInvoices.length})
              </h3>
              {unpaidInvoices.map((inv: any) => (
                <Card key={inv.id} className="p-3 border-border border-destructive/20 mb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{inv.invoice_number}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.description}</p>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 mt-1">{typeLabels[inv.invoice_type] || inv.invoice_type}</Badge>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] border">
                      <Clock className="h-2.5 w-2.5 mr-0.5" /> Belum Bayar
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-bold text-primary">{formatIDR(inv.total_amount)}</p>
                      {inv.tax_amount > 0 && <p className="text-[10px] text-muted-foreground">Termasuk pajak {formatIDR(inv.tax_amount)}</p>}
                      <p className="text-[10px] text-destructive">Jatuh tempo: {inv.due_date}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => generateInvoicePdf(inv)}>
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                      <Button size="sm" className="h-8 text-xs" onClick={() => setPayDialog(inv)}>
                        <CreditCard className="h-3 w-3 mr-1" /> Bayar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Paid history */}
          {paidInvoices.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-chart-1" /> Riwayat Pembayaran ({paidInvoices.length})
              </h3>
              {paidInvoices.map((inv: any) => (
                <Card key={inv.id} className="p-3 border-border mb-2">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{inv.invoice_number}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-chart-1">{formatIDR(inv.total_amount)}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(inv.paid_at).toLocaleDateString("id-ID")}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => generateInvoicePdf(inv, true)}>
                        <Download className="h-3 w-3 mr-0.5" /> Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={!!payDialog} onOpenChange={(o) => !o && setPayDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Konfirmasi Pembayaran</DialogTitle>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">{payDialog.invoice_number}</p>
                <p className="text-sm font-medium text-foreground">{payDialog.description}</p>
                <p className="text-lg font-bold text-primary">{formatIDR(payDialog.total_amount)}</p>
              </div>
              <div>
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Referensi Pembayaran</Label>
                <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Nomor transaksi / bukti transfer" maxLength={100} />
              </div>
              <Button className="w-full" onClick={() => confirmPayment.mutate()} disabled={confirmPayment.isPending}>
                {confirmPayment.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Konfirmasi Pembayaran
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantInvoices;
