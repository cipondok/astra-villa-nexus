
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatIDR } from "@/utils/currency";
import { format, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Ban, CheckCircle, XCircle, Clock, AlertTriangle, Loader2,
  RotateCcw, DollarSign, Calendar, User, Building, ChevronDown
} from "lucide-react";

interface CancellationRequest {
  id: string;
  booking_id: string;
  requested_by: string;
  requester_role: string;
  reason: string;
  reason_category: string;
  cancellation_policy: string;
  refund_percentage: number;
  refund_amount: number;
  penalty_amount: number;
  original_amount: number;
  status: string;
  review_notes: string | null;
  refund_status: string;
  days_before_checkin: number | null;
  created_at: string;
  booking?: {
    id: string;
    check_in_date: string;
    check_out_date: string;
    total_amount: number;
    booking_status: string;
    property_id: string;
    customer_id: string;
    properties?: { title: string; city: string } | null;
    profiles?: { full_name: string; email: string } | null;
  };
}

const REASON_CATEGORIES = [
  { value: "schedule_change", label: "Perubahan Jadwal" },
  { value: "found_alternative", label: "Menemukan Alternatif" },
  { value: "price_issue", label: "Masalah Harga" },
  { value: "emergency", label: "Keadaan Darurat" },
  { value: "property_issue", label: "Masalah Properti" },
  { value: "other", label: "Lainnya" },
];

const CANCELLATION_POLICIES = {
  flexible: { label: "Fleksibel", rules: [
    { daysMin: 7, refund: 100 },
    { daysMin: 3, refund: 75 },
    { daysMin: 1, refund: 50 },
    { daysMin: 0, refund: 25 },
  ]},
  standard: { label: "Standar", rules: [
    { daysMin: 14, refund: 100 },
    { daysMin: 7, refund: 75 },
    { daysMin: 3, refund: 50 },
    { daysMin: 0, refund: 0 },
  ]},
  strict: { label: "Ketat", rules: [
    { daysMin: 30, refund: 100 },
    { daysMin: 14, refund: 50 },
    { daysMin: 7, refund: 25 },
    { daysMin: 0, refund: 0 },
  ]},
};

function calcRefund(policy: keyof typeof CANCELLATION_POLICIES, daysBeforeCheckin: number, totalAmount: number) {
  const rules = CANCELLATION_POLICIES[policy].rules;
  for (const rule of rules) {
    if (daysBeforeCheckin >= rule.daysMin) {
      const refundAmount = (totalAmount * rule.refund) / 100;
      return { refundPercentage: rule.refund, refundAmount, penaltyAmount: totalAmount - refundAmount };
    }
  }
  return { refundPercentage: 0, refundAmount: 0, penaltyAmount: totalAmount };
}

const OwnerBookingCancellation = () => {
  const { user } = useAuth();
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState<CancellationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id) fetchCancellations();
  }, [user?.id]);

  const fetchCancellations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Get owner's properties first
      const { data: props } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id);

      if (!props?.length) { setCancellations([]); setLoading(false); return; }
      const propIds = props.map(p => p.id);

      // Get bookings for owner's properties
      const { data: bookings } = await supabase
        .from("rental_bookings")
        .select("id, check_in_date, check_out_date, total_amount, booking_status, property_id, customer_id")
        .in("property_id", propIds);

      if (!bookings?.length) { setCancellations([]); setLoading(false); return; }
      const bookingIds = bookings.map(b => b.id);

      // Get cancellation requests
      const { data: cancels } = await supabase
        .from("booking_cancellations")
        .select("*")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false });

      if (!cancels?.length) { setCancellations([]); setLoading(false); return; }

      // Get property titles
      const { data: propDetails } = await supabase
        .from("properties")
        .select("id, title, city")
        .in("id", propIds);

      // Get customer profiles
      const customerIds = [...new Set(bookings.map(b => b.customer_id).filter(Boolean))];
      const { data: profiles } = customerIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", customerIds)
        : { data: [] };

      // Merge data
      const merged = cancels.map(c => {
        const booking = bookings.find(b => b.id === c.booking_id);
        const prop = propDetails?.find(p => p.id === booking?.property_id);
        const profile = profiles?.find(p => p.id === booking?.customer_id);
        return {
          ...c,
          booking: booking ? {
            ...booking,
            properties: prop ? { title: prop.title, city: prop.city } : null,
            profiles: profile ? { full_name: profile.full_name, email: profile.email } : null,
          } : undefined,
        } as CancellationRequest;
      });

      setCancellations(merged);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data pembatalan");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!reviewDialog || !user?.id) return;
    setProcessing(true);
    try {
      const newStatus = approved ? "approved" : "rejected";

      // Update cancellation request
      const { error: cancelErr } = await supabase
        .from("booking_cancellations")
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
          refund_status: approved ? "processing" : "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewDialog.id);

      if (cancelErr) throw cancelErr;

      // If approved, update booking status
      if (approved && reviewDialog.booking_id) {
        const { error: bookErr } = await supabase
          .from("rental_bookings")
          .update({
            booking_status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reviewDialog.reason,
            cancellation_id: reviewDialog.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reviewDialog.booking_id);

        if (bookErr) throw bookErr;
      }

      toast.success(approved ? "Pembatalan disetujui" : "Pembatalan ditolak");
      setReviewDialog(null);
      setReviewNotes("");
      fetchCancellations();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses pembatalan");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock; label: string }> = {
      pending: { variant: "outline", icon: Clock, label: "Menunggu" },
      approved: { variant: "default", icon: CheckCircle, label: "Disetujui" },
      rejected: { variant: "destructive", icon: XCircle, label: "Ditolak" },
      auto_approved: { variant: "default", icon: CheckCircle, label: "Otomatis" },
    };
    const s = map[status] || map.pending;
    return (
      <Badge variant={s.variant} className="text-[9px] sm:text-[10px] gap-0.5 px-1.5 py-0.5 h-auto">
        <s.icon className="h-2.5 w-2.5" /> {s.label}
      </Badge>
    );
  };

  const getRefundStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "Belum diproses",
      processing: "Diproses",
      completed: "Selesai",
      failed: "Gagal",
    };
    return <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 h-auto">{map[status] || status}</Badge>;
  };

  const filtered = filter === "all" ? cancellations : cancellations.filter(c => c.status === filter);
  const pendingCount = cancellations.filter(c => c.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: cancellations.length, icon: Ban, color: "text-muted-foreground", bg: "bg-muted" },
          { label: "Menunggu", value: pendingCount, icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10" },
          { label: "Disetujui", value: cancellations.filter(c => ["approved", "auto_approved"].includes(c.status)).length, icon: CheckCircle, color: "text-chart-1", bg: "bg-chart-1/10" },
          { label: "Ditolak", value: cancellations.filter(c => c.status === "rejected").length, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((s, i) => (
          <Card key={i} className="p-2.5">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <span className="text-base font-bold block leading-none">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cancellation Policy Info */}
      <Card className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <span className="text-xs font-semibold">Kebijakan Pembatalan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(CANCELLATION_POLICIES).map(([key, policy]) => (
            <div key={key} className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-foreground mb-1">{policy.label}</p>
              {policy.rules.map((rule, i) => (
                <p key={i} className="text-[9px] text-muted-foreground">
                  ≥{rule.daysMin} hari → Refund {rule.refund}%
                </p>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 h-auto">
            {pendingCount} perlu ditinjau
          </Badge>
        )}
      </div>

      {/* Cancellation List */}
      {filtered.length === 0 ? (
        <Card className="p-4">
          <div className="text-center py-6">
            <Ban className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Tidak ada permintaan pembatalan</p>
            <p className="text-xs text-muted-foreground">Permintaan pembatalan dari tenant akan muncul di sini</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {c.booking?.properties?.title || "Properti"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {c.booking?.profiles?.full_name || "Tenant"} • {c.requester_role === "owner" ? "Owner" : "Tenant"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(c.status)}
                  {c.status !== "pending" && getRefundStatusBadge(c.refund_status)}
                </div>
              </div>

              {/* Booking dates */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  {c.booking?.check_in_date ? format(new Date(c.booking.check_in_date), "dd MMM yyyy", { locale: idLocale }) : "-"}
                  {" → "}
                  {c.booking?.check_out_date ? format(new Date(c.booking.check_out_date), "dd MMM yyyy", { locale: idLocale }) : "-"}
                </span>
                {c.days_before_checkin !== null && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-auto">
                    {c.days_before_checkin} hari sebelum check-in
                  </Badge>
                )}
              </div>

              {/* Reason */}
              <div className="bg-muted/40 rounded-lg p-2 mb-2">
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                  Alasan: {REASON_CATEGORIES.find(r => r.value === c.reason_category)?.label || c.reason_category}
                </p>
                <p className="text-[10px] text-foreground">{c.reason}</p>
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-muted/30 rounded p-1.5 text-center">
                  <p className="text-[8px] text-muted-foreground">Total</p>
                  <p className="text-[10px] font-semibold">{formatIDR(c.original_amount)}</p>
                </div>
                <div className="bg-chart-1/10 rounded p-1.5 text-center">
                  <p className="text-[8px] text-muted-foreground">Refund ({c.refund_percentage}%)</p>
                  <p className="text-[10px] font-semibold text-chart-1">{formatIDR(c.refund_amount)}</p>
                </div>
                <div className="bg-destructive/10 rounded p-1.5 text-center">
                  <p className="text-[8px] text-muted-foreground">Penalti</p>
                  <p className="text-[10px] font-semibold text-destructive">{formatIDR(c.penalty_amount)}</p>
                </div>
              </div>

              {/* Review notes if any */}
              {c.review_notes && (
                <div className="bg-muted/30 rounded p-2 mb-2">
                  <p className="text-[9px] text-muted-foreground">Catatan review: {c.review_notes}</p>
                </div>
              )}

              {/* Actions for pending */}
              {c.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="h-7 text-[10px] flex-1"
                    onClick={() => { setReviewDialog(c); setReviewNotes(""); }}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Tinjau
                  </Button>
                </div>
              )}

              <p className="text-[9px] text-muted-foreground mt-1.5">
                {format(new Date(c.created_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => { if (!open) setReviewDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Ban className="h-4 w-4" /> Tinjau Pembatalan
            </DialogTitle>
          </DialogHeader>
          {reviewDialog && (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Properti</span>
                  <span className="font-medium">{reviewDialog.booking?.properties?.title || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{reviewDialog.booking?.profiles?.full_name || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Kebijakan</span>
                  <span className="font-medium">{CANCELLATION_POLICIES[reviewDialog.cancellation_policy as keyof typeof CANCELLATION_POLICIES]?.label || reviewDialog.cancellation_policy}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Refund</span>
                  <span className="font-semibold text-chart-1">{formatIDR(reviewDialog.refund_amount)} ({reviewDialog.refund_percentage}%)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Penalti</span>
                  <span className="font-semibold text-destructive">{formatIDR(reviewDialog.penalty_amount)}</span>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Alasan</p>
                <p className="text-xs">{reviewDialog.reason}</p>
              </div>
              <div>
                <label className="text-xs font-medium">Catatan Review (opsional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  className="mt-1 text-xs h-20"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              disabled={processing}
              onClick={() => handleReview(false)}
            >
              {processing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              Tolak
            </Button>
            <Button
              size="sm"
              className="text-xs"
              disabled={processing}
              onClick={() => handleReview(true)}
            >
              {processing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
              Setujui Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerBookingCancellation;
