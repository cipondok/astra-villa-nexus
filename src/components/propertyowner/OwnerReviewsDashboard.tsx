
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Star, MessageSquare, Loader2, Send, MapPin } from "lucide-react";
import { toast } from "sonner";

const StarDisplay = ({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) => {
  const s = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${s} ${i <= value ? "fill-chart-3 text-chart-3" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
};

const OwnerReviewsDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyDialog, setReplyDialog] = useState<{ reviewId: string; propertyTitle: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["owner-property-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: properties } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);

      if (!properties?.length) return [];
      const propertyIds = properties.map(p => p.id);
      const pMap = Object.fromEntries(properties.map(p => [p.id, p.title || "Tanpa Judul"]));

      const { data, error } = await supabase
        .from("tenant_reviews")
        .select("id, booking_id, property_id, tenant_id, overall_rating, cleanliness_rating, communication_rating, location_rating, value_rating, comment, owner_reply, owner_replied_at, created_at, is_published")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []).map(r => ({ ...r, propertyTitle: pMap[r.property_id] || "Properti" }));
    },
    enabled: !!user,
  });

  const submitReply = useMutation({
    mutationFn: async () => {
      if (!replyDialog || !replyText.trim()) throw new Error("Balasan tidak boleh kosong");
      if (replyText.trim().length > 500) throw new Error("Balasan maksimal 500 karakter");

      const { error } = await supabase
        .from("tenant_reviews")
        .update({ owner_reply: replyText.trim(), owner_replied_at: new Date().toISOString() })
        .eq("id", replyDialog.reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Balasan berhasil dikirim!");
      queryClient.invalidateQueries({ queryKey: ["owner-property-reviews"] });
      setReplyDialog(null);
      setReplyText("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length).toFixed(1)
    : "0";
  const repliedCount = reviews.filter(r => r.owner_reply).length;
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.overall_rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.overall_rating === star).length / reviews.length) * 100 : 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5">
        <Card className="p-2">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-chart-3/10">
              <Star className="h-3.5 w-3.5 text-chart-3" />
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground">Rating</p>
              <p className="text-sm font-bold">{avgRating}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-primary/10">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground">Total</p>
              <p className="text-sm font-bold">{reviews.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-2">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-chart-1/10">
              <Send className="h-3.5 w-3.5 text-chart-1" />
            </div>
            <div>
              <p className="text-[8px] text-muted-foreground">Dibalas</p>
              <p className="text-sm font-bold">{repliedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <Card className="p-3">
          <p className="text-[10px] font-semibold mb-2">Distribusi Rating</p>
          <div className="space-y-1">
            {ratingDist.map(d => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-[9px] w-3 text-right">{d.star}</span>
                <Star className="h-2.5 w-2.5 fill-chart-3 text-chart-3" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-3 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground w-5">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">Belum Ada Review</p>
            <p className="text-xs text-muted-foreground">Review dari tenant akan muncul di sini.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => (
            <Card key={review.id} className="p-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold">{review.propertyTitle}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarDisplay value={review.overall_rating} />
                      <span className="text-[9px] font-medium">{review.overall_rating}/5</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-muted-foreground">{format(new Date(review.created_at), "d MMM yy", { locale: idLocale })}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {review.cleanliness_rating && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">Bersih {review.cleanliness_rating}/5</Badge>}
                  {review.communication_rating && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">Komuni. {review.communication_rating}/5</Badge>}
                  {review.location_rating && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">Lokasi {review.location_rating}/5</Badge>}
                  {review.value_rating && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5">Nilai {review.value_rating}/5</Badge>}
                </div>

                {review.comment && <p className="text-xs text-muted-foreground">{review.comment}</p>}

                {review.owner_reply ? (
                  <div className="p-2 rounded bg-muted/50 border-l-2 border-primary">
                    <p className="text-[8px] font-medium text-primary">Balasan Anda</p>
                    <p className="text-[10px] text-muted-foreground">{review.owner_reply}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[9px]"
                    onClick={() => {
                      setReplyText("");
                      setReplyDialog({ reviewId: review.id, propertyTitle: review.propertyTitle });
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" /> Balas
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={(open) => !open && setReplyDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Balas Review — {replyDialog?.propertyTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Tulis balasan Anda..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              maxLength={500}
              className="h-24 text-sm"
            />
            <p className="text-[9px] text-muted-foreground text-right">{replyText.length}/500</p>
            <Button
              className="w-full"
              disabled={!replyText.trim() || submitReply.isPending}
              onClick={() => submitReply.mutate()}
            >
              {submitReply.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Kirim Balasan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerReviewsDashboard;
