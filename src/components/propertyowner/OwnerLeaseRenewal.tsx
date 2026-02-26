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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, CheckCircle, XCircle, Send, Loader2, RotateCcw, AlertTriangle, CalendarPlus, MessageSquare, ArrowRight } from "lucide-react";
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
  approved: { label: "Disetujui", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  counter: { label: "Counter", color: "bg-primary/10 text-primary border-primary/20", icon: MessageSquare },
};

const OwnerLeaseRenewal = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [renewalDialog, setRenewalDialog] = useState<ExpiringBooking | null>(null);
  const [proposedDays, setProposedDays] = useState("30");
  const [proposedPrice, setProposedPrice] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [responseDialog, setResponseDialog] = useState<any>(null);
  const [responseNotes, setResponseNotes] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [counterDays, setCounterDays] = useState("");

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

  // Fetch existing owner-initiated renewal requests
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

  // Fetch tenant-initiated extension requests
  const { data: extensionRequests = [], isLoading: extensionsLoading } = useQuery({
    queryKey: ["lease-extension-requests", "owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lease_extension_requests" as any)
        .select("*")
        .eq("owner_id", user!.id)
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

  const respondExtension = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = {
        status,
        owner_response_notes: responseNotes || null,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (status === "counter") {
        if (counterPrice) updateData.counter_price = parseFloat(counterPrice);
        if (counterDays && responseDialog) {
          updateData.counter_end_date = format(addDays(new Date(responseDialog.current_end_date), parseInt(counterDays)), "yyyy-MM-dd");
        }
      }
      const { error } = await supabase
        .from("lease_extension_requests" as any)
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      const msg = status === "approved" ? "Perpanjangan disetujui" : status === "counter" ? "Counter offer dikirim" : "Perpanjangan ditolak";
      showSuccess("Berhasil", msg);
      queryClient.invalidateQueries({ queryKey: ["lease-extension-requests"] });
      setResponseDialog(null);
      setResponseNotes("");
      setCounterPrice("");
      setCounterDays("");
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const isLoading = bookingsLoading || renewalsLoading || extensionsLoading;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const renewedBookingIds = new Set(renewals.map((r: any) => r.booking_id));
  const pendingExtensions = extensionRequests.filter((r: any) => r.status === "pending");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3 border-border">
          <p className="text-[10px] text-muted-foreground">Akan Berakhir</p>
          <p className="text-lg font-bold text-chart-3">{expiringBookings.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] text-muted-foreground">Penawaran</p>
          <p className="text-lg font-bold text-primary">{renewals.filter((r: any) => r.status === "pending").length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] text-muted-foreground">Request Tenant</p>
          <p className="text-lg font-bold text-chart-5">{pendingExtensions.length}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-[10px] text-muted-foreground">Diperpanjang</p>
          <p className="text-lg font-bold text-chart-1">{renewals.filter((r: any) => r.status === "accepted").length + extensionRequests.filter((r: any) => r.status === "approved").length}</p>
        </Card>
      </div>

      <Tabs defaultValue={pendingExtensions.length > 0 ? "tenant-requests" : "owner-offers"} className="space-y-3">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="owner-offers" className="text-xs gap-1">
            <Send className="h-3 w-3" /> Penawaran Anda
          </TabsTrigger>
          <TabsTrigger value="tenant-requests" className="text-xs gap-1 relative">
            <CalendarPlus className="h-3 w-3" /> Request Tenant
            {pendingExtensions.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                {pendingExtensions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Owner Offers Tab */}
        <TabsContent value="owner-offers" className="space-y-4">
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
        </TabsContent>

        {/* Tenant Extension Requests Tab */}
        <TabsContent value="tenant-requests" className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1">
            <CalendarPlus className="h-3.5 w-3.5 text-chart-5" /> Permintaan dari Penyewa
          </h3>
          {extensionRequests.length === 0 ? (
            <Card className="p-6 border-border text-center">
              <CalendarPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Belum ada permintaan perpanjangan dari penyewa</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {extensionRequests.map((r: any) => {
                const st = statusColors[r.status] || statusColors.pending;
                const StIcon = st.icon;
                const isPending = r.status === "pending";
                return (
                  <Card key={r.id} className={`p-3 border-border ${isPending ? "ring-1 ring-chart-5/30" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <span>{r.current_end_date}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-primary">{r.requested_end_date}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Harga diajukan: <span className="font-medium text-foreground">{formatIDR(r.proposed_price)}</span>
                          {r.current_price !== r.proposed_price && (
                            <span className="line-through ml-1">{formatIDR(r.current_price)}</span>
                          )}
                        </p>
                      </div>
                      <Badge className={`${st.color} text-[9px] border`}>
                        <StIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
                      </Badge>
                    </div>
                    {r.tenant_notes && (
                      <div className="bg-muted/50 rounded-md p-2 text-[10px] text-foreground mt-1">
                        <span className="font-medium">Dari penyewa: </span>{r.tenant_notes}
                      </div>
                    )}
                    {isPending && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                        <Button size="sm" className="flex-1 h-7 text-[10px]" onClick={() => respondExtension.mutate({ id: r.id, status: "approved" })} disabled={respondExtension.isPending}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Setujui
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => { setResponseDialog(r); setCounterPrice(String(r.proposed_price)); }} disabled={respondExtension.isPending}>
                          <MessageSquare className="h-3 w-3 mr-1" /> Counter
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={() => respondExtension.mutate({ id: r.id, status: "rejected" })} disabled={respondExtension.isPending}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {r.owner_response_notes && !isPending && (
                      <p className="text-[10px] text-muted-foreground mt-1">Respon Anda: "{r.owner_response_notes}"</p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Owner Renewal Dialog */}
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

      {/* Counter Offer Dialog */}
      <Dialog open={!!responseDialog} onOpenChange={(o) => !o && setResponseDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-md p-2.5 text-xs">
              <p className="text-foreground font-medium">Permintaan tenant:</p>
              <p className="text-muted-foreground mt-0.5">Sampai {responseDialog?.requested_end_date} • {formatIDR(responseDialog?.proposed_price || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Counter durasi (hari dari akhir sewa)</Label>
                <Input value={counterDays} onChange={e => setCounterDays(e.target.value)} type="number" min="1" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Counter harga (IDR)</Label>
                <Input value={counterPrice} onChange={e => setCounterPrice(e.target.value)} type="number" min="0" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Catatan</Label>
              <Textarea value={responseNotes} onChange={e => setResponseNotes(e.target.value)} placeholder="Alasan counter offer..." rows={2} className="mt-1" />
            </div>
            <Button className="w-full" onClick={() => respondExtension.mutate({ id: responseDialog.id, status: "counter" })} disabled={respondExtension.isPending}>
              {respondExtension.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kirim Counter Offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerLeaseRenewal;
