import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Star, MessageSquare, ThumbsUp, ChevronDown, ChevronUp,
  ShieldCheck, Send, Loader2, Camera, X, Trophy, Award,
  Briefcase, Phone, DollarSign, Image as ImageIcon
} from 'lucide-react';

interface ServiceReview {
  id: string;
  vendor_id: string;
  service_id: string | null;
  customer_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  professionalism_rating: number | null;
  communication_rating: number | null;
  value_rating: number | null;
  is_verified: boolean;
  is_published: boolean;
  admin_approved: boolean;
  helpful_count: number;
  response_text: string | null;
  response_date: string | null;
  created_at: string;
  profiles?: { full_name: string; avatar_url: string | null };
  photos?: { id: string; photo_url: string; caption: string | null }[];
}

interface ServiceReviewPanelProps {
  vendorId: string;
  vendorName?: string;
  className?: string;
}

// ── Star helpers ──
function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5 hover:scale-110 transition-transform">
            <Star className={cn('h-5 w-5', s <= value ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-1.5">{value}/5</span>
      </div>
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('h-3.5 w-3.5', i <= rating ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
      ))}
    </div>
  );
}

function MiniBar({ label, icon: Icon, value }: { label: string; icon: React.ElementType; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
      <Progress value={(value / 5) * 100} className="h-1.5 flex-1" />
      <span className="text-[10px] font-semibold text-foreground w-4">{value.toFixed(1)}</span>
    </div>
  );
}

// ── Main Panel ──
export default function ServiceReviewPanel({ vendorId, vendorName, className }: ServiceReviewPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    rating: 0, title: '', review_text: '',
    professionalism_rating: 0, communication_rating: 0, value_rating: 0,
  });

  // ── Fetch reviews ──
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('*, profiles:customer_id(full_name, avatar_url)')
        .eq('vendor_id', vendorId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch photos for each review
      const reviewIds = (data || []).map(r => r.id);
      let photosMap: Record<string, any[]> = {};
      if (reviewIds.length > 0) {
        const { data: photos } = await supabase
          .from('review_photos')
          .select('*')
          .eq('review_type', 'vendor')
          .in('review_id', reviewIds);
        (photos || []).forEach(p => {
          if (!photosMap[p.review_id]) photosMap[p.review_id] = [];
          photosMap[p.review_id].push(p);
        });
      }

      return (data || []).map(r => ({ ...r, photos: photosMap[r.id] || [] })) as ServiceReview[];
    },
    enabled: !!vendorId,
  });

  // ── Stats ──
  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0, profAvg: 0, commAvg: 0, valAvg: 0 };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const withProf = reviews.filter(r => r.professionalism_rating);
    const withComm = reviews.filter(r => r.communication_rating);
    const withVal = reviews.filter(r => r.value_rating);
    return {
      avg, total: reviews.length,
      profAvg: withProf.length ? withProf.reduce((s, r) => s + (r.professionalism_rating || 0), 0) / withProf.length : 0,
      commAvg: withComm.length ? withComm.reduce((s, r) => s + (r.communication_rating || 0), 0) / withComm.length : 0,
      valAvg: withVal.length ? withVal.reduce((s, r) => s + (r.value_rating || 0), 0) / withVal.length : 0,
    };
  }, [reviews]);

  const isTopRated = stats.avg >= 4.5 && stats.total >= 3;

  // ── Submit review ──
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      if (formData.rating === 0) throw new Error('Rating required');

      const { data: review, error } = await supabase
        .from('vendor_reviews')
        .insert({
          vendor_id: vendorId,
          customer_id: user.id,
          rating: formData.rating,
          title: formData.title.trim() || null,
          review_text: formData.review_text.trim() || null,
          professionalism_rating: formData.professionalism_rating || null,
          communication_rating: formData.communication_rating || null,
          value_rating: formData.value_rating || null,
          is_published: false, // admin approval
        })
        .select()
        .single();
      if (error) throw error;

      // Upload photos
      for (const file of photoFiles) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${review.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('review-photos').upload(path, file);
        if (upErr) continue;
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
        await supabase.from('review_photos').insert({
          review_type: 'vendor',
          review_id: review.id,
          user_id: user.id,
          photo_url: urlData.publicUrl,
        });
      }
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      toast.success('Review submitted! Awaiting admin approval.');
      setFormData({ rating: 0, title: '', review_text: '', professionalism_rating: 0, communication_rating: 0, value_rating: 0 });
      setPhotoFiles([]);
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const displayedReviews = expanded ? reviews : reviews.slice(0, 3);

  if (isLoading) {
    return <div className={cn('animate-pulse space-y-3', className)}>
      <div className="h-32 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
    </div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Summary ── */}
      <Card className="border-border/40">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="text-center">
              <div className="relative inline-block">
                <p className="text-4xl font-black text-foreground">{stats.avg.toFixed(1)}</p>
                {isTopRated && (
                  <Badge className="absolute -top-2 -right-6 text-[8px] px-1.5 py-0 bg-chart-3/20 text-chart-3 border-chart-3/30 gap-0.5">
                    <Trophy className="h-2.5 w-2.5" /> Top Rated
                  </Badge>
                )}
              </div>
              <StarDisplay rating={Math.round(stats.avg)} />
              <p className="text-xs text-muted-foreground mt-1">{stats.total} reviews</p>
            </div>

            <div className="flex-1 w-full space-y-2">
              {stats.profAvg > 0 && <MiniBar label="Professionalism" icon={Briefcase} value={stats.profAvg} />}
              {stats.commAvg > 0 && <MiniBar label="Communication" icon={Phone} value={stats.commAvg} />}
              {stats.valAvg > 0 && <MiniBar label="Price Fairness" icon={DollarSign} value={stats.valAvg} />}

              {/* Rating distribution */}
              <div className="space-y-1 pt-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                      <Star className="h-2.5 w-2.5 fill-chart-3 text-chart-3" />
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Write Review CTA ── */}
      {user && !showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2 rounded-xl" variant="outline">
          <MessageSquare className="h-4 w-4" /> Write a Review
        </Button>
      )}

      {/* ── Review Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-chart-3" /> Review {vendorName || 'Service Provider'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StarInput value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} label="Overall Satisfaction *" />

                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">Detail Ratings (Optional)</p>
                  <StarInput value={formData.professionalism_rating} onChange={v => setFormData(p => ({ ...p, professionalism_rating: v }))} label="Professionalism" />
                  <StarInput value={formData.communication_rating} onChange={v => setFormData(p => ({ ...p, communication_rating: v }))} label="Communication" />
                  <StarInput value={formData.value_rating} onChange={v => setFormData(p => ({ ...p, value_rating: v }))} label="Price Fairness" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Summary of your experience"
                    className="h-9 rounded-xl"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Your Review</label>
                  <Textarea
                    value={formData.review_text}
                    onChange={e => setFormData(p => ({ ...p, review_text: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={4}
                    className="rounded-xl resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Photos (up to 5)</label>
                  <div className="flex flex-wrap gap-2">
                    {photoFiles.map((file, i) => (
                      <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                        <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 h-4 w-4 bg-background/80 rounded-full flex items-center justify-center"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {photoFiles.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <span className="text-[8px] mt-0.5">Add</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setShowForm(false); setPhotoFiles([]); }} className="flex-1 rounded-xl">Cancel</Button>
                  <Button
                    onClick={() => submitMutation.mutate()}
                    disabled={formData.rating === 0 || submitMutation.isPending}
                    className="flex-1 rounded-xl gap-1.5"
                  >
                    {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reviews List ── */}
      {reviews.length === 0 ? (
        <Card className="border-border/30">
          <CardContent className="py-10 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to review this provider</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/40 rounded-xl p-4 space-y-3 bg-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">
                      {((review.profiles as any)?.full_name || 'A').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {(review.profiles as any)?.full_name || 'Anonymous'}
                      </span>
                      {review.is_verified && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 gap-0.5 bg-chart-2/10 text-chart-2 border-chart-2/30">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>

              {review.title && <h4 className="text-sm font-bold text-foreground">{review.title}</h4>}

              {/* Sub-ratings */}
              {(review.professionalism_rating || review.communication_rating || review.value_rating) && (
                <div className="flex flex-wrap gap-3">
                  {review.professionalism_rating && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-2.5 w-2.5" /> Prof: {review.professionalism_rating}/5
                    </span>
                  )}
                  {review.communication_rating && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" /> Comm: {review.communication_rating}/5
                    </span>
                  )}
                  {review.value_rating && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-2.5 w-2.5" /> Value: {review.value_rating}/5
                    </span>
                  )}
                </div>
              )}

              {review.review_text && (
                <p className="text-xs text-muted-foreground leading-relaxed">{review.review_text}</p>
              )}

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {review.photos.map(photo => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt={photo.caption || 'Review photo'}
                      className="h-20 w-20 rounded-lg object-cover border border-border/30 flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              {review.response_text && (
                <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Provider Response</p>
                  <p className="text-xs text-foreground">{review.response_text}</p>
                </div>
              )}
            </motion.div>
          ))}

          {reviews.length > 3 && (
            <Button variant="ghost" onClick={() => setExpanded(!expanded)} className="w-full gap-1.5 text-xs">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? 'Show less' : `Show all ${reviews.length} reviews`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
