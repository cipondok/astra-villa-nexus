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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, Plus, Loader2, CheckCircle, Clock, XCircle, DollarSign, Send } from "lucide-react";
import { formatIDR } from "@/utils/currency";
import { format, addDays } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  unpaid: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20", icon: Clock },
  paid: { label: "Lunas", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  overdue: { label: "Terlambat", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  cancelled: { label: "Dibatalkan", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const invoiceTypes = [
  { value: "rent", label: "Sewa Bulanan" },
  { value: "deposit", label: "Deposit" },
  { value: "utility", label: "Utilitas" },
  { value: "maintenance", label: "Biaya Perbaikan" },
  { value: "penalty", label: "Denda" },
  { value: "other", label: "Lainnya" },
];

interface BookingOption {
  id: string;
  property_id: string;
  customer_id: string;
  total_amount: number;
  properties: { title: string } | null;
}

const OwnerInvoiceManagement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [invoiceType, setInvoiceType] = useState("rent");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  // Fetch owner's bookings for invoice creation
  const { data: bookings = [] } = useQuery({
    queryKey: ["owner-bookings-for-invoice", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, property_id, customer_id, total_amount, properties(title)")
        .in("property_id", properties.map(p => p.id))
        .in("booking_status", ["confirmed", "pending"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BookingOption[];
    },
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["owner-invoices", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const { data, error } = await supabase
        .from("rental_invoices" as any)
        .select("*")
        .in("property_id", properties.map(p => p.id))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const createInvoice = useMutation({
    mutationFn: async () => {
      const booking = bookings.find(b => b.id === selectedBooking);
      if (!booking || !user) throw new Error("Pilih booking");
      const amt = parseFloat(amount);
      const tax = amt * (parseFloat(taxRate) / 100);
      const total = amt + tax;
      const invNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("rental_invoices" as any).insert([{
        invoice_number: invNumber,
        booking_id: booking.id,
        property_id: booking.property_id,
        tenant_id: booking.customer_id,
        issued_by: user.id,
        invoice_type: invoiceType,
        description: description.trim(),
        amount: amt,
        tax_amount: tax,
        total_amount: total,
        due_date: dueDate,
        notes: notes.trim() || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Invoice berhasil dibuat dan dikirim ke penyewa");
      queryClient.invalidateQueries({ queryKey: ["owner-invoices"] });
      setShowForm(false);
      resetForm();
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const markPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from("rental_invoices" as any)
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Invoice ditandai lunas");
      queryClient.invalidateQueries({ queryKey: ["owner-invoices"] });
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const resetForm = () => {
    setSelectedBooking("");
    setInvoiceType("rent");
    setDescription("");
    setAmount("");
    setTaxRate("0");
    setDueDate(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    setNotes("");
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const unpaidTotal = invoices.filter((i: any) => i.status === "unpaid").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
  const paidTotal = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);

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
          <p className="text-xs text-muted-foreground">Terbayar</p>
          <p className="text-sm font-bold text-chart-1">{formatIDR(paidTotal)}</p>
        </Card>
      </div>

      <Button size="sm" onClick={() => setShowForm(true)} disabled={bookings.length === 0}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Buat Invoice
      </Button>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <Card className="p-8 border-border text-center">
          <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Belum Ada Invoice</h3>
          <p className="text-xs text-muted-foreground">Buat invoice pertama untuk penyewa Anda.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv: any) => {
            const st = statusConfig[inv.status] || statusConfig.unpaid;
            const StIcon = st.icon;
            return (
              <Card key={inv.id} className="p-3 border-border">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{inv.invoice_number}</p>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">{invoiceTypes.find(t => t.value === inv.invoice_type)?.label || inv.invoice_type}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{inv.description}</p>
                  </div>
                  <Badge className={`${st.color} text-[9px] border flex-shrink-0`}>
                    <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm font-bold text-primary">{formatIDR(inv.total_amount)}</p>
                    <p className="text-[10px] text-muted-foreground">Jatuh tempo: {inv.due_date}</p>
                  </div>
                  {inv.status === "unpaid" && (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => markPaid.mutate(inv.id)} disabled={markPaid.isPending}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Tandai Lunas
                    </Button>
                  )}
                </div>
                {inv.paid_at && (
                  <p className="text-[10px] text-chart-1 mt-1">Dibayar: {new Date(inv.paid_at).toLocaleDateString("id-ID")}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Buat Invoice Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Booking</Label>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger><SelectValue placeholder="Pilih booking..." /></SelectTrigger>
                <SelectContent>
                  {bookings.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.properties?.title || b.id.slice(0, 8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipe</Label>
                <Select value={invoiceType} onValueChange={setInvoiceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {invoiceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Jatuh Tempo</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Deskripsi</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Sewa bulan Maret 2026" required maxLength={200} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Jumlah (IDR)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000000" min="0" />
              </div>
              <div>
                <Label className="text-xs">Pajak (%)</Label>
                <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Catatan (opsional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan..." rows={2} />
            </div>
            <Button className="w-full" onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending || !selectedBooking || !amount || !description.trim()}>
              {createInvoice.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Kirim Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerInvoiceManagement;
