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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Plus, Send, CheckCircle, Clock, XCircle, Loader2,
  PenTool, Eye, AlertTriangle, Calendar
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Price from "@/components/ui/Price";

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: FileText },
  sent: { label: "Dikirim", color: "bg-primary/10 text-primary border-primary/20", icon: Send },
  owner_signed: { label: "Ditandatangani Owner", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: PenTool },
  fully_signed: { label: "Aktif", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  expired: { label: "Kadaluarsa", color: "bg-muted text-muted-foreground border-border", icon: Clock },
  cancelled: { label: "Dibatalkan", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

interface LeaseContract {
  id: string;
  booking_id: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  contract_number: string;
  contract_title: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  late_fee_percentage: number;
  terms_and_conditions: string | null;
  special_clauses: string | null;
  property_condition_notes: string | null;
  status: string;
  owner_signed_at: string | null;
  tenant_signed_at: string | null;
  sent_at: string | null;
  created_at: string;
  properties?: { title: string } | null;
  tenant_profile?: { full_name: string | null } | null;
}

interface BookingOption {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  base_price: number;
  customer_id: string;
  property_id: string;
  properties: { title: string } | null;
  customer: { full_name: string | null } | null;
}

const DEFAULT_TERMS = `PERJANJIAN SEWA MENYEWA

Pasal 1 - Objek Sewa
Pihak Pertama (Pemilik) menyewakan properti kepada Pihak Kedua (Penyewa) sesuai dengan ketentuan dalam perjanjian ini.

Pasal 2 - Jangka Waktu
Jangka waktu sewa dimulai dari tanggal yang tercantum dan berakhir pada tanggal yang telah disepakati.

Pasal 3 - Harga Sewa & Pembayaran
Penyewa wajib membayar biaya sewa setiap bulan sebelum tanggal jatuh tempo yang telah ditentukan.

Pasal 4 - Deposit
Deposit akan dikembalikan setelah masa sewa berakhir dan properti dalam kondisi baik.

Pasal 5 - Kewajiban Penyewa
- Menjaga kebersihan dan ketertiban properti
- Tidak mengubah struktur bangunan tanpa izin
- Melaporkan kerusakan segera kepada pemilik

Pasal 6 - Kewajiban Pemilik
- Menyediakan properti dalam kondisi layak huni
- Melakukan perbaikan besar yang bukan disebabkan penyewa
- Memberikan akses yang wajar kepada penyewa

Pasal 7 - Ketentuan Lain
Hal-hal yang belum diatur dalam perjanjian ini akan diselesaikan secara musyawarah.`;

const OwnerLeaseContracts = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [viewContract, setViewContract] = useState<LeaseContract | null>(null);
  const [form, setForm] = useState({
    bookingId: "",
    contractTitle: "Perjanjian Sewa Menyewa",
    monthlyRent: "",
    depositAmount: "",
    paymentDueDay: "1",
    lateFee: "5",
    terms: DEFAULT_TERMS,
    specialClauses: "",
    conditionNotes: "",
  });

  // Fetch contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["lease-contracts-owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lease_contracts" as any)
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch property titles and tenant names
      const enriched = await Promise.all((data || []).map(async (c: any) => {
        const [{ data: prop }, { data: tenant }] = await Promise.all([
          supabase.from("properties").select("title").eq("id", c.property_id).single(),
          supabase.from("profiles").select("full_name").eq("id", c.tenant_id).single(),
        ]);
        return { ...c, properties: prop, tenant_profile: tenant };
      }));
      return enriched as LeaseContract[];
    },
    enabled: !!user,
  });

  // Fetch eligible bookings for contract creation
  const { data: bookings = [] } = useQuery({
    queryKey: ["owner-bookings-for-contract", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const ids = properties.map(p => p.id);
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, check_in_date, check_out_date, total_amount, base_price, customer_id, property_id, properties(title)")
        .in("property_id", ids)
        .in("booking_status", ["confirmed", "pending"])
        .order("check_in_date", { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all((data || []).map(async (b: any) => {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", b.customer_id).single();
        return { ...b, customer: profile };
      }));
      return enriched as BookingOption[];
    },
    enabled: !!user && createDialog,
  });

  const createContract = useMutation({
    mutationFn: async () => {
      const booking = bookings.find(b => b.id === form.bookingId);
      if (!booking || !user) throw new Error("Pilih booking terlebih dahulu");

      const { error } = await supabase.from("lease_contracts" as any).insert([{
        booking_id: booking.id,
        property_id: booking.property_id,
        owner_id: user.id,
        tenant_id: booking.customer_id,
        contract_title: form.contractTitle,
        start_date: booking.check_in_date,
        end_date: booking.check_out_date,
        monthly_rent: parseFloat(form.monthlyRent) || booking.base_price,
        deposit_amount: parseFloat(form.depositAmount) || 0,
        payment_due_day: parseInt(form.paymentDueDay) || 1,
        late_fee_percentage: parseFloat(form.lateFee) || 5,
        terms_and_conditions: form.terms,
        special_clauses: form.specialClauses || null,
        property_condition_notes: form.conditionNotes || null,
        status: "draft",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Kontrak berhasil dibuat sebagai draft");
      queryClient.invalidateQueries({ queryKey: ["lease-contracts-owner"] });
      setCreateDialog(false);
      resetForm();
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const signContract = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase
        .from("lease_contracts" as any)
        .update({
          owner_signed_at: new Date().toISOString(),
          status: "owner_signed",
        })
        .eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Kontrak berhasil ditandatangani");
      queryClient.invalidateQueries({ queryKey: ["lease-contracts-owner"] });
      setViewContract(null);
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const sendContract = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase
        .from("lease_contracts" as any)
        .update({ sent_at: new Date().toISOString(), status: "sent" })
        .eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Kontrak berhasil dikirim ke penyewa");
      queryClient.invalidateQueries({ queryKey: ["lease-contracts-owner"] });
      setViewContract(null);
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const resetForm = () => {
    setForm({
      bookingId: "",
      contractTitle: "Perjanjian Sewa Menyewa",
      monthlyRent: "",
      depositAmount: "",
      paymentDueDay: "1",
      lateFee: "5",
      terms: DEFAULT_TERMS,
      specialClauses: "",
      conditionNotes: "",
    });
  };

  const activeContracts = contracts.filter(c => ["draft", "sent", "owner_signed"].includes(c.status));
  const completedContracts = contracts.filter(c => ["fully_signed", "expired", "cancelled"].includes(c.status));

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Draft</p>
          <p className="text-xl font-bold text-foreground">{contracts.filter(c => c.status === "draft").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Menunggu Tanda Tangan</p>
          <p className="text-xl font-bold text-chart-3">{contracts.filter(c => ["sent", "owner_signed"].includes(c.status)).length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Aktif</p>
          <p className="text-xl font-bold text-chart-1">{contracts.filter(c => c.status === "fully_signed").length}</p>
        </Card>
      </div>

      {/* Create Button */}
      <Button size="sm" className="gap-1" onClick={() => setCreateDialog(true)}>
        <Plus className="h-3.5 w-3.5" /> Buat Kontrak Baru
      </Button>

      {/* Contract Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1 text-xs">Aktif ({activeContracts.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs">Selesai ({completedContracts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-3 space-y-2">
          {activeContracts.length === 0 ? (
            <Card className="p-6 border-border text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Belum ada kontrak aktif</p>
            </Card>
          ) : activeContracts.map(c => <ContractCard key={c.id} contract={c} onView={() => setViewContract(c)} />)}
        </TabsContent>

        <TabsContent value="completed" className="mt-3 space-y-2">
          {completedContracts.length === 0 ? (
            <Card className="p-6 border-border text-center">
              <p className="text-xs text-muted-foreground">Belum ada kontrak selesai</p>
            </Card>
          ) : completedContracts.map(c => <ContractCard key={c.id} contract={c} onView={() => setViewContract(c)} />)}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Buat Kontrak Sewa Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Pilih Booking</Label>
              <Select value={form.bookingId} onValueChange={v => {
                const b = bookings.find(x => x.id === v);
                setForm(prev => ({
                  ...prev,
                  bookingId: v,
                  monthlyRent: String(b?.base_price || ""),
                }));
              }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih booking..." />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map(b => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.properties?.title} — {b.customer?.full_name || "Tenant"} ({b.check_in_date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Judul Kontrak</Label>
              <Input value={form.contractTitle} onChange={e => setForm(p => ({ ...p, contractTitle: e.target.value }))} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Sewa Bulanan (IDR)</Label>
                <Input value={form.monthlyRent} onChange={e => setForm(p => ({ ...p, monthlyRent: e.target.value }))} type="number" className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Deposit (IDR)</Label>
                <Input value={form.depositAmount} onChange={e => setForm(p => ({ ...p, depositAmount: e.target.value }))} type="number" className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tgl Jatuh Tempo</Label>
                <Input value={form.paymentDueDay} onChange={e => setForm(p => ({ ...p, paymentDueDay: e.target.value }))} type="number" min="1" max="28" className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Denda Telat (%)</Label>
                <Input value={form.lateFee} onChange={e => setForm(p => ({ ...p, lateFee: e.target.value }))} type="number" className="h-9 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Syarat & Ketentuan</Label>
              <Textarea value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} rows={6} className="text-xs" />
            </div>
            <div>
              <Label className="text-xs">Klausul Khusus (opsional)</Label>
              <Textarea value={form.specialClauses} onChange={e => setForm(p => ({ ...p, specialClauses: e.target.value }))} rows={2} className="text-xs" placeholder="Ketentuan tambahan..." />
            </div>
            <div>
              <Label className="text-xs">Catatan Kondisi Properti (opsional)</Label>
              <Textarea value={form.conditionNotes} onChange={e => setForm(p => ({ ...p, conditionNotes: e.target.value }))} rows={2} className="text-xs" placeholder="Kondisi properti saat ini..." />
            </div>
            <Button className="w-full" onClick={() => createContract.mutate()} disabled={!form.bookingId || createContract.isPending}>
              {createContract.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buat Kontrak (Draft)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={!!viewContract} onOpenChange={o => !o && setViewContract(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {viewContract?.contract_title} — {viewContract?.contract_number}
            </DialogTitle>
          </DialogHeader>
          {viewContract && (
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {/* Contract Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Properti</p>
                    <p className="text-xs font-medium text-foreground">{viewContract.properties?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Penyewa</p>
                    <p className="text-xs font-medium text-foreground">{viewContract.tenant_profile?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Periode</p>
                    <p className="text-xs text-foreground">{viewContract.start_date} → {viewContract.end_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Sewa Bulanan</p>
                    <p className="text-xs font-medium text-primary"><Price amount={viewContract.monthly_rent} /></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Deposit</p>
                    <p className="text-xs text-foreground"><Price amount={viewContract.deposit_amount} /></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Jatuh Tempo</p>
                    <p className="text-xs text-foreground">Tanggal {viewContract.payment_due_day} setiap bulan</p>
                  </div>
                </div>

                {/* Terms */}
                {viewContract.terms_and_conditions && (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">Syarat & Ketentuan</p>
                    <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {viewContract.terms_and_conditions}
                    </div>
                  </div>
                )}

                {viewContract.special_clauses && (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">Klausul Khusus</p>
                    <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap">
                      {viewContract.special_clauses}
                    </div>
                  </div>
                )}

                {/* Signature Status */}
                <div className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-foreground">Status Tanda Tangan</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Owner:</span>
                    {viewContract.owner_signed_at ? (
                      <span className="text-xs text-chart-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {format(new Date(viewContract.owner_signed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum ditandatangani</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Penyewa:</span>
                    {viewContract.tenant_signed_at ? (
                      <span className="text-xs text-chart-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {format(new Date(viewContract.tenant_signed_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum ditandatangani</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {viewContract.status === "draft" && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => signContract.mutate(viewContract.id)} disabled={signContract.isPending}>
                        <PenTool className="h-3 w-3" /> Tandatangani
                      </Button>
                      <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => sendContract.mutate(viewContract.id)} disabled={sendContract.isPending}>
                        <Send className="h-3 w-3" /> Kirim ke Penyewa
                      </Button>
                    </>
                  )}
                  {viewContract.status === "sent" && !viewContract.owner_signed_at && (
                    <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => signContract.mutate(viewContract.id)} disabled={signContract.isPending}>
                      <PenTool className="h-3 w-3" /> Tandatangani
                    </Button>
                  )}
                  {viewContract.status === "owner_signed" && (
                    <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => sendContract.mutate(viewContract.id)} disabled={sendContract.isPending}>
                      <Send className="h-3 w-3" /> Kirim ke Penyewa
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ContractCard = ({ contract, onView }: { contract: LeaseContract; onView: () => void }) => {
  const st = statusMap[contract.status] || statusMap.draft;
  const StIcon = st.icon;

  return (
    <Card className="p-3 border-border cursor-pointer hover:bg-muted/30 transition-colors" onClick={onView}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-foreground line-clamp-1">{contract.properties?.title || "Properti"}</h4>
            <Badge className={`${st.color} text-[9px] border`}>
              <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span>{contract.contract_number}</span>
            <span>•</span>
            <span>{contract.tenant_profile?.full_name || "Penyewa"}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
            <span className="text-muted-foreground flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" /> {contract.start_date} → {contract.end_date}
            </span>
            <span className="text-primary font-medium"><Price amount={contract.monthly_rent} short />/bln</span>
          </div>
        </div>
        <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
};

export default OwnerLeaseContracts;
