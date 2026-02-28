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
import { CalendarPlus, Clock, CheckCircle, XCircle, Loader2, Send, MessageSquare, ArrowRight } from "lucide-react";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { format, addDays, differenceInDays } from "date-fns";

interface ActiveBooking {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  base_price: number;
  total_amount: number;
  total_days: number;
  booking_status: string;
  properties: { title: string; owner_id: string } | null;
}

const statusColors: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu Owner", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  approved: { label: "Disetujui", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  counter: { label: "Counter Offer", color: "bg-primary/10 text-primary border-primary/20", icon: MessageSquare },
};

const TenantLeaseExtension = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [requestDialog, setRequestDialog] = useState<ActiveBooking | null>(null);
  const [extensionDays, setExtensionDays] = useState("30");
  const [proposedPrice, setProposedPrice] = useState("");
  const [tenantNotes, setTenantNotes] = useState("");

  // Fetch active bookings
  const { data: activeBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["tenant-active-bookings-extension", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, property_id, check_in_date, check_out_date, base_price, total_amount, total_days, booking_status, properties(title, owner_id)")
        .eq("customer_id", user!.id)
        .in("booking_status", ["confirmed", "pending"])
        .order("check_out_date", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as ActiveBooking[];
    },
    enabled: !!user,
  });

  // Fetch extension requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["lease-extension-requests", "tenant", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lease_extension_requests" as any)
        .select("*")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      if (!requestDialog || !user) throw new Error("Data tidak lengkap");
      const ownerId = (requestDialog.properties as any)?.owner_id;
      if (!ownerId) throw new Error("Owner tidak ditemukan");
      const requestedEndDate = format(addDays(new Date(requestDialog.check_out_date), parseInt(extensionDays)), "yyyy-MM-dd");
      const { error } = await supabase.from("lease_extension_requests" as any).insert([{
        booking_id: requestDialog.id,
        property_id: requestDialog.property_id,
        tenant_id: user.id,
        owner_id: ownerId,
        current_end_date: requestDialog.check_out_date,
        requested_end_date: requestedEndDate,
        current_price: requestDialog.base_price || requestDialog.total_amount,
        proposed_price: parseFloat(proposedPrice) || requestDialog.base_price,
        tenant_notes: tenantNotes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Permintaan perpanjangan sewa berhasil dikirim ke pemilik properti");
      queryClient.invalidateQueries({ queryKey: ["lease-extension-requests"] });
      setRequestDialog(null);
      setExtensionDays("30");
      setProposedPrice("");
      setTenantNotes("");
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const respondToCounter = useMutation({
    mutationFn: async ({ id, accepted }: { id: string; accepted: boolean }) => {
      const { error } = await supabase
        .from("lease_extension_requests" as any)
        .update({ status: accepted ? "approved" : "rejected", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { accepted }) => {
      showSuccess("Berhasil", accepted ? "Counter offer diterima" : "Counter offer ditolak");
      queryClient.invalidateQueries({ queryKey: ["lease-extension-requests"] });
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const isLoading = bookingsLoading || requestsLoading;
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const requestedBookingIds = new Set(requests.filter((r: any) => r.status === "pending").map((r: any) => r.booking_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <CalendarPlus className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Ajukan Perpanjangan Sewa</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Booking Aktif</p>
          <p className="text-xl font-bold text-primary">{activeBookings.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="text-xl font-bold text-chart-3">{requests.filter((r: any) => r.status === "pending").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Disetujui</p>
          <p className="text-xl font-bold text-chart-1">{requests.filter((r: any) => r.status === "approved").length}</p>
        </Card>
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2">Booking yang Dapat Diperpanjang</h4>
          <div className="space-y-2">
            {activeBookings.map(b => {
              const daysLeft = differenceInDays(new Date(b.check_out_date), new Date());
              const hasPending = requestedBookingIds.has(b.id);
              return (
                <Card key={b.id} className="p-3 border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">{b.properties?.title || "Properti"}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>Berakhir: {b.check_out_date}</span>
                        <Badge className={`text-[9px] border ${daysLeft <= 7 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-chart-3/10 text-chart-3 border-chart-3/20"}`}>
                          {daysLeft} hari lagi
                        </Badge>
                      </div>
                      <p className="text-[10px] text-primary font-medium mt-0.5"><Price amount={b.total_amount} short /></p>
                    </div>
                    {hasPending ? (
                      <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-[9px] border">
                        <Clock className="h-2.5 w-2.5 mr-0.5" /> Menunggu
                      </Badge>
                    ) : (
                      <Button size="sm" className="h-7 text-[10px]" onClick={() => {
                        setProposedPrice(String(b.base_price || b.total_amount));
                        setRequestDialog(b);
                      }}>
                        <CalendarPlus className="h-3 w-3 mr-1" /> Perpanjang
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Extension Requests History */}
      {requests.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2">Riwayat Permintaan</h4>
          <div className="space-y-2">
            {requests.map((r: any) => {
              const st = statusColors[r.status] || statusColors.pending;
              const StIcon = st.icon;
              const isCounter = r.status === "counter";
              return (
                <Card key={r.id} className="p-3 border-border">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <span>{r.current_end_date}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-primary">{r.requested_end_date}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Harga diajukan: <Price amount={r.proposed_price} short />
                        {r.current_price !== r.proposed_price && (
                          <span className="line-through ml-1"><Price amount={r.current_price} short /></span>
                        )}
                      </p>
                    </div>
                    <Badge className={`${st.color} text-[9px] border`}>
                      <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                    </Badge>
                  </div>
                  {r.tenant_notes && (
                    <p className="text-[10px] text-muted-foreground">Catatan: "{r.tenant_notes}"</p>
                  )}
                  {r.owner_response_notes && (
                    <div className="bg-muted/50 rounded-md p-2 text-[10px] text-foreground mt-2">
                      <span className="font-medium">Respon owner: </span>{r.owner_response_notes}
                    </div>
                  )}
                  {isCounter && (
                    <div className="border-t border-border mt-2 pt-2 space-y-2">
                      <div className="text-[10px] text-foreground">
                        <span className="font-medium">Counter: </span>
                        {r.counter_end_date && <span>sampai {r.counter_end_date}, </span>}
                        {r.counter_price && <span className="text-primary font-semibold"><Price amount={r.counter_price} short /></span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-7 text-[10px]" onClick={() => respondToCounter.mutate({ id: r.id, accepted: true })} disabled={respondToCounter.isPending}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Terima
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => respondToCounter.mutate({ id: r.id, accepted: false })} disabled={respondToCounter.isPending}>
                          <XCircle className="h-3 w-3 mr-1" /> Tolak
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeBookings.length === 0 && requests.length === 0 && (
        <Card className="p-8 border-border text-center">
          <CalendarPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Tidak Ada Booking Aktif</h3>
          <p className="text-xs text-muted-foreground">Anda perlu memiliki booking aktif untuk mengajukan perpanjangan sewa.</p>
        </Card>
      )}

      {/* Request Dialog */}
      <Dialog open={!!requestDialog} onOpenChange={(o) => !o && setRequestDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Ajukan Perpanjangan Sewa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-md p-2.5">
              <p className="text-xs font-medium text-foreground">{requestDialog?.properties?.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Berakhir: {requestDialog?.check_out_date}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tambah (hari)</Label>
                <Input value={extensionDays} onChange={e => setExtensionDays(e.target.value)} type="number" min="1" className="mt-1" />
                {requestDialog && extensionDays && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sampai: {format(addDays(new Date(requestDialog.check_out_date), parseInt(extensionDays) || 0), "dd MMM yyyy")}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs">Harga diajukan (IDR)</Label>
                <Input value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} type="number" min="0" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Catatan untuk pemilik (opsional)</Label>
              <Textarea value={tenantNotes} onChange={e => setTenantNotes(e.target.value)} placeholder="Alasan perpanjangan, negosiasi harga, dll..." rows={2} className="mt-1" />
            </div>
            <Button className="w-full" onClick={() => submitRequest.mutate()} disabled={submitRequest.isPending}>
              {submitRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-3.5 w-3.5 mr-1.5" /> Kirim Permintaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantLeaseExtension;
