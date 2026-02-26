import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Star, MessageSquare, Loader2, CheckCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "overall_rating", label: "Keseluruhan" },
  { key: "cleanliness_rating", label: "Kebersihan" },
  { key: "communication_rating", label: "Komunikasi" },
  { key: "location_rating", label: "Lokasi" },
  { key: "value_rating", label: "Nilai" },
] as const;

const StarRating = ({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) => {
  const s = size === "sm" ? "h-3 w-3" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          disabled={!onChange}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star className={`${s} ${i <= value ? "fill-chart-3 text-chart-3" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
};

const TenantReviewSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewDialog, setReviewDialog] = useState<{ bookingId: string; propertyId: string; propertyTitle: string } | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  // Fetch completed bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["tenant-completed-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, property_id, check_in_date, check_out_date, total_amount, total_days, booking_status, properties(title, location, images)")
        .eq("customer_id", user.id)
        .eq("booking_status", "completed")
        .order("check_out_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch existing reviews by this tenant
  const { data: existingReviews = [] } = useQuery({
    queryKey: ["tenant-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tenant_reviews")
        .select("id, booking_id, overall_rating, cleanliness_rating, communication_rating, location_rating, value_rating, comment, owner_reply, owner_replied_at, created_at, property_id")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const reviewedBookingIds = new Set(existingReviews.map(r => r.booking_id));

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || !reviewDialog) throw new Error("Missing data");
      if (!ratings.overall_rating) throw new Error("Rating keseluruhan wajib diisi");
      if (comment.trim().length > 1000) throw new Error("Komentar maksimal 1000 karakter");

      const { error } = await supabase.from("tenant_reviews").insert({
        booking_id: reviewDialog.bookingId,
        property_id: reviewDialog.propertyId,
        tenant_id: user.id,
        overall_rating: ratings.overall_rating,
        cleanliness_rating: ratings.cleanliness_rating || null,
        communication_rating: ratings.communication_rating || null,
        location_rating: ratings.location_rating || null,
        value_rating: ratings.value_rating || null,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review berhasil dikirim!");
      queryClient.invalidateQueries({ queryKey: ["tenant-reviews"] });
      setReviewDialog(null);
      setRatings({});
      setComment("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openReviewDialog = (booking: any) => {
    setRatings({});
    setComment("");
    setReviewDialog({
      bookingId: booking.id,
      propertyId: booking.property_id,
      propertyTitle: booking.properties?.title || "Properti",
    });
  };

  // Bookings that can be reviewed
  const reviewableBookings = bookings.filter(b => !reviewedBookingIds.has(b.id));

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Ulasan Saya</h2>

      {/* Reviewable Bookings */}
      {reviewableBookings.length > 0 && (
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Star className="h-4 w-4 text-chart-3" /> Menunggu Review
            </CardTitle>
            <CardDescription className="text-xs">Berikan penilaian untuk pengalaman sewa Anda</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1 space-y-2">
            {reviewableBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                  {(b as any).properties?.images?.[0] ? (
                    <img src={(b as any).properties.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{(b as any).properties?.title || "Properti"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(b.check_out_date), "d MMM yyyy", { locale: idLocale })} · {b.total_days} hari
                  </p>
                </div>
                <Button size="sm" className="h-7 text-xs" onClick={() => openReviewDialog(b)}>
                  <Star className="h-3 w-3 mr-1" /> Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Existing Reviews */}
      {existingReviews.length > 0 ? (
        <div className="space-y-2">
          {existingReviews.map(review => {
            const booking = bookings.find(b => b.id === review.booking_id);
            return (
              <Card key={review.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                    {(booking as any)?.properties?.images?.[0] ? (
                      <img src={(booking as any).properties.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{(booking as any)?.properties?.title || "Properti"}</p>
                      <span className="text-[9px] text-muted-foreground flex-shrink-0">{format(new Date(review.created_at), "d MMM yyyy", { locale: idLocale })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.overall_rating} size="sm" />
                      <span className="text-xs font-medium">{review.overall_rating}/5</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {review.cleanliness_rating && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Kebersihan {review.cleanliness_rating}/5</Badge>}
                      {review.communication_rating && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Komunikasi {review.communication_rating}/5</Badge>}
                      {review.location_rating && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Lokasi {review.location_rating}/5</Badge>}
                      {review.value_rating && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Nilai {review.value_rating}/5</Badge>}
                    </div>
                    {review.comment && <p className="text-xs text-muted-foreground mt-1.5">{review.comment}</p>}
                    {review.owner_reply && (
                      <div className="mt-2 p-2 rounded bg-muted/50 border-l-2 border-primary">
                        <p className="text-[9px] font-medium text-primary mb-0.5">Balasan Owner</p>
                        <p className="text-xs text-muted-foreground">{review.owner_reply}</p>
                        {review.owner_replied_at && (
                          <p className="text-[8px] text-muted-foreground mt-0.5">{format(new Date(review.owner_replied_at), "d MMM yyyy", { locale: idLocale })}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : reviewableBookings.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">Belum Ada Review</p>
            <p className="text-xs text-muted-foreground">Review akan tersedia setelah checkout dari properti sewa.</p>
          </div>
        </Card>
      ) : null}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Review: {reviewDialog?.propertyTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm">{cat.label} {cat.key === "overall_rating" && <span className="text-destructive">*</span>}</span>
                <StarRating value={ratings[cat.key] || 0} onChange={(v) => setRatings(prev => ({ ...prev, [cat.key]: v }))} />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">Komentar (opsional)</label>
              <Textarea
                placeholder="Ceritakan pengalaman sewa Anda..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={1000}
                className="h-24 text-sm"
              />
              <p className="text-[9px] text-muted-foreground text-right mt-0.5">{comment.length}/1000</p>
            </div>
            <Button
              className="w-full"
              disabled={!ratings.overall_rating || submitReview.isPending}
              onClick={() => submitReview.mutate()}
            >
              {submitReview.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Kirim Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantReviewSystem;
