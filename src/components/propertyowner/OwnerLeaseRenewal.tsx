import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, CheckCircle, XCircle, Send, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { formatIDR } from "@/utils/currency";
import { differenceInDays, format, addDays } from "date-fns";

interface ExpiringBooking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  base_price: number;
  total_days: number;
  booking_status: string;
  customer_id: string;
  property_id: string;
  properties: { title: string } | null;
}

const statusColors: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  accepted: { label: "Diterima", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const OwnerLeaseRenewal = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [renewalDialog, setRenewalDialog] = useState<ExpiringBooking | null>(null);
  const [proposedDays, setProposedDays] = useState("30");
  const [proposedPrice, setProposedPrice] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");

  // Fetch expiring bookings (within 30 days)
  const { data: expiringBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["expiring-bookings", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const ids = properties.map(p => p.id);
      const now = new Date().toISOString().split("T")[0];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + 30);
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, check_in_date, check_out_date, total_amount, base_price, total_days, booking_status, customer_id, property_id, properties(title)")
        .in("property_id", ids)
        .in("booking_status", ["confirmed", "pending"])
        .gte("check_out_date", now)
        .lte("check_out_date", cutoff.toISOString().split("T")[0])
        .order("check_out_date", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as ExpiringBooking[];
    },
    enabled: !!user,
  });

  // Fetch existing renewal requests
  const { data: renewals = [], isLoading: renewalsLoading } = useQuery({
    queryKey: ["renewal-requests", "owner", user?.id],
    queryFn: async () => {
      const { data: properties } = await supabase.from("properties").select("id").eq("owner_id", user!.id);
      if (!properties?.length) return [];
      const ids = properties.map(p => p.id);
      const { data, error } = await supabase
        .from("renewal_requests" as any)
        .select("*")
        .in("property_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const sendRenewal = useMutation({
    mutationFn: async () => {
      if (!renewalDialog || !user) throw new Error("Missing data");
      const startDate = renewalDialog.check_out_date;
      const endDate = format(addDays(new Date(startDate), parseInt(proposedDays)), "yyyy-MM-dd");
      const { error } = await supabase.from("renewal_requests" as any).insert([{
        booking_id: renewalDialog.id,
        property_id: renewalDialog.property_id,
        tenant_id: renewalDialog.customer_id,
        initiated_by: "owner",
        proposed_start_date: startDate,
        proposed_end_date: endDate,
        proposed_price: parseFloat(proposedPrice) || renewalDialog.base_price,
        original_price: renewalDialog.base_price,
        owner_notes: ownerNotes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Penawaran perpanjangan berhasil dikirim ke penyewa");
      queryClient.invalidateQueries({ queryKey: ["renewal-requests"] });
      setRenewalDialog(null);
      setProposedDays("30");
      setProposedPrice("");
      setOwnerNotes("");
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const isLoading = bookingsLoading || renewalsLoading;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const renewedBookingIds = new Set(renewals.map((r: any) => r.booking_id));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Akan Berakhir</p>
          <p className="text-xl font-bold text-chart-3">{expiringBookings.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Penawaran Dikirim</p>
          <p className="text-xl font-bold text-primary">{renewals.filter((r: any) => r.status === "pending").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Diperpanjang</p>
          <p className="text-xl font-bold text-chart-1">{renewals.filter((r: any) => r.status === "accepted").length}</p>
        </Card>
      </div>

      {/* Expiring Bookings */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-chart-3" /> Sewa Akan Berakhir
        </h3>
        {expiringBookings.length === 0 ? (
          <Card className="p-6 border-border text-center">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Tidak ada sewa yang akan berakhir dalam 30 hari ke depan</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {expiringBookings.map(b => {
              const daysLeft = differenceInDays(new Date(b.check_out_date), new Date());
              const hasRenewal = renewedBookingIds.has(b.id);
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
                      <p className="text-[10px] text-primary font-medium mt-0.5">{formatIDR(b.total_amount)}</p>
                    </div>
                    {hasRenewal ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] border">
                        <Send className="h-2.5 w-2.5 mr-0.5" /> Terkirim
                      </Badge>
                    ) : (
                      <Button size="sm" className="h-7 text-[10px]" onClick={() => {
                        setProposedPrice(String(b.base_price || b.total_amount));
                        setRenewalDialog(b);
                      }}>
                        <RotateCcw className="h-3 w-3 mr-1" /> Perpanjang
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Renewal Requests History */}
      {renewals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Riwayat Penawaran</h3>
          <div className="space-y-2">
            {renewals.map((r: any) => {
              const st = statusColors[r.status] || statusColors.pending;
              const StIcon = st.icon;
              return (
                <Card key={r.id} className="p-3 border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground font-medium">
                        {r.proposed_start_date} → {r.proposed_end_date}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatIDR(r.proposed_price)}</p>
                      {r.tenant_response && <p className="text-[10px] text-muted-foreground mt-0.5">"{r.tenant_response}"</p>}
                    </div>
                    <Badge className={`${st.color} text-[9px] border`}>
                      <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Renewal Dialog */}
      <Dialog open={!!renewalDialog} onOpenChange={(o) => !o && setRenewalDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Tawarkan Perpanjangan Sewa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{renewalDialog?.properties?.title}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Durasi (hari)</Label>
                <Input value={proposedDays} onChange={e => setProposedDays(e.target.value)} type="number" min="1" />
              </div>
              <div>
                <Label className="text-xs">Harga (IDR)</Label>
                <Input value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} type="number" min="0" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Catatan (opsional)</Label>
              <Textarea value={ownerNotes} onChange={e => setOwnerNotes(e.target.value)} placeholder="Pesan untuk penyewa..." rows={2} />
            </div>
            <Button className="w-full" onClick={() => sendRenewal.mutate()} disabled={sendRenewal.isPending}>
              {sendRenewal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kirim Penawaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerLeaseRenewal;
