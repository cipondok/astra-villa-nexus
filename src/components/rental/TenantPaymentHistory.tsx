import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Receipt, CheckCircle, Clock, XCircle, Loader2, Download, Filter,
  Calendar, CreditCard, FileText, Eye
} from "lucide-react";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  unpaid: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive", icon: Clock },
  paid: { label: "Lunas", color: "bg-chart-1/10 text-chart-1", icon: CheckCircle },
  overdue: { label: "Terlambat", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const typeLabels: Record<string, string> = {
  rent: "Sewa", deposit: "Deposit", utility: "Utilitas",
  maintenance: "Perbaikan", penalty: "Denda", other: "Lainnya",
};

const methodLabels: Record<string, string> = {
  bank_transfer: "Transfer Bank", ewallet: "E-Wallet", cash: "Tunai", qris: "QRIS",
};

const TenantPaymentHistory = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [receiptDialog, setReceiptDialog] = useState<any>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["tenant-payment-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_invoices" as any)
        .select("*, properties(title)")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const filtered = invoices.filter((inv: any) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (filterType !== "all" && inv.invoice_type !== filterType) return false;
    return true;
  });

  const totalPaid = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
  const totalUnpaid = invoices.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
  const thisMonth = invoices.filter((i: any) => {
    const d = new Date(i.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && i.status === "paid";
  }).reduce((s: number, i: any) => s + (i.total_amount || 0), 0);

  const exportCSV = () => {
    const headers = ["No Invoice", "Tanggal", "Tipe", "Deskripsi", "Jumlah", "Status", "Metode", "Referensi"];
    const rows = filtered.map((inv: any) => [
      inv.invoice_number,
      inv.created_at ? format(new Date(inv.created_at), "dd/MM/yyyy") : "",
      typeLabels[inv.invoice_type] || inv.invoice_type,
      inv.description || "",
      inv.total_amount,
      inv.status,
      methodLabels[inv.payment_method] || inv.payment_method || "",
      inv.payment_reference || "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-pembayaran-${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Riwayat Pembayaran</h2>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="h-3 w-3 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5">
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Total Dibayar</p>
          <p className="text-xs font-bold text-chart-1"><Price amount={totalPaid} short /></p>
        </Card>
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Belum Dibayar</p>
          <p className="text-xs font-bold text-destructive"><Price amount={totalUnpaid} short /></p>
        </Card>
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Bulan Ini</p>
          <p className="text-xs font-bold text-primary"><Price amount={thisMonth} short /></p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-3 w-3 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-7 text-[10px] w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
            <SelectItem value="paid" className="text-xs">Lunas</SelectItem>
            <SelectItem value="unpaid" className="text-xs">Belum Bayar</SelectItem>
            <SelectItem value="overdue" className="text-xs">Terlambat</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-7 text-[10px] w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Semua Tipe</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-[9px]">{filtered.length} transaksi</Badge>
      </div>

      {/* Payment List */}
      {filtered.length === 0 ? (
        <Card className="p-6 text-center">
          <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs font-medium">Tidak ada riwayat pembayaran</p>
          <p className="text-[10px] text-muted-foreground">Riwayat transaksi Anda akan muncul di sini</p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((inv: any) => {
            const st = statusConfig[inv.status] || statusConfig.unpaid;
            const StIcon = st.icon;
            return (
              <Card key={inv.id} className="p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${st.color}`}>
                    <StIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-semibold text-foreground truncate">{inv.invoice_number}</p>
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">{typeLabels[inv.invoice_type] || inv.invoice_type}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate">{inv.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {inv.created_at ? format(new Date(inv.created_at), "dd MMM yyyy", { locale: idLocale }) : "-"}
                      </span>
                      {inv.properties?.title && (
                        <span className="text-[8px] text-muted-foreground truncate">{inv.properties.title}</span>
                      )}
                      {inv.payment_method && (
                        <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                          <CreditCard className="h-2.5 w-2.5" />
                          {methodLabels[inv.payment_method] || inv.payment_method}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-foreground"><Price amount={inv.total_amount} /></p>
                    <Badge className={`text-[7px] px-1 py-0 ${st.color}`}>{st.label}</Badge>
                  </div>
                  {inv.status === "paid" && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => setReceiptDialog(inv)}>
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={!!receiptDialog} onOpenChange={(o) => !o && setReceiptDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Bukti Pembayaran
            </DialogTitle>
          </DialogHeader>
          {receiptDialog && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-primary/5 to-chart-1/5 rounded-xl p-4 border border-border">
                <div className="text-center mb-3">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-chart-1/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-chart-1" />
                  </div>
                  <p className="text-xs font-semibold text-chart-1">Pembayaran Berhasil</p>
                </div>
                
                <div className="space-y-2">
                  {[
                    { label: "No. Invoice", value: receiptDialog.invoice_number },
                    { label: "Deskripsi", value: receiptDialog.description },
                    { label: "Tipe", value: typeLabels[receiptDialog.invoice_type] || receiptDialog.invoice_type },
                    { label: "Properti", value: receiptDialog.properties?.title || "-" },
                    { label: "Subtotal", value: getCurrencyFormatter()(receiptDialog.base_amount || receiptDialog.total_amount) },
                    ...(receiptDialog.tax_amount > 0 ? [{ label: "Pajak", value: getCurrencyFormatter()(receiptDialog.tax_amount) }] : []),
                    ...(receiptDialog.service_charge_amount > 0 ? [{ label: "Service Charge", value: getCurrencyFormatter()(receiptDialog.service_charge_amount) }] : []),
                    { label: "Total", value: getCurrencyFormatter()(receiptDialog.total_amount) },
                    { label: "Metode", value: methodLabels[receiptDialog.payment_method] || receiptDialog.payment_method || "-" },
                    ...(receiptDialog.payment_reference ? [{ label: "Referensi", value: receiptDialog.payment_reference }] : []),
                    { label: "Tanggal Bayar", value: receiptDialog.paid_at ? format(new Date(receiptDialog.paid_at), "dd MMMM yyyy, HH:mm", { locale: idLocale }) : "-" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      <span className={`text-[10px] font-medium text-foreground ${item.label === "Total" ? "text-sm font-bold text-primary" : ""}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-[9px] text-center text-muted-foreground">
                Bukti pembayaran ini dihasilkan secara otomatis oleh sistem ASTRA Villa
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantPaymentHistory;
